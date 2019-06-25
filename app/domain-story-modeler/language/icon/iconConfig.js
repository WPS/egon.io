import { customConfigTag, useCustomConfigTag, customConfigNameTag } from '../../features/iconSetCustomization/persitence';
import { overrideAppendedIcons } from './all_Icons';
import { getAllIconDictioary } from '../../features/iconSetCustomization/dictionaries';
import { domExists } from '../testmode';

/**
 * Select the Iconset which you want to use
 */
export function getIconset() {
  if (localStorage.getItem(useCustomConfigTag)) {

    if (domExists()) {
      var domainName = localStorage.getItem(customConfigNameTag) || 'default';
      var domainNameInput = document.getElementById('domainNameInput');
      var currentDomainName = document.getElementById('currentDomainName');
      domainNameInput.value = domainName;
      currentDomainName.innerHTML = domainName;
    }

    let customConfig = localStorage.getItem(customConfigTag);
    let customConfigJSON = JSON.parse(customConfig);

    let actors = customConfigJSON.actors;
    let workObjects = customConfigJSON.workObjects;

    let dictionary = require('collections/dict');
    let actorDict = new dictionary();
    let workObjectDict = new dictionary();

    actorDict.addEach(actors);
    workObjectDict.addEach(workObjects);

    actors = actorDict.keysArray();
    workObjects = workObjectDict.keysArray();

    appendSRCFile(actors, actorDict, workObjects, workObjectDict);

    let custom_conf = {
      'actors': actors,
      'workObjects': workObjects
    };
    return custom_conf;
  }
  else return default_conf;
}

export function appendSRCFile(actors, actorsDict, workObjects, workObjectsDict) {
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
  overrideAppendedIcons(newAppendedIcons);
}

/* eslint no-unused-vars: 0*/

/**
  * All Icons as one Set
  * There are more Icons than fit in the palette.
  * This is just for reference
  */

const allIcons_conf = {
  'actors': [
    'Person',
    'Group',
    'System',
    'Pet',
  ],
  'workObjects': [
    'Place',
    'Flag', 'World', 'Water',
    'Store', 'Theater', 'Business', 'Meeting-room',
    'Hotel', 'Dining', 'Courthouse',
    'Gas-station',
    'Car', 'Bus', 'Train', 'Truck', 'Taxi', 'Bike', 'Boat', 'Motorcycle',
    'Plane', 'Flight-takeoff', 'Flight-landing',
    'Shuttle', 'Walking', 'Traffic', 'Commute',
    'Document', 'Folder', 'Call', 'Email', 'Copyright', 'Briefcase', 'Attach', 'Ruler',
    'Sum',
    'Conversation',
    'Update',
    'Cellphone', 'Speaker-phone',
    'Signal',
    'Key',
    'Pencil',
    'Settings', 'Save', 'Delete', 'Wrench',
    'Headset', 'Keyboard', 'Mouse', 'Microphone',
    'Router', 'Scanner', 'Printer', 'DNS',
    'Security', 'Cloud',
    'Desktop', 'Tablet',
    'Assessment', 'Dashboard',
    'Pie-chart', 'View-List',
    'Euro', 'Dollar',
    'Info', 'Alarm', 'Problem',
    'Circle-Arrows',
    'Picture-as-PDF',
    'Credit-Card', 'Shopping',
    'Favorite',
    'Gavel',
    'Blind',
    'Hourglass', 'Time',
    'Search',
    'Thumb-up', 'Thumb-down', 'Thumb-up-down',
    'Couch',
    'Education',
    'Watch',
  ]
};

/**
 * Default Iconset
 */
export const default_conf = {
  'actors': [
    'Person',
    'Group',
    'System'
  ],
  'workObjects': [
    'Document',
    'Folder',
    'Call',
    'Email',
    'Conversation',
    'Info'
  ]
};
