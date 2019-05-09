'use strict';

let extraHeight = 0;
const titleHeight = 30, descriptionHeight = 15;
const xOffset = 8;
const NS='http://www.w3.org/2000/svg';

export function createTitleAndDescriptionSVGElement(titleText, descriptionText, xLeft, yUp, width) {

  titleText = titleText.replace('&lt;','').replace('&gt;','');

  let insertText = '';
  let title = createTitle(titleText, width);
  let description = createDescription(descriptionText, width);

  // to display the title and description in the SVG-file, we need to add a container for our text-elements
  insertText ='<g class="djs-group"><g class="djs-element djs-shape" style = "display:block" transform="translate('+
    (xLeft + 10) + ' ' + (yUp - extraHeight) + ')"><g class="djs-visual">'
    + title + description + '</g></g></g>';
  return { insertText, extraHeight };
}

function createTitle(text, width) {
  let tempCanvas = document.createElement('canvas');
  let ctx = tempCanvas.getContext('2d');
  ctx.font = '30px Arial';

  return createTextSpans(text, width, ctx, 10, titleHeight, 30);
}

function createDescription(text, width) {
  let description ='';
  let descriptionParts = text.split('<br>');

  let tempCanvas = document.createElement('canvas');
  let ctx = tempCanvas.getContext('2d');
  ctx.font= '12px Arial';

  for (let i=0; i < descriptionParts.length;i++) {
    description+= createTextSpans(descriptionParts[i], width, ctx, 0, descriptionHeight, 12);
  }
  return description;
}

function createTextSpans(text, width, ctx, yOffest, heightOffset, fontSize) {
  let textSpans='';
  let words = text.split(' ');

  let textTag = '<text lineHeight="1.2" class="djs-label" style="font-family: Arial, sans-serif; font-size: ' + fontSize + '; font-weight: normal; fill: rgb(0, 0, 0);">';

  let textSpan = document.createElementNS(NS, 'tspan');
  let textNode = document.createTextNode(words[0]);

  textSpan.setAttribute('x', xOffset);
  textSpan.setAttribute('y', (yOffest + extraHeight));
  textSpan.setAttribute('font-size', fontSize);
  textSpan.appendChild(textNode);

  for (let j =1; j<words.length; j++) {
    let len = textSpan.firstChild.data.length;
    textNode.data += ' ' + words[j];

    if (ctx.measureText(textNode.data).width > (width - 16)) {
      extraHeight += heightOffset;
      textSpan.firstChild.data = textSpan.firstChild.data.slice(0, len); // remove overflow word

      textSpans += textTag + textSpan.outerHTML + '</text>'; // append line

      // create new textspan for line break
      textSpan = document.createElementNS(NS, 'tspan');
      textNode = document.createTextNode(words[j]);
      textSpan.setAttribute('x', xOffset);
      textSpan.setAttribute('y', (yOffest + extraHeight));
      textSpan.appendChild(textNode);
    }
  }
  extraHeight += heightOffset;

  textSpans += textTag + textSpan.outerHTML + '</text>';
  return textSpans;
}