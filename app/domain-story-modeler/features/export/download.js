'use strict';

import sanitize from '../../util/Sanitizer';

var image = document.createElement('img'),
    title = document.getElementById('title'),
    infoText = document.getElementById('infoText');
var svgData;

export function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename + '.dst');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

image.onload = function() {

  var tempCanvas = document.createElement('canvas');

  var ctx = tempCanvas.getContext('2d');
  ctx.drawImage(image, 0, 0);

  var png64 = tempCanvas.toDataURL('image/png');
  var ele = document.createElement('a');
  ele.setAttribute('download', title.innerText + '_' + new Date().toISOString().slice(0, 10) +'.png');
  ele.setAttribute('href', png64);
  document.body.appendChild(ele);
  ele.click();
  document.body.removeChild(ele);
};

export function downloadPNG() {
  var canv = document.getElementById('canvas');
  var con = canv.getElementsByClassName('djs-container');
  var svgs = con[0].getElementsByTagName('svg');
  var top = new XMLSerializer().serializeToString(svgs[0]);

  top = prepareSVG(top);

  while (top.includes('#')) {
    top = top.replace('#', '%23');
  }

  let { width, height, viewBox } = viewBoxCoordinates(top);
  height += 80;

  var xRight;
  var splitViewBox = viewBox.split(/\s/);
  xRight = +splitViewBox[2];

  if (xRight < 300) {
    xRight+= 300;
    width+= 300;
  }

  image.src=('data:image/svg+xml,' + top);

}

export function prepareSVG(top) {

  let { width, height, viewBox } = viewBoxCoordinates(top);
  height += 80;

  var xLeft, xRight, yUp;
  var splitViewBox = viewBox.split(/\s/);

  xLeft = +splitViewBox[0];
  yUp = +splitViewBox[1];
  xRight = +splitViewBox[2];

  if (xRight < 300) {
    xRight+= 300;
    width+= 300;
  }

  // remove <br> HTML-elements from the description since they create error in the SVG
  var descriptionText = infoText.innerHTML;
  var titleText = title.innerHTML;

  while (descriptionText.includes('<br>')) {
    descriptionText=descriptionText.replace('<br>', '\n');
  }
  titleText = titleText.replace('&lt;','').replace('&gt;','');

  var insertIndex = top.indexOf('<g class="viewport">') + 20;

  // to display the title and description in the PNG-file, we need to add a container for our text-elements
  var insertText = createInsertText(titleText, descriptionText, xLeft, yUp);

  top = [top.slice(0,insertIndex), insertText, top.slice(insertIndex)].join('');
  top = top.replace('100%', 5000);
  top=top.replace('100%', 5000);

  return top;
}

export function downloadSVG(filename) {

  var element = document.createElement('a');
  element.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + svgData);
  element.setAttribute('download', filename + '.svg');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function createInsertText(titleText, descriptionText, xLeft, yUp) {
  while (descriptionText.includes('<br>')) {
    descriptionText=descriptionText.replace('<br>', '\n');
  }
  titleText = titleText.replace('&lt;','').replace('&gt;','');

  // to display the title and description in the SVG-file, we need to add a container for our text-elements
  var insertText ='<g class="djs-group">'+
        '<g class="djs-element djs-shape" style = "display:block" transform="translate('+(xLeft+10)+' '+(yUp-50)+')">'+
        '<g class="djs-visual">'
        +'<text lineHeight="1.2" class="djs-label" style="font-family: Arial, sans-serif; font-size: 30px; font-weight: normal; fill: rgb(0, 0, 0);"><tspan x="8" y="10">'
    +sanitize(titleText)+
    '</tspan></text>'
    +'<text lineHeight="1.2" class="djs-label" style="font-family: Arial, sans-serif; font-size: 12px; font-weight: normal; fill: rgb(0, 0, 0);"><tspan x="8" y="30">'
    +sanitize(descriptionText)+
    '</tspan></text></g></g></g>';
  return insertText;
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
  var insertText = createInsertText(titleText, descriptionText, xLeft, yUp);

  data = [data.slice(0,insertIndex), insertText, data.slice(insertIndex)].join('');
  svgData = encodeURIComponent(data);
}



const ViewBoxCoordinate = /width="([^"]+)"\s+height="([^"]+)"\s+viewBox="([^"]+)"/;
function viewBoxCoordinates(svg) {
  const match = svg.match(ViewBoxCoordinate);
  return { width: +match[1], height : +match[2], viewBox: match[3] };
}