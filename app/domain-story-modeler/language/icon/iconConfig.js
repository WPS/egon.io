import {
  customConfigTag,
  useCustomConfigTag,
  customConfigNameTag,
  useNecessaryConfigTag
} from '../../features/iconSetCustomization/persitence';
import { overrideAppendedIcons, appendedIcons } from './all_Icons';
import { getAllIconDictioary } from '../../features/iconSetCustomization/dictionaries';
import { domExists } from '../testmode';
import { Dict } from '../classes/collection';

/**
 * Select the Iconset which you want to use
 */
export function getIconset() {
  if (localStorage.getItem(useCustomConfigTag)) {
    return createCustomConf(false);
  }
  if (localStorage.getItem(useNecessaryConfigTag)) {
    return createCustomConf(true);
  }
  return default_conf;

}

export function appendSRCFile(
    actors,
    actorsDict,
    workObjects,
    workObjectsDict
) {
  let newAppendedIcons = {};
  let allIcons = getAllIconDictioary();

  actors.forEach(name => {
    if (!allIcons.has(name)) {
      newAppendedIcons[name] = actorsDict.get(name);
    }
  });

  workObjects.forEach(name => {
    if (!allIcons.has(name)) {
      newAppendedIcons[name] = workObjectsDict.get(name);
    }
  });
  let appen = new Dict();
  Object.keys(newAppendedIcons).forEach(key => {
    appen.set(key, newAppendedIcons[key]);
  });

  overrideAppendedIcons(appen);
}

function createCustomConf(includeNecessary) {
  if (domExists()) {
    let domainName = localStorage.getItem(customConfigNameTag) || 'default';
    let domainNameInput = document.getElementById('domainNameInput');
    let currentDomainName = document.getElementById('currentDomainName');
    domainNameInput.value = domainName;
    currentDomainName.innerHTML = domainName;
  }

  let customConfig = localStorage.getItem(customConfigTag);
  let customConfigJSON = JSON.parse(customConfig);

  let actors = customConfigJSON.actors;
  let workObjects = customConfigJSON.workObjects;

  let actorDict = new Dict();
  let workObjectDict = new Dict();

  actorDict.addEach(actors);
  workObjectDict.addEach(workObjects);

  actors = actorDict.keysArray();
  workObjects = workObjectDict.keysArray();

  if (includeNecessary) {

    default_conf.actors.forEach(actor => {
      actors.push(actor);
    });

    default_conf.workObjects.forEach(workObject => {
      workObjects.push(workObject);
    });
  }

  appendSRCFile(actors, actorDict, workObjects, workObjectDict);

  return {
    actors: actors,
    workObjects: workObjects
  };
}

/* eslint no-unused-vars: 0*/

/**
 * All Icons as one Set
 * There are more Icons than fit in the palette.
 * This is just for reference
 */

const allIcons_conf = {
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
    'Watch'
  ]
};

/**
 * Default Iconset
 */
export const default_conf = {
  actors: ['Person', 'Group', 'System'],
  workObjects: ['Document', 'Folder', 'Call', 'Email', 'Conversation', 'Info']
};
