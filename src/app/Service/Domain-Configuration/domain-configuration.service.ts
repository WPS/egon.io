import { Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import { allIcons } from 'src/app/Domain/Domain-Configuration/allIcons';
import { IconDictionaryService } from 'src/app/Service/Domain-Configuration/icon-dictionary.service';
import { Dictionary } from 'src/app/Domain/Common/dictionary/dictionary';
import { elementTypes } from 'src/app/Domain/Common/elementTypes';
import {
  CustomDomainCofiguration,
  DomainConfiguration,
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

    const configJSONString = JSON.stringify(domainConfiguration);
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

    this.iconDictionaryService
      .getIconConfiguration()
      .appendSRCFile(actorKeys, actorDict, workObjectKeys, workObjectDict);

    this.iconDictionaryService.registerDomainConfigurationIcons(
      elementTypes.ACTOR,
      actorKeys.map((a) => elementTypes.ACTOR + a)
    );
    this.iconDictionaryService.registerDomainConfigurationIcons(
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
        [],
        workObjects,
        []
      );
    }
    return domainConfiguration;
  }

  public getCurrentConfigurationNamesWithPrefix(): DomainConfiguration {
    return {
      name: this.titleService.getDomainName() || INITIAL_DOMAIN_NAME,
      actors: this.iconDictionaryService.getActorsDictionary().keysArray(),
      workObjects: this.iconDictionaryService
        .getWorkObjectsDictionary()
        .keysArray(),
    };
  }

  public getCurrentConfigurationNamesWithoutPrefix(): CustomDomainCofiguration {
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

  private createConfigFromDictionaries(
    actorsDict: Dictionary,
    actorOrder: string[] | undefined,
    workObjectsDict: Dictionary,
    workobjectOrder: string[] | undefined,
    config?: DomainConfiguration
  ): DomainConfiguration {
    const actors = actorsDict.keysArray();
    const workObjects = workObjectsDict.keysArray();
    const actorsJSON: { [key: string]: any } = {};
    const workObjectJSON: { [key: string]: any } = {};

    if (actorOrder) {
      actorOrder.forEach((actor: string) => {
        actorsJSON[actor.replace(elementTypes.ACTOR, '')] =
          actorsDict.get(actor);
      });
    }
    if (workobjectOrder) {
      workobjectOrder.forEach((workObject: string) => {
        workObjectJSON[workObject.replace(elementTypes.WORKOBJECT, '')] =
          workObjectsDict.get(workObject);
      });
    }

    actors.forEach((actor) => {
      if (!actorOrder || !actorOrder.includes(actor)) {
        actorsJSON[actor.replace(elementTypes.ACTOR, '')] =
          actorsDict.get(actor);
      }
    });

    workObjects.forEach((workObject) => {
      if (!workobjectOrder || !workobjectOrder.includes(workObject)) {
        workObjectJSON[workObject.replace(elementTypes.WORKOBJECT, '')] =
          workObjectsDict.get(workObject);
      }
    });

    if (config) {
      Object.keys(config.actors).forEach((actor: string) => {
        actorsJSON[actor.replace(elementTypes.ACTOR, '')] =
          actorsDict.get(actor);
      });
      Object.keys(config.workObjects).forEach((workObject: string) => {
        workObjectJSON[workObject.replace(elementTypes.ACTOR, '')] =
          actorsDict.get(workObject);
      });
    }

    return {
      name: this.titleService.getDomainName(),
      actors: actorsJSON,
      workObjects: workObjectJSON,
    };
  }

  public createDefaultConfig(): DomainConfiguration {
    const allCanvasObjects = this.elementRegistryService.getAllCanvasObjects();

    const currentConfig = this.createConfigFromDictionaries(
      this.iconDictionaryService.getActorsDictionary(),
      [],
      this.iconDictionaryService.getWorkObjectsDictionary(),
      []
    );

    const defaultActors = new Dictionary();
    const defaultWorkobjects = new Dictionary();

    const canvasObjectTypes: string[] = [];
    const currentActors = new Dictionary();
    const currentWorkobjects = new Dictionary();
    const allActors = new Dictionary();
    const allWorkobjects = new Dictionary();
    const newActors = new Dictionary();
    const newWorkobjects = new Dictionary();

    // Setup
    currentActors.addEach(currentConfig.actors);
    currentWorkobjects.addEach(currentConfig.workObjects);

    this.fillDictionary(currentActors, allActors);
    this.fillDictionary(currentWorkobjects, allWorkobjects);

    allCanvasObjects.forEach((object) => {
      const objectType = object.type
        .replace(elementTypes.ACTOR, '')
        .replace(elementTypes.WORKOBJECT, '');
      if (!canvasObjectTypes.includes(objectType)) {
        canvasObjectTypes.push(objectType);
      }
    });

    defaultConf.actors.forEach((a) => {
      defaultActors.add(allActors.get(a), a);
    });
    defaultConf.workObjects.forEach((a) => {
      defaultWorkobjects.add(allActors.get(a), a);
    });

    // Excecution
    this.titleService.setDomainName(INITIAL_DOMAIN_NAME);

    allActors.keysArray().forEach((key) => {
      if (canvasObjectTypes.includes(key)) {
        newActors.add(allActors.get(key), key);
      }
    });

    allWorkobjects.keysArray().forEach((key) => {
      if (canvasObjectTypes.includes(key)) {
        newWorkobjects.add(allWorkobjects.get(key), key);
      }
    });

    newActors.appendDict(defaultActors);
    newWorkobjects.appendDict(defaultWorkobjects);

    return {
      name: INITIAL_DOMAIN_NAME,
      actors: newActors,
      workObjects: newWorkobjects,
    };
  }

  private fillDictionary(current: Dictionary, all: Dictionary) {
    current.keysArray().forEach((name: string) => {
      if (!(name in allIcons)) {
        all.add(current.get(name), name);
      }
    });
  }
}
