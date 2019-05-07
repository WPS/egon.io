'use strict';

export function domExists() {
  var domExists = true;
  if (!document.getElementById('line')) {
    domExists = false;
  }
  return domExists;
}