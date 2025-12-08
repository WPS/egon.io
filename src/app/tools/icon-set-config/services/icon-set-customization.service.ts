import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { UsedIconList } from 'src/app/domain/entities/UsedIconList';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import {
  INITIAL_ICON_SET_NAME,
  SNACKBAR_DURATION,
  SNACKBAR_DURATION_LONGER,
  SNACKBAR_ERROR,
  SNACKBAR_INFO,
  SNACKBAR_SUCCESS,
} from '../../../domain/entities/constants';
import { Dictionary } from '../../../domain/entities/dictionary';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { SelectableIcon } from '../domain/selectableIcon';
import { IconSetImportExportService } from './icon-set-import-export.service';
import { IconDictionaryService } from './icon-dictionary.service';
import { IconSet } from '../../../domain/entities/iconSet';
import { builtInIcons } from 'src/app/tools/icon-set-config/domain/builtInIcons';

/**
 * We are not allowed to call ImportDomainStoryService directly,
 * so we use this "interface" instead.
 */
export abstract class IconSetChangedService {
  public abstract iconConfigurationChanged(): Observable<IconSet>;
}

// can be used instead of IconSet whenever only the icon names are needed
interface CustomIconSetConfiguration {
  name: string;
  actors: string[];
  workObjects: string[];
}

@Injectable({
  providedIn: 'root',
})
export class IconSetCustomizationService {
  private readonly iconSetConfigurationTypes: BehaviorSubject<CustomIconSetConfiguration>;

  private allIconListItems = new Dictionary();

  private configurationHasChanged = false;

  selectedActors$ = new BehaviorSubject<string[]>([]);
  selectedWorkobjects$ = new BehaviorSubject<string[]>([]);
  private changedIconSetConfiguration: IconSet | undefined;

