'use strict';

import { createTitleAndDescriptionSVGElement } from './createTitleAndInfo';
import sanitizeForDesktop from '../../util/Sanitizer';

var image = document.createElement('img');
var width, height;
var title = document.getElementById('title'),
    infoText = document.getElementById('infoText');

export function downloadPNG() {
  var canvas = document.getElementById('canvas');
  var container = canvas.getElementsByClassName('djs-container');
  var svgElements = container[0].getElementsByTagName('svg');
  var outerSVGElement = svgElements[0];
  var viewport = outerSVGElement.getElementsByClassName('viewport')[0];
  var layerBase= viewport.getElementsByClassName('layer-base')[0];

  var bendpoints= outerSVGElement.getElementsByClassName('djs-bendpoints');
  var bendpoint= outerSVGElement.getElementsByClassName('djs-bendpoint');
  var segmentDraggers = outerSVGElement.getElementsByClassName('djs-segment-dragger');

  // removes unwanted black dots in image
  var i;
  for (i=0; i<bendpoints.length;i++) {
    bendpoints[i].parentNode.removeChild(bendpoints[i]);
  }
  for (i=0; i<bendpoint.length;i++) {
    bendpoint[i].parentNode.removeChild(bendpoint[i]);
  }
  for (i=0; i<segmentDraggers.length;i++) {
    segmentDraggers[i].parentNode.removeChild(segmentDraggers[i]);
  }

  var svg = new XMLSerializer().serializeToString(outerSVGElement);

  svg = prepareSVG(svg, layerBase);

  image.onload = function() {
    var tempCanvas = document.createElement('canvas');
    // add a 10px buffer to the right and lower boundary
    tempCanvas.width = width + 10;
    tempCanvas.height = height + 10;

    var ctx = tempCanvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    var png64 = tempCanvas.toDataURL('image/png');
    var ele = document.createElement('a');
    ele.setAttribute('download', sanitizeForDesktop(title.innerText) + '_' + new Date().toISOString().slice(0, 10) +'.png');
    ele.setAttribute('href', png64);
    document.body.appendChild(ele);
    ele.click();
    document.body.removeChild(ele);
  };

  image.width = width;
  image.height = height;
  image.src=('data:image/svg+xml,' + svg);
}

function prepareSVG(svg, layertBase) {
  let { xLeft, xRight, yUp, yDown } = findMostOuterElements(layertBase);

  calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

  var viewBoxIndex = svg.indexOf ('width="');
  var bounds = 'width="'+width+'" height="'+height+'" viewBox=" ' + xLeft + ' ' + yUp + ' ' + (width)+ ' ' + (height)+'" ';

  var dataStart = svg.substring(0, viewBoxIndex);
  viewBoxIndex = svg.indexOf('style="');
  var dataEnd = svg.substring(viewBoxIndex);
  dataEnd.substring(viewBoxIndex);

  svg = dataStart + bounds + dataEnd;

  // remove <br> HTML-elements from the description since they create errors in the SVG
  var descriptionText = infoText.innerHTML;
  var titleText = title.innerHTML;
  while (descriptionText.includes('<br>')) {
    descriptionText=descriptionText.replace('<br>', '\n');
  }

  var insertIndex = svg.indexOf('<g class="viewport">') + 20;

  // to display the title and description in the PNG-file, we need to add a container for our text-elements
  var insertText = createTitleAndDescriptionSVGElement(titleText, descriptionText, xLeft, yUp);
  svg = [svg.slice(0,insertIndex), insertText, svg.slice(insertIndex)].join('');

  svg = URIHashtagFix(svg);

  return svg;
}

// fixes # symbols in data URIs not being escaped
function URIHashtagFix(svg) {
  var fix = false;

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

  var browser = navigator.browserSpecs;

  var name = browser.name;
  var version = browser.version;

  // only implemented in chrome and firefox at the moment
  if (name.includes('Chrome')) {
    if (version >= 72) {
      fix = true;
      // https://www.chromestatus.com/features/5656049583390720
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

export function calculateWidthAndHeight(xLeft, xRight, yUp, yDown) {

  if (xLeft <0) {
    if (xRight <0) {
      width = Math.abs(xLeft - xRight);
    }
    else {
      width = Math.abs(xLeft) + xRight;
    }
  } else {
    width = xRight - xLeft;
  }

  if (yUp <0) {
    if (yDown <0) {
      height = Math.abs(yUp - yDown);
    }
    else {
      height = Math.abs(yUp) + yDown;
    }
  } else {
    height = yDown- yUp;
  }

  // If the domain-Story is smaller than 300px in width or height, increase its dimensions
  if (height <300) {
    height+=300;
    yUp -= 150;
    yDown += 150;
  }
  if (width <300) {
    width +=300;
    xLeft -= 150;
    xRight += 150;
  }
  return [height, width];
}

function findMostOuterElements(svg) {
  var xLeft = 0;
  var xRight = 0;
  var yUp =0;
  var yDown = 0;

  var elements = svg.getElementsByClassName('djs-group');

  for (var i=0; i<elements.length; i++) {

    var element = elements[i];
    var sub= element.children;

    var elXLeft, elXRight, elYUp, elYDown;

    var transform = sub[0].getAttribute('transform');
    if (transform) {
      var nums;

      if (transform.includes('matrix')) {
        transform.replace('matrix(', '');
        transform.replace(')');
        nums = transform.split(' ');
        elXLeft = parseInt(nums[4]);
        elYUp = parseInt(nums[5]);
      } else {
        transform.replace('translate(');
        transform.replace(')');
        nums = transform.split(' ');
        elXLeft = parseInt(nums[0]);
        elYUp = parseInt(nums[1]);
      }

      var rects = sub[0].getElementsByTagName('rect');
      var outerRect = rects[rects.length-1];

      elXRight = elXLeft + parseInt(outerRect.getAttribute('width'));
      elYDown = elYUp + parseInt(outerRect.getAttribute('height'));
    }
    if (elXLeft < xLeft) {
      xLeft = elXLeft;
    }
    if (elXRight > xRight) {
      xRight = elXRight;
    }
    if (elYUp < yUp) {
      yUp = elYUp;
    }
    if (elYDown > yDown) {
      yDown = elYDown;
    }
  }

  yUp -= 75; // we need to adjust yUp to have space for the title and description

  return {
    xLeft: xLeft,
    xRight: xRight,
    yUp: yUp,
    yDown: yDown
  };
}