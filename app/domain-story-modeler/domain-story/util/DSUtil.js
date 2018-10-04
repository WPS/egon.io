'use strict';

import { is } from 'bpmn-js/lib/util/ModelUtil';
import { assign } from 'min-dash';

var activityDictionary = [];
var workObjectDictionary =[];

// creates a SVG path that describes a rectangle which encloses the given shape.
export function getRectPath(shape) {
  var offset = 5;
  var x = shape.x,
      y = shape.y,
      width = (shape.width / 2) + offset,
      height = (shape.height / 2) + offset;

  var rectPath = [
    ['M', x, y],
    ['l', width, 0],
    ['l', width, height],
    ['l', -width, height],
    ['l', -width, 0],
    ['z']
  ];
  return rectPath;
}


// returns an array, that references all elements that are either drawn directly on the canvas or inside a group
// the groups themselves are not inside that array
export function getAllObjectsFromCanvas(canvas) {
  var canvasObjects=canvas._rootElement.children;
  var allObjects=[];
  var groupObjects=[];

  // check for every child of the canvas wether it is a group or not
  var i=0;
  for (i = 0; i < canvasObjects.length; i++) {
    if (canvasObjects[i].type.includes('domainStory:group')) {
      // if it is a group, memorize this for later
      groupObjects.push(canvasObjects[i]);
    }
    else {
      allObjects.push(canvasObjects[i]);
    }
  }

  // for each memorized group, remove it from the group-array and check its chidren, wether they are roups or not
  // if a child is a group, memorize it in the goup-array
  // else add the child to the return-array
  i = groupObjects.length - 1;
  while (groupObjects.length >= 1) {
    var currentgroup = groupObjects.pop();
    currentgroup.children.forEach(child => {
      if (child.type.includes('domainStory:group')) {
        groupObjects.push(child);
      }
      else {
        allObjects.push(child);
      }
    });
    i = groupObjects.length - 1;
  }
  return allObjects;
}

// returns all groups on the canvas and inside other groups
export function getAllGroups(canvas) {
  var canvasObjects=canvas._rootElement.children;
  var groupObjects=[];
  var allObjects=[];

  // check for every child of the canvas wether it is a group or not
  var i=0;
  for (i = 0; i < canvasObjects.length; i++) {
    if (canvasObjects[i].type.includes('domainStory:group')) {
      // if it is a group, memorize this for later
      groupObjects.push(canvasObjects[i]);
    }
    else {
      allObjects.push(canvasObjects[i]);
    }
  }
  for (i=0; i<groupObjects.length;i++) {
    var currentgroup=groupObjects[i];
    currentgroup.children.forEach(child => {
      if (child.type.includes('domainStory:group')) {
        groupObjects.push(child);
      }
    });
  }
  return groupObjects;
}

// when importing a domain-story, the elements that are visually inside a group are not yet associated with it.
// to ensure they are correctly associated, we add them to the group
export function correctGroupChildren(canvas) {
  var allObjects = getAllObjectsFromCanvas(canvas);
  var groups = getAllGroups(canvas);

  groups.forEach(group => {
    var parent = group.parent;
    parent.children.slice().forEach(innerShape => {
      if ((innerShape.id) != group.id) {
        if (innerShape.x >= group.x && innerShape.x <= group.x + group.width) {
          if (innerShape.y >= group.y && innerShape.y <= group.y + group.height) {
            innerShape.parent = group;
            if (!group.children.includes(innerShape)) {
              group.children.push(innerShape);
            }
          }
        }
      }
    });
  });
  allObjects.forEach(shape => {
    var businessObject = shape.businessObject;
    if (isInDomainStoryGroup(shape)) {
      assign(businessObject, {
        parent: shape.parent.id
      });
    }
  });
}

// type-checking functions
// check element type
export function isDomainStory(element) {
  return element && /domainStory:/.test(element.type);
}

// check if element is of type domainStory:group
export function isDomainStoryGroup(element) {
  return element && /domainStory:group/.test(element.type);
}

// check if element parent is of type domainStory:group
export function isInDomainStoryGroup(element) {
  return isDomainStoryGroup(element.parent);
}

// check if element in the context of an event is a domainStory element
export function ifDomainStoryElement(fn) {
  return function(event) {
    var context = event.context,
        element = context.shape || context.connection;

    if (isDomainStory(element)) {
      fn(event);
    }
  };
}

