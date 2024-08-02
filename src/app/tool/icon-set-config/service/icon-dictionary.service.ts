import { Injectable } from '@angular/core';
import { BusinessObject } from 'src/app/Domain/Common/businessObject';
import { Configuration } from 'src/app/Domain/Common/configuration';
import { Dictionary } from 'src/app/Domain/Common/dictionary/dictionary';
import { IconSetConfiguration } from 'src/app/Domain/Icon-Set-Configuration/iconSetConfiguration';
import { ElementTypes } from 'src/app/Domain/Common/elementTypes';
import {
  defaultConf,
  IconConfiguration,
} from 'src/app/tool/icon-set-config/domain/iconConfiguration';
import {
  allIcons,
  appendedIcons,
} from 'src/app/tool/icon-set-config/domain/allIcons';
import { sanitizeIconName } from '../../../Utils/sanitizer';
import getIconId = ElementTypes.getIconId;

export const ICON_PREFIX = 'icon-domain-story-';

@Injectable({
  providedIn: 'root',
})
export class IconDictionaryService {
  private actorIconDictionary = new Dictionary();
  private workObjectDictionary = new Dictionary();

  private allIconDictionary = new Dictionary();
  private iconDictionaryForBPMN = new Dictionary();

  private customConfiguration?: IconSetConfiguration;

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
      ElementTypes.ACTOR,
    );
    this.initDictionary(
      workObjects,
      allTypes,
      this.workObjectDictionary,
      ElementTypes.WORKOBJECT,
    );
  }

  private initDictionary(
    keys: string[],
    allTypes: Dictionary,
    dictionary: Dictionary,
    elementType: ElementTypes,
  ) {
    dictionary.clear();
    for (const key of keys) {
      dictionary.add(allTypes.get(key), key);
    }

    dictionary.keysArray().forEach((name) => {
      this.registerIconForBPMN(
        name,
        ICON_PREFIX + sanitizeIconName(name.toLowerCase()),
        elementType,
      );
    });
  }

  getCurrentIconConfigurationForBPMN(): Configuration {
    if (this.customConfiguration) {
      return this.iconConfig.createCustomConf(this.customConfiguration);
    }
    return this.iconConfig.getDefaultConf();
  }

  allInTypeDictionary(type: ElementTypes, elements: BusinessObject[]): boolean {
    let collection: Dictionary;
    if (type === ElementTypes.ACTOR) {
      collection = this.actorIconDictionary;
    } else if (type === ElementTypes.WORKOBJECT) {
      collection = this.workObjectDictionary;
    }

    let allIn = true;
    if (elements) {
      elements.forEach((element) => {
        if (!collection.has(getIconId(element.type))) {
          allIn = false;
        }
      });
    } else {
      return false;
    }
    return allIn;
  }

  /** Load Icons from Configuration **/
  addIconsFromIconSetConfiguration(
    dictionaryType: ElementTypes,
    iconTypes: string[],
  ): void {
    let collection: Dictionary;
    if (dictionaryType === ElementTypes.ACTOR) {
      collection = this.actorIconDictionary;
    } else if (dictionaryType === ElementTypes.WORKOBJECT) {
      collection = this.workObjectDictionary;
    }

    const allTypes = new Dictionary();
    allTypes.addEach(allIcons);
    allTypes.appendDict(appendedIcons);

    iconTypes.forEach((name) => {
      if (!collection.has(name)) {
        const src = allTypes.get(name);
        if (src) {
          this.registerIconForType(dictionaryType, name, src);
          this.registerIconForBPMN(
            name,
            sanitizeIconName(ICON_PREFIX + name.toLowerCase()),
            dictionaryType,
          );
        }
      }
    });
  }

  /** Add Icon(s) to Dictionary **/
  registerIconForBPMN(
    name: string,
    src: string,
    elementType: ElementTypes,
  ): void {
    if (name.includes(elementType)) {
      throw new Error('Should not include elementType');
    }

    this.iconDictionaryForBPMN.set(`${elementType}${name}`, src);
  }

  addIconsToTypeDictionary(
    actorIcons: BusinessObject[],
    workObjectIcons: BusinessObject[],
  ) {
    if (!this.allInTypeDictionary(ElementTypes.ACTOR, actorIcons)) {
      this.addIconsFromIconSetConfiguration(
        ElementTypes.ACTOR,
        actorIcons.map((element) => getIconId(element.type)),
      );
    }
    if (!this.allInTypeDictionary(ElementTypes.WORKOBJECT, workObjectIcons)) {
      this.addIconsFromIconSetConfiguration(
        ElementTypes.WORKOBJECT,
        workObjectIcons.map((element) => getIconId(element.type)),
      );
    }
  }

  registerIconForType(type: ElementTypes, name: string, src: string): void {
    if (name.includes(type)) {
      throw new Error('Name should not include type!');
    }

    let collection = new Dictionary();
    if (type === ElementTypes.ACTOR) {
      collection = this.actorIconDictionary;
    } else if (type === ElementTypes.WORKOBJECT) {
      collection = this.workObjectDictionary;
    }
    collection.add(src, name);
  }

  unregisterIconForType(type: ElementTypes, name: string): void {
    if (name.includes(type)) {
      throw new Error('Name should not include type!');
    }

    let collection = new Dictionary();
    if (type === ElementTypes.ACTOR) {
      collection = this.actorIconDictionary;
    } else if (type === ElementTypes.WORKOBJECT) {
      collection = this.workObjectDictionary;
    }
    collection.delete(name);
  }

  updateIconRegistries(
    actors: BusinessObject[],
    workObjects: BusinessObject[],
    config: IconSetConfiguration,
  ): void {
    const elements: BusinessObject[] = [];

    actors.forEach((a) => elements.push(a));
    workObjects.forEach((w) => elements.push(w));

    const customIcons = new Dictionary();

    const actorsDict = new Dictionary();
    const workObjectsDict = new Dictionary();
    config.actors.keysArray().forEach((key) => {
      actorsDict.set(key, config.actors.get(key));
    });
    config.workObjects.keysArray().forEach((key) => {
      workObjectsDict.set(key, config.workObjects.get(key));
    });

    this.extractCustomIconsFromDictionary(actorsDict, customIcons);
    this.extractCustomIconsFromDictionary(workObjectsDict, customIcons);

    elements.forEach((element) => {
      const name = sanitizeIconName(
        element.type
          .replace(ElementTypes.ACTOR, '')
          .replace(ElementTypes.WORKOBJECT, ''),
      );
      if (
        (element.type.includes(ElementTypes.ACTOR) ||
          element.type.includes(ElementTypes.WORKOBJECT)) &&
        !this.getFullDictionary().has(name)
      ) {
        let elementType;
        if (element.type.includes(ElementTypes.ACTOR)) {
          elementType = ElementTypes.ACTOR;
        } else {
          elementType = ElementTypes.WORKOBJECT;
        }
        this.registerIconForBPMN(
          ICON_PREFIX + name.toLowerCase(),
          getIconId(element.type),
          elementType,
        );
      }
    });

    this.addNewIconsToDictionary(customIcons);
    this.addIconsToTypeDictionary(actors, workObjects);
  }

  private extractCustomIconsFromDictionary(
    elementDictionary: Dictionary,
    customIcons: Dictionary,
  ) {
    elementDictionary.keysArray().forEach((name) => {
      const sanitizedName = sanitizeIconName(name);
      if (!this.getFullDictionary().has(sanitizedName)) {
        customIcons.add(elementDictionary.get(name), sanitizedName);
      }
    });
  }

  /** Add new Icon(s) **/

  private addNewIconsToDictionary(customIcons: Dictionary) {
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

  getTypeDictionary(type: ElementTypes): Dictionary {
    if (type === ElementTypes.ACTOR) {
      return this.actorIconDictionary;
    } else if (type === ElementTypes.WORKOBJECT) {
      return this.workObjectDictionary;
    }
    return new Dictionary();
  }

  getTypeDictionaryKeys(type: ElementTypes): string[] {
    return this.getTypeDictionary(type).keysArray();
  }

  getTypeIconSRC(type: ElementTypes, name: string): string | null {
    if (type === ElementTypes.ACTOR) {
      return this.actorIconDictionary.get(name);
    } else if (type === ElementTypes.WORKOBJECT) {
      return this.workObjectDictionary.get(name);
    }
    return null;
  }

  getIconForBPMN(elementType: ElementTypes, name: string): string | null {
    return this.iconDictionaryForBPMN.get(`${elementType}${name}`);
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
    type: ElementTypes,
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

  setCustomConfiguration(customConfiguration: IconSetConfiguration): void {
    this.customConfiguration = customConfiguration;
  }
}