  constructor(
    private iconSetImportExportService: IconSetImportExportService,
    private iconDictionaryService: IconDictionaryService,
    iconSetChangedService: IconSetChangedService,
    private elementRegistryService: ElementRegistryService,
    private snackbar: MatSnackBar,
  ) {
    this.iconSetConfigurationTypes = new BehaviorSubject(
      this.getCurrentConfigurationNamesWithoutPrefix(),
    );

    this.selectedWorkobjects$.next(
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
    const actorKeys = customConfig.actors.keysArray();
    const workObjectKeys = customConfig.workObjects.keysArray();
    const usedIcons = this.elementRegistryService.getUsedIcons();

    this.changeName(customConfig.name);
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
    workObjectKeys.forEach((iconName) => {
      if (!this.allIconListItems.has(iconName)) {
        this.addIconToAllIconList(iconName);
      }
      const selectedWorkobjectNames = this.selectedWorkobjects$.value;
      if (!selectedWorkobjectNames.includes(iconName)) {
        this.selectWorkObject(iconName);
      }
    });
    this.selectedWorkobjects$.value.forEach((iconName) => {
      if (
        !workObjectKeys.includes(iconName) &&
        !usedIcons.workobjects.includes(iconName)
      ) {
        this.deselectWorkobject(iconName);
      }
    });
    if (saveIconSet) {
      this.saveIconSet(usedIcons, true);
    }
  }

  /** Getter & Setter **/
  getIconForName(iconName: string): BehaviorSubject<SelectableIcon> {
    return this.allIconListItems.get(iconName);
  }

  isIconActor(iconName: string): boolean {
    return (
      this.iconSetConfigurationTypes.value.actors.filter(
        (actor: string) => actor === iconName,
      ).length > 0
    );
  }

  isIconWorkObject(iconName: string): boolean {
    return (
      this.iconSetConfigurationTypes.value.workObjects.filter(
        (workObject: string) => workObject === iconName,
      ).length > 0
    );
  }

  changeName(iconSetName: string): void {
    this.iconSetImportExportService.setIconSetName(iconSetName);
    const changedIconSet = this.iconSetConfigurationTypes.value;
    changedIconSet.name = iconSetName;
    this.iconSetConfigurationTypes.next(changedIconSet);
  }

  /** Selected Icons **/
  setAsUnassigned(iconName: string, isActor: boolean): void {
    if (isActor) {
      this.deselectActor(iconName);
    } else {
      this.deselectWorkobject(iconName);
    }
    this.updateIcon(false, false, iconName);
  }

  setAsActor(isActor: boolean, actor: string): void {
    if (isActor) {
      this.updateIcon(true, false, actor);
      this.selectActor(actor);
      this.deselectWorkobject(actor);
    } else {
      this.deselectActor(actor);
      this.updateIcon(false, false, actor);
    }
  }

  setAsWorkobject(isWorkobject: boolean, workobject: string): void {
    if (isWorkobject) {
      this.updateIcon(false, true, workobject);
      this.selectWorkObject(workobject);
      this.deselectActor(workobject);
    } else {
      this.deselectWorkobject(workobject);
      this.updateIcon(false, false, workobject);
    }
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
          (a: string) => !a.includes(actor),
        ),
        workObjects: this.iconSetConfigurationTypes.value.workObjects,
      });
    }
    this.updateActorSubject();
  }

  deselectWorkobject(workobject: string): void {
    if (this.iconSetConfigurationTypes) {
      this.iconSetConfigurationTypes.next({
        name: this.iconSetConfigurationTypes.value.name,
        actors: this.iconSetConfigurationTypes.value.actors,
        workObjects: this.iconSetConfigurationTypes.value.workObjects.filter(
          (w: string) => !w.includes(workobject),
        ),
      });
    }
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
    this.selectedWorkobjects$.next(
      this.iconSetConfigurationTypes.value.workObjects,
    );
    this.configurationHasChanged = true;
  }

  resetIconSet(): void {
    const currentIconSet = this.createMinimalIconSet();

    this.selectedWorkobjects$.value.forEach((workObjectName) => {
      if (!currentIconSet.workObjects.has(workObjectName)) {
        this.deselectWorkobject(workObjectName);
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
    } as CustomIconSetConfiguration);

    this.updateAllIconBehaviourSubjects();
  }

  /* creates an icon set that contains the default icons
     AND all other icons that are actually used on the canvas. */
  private createMinimalIconSet(): IconSet {
    const usedIconSet = this.createIconSetFromCanvas();

    let defaultIconSet = this.iconDictionaryService.getDefaultIconSet();

    defaultIconSet.actors.keysArray().forEach((iconName) => {
      usedIconSet.actors.add(
        this.iconDictionaryService.getIconSource(iconName),
        iconName,
      );
    });
    defaultIconSet.workObjects.keysArray().forEach((iconName) => {
      usedIconSet.workObjects.add(
        this.iconDictionaryService.getIconSource(iconName),
        iconName,
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

    let allCanvasObjects = this.elementRegistryService.getAllCanvasObjects();

    allCanvasObjects
      .map((e) => e.businessObject)
      .forEach((element) => {
        const type = element.type
          .replace(ElementTypes.ACTOR, '')
          .replace(ElementTypes.WORKOBJECT, '');
        if (element.type.includes(ElementTypes.ACTOR)) {
          let src = this.iconDictionaryService.getIconSource(type) || '';
          config.actors.add(src, type);
        } else if (element.type.includes(ElementTypes.WORKOBJECT)) {
          let src = this.iconDictionaryService.getIconSource(type) || '';
          config.workObjects.add(src, type);
        }
      });

    return config;
  }

  cancel(): void {
    this.iconSetConfigurationTypes.next(
      this.getCurrentConfigurationNamesWithoutPrefix(),
    );
    this.updateAllIconBehaviourSubjects();
    this.resetToInitialConfiguration();
  }

  private getCurrentConfigurationNamesWithoutPrefix(): CustomIconSetConfiguration {
    return {
      name:
        this.iconSetImportExportService.getIconSetName() ||
        INITIAL_ICON_SET_NAME,
      actors: this.iconDictionaryService
        .getActorsDictionary()
        .keysArray()
        .map((a) => a.replace(ElementTypes.ACTOR, '')),
      workObjects: this.iconDictionaryService
        .getWorkObjectsDictionary()
        .keysArray()
        .map((w) => w.replace(ElementTypes.WORKOBJECT, '')),
    };
  }

  private resetToInitialConfiguration(): void {
    this.updateActorSubject();
    this.updateWorkObjectSubject();
  }

  saveIconSet(usedIcons: UsedIconList, imported = false): void {
    const changedActors: string[] = [];
    const changedWorkobjects: string[] = [];
    if (this.configurationHasChanged) {
      const changedIconSet = this.createIconSetConfiguration();

      const configurationActors = changedIconSet.actors.keysArray();
      usedIcons?.actors.forEach((actor) => {
        if (
          !configurationActors?.includes(actor) &&
          !changedActors.includes(actor)
        ) {
          changedActors.push(actor);
        }
      });
      const configurationWorkobjects = changedIconSet.workObjects.keysArray();
      usedIcons?.workobjects.forEach((workobject) => {
        if (
          !configurationWorkobjects?.includes(workobject) &&
          !changedWorkobjects.includes(workobject)
        ) {
          changedWorkobjects.push(workobject);
        }
      });

      if (!changedActors.length && !changedWorkobjects.length) {
        this.changedIconSetConfiguration = changedIconSet;

        this.updateIcons(changedIconSet);

        this.iconSetImportExportService.setStoredIconSetConfiguration(
          this.changedIconSetConfiguration,
        );
        this.snackbar.open(
          imported
            ? 'Configuration imported successfully'
            : 'Configuration saved successfully',
          undefined,
          {
            duration: SNACKBAR_DURATION,
            panelClass: SNACKBAR_SUCCESS,
          },
        );
      }
    } else {
      this.snackbar.open(
        imported
          ? 'No configuration to be imported'
          : 'No configuration to be saved',
        undefined,
        {
          duration: SNACKBAR_DURATION,
          panelClass: SNACKBAR_INFO,
        },
      );
    }
    if (changedActors.length || changedWorkobjects.length) {
      if (changedActors.length) {
        const actors = changedActors.join(', ');
        this.snackbar.open(
          `The following icons are already in use as actors and cannot be changed: ${actors}`,
          undefined,
          {
            duration: SNACKBAR_DURATION_LONGER,
            panelClass: SNACKBAR_ERROR,
          },
        );
      }
      if (changedWorkobjects.length) {
        const workobjects = changedWorkobjects.join(', ');
        this.snackbar.open(
          `The following icons are already in use as work objects and cannot be changed: ${workobjects}`,
          undefined,
          {
            duration: SNACKBAR_DURATION_LONGER,
            panelClass: SNACKBAR_ERROR,
          },
        );
      }
    }
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
      actors.add(this.iconDictionaryService.getIconSource(name), name);
    });
    this.iconSetConfigurationTypes.value.workObjects.forEach((name: string) => {
      workObjects.add(this.iconDictionaryService.getIconSource(name), name);
    });

    return {
      name: this.iconSetConfigurationTypes.value.name || '',
      actors,
      workObjects,
    };
  }

  addNewIcon(iconName: string): void {
    this.iconDictionaryService.addCustomIcon(
      this.getDataUrlForIcon(iconName),
      iconName,
    );
    this.addIconToAllIconList(iconName);
  }

  private addIconToAllIconList(iconName: string): void {
    this.allIconListItems.add(
      new BehaviorSubject({
        name: iconName,
        svg: this.getDataUrlForIcon(iconName),
        isActor: this.isIconActor(iconName),
        isWorkObject: this.isIconWorkObject(iconName),
      }),
      iconName,
    );
  }

  private updateIcon(
    isActor: boolean,
    isWorkobject: boolean,
    iconName: string,
  ) {
    const iconBehaviourSubject = this.getIconForName(iconName);
    const icon = iconBehaviourSubject.value;
    icon.isActor = isActor;
    icon.isWorkObject = isWorkobject;

    iconBehaviourSubject.next(icon);
  }

  private updateAllIconBehaviourSubjects(): void {
    const customIconSetConfiguration = this.iconSetConfigurationTypes.value;
    this.allIconListItems.keysArray().forEach((iconName) => {
      if (customIconSetConfiguration.actors.includes(iconName)) {
        this.updateIcon(true, false, iconName);
      } else if (customIconSetConfiguration.workObjects.includes(iconName)) {
        this.updateIcon(false, true, iconName);
      } else {
        this.updateIcon(false, false, iconName);
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

  private updateIcons(changedIconSet: IconSet) {
    this.allIconListItems
      .keysArray()
      .forEach((item) => this.setAsUnassigned(item, this.isIconActor(item)));
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
      this.setAsActor(true, actor);
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
      this.setAsWorkobject(true, workObject);
    });
  }
}
