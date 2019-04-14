'use strict';

import sanitizeForDesktop from '../../util/Sanitizer';
import { ACTIVITY } from '../../language/elementTypes';
import { getAllCanvasObjects, getAllGroups } from '../canvasElements/canvasElementRegistry';
import { getSelectedActorsDictionary, getSelectedWorkObjectsDictionary } from '../iconSetCustomization/dictionaries';
import { createConfigFromDictionaries } from '../iconSetCustomization/persitence';
import { getActorIconDictionary } from '../../language/actorIconDictionary';
import { getWorkObjectIconDictionary } from '../../language/workObjectIconDictionary';
import { removeDirtyFlag } from './dirtyFlag';

var infoText = document.getElementById('infoText');

export function downloadDST(filename, text) {

  var actors = getSelectedActorsDictionary();
  var workObjects = getSelectedWorkObjectsDictionary();
  var configJSONString = {};

  if (!actors.size>0) {
    actors = getActorIconDictionary();
  }
  if (!workObjects.size>0) {
    workObjects = getWorkObjectIconDictionary();
  }

  configJSONString = JSON.stringify(createConfigFromDictionaries(actors, workObjects));

  var configAndDST = {
    config: configJSONString,
    dst: text
  };
  var json =JSON.stringify(configAndDST);

  filename = sanitizeForDesktop(filename);
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
  element.setAttribute('download', filename + '.dst');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  removeDirtyFlag();

  document.body.removeChild(element);
}

export function createObjectListForDSTDownload(version) {
  var allObjectsFromCanvas = getAllCanvasObjects();
  var groups = getAllGroups();

  var objectList = [];

  allObjectsFromCanvas.forEach(canvasElement =>{
    if (canvasElement.type == ACTIVITY) {
      objectList.push(canvasElement.businessObject);
    }
    // ensure that Activities are always after Actors, Workobjects and Groups in .dst files
    else {
      objectList.unshift(canvasElement.businessObject);
    }
  });

  groups.forEach(group => {
    objectList.push(group.businessObject);
  });

  var text = infoText.innerText;

  objectList.push({ info: text });
  objectList.push({ version: version });
  return objectList;
}
