'use strict';

var exportButtonIMG = document.getElementById('exportButtonIMG');
var test = false;

export function testCase() {
  test = true;
}

export function makeDirty() {
  if (!test) {
    exportButtonIMG.src = '../../../logo/archive_dirty.png';
  }
}

export function removeDirtyFlag() {
  if (!test) {
    exportButtonIMG.src = '../../../logo/archive.png';
  }
}