'use strict';

import sanitizeForDesktop from '../../util/Sanitizer';
import { ACTIVITY, TEXTANNOTATION } from '../../language/elementTypes';
import { getAllCanvasObjects, getAllGroups } from '../canvasElements/canvasElementRegistry';
import { getSelectedActorsDictionary, getSelectedWorkObjectsDictionary } from '../iconSetCustomization/dictionaries';
import { createConfigFromDictionaries } from '../iconSetCustomization/persitence';
import { getActorIconDictionary } from '../../language/icon/actorIconDictionary';
import { getWorkObjectIconDictionary } from '../../language/icon/workObjectIconDictionary';
import { removeDirtyFlag } from './dirtyFlag';

let infoText = document.getElementById('infoText');

export function downloadDST(filename, text) {

  let actors = getSelectedActorsDictionary();
  let workObjects = getSelectedWorkObjectsDictionary();
  let configJSONString = {};

  if (!actors.size>0) {
    actors = getActorIconDictionary();
  }
  if (!workObjects.size>0) {
    workObjects = getWorkObjectIconDictionary();
  }

  configJSONString = JSON.stringify(createConfigFromDictionaries(actors, workObjects));

  let configAndDST = {
    config: configJSONString,
    dst: text
  };
  let json =JSON.stringify(configAndDST);

  filename = sanitizeForDesktop(filename);
  let element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(json));
  element.setAttribute('download', filename + '.dst');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  removeDirtyFlag();

  document.body.removeChild(element);
}

export function createObjectListForDSTDownload(version) {
  let allObjectsFromCanvas = getAllCanvasObjects();
  let groups = getAllGroups();

  let objectList = [];

  allObjectsFromCanvas.forEach(canvasElement =>{
    if (canvasElement.type == ACTIVITY) {
      objectList.push(canvasElement.businessObject);
    }
    // ensure that Activities are always after Actors, Workobjects and Groups in .dst files
    else {
      if (canvasElement.type == TEXTANNOTATION) {
        canvasElement.businessObject.width = canvasElement.width;
        canvasElement.businessObject.height = canvasElement.height;
      }
      objectList.unshift(canvasElement.businessObject);
    }
  });

  groups.forEach(group => {
    objectList.push(group.businessObject);
  });

  let text = infoText.innerText;

  objectList.push({ info: text });
  objectList.push({ version: version });
  return objectList;
}
