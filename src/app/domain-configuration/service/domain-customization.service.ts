import { Injectable } from '@angular/core';
import {
  CustomDomainCofiguration,
  DomainConfiguration,
} from '../../common/domain/domainConfiguration';
import { BehaviorSubject } from 'rxjs';
import { DomainConfigurationService } from './domain-configuration.service';
import { IconDictionaryService } from './icon-dictionary.service';
import { getNameFromType } from '../../common/util/naming';
import { elementTypes } from '../../common/domain/elementTypes';
import { IconListItem } from '../domain/iconListItem';
import { Dictionary, Entry } from '../../common/domain/dictionary/dictionary';
import { initialDomainName } from '../../titleAndDescription/service/title.service';
import { ImportDomainStoryService } from '../../import-service/import-domain-story.service';
import { deepCopy } from '../../common/util/deepCopy';

@Injectable({
  providedIn: 'root',
})
export class DomainCustomizationService {
  private domainConfigurationTypes: BehaviorSubject<CustomDomainCofiguration>;

  private allIconListItems = new Dictionary();

  domainName = new BehaviorSubject<string>(initialDomainName);

  private configurationHasChanged = false;

  selectedActors = new BehaviorSubject<string[]>([]);
  selectedWorkobjects = new BehaviorSubject<string[]>([]);
  private savedDomainConfiguration: DomainConfiguration | undefined;

  constructor(
    private configurationService: DomainConfigurationService,
    private iconDictionaryService: IconDictionaryService,
    private importService: ImportDomainStoryService
  ) {
    this.domainConfigurationTypes = new BehaviorSubject(
      this.configurationService.getCurrentConfigurationNamesWithoutPrefix()
    );

    this.selectedWorkobjects.next(
      this.domainConfigurationTypes.value.workObjects
    );
    this.selectedActors.next(this.domainConfigurationTypes.value.actors);

    iconDictionaryService
      .getAllIconDictionary()
      .keysArray()
      .forEach((iconName) => {
        this.addIconToAllIconList(iconName);
      });

    importService.importedConfigurationEvent.subscribe((config) => {
      this.importConfiguration(config);
    });
    const importedConfiguration = this.importService.getImportedConfiguration();
    if (importedConfiguration) {
      this.importConfiguration(importedConfiguration, false);
    }
  }

  private addIconToAllIconList(iconName: string) {
    this.allIconListItems.add(
      new BehaviorSubject({
        name: iconName,
        svg: this.getSrcForIcon(iconName),
        isActor: this.checkForActor(iconName),
        isWorkObject: this.checkForWorkObject(iconName),
      }),
      iconName
    );
  }

  getDomainConfiguration() {
    return this.domainConfigurationTypes;
  }

  checkNone(iconName: string) {
    this.updateIcon(false, false, iconName);
  }

  checkActor(isActor: boolean, actor: string): void {
    if (isActor) {
      this.updateIcon(true, false, actor);
      this.selectActor(actor);
      this.deselectWorkobject(actor);
    } else {
      this.deselectActor(actor);
      this.updateIcon(false, false, actor);
    }
  }

  checkWorkobject(isWorkobject: boolean, workobject: string): void {
    if (isWorkobject) {
      this.updateIcon(false, true, workobject);
      this.selectWorkObject(workobject);
      this.deselectActor(workobject);
    } else {
      this.deselectWorkobject(workobject);
      this.updateIcon(false, false, workobject);
    }
  }

  private updateActorSubject(): void {
    this.selectedActors.next(this.domainConfigurationTypes.value.actors);
    this.configurationHasChanged = true;
  }

