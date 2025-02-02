import { Injectable } from '@angular/core';
import { BusinessObject } from 'src/app/domain/entities/businessObject';
import {
  NamesOfSelectedIcons,
  namesOfDefaultIcons,
} from 'src/app/domain/entities/namesOfSelectedIcons';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import {
  builtInIcons,
  customIcons,
} from 'src/app/tools/icon-set-config/domain/allIcons';
import { sanitizeIconName } from '../../../utils/sanitizer';
import getIconId = ElementTypes.getIconId;
import { IconSet } from '../../../domain/entities/iconSet';

export const ICON_PREFIX = 'icon-domain-story-';

@Injectable({
  providedIn: 'root',
})
export class IconDictionaryService {
  // The dictionaries holds icons (as SVG) and icon names as key-value pairs:

  // these dictionaries make up the current icon set:
  private selectedActorsDictionary = new Dictionary();
  private selectedWorkObjectsDictionary = new Dictionary();

  // this holds the selectable icons (without custom icons)
  private builtInIconsDictionary = new Dictionary();

  private iconDictionaryForMenu = new Dictionary();

  private customIconSet?: IconSet;

  constructor() {
    this.builtInIconsDictionary.addBuiltInIcons(builtInIcons);
  }

  initTypeDictionaries(): void {
    let namesOfIcons: NamesOfSelectedIcons;

    if (typeof this.customIconSet == 'undefined') {
      namesOfIcons = namesOfDefaultIcons;
    } else {
      namesOfIcons = new NamesOfSelectedIcons(
        this.customIconSet.actors.keysArray(),
        this.customIconSet.workObjects.keysArray(),
      );
    }

    const allTypes = new Dictionary();
    allTypes.addBuiltInIcons(builtInIcons);
    allTypes.appendDict(this.getCustomIcons());

    this.initDictionary(
      namesOfIcons.actors,
      allTypes,
      this.selectedActorsDictionary,
      ElementTypes.ACTOR,
    );
    this.initDictionary(
      namesOfIcons.workObjects,
      allTypes,
      this.selectedWorkObjectsDictionary,
      ElementTypes.WORKOBJECT,
    );
  }

  private initDictionary(
    selectedIconNames: string[],
    allIcons: Dictionary,
    dictionary: Dictionary,
    elementType: ElementTypes,
  ) {
    dictionary.clear();
    for (const key of selectedIconNames) {
      dictionary.add(allIcons.get(key), key);
    }

    dictionary.keysArray().forEach((name) => {
      this.registerIconForMenu(
        name,
        ICON_PREFIX + sanitizeIconName(name.toLowerCase()),
        elementType,
      );
    });
  }

  private allInTypeDictionary(
    type: ElementTypes,
    elements: BusinessObject[],
  ): boolean {
    let collection: Dictionary;
    if (type === ElementTypes.ACTOR) {
      collection = this.selectedActorsDictionary;
    } else if (type === ElementTypes.WORKOBJECT) {
      collection = this.selectedWorkObjectsDictionary;
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
      collection = this.selectedActorsDictionary;
    } else if (dictionaryType === ElementTypes.WORKOBJECT) {
      collection = this.selectedWorkObjectsDictionary;
    }

    const allTypes = new Dictionary();
    allTypes.addBuiltInIcons(builtInIcons);
    allTypes.appendDict(customIcons);

    iconTypes.forEach((name) => {
      if (!collection.has(name)) {
        const src = allTypes.get(name);
        if (src) {
          this.registerIconForType(dictionaryType, name, src);
          this.registerIconForMenu(
            name,
            sanitizeIconName(ICON_PREFIX + name.toLowerCase()),
            dictionaryType,
          );
        }
      }
    });
  }

  /** Add Icon(s) to Dictionary **/
  private registerIconForMenu(
    name: string,
    src: string,
    elementType: ElementTypes,
  ): void {
    if (name.includes(elementType)) {
      throw new Error('Should not include elementType');
    }

    this.iconDictionaryForMenu.set(`${elementType}${name}`, src);
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
      collection = this.selectedActorsDictionary;
    } else if (type === ElementTypes.WORKOBJECT) {
      collection = this.selectedWorkObjectsDictionary;
    }
    collection.add(src, name);
  }

  unregisterIconForType(type: ElementTypes, name: string): void {
    if (name.includes(type)) {
      throw new Error('Name should not include type!');
    }

    let collection = new Dictionary();
    if (type === ElementTypes.ACTOR) {
      collection = this.selectedActorsDictionary;
    } else if (type === ElementTypes.WORKOBJECT) {
      collection = this.selectedWorkObjectsDictionary;
    }
    collection.delete(name);
  }

  updateIconRegistries(
    actors: BusinessObject[],
    workObjects: BusinessObject[],
    config: IconSet,
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
        this.registerIconForMenu(
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
      this.addIMGToIconDictionary(custom, key);
    });
    this.addIconsToCss(customIcons);
  }

  addIMGToIconDictionary(input: string, name: string): void {
    customIcons.set(name, input);
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
    fullDictionary.appendDict(this.builtInIconsDictionary);
    fullDictionary.appendDict(this.getCustomIcons());
    return fullDictionary;
  }

  getCustomIcons(): Dictionary {
    const appendedDict = new Dictionary();
    customIcons.keysArray().forEach((key) => {
      if (!this.builtInIconsDictionary.has(key)) {
        appendedDict.set(key, customIcons.get(key));
      }
    });
    return appendedDict;
  }

  getIconsAssignedAs(type: ElementTypes): Dictionary {
    if (type === ElementTypes.ACTOR) {
      return this.selectedActorsDictionary;
    } else if (type === ElementTypes.WORKOBJECT) {
      return this.selectedWorkObjectsDictionary;
    }
    return new Dictionary();
  }

  getTypeIconSRC(type: ElementTypes, name: string): string | null {
    if (type === ElementTypes.ACTOR) {
      return this.selectedActorsDictionary.get(name);
    } else if (type === ElementTypes.WORKOBJECT) {
      return this.selectedWorkObjectsDictionary.get(name);
    }
    return null;
  }

  getIconForMenu(elementType: ElementTypes, name: string): string | null {
    return this.iconDictionaryForMenu.get(`${elementType}${name}`);
  }

  getIconSource(name: string): string | null {
    if (this.builtInIconsDictionary.has(name)) {
      return this.builtInIconsDictionary.get(name);
    } else if (customIcons.has(name)) {
      return customIcons.get(name);
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
    return this.builtInIconsDictionary;
  }

  getActorsDictionary(): Dictionary {
    return this.selectedActorsDictionary;
  }

  getWorkObjectsDictionary(): Dictionary {
    return this.selectedWorkObjectsDictionary;
  }

  setIconSet(iconSet: IconSet): void {
    this.customIconSet = iconSet;
  }
}
