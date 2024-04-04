import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { UsedIconList } from 'src/app/Domain/Domain-Configuration/UsedIconList';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import {
  SNACKBAR_DURATION,
  SNACKBAR_INFO,
  SNACKBAR_SUCCESS,
} from '../../Domain/Common/constants';
import { Dictionary } from '../../Domain/Common/dictionary/dictionary';
import {
  CustomDomainConfiguration,
  DomainConfiguration,
} from '../../Domain/Common/domainConfiguration';
import { elementTypes } from '../../Domain/Common/elementTypes';
import { IconListItem } from '../../Domain/Domain-Configuration/iconListItem';
import { getNameFromType } from '../../Utils/naming';
import { StorageService } from '../BrowserStorage/storage.service';
import { ImportDomainStoryService } from '../Import/import-domain-story.service';
import { TitleService } from '../Title/title.service';
import { DomainConfigurationService } from './domain-configuration.service';
import { IconDictionaryService } from './icon-dictionary.service';

@Injectable({
  providedIn: 'root',
})
export class DomainCustomizationService {
  private readonly domainConfigurationTypes: BehaviorSubject<CustomDomainConfiguration>;

  private allIconListItems = new Dictionary();

  private configurationHasChanged = false;

  selectedActors$ = new BehaviorSubject<string[]>([]);
  selectedWorkobjects$ = new BehaviorSubject<string[]>([]);
  private changedDomainConfiguration: DomainConfiguration | undefined;

  constructor(
    private configurationService: DomainConfigurationService,
    private iconDictionaryService: IconDictionaryService,
    private importService: ImportDomainStoryService,
    private titleService: TitleService,
    private storageService: StorageService,
    private elementRegistryService: ElementRegistryService,
    private snackbar: MatSnackBar
  ) {
    this.domainConfigurationTypes = new BehaviorSubject(
      this.configurationService.getCurrentConfigurationNamesWithoutPrefix()
    );

    this.selectedWorkobjects$.next(
      this.domainConfigurationTypes.value.workObjects
    );
    this.selectedActors$.next(this.domainConfigurationTypes.value.actors);

    iconDictionaryService
      .getAllIconDictionary()
      .keysArray()
      .forEach((iconName) => {
        this.addIconToAllIconList(iconName);
      });

    importService.importedConfigurationEvent.subscribe((config) => {
      this.importConfiguration(config);
    });
    const storedDomainConfiguration =
      this.storageService.getStoredDomainConfiguration();
    if (storedDomainConfiguration) {
      this.importConfiguration(storedDomainConfiguration, false);
    }
    const importedConfiguration = this.importService.getImportedConfiguration();
    if (importedConfiguration) {
      this.importConfiguration(importedConfiguration, false);
    }
  }

  importConfiguration(
    customConfig: DomainConfiguration,
    saveDomain = true
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
    if (saveDomain) {
      this.saveDomain(this.elementRegistryService.getUsedIcons(), true);
    }
  }

  /** Getter & Setter **/
  getDomainConfiguration(): BehaviorSubject<CustomDomainConfiguration> {
    return this.domainConfigurationTypes;
  }

  getIconForName(iconName: string): BehaviorSubject<IconListItem> {
    return this.allIconListItems.get(iconName);
  }

  isIconActor(iconName: string): boolean {
    return (
      this.domainConfigurationTypes.value.actors.filter(
        (actor: string) => actor === iconName
      ).length > 0
    );
  }

  isIconWorkObject(iconName: string): boolean {
    return (
      this.domainConfigurationTypes.value.workObjects.filter(
        (workObject: string) => workObject === iconName
      ).length > 0
    );
  }

  changeName(domainName: string): void {
    this.titleService.setDomainName(domainName);
    const changedDomain = this.domainConfigurationTypes.value;
    changedDomain.name = domainName;
    this.domainConfigurationTypes.next(changedDomain);
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
    const value = this.domainConfigurationTypes.value;
    if (!value.actors.includes(actor)) {
      value.actors.push(actor);
      this.domainConfigurationTypes.next(value);
      this.updateActorSubject();
    }
  }

  selectWorkObject(workObject: string): void {
    const value = this.domainConfigurationTypes.value;
    if (!value.workObjects.includes(workObject)) {
      value.workObjects.push(workObject);
      this.domainConfigurationTypes.next(value);
      this.updateWorkObjectSubject();
    }
  }

  deselectActor(actor: string): void {
    if (this.domainConfigurationTypes) {
      this.domainConfigurationTypes.next({
        name: this.domainConfigurationTypes.value.name,
        actors: this.domainConfigurationTypes.value.actors.filter(
          (a: string) => !a.includes(actor)
        ),
        workObjects: this.domainConfigurationTypes.value.workObjects,
      });
    }
    this.updateActorSubject();
  }

  deselectWorkobject(workobject: string): void {
    if (this.domainConfigurationTypes) {
      this.domainConfigurationTypes.next({
        name: this.domainConfigurationTypes.value.name,
        actors: this.domainConfigurationTypes.value.actors,
        workObjects: this.domainConfigurationTypes.value.workObjects.filter(
          (w: string) => !w.includes(workobject)
        ),
      });
    }
    this.updateWorkObjectSubject();
  }

  setSelectedWorkObject(sortedList: string[]): void {
    const value = this.domainConfigurationTypes.value;
    value.workObjects = sortedList;
    this.domainConfigurationTypes.next(value);
    this.updateWorkObjectSubject();
  }

