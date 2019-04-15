import { customConfigTag, useCustomConfigTag, customConfigNameTag, appendedIconsTag } from '../features/iconSetCustomization/persitence';
import { appendedIcons, overrideAppendedIcons } from './all_Icons';
import { getAllIconDictioary } from '../features/iconSetCustomization/dictionaries';

/**
 * Select the Iconset which you want to use
 */
export function getIconset() {
  if (localStorage.getItem(useCustomConfigTag)) {

    var domainName = localStorage.getItem(customConfigNameTag) || 'default';
    var domainNameInput = document.getElementById('domainNameInput');
    var currentDomainName = document.getElementById('currentDomainName');
    domainNameInput.value = domainName;
    currentDomainName.innerHTML = domainName;


    var customConfig = localStorage.getItem(customConfigTag);
    var customConfigJSON = JSON.parse(customConfig);

    var actors = customConfigJSON.actors;
    var workObjects = customConfigJSON.workObjects;


    var dictionary = require('collections/dict');
    var actorDict = new dictionary();
    var workObjectDict = new dictionary();

    actorDict.addEach(actors);
    workObjectDict.addEach(workObjects);

    actors = actorDict.keysArray();
    workObjects = workObjectDict.keysArray();

    appendSRCFile(actors, actorDict, workObjects, workObjectDict);

    var custom_conf = {
      'actors': actors,
      'workObjects': workObjects
    };
    return custom_conf;
  }
  else return default_conf;
}

export function appendSRCFile(actors, actorsDict, workObjects, workObjectsDict) {
  var newAppendedIcons = appendedIcons;
  var allIcons = getAllIconDictioary();

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

var allIcons_conf = {
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
    'TV', 'Video', 'Desktop', 'Tablet',
    'Assessment', 'Dashboard',
    'Pie-chart', 'Insert-chart', 'View-List',
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
export var default_conf = {
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
