'use strict';

import { all_icons, appendedIcons } from '../../language/icon/all_Icons';


const CanvasObjectTypes = require('collections/dict');
let allIconDictionary= new CanvasObjectTypes();
let selectedAsActorDictionary = new CanvasObjectTypes();
let selectedAsWorkObjectDictionary = new CanvasObjectTypes();

export function getAppendedIconDictionary() {
  let appendedDict = new CanvasObjectTypes();
  appendedDict.addEach(appendedIcons);
  appendedDict.keysArray().forEach(name => {
    if (allIconDictionary.has(name)) {
      appendedDict.delete(name);
    }
  });
  return appendedDict;
}

export function initializeAllIcons() {
  let allIconsJSON = all_icons;

  allIconDictionary.addEach(allIconsJSON);
}

export function getIconSource(name) {
  let appendedDict = new CanvasObjectTypes();
  appendedDict.addEach(appendedIcons);
  if (allIconDictionary.has(name))
    return allIconDictionary.get(name);
  else if (appendedDict.has(name)) {
    return appendedDict.get(name);
  }
  return null;
}

export function getAllIconDictioary() {
  return allIconDictionary;
}

export function getSelectedActorsDictionary() {
  return selectedAsActorDictionary;
}

export function getSelectedWorkObjectsDictionary() {
  return selectedAsWorkObjectDictionary;
}

export function addToSelectedActors(name, src) {
  selectedAsActorDictionary.set(name, src);
}

export function addToSelectedWorkObjects(name, src) {
  selectedAsWorkObjectDictionary.set(name, src);
}

export function deleteFromSelectedActorDictionary(name) {
  return selectedAsActorDictionary.delete(name);
}

export function deleteFromSelectedWorkObjectDictionary(name) {
  return selectedAsWorkObjectDictionary.delete(name);
}

export function selectedDitionariesAreNotEmpty() {
  return (selectedAsActorDictionary.length > 0 && selectedAsWorkObjectDictionary.length >0);
}

export function resetSelectionDictionaries() {
  selectedAsActorDictionary.clear();
  selectedAsWorkObjectDictionary.clear();
}