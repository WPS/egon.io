import {
  effect,
  inject,
  Injectable,
  signal,
  WritableSignal,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { UsedIconList } from 'src/app/domain/entities/UsedIconList';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { INITIAL_ICON_SET_NAME } from '../../../domain/entities/constants';
import { Dictionary } from '../../../domain/entities/dictionary';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { SelectableIcon } from '../domain/selectableIcon';
import { IconSetImportExportService } from './icon-set-import-export.service';
import { IconDictionaryService } from './icon-dictionary.service';
import { IconSet } from '../../../domain/entities/iconSet';
import { builtInIcons } from 'src/app/tools/icon-set-config/domain/builtInIcons';
import { AutosaveService } from 'src/app/tools/autosave/services/autosave.service';
import { IconSetNotificationService } from 'src/app/tools/icon-set-config/services/icon-set-notification.service';
import { Observable } from 'rxjs/internal/Observable';

/**
 * We are not allowed to call ImportDomainStoryService directly,
 * so we use this "interface" instead.
 */
export abstract class IconSetChangedService {
  // This breaks and results in an endless loop when changed to a Signal
  public abstract iconConfigurationChanged(): Observable<IconSet>;
}

// can be used instead of IconSet whenever only the icon names are needed
interface IconSetSelection {
  name: string;
  actors: string[];
  workObjects: string[];
}

@Injectable({
  providedIn: 'root',
})
export class IconSetCustomizationService {
  private readonly allIconListItems = new Dictionary();

  private configurationHasChanged = false;

  private readonly iconSetConfigurationTypesSignal: WritableSignal<IconSetSelection>;
  readonly selectedActorsSignal: WritableSignal<string[]>;
  readonly selectedWorkObjectsSignal: WritableSignal<string[]>;
  private changedIconSetConfiguration: IconSet | undefined;

  private readonly iconSetImportExportService = inject(
    IconSetImportExportService,
  );
  private readonly iconDictionaryService = inject(IconDictionaryService);
  private readonly iconSetNotificationServiceService = inject(
    IconSetNotificationService,
  );
  private readonly iconSetChangedService = inject(IconSetChangedService);
  private readonly elementRegistryService = inject(ElementRegistryService);
  private readonly autosaveService = inject(AutosaveService);

  constructor() {
    const configurationNamesWithoutPrefix =
      this.getCurrentConfigurationNamesWithoutPrefix();

    this.iconSetConfigurationTypesSignal = signal(
      configurationNamesWithoutPrefix,
    );

    this.selectedWorkObjectsSignal = signal(
      configurationNamesWithoutPrefix.workObjects,
    );
    this.selectedActorsSignal = signal(configurationNamesWithoutPrefix.actors);

    builtInIcons.keysArray().forEach((iconName) => {
      this.addIconToAllIconList(iconName);
    });

    const storedIconSetConfiguration =
      this.iconSetImportExportService.getStoredIconSetConfiguration();
    if (storedIconSetConfiguration) {
      this.importConfiguration(storedIconSetConfiguration, false);
    }

    effect(() => {
      const importConfigChanged = this.autosaveService.importConfigChanged();
      if (importConfigChanged) {
        this.importConfiguration(importConfigChanged!, false);
        this.updateAllIconBehaviorSubjects();
      }
    });

    this.iconSetChangedService
      .iconConfigurationChanged()
      .subscribe((config) => {
        this.importConfiguration(config);
      });
  }

  importConfiguration(customConfig: IconSet, saveIconSet = true): void {
    this.changeName(customConfig.name);

    const currentlyUsedIcons = this.elementRegistryService.getUsedIcons();

    this.updateActorsFromConfiguration(
      customConfig.actors.keysArray(),
      currentlyUsedIcons,
    );
    this.updateWorkObjectsFromConfiguration(
      customConfig.workObjects.keysArray(),
      currentlyUsedIcons,
    );

    if (saveIconSet) {
      this.saveIconSet(currentlyUsedIcons, true);
    }
  }

  private updateWorkObjectsFromConfiguration(
    workObjectKeys: string[],
    usedIcons: UsedIconList,
  ) {
    workObjectKeys.forEach((iconName) => {
      if (!this.allIconListItems.has(iconName)) {
        this.addIconToAllIconList(iconName);
      }
      const selectedWorkObjectNames = this.selectedWorkObjectsSignal();
      if (!selectedWorkObjectNames.includes(iconName)) {
        this.selectWorkObject(iconName);
      }
    });
    this.selectedWorkObjectsSignal().forEach((iconName) => {
      if (
        !workObjectKeys.includes(iconName) &&
        !usedIcons.workObjects.includes(iconName)
      ) {
        this.deselectWorkObject(iconName);
      }
    });
  }

  private updateActorsFromConfiguration(
    actorKeys: string[],
    usedIcons: UsedIconList,
  ) {
    actorKeys.forEach((iconName) => {
      if (!this.allIconListItems.has(iconName)) {
        this.addIconToAllIconList(iconName);
      }
      const selectedActorNames = this.selectedActorsSignal();
      if (!selectedActorNames.includes(iconName)) {
        this.selectActor(iconName);
      }
    });

    this.selectedActorsSignal().forEach((iconName) => {
      if (
        !actorKeys.includes(iconName) &&
        !usedIcons.actors.includes(iconName)
      ) {
        this.deselectActor(iconName);
      }
    });
  }

  /** Getter & Setter **/
  getIconForName(iconName: string): BehaviorSubject<SelectableIcon> {
    return this.allIconListItems.get(iconName);
  }

  isIconActor(iconName: string): boolean {
    return this.iconSetConfigurationTypesSignal().actors.includes(iconName);
  }

  isIconWorkObject(iconName: string): boolean {
    return this.iconSetConfigurationTypesSignal().workObjects.includes(
      iconName,
    );
  }

  changeName(iconSetName: string): void {
    this.iconSetImportExportService.setIconSetName(iconSetName);
    const changedIconSet = this.iconSetConfigurationTypesSignal();
    changedIconSet.name = iconSetName;
    this.iconSetConfigurationTypesSignal.set(changedIconSet);
  }

  /** Selected Icons **/
  setAsUnassigned(iconName: string): void {
    this.isIconActor(iconName)
      ? this.deselectActor(iconName)
      : this.deselectWorkObject(iconName);
    this.updateIconSelectionState(false, false, iconName);
  }

  setAsActor(actor: string): void {
    this.updateIconSelectionState(true, false, actor);
    this.selectActor(actor);
    this.deselectWorkObject(actor);
  }

  setAsWorkObject(workObject: string): void {
    this.updateIconSelectionState(false, true, workObject);
    this.selectWorkObject(workObject);
    this.deselectActor(workObject);
  }

  selectActor(actor: string): void {
    const currentIconSetSelection = this.iconSetConfigurationTypesSignal();
    if (!currentIconSetSelection.actors.includes(actor)) {
      this.iconSetConfigurationTypesSignal.set({
        actors: [actor, ...currentIconSetSelection.actors],
        workObjects: currentIconSetSelection.workObjects,
        name: currentIconSetSelection.name,
      });
      this.updateActorSignal();
    }
  }

  selectWorkObject(workObject: string): void {
    const currentIconSetSelection = this.iconSetConfigurationTypesSignal();
    if (!currentIconSetSelection.workObjects.includes(workObject)) {
      this.iconSetConfigurationTypesSignal.set({
        actors: currentIconSetSelection.actors,
        workObjects: [workObject, ...currentIconSetSelection.workObjects],
        name: currentIconSetSelection.name,
      });
      this.updateWorkObjectSignal();
    }
  }

  deselectActor(actor: string): void {
    if (this.iconSetConfigurationTypesSignal) {
      this.iconSetConfigurationTypesSignal.set({
        name: this.iconSetConfigurationTypesSignal().name,
        actors: this.iconSetConfigurationTypesSignal().actors.filter(
          (a: string) => a !== actor,
        ),
        workObjects: this.iconSetConfigurationTypesSignal().workObjects,
      });
    }
    this.iconDictionaryService.unregisterIconForType(ElementTypes.ACTOR, actor);
    this.updateActorSignal();
  }

  deselectWorkObject(workObject: string): void {
    if (this.iconSetConfigurationTypesSignal) {
      this.iconSetConfigurationTypesSignal.set({
        name: this.iconSetConfigurationTypesSignal().name,
        actors: this.iconSetConfigurationTypesSignal().actors,
        workObjects: this.iconSetConfigurationTypesSignal().workObjects.filter(
          (w: string) => w !== workObject,
        ),
      });
    }
    this.iconDictionaryService.unregisterIconForType(
      ElementTypes.WORKOBJECT,
      workObject,
    );
    this.updateWorkObjectSignal();
  }

  setSelectedWorkObject(sortedList: string[]): void {
    const value = this.iconSetConfigurationTypesSignal();
    value.workObjects = sortedList;
    this.iconSetConfigurationTypesSignal.set(value);
    this.updateWorkObjectSignal();
  }

  setSelectedActors(sortedList: string[]): void {
    const value = this.iconSetConfigurationTypesSignal();
    value.actors = sortedList;
    this.iconSetConfigurationTypesSignal.set(value);
    this.updateActorSignal();
  }

  private updateActorSignal(): void {
    this.selectedActorsSignal.set(
      this.iconSetConfigurationTypesSignal().actors,
    );
    this.configurationHasChanged = true;
  }

  private updateWorkObjectSignal(): void {
    this.selectedWorkObjectsSignal.set(
      this.iconSetConfigurationTypesSignal().workObjects,
    );
    this.configurationHasChanged = true;
  }

  resetIconSet(): void {
    const currentIconSet = this.createMinimalIconSet();

    this.selectedWorkObjectsSignal().forEach((workObjectName) => {
      if (!currentIconSet.workObjects.has(workObjectName)) {
        this.deselectWorkObject(workObjectName);
      }
    });
    this.selectedActorsSignal().forEach((actorName) => {
      if (!currentIconSet.actors.has(actorName)) {
        this.deselectActor(actorName);
      }
    });

    this.iconSetConfigurationTypesSignal.set({
      name: currentIconSet.name,
      actors: currentIconSet.actors.keysArray(),
      workObjects: currentIconSet.workObjects.keysArray(),
    } as IconSetSelection);

    this.updateAllIconBehaviorSubjects();
  }

  /* creates an icon set that contains the default icons
     AND all other icons that are actually used on the canvas. */
  private createMinimalIconSet(): IconSet {
    const usedIconSet = this.createIconSetFromCanvas();
    const defaultIconSet = this.iconDictionaryService.getDefaultIconSet();

    defaultIconSet.actors.keysArray().forEach((iconName) => {
      usedIconSet.actors.set(
        iconName,
        this.iconDictionaryService.getIconSource(iconName),
      );
    });
    defaultIconSet.workObjects.keysArray().forEach((iconName) => {
      usedIconSet.workObjects.set(
        iconName,
        this.iconDictionaryService.getIconSource(iconName),
      );
    });

    return usedIconSet;
  }

  /* finds out which icons are actually used on the canvas */
  private createIconSetFromCanvas(): IconSet {
    const config = {
      name: INITIAL_ICON_SET_NAME,
      actors: new Dictionary(),
      workObjects: new Dictionary(),
    };

    const allCanvasObjects = this.elementRegistryService.getAllCanvasObjects();

    allCanvasObjects
      .map((e) => e.businessObject)
      .forEach((element) => {
        const type = element.type
          .replace(ElementTypes.ACTOR, '')
          .replace(ElementTypes.WORKOBJECT, '');
        if (element.type.includes(ElementTypes.ACTOR)) {
          let src = this.iconDictionaryService.getIconSource(type) || '';
          config.actors.set(type, src);
        } else if (element.type.includes(ElementTypes.WORKOBJECT)) {
          let src = this.iconDictionaryService.getIconSource(type) || '';
          config.workObjects.set(type, src);
        }
      });

    return config;
  }

  cancel(): void {
    this.iconSetConfigurationTypesSignal.set(
      this.getCurrentConfigurationNamesWithoutPrefix(),
    );
    this.updateAllIconBehaviorSubjects();
    this.resetToInitialConfiguration();
  }

  private getCurrentConfigurationNamesWithoutPrefix(): IconSetSelection {
    return {
      name:
        this.iconSetImportExportService.getIconSetName() ||
        INITIAL_ICON_SET_NAME,
      actors: this.iconDictionaryService
        .getIconsAssignedAs(ElementTypes.ACTOR)
        .keysArray()
        .map((a) => a.replace(ElementTypes.ACTOR, '')),
      workObjects: this.iconDictionaryService
        .getIconsAssignedAs(ElementTypes.WORKOBJECT)
        .keysArray()
        .map((w) => w.replace(ElementTypes.WORKOBJECT, '')),
    };
  }

  private resetToInitialConfiguration(): void {
    this.updateActorSignal();
    this.updateWorkObjectSignal();
  }

  saveIconSet(usedIcons: UsedIconList, imported = false): void {
    let changedActors: string[] = [];
    let changedWorkObjects: string[] = [];

    if (this.configurationHasChanged) {
      const changedObjects = this.handleChangedConfiguration(
        usedIcons,
        imported,
      );
      changedActors = changedObjects.changedActors;
      changedWorkObjects = changedObjects.changedWorkObjects;
    } else {
      this.iconSetNotificationServiceService.openNoImportOrNoSaveSnackbar(
        imported,
      );
    }

    if (changedActors.length || changedWorkObjects.length) {
      this.iconSetNotificationServiceService.openAlreadyUsedIconsSnackbar(
        changedActors,
        changedWorkObjects,
      );
    }
    this.iconSetImportExportService.notifyIconSetSaved();
  }

  private handleChangedConfiguration(
    usedIcons: UsedIconList,
    imported: boolean,
  ): { changedActors: string[]; changedWorkObjects: string[] } {
    const changedIconSet = this.createIconSetConfiguration();

    const changedActors = this.determineChangedIcons(
      usedIcons?.actors,
      changedIconSet.actors.keysArray(),
    );
    const changedWorkObjects = this.determineChangedIcons(
      usedIcons?.workObjects,
      changedIconSet.workObjects.keysArray(),
    );

    if (!changedActors.length && !changedWorkObjects.length) {
      this.changedIconSetConfiguration = changedIconSet;
      this.overrideSelectedIcons(changedIconSet);

      this.iconSetImportExportService.setStoredIconSetConfiguration(
        this.changedIconSetConfiguration,
      );
      this.iconSetNotificationServiceService.openConfigurationImportOrSavedSnackbar(
        imported,
      );
    }
    return { changedActors, changedWorkObjects };
  }
  private determineChangedIcons(
    usedIcons: string[],
    changedIconSet: string[],
  ): string[] {
    const changedIcons = new Set<string>();

    usedIcons?.forEach((icon) => {
      if (!changedIconSet.includes(icon)) {
        changedIcons.add(icon);
      }
    });
    return Array.from(changedIcons);
  }

  getAndClearSavedConfiguration(): IconSet | undefined {
    const temp = this.changedIconSetConfiguration;
    this.changedIconSetConfiguration = undefined;

    return temp;
  }

  private createIconSetConfiguration(): IconSet {
    const actors = new Dictionary();
    const workObjects = new Dictionary();

    this.iconSetConfigurationTypesSignal().actors.forEach((name: string) => {
      actors.set(name, this.iconDictionaryService.getIconSource(name));
    });
    this.iconSetConfigurationTypesSignal().workObjects.forEach(
      (name: string) => {
        workObjects.set(name, this.iconDictionaryService.getIconSource(name));
      },
    );

    return {
      name: this.iconSetConfigurationTypesSignal().name || '',
      actors,
      workObjects,
    };
  }

  addNewCustomIcon(iconName: string): void {
    this.iconDictionaryService.addCustomIcon(
      this.getDataUrlForIcon(iconName),
      iconName,
    );
    this.addIconToAllIconList(iconName);
  }

  private addIconToAllIconList(iconName: string): void {
    this.allIconListItems.set(
      iconName,
      new BehaviorSubject({
        name: iconName,
        svg: this.getDataUrlForIcon(iconName),
        isActor: this.isIconActor(iconName),
        isWorkObject: this.isIconWorkObject(iconName),
      }),
    );
  }

  private updateIconSelectionState(
    isActor: boolean,
    isWorkObject: boolean,
    iconName: string,
  ) {
    const iconBehaviourSubject = this.getIconForName(iconName);
    const icon = iconBehaviourSubject.value;
    icon.isActor = isActor;
    icon.isWorkObject = isWorkObject;

    iconBehaviourSubject.next(icon);
  }

  updateAllIconBehaviorSubjects(): void {
    const customIconSetConfiguration = this.iconSetConfigurationTypesSignal();
    this.allIconListItems.keysArray().forEach((iconName) => {
      if (customIconSetConfiguration.actors.includes(iconName)) {
        this.updateIconSelectionState(true, false, iconName);
      } else if (customIconSetConfiguration.workObjects.includes(iconName)) {
        this.updateIconSelectionState(false, true, iconName);
      } else {
        this.updateIconSelectionState(false, false, iconName);
      }
    });
  }

  private getDataUrlForIcon(iconName: string): string {
    const rawSrc = this.iconDictionaryService.getIconSource(iconName);

    if (!rawSrc) {
      return '';
    }

    if (rawSrc.startsWith('data')) {
      return rawSrc;
    } else {
      return 'data:image/svg+xml,' + rawSrc;
    }
  }

  private overrideSelectedIcons(changedIconSet: IconSet) {
    this.allIconListItems
      .keysArray()
      .forEach((item) => this.setAsUnassigned(item));

    changedIconSet.actors.keysArray().forEach((actor) => {
      this.iconDictionaryService.registerIconForType(
        ElementTypes.ACTOR,
        actor,
        this.iconDictionaryService.getFullDictionary().get(actor),
      );
      this.iconDictionaryService.unregisterIconForType(
        ElementTypes.WORKOBJECT,
        actor,
      );
      this.setAsActor(actor);
    });

    changedIconSet.workObjects.keysArray().forEach((workObject) => {
      this.iconDictionaryService.registerIconForType(
        ElementTypes.WORKOBJECT,
        workObject,
        this.iconDictionaryService.getFullDictionary().get(workObject),
      );
      this.iconDictionaryService.unregisterIconForType(
        ElementTypes.ACTOR,
        workObject,
      );
      this.setAsWorkObject(workObject);
    });
  }
}