export function isDomainStoryElement(element) {
  return is(element, 'domainStory:actorPerson') ||
    is(element, 'domainStory:actorGroup') ||
    is(element, 'domainStory:actorSystem') ||
    is(element, 'domainStory:workObject') ||
    is(element, 'domainStory:workObjectFolder') ||
    is(element, 'domainStory:workObjectCall') ||
    is(element, 'domainStory:workObjectEmail') ||
    is(element, 'domainStory:workObjectBubble') ||
    is(element, 'domainStory:activity') ||
    is(element, 'domainStory:connection') ||
    is(element, 'domainStory:group') ||
    is(element, 'domainStory:workObjectInfo');
}

// dictionary Getter & Setter
export function getActivityDictionary() {
  return activityDictionary.slice();
}

export function getWorkObjectDictionary() {
  return workObjectDictionary.slice();
}

export function cleanDictionaries(canvas) {
  cleanActicityDictionary(canvas);
  cleanWorkObjecDictionary(canvas);

  var dictionaryButton = document.getElementById('dictionaryButton');

  if (activityDictionary.length > 0 || workObjectDictionary.length >0) {
    dictionaryButton.style.opacity = 1;
    dictionaryButton.style.pointerEvents = 'all';

    dictionaryButton.onmouseover = function() {
      dictionaryButton.style.border = '1px solid #CCC';
    };
    dictionaryButton.onmouseout = function() {
      dictionaryButton.style.border = '';
    };
  } else {
    dictionaryButton.style.opacity = 0.2;
    dictionaryButton.style.pointerEvents = 'none';

    dictionaryButton.onmouseover = function() { };
    dictionaryButton.onmouseout = function() { };
  }
}

// rework the activity-dictionary with the changed labels on the canvas
function cleanActicityDictionary(canvas) {
  activityDictionary=[];
  var allObjects = getAllObjectsFromCanvas(canvas);
  allObjects.forEach(element => {
    var name=element.businessObject.name;
    if (name.length > 0 && element.type.includes('domainStory:activity') && !activityDictionary.includes(name)) {
      activityDictionary.push(name);
    }
  });
  activityDictionary.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
}

// rework the label-dictionary with the changed labels on the canvas
function cleanWorkObjecDictionary(canvas) {
  workObjectDictionary = [];

  var allObjects = getAllObjectsFromCanvas(canvas);

  allObjects.forEach(element =>{
    var name = element.businessObject.name;
    if (name.length > 0 && element.type.includes('domainStory:workObject') && !workObjectDictionary.includes(name)) {
      workObjectDictionary.push(name);
    }
  });
  workObjectDictionary.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
}

// Math functions
// calculate the angle between two points in 2D
export function calculateDeg(startPoint, endPoint) {
  var quadrant = 0;

  // determine in which quadrant we are
  if (startPoint.x <= endPoint.x) {
    if (startPoint.y >= endPoint.y)
      quadrant = 0; // upper right quadrant
    else quadrant = 3; // lower right quadrant
  }
  else {
    if (startPoint.y >= endPoint.y)
      quadrant = 1; // upper left uadrant
    else quadrant = 2; // lower left quadrant
  }

  var adjacenten = Math.abs(startPoint.y - endPoint.y);
  var opposite = Math.abs(startPoint.x - endPoint.x);

  // since the arcus-tangens only gives values between 0 and 90, we have to adjust for the quadrant we are in

  if (quadrant == 0) {
    return 90 - Math.degrees(Math.atan2(opposite, adjacenten));
  }
  if (quadrant == 1) {
    return 90 + Math.degrees(Math.atan2(opposite, adjacenten));
  }
  if (quadrant == 2) {
    return 270 - Math.degrees(Math.atan2(opposite, adjacenten));
  }
  if (quadrant == 3) {
    return 270 + Math.degrees(Math.atan2(opposite, adjacenten));
  }
}

// convert rad to deg
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

// approximate the width of the label text, standard fontsize: 11
export function calculateTextWidth(text) {
  var fontsize = text.length * 5.1;
  fontsize = fontsize / 2;
  // add an initial offset, since the calculateXY Position gives the absolute middle of the activity
  // and we want the start directly under the number
  fontsize += 20;
  return fontsize;
}

