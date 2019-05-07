'use strict';

var test = false;

export function activateTestMode() {
  test = true;
}

export function isTestMode() {
  return test;
}