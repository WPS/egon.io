'use strict';

import { getAllObjectsFromCanvas } from '../../util/CanvasObjects';

var infoText = document.getElementById('infoText');

export function downloadDST(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename + '.dst');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function createObjectListForDSTDownload(modeler, canvas, version) {

  var customElements;
  customElements = modeler.getCustomElements();

  var elementIDs = [];
  customElements.forEach(element => {
    elementIDs.push(element.id);
  });

  var allObjectsFromCanvas = getAllObjectsFromCanvas(canvas);

  // check wether all objects from the canvas are present
  // add elements that might be missing
  allObjectsFromCanvas.forEach(canvasElement => {
    if (!elementIDs.includes(canvasElement.id)) {
      customElements.unshift(canvasElement.businessObject);
    }
  });
  var objectList = customElements.slice(0);

  var text = infoText.innerText;

  objectList.push({ info: text });
  objectList.push({ version: version });
  return objectList;
}
