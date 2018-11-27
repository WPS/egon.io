'use strict';

import { assign } from 'min-dash';
import { isInDomainStoryGroup } from './TypeCheck';

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
function getAllGroups(canvas) {
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

// Math functions

// convert rad to deg
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

// approximate the width of the label text, standard fontsize: 11
export function calculateTextWidth(text) {
  var fontsize = text.length * 5.1;
  fontsize = fontsize / 2;
  // add an initial offset to the absolute middle of the activity
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