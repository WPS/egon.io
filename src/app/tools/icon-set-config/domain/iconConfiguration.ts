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

  getDefaultConf(): Configuration {
    return defaultIconSet;
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

  createCustomConf(iconSetConfiguration: IconSet): Configuration {
    this.iconSetName = iconSetConfiguration.name;

    let actors = iconSetConfiguration.actors;
    let workObjects = iconSetConfiguration.workObjects;

    this.addCustomIcons(
      actors.keysArray(),
      actors,
      workObjects.keysArray(),
      workObjects,
    );

    return new Configuration(actors.keysArray(), workObjects.keysArray());
  }
}

export const defaultIconSet = {
  actors: ['Person', 'Group', 'System'],
  workObjects: ['Document', 'Folder', 'Call', 'Email', 'Conversation', 'Info'],
};
