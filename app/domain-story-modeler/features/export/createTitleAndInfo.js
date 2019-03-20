'use strict';

import sanitize from '../../util/Sanitizer';

export function createTitleAndDescriptionSVGElement(titleText, descriptionText, xLeft, yUp) {
  var titleHeight = 30, descriptionHeight = 15;
  var extraHeight = 0;

  var descriptionParts = descriptionText.split('<br>');
  extraHeight = descriptionParts.length * descriptionHeight;

  titleText = titleText.replace('&lt;','').replace('&gt;','');

  // to display the title and description in the SVG-file, we need to add a container for our text-elements
  var insertText ='<g class="djs-group">'+
            '<g class="djs-element djs-shape" style = "display:block" transform="translate('+ (xLeft + 10)+' '+(yUp - extraHeight)+')">'+
            '<g class="djs-visual">'
            +'<text lineHeight="1.2" class="djs-label" style="font-family: Arial, sans-serif; font-size: ' + titleHeight + 'px; font-weight: normal; fill: rgb(0, 0, 0);"><tspan x="8" y="10">'
            +sanitize(titleText) +
            '</tspan></text>';
  for (var i=0; i < descriptionParts.length;i++) {
    insertText += '<text lineHeight="1.2" class="djs-label" style="font-family: Arial, sans-serif; font-size: 12px; font-weight: normal; fill: rgb(0, 0, 0);"><tspan x="8" y="' + (titleHeight + descriptionHeight * i) + '">'
    +sanitize(descriptionParts[i])+
    '</tspan></text>';
  }
  insertText += '</g></g></g>';
  return { insertText, extraHeight };
}