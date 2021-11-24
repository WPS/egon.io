import { Injectable } from '@angular/core';
import { Dictionary } from 'src/app/common/domain/dictionary/dictionary';
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
import {
  CustomDomainCofiguration,
  DomainConfiguration,
} from 'src/app/common/domain/domainConfiguration';

export const ICON_PREFIX = 'icon-domain-story-';

@Injectable({
  providedIn: 'root',
})
export class IconDictionaryService {
  private actorIconDictionary = new Dictionary();
  private workObjectDictionary = new Dictionary();

  private allIconDictionary = new Dictionary();
  private iconDictionary = new Dictionary();

  private customConfiguration:
    | CustomDomainCofiguration
    | DomainConfiguration
    | undefined;

  private readonly iconConfig: IconConfiguration;

  constructor() {
    this.allIconDictionary.addEach(allIcons);
    this.iconConfig = new IconConfiguration(this.allIconDictionary);
  }

  public setCusomtConfiguration(
    customConfiguration: CustomDomainCofiguration | DomainConfiguration
  ): void {
    this.customConfiguration = customConfiguration;
  }

  public getIconConfig(
    domainConfiguration?: CustomDomainCofiguration
  ): Configuration {
    if (domainConfiguration) {
      return this.iconConfig.createCustomConf(true, domainConfiguration);
    }
    if (this.customConfiguration) {
      return this.iconConfig.createCustomConf(
        false,
        this.customConfiguration as CustomDomainCofiguration
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
          this.registerIcon(type, ICON_PREFIX + name.toLowerCase());
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
      this.registerIcon(actor, ICON_PREFIX + name.toLowerCase());
    });

    for (const workObject of workObjects) {
      const key = elementTypes.WORKOBJECT + workObject;
      this.workObjectDictionary.add(allTypes.get(workObject), key);
    }

    this.workObjectDictionary.keysArray().forEach((workObject) => {
      const name = getNameFromType(workObject);
      this.registerIcon(workObject, ICON_PREFIX + name.toLowerCase());
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

  addIconsToCss(customIcons: { name: string; src: string }[]) {
    console.log(customIcons);
    const sheetEl = document.getElementById('iconsCss');
    customIcons.forEach((custom) => {
      const iconStyle =
        '.' +
        ICON_PREFIX +
        custom.name.toLowerCase() +
        '::before{' +
        ' content: url("data:image/svg+xml;utf8,' +
        this.wrapSRCInSVG(custom.src) +
        '");' +
        ' margin: 3px;}';
      // @ts-ignore
      sheetEl.sheet.insertRule(iconStyle, sheetEl.sheet.cssRules.length);
    });
    // @ts-ignore

    console.log(sheetEl.sheet);
  }

  private wrapSRCInSVG(src: string): string {
    // @ts-ignore
    return (
      "<svg viewBox='0 0 22 22' width='22' height='22' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><image width='22' height='22' xlink:href='" +
      src +
      "'/></svg>"
    );
  }

  addIconsToTypeDictionary(
    actorIcons: BusinessObject[],
    workObjectIcons: BusinessObject[]
  ) {
    if (!this.allInTypeDictionary(elementTypes.ACTOR, actorIcons)) {
      this.registerElementIcons(elementTypes.ACTOR, actorIcons);
    }
    if (!this.allInTypeDictionary(elementTypes.WORKOBJECT, workObjectIcons)) {
      this.registerElementIcons(elementTypes.WORKOBJECT, workObjectIcons);
    }
  }
}
