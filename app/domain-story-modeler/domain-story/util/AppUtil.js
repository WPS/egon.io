'use strict';

import sanitize from './Sanitizer';

import { getActivityDictionary, cleanDictionaries, getWorkObjectDictionary } from './DSUtil';

/**
 * general functions used by app.js
 */

export function keyReleased(keysPressed, keyCode) {
  keysPressed[keyCode] = false;
}

export function checkInput(field) {
  field.value = sanitize(field.value);
}

// create the HTML-elements associated with the dictionary and display it
export function openDictionary(canvas) {
  if (canvas._rootElement && canvas._rootElement.children && canvas._rootElement.children.length > 0) {

    cleanDictionaries(canvas);

    var element, i=0;
    var activityDictionary = getActivityDictionary(),
        workobjectDictionary = getWorkObjectDictionary();
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
      element.setAttribute('style', 'width:100%;  margin-bottom: 2px');
      element.value=activityDictionary[i];
      activityDictionaryContainer.appendChild(element);
      element = document.createElement('br');
      activityDictionaryContainer.appendChild(element);
    }

    for (i=0; i<workobjectDictionary.length;i++) {
      element = document.createElement('INPUT');
      element.setAttribute('type','text');
      element.setAttribute('id', i);
      element.setAttribute('style', 'width:100%;  margin-bottom: 2px');
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