import { Dictionary } from 'src/app/domain/entities/dictionary';
import { addCustomIcons } from 'src/app/tools/icon-set-config/domain/allIcons';
import { Configuration } from 'src/app/domain/entities/configuration';
import { INITIAL_ICON_SET_NAME } from '../../../domain/entities/constants';
import { IconSet } from '../../../domain/entities/iconSet';

export class IconConfiguration {
  iconSetName = INITIAL_ICON_SET_NAME;

  private allIconDictionary: Dictionary;

  constructor(allIconDictionary: Dictionary) {
    this.allIconDictionary = allIconDictionary;
  }

  addCustomIcons(
    actors: string[],
    actorsDict: Dictionary,
    workObjects: string[],
    workObjectsDict: Dictionary,
  ): void {
    const newCustomIcons: { [key: string]: any } = {};

    actors.forEach((name: string) => {
      if (!this.allIconDictionary.has(name)) {
        newCustomIcons[name] = actorsDict.get(name);
      }
    });

    workObjects.forEach((name: string) => {
      if (!this.allIconDictionary.has(name)) {
        newCustomIcons[name] = workObjectsDict.get(name);
      }
    });

    const customIcons = new Dictionary();
    Object.keys(newCustomIcons).forEach((key) => {
      customIcons.set(key, newCustomIcons[key]);
    });

    addCustomIcons(customIcons);
  }

  getNamesOfIcons(iconSet?: IconSet): Configuration {
    if (typeof iconSet == 'undefined') {
      return namesOfDefaultIcons;
    }
    this.iconSetName = iconSet.name;

    let actors = iconSet.actors;
    let workObjects = iconSet.workObjects;

    this.addCustomIcons(
      actors.keysArray(),
      actors,
      workObjects.keysArray(),
      workObjects,
    );

    return new Configuration(actors.keysArray(), workObjects.keysArray());
  }
}

export const namesOfDefaultIcons = {
  actors: ['Person', 'Group', 'System'],
  workObjects: ['Document', 'Folder', 'Call', 'Email', 'Conversation', 'Info'],
};
