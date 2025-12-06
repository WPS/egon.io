import { Injectable } from '@angular/core';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import { builtInIcons } from 'src/app/tools/icon-set-config/domain/builtInIcons';
import { sanitizeIconName } from '../../../utils/sanitizer';
import { IconSet } from '../../../domain/entities/iconSet';
import { INITIAL_ICON_SET_NAME } from 'src/app/domain/entities/constants';

export const ICON_CSS_CLASS_PREFIX = 'icon-domain-story-';

@Injectable({
  providedIn: 'root',
})
export class IconDictionaryService {
  // The dictionaries hold icons (as SVG) and icon names as key-value pairs

  private customIcons = new Dictionary();

  // these dictionaries make up the current icon set:
  private selectedActorsDictionary = new Dictionary();
  private selectedWorkObjectsDictionary = new Dictionary();

  // default icon sets:
  private NAMES_OF_DEFAULT_ICONS = {
    actors: ['Person', 'Group', 'System'],
    workObjects: [
      'Document',
      'Folder',
      'Call',
      'Email',
      'Conversation',
      'Info',
    ],
  };
  private defaultActorsDictionary = new Dictionary();
  private defaultWorkObjectsDictionary = new Dictionary();
  private defaultIconSet: IconSet;

  constructor() {
    this.initDictionary(
      this.NAMES_OF_DEFAULT_ICONS.actors,
      builtInIcons,
      this.defaultActorsDictionary,
    );
    this.initDictionary(
      this.NAMES_OF_DEFAULT_ICONS.workObjects,
      builtInIcons,
      this.defaultWorkObjectsDictionary,
    );
    this.defaultIconSet = {
      name: INITIAL_ICON_SET_NAME,
      actors: this.defaultActorsDictionary,
      workObjects: this.defaultWorkObjectsDictionary,
    };
  }

  initTypeDictionaries(): void {
    if (
      this.selectedActorsDictionary.isEmpty() &&
      this.selectedWorkObjectsDictionary.isEmpty()
    ) {
      this.setIconSet(this.defaultIconSet);
    }
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

  // When an icon set or a domain story (which includes its icon set) are imported,
  // we need to...:
  // 1. add new custom icons (if any)
  // 2. update which icons are selected as actors/work objects
  updateIconRegistries(config: IconSet): void {
    const newIcons = new Dictionary();
    this.extractCustomIconsFromDictionary(config.actors, newIcons);
    this.extractCustomIconsFromDictionary(config.workObjects, newIcons);
    this.addCustomIcons(newIcons);
    this.setIconSet(config);
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

  addCustomIcon(iconSrc: string, name: string) {
    this.customIcons.set(name, iconSrc);
    this.addIconsToCss(iconSrc, name);
  }

  private addCustomIcons(icons: Dictionary) {
    icons.keysArray().forEach((key) => {
      const custom = icons.get(key);
      this.addCustomIcon(custom, key);
    });
  }

  private addIconsToCss(iconSrc: string, iconName: string) {
    const sheetEl = document.getElementById('iconsCss');

    const iconStyle =
      '.' +
      ICON_CSS_CLASS_PREFIX +
      sanitizeIconName(iconName.toLowerCase()) +
      '::before{ content: url("data:image/svg+xml;utf8,' +
      this.wrapSRCInSVG(iconSrc) +
      '"); margin: 3px;}';
    // @ts-ignore
    sheetEl?.sheet?.insertRule(iconStyle, sheetEl.sheet.cssRules.length);
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
    fullDictionary.appendDict(this.customIcons);
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

  getCSSClassOfIcon(name: string): string | null {
    return ICON_CSS_CLASS_PREFIX + sanitizeIconName(name.toLowerCase());
  }

  getIconSource(name: string): string | null {
    if (builtInIcons.has(name)) {
      return builtInIcons.get(name);
    } else if (this.customIcons.has(name)) {
      return this.customIcons.get(name);
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
    this.selectedActorsDictionary = iconSet.actors;
    this.selectedWorkObjectsDictionary = iconSet.workObjects;
  }

  getDefaultIconSet(): IconSet {
    return this.defaultIconSet;
  }
}
