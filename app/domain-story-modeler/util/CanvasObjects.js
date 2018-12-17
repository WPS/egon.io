import { assign } from 'min-dash';

import { isInDomainStoryGroup } from './TypeCheck';

'use strict';

/**
 *  functions that deal with objects from the canvas
 *
 */

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

// get a list of activities, that originate from an actor-type
export function getActivitesFromActors(canvasObjects) {
  var activiesFromActors = [];

  canvasObjects.forEach(element => {
    if (element.type.includes('domainStory:activity')) {
      if (element.source.type.includes('domainStory:actor')) {
        activiesFromActors.push(element);
      }
    }
    if (element.type.includes('domainStory:group')) {
      var groupChildren = element.children;
      groupChildren.forEach(child => {
        if (child.type.includes('domainStory:activity')) {
          if (child.source.type.includes('domainStory:actor')) {
            activiesFromActors.push(child);
          }
        }
      });
    }
  });
  return activiesFromActors;
}



/**
 * Ensure backwards compatability.
 * Previously Document had no special name and was just adressed as workObject
 * Bubble was renamed to Conversation
 */

export function updateCustomElementsPreviousv050(elements) {

  for (var i=0; i< elements.length; i++) {
    if (elements[i].type === 'domainStory:workObject') {
      elements[i].type = 'domainStory:workObjectDocument';
    } else if (elements[i].type === 'domainStory:workObjectBubble') {
      elements[i].type = 'domainStory:workObjectConversation';
    }
  }
  return elements;
}
