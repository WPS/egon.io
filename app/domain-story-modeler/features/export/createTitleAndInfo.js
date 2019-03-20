'use strict';
var extraHeight = 0;
var titleHeight = 30, descriptionHeight = 15;
var xOffset = 8;
var NS='http://www.w3.org/2000/svg';

export function createTitleAndDescriptionSVGElement(titleText, descriptionText, xLeft, yUp, width) {

  titleText = titleText.replace('&lt;','').replace('&gt;','');

  var insertText = '';
  var title = createTitle(titleText, width);
  var description = createDescription(descriptionText, width);

  // to display the title and description in the SVG-file, we need to add a container for our text-elements
  insertText ='<g class="djs-group">'+
  '<g class="djs-element djs-shape" style = "display:block" transform="translate('+ (xLeft + 10)+' '+(yUp - extraHeight)+')">'+
  '<g class="djs-visual">'
  + title + description + '</g></g></g>';
  return { insertText, extraHeight };
}

function createTitle(text, width) {
  var title ='';

  var tempCanvas = document.createElement('canvas');
  var ctx = tempCanvas.getContext('2d');
  ctx.font = '30px Arial';

  title = createTextSpans(text, width, ctx, 10, titleHeight, 30);

  return title;
}

function createDescription(text, width) {
  var description ='';
  var descriptionParts = text.split('<br>');

  var tempCanvas = document.createElement('canvas');
  var ctx = tempCanvas.getContext('2d');
  ctx.font= '12px Arial';

  for (var i=0; i < descriptionParts.length;i++) {

    description+= createTextSpans(descriptionParts[i], width, ctx, 0, descriptionHeight, 12);
  }
  return description;
}

function createTextSpans(text, width, ctx, yOffest, heightOffset, fontSize) {
  var textSpans='';
  var words = text.split(' ');

  var textSpan = document.createElementNS(NS, 'tspan');
  var textNode = document.createTextNode(words[0]);

  textSpan.setAttribute('x', xOffset);
  textSpan.setAttribute('y', (yOffest + extraHeight));
  textSpan.setAttribute('font-size', fontSize);
  textSpan.appendChild(textNode);

  for (var j =1; j<words.length; j++) {
    var len = textSpan.firstChild.data.length;
    textNode.data += ' ' + words[j];

    if (ctx.measureText(textNode.data).width > (width - 16)) {
      extraHeight += heightOffset;
      textSpan.firstChild.data = textSpan.firstChild.data.slice(0, len);
      textSpans += '<text lineHeight="1.2" class="djs-label" style="font-family: Arial, sans-serif; font-size: ' + fontSize + '; font-weight: normal; fill: rgb(0, 0, 0);">'
        + textSpan.outerHTML
        + '</text>';
      textSpan = document.createElementNS(NS, 'tspan');
      textNode = document.createTextNode(words[j]);
      textSpan.setAttribute('x', xOffset);
      textSpan.setAttribute('y', (yOffest + extraHeight));
      textSpan.appendChild(textNode);
    }
  }
  extraHeight += heightOffset;

  textSpans += '<text lineHeight="1.2" class="djs-label" style="font-family: Arial, sans-serif; font-size: ' + fontSize + '; font-weight: normal; fill: rgb(0, 0, 0);">'
    + textSpan.outerHTML
    + '</text>';
  return textSpans;
}