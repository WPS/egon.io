'use strict';

import { createTitleAndDescriptionSVGElement } from './createTitleAndInfo';
import sanitizeForDesktop from '../../util/Sanitizer';

var title = document.getElementById('title'),
    infoText = document.getElementById('infoText');
var svgData, cahcheData;

export function downloadSVG(filename) {

  createSVGData();

  var element = document.createElement('a');
  element.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + svgData);
  element.setAttribute('download', sanitizeForDesktop(filename) + '.svg');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function setEncoded(data) {
  cahcheData = data;
}

function createSVGData() {
  // to ensure that the title and description are inside the SVG container and do not overlapp with any elements,
  // we change the confines of the SVG viewbox
  var descriptionText = infoText.innerHTML;
  var titleText = title.innerHTML;
  var viewBoxIndex = cahcheData.indexOf ('width="');

  let { width, height, viewBox } = viewBoxCoordinates(cahcheData);
  height += 80;

  var xLeft, xRight, yUp, yDown;
  var bounds = '';
  var splitViewBox = viewBox.split(/\s/);

  xLeft = +splitViewBox[0];
  yUp = +splitViewBox[1];
  xRight = +splitViewBox[2];
  yDown = +splitViewBox[3];

  if (xRight < 300) {
    xRight+= 300;
    width+= 300;
  }

  bounds = 'width="' + width+ '" height=" '+ height+'" viewBox="' + xLeft + ' ' +(yUp - 80) + ' ' + xRight + ' ' + (yDown + 80);
  var dataStart = cahcheData.substring(0, viewBoxIndex);
  viewBoxIndex = cahcheData.indexOf('" version');
  var dataEnd = cahcheData.substring(viewBoxIndex);
  dataEnd.substring(viewBoxIndex);

  cahcheData = dataStart + bounds + dataEnd;

  // remove <br> HTML-elements from the description since they create error in the SVG
  while (descriptionText.includes('<br>')) {
    descriptionText=descriptionText.replace('<br>', '\n');
  }
  titleText = titleText.replace('&lt;','').replace('&gt;','');

  var insertIndex = cahcheData.indexOf('</defs>');
  if (insertIndex < 0) {
    insertIndex = cahcheData.indexOf('version="1.1">') + 14;
  }
  else {
    insertIndex+=7;
  }

  // to display the title and description in the SVG-file, we need to add a container for our text-elements
  var insertText = createTitleAndDescriptionSVGElement(titleText, descriptionText, xLeft, yUp - 75);

  cahcheData = [cahcheData.slice(0,insertIndex), insertText, cahcheData.slice(insertIndex)].join('');
  svgData = encodeURIComponent(cahcheData);
}

function viewBoxCoordinates(svg) {
  const ViewBoxCoordinate = /width="([^"]+)"\s+height="([^"]+)"\s+viewBox="([^"]+)"/;
  const match = svg.match(ViewBoxCoordinate);
  return { width: +match[1], height : +match[2], viewBox: match[3] };
}
