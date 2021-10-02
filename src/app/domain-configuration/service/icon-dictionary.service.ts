import { Injectable } from '@angular/core';
import { Dictionary, Entry } from 'src/app/common/domain/dictionary/dictionary';
import { elementTypes } from 'src/app/common/domain/elementTypes';
import { getNameFromType } from 'src/app/common/util/naming';
import {
  allIcons,
  appendedIcons,
} from 'src/app/domain-configuration/domain/allIcons';
import {
  defaultConf,
  IconConfiguration,
} from 'src/app/common/domain/iconConfiguration';
import { Configuration } from 'src/app/common/domain/configuration';
import { BusinessObject } from 'src/app/common/domain/businessObject';
import { DomainConfiguration } from 'src/app/common/domain/domainConfiguration';

@Injectable({
  providedIn: 'root',
})
export class IconDictionaryService {
  private prefix = 'icon-domain-story-';

  private actorIconDictionary = new Dictionary();
  private workObjectDictionary = new Dictionary();

  private allIconDictionary = new Dictionary();
  private iconDictionary = new Dictionary();

  private customConfiguration: DomainConfiguration | undefined;

  private readonly iconConfig: IconConfiguration;

  constructor() {
    this.allIconDictionary.addEach(allIcons);
    this.iconConfig = new IconConfiguration(this.allIconDictionary);
  }

  public setCusomtConfiguration(
    customConfiguration: DomainConfiguration
  ): void {
    this.customConfiguration = customConfiguration;
  }

  public getIconConfig(
    domainConfiguration?: DomainConfiguration
  ): Configuration {
    if (domainConfiguration) {
      return this.iconConfig.createCustomConf(true, domainConfiguration);
    }
    if (this.customConfiguration) {
      return this.iconConfig.createCustomConf(
        false,
        this.customConfiguration as DomainConfiguration
      );
    }
    return this.iconConfig.getDefaultConf();
  }

  public getIconConfiguration(): IconConfiguration {
    return this.iconConfig;
  }

  public allInTypeDictionary(
    type: string,
    elements: BusinessObject[]
  ): boolean {
    let collection: Dictionary;
    if (type === elementTypes.ACTOR) {
      collection = this.actorIconDictionary;
    } else if (type === elementTypes.WORKOBJECT) {
      collection = this.workObjectDictionary;
    }

    let allIn = true;
    // @ts-ignore
    if (elements) {
      elements.forEach((element) => {
        if (!collection.has(element.type)) {
          allIn = false;
        }
      });
    } else {
      return false;
    }
    return allIn;
  }

  public registerDomainConfigurationIcons(
    dictionaryType: string,
    iconTypes: string[]
  ): void {
    let collection: Dictionary;
    if (dictionaryType === elementTypes.ACTOR) {
      collection = this.actorIconDictionary;
    } else if (dictionaryType === elementTypes.WORKOBJECT) {
      collection = this.workObjectDictionary;
    }

    const allTypes = new Dictionary();
    allTypes.addEach(allIcons);
    allTypes.appendDict(appendedIcons);

    iconTypes.forEach((type) => {
      if (!collection.has(type)) {
        const name = getNameFromType(type);
        const src = allTypes.get(name);
        if (src) {
          this.registerTypeIcon(dictionaryType, type, src);
          this.registerIcon(type, this.prefix + name.toLowerCase());
        }
      }
    });
  }

  public registerElementIcons(
    dictionaryType: string,
    elements: BusinessObject[]
  ): void {
    this.registerDomainConfigurationIcons(
      dictionaryType,
      elements.map((element) => element.type)
    );
  }

  public registerTypeIcon(type: string, name: string, src: string): void {
    if (!name.includes(type)) {
      name = type + name;
    }

    let collection = new Dictionary();
    if (type === elementTypes.ACTOR) {
      collection = this.actorIconDictionary;
    } else if (type === elementTypes.WORKOBJECT) {
      collection = this.workObjectDictionary;
    }
    collection.set(name, src);
  }

