import { Injectable } from '@angular/core';
import { Dictionary } from 'src/app/Domain/Common/dictionary/dictionary';
import { elementTypes } from 'src/app/Domain/Common/elementTypes';
import { getNameFromType } from 'src/app/Utils/naming';
import {
  allIcons,
  appendedIcons,
} from 'src/app/Domain/Domain-Configuration/allIcons';
import {
  defaultConf,
  IconConfiguration,
} from 'src/app/Domain/Common/iconConfiguration';
import { Configuration } from 'src/app/Domain/Common/configuration';
import { BusinessObject } from 'src/app/Domain/Common/businessObject';
import { DomainConfiguration } from 'src/app/Domain/Common/domainConfiguration';
import { sanitizeIconName } from '../../Utils/sanitizer';

export const ICON_PREFIX = 'icon-domain-story-';

@Injectable({
  providedIn: 'root',
})
export class IconDictionaryService {
  private actorIconDictionary = new Dictionary();
  private workObjectDictionary = new Dictionary();

  private allIconDictionary = new Dictionary();
  private iconDictionaryForBPMN = new Dictionary();

  private customConfiguration?: DomainConfiguration;

  private readonly iconConfig: IconConfiguration;

  constructor() {
    this.allIconDictionary.addEach(allIcons);
    this.iconConfig = new IconConfiguration(this.allIconDictionary);
  }

  initTypeDictionaries(actors: string[], workObjects: string[]): void {
    if (!actors || actors.length == 0) {
      actors = defaultConf.actors;
    }
    if (!workObjects || workObjects.length == 0) {
      workObjects = defaultConf.workObjects;
    }

    const allTypes = new Dictionary();
    allTypes.addEach(allIcons);
    allTypes.appendDict(this.getAppendedIconDictionary());

    this.initDictionary(
      actors,
      allTypes,
      this.actorIconDictionary,
      elementTypes.ACTOR
    );
    this.initDictionary(
      workObjects,
      allTypes,
      this.workObjectDictionary,
      elementTypes.WORKOBJECT
    );
  }

  private initDictionary(
    keys: string[],
    allTypes: Dictionary,
    dictionary: Dictionary,
    namePrefix: elementTypes
  ) {
    dictionary.clear();
    for (const key of keys) {
      const name = namePrefix + key;
      dictionary.add(allTypes.get(key), name);
    }

    dictionary.keysArray().forEach((entry) => {
      const name = getNameFromType(entry);
      this.registerIconForBPMN(
        entry,
        ICON_PREFIX + sanitizeIconName(name.toLowerCase())
      );
    });
  }

  getCurrentIconConfigurationForBPMN(): Configuration {
    if (this.customConfiguration) {
      return this.iconConfig.createCustomConf(this.customConfiguration);
    }
    return this.iconConfig.getDefaultConf();
  }

  allInTypeDictionary(type: elementTypes, elements: BusinessObject[]): boolean {
    let collection: Dictionary;
    if (type === elementTypes.ACTOR) {
      collection = this.actorIconDictionary;
    } else if (type === elementTypes.WORKOBJECT) {
      collection = this.workObjectDictionary;
    }

    let allIn = true;
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

  /** Load Icons from Configuration **/

  addIconsFromDomainConfiguration(
    dictionaryType: elementTypes,
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
          this.registerIconForType(dictionaryType, type, src);
          this.registerIconForBPMN(
            type,
            sanitizeIconName(ICON_PREFIX + name.toLowerCase())
          );
        }
      }
    });
  }

  /** Add Icon(s) to Dictionary **/
  registerIconForBPMN(name: string, src: string): void {
    this.iconDictionaryForBPMN.set(name, src);
  }

  addIconsToTypeDictionary(
    actorIcons: BusinessObject[],
    workObjectIcons: BusinessObject[]
  ) {
    if (!this.allInTypeDictionary(elementTypes.ACTOR, actorIcons)) {
      this.addIconsFromDomainConfiguration(
        elementTypes.ACTOR,
        actorIcons.map((element) => element.type)
      );
    }
    if (!this.allInTypeDictionary(elementTypes.WORKOBJECT, workObjectIcons)) {
      this.addIconsFromDomainConfiguration(
        elementTypes.WORKOBJECT,
        workObjectIcons.map((element) => element.type)
      );
    }
  }

  registerIconForType(type: elementTypes, name: string, src: string): void {
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

  updateIconRegistries(
    actors: BusinessObject[],
    workObjects: BusinessObject[],
    config: DomainConfiguration
  ): void {
    const elements: BusinessObject[] = [];

    actors.forEach((a) => elements.push(a));
    workObjects.forEach((w) => elements.push(w));

    const customIcons = new Dictionary();

    const actorsDict = new Dictionary();
    const workObjectsDict = new Dictionary();
    config.actors.keysArray().forEach((key) => {
      actorsDict.add(config.actors.get(key), key);
    });
    config.workObjects.keysArray().forEach((key) => {
      workObjectsDict.add(config.workObjects.get(key), key);
    });

    this.extractCustomIconsFromDictionary(actorsDict, customIcons);
    this.extractCustomIconsFromDictionary(workObjectsDict, customIcons);

    elements.forEach((element) => {
      const name = sanitizeIconName(
        element.type
          .replace(elementTypes.ACTOR, '')
          .replace(elementTypes.WORKOBJECT, '')
      );
      if (
        (element.type.includes(elementTypes.ACTOR) ||
          element.type.includes(elementTypes.WORKOBJECT)) &&
        !this.getFullDictionary().has(name)
      ) {
        this.registerIconForBPMN(
          ICON_PREFIX + name.toLowerCase(),
          element.type
        );
      }
    });

    this.addNewIconsToDictionary(customIcons);
    this.addIconsToTypeDictionary(actors, workObjects);
  }

  private extractCustomIconsFromDictionary(
    elementDictionary: Dictionary,
    customIcons: Dictionary
  ) {
    elementDictionary.keysArray().forEach((name) => {
      const sanitizedName = sanitizeIconName(name);
      if (!this.getFullDictionary().has(sanitizedName)) {
        customIcons.add(elementDictionary.get(name), sanitizedName);
      }
    });
  }

  /** Add new Icon(s) **/

  addNewIconsToDictionary(customIcons: Dictionary) {
    customIcons.keysArray().forEach((key) => {
      const custom = customIcons.get(key);
      this.addIMGToIconDictionary(custom.src, key);
    });
    this.addIconsToCss(customIcons);
  }

  addIMGToIconDictionary(input: string, name: string): void {
    appendedIcons.set(name, input);
  }

  addIconsToCss(customIcons: Dictionary) {
    const sheetEl = document.getElementById('iconsCss');
    customIcons.keysArray().forEach((key) => {
      const src = customIcons.get(key);
      const iconStyle =
        '.' +
        ICON_PREFIX +
        sanitizeIconName(key.toLowerCase()) +
        '::before{ content: url("data:image/svg+xml;utf8,' +
        this.wrapSRCInSVG(src) +
        '"); margin: 3px;}';
      // @ts-ignore
      sheetEl?.sheet?.insertRule(iconStyle, sheetEl.sheet.cssRules.length);
    });
  }

  private wrapSRCInSVG(src: string): string {
    return (
      "<svg viewBox='0 0 22 22' width='22' height='22' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><image width='22' height='22' xlink:href='" +
      src +
      "'/></svg>"
    );
  }

  /** Getter & Setter **/

  getFullDictionary(): Dictionary {
    const fullDictionary = new Dictionary();
    fullDictionary.appendDict(this.allIconDictionary);
    fullDictionary.appendDict(this.getAppendedIconDictionary());
    return fullDictionary;
  }

  getAppendedIconDictionary(): Dictionary {
    const appendedDict = new Dictionary();
    appendedIcons.keysArray().forEach((key) => {
      if (!this.allIconDictionary.has(key)) {
        appendedDict.set(key, appendedIcons.get(key));
      }
    });
    return appendedDict;
  }

  getTypeDictionary(type: elementTypes): Dictionary {
    if (type === elementTypes.ACTOR) {
      return this.actorIconDictionary;
    } else if (type === elementTypes.WORKOBJECT) {
      return this.workObjectDictionary;
    }
    return new Dictionary();
  }

  getTypeDictionaryKeys(type: elementTypes): string[] {
    return this.getTypeDictionary(type).keysArray();
  }

  getTypeIconSRC(type: elementTypes, name: string): string | null {
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

  getIconForBPMN(type: elementTypes): string | null {
    return this.iconDictionaryForBPMN.get(type);
  }

  getIconSource(name: string): string | null {
    if (this.allIconDictionary.has(name)) {
      return this.allIconDictionary.get(name);
    } else if (appendedIcons.has(name)) {
      return appendedIcons.get(name);
    }
    return null;
  }

  getElementsOfType(
    elements: BusinessObject[],
    type: elementTypes
  ): BusinessObject[] {
    const elementOfType: any = [];
    elements.forEach((element) => {
      if (element.type.includes(type)) {
        elementOfType.push(element);
      }
    });
    return elementOfType;
  }

  getAllIconDictionary(): Dictionary {
    return this.allIconDictionary;
  }

  getActorsDictionary(): Dictionary {
    return this.actorIconDictionary;
  }

  getWorkObjectsDictionary(): Dictionary {
    return this.workObjectDictionary;
  }

  getIconConfiguration(): IconConfiguration {
    return this.iconConfig;
  }

  setCusomtConfiguration(customConfiguration: DomainConfiguration): void {
    this.customConfiguration = customConfiguration;
  }
}
