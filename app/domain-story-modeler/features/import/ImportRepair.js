'use strict';

import { ACTIVITY, CONNECTION, WORKOBJECT } from '../../language/elementTypes';
import {
  getAllCanvasObjects,
  getAllGroups
} from '../../language/canvasElementRegistry';
import { isInDomainStoryGroup } from '../../util/TypeCheck';
import { assign } from 'min-dash';

export function checkElementReferencesAndRepair(elements) {
  let activities = [];
  let objectIDs = [];

  let complete = true;

  elements.forEach(element => {
    const type = element.type;
    if (type == ACTIVITY || type == CONNECTION) {
      activities.push(element);
    } else {
      objectIDs.push(element.id);
    }
  });

  activities.forEach(activity => {
    const source = activity.source;
    const target = activity.target;
    if (!objectIDs.includes(source) || !objectIDs.includes(target)) {
      complete = false;
      const activityIndex = elements.indexOf(activity);
      elements = elements.splice(activityIndex, 1);
    }
  });
  return complete;
}

// when importing a domain-story, the elements that are visually inside a group are not yet associated with it.
// to ensure they are correctly associated, we add them to the group
export function correctGroupChildren() {
  const allObjects = getAllCanvasObjects();
  const groups = getAllGroups();

  groups.forEach(group => {
    const parent = group.parent;
    parent.children.slice().forEach(innerShape => {
      if (innerShape.id != group.id) {
        if (innerShape.x >= group.x && innerShape.x <= group.x + group.width) {
          if (
            innerShape.y >= group.y &&
            innerShape.y <= group.y + group.height
          ) {
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
    let businessObject = shape.businessObject;
    if (isInDomainStoryGroup(shape)) {
      assign(businessObject, {
        parent: shape.parent.id
      });
    }
  });
}

/**
 * Ensure backwards compatability.
 * Previously Document had no special name and was just adressed as workObject
 * Bubble was renamed to Conversation
 */

export function updateCustomElementsPreviousv050(elements) {
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].type === WORKOBJECT) {
      elements[i].type = WORKOBJECT + 'Document';
    } else if (elements[i].type === WORKOBJECT + 'Bubble') {
      elements[i].type = WORKOBJECT + 'Conversation';
    }
  }
  return elements;
}

export function adjustPositions(elements) {
  let xLeft, yUp;
  let isFirst = true;

  elements.forEach(element => {
    let elXLeft, elYUp;
    if (element.type != ACTIVITY && element.type != CONNECTION) {
      if (isFirst) {
        xLeft = parseFloat(element.x);
        yUp = parseFloat(element.y);
        isFirst = false;
      }
      elXLeft = parseFloat(element.x);
      elYUp = parseFloat(element.y);
      if (elXLeft < xLeft) {
        xLeft = elXLeft;
      }
      if (elYUp < yUp) {
        yUp = elYUp;
      }
    }
  });

  if (xLeft < 75 || xLeft > 150 || yUp < 0 || yUp > 50) {

    // add Padding for the Palette and the top
    xLeft -= 75;
    yUp -= 50;

    elements.forEach(element => {
      if (element.type == ACTIVITY || element.type == CONNECTION) {
        let waypoints = element.waypoints;
        waypoints.forEach(point => {
          point.x -= xLeft;
          point.y -= yUp;

          if (point.original) {
            point.original.x = point.x;
            point.original.y = point.y;
          }
        });
      } else {
        element.x -= xLeft;
        element.y -= yUp;
      }
    });
  }
}
