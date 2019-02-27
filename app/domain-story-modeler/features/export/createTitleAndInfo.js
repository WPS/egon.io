'use strict';

import sanitize from '../../util/Sanitizer';

export function createTitleAndDescriptionSVGElement(titleText, descriptionText, xLeft, yUp) {
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