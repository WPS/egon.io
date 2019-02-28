'use strict';

import { createTitleAndDescriptionSVGElement } from './createTitleAndInfo';
import sanitizeForDesktop from '../../util/Sanitizer';

var title = document.getElementById('title'),
    infoText = document.getElementById('infoText');
var svgData;

export function downloadSVG(filename) {

  var element = document.createElement('a');
  element.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + svgData);
  element.setAttribute('download', sanitizeForDesktop(filename) + '.svg');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function setEncoded(data) {
  // to ensure that the title and description are inside the SVG container and do not overlapp with any elements,
  // we change the confines of the SVG viewbox
  var descriptionText = infoText.innerHTML;
  var titleText = title.innerHTML;
  var viewBoxIndex = data.indexOf ('width="');

  let { width, height, viewBox } = viewBoxCoordinates(data);
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
  var dataStart = data.substring(0, viewBoxIndex);
  viewBoxIndex = data.indexOf('" version');
  var dataEnd = data.substring(viewBoxIndex);
  dataEnd.substring(viewBoxIndex);

  data = dataStart + bounds + dataEnd;

  // remove <br> HTML-elements from the description since they create error in the SVG
  while (descriptionText.includes('<br>')) {
    descriptionText=descriptionText.replace('<br>', '\n');
  }
  titleText = titleText.replace('&lt;','').replace('&gt;','');

  var insertIndex = data.indexOf('</defs>');
  if (insertIndex < 0) {
    insertIndex=data.indexOf('version="1.1">') + 14;
  }
  else {
    insertIndex+=7;
  }

  // to display the title and description in the SVG-file, we need to add a container for our text-elements
  var insertText = createTitleAndDescriptionSVGElement(titleText, descriptionText, xLeft, yUp - 75);

  data = [data.slice(0,insertIndex), insertText, data.slice(insertIndex)].join('');
  svgData = encodeURIComponent(data);
}

function viewBoxCoordinates(svg) {
  const ViewBoxCoordinate = /width="([^"]+)"\s+height="([^"]+)"\s+viewBox="([^"]+)"/;
  const match = svg.match(ViewBoxCoordinate);
  return { width: +match[1], height : +match[2], viewBox: match[3] };
}