  public getAppendedIconDictionary(): Dictionary {
    const appendedDict = new Dictionary();
    appendedIcons.keysArray().forEach((key) => {
      if (!this.allIconDictionary.has(key)) {
        appendedDict.set(key, appendedIcons.get(key));
      }
    });
    return appendedDict;
  }

  public getFullDictionary(): Dictionary {
    const fullDictionary = new Dictionary();
    fullDictionary.appendDict(this.allIconDictionary);
    fullDictionary.appendDict(this.getAppendedIconDictionary());
    return fullDictionary;
  }

  public isInTypeDictionary(type: string, name: string): boolean {
    if (type === elementTypes.ACTOR) {
      return this.actorIconDictionary.has(name);
    } else if (type === elementTypes.WORKOBJECT) {
      return this.workObjectDictionary.has(name);
    }
    return false;
  }

  public initTypeDictionaries(actors: string[], workObjects: string[]): void {
    if (!actors) {
      actors = defaultConf.actors;
    }
    if (!workObjects) {
      workObjects = defaultConf.workObjects;
    }

    const allTypes = new Dictionary();
    allTypes.addEach(allIcons);
    allTypes.appendDict(this.getAppendedIconDictionary());

    for (const actor of actors) {
      const key = elementTypes.ACTOR + actor;
      this.actorIconDictionary.add(allTypes.get(actor), key);
    }

    this.actorIconDictionary.keysArray().forEach((actor) => {
      const name = getNameFromType(actor);
      this.registerIcon(actor, 'icon-domain-story-' + name.toLowerCase());
    });

    for (const workObject of workObjects) {
      const key = elementTypes.WORKOBJECT + workObject;
      this.workObjectDictionary.add(allTypes.get(workObject), key);
    }

    this.workObjectDictionary.keysArray().forEach((workObject) => {
      const name = getNameFromType(workObject);
      this.registerIcon(workObject, 'icon-domain-story-' + name.toLowerCase());
    });
  }

  public getTypeDictionary(type: string): Dictionary {
    if (type === elementTypes.ACTOR) {
      return this.actorIconDictionary;
    } else if (type === elementTypes.WORKOBJECT) {
      return this.workObjectDictionary;
    }
    return new Dictionary();
  }

  public getTypeDictionaryKeys(type: string): string[] {
    if (type === elementTypes.ACTOR) {
      return this.actorIconDictionary.keysArray();
    } else if (type === elementTypes.WORKOBJECT) {
      return this.workObjectDictionary.keysArray();
    }

    return [];
  }

  public getTypeIconSRC(type: string, name: string): string | null {
    if (type === elementTypes.ACTOR) {
      if (!name.startsWith(elementTypes.ACTOR)) {
        name = elementTypes.ACTOR + name;
      }
      return this.actorIconDictionary.get(name);
    } else if (type === elementTypes.WORKOBJECT) {
      if (!name.startsWith(elementTypes.WORKOBJECT)) {
        name = elementTypes.WORKOBJECT + name;
      }
      return this.workObjectDictionary.get(name);
    }
    return null;
  }

  public getIconSource(name: string): string | null {
    if (this.allIconDictionary.has(name)) {
      return this.allIconDictionary.get(name);
    } else if (appendedIcons.has(name)) {
      return appendedIcons.get(name);
    }
    return null;
  }

  public getAllIconDictionary(): Dictionary {
    return this.allIconDictionary;
  }

  public getActorsDictionary(): Dictionary {
    return this.actorIconDictionary;
  }

  public getWorkObjectsDictionary(): Dictionary {
    return this.workObjectDictionary;
  }

  public addIMGToIconDictionary(
    input: string | ArrayBuffer | null,
    name: string
  ): void {
    appendedIcons.set(name, input);
  }

  public registerIcon(name: string, src: string): void {
    this.iconDictionary.set(name, src);
  }

  public getIconForType(type: string): string | null {
    return this.iconDictionary.get(type);
  }
}
