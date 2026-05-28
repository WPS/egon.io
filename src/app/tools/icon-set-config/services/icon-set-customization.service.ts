import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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

/**
 * We are not allowed to call ImportDomainStoryService directly,
 * so we use this "interface" instead.
 */
export abstract class IconSetChangedService {
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
  private readonly iconSetConfigurationTypes: BehaviorSubject<IconSetSelection>;

  private readonly allIconListItems = new Dictionary();

  private configurationHasChanged = false;

  readonly selectedActors$ = new BehaviorSubject<string[]>([]);
  readonly selectedWorkObjects$ = new BehaviorSubject<string[]>([]);
  private changedIconSetConfiguration: IconSet | undefined;

  private readonly iconSetImportExportService = inject(
    IconSetImportExportService,
  );
  private readonly iconDictionaryService = inject(IconDictionaryService);
  private readonly iconSetNotificationServiceService = inject(
    IconSetNotificationService,
  );
  private readonly elementRegistryService = inject(ElementRegistryService);
  private readonly autosaveService = inject(AutosaveService);

  constructor(iconSetChangedService: IconSetChangedService) {
    this.autosaveService.importConfigChanged$.subscribe((config) => {
      this.importConfiguration(config, false);
      this.updateAllIconBehaviorSubjects();
    });
    this.iconSetConfigurationTypes = new BehaviorSubject(
      this.getCurrentConfigurationNamesWithoutPrefix(),
    );

    this.selectedWorkObjects$.next(
      this.iconSetConfigurationTypes.value.workObjects,
    );
    this.selectedActors$.next(this.iconSetConfigurationTypes.value.actors);

    builtInIcons.keysArray().forEach((iconName) => {
      this.addIconToAllIconList(iconName);
    });

    iconSetChangedService.iconConfigurationChanged().subscribe((config) => {
      this.importConfiguration(config);
    });

    const storedIconSetConfiguration =
      this.iconSetImportExportService.getStoredIconSetConfiguration();
    if (storedIconSetConfiguration) {
      this.importConfiguration(storedIconSetConfiguration, false);
    }
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
      const selectedWorkObjectNames = this.selectedWorkObjects$.value;
      if (!selectedWorkObjectNames.includes(iconName)) {
        this.selectWorkObject(iconName);
      }
    });
    this.selectedWorkObjects$.value.forEach((iconName) => {
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
      const selectedActorNames = this.selectedActors$.value;
      if (!selectedActorNames.includes(iconName)) {
        this.selectActor(iconName);
      }
    });

    this.selectedActors$.value.forEach((iconName) => {
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
    return this.iconSetConfigurationTypes.value.actors.includes(iconName);
  }

  isIconWorkObject(iconName: string): boolean {
    return this.iconSetConfigurationTypes.value.workObjects.includes(iconName);
  }

  changeName(iconSetName: string): void {
    this.iconSetImportExportService.setIconSetName(iconSetName);
    const changedIconSet = this.iconSetConfigurationTypes.value;
    changedIconSet.name = iconSetName;
    this.iconSetConfigurationTypes.next(changedIconSet);
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
    const value = this.iconSetConfigurationTypes.value;
    if (!value.actors.includes(actor)) {
      value.actors.push(actor);
      this.iconSetConfigurationTypes.next(value);
      this.updateActorSubject();
    }
  }

  selectWorkObject(workObject: string): void {
    const value = this.iconSetConfigurationTypes.value;
    if (!value.workObjects.includes(workObject)) {
      value.workObjects.push(workObject);
      this.iconSetConfigurationTypes.next(value);
      this.updateWorkObjectSubject();
    }
  }

  deselectActor(actor: string): void {
    if (this.iconSetConfigurationTypes) {
      this.iconSetConfigurationTypes.next({
        name: this.iconSetConfigurationTypes.value.name,
        actors: this.iconSetConfigurationTypes.value.actors.filter(
          (a: string) => a !== actor,
        ),
        workObjects: this.iconSetConfigurationTypes.value.workObjects,
      });
    }
    this.iconDictionaryService.unregisterIconForType(ElementTypes.ACTOR, actor);
    this.updateActorSubject();
  }

  deselectWorkObject(workObject: string): void {
    if (this.iconSetConfigurationTypes) {
      this.iconSetConfigurationTypes.next({
        name: this.iconSetConfigurationTypes.value.name,
        actors: this.iconSetConfigurationTypes.value.actors,
        workObjects: this.iconSetConfigurationTypes.value.workObjects.filter(
          (w: string) => w !== workObject,
        ),
      });
    }
    this.iconDictionaryService.unregisterIconForType(
      ElementTypes.WORKOBJECT,
      workObject,
    );
    this.updateWorkObjectSubject();
  }

  setSelectedWorkObject(sortedList: string[]): void {
    const value = this.iconSetConfigurationTypes.value;
    value.workObjects = sortedList;
    this.iconSetConfigurationTypes.next(value);
    this.updateWorkObjectSubject();
  }

  setSelectedActors(sortedList: string[]): void {
    const value = this.iconSetConfigurationTypes.value;
    value.actors = sortedList;
    this.iconSetConfigurationTypes.next(value);
    this.updateActorSubject();
  }

  private updateActorSubject(): void {
    this.selectedActors$.next(this.iconSetConfigurationTypes.value.actors);
    this.configurationHasChanged = true;
  }

  private updateWorkObjectSubject(): void {
    this.selectedWorkObjects$.next(
      this.iconSetConfigurationTypes.value.workObjects,
    );
    this.configurationHasChanged = true;
  }

  resetIconSet(): void {
    const currentIconSet = this.createMinimalIconSet();

    this.selectedWorkObjects$.value.forEach((workObjectName) => {
      if (!currentIconSet.workObjects.has(workObjectName)) {
        this.deselectWorkObject(workObjectName);
      }
    });
    this.selectedActors$.value.forEach((actorName) => {
      if (!currentIconSet.actors.has(actorName)) {
        this.deselectActor(actorName);
      }
    });

    this.iconSetConfigurationTypes.next({
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
    this.iconSetConfigurationTypes.next(
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
    this.updateActorSubject();
    this.updateWorkObjectSubject();
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
    const changedIcons: string[] = [];

    usedIcons?.forEach((icon) => {
      if (!changedIconSet.includes(icon) && !changedIcons.includes(icon)) {
        changedIcons.push(icon);
      }
    });
    return changedIcons;
  }

  getAndClearSavedConfiguration(): IconSet | undefined {
    const temp = this.changedIconSetConfiguration;
    this.changedIconSetConfiguration = undefined;

    return temp;
  }

  private createIconSetConfiguration(): IconSet {
    const actors = new Dictionary();
    const workObjects = new Dictionary();

    this.iconSetConfigurationTypes.value.actors.forEach((name: string) => {
      actors.set(name, this.iconDictionaryService.getIconSource(name));
    });
    this.iconSetConfigurationTypes.value.workObjects.forEach((name: string) => {
      workObjects.set(name, this.iconDictionaryService.getIconSource(name));
    });

    return {
      name: this.iconSetConfigurationTypes.value.name || '',
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
    const customIconSetConfiguration = this.iconSetConfigurationTypes.value;
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