  private updateWorkObjectSubject(): void {
    this.selectedWorkobjects.next(
      this.domainConfigurationTypes.value.workObjects
    );
    this.configurationHasChanged = true;
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

  resetDomain(): void {
    const defaultConfig = this.configurationService.createDefaultConfig();

    this.domainConfigurationTypes.next({
      name: defaultConfig.name,
      actors: defaultConfig.actors.entries.map((entry: Entry) => entry.key),
      workObjects: defaultConfig.workObjects.entries.map(
        (entry: Entry) => entry.key
      ),
    } as CustomDomainCofiguration);
    this.updateAllIconBehaviourSubjects();
  }

  saveDomain(): void {
    if (this.configurationHasChanged) {
      this.savedDomainConfiguration = this.createDomainConfiguration();
    }
  }

  getSavedConfiguration(): DomainConfiguration | undefined {
    const config = deepCopy(this.savedDomainConfiguration);
    this.savedDomainConfiguration = undefined;
    return config;
  }

  private createDomainConfiguration(): DomainConfiguration {
    const actors: { [key: string]: any } = {};
    const workObjects: { [key: string]: any } = {};

    this.domainConfigurationTypes.value.actors.forEach((type: string) => {
      actors[type] = this.iconDictionaryService.getIconSource(type);
    });
    this.domainConfigurationTypes.value.workObjects.forEach((type: string) => {
      workObjects[type] = this.iconDictionaryService.getIconSource(type);
    });

    return {
      name: this.domainConfigurationTypes.value.name || '',
      actors,
      workObjects,
    };
  }

  public exportDomain(): void {
    this.saveDomain();
    this.configurationService.exportConfiguration();
  }

  cancel(): void {
    this.domainConfigurationTypes.next(
      this.configurationService.getCurrentConfigurationNamesWithoutPrefix()
    );
    this.updateAllIconBehaviourSubjects();
    this.resetToInitialConfiguration();
  }

  private updateAllIconBehaviourSubjects() {
    const customDomainCofiguration = this.domainConfigurationTypes.value;
    this.allIconListItems.keysArray().forEach((iconName) => {
      if (customDomainCofiguration.actors.includes(iconName)) {
        this.updateIcon(true, false, iconName);
      } else if (customDomainCofiguration.workObjects.includes(iconName)) {
        this.updateIcon(false, true, iconName);
      } else {
        this.updateIcon(false, false, iconName);
      }
    });
  }

  private resetToInitialConfiguration(): void {
    this.updateActorSubject();
    this.updateWorkObjectSubject();
  }

  private getSrcForIcon(name: string): string {
    let iconName = '';
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

  getIconForName(iconName: string): BehaviorSubject<IconListItem> {
    return this.allIconListItems.get(iconName);
  }

  checkForActor(iconName: string): boolean {
    return (
      this.domainConfigurationTypes.value.actors.filter((actor: string) =>
        actor.includes(iconName)
      ).length > 0
    );
  }

  checkForWorkObject(iconName: string): boolean {
    return (
      this.domainConfigurationTypes.value.workObjects.filter(
        (workObject: string) => workObject.includes(iconName)
      ).length > 0
    );
  }

  getDomainName(): BehaviorSubject<string> {
    return this.domainName;
  }

  changeName(domainName: string): void {
    this.domainName.next(domainName);
  }

  getSelectedActors(): BehaviorSubject<string[]> {
    return this.selectedActors;
  }

  getSelectedWorkobjects(): BehaviorSubject<string[]> {
    return this.selectedWorkobjects;
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

  importConfiguration(customConfig: DomainConfiguration, saveDomain = true) {
    const actorDict = new Dictionary();
    const workObjectDict = new Dictionary();

    actorDict.addEach(customConfig.actors);
    workObjectDict.addEach(customConfig.workObjects);

    const actorKeys = actorDict.keysArray();
    const workObjectKeys = workObjectDict.keysArray();

    actorKeys.forEach((iconName) => {
      if (!this.allIconListItems.has(iconName)) {
        this.addIconToAllIconList(iconName);
      }
      const selectedActorNames = this.selectedActors.value;
      if (!selectedActorNames.includes(iconName)) {
        selectedActorNames.push(iconName);
        this.selectedActors.next(selectedActorNames);
      }
      this.checkActor(true, iconName);
    });
    workObjectKeys.forEach((iconName) => {
      if (!this.allIconListItems.has(iconName)) {
        this.addIconToAllIconList(iconName);
      }
      const selectedWorkobjectNames = this.selectedWorkobjects.value;
      if (!selectedWorkobjectNames.includes(iconName)) {
        selectedWorkobjectNames.push(iconName);
        this.selectedWorkobjects.next(selectedWorkobjectNames);
      }
      this.checkWorkobject(true, iconName);
    });
    if (saveDomain) {
      this.saveDomain();
    }
  }

  addNewIcon(iconName: string) {
    this.iconDictionaryService.addIconsToCss([
      { name: iconName, src: this.getSrcForIcon(iconName) },
    ]);
    this.addIconToAllIconList(iconName);
  }
}