  setSelectedActors(sortedList: string[]): void {
    const value = this.domainConfigurationTypes.value;
    value.actors = sortedList;
    this.domainConfigurationTypes.next(value);
    this.updateActorSubject();
  }

  private updateActorSubject(): void {
    this.selectedActors$.next(this.domainConfigurationTypes.value.actors);
    this.configurationHasChanged = true;
  }

  private updateWorkObjectSubject(): void {
    this.selectedWorkobjects$.next(
      this.domainConfigurationTypes.value.workObjects
    );
    this.configurationHasChanged = true;
  }

  /** Revert Domain **/
  resetDomain(): void {
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

    this.domainConfigurationTypes.next({
      name: defaultConfig.name,
      actors: defaultConfig.actors.keysArray(),
      workObjects: defaultConfig.workObjects.keysArray(),
    } as CustomDomainConfiguration);

    this.updateAllIconBehaviourSubjects();
  }

  cancel(): void {
    this.domainConfigurationTypes.next(
      this.configurationService.getCurrentConfigurationNamesWithoutPrefix()
    );
    this.updateAllIconBehaviourSubjects();
    this.resetToInitialConfiguration();
  }

  private resetToInitialConfiguration(): void {
    this.updateActorSubject();
    this.updateWorkObjectSubject();
  }

  /** Persist Domain **/
  saveDomain(usedIcons: UsedIconList, imported = false): void {
    const changedActors: string[] = [];
    const changedWorkobjects: string[] = [];
    if (this.configurationHasChanged) {
      const changedDomain = this.createDomainConfiguration();

      const configurationActors = changedDomain.actors.keysArray();
      usedIcons?.actors.forEach((actor) => {
        if (
          !configurationActors?.includes(actor) &&
          !changedActors.includes(actor)
        ) {
          changedActors.push(actor);
        }
      });
      const configurationWorkobjects = changedDomain.workObjects.keysArray();
      usedIcons?.workobjects.forEach((workobject) => {
        if (
          !configurationWorkobjects?.includes(workobject) &&
          !changedWorkobjects.includes(workobject)
        ) {
          changedWorkobjects.push(workobject);
        }
      });

      if (!changedActors.length && !changedWorkobjects.length) {
        this.changedDomainConfiguration = changedDomain;

        this.updateIcons(changedDomain);

        this.storageService.setStoredDomainConfiguration(
          this.changedDomainConfiguration
        );
        this.snackbar.open(
          imported
            ? 'Configuration imported successfully'
            : 'Configuration saved successfully',
          undefined,
          {
            duration: SNACKBAR_DURATION,
            panelClass: SNACKBAR_SUCCESS,
          }
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
        }
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
          }
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
          }
        );
      }
    }
  }

  exportDomain(): void {
    this.configurationService.exportConfiguration();
  }

  getAndClearSavedConfiguration(): DomainConfiguration | undefined {
    const temp = this.changedDomainConfiguration;
    this.changedDomainConfiguration = undefined;

    return temp;
  }

  private createDomainConfiguration(): DomainConfiguration {
    const actors = new Dictionary();
    const workObjects = new Dictionary();

    this.domainConfigurationTypes.value.actors.forEach((name: string) => {
      actors.add(this.iconDictionaryService.getIconSource(name), name);
    });
    this.domainConfigurationTypes.value.workObjects.forEach((name: string) => {
      workObjects.add(this.iconDictionaryService.getIconSource(name), name);
    });

    return {
      name: this.domainConfigurationTypes.value.name || '',
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
      iconName
    );
  }

  private updateIcon(
    isActor: boolean,
    isWorkobject: boolean,
    iconName: string
  ) {
    const iconBehaviourSubject = this.getIconForName(iconName);
    const icon = iconBehaviourSubject.value;
    icon.isActor = isActor;
    icon.isWorkObject = isWorkobject;

    iconBehaviourSubject.next(icon);
  }

  private updateAllIconBehaviourSubjects(): void {
    const customDomainConfiguration = this.domainConfigurationTypes.value;
    this.allIconListItems.keysArray().forEach((iconName) => {
      if (customDomainConfiguration.actors.includes(iconName)) {
        this.updateIcon(true, false, iconName);
      } else if (customDomainConfiguration.workObjects.includes(iconName)) {
        this.updateIcon(false, true, iconName);
      } else {
        this.updateIcon(false, false, iconName);
      }
    });
  }

  private getSrcForIcon(name: string): string {
    let iconName: string;
    if (name.includes(elementTypes.DOMAINSTORY)) {
      iconName = getNameFromType(name);
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

  private updateIcons(changedDomain: DomainConfiguration) {
    this.allIconListItems
      .keysArray()
      .forEach((item) => this.setAsUnassigned(item, this.isIconActor(item)));
    changedDomain.actors.keysArray().forEach((actor) => {
      this.iconDictionaryService.registerIconForType(
        elementTypes.ACTOR,
        actor,
        this.iconDictionaryService.getFullDictionary().get(actor)
      );
      this.iconDictionaryService.unregisterIconForType(
        elementTypes.WORKOBJECT,
        actor
      );
      this.setAsActor(true, actor);
    });
    changedDomain.workObjects.keysArray().forEach((workObject) => {
      this.iconDictionaryService.registerIconForType(
        elementTypes.WORKOBJECT,
        workObject,
        this.iconDictionaryService.getFullDictionary().get(workObject)
      );
      this.iconDictionaryService.unregisterIconForType(
        elementTypes.ACTOR,
        workObject
      );
      this.setAsWorkobject(true, workObject);
    });
  }
}
