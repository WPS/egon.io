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

export const ICON_CSS_CLASS_PREFIX = 'icon-domain-story-';

@Injectable({
  providedIn: 'root',
})
export class IconDictionaryService {
  // The dictionaries holds icons (as SVG) and icon names as key-value pairs:

  // these dictionaries make up the current icon set:
  private selectedActorsDictionary = new Dictionary();
  private selectedWorkObjectsDictionary = new Dictionary();

  private customIconSet?: IconSet;

  constructor() {}

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
    allTypes.appendDict(customIcons);

    this.initDictionary(
      namesOfIcons.actors,
      allTypes,
      this.selectedActorsDictionary,
    );
    this.initDictionary(
      namesOfIcons.workObjects,
      allTypes,
      this.selectedWorkObjectsDictionary,
    );
  }

  private initDictionary(
    selectedIconNames: string[],
    allIcons: Dictionary,
    dictionary: Dictionary,
  ) {
    dictionary.clear();
    for (const key of selectedIconNames) {
      dictionary.add(allIcons.get(key), key);
    }
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
        }
      }
    });
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

  // TODO: why are Business Objects required to update icon registries?
  updateIconRegistries(
    actors: BusinessObject[],
    workObjects: BusinessObject[],
    config: IconSet,
  ): void {
    const newIcons = new Dictionary();
    this.extractCustomIconsFromDictionary(config.actors, newIcons);
    this.extractCustomIconsFromDictionary(config.workObjects, newIcons);
    this.addNewIconsToDictionary(newIcons);

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
        ICON_CSS_CLASS_PREFIX +
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
    fullDictionary.appendDict(builtInIcons);
    fullDictionary.appendDict(customIcons);
    return fullDictionary;
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

  getCSSClassOfIcon(name: string): string | null {
    return ICON_CSS_CLASS_PREFIX + sanitizeIconName(name.toLowerCase());
  }

  getIconSource(name: string): string | null {
    if (builtInIcons.has(name)) {
      return builtInIcons.get(name);
    } else if (customIcons.has(name)) {
      return customIcons.get(name);
    }
    return null;
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
