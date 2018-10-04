'use strict';

import { is } from 'bpmn-js/lib/util/ModelUtil';
import { assign } from 'min-dash';

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