'use strict';

export function domExists() {
  let domExists = true;
  if (!document.getElementById('line')) {
    domExists = false;
  }
  return domExists;
}