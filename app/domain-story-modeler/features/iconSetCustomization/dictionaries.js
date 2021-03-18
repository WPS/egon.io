'use strict';

import { all_icons, appendedIcons } from '../../language/icon/all_Icons';
import { Dict } from '../../language/classes/collection';

let allIconDictionary= new Dict();
let selectedAsActorDictionary = new Dict();
let selectedAsWorkObjectDictionary = new Dict();

export function getAppendedIconDictionary() {
  if (allIconDictionary.length < 1) {
    initializeAllIcons();
  }
  let appendedDict = new Dict();
  appendedIcons.keysArray().forEach(key => {
    if (!allIconDictionary.has(key)) {
      appendedDict.set(key, appendedIcons.get(key));
    }
  });
  return appendedDict;
}

export function initializeAllIcons() {
  let allIconsJSON = all_icons;

  allIconDictionary.addEach(allIconsJSON);
}

export function getIconSource(name) {
  if (allIconDictionary.has(name))
    return allIconDictionary.get(name);
  else if (appendedIcons.has(name)) {
    return appendedIcons.get(name);
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

export function emptySelectedActorsDictionary() {
  selectedAsActorDictionary.clear();
}

export function emptySelectedWorkObjectsDictionary() {
  selectedAsWorkObjectDictionary.clear();
}
