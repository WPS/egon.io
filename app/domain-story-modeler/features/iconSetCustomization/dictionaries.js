'use strict';

import { all_icons, appendedIcons } from '../../language/all_Icons';


var CanvasObjectTypes = require('collections/dict');
var allIconDictionary= new CanvasObjectTypes();
var selectedAsActorDictionary = new CanvasObjectTypes();
var selectedAsWorkObjectDictionary = new CanvasObjectTypes();

export function getAppendedIconDictionary() {
  var appendedDict = new CanvasObjectTypes();
  appendedDict.addEach(appendedIcons);

  return appendedDict;
}

export function initializeAllIcons() {

  var allIconsJSON = all_icons;

  allIconDictionary.addEach(allIconsJSON);
}

export function getIconSource(name) {
  var appendedDict = new CanvasObjectTypes();
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