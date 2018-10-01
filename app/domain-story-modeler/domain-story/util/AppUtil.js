'use strict';

import sanitize from './Sanitizer';

import {
  setLabelDictionary,
  getWorkobjectDictionary
} from '../label-editing/DSLabelEditingProvider';

import { cleanActicityDictionary, getActivityDictionary } from './DSUtil';

/**
 * general functions used by app.js
 */

export function keyReleased(keysPressed, keyCode) {
  keysPressed[keyCode] = false;
}

export function checkInput(field) {
  field.value = sanitize(field.value);
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

export function openDictionary(canvas) {
  if (canvas._rootElement && canvas._rootElement.children && canvas._rootElement.children.length > 0) {

    cleanActicityDictionary(canvas);
    setLabelDictionary(canvas);

    var element, i=0;
    var activityDictionary = getActivityDictionary(),
        workobjectDictionary = getWorkobjectDictionary();
    var activityDictionaryContainer = document.getElementById('activityDictionaryContainer'),
        workobjectDictionaryContainer = document.getElementById('workobjectDictionaryContainer'),
        modal = document.getElementById('modal'),
        dictionaryDialog = document.getElementById('dictionary');

    activityDictionaryContainer.innerHTML='';
    workobjectDictionaryContainer.innerHTML='';

    for (i; i<activityDictionary.length;i++) {
      element = document.createElement('INPUT');
      element.setAttribute('type','text');
      element.setAttribute('id', i);
      element.setAttribute('style', 'margin-bottom: 2px');
      element.value=activityDictionary[i];
      activityDictionaryContainer.appendChild(element);
      element = document.createElement('br');
      activityDictionaryContainer.appendChild(element);
    }

    for (i=0; i<workobjectDictionary.length;i++) {
      element = document.createElement('INPUT');
      element.setAttribute('type','text');
      element.setAttribute('id', i);
      element.setAttribute('style', 'margin-bottom: 2px');
      element.value=workobjectDictionary[i];
      workobjectDictionaryContainer.appendChild(element);
      element = document.createElement('br');
      workobjectDictionaryContainer.appendChild(element);
    }

    modal.style.display='block';
    dictionaryDialog.style.display='block';
  }
}

// helper

export function debounce(fn, timeout) {

  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}