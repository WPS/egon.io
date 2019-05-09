'use strict';

let test = false;

export function activateTestMode() {
  test = true;
}

export function isTestMode() {
  return test;
}