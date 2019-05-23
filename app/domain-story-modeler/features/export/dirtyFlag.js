'use strict';

let exportButtonIMG = document.getElementById('exportButtonIMG');
let dirty = false;


export function makeDirty() {
  if (exportButtonIMG) {
    exportButtonIMG.src = '../../../logo/archive_dirty.png';
  }
  dirty = true;
}

export function removeDirtyFlag() {
  if (exportButtonIMG) {
    exportButtonIMG.src = '../../../logo/archive.png';
  }
  dirty = false;
}

export function isDirty() {
  return dirty;
}