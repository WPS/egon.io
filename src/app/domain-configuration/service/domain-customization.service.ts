import { Injectable } from '@angular/core';
import {
  CustomDomainCofiguration,
  DomainConfiguration,
} from '../../common/domain/domainConfiguration';
import { BehaviorSubject } from 'rxjs';
import { deepCopy } from '../../common/util/deepCopy';
import { DomainConfigurationService } from './domain-configuration.service';
import { IconDictionaryService } from './icon-dictionary.service';
import { getNameFromType } from '../../common/util/naming';
import { ModelerService } from '../../modeler/service/modeler.service';
import { elementTypes } from '../../common/domain/elementTypes';
import { IconListItem } from '../domain/iconListItem';

@Injectable({
  providedIn: 'root',
})
export class DomainCustomizationService {
  private readonly domainConfigurationTypes: BehaviorSubject<CustomDomainCofiguration>;
  private readonly initialConfigurationNames: CustomDomainCofiguration;

  domainName = new BehaviorSubject<string>('');

  private configurationHasChanged = false;

  selectedActors = new BehaviorSubject<string[]>([]);
  selectedWorkobjects = new BehaviorSubject<string[]>([]);

  constructor(
    private modelerService: ModelerService,
    private configurationService: DomainConfigurationService,
    private iconDictionaryService: IconDictionaryService
  ) {
    this.domainConfigurationTypes = new BehaviorSubject(
      this.configurationService.getCurrentConfigurationNamesWithoutPrefix()
    );

    this.initialConfigurationNames = deepCopy(
      this.domainConfigurationTypes.value
    );

    this.selectedWorkobjects.next(
      this.domainConfigurationTypes.value.workObjects
    );
    this.selectedActors.next(this.domainConfigurationTypes.value.actors);
  }

  getDomainConfiguration() {
    return this.domainConfigurationTypes;
  }

  checkActor(isActor: boolean, actor: string): void {
    if (isActor) {
      this.selectActor(actor);
      this.deselectWorkobject(actor);
    } else {
      this.deselectActor(actor);
    }
  }

  checkWorkobject(isWorkobject: boolean, workobject: string): void {
    if (isWorkobject) {
      this.selectWorkObject(workobject);
      this.deselectActor(workobject);
    } else {
      this.deselectWorkobject(workobject);
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
    this.modelerService.restart(
      this.configurationService.createDefaultConfig()
    );
  }

  saveDomain(): void {
    if (this.configurationHasChanged) {
      const domainConfiguration = this.createDomainConfiguration();
      this.modelerService.restart(domainConfiguration);
    }
  }

  private createDomainConfiguration(): DomainConfiguration {
    const actors: { [key: string]: any } = {};
    const workObjects: { [key: string]: any } = {};

    this.domainConfigurationTypes.value.actors.forEach((type: string) => {
      actors[type] = this.iconDictionaryService.getIconSource(
        getNameFromType(type)
      );
    });
    this.domainConfigurationTypes.value.workObjects.forEach((type: string) => {
      workObjects[type] = this.iconDictionaryService.getIconSource(
        getNameFromType(type)
      );
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
    this.domainConfigurationTypes.next(this.initialConfigurationNames);
    this.resetToInitialConfiguration();
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

  getIconForName(iconName: string): IconListItem {
    return {
      name: iconName,
      svg: this.getSrcForIcon(iconName),
      isActor: this.checkForActor(iconName),
      isWorkObject: this.checkForWorkObject(iconName),
    };
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

  getInitialConfig() {
    return this.initialConfigurationNames;
  }
}
