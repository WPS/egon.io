'use strict';

let exportButtonIMG = document.getElementById('exportButtonIMG');
let exportButtonIMGDirty = document.getElementById('exportButtonIMGDirty');
let dirty = false;


export function makeDirty() {
  if (exportButtonIMG) {
    exportButtonIMGDirty.style = 'display:inherit';
    exportButtonIMG.style = 'display:none';
  }
  dirty = true;
}

export function removeDirtyFlag() {
  if (exportButtonIMG) {
    exportButtonIMG.style = 'diplay:inherit';
    exportButtonIMGDirty.style = 'display:none';
  }
  dirty = false;
}

export function isDirty() {
  return dirty;
}