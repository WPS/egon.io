'use strict';

import { createTitleAndDescriptionSVGElement } from './createTitleAndInfo';
import { sanitizeForDesktop } from '../../util/Sanitizer';
import { createConfigAndDst, createObjectListForDSTDownload } from './dstDownload';
import { version } from '../../../../package.json';

let title = document.getElementById('title'),
    infoText = document.getElementById('infoText');
let cacheData;

export function downloadSVG(filename) {
  const svgData = createSVGData();

  let element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:application/bpmn20-xml;charset=UTF-8,' + svgData
  );
  element.setAttribute('download', sanitizeForDesktop(filename) + '.svg');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function setEncoded(data) {
  cacheData = data;
}

function createSVGData() {

  // to ensure that the title and description are inside the SVG container and do not overlapp with any elements,
  // we change the confines of the SVG viewbox
  let descriptionText = infoText.innerHTML;
  let titleText = title.innerHTML;
  let viewBoxIndex = cacheData.indexOf('width="');

  let { width, height, viewBox } = viewBoxCoordinates(cacheData);

  let xLeft, xRight, yUp, yDown;
  let bounds = '';
  let splitViewBox = viewBox.split(/\s/);

  height += 80;
  xLeft = +splitViewBox[0];
  yUp = +splitViewBox[1];
  xRight = +splitViewBox[2];
  yDown = +splitViewBox[3];

  if (xRight < 300) {
    xRight += 300;
    width += 300;
  }

  // to display the title and description in the SVG-file, we need to add a container for our text-elements
  let { insertText, extraHeight } = createTitleAndDescriptionSVGElement(
    titleText,
    descriptionText,
    xLeft,
    yUp,
    width
  );
  height += extraHeight;

  bounds =
    'width="' +
    width +
    '" height=" ' +
    height +
    '" viewBox="' +
    xLeft +
    ' ' +
    (yUp - 80) +
    ' ' +
    xRight +
    ' ' +
    (yDown + 30);
  let dataStart = cacheData.substring(0, viewBoxIndex);
  viewBoxIndex = cacheData.indexOf('" version');
  let dataEnd = cacheData.substring(viewBoxIndex);
  dataEnd.substring(viewBoxIndex);

  cacheData = dataStart + bounds + dataEnd;

  let insertIndex = cacheData.indexOf('</defs>');
  if (insertIndex < 0) {
    insertIndex = cacheData.indexOf('version="1.1">') + 14;
  } else {
    insertIndex += 7;
  }

  cacheData = [
    cacheData.slice(0, insertIndex),
    insertText,
    cacheData.slice(insertIndex)
  ].join('');

  cacheData = appendDST(cacheData);
  console.log(cacheData);

  return encodeURIComponent(cacheData);
}

function viewBoxCoordinates(svg) {
  const ViewBoxCoordinate = /width="([^"]+)"\s+height="([^"]+)"\s+viewBox="([^"]+)"/;
  const match = svg.match(ViewBoxCoordinate);
  return { width: +match[1], height: +match[2], viewBox: match[3] };
}

function appendDST(cacheData) {
  const objects = createObjectListForDSTDownload(version);

  const dstText = JSON.stringify(objects);
  const dst = createConfigAndDst(dstText);
  cacheData+= '\n<!-- <DST>\n' + JSON.stringify(dst) + '\n </DST> -->';
  return cacheData;
}
