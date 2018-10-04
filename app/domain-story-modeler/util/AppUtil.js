'use strict';

import sanitize from './Sanitizer';


/**
 * general functions used by app.js
 */

export function keyReleased(keysPressed, keyCode) {
  keysPressed[keyCode] = false;
}

export function checkInput(field) {
  field.value = sanitize(field.value);
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