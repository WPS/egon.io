'use strict';

import { createTitleAndDescriptionSVGElement } from './createTitleAndInfo';
import { sanitizeForDesktop } from '../../util/Sanitizer';

let width, height;
let title = document.getElementById('title'),
    infoText = document.getElementById('infoText');

export function downloadPNG(withTitle) {
  let canvas = document.getElementById('canvas');
  let container = canvas.getElementsByClassName('djs-container');
  let svgElements = container[0].getElementsByTagName('svg');
  let outerSVGElement = svgElements[0];
  let viewport = outerSVGElement.getElementsByClassName('viewport')[0];
  let layerBase = viewport.getElementsByClassName('layer-base')[0];

  let image = document.createElement('img');

  let onLoadTriggered = false;

  // removes unwanted black dots in image
  let svg = extractSVG(viewport);

  svg = prepareSVG(svg, layerBase, withTitle);

  image.onload = function() {
    onLoadTriggered = true;
    let tempCanvas = document.createElement('canvas');

    // add a 10px buffer to the right and lower boundary
    tempCanvas.width = width + 10;
    tempCanvas.height = height + 10;

    let ctx = tempCanvas.getContext('2d');

    // fill with white background
    ctx.rect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.fillStyle = 'white';
    ctx.fill();

    ctx.drawImage(image, 0, 0);

    let png64 = tempCanvas.toDataURL('image/png');
    let ele = document.createElement('a');
    ele.setAttribute(
      'download',
      sanitizeForDesktop(title.innerText) +
        '_' +
        new Date().toISOString().slice(0, 10) +
        '.png'
    );
    ele.setAttribute('href', png64);
    document.body.appendChild(ele);
    ele.click();
    document.body.removeChild(ele);

    // image source has to be removed to circumvent browser caching
    image.src ='';
  };
  image.onchange = image.onload;

  image.width = width;
  image.height = height;

  image.src = 'data:image/svg+xml,' + svg;

  if (image.complete && !onLoadTriggered) {
    onLoadTriggered = true;
    let tempCanvas = document.createElement('canvas');

    // add a 10px buffer to the right and lower boundary
    tempCanvas.width = width + 10;
    tempCanvas.height = height + 10;

    let ctx = tempCanvas.getContext('2d');
    ctx.drawImage(image, 0, 0);

    let png64 = tempCanvas.toDataURL('image/png');
    let ele = document.createElement('a');
    ele.setAttribute(
      'download',
      sanitizeForDesktop(title.innerText) +
        '_' +
        new Date().toISOString().slice(0, 10) +
        '.png'
    );
    ele.setAttribute('href', png64);
    document.body.appendChild(ele);
    ele.click();
    document.body.removeChild(ele);

    // image source has to be removed to circumvent browser caching
    image.src ='';
  }


  function extractSVG(viewport) {
    let layerResizers = viewport.getElementsByClassName('layer-resizers');
    let layerOverlays = viewport.getElementsByClassName('layer-overlays');
    let transform = viewport.getAttribute('transform');
    let translate = viewport.getAttribute('translate');

    const layerRes = layerResizers[0];
    const layerOver= layerOverlays[0];

    const layerResizersParent = layerResizers[0].parentNode;
    const layerOverlaysParent = layerOverlays[0].parentNode;

    if (layerResizers[0]) {
      layerResizers[0].parentNode.removeChild(layerResizers[0]);
    }
    if (layerOverlays[0]) {
      layerOverlays[0].parentNode.removeChild(layerOverlays[0]);
    }

    // remove canvas scrolling and scaling before serializeToString of SVG
    if (transform) {
      viewport.removeAttribute('transform');
    }
    if (translate) {
      viewport.removeAttribute('translate');
    }

    let svg = new XMLSerializer().serializeToString(outerSVGElement);

    // re-add canvas scrolling and scaling
    if (transform) {
      viewport.setAttribute('transform', transform);
    }
    if (translate) {
      viewport.setAttribute('translate', translate);
    }

    layerResizersParent.appendChild(layerRes);
    layerOverlaysParent.appendChild(layerOver);

    return svg;
  }
}

