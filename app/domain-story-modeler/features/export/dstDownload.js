'use strict';

import { getAllObjectsFromCanvas, getAllGroups } from '../../util/CanvasObjects';
import sanitizeForDesktop from '../../util/Sanitizer';

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

export function createObjectListForDSTDownload(canvas, version) {
  var allObjectsFromCanvas = getAllObjectsFromCanvas(canvas);
  var groups = getAllGroups(canvas);

  var objectList = [];

  allObjectsFromCanvas.forEach(canvasElement =>{
    objectList.push(canvasElement.businessObject);
  });

  groups.forEach(group => {
    objectList.push(group.businessObject);
  });

  var text = infoText.innerText;

  objectList.push({ info: text });
  objectList.push({ version: version });
  return objectList;
}
