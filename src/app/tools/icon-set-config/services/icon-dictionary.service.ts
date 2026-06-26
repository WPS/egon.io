import { inject, Injectable } from '@angular/core';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import { builtInIcons } from 'src/app/tools/icon-set-config/domain/builtInIcons';
import { sanitizeForCss } from '../../../utils/sanitizer';
import { IconSet } from 'src/app/domain/entities/icon-set';
import { INITIAL_ICON_SET_NAME } from 'src/app/domain/entities/constants';
import { IconCssService } from 'src/app/tools/icon-set-config/services/icon-css.service';

export const ICON_CSS_CLASS_PREFIX = 'icon-domain-story-';

@Injectable({
  providedIn: 'root',
})
export class IconDictionaryService {
  private readonly iconCssService = inject(IconCssService);

  // The dictionaries hold icons (as SVG) and icon names as key-value pairs

  private readonly customIcons = new Dictionary<string>();

  // these dictionaries make up the current icon set:
  private selectedActorsDictionary = new Dictionary<string>();
  private selectedWorkObjectsDictionary = new Dictionary<string>();

  // default icon sets:
  private readonly NAMES_OF_DEFAULT_ICONS = {
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

  private createDefaultIconSet(): IconSet {
    const defaultActorsDictionary = new Dictionary<string>();
    const defaultWorkObjectsDictionary = new Dictionary<string>();
    this.initDictionary(
      this.NAMES_OF_DEFAULT_ICONS.actors,
      builtInIcons,
      defaultActorsDictionary,
    );
    this.initDictionary(
      this.NAMES_OF_DEFAULT_ICONS.workObjects,
      builtInIcons,
      defaultWorkObjectsDictionary,
    );
    return {
      name: INITIAL_ICON_SET_NAME,
      actors: defaultActorsDictionary,
      workObjects: defaultWorkObjectsDictionary,
    };
  }

  initTypeDictionaries(): void {
    if (
      this.selectedActorsDictionary.isEmpty() &&
      this.selectedWorkObjectsDictionary.isEmpty()
    ) {
      this.setIconSet(this.createDefaultIconSet());
    }
  }

  private initDictionary(
    selectedIconNames: string[],
    allIcons: Dictionary<string>,
    dictionary: Dictionary<string>,
  ) {
    dictionary.clear();
    for (const key of selectedIconNames) {
      dictionary.set(key, allIcons.get(key));
    }
  }

  registerIconForType(type: ElementTypes, name: string, src: string): void {
    if (name.includes(type)) {
      throw new Error('Name should not include type!');
    }

    this.getIconsAssignedAs(type).set(name, src);
  }

  unregisterIconForType(type: ElementTypes, name: string): void {
    if (name.includes(type)) {
      throw new Error('Name should not include type!');
    }

    this.getIconsAssignedAs(type).delete(name);
  }

  // When an icon set or a domain story (which includes its icon set) are imported,
  // we need to...:
  // 1. add new custom icons (if any)
  // 2. update which icons are selected as actors/work objects
  updateIconRegistries(config: IconSet): void {
    const newIcons = new Dictionary<string>();
    this.extractCustomIconsFromDictionary(config.actors, newIcons);
    this.extractCustomIconsFromDictionary(config.workObjects, newIcons);
    this.addCustomIcons(newIcons);
    this.setIconSet(config);
  }

  private extractCustomIconsFromDictionary(
    elementDictionary: Dictionary<string>,
    customIcons: Dictionary<string>,
  ) {
    elementDictionary.keysArray().forEach((name) => {
      if (!this.getFullDictionary().has(name)) {
        customIcons.set(name, elementDictionary.get(name));
      }
    });
  }

  addCustomIcon(iconSrc: string, name: string) {
    this.customIcons.set(name, iconSrc);
    this.iconCssService.addIconsToCss(iconSrc, name);
  }

  private addCustomIcons(icons: Dictionary<string>) {
    icons.keysArray().forEach((key) => {
      const custom = icons.get(key);
      this.addCustomIcon(custom, key);
    });
  }

  /** Getter & Setter **/

  getFullDictionary(): Dictionary<string> {
    const fullDictionary = new Dictionary<string>();
    fullDictionary.appendDict(builtInIcons);
    fullDictionary.appendDict(this.customIcons);
    return fullDictionary;
  }

  getIconsAssignedAs(type: ElementTypes): Dictionary<string> {
    switch (type) {
      case ElementTypes.ACTOR:
        return this.selectedActorsDictionary;
      case ElementTypes.WORKOBJECT:
        return this.selectedWorkObjectsDictionary;
      default:
        throw new Error(`Unsupported icon type: ${type}`);
    }
  }

  getCSSClassOfIcon(name: string): string | null {
    return ICON_CSS_CLASS_PREFIX + sanitizeForCss(name);
  }

  getIconSource(name: string): string {
    if (builtInIcons.has(name)) {
      return builtInIcons.get(name);
    } else if (this.customIcons.has(name)) {
      return this.customIcons.get(name);
    }
    return '';
  }

  setIconSet(iconSet: IconSet): void {
    this.selectedActorsDictionary = iconSet.actors;
    this.selectedWorkObjectsDictionary = iconSet.workObjects;
  }

  getDefaultIconSet(): IconSet {
    return this.createDefaultIconSet();
  }
}
