import { Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import { IconDictionaryService } from 'src/app/Service/DomainConfiguration/icon-dictionary.service';
import { Dictionary } from 'src/app/Domain/Common/dictionary/dictionary';
import { elementTypes } from 'src/app/Domain/Common/elementTypes';
import {
  CustomDomainConfiguration,
  DomainConfiguration,
  DomainConfigurationForExport,
} from 'src/app/Domain/Common/domainConfiguration';
import { defaultConf } from '../../Domain/Common/iconConfiguration';
import { TitleService } from '../Title/title.service';
import { INITIAL_DOMAIN_NAME } from '../../Domain/Common/constants';

@Injectable({
  providedIn: 'root',
})
export class DomainConfigurationService {
  constructor(
    private iconDictionaryService: IconDictionaryService,
    private elementRegistryService: ElementRegistryService,
    private titleService: TitleService
  ) {}

  public setDomainName(domainName: string): void {
    this.titleService.setDomainName(
      domainName ? domainName : INITIAL_DOMAIN_NAME
    );
  }

  public exportConfiguration(): void {
    const domainConfiguration = this.getCurrentConfiguration();
    if (!domainConfiguration) {
      return;
    }

    const configJSONString = JSON.stringify(domainConfiguration, null, 2);
    const filename = this.titleService.getDomainName();
    const element = document.createElement('a');

    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(configJSONString)
    );
    element.setAttribute('download', filename + '.domain');
    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  public loadConfiguration(
    customConfig: DomainConfiguration,
    updateDomainName = true
  ): void {
    const actorDict = new Dictionary();
    const workObjectDict = new Dictionary();

    actorDict.addEach(customConfig.actors);
    workObjectDict.addEach(customConfig.workObjects);

    const actorKeys = actorDict.keysArray();
    const workObjectKeys = workObjectDict.keysArray();

    this.iconDictionaryService.updateIconRegistries([], [], customConfig);

    this.iconDictionaryService
      .getIconConfiguration()
      .appendSRCFile(actorKeys, actorDict, workObjectKeys, workObjectDict);

    this.iconDictionaryService.addIconsFromDomainConfiguration(
      elementTypes.ACTOR,
      actorKeys.map((a) => elementTypes.ACTOR + a)
    );
    this.iconDictionaryService.addIconsFromDomainConfiguration(
      elementTypes.WORKOBJECT,
      workObjectKeys.map((w) => elementTypes.WORKOBJECT + w)
    );

    if (updateDomainName) {
      const configurationName = customConfig.name;
      this.setDomainName(configurationName);
    }
  }

  public getCurrentConfiguration(): DomainConfiguration | undefined {
    const actors = this.iconDictionaryService.getActorsDictionary();
    const workObjects = this.iconDictionaryService.getWorkObjectsDictionary();

    let domainConfiguration;

    if (actors.size() > 0 && workObjects.size() > 0) {
      domainConfiguration = this.createConfigFromDictionaries(
        actors,
        workObjects
      );
    }
    return domainConfiguration;
  }

  public getCurrentConfigurationForExport():
    | DomainConfigurationForExport
    | undefined {
    const currentConfiguration = this.getCurrentConfiguration();

    if (currentConfiguration) {
      const actors: any = [];
      const workObjects: any = [];

      currentConfiguration.actors.all().forEach((entry) => {
        actors[entry.key] = entry.value;
      });
      currentConfiguration.workObjects.all().forEach((entry) => {
        workObjects[entry.key] = entry.value;
      });

      return {
        name: currentConfiguration.name,
        actors: actors,
        workObjects: workObjects,
      };
    }
    return;
  }

  public getCurrentConfigurationNamesWithoutPrefix(): CustomDomainConfiguration {
    return {
      name: this.titleService.getDomainName() || INITIAL_DOMAIN_NAME,
      actors: this.iconDictionaryService
        .getActorsDictionary()
        .keysArray()
        .map((a) => a.replace(elementTypes.ACTOR, '')),
      workObjects: this.iconDictionaryService
        .getWorkObjectsDictionary()
        .keysArray()
        .map((w) => w.replace(elementTypes.WORKOBJECT, '')),
    };
  }

  public createMinimalConfigurationWithDefaultIcons(): DomainConfiguration {
    const minimalConfig = this.createConfigFromCanvas();

    defaultConf.actors.forEach((iconName) => {
      minimalConfig.actors.add(
        this.iconDictionaryService.getIconSource(iconName),
        iconName
      );
    });
    defaultConf.workObjects.forEach((iconName) => {
      minimalConfig.workObjects.add(
        this.iconDictionaryService.getIconSource(iconName),
        iconName
      );
    });

    return minimalConfig;
  }

  private createConfigFromDictionaries(
    actorsDict: Dictionary,
    workObjectsDict: Dictionary
  ): DomainConfiguration {
    const actorNames = actorsDict.keysArray();
    const workobjectNames = workObjectsDict.keysArray();
    const newActors = new Dictionary();
    const newWorkobjects = new Dictionary();

    // Fill Configuration from Canvas-Objects
    actorNames.forEach((actor) => {
      newActors.add(
        actorsDict.get(actor),
        actor.replace(elementTypes.ACTOR, '')
      );
    });
    workobjectNames.forEach((workObject) => {
      newWorkobjects.add(
        workObjectsDict.get(workObject),
        workObject.replace(elementTypes.WORKOBJECT, '')
      );
    });

    return {
      name: this.titleService.getDomainName(),
      actors: newActors,
      workObjects: newWorkobjects,
    };
  }

  private createConfigFromCanvas(): DomainConfiguration {
    const config = {
      name: INITIAL_DOMAIN_NAME,
      actors: new Dictionary(),
      workObjects: new Dictionary(),
    };

    let allCanvasObjects = this.elementRegistryService.getAllCanvasObjects();

    allCanvasObjects
      .map((e) => e.businessObject)
      .forEach((element) => {
        const type = element.type
          .replace(elementTypes.ACTOR, '')
          .replace(elementTypes.WORKOBJECT, '');
        if (element.type.includes(elementTypes.ACTOR)) {
          let src = this.iconDictionaryService.getIconSource(type) || '';
          config.actors.add(src, type);
        } else if (element.type.includes(elementTypes.WORKOBJECT)) {
          let src = this.iconDictionaryService.getIconSource(type) || '';
          config.workObjects.add(src, type);
        }
      });

    return config;
  }
}
