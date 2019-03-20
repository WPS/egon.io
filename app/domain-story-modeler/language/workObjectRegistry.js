import { registerIcon } from './iconRegistry';
import { getNameFromType } from './naming';
import { all_icons } from './all_Icons';
import { WORKOBJECT } from './elementTypes';

'use strict';

var WorkObjectTypes = require('collections/dict');
var workObjectRegistry = new WorkObjectTypes();

export function getWorkObjectRegistry() {
  return workObjectRegistry;
}

export function getWorkObjecttRegistryKeys() {
  return workObjectRegistry.keysArray();
}

export function allInWorkObjectRegistry(workObjects) {
  var allIn = true;
  workObjects.forEach(workObject => {
    if (!workObjectRegistry.has(workObject.type)) {
      allIn = false;
    }
  });
  return allIn;
}

export function registerWorkObjects(workObjects) {
  var allTypes=new WorkObjectTypes();
  allTypes.addEach(all_icons);

  workObjects.forEach(workObject => {
    if (!workObjectRegistry.has(workObject.type)) {
      const name = getNameFromType(workObject.type);
      registerWorkObject(workObject.type, allTypes.get(name));
      registerIcon(workObject.type, 'icon-domain-story-' + name.toLowerCase());

    }
  });
}

export function registerWorkObject(name, src) {
  if (!name.includes(WORKOBJECT)) {
    name = WORKOBJECT + name;
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
    const key = WORKOBJECT + workObjetcs[i];
    workObjectRegistry.add(allTypes.get(workObjetcs[i]), key);
  }

  workObjectRegistry.keysArray().forEach(type => {
    var name = getNameFromType(type);
    registerIcon(type, 'icon-domain-story-' + name.toLowerCase());
  });
}