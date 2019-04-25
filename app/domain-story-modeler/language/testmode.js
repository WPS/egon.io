'use strict';

var test = false;

export function isTestMode() {
  test = true;
}

export function testMode() {
  return test;
}