import { registerIcon } from './iconDictionary';
import { getNameFromType } from '../naming';
import { all_icons, appendedIcons } from './all_Icons';
import { WORKOBJECT } from '../elementTypes';

'use strict';

var WorkObjectTypes = require('collections/dict');
var workObjectIconDictionary = new WorkObjectTypes();

export function getWorkObjectIconDictionary() {
  return workObjectIconDictionary;
}

export function getWorkObjectIconDictionaryKeys() {
  return workObjectIconDictionary.keysArray();
}

export function allInWorkObjectIconDictionary(workObjects) {
  var allIn = true;
  workObjects.forEach(workObject => {
    if (!workObjectIconDictionary.has(workObject.type)) {
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
    if (!workObjectIconDictionary.has(workObject.type)) {
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
  workObjectIconDictionary.set(name, src);
}

export function getWorkObjectIconSrc(name) {
  return workObjectIconDictionary.get(name);
}

export function isInWorkObjectIconDictionary(name) {
  return workObjectIconDictionary.has(name);
}

export function initWorkObjectIconDictionary(workObjetcs) {
  var allTypes = new WorkObjectTypes();
  allTypes.addEach(all_icons);
  allTypes.addEach(appendedIcons);

  for (var i=0; i < workObjetcs.length; i++) {
    const key = WORKOBJECT + workObjetcs[i];
    workObjectIconDictionary.add(allTypes.get(workObjetcs[i]), key);
  }

  workObjectIconDictionary.keysArray().forEach(type => {
    var name = getNameFromType(type);
    registerIcon(type, 'icon-domain-story-' + name.toLowerCase());
  });
}