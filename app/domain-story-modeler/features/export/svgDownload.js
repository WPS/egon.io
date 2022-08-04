'use strict';

import { createTitleAndDescriptionSVGElement } from './createTitleAndInfo';
import { sanitizeForDesktop } from '../../util/Sanitizer';
import { createConfigAndDst, createObjectListForDSTDownload } from './dstDownload';
import { version } from '../../../../package.json';

let title = document.getElementById('title'),
    infoText = document.getElementById('infoText');
let cacheData;

export function downloadSVG(filename, withTitle) {
  const svgData = createSVGData(withTitle);

  let element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:application/bpmn20-xml;charset=UTF-8,' + svgData
  );
  element.setAttribute('download', sanitizeForDesktop(filename) + '.dst.svg');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
export function setEncoded(data) {
  cacheData = data;
}

function createSVGData(withTitle) {

  let data = JSON.parse(JSON.stringify(cacheData));
  
  if (withTitle) {
    // to ensure that the title and description are inside the SVG container and do not overlapp with any elements,
    // we change the confines of the SVG viewbox
    let descriptionText = infoText.innerHTML;
    let titleText = title.innerHTML;
    let viewBoxIndex = data.indexOf('width="');

    let { width, height, viewBox } = viewBoxCoordinates(data);

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
    let dataStart = data.substring(0, viewBoxIndex);
    viewBoxIndex = data.indexOf('" version');
    let dataEnd = data.substring(viewBoxIndex);
    dataEnd.substring(viewBoxIndex);

    data = dataStart + bounds + dataEnd;

    let insertIndex = data.indexOf('</defs>');
    if (insertIndex < 0) {
      insertIndex = data.indexOf('version="1.2">') + 14;
    } else {
      insertIndex += 7;
    }

    data = [
      data.slice(0, insertIndex),
      insertText,
      data.slice(insertIndex)
    ].join('');
  }

  data = appendDST(data);

  return encodeURIComponent(data);
}

function viewBoxCoordinates(svg) {
  const ViewBoxCoordinate = /width="([^"]+)"\s+height="([^"]+)"\s+viewBox="([^"]+)"/;
  const match = svg.match(ViewBoxCoordinate);
  return { width: +match[1], height: +match[2], viewBox: match[3] };
}

function appendDST(data) {
  const objects = createObjectListForDSTDownload(version);

  const dstText = JSON.stringify(objects);
  const dst = createConfigAndDst(dstText);
  data+= '\n<!-- <DST>\n' + JSON.stringify(dst) + '\n </DST> -->';
  return data;
}
