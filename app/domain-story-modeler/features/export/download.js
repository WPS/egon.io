'use strict';

import sanitize from '../../util/Sanitizer';
import { getAllObjectsFromCanvas } from '../../util/CanvasObjects';

var image = document.createElement('img'),
    title = document.getElementById('title'),
    infoText = document.getElementById('infoText');
var svgData;
var width, height;

export function createObjectListForDownload(modeler, canvas, version) {

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

export function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename + '.dst');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

export function downloadPNG() {
  var canv = document.getElementById('canvas');
  var con = canv.getElementsByClassName('djs-container');
  var svgs = con[0].getElementsByTagName('svg');
  var topSVG = svgs[0];
  var bendpoints= topSVG.getElementsByClassName('djs-bendpoints');

  // removes unwanted black dots in image
  for (var i=0; i<bendpoints.length;i++) {
    bendpoints[i].parentNode.removeChild(bendpoints[i]);
  }
  var svg = new XMLSerializer().serializeToString(topSVG);

  svg = prepareSVG(svg);

  svg = URIHashtagFix(svg);


  image.onload = function() {
    console.log('onload');
    var tempCanvas = document.createElement('canvas');
    // add a 10px buffer to the right and lower boundary
    tempCanvas.width = width + 10;
    tempCanvas.height = height + 10;

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

  image.width = width;
  image.height = height;
  image.src=('data:image/svg+xml,' + svg);
}

function URIHashtagFix(svg) {
  var fix = false;
  var browser = navigator.browserSpecs;

  var name = browser.name;
  var version = browser.version;

  // only implemented in chrome and firefox at the moment
  if (name.includes('Chrome')) {
    if (version >= 72) {
      fix = true;
    }
  }
  else if (name.includes('Firefox')) {
    fix = true;
    // versionNumber of implementation unknown
  }
  if (fix) {
    while (svg.includes('#')) {
      svg=svg.replace('#', '%23');
    }
  }
  return svg;
}

navigator.browserSpecs = (function() {
  var ua = navigator.userAgent, tem,
      M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
  if (/trident/i.test(M[1])) {
    tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
    return { name:'IE',version:(tem[1] || '') };
  }
  if (M[1]=== 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem != null) return { name:tem[1].replace('OPR', 'Opera'),version:tem[2] };
  }
  M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
  if ((tem = ua.match(/version\/(\d+)/i))!= null)
    M.splice(1, 1, tem[1]);
  return { name:M[0], version:M[1] };
})();

export function prepareSVG(svg) {
  var bounds = '';

  let { xLeft, xRight, yUp, yDown } = findMostOuterElements(svg);

  yUp -= 75; // we need to adjust yUp to have space for the title and description

  calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

  var viewBoxIndex = svg.indexOf ('width="');
  bounds = 'width="100%" height="100%" viewBox=" ' + xLeft + ' ' + yUp + ' ' + xRight + ' ' + (yDown + 100)+'" ';
  // We add 100 Pixel as the lower y bound, to compensate for the 100 pixel for the description with padding
  var dataStart = svg.substring(0, viewBoxIndex);
  viewBoxIndex = svg.indexOf('style="');
  var dataEnd = svg.substring(viewBoxIndex);
  dataEnd.substring(viewBoxIndex);

  svg = dataStart + bounds + dataEnd;

  // remove <br> HTML-elements from the description since they create error in the SVG
  var descriptionText = infoText.innerHTML;
  var titleText = title.innerHTML;
  while (descriptionText.includes('<br>')) {
    descriptionText=descriptionText.replace('<br>', '\n');
  }

  var insertIndex = svg.indexOf('<g class="viewport">') + 20;

  // to display the title and description in the PNG-file, we need to add a container for our text-elements
  var insertText = createInsertText(titleText, descriptionText, xLeft, yUp);

  svg = [svg.slice(0,insertIndex), insertText, svg.slice(insertIndex)].join('');

  return svg;
}

function findMostOuterElements(svg) {
  var xLeft = 0;
  var xRight = 0;
  var yUp =0;
  var yDown = 0;

  const positionRegEx = /transform="translate\(([^"]+)\s+([^"]+)/g;
  const match = svg.match(positionRegEx);
  if (match) {
    match.forEach(element => {
      element = element.replace('transform="translate(', '');
      element = element.replace(')','');
      var positions = element.split(' ');
      if (xRight < positions[0]) {
        xRight = +positions[0];
      }
      else if (xLeft > positions[0]) {
        xLeft = +positions[0];
      }
      if (yDown < positions[1]) {
        yDown = +positions[1];
      }
      else if (yUp > positions[1]) {
        yUp = +positions[1];
      }
    });
  }

  xRight += 100;
  yDown += 75;
  return {
    xLeft: xLeft,
    xRight: xRight,
    yUp: yUp,
    yDown: yDown
  };
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
        '<g class="djs-element djs-shape" style = "display:block" transform="translate('+ (xLeft + 10)+' '+(yUp + 25)+')">'+
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
  var insertText = createInsertText(titleText, descriptionText, xLeft, yUp - 75);

  data = [data.slice(0,insertIndex), insertText, data.slice(insertIndex)].join('');
  svgData = encodeURIComponent(data);
}

const ViewBoxCoordinate = /width="([^"]+)"\s+height="([^"]+)"\s+viewBox="([^"]+)"/;
function viewBoxCoordinates(svg) {
  const match = svg.match(ViewBoxCoordinate);
  return { width: +match[1], height : +match[2], viewBox: match[3] };
}

function calculateWidthAndHeight(xLeft, xRight, yUp, yDown) {
  if (xRight < 300 && xRight > 0) {
    xRight += 300;
  } else if (xRight > -300 && xRight < 0) {
    xRight -= 300;
  }
  if (yDown < 300 && yDown >0) {
    yDown += 300;
  } else if (yDown > -300 && yDown < 0) {
    yDown -= 300;
  }

  if (xLeft <0) {
    if (xRight <0) {
      width = -1* (xLeft + xRight);
    }
    else {
      width = xRight - xLeft;
    }
  } else {
    if (xRight < 0) {
      width = xLeft - xRight;
    } else {
      width = xLeft + xRight;
    }
  }

  if (yUp <0) {
    if (yDown <0) {
      height = -1* (yUp + yDown);
    }
    else {
      height = yDown - yUp;
    }
  } else {
    if (yDown < 0) {
      height = yUp - yDown;
    } else {
      height = yUp + yDown;
    }
  }

}