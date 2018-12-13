import { is } from 'bpmn-js/lib/util/ModelUtil';

'use strict';

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