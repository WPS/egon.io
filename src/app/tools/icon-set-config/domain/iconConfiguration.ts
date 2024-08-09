import { Dictionary } from 'src/app/domain/entities/dictionary';
import {
  overrideAppendedIcons,
  updateAppendedIcons,
} from 'src/app/tools/icon-set-config/domain/allIcons';
import { Configuration } from 'src/app/domain/entities/configuration';
import { INITIAL_ICON_SET_NAME } from '../../../domain/entities/constants';
import { IconSetConfiguration } from '../../../domain/entities/icon-set-configuration';

export class IconConfiguration {
  domainName = INITIAL_ICON_SET_NAME;

  private allIconDictionary: Dictionary;

  constructor(allIconDictionary: Dictionary) {
    this.allIconDictionary = allIconDictionary;
  }

  /**
   * Select the Iconset which you want to use
   */
  getDefaultConf(): Configuration {
    return defaultConf;
  }

  updateAllIconRegistry(allIconDictionary: Dictionary): void {
    this.allIconDictionary = allIconDictionary;
  }

  appendSRCFile(
    actors: string[],
    actorsDict: Dictionary,
    workObjects: string[],
    workObjectsDict: Dictionary,
  ): void {
    const newAppendedIcons: { [key: string]: any } = {};

    actors.forEach((name: string) => {
      if (!this.allIconDictionary.has(name)) {
        newAppendedIcons[name] = actorsDict.get(name);
      }
    });

    workObjects.forEach((name: string) => {
      if (!this.allIconDictionary.has(name)) {
        newAppendedIcons[name] = workObjectsDict.get(name);
      }
    });
    const appen = new Dictionary();
    Object.keys(newAppendedIcons).forEach((key) => {
      appen.set(key, newAppendedIcons[key]);
    });

    updateAppendedIcons(appen);
  }

  createCustomConf(iconSetConfiguration: IconSetConfiguration): Configuration {
    this.domainName = iconSetConfiguration.name;

    let actors = iconSetConfiguration.actors;
    let workObjects = iconSetConfiguration.workObjects;

    this.appendSRCFile(
      actors.keysArray(),
      actors,
      workObjects.keysArray(),
      workObjects,
    );

    return new Configuration(actors.keysArray(), workObjects.keysArray());
  }
}

/**
 * Default Iconset
 */
export const defaultConf = {
  actors: ['Person', 'Group', 'System'],
  workObjects: ['Document', 'Folder', 'Call', 'Email', 'Conversation', 'Info'],
};