export function calculateWidthAndHeight(xLeft, xRight, yUp, yDown) {
  if (xLeft < 0) {
    if (xRight < 0) {
      width = Math.abs(xLeft - xRight);
    } else {
      width = Math.abs(xLeft) + xRight;
    }
  } else {
    width = xRight - xLeft;
  }

  if (yUp < 0) {
    if (yDown < 0) {
      height = Math.abs(yUp - yDown);
    } else {
      height = Math.abs(yUp) + yDown;
    }
  } else {
    height = yDown - yUp;
  }

  // if the domain-Story is smaller than 300px in width or height, increase its dimensions
  if (height < 300) {
    height += 300;
    yUp -= 150;
    yDown += 150;
  }
  if (width < 300) {
    width += 300;
    xLeft -= 150;
    xRight += 150;
  }
  return [height, width];
}

function prepareSVG(svg, layertBase, withTitle) {
  let { xLeft, xRight, yUp, yDown } = findMostOuterElements(layertBase, withTitle);
  let descriptionText = infoText.innerHTML;
  let titleText = title.innerHTML;
  let viewBoxIndex = svg.indexOf('width="');

  calculateWidthAndHeight(xLeft, xRight, yUp, yDown);

  let { insertText, extraHeight } = createTitleAndDescriptionSVGElement(
    titleText,
    descriptionText,
    xLeft,
    yUp + 20,
    width
  );

  let bounds ;
  if (withTitle) {
    height += extraHeight;
    
      bounds = 'width="' +
      width +
      '" height="' +
      height +
      '" viewBox=" ' +
      xLeft +
      ' ' +
      (yUp - extraHeight) +
      ' ' +
      width +
      ' ' +
      height +
      '" ';
  }
  else {
      bounds = 'width="' +
      width +
      '" height="' +
      height +
      '" viewBox=" ' +
      xLeft +
      ' ' +
      yUp +
      ' ' +
      width +
      ' ' +
      height +
      '" ';
  } 

  let dataStart = svg.substring(0, viewBoxIndex);
  viewBoxIndex = svg.indexOf('style="');
  let dataEnd = svg.substring(viewBoxIndex);
  dataEnd.substring(viewBoxIndex);

  svg = dataStart + bounds + dataEnd;

  let insertIndex = svg.indexOf('<g class="viewport">') + 20;

  if(withTitle) {
    svg = [svg.slice(0, insertIndex), insertText, svg.slice(insertIndex)].join(
      ''
    );
  }
  svg = URIHashtagFix(svg);

  return svg;
}

// fixes # symbols in data URIs not being escaped
function URIHashtagFix(svg) {
  let fix = false;

  navigator.browserSpecs = (function() {
    let ua = navigator.userAgent,
        tem,
        M =
        ua.match(
          /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i
        ) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: 'IE', version: tem[1] || '' };
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null)
        return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) M.splice(1, 1, tem[1]);
    return { name: M[0], version: M[1] };
  })();

  let browser = navigator.browserSpecs;

  let name = browser.name;
  let version = browser.version;

  // only implemented in chrome and firefox at the moment
  if (name.includes('Chrome')) {
    if (version >= 72) {
      fix = true;

      // https://www.chromestatus.com/features/5656049583390720
    }
  } else if (name.includes('Firefox')) {
    fix = true;

    // versionNumber of implementation unknown
  }
  if (fix) {
    while (svg.includes('#')) {
      svg = svg.replace('#', '%23');
    }
  }
  return svg;
}

function findMostOuterElements(svg, withTitle) {
  let xLeft = 0;
  let xRight = 0;
  let yUp = 0;
  let yDown = 0;

  let elements = svg.getElementsByClassName('djs-group');

  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    let sub = element.children;

    let elXLeft, elXRight, elYUp, elYDown;

    let transform = sub[0].getAttribute('transform');
    if (transform) {
      let nums;

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

      let rects = sub[0].getElementsByTagName('rect');
      let outerRect = rects[rects.length - 1];

      elXRight = elXLeft + parseInt(outerRect.getAttribute('width'));
      elYDown = elYUp + parseInt(sub[0].getBoundingClientRect().height);
    } else {
      let rects = element.getElementsByTagName('rect');
      let outerRect = rects[rects.length - 1];

      elXLeft = parseInt(outerRect.getAttribute('x'));
      elYUp = parseInt(outerRect.getAttribute('y'));

      elXRight = elXLeft + parseInt(outerRect.getAttribute('width'));
      elYDown = elYUp + parseInt(outerRect.getAttribute('height')) + 20; // Add 20 px as Padding for text at the bottom
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

   if(withTitle) {
    yUp -= 75; // we need to adjust yUp to have space for the title and description
   }

  return {
    xLeft: xLeft,
    xRight: xRight,
    yUp: yUp,
    yDown: yDown
  };
}
