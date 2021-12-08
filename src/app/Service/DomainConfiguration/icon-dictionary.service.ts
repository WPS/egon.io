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
  private iconDictionaryForBPMN = new Dictionary();

  private customConfiguration?: DomainConfiguration;

  private readonly iconConfig: IconConfiguration;

  constructor() {
    this.allIconDictionary.addEach(allIcons);
    this.iconConfig = new IconConfiguration(this.allIconDictionary);
  }

  public initTypeDictionaries(actors: string[], workObjects: string[]): void {
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

  public getCurrentIconConfigurationForBPMN(): Configuration {
    if (this.customConfiguration) {
      return this.iconConfig.createCustomConf(this.customConfiguration);
    }
    return this.iconConfig.getDefaultConf();
  }

  public allInTypeDictionary(
    type: elementTypes,
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

  /** Load Icons from Configuration **/

  public addIconsFromDomainConfiguration(
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
  public registerIconForBPMN(name: string, src: string): void {
    this.iconDictionaryForBPMN.set(name, src);
  }

  public addIconsToTypeDictionary(
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

  public registerIconForType(
    type: elementTypes,
    name: string,
    src: string
  ): void {
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

  public updateIconRegistries(
    actorIcons: BusinessObject[],
    workObjectIcons: BusinessObject[],
    config: DomainConfiguration
  ): void {
    const elements: BusinessObject[] = [];

    actorIcons.forEach((a) => elements.push(a));
    workObjectIcons.forEach((w) => elements.push(w));

    const customIcons: { name: string; src: string }[] = [];

    const actors = new Dictionary();
    const workobjects = new Dictionary();
    config.actors.keysArray().forEach((key) => {
      actors.add(config.actors.get(key), key);
    });
    config.workObjects.keysArray().forEach((key) => {
      workobjects.add(config.workObjects.get(key), key);
    });

    this.extractCustomIconsFromDictionary(actors, customIcons);
    this.extractCustomIconsFromDictionary(workobjects, customIcons);

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
    this.addIconsToTypeDictionary(actorIcons, workObjectIcons);
  }

  private extractCustomIconsFromDictionary(
    elementDictionary: Dictionary,
    customIcons: { name: string; src: string }[]
  ) {
    elementDictionary.keysArray().forEach((name) => {
      const sanitizedName = sanitizeIconName(name);
      if (!this.getFullDictionary().has(sanitizedName)) {
        customIcons.push({
          name: sanitizedName,
          src: elementDictionary.get(name),
        });
      }
    });
  }

  /** Add new Icon(s) **/

  public addNewIconsToDictionary(customIcons: { name: string; src: string }[]) {
    customIcons.forEach((custom) =>
      this.addIMGToIconDictionary(custom.src, custom.name)
    );
    this.addIconsToCss(customIcons);
  }

  public addIMGToIconDictionary(
    input: string | ArrayBuffer | null,
    name: string
  ): void {
    appendedIcons.set(name, input);
  }

  public addIconsToCss(customIcons: { name: string; src: string }[]) {
    const sheetEl = document.getElementById('iconsCss');
    customIcons.forEach((custom) => {
      const iconStyle =
        '.' +
        ICON_PREFIX +
        sanitizeIconName(custom.name.toLowerCase()) +
        '::before{ content: url("data:image/svg+xml;utf8,' +
        this.wrapSRCInSVG(custom.src) +
        '"); margin: 3px;}';
      // @ts-ignore
      sheetEl.sheet.insertRule(iconStyle, sheetEl.sheet.cssRules.length);
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

  public getFullDictionary(): Dictionary {
    const fullDictionary = new Dictionary();
    fullDictionary.appendDict(this.allIconDictionary);
    fullDictionary.appendDict(this.getAppendedIconDictionary());
    return fullDictionary;
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

  public getTypeDictionary(type: elementTypes): Dictionary {
    if (type === elementTypes.ACTOR) {
      return this.actorIconDictionary;
    } else if (type === elementTypes.WORKOBJECT) {
      return this.workObjectDictionary;
    }
    return new Dictionary();
  }

  public getTypeDictionaryKeys(type: elementTypes): string[] {
    return this.getTypeDictionary(type).keysArray();
  }

  public getTypeIconSRC(type: elementTypes, name: string): string | null {
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

  public getIconForBPMN(type: elementTypes): string | null {
    return this.iconDictionaryForBPMN.get(type);
  }

  public getIconSource(name: string): string | null {
    if (this.allIconDictionary.has(name)) {
      return this.allIconDictionary.get(name);
    } else if (appendedIcons.has(name)) {
      return appendedIcons.get(name);
    }
    return null;
  }

  public getElementsOfType(
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

  public getAllIconDictionary(): Dictionary {
    return this.allIconDictionary;
  }

  public getActorsDictionary(): Dictionary {
    return this.actorIconDictionary;
  }

  public getWorkObjectsDictionary(): Dictionary {
    return this.workObjectDictionary;
  }

  public getIconConfiguration(): IconConfiguration {
    return this.iconConfig;
  }

  public setCusomtConfiguration(
    customConfiguration: DomainConfiguration
  ): void {
    this.customConfiguration = customConfiguration;
  }
}
