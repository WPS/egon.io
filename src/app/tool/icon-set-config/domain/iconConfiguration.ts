import { Dictionary } from 'src/app/_domain/entity/common/dictionary';
import { overrideAppendedIcons } from 'src/app/tool/icon-set-config/domain/allIcons';
import { Configuration } from 'src/app/_domain/entity/common/configuration';
import { IconSetConfiguration } from 'src/app/_domain/entity/iconSetConfiguration';
import { INITIAL_ICON_SET_NAME } from '../../../_domain/entity/common/constants';

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

    overrideAppendedIcons(appen);
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

/* eslint no-unused-vars: 0*/

/**
 * All Icons as one Set
 * There are more Icons than fit in the palette.
 * This is just for reference
 */
const allIconsConf = {
  actors: ['Person', 'Group', 'System', 'Pet'],
  workObjects: [
    'Place',
    'Flag',
    'World',
    'Water',
    'Store',
    'Theater',
    'Business',
    'Meeting-room',
    'Hotel',
    'Dining',
    'Courthouse',
    'Gas-station',
    'Car',
    'Bus',
    'Train',
    'Truck',
    'Taxi',
    'Bike',
    'Boat',
    'Motorcycle',
    'Plane',
    'Flight-takeoff',
    'Flight-landing',
    'Shuttle',
    'Walking',
    'Traffic',
    'Commute',
    'Document',
    'Folder',
    'Call',
    'Email',
    'Copyright',
    'Briefcase',
    'Attach',
    'Ruler',
    'Sum',
    'Conversation',
    'Update',
    'Cellphone',
    'Speaker-phone',
    'Signal',
    'Key',
    'Pencil',
    'How-To-Reg',
    'Settings',
    'Grid',
    'Label',
    'Receipt',
    'Calendar',
    'Wrench',
    'Headset',
    'Keyboard',
    'Mouse',
    'Microphone',
    'Router',
    'Scanner',
    'Printer',
    'DNS',
    'Security',
    'Cloud',
    'Desktop',
    'Tablet',
    'Assessment',
    'Dashboard',
    'Pie-chart',
    'View-List',
    'Euro',
    'Dollar',
    'Info',
    'Alarm',
    'Problem',
    'Circle-Arrows',
    'Picture-as-PDF',
    'Credit-Card',
    'Shopping',
    'Favorite',
    'Gavel',
    'Blind',
    'Hourglass',
    'Time',
    'Search',
    'Thumb-up',
    'Thumb-down',
    'Thumb-up-down',
    'Couch',
    'Education',
    'Watch',
  ],
};

/**
 * Default Iconset
 */
export const defaultConf = {
  actors: ['Person', 'Group', 'System'],
  workObjects: ['Document', 'Folder', 'Call', 'Email', 'Conversation', 'Info'],
};
