import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { UsedIconList } from 'src/app/Domain/Icon-Set-Configuration/UsedIconList';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import {
  SNACKBAR_DURATION,
  SNACKBAR_INFO,
  SNACKBAR_SUCCESS,
} from '../../Domain/Common/constants';
import { Dictionary } from '../../Domain/Common/dictionary/dictionary';
import {
  CustomIconSetConfiguration,
  IconSetConfiguration,
} from '../../Domain/Icon-Set-Configuration/iconSetConfiguration';
import { ElementTypes } from '../../Domain/Common/elementTypes';
import { IconListItem } from '../../Domain/Icon-Set-Configuration/iconListItem';
import { StorageService } from '../BrowserStorage/storage.service';
import { ImportDomainStoryService } from '../../tool/import/service/import-domain-story.service';
import { TitleService } from '../../tool/header/service/title.service';
import { IconSetConfigurationService } from './icon-set-configuration.service';
import { IconDictionaryService } from './icon-dictionary.service';
import getIconId = ElementTypes.getIconId;

@Injectable({
  providedIn: 'root',
})
export class IconSetCustomizationService {
  private readonly iconSetConfigurationTypes: BehaviorSubject<CustomIconSetConfiguration>;

  private allIconListItems = new Dictionary();

  private configurationHasChanged = false;

  selectedActors$ = new BehaviorSubject<string[]>([]);
  selectedWorkobjects$ = new BehaviorSubject<string[]>([]);
  private changedIconSetConfiguration: IconSetConfiguration | undefined;

  constructor(
    private configurationService: IconSetConfigurationService,
    private iconDictionaryService: IconDictionaryService,
    private importService: ImportDomainStoryService,
    private titleService: TitleService,
    private storageService: StorageService,
    private elementRegistryService: ElementRegistryService,
    private snackbar: MatSnackBar,
  ) {
    this.iconSetConfigurationTypes = new BehaviorSubject(
      this.configurationService.getCurrentConfigurationNamesWithoutPrefix(),
    );

    this.selectedWorkobjects$.next(
      this.iconSetConfigurationTypes.value.workObjects,
    );
    this.selectedActors$.next(this.iconSetConfigurationTypes.value.actors);

    iconDictionaryService
      .getAllIconDictionary()
      .keysArray()
      .forEach((iconName) => {
        this.addIconToAllIconList(iconName);
      });

    importService.importedConfigurationEvent.subscribe((config) => {
      this.importConfiguration(config);
    });
    const storedIconSetConfiguration =
      this.storageService.getStoredIconSetConfiguration();
    if (storedIconSetConfiguration) {
      this.importConfiguration(storedIconSetConfiguration, false);
    }
    const importedConfiguration = this.importService.getImportedConfiguration();
    if (importedConfiguration) {
      this.importConfiguration(importedConfiguration, false);
    }
  }

  importConfiguration(
    customConfig: IconSetConfiguration,
    saveIconSet = true,
  ): void {
    const actorKeys = customConfig.actors.keysArray();
    const workObjectKeys = customConfig.workObjects.keysArray();

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
    workObjectKeys.forEach((iconName) => {
      if (!this.allIconListItems.has(iconName)) {
        this.addIconToAllIconList(iconName);
      }
      const selectedWorkobjectNames = this.selectedWorkobjects$.value;
      if (!selectedWorkobjectNames.includes(iconName)) {
        this.selectWorkObject(iconName);
      }
    });
    if (saveIconSet) {
      this.saveIconSet(this.elementRegistryService.getUsedIcons(), true);
    }
  }

  /** Getter & Setter **/
  getIconSetConfiguration(): BehaviorSubject<CustomIconSetConfiguration> {
    return this.iconSetConfigurationTypes;
  }

  getIconForName(iconName: string): BehaviorSubject<IconListItem> {
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
    this.titleService.setIconSetName(iconSetName);
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

  /** Revert Icon Set **/
  resetIconSet(): void {
    const defaultConfig =
      this.configurationService.createMinimalConfigurationWithDefaultIcons();

    this.selectedWorkobjects$.value.forEach((workObjectName) => {
      if (!defaultConfig.workObjects.has(workObjectName)) {
        this.deselectWorkobject(workObjectName);
      }
    });
    this.selectedActors$.value.forEach((actorName) => {
      if (!defaultConfig.actors.has(actorName)) {
        this.deselectActor(actorName);
      }
    });

    this.iconSetConfigurationTypes.next({
      name: defaultConfig.name,
      actors: defaultConfig.actors.keysArray(),
      workObjects: defaultConfig.workObjects.keysArray(),
    } as CustomIconSetConfiguration);

    this.updateAllIconBehaviourSubjects();
  }

  cancel(): void {
    this.iconSetConfigurationTypes.next(
      this.configurationService.getCurrentConfigurationNamesWithoutPrefix(),
    );
    this.updateAllIconBehaviourSubjects();
    this.resetToInitialConfiguration();
  }

  private resetToInitialConfiguration(): void {
    this.updateActorSubject();
    this.updateWorkObjectSubject();
  }

  /** Persist Icon Set **/
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

        this.storageService.setStoredIconSetConfiguration(
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
            duration: SNACKBAR_DURATION * 3,
            panelClass: SNACKBAR_INFO,
          },
        );
      }
      if (changedWorkobjects.length) {
        const workobjects = changedWorkobjects.join(', ');
        this.snackbar.open(
          `The following icons are already in use as workobjects and cannot be changed: ${workobjects}`,
          undefined,
          {
            duration: SNACKBAR_DURATION * 3,
            panelClass: SNACKBAR_INFO,
          },
        );
      }
    }
  }

  exportIconSet(): void {
    this.configurationService.exportConfiguration();
  }

  getAndClearSavedConfiguration(): IconSetConfiguration | undefined {
    const temp = this.changedIconSetConfiguration;
    this.changedIconSetConfiguration = undefined;

    return temp;
  }

  private createIconSetConfiguration(): IconSetConfiguration {
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

  /** Update Icons **/
  addNewIcon(iconName: string): void {
    const iconDict = new Dictionary();
    iconDict.add(this.getSrcForIcon(iconName), iconName);
    this.iconDictionaryService.addIconsToCss(iconDict);
    this.addIconToAllIconList(iconName);
  }

  private addIconToAllIconList(iconName: string): void {
    this.allIconListItems.add(
      new BehaviorSubject({
        name: iconName,
        svg: this.getSrcForIcon(iconName),
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

  private getSrcForIcon(name: string): string {
    let iconName: string;
    if (name.includes(ElementTypes.DOMAINSTORY)) {
      // TODO: td: This returns empty every time!
      iconName = getIconId(name);
    } else {
      iconName = name;
    }
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

  private updateIcons(changedIconSet: IconSetConfiguration) {
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