// -- helpers --//

export function copyWaypoints(connection) {
  return connection.waypoints.map(function(p) {
    if (p.original) {
      return {
        original: {
          x: p.original.x,
          y: p.original.y
        },
        x: p.x,
        y: p.y
      };
    } else {
      return {
        x: p.x,
        y: p.y
      };
    }
  });
}

/**
 * copied from https://www.w3schools.com/howto/howto_js_autocomplete.asp on 18.09.2018
 */
export function autocomplete(inp, arr, element) {
  closeAllLists();

  /* the autocomplete function takes three arguments,
  the text field element and an array of possible autocompleted values and an optional element to which it is appended:*/
  var currentFocus;
  /* execute a function when someone writes in the text field:*/
  inp.addEventListener('input', function(e) {
    /* the direct editing field of actors and workobjects is a recycled html-element and has old values that need to be overridden*/
    if (element.type.includes('domainStory:workObject')) {
      this.value = this.innerHTML;
    }
    var autocompleteList, autocompleteItem, val = this.value;
    /* close any already open lists of autocompleted values*/
    closeAllLists();
    currentFocus = -1;
    /* create a DIV element that will contain the items (values):*/
    autocompleteList = document.createElement('DIV');
    autocompleteList.setAttribute('id', 'autocomplete-list');
    autocompleteList.setAttribute('class', 'autocomplete-items');
    /* append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(autocompleteList);
    /* for each item in the array...*/
    for (const name of arr) {
      /* check if the item starts with the same letters as the text field value:*/
      if (name.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /* create a DIV element for each matching element:*/
        autocompleteItem = document.createElement('DIV');
        /* make the matching letters bold:*/
        autocompleteItem.innerHTML = '<strong>' + name.substr(0, val.length) + '</strong>' + name.substr(val.length);
        /* insert an input field that will hold the current name:*/
        autocompleteItem.innerHTML += '<input type=\'hidden\' value=\'' + name + '\'>';
        /* execute a function when someone clicks on the item (DIV element):*/
        autocompleteItem.addEventListener('click', function(e) {
          /* insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName('input')[0].value;
          inp.innerHTML = this.getElementsByTagName('input')[0].value;
          /* close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        autocompleteList.appendChild(autocompleteItem);
      }
    }
    // if we edit an actor, we do not want auto-complete, since actors generally are unique
    if (element.type.includes('domainStory:actor')) {
      autocompleteList.style.visibility = 'hidden';
    }
  });

  /* execute a function presses a key on the keyboard:*/
  inp.addEventListener('keydown', function(e) {
    var autocompleteList = document.getElementById('autocomplete-list');
    if (autocompleteList) autocompleteList = autocompleteList.getElementsByTagName('div');
    if (e.keyCode == 40) {
      /* If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
      currentFocus++;
      /* and and make the current item more visible:*/
      addActive(autocompleteList);
    } else if (e.keyCode == 38) { // up
      /* If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
      currentFocus--;
      /* and and make the current item more visible:*/
      addActive(autocompleteList);
    } else if (e.keyCode == 13) {
      /* If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /* and simulate a click on the "active" item:*/
        if (autocompleteList) autocompleteList[currentFocus].click();
      }
    }
  });

  function addActive(autocompleteList) {
    /* a function to classify an item as "active":*/
    if (!autocompleteList || autocompleteList.length < 1) return false;
    /* start by removing the "active" class on all items:*/
    removeActive(autocompleteList);
    if (currentFocus >= autocompleteList.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (autocompleteList.length - 1);
    /* add class "autocomplete-active":*/
    autocompleteList[currentFocus].classList.add('autocomplete-active');
  }

  function removeActive(autocompleteList) {
    /* a function to remove the "active" class from all autocomplete items:*/
    for (const item of autocompleteList) {
      item.classList.remove('autocomplete-active');
    }
  }

  function closeAllLists(survivor) {
    /* close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var autocompleteList = document.getElementsByClassName('autocomplete-items');
    for (const item of autocompleteList) {
      if (survivor != item && survivor != inp) {
        item.parentNode.removeChild(item);
      }
    }
  }

  /* execute a function when someone clicks in the document:*/
  document.addEventListener('click', function(e) {
    closeAllLists(e.target);
  });
}