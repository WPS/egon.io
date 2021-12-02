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
import {
  CustomDomainCofiguration,
  DomainConfiguration,
} from 'src/app/Domain/Common/domainConfiguration';
import { sanitizeIconName } from '../../Utils/sanitizer';

export const ICON_PREFIX = 'icon-domain-story-';

@Injectable({
  providedIn: 'root',
})
export class IconDictionaryService {
  private actorIconDictionary = new Dictionary();
  private workObjectDictionary = new Dictionary();

  private allIconDictionary = new Dictionary();
  private iconDictionary = new Dictionary();

  private customConfiguration?: CustomDomainCofiguration | DomainConfiguration;

  private iconConfig: IconConfiguration;

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
          this.registerIcon(
            type,
            sanitizeIconName(ICON_PREFIX + name.toLowerCase())
          );
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
    namePrefix: string
  ) {
    dictionary.clear();
    for (const key of keys) {
      const name = namePrefix + key;
      dictionary.add(allTypes.get(key), name);
    }

    dictionary.keysArray().forEach((entry) => {
      const name = getNameFromType(entry);
      this.registerIcon(
        entry,
        ICON_PREFIX + sanitizeIconName(name.toLowerCase())
      );
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
    return this.getTypeDictionary(type).keysArray();
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

  public addIconsToCss(customIcons: { name: string; src: string }[]) {
    const sheetEl = document.getElementById('iconsCss');
    customIcons.forEach((custom) => {
      const iconStyle =
        '.' +
        ICON_PREFIX +
        sanitizeIconName(custom.name.toLowerCase()) +
        '::before{' +
        ' content: url("data:image/svg+xml;utf8,' +
        this.wrapSRCInSVG(custom.src) +
        '");' +
        ' margin: 3px;}';
      // @ts-ignore
      sheetEl.sheet.insertRule(iconStyle, sheetEl.sheet.cssRules.length);
    });
  }

  private wrapSRCInSVG(src: string): string {
    // @ts-ignore
    return (
      "<svg viewBox='0 0 22 22' width='22' height='22' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><image width='22' height='22' xlink:href='" +
      src +
      "'/></svg>"
    );
  }

  public addIconsToTypeDictionary(
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

  public addNewIconsToDictionary(customIcons: { name: string; src: string }[]) {
    customIcons.forEach((custom) =>
      this.addIMGToIconDictionary(custom.src, custom.name)
    );
    this.addIconsToCss(customIcons);
  }
}
