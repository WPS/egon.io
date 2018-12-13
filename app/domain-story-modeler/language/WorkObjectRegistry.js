import { registerIcon } from './iconRegistry';
import { getNameFromType } from './naming';
import { all_icons } from './all_Icons';

'use strict';

var WorkObjectTypes = require('collections/dict');
var workObjectRegistry = new WorkObjectTypes();

export function getWorkObjectRegistry() {
  return workObjectRegistry;
}

export function getWorkObjecttRegistryKeys() {
  return workObjectRegistry.keysArray();
}

export function registerWorkObject(name, src) {
  if (!name.includes('domainStory:workObject')) {
    name = 'domainStory:workObject' + name;
  }
  workObjectRegistry.set(name, src);
}

export function getWorkObjectSrc(name) {
  return workObjectRegistry.get(name);
}

export function initWorkObjecttRegistry(workObjetcs) {
  var allTypes = new WorkObjectTypes();
  allTypes.addEach(all_icons);

  for (var i=0; i < workObjetcs.length; i++) {
    const key = 'domainStory:workObject' + workObjetcs[i];
    workObjectRegistry.add(allTypes.get(workObjetcs[i]), key);
  }

  workObjectRegistry.keysArray().forEach(type => {
    var name = getNameFromType(type);
    registerIcon(type, 'icon-domain-story-' + name.toLowerCase());
  });
}