'use strict';

import { testMode } from '../../language/testmode';

var highlightList = [];
var isOpen = false;
var canvasHasChanged = false;
var allTSpan;
var searchForTextInput = document.getElementById('searchForTextInput');
var searchFortextContainer = document.getElementById('searchFortextContainer');
var closeSearchForTextButton = document.getElementById('closeSearchForTextButton');


export function openSearchForText() {

  if (!isOpen) {
    isOpen = true;
    allTSpan = document.querySelectorAll('tspan');
    searchFortextContainer.style.display = 'inherit';
  }

  searchForTextInput.focus();
}

export function updateSearch() {
  canvasHasChanged = true;
}

if (!testMode()) {
  searchForTextInput.addEventListener('keyup', function() {
    if (isOpen) {
      removeHighlighting();
      if (canvasHasChanged) {
        canvasHasChanged = true;
        allTSpan = document.querySelectorAll('tspan');
      }
      var text = searchForTextInput.value;
      if (text.length > 0) {
        for (var i=0; i<allTSpan.length; i++) {
          var tspan = allTSpan[i];
          if (tspan.innerHTML.includes(text)) {
            highlightList.push(tspan);
          }
        }
        hightlight();
      }
    }
  });
  closeSearchForTextButton.addEventListener('click', function(e) {
    removeHighlighting();
    isOpen = false;
    searchForTextInput.value='';
    searchFortextContainer.style.display = 'none';
  });
}


// svgs do not support background colors for text or tspan, thus we have to create a rectange as highlighting.
// since svg elements are drawn in the order they appear in the DOM tree, we need to remove the text-element
// and re-add it after adding the highlighting rectangle
function hightlight() {
  highlightList.forEach(tspan => {
    var SVGRect = tspan.getBBox();
    var text = tspan.parentElement;
    var parent = text.parentElement;

    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', SVGRect.x);
    rect.setAttribute('y', SVGRect.y);
    rect.setAttribute('width', SVGRect.width);
    rect.setAttribute('height', SVGRect.height);
    rect.setAttribute('fill', 'yellow');
    rect.setAttribute('id', 'highlight');

    parent.removeChild(text);
    parent.appendChild(rect);
    parent.appendChild(text);
  });
}

function removeHighlighting() {
  highlightList.forEach(tspan => {
    var text = tspan.parentElement;
    if (text) {
      var parent = text.parentElement;
      if (parent) {
        var children = parent.children;
        var rect = children[children.length-2];
        if (rect) {
          parent.removeChild(rect);
        }
      }
    }
  });
  highlightList.clear();
}

