'use strict';

let exportButtonIMG = document.getElementById('exportButtonIMG');


export function makeDirty() {
  if (exportButtonIMG) {
    exportButtonIMG.src = '../../../logo/archive_dirty.png';
  }
}

export function removeDirtyFlag() {
  if (exportButtonIMG) {
    exportButtonIMG.src = '../../../logo/archive.png';
  }
}