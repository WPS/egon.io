'use strict';

import { DOMAINSTORY } from '../language/elementTypes';

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
  if (element.parent) {
    return isDomainStoryGroup(element.parent);
  }
  return false;
}

// check if element in the context of an event is a domainStory element
export function ifDomainStoryElement(fn) {
  return function(event) {
    let context = event.context,
        element = context.shape || context.connection;

    if (isDomainStory(element)) {
      fn(event);
    }
  };
}

export function isDomainStoryElement(element) {
  return element.businessObject.type.includes(DOMAINSTORY);
}