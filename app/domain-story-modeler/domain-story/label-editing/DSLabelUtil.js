'use strict';

import { is } from 'bpmn-js/lib/util/ModelUtil';

function getLabelAttr(semantic) {
  if (is(semantic, 'domainStory:actorPerson') ||
    is(semantic, 'domainStory:actorGroup') ||
    is(semantic, 'domainStory:actorSystem') ||
    is(semantic, 'domainStory:workObject') ||
    is(semantic, 'domainStory:workObjectFolder') ||
    is(semantic, 'domainStory:workObjectCall') ||
    is(semantic, 'domainStory:workObjectEmail') ||
    is(semantic, 'domainStory:workObjectBubble') ||
    is(semantic, 'domainStory:activity') ||
    is(semantic, 'domainStory:group') ||
    is(semantic, 'domainStory:workObjectInfo')) {

    return 'name';
  }

  if (is(semantic, 'domainStory:textAnnotation')) {
    return 'text';
  }
}

function getNumberAttr(semantic) {
  if (is(semantic, 'domainStory:activity')) {

    return 'number';
  }
}

export function getLabel(element) {
  var semantic = element.businessObject,
      attr = getLabelAttr(semantic);

  if (attr) {
    return semantic[attr] || '';
  }
}

export function getNumber(element) {
  var semantic = element.businessObject,
      attr = getNumberAttr(semantic);

  if (attr) {
    return semantic[attr] || '';
  }
}

export function setLabel(element, text) {
  var semantic = element.businessObject,
      attr = getLabelAttr(semantic);

  if (attr) {
    semantic[attr] = text;
  }

  return element;
}

export function setNumber(element, textNumber) {
  var semantic = element.businessObject,
      attr = getNumberAttr(semantic);

  if (attr) {
    semantic[attr] = textNumber;
  }

  return element;
}