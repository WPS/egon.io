import { registerIcon } from './iconRegistry';
import { getNameFromType } from './naming';
import { all_icons, appendedIcons } from './all_Icons';
import { WORKOBJECT } from './elementTypes';

'use strict';

var WorkObjectTypes = require('collections/dict');
var workObjectIconRegistry = new WorkObjectTypes();

export function getWorkObjectIconRegistry() {
  return workObjectIconRegistry;
}

export function getWorkObjectIconRegistryKeys() {
  return workObjectIconRegistry.keysArray();
}

export function allInWorkObjectIconRegistry(workObjects) {
  var allIn = true;
  workObjects.forEach(workObject => {
    if (!workObjectIconRegistry.has(workObject.type)) {
      allIn = false;
    }
  });
  return allIn;
}

export function registerWorkObjectIcons(workObjects) {
  var allTypes=new WorkObjectTypes();
  allTypes.addEach(all_icons);
  allTypes.addEach(appendedIcons);

  workObjects.forEach(workObject => {
    if (!workObjectIconRegistry.has(workObject.type)) {
      const name = getNameFromType(workObject.type);
      registerWorkObjectIcon(workObject.type, allTypes.get(name));
      registerIcon(workObject.type, 'icon-domain-story-' + name.toLowerCase());

    }
  });
}

export function registerWorkObjectIcon(name, src) {
  if (!name.includes(WORKOBJECT)) {
    name = WORKOBJECT + name;
  }
  workObjectIconRegistry.set(name, src);
}

export function getWorkObjectIconSrc(name) {
  return workObjectIconRegistry.get(name);
}

export function isInWorkObjectIconRegsitry(name) {
  return workObjectIconRegistry.has(name);
}

export function initWorkObjectIconRegistry(workObjetcs) {
  var allTypes = new WorkObjectTypes();
  allTypes.addEach(all_icons);
  allTypes.addEach(appendedIcons);

  for (var i=0; i < workObjetcs.length; i++) {
    const key = WORKOBJECT + workObjetcs[i];
    workObjectIconRegistry.add(allTypes.get(workObjetcs[i]), key);
  }

  workObjectIconRegistry.keysArray().forEach(type => {
    var name = getNameFromType(type);
    registerIcon(type, 'icon-domain-story-' + name.toLowerCase());
  });
}