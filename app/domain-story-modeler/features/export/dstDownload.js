'use strict';

import sanitizeForDesktop from '../../util/Sanitizer';
import { ACTIVITY } from '../../language/elementTypes';
import { getAllCanvasObjects, getAllGroups } from '../canvasElements/canvasElementRegistry';

var infoText = document.getElementById('infoText');

export function downloadDST(filename, text) {
  filename = sanitizeForDesktop(filename);
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename + '.dst');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

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
