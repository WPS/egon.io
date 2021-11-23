import { Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/elementRegistry-service/element-registry.service';
import { allIcons } from 'src/app/domain-configuration/domain/allIcons';
import { IconDictionaryService } from 'src/app/domain-configuration/service/icon-dictionary.service';
import { Dictionary, Entry } from 'src/app/common/domain/dictionary/dictionary';
import { elementTypes } from 'src/app/common/domain/elementTypes';
import { DomainConfiguration } from 'src/app/common/domain/domainConfiguration';

@Injectable({
  providedIn: 'root',
})
export class DomainConfigurationService {
  constructor(
    private iconDictionaryService: IconDictionaryService,
    private elementRegistryService: ElementRegistryService
  ) {}

  private domainName: string | undefined = '';

  public getDomainName(): string {
    return this.domainName ? this.domainName : '';
  }

  public setDomainName(domainName: string): void {
    this.domainName = domainName;
  }

  public importConfiguration(config: DomainConfiguration): void {
    const reader = new FileReader();

    reader.onloadend = (e) => {
      if (e && e.target) {
        const domainConfiguration = e.target.result?.toString();
        if (domainConfiguration) {
          this.loadConfiguration(JSON.parse(domainConfiguration));
          if (!this.domainName && config.name.endsWith('.domain')) {
            this.domainName = config.name.replace('.domain', '');
          }
        }
      }
    };
    // @ts-ignore
    reader.readAsText(config);
  }

  public exportConfiguration(): void {
    const domainConfiguration = this.getCurrentConfiguration();
    if (!domainConfiguration) {
      return;
    }

    const configJSONString = JSON.stringify(domainConfiguration);
    const filename = this.getDomainName() || 'domain';
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

  public loadConfiguration(customConfig: DomainConfiguration): void {
    const actorDict = new Dictionary();
    const workObjectDict = new Dictionary();

    const configurationName = customConfig.name;
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

    this.setDomainName(configurationName);
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
        [],
        this.getDomainName()
      );
    }
    return domainConfiguration;
  }

  public getCurrentConfigurationNamesWithPrefix(): DomainConfiguration {
    return {
      name: this.domainName || '',
      actors: this.iconDictionaryService.getActorsDictionary().keysArray(),
      workObjects: this.iconDictionaryService
        .getWorkObjectsDictionary()
        .keysArray(),
    };
  }

  public getCurrentConfigurationNamesWithoutPrefix(): DomainConfiguration {
    return {
      name: this.domainName || '',
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
    domainName?: string,
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
      name: domainName ? domainName : this.domainName ? this.domainName : '',
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
      [],
      ''
    );
    const canvasObjectTypes: string[] = [];
    const currentActors = new Dictionary();
    const currentWorkobjects = new Dictionary();
    const allActors = new Dictionary();
    const allWorkobjects = new Dictionary();
    const newActors: { [key: string]: any } = {};
    const newWorkobjects: { [key: string]: any } = {};

    currentActors.addEach(currentConfig.actors);
    currentWorkobjects.addEach(currentConfig.workObjects);

    currentActors.keysArray().forEach((name: string) => {
      if (!(name in allIcons)) {
        allActors.add(currentActors.get(name), name);
      }
    });

    currentWorkobjects.keysArray().forEach((name) => {
      if (!(name in allIcons)) {
        allWorkobjects.add(currentWorkobjects.get(name), name);
      }
    });

    allCanvasObjects.forEach((object) => {
      const objectType = object.type
        .replace(elementTypes.ACTOR, '')
        .replace(elementTypes.WORKOBJECT, '');
      if (!canvasObjectTypes.includes(objectType)) {
        canvasObjectTypes.push(objectType);
      }
    });

    allActors.keysArray().forEach((key) => {
      if (canvasObjectTypes.includes(key)) {
        newActors[key] = allActors.get(key);
      }
    });

    allWorkobjects.keysArray().forEach((key) => {
      if (canvasObjectTypes.includes(key)) {
        newWorkobjects[key] = allWorkobjects.get(key);
      }
    });

    return {
      name: '',
      actors: newActors,
      workObjects: newWorkobjects,
    };
  }
}
