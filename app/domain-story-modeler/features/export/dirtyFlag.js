'use strict';

let exportButtonIMG = document.getElementById('exportButtonIMG');


export function makeDirty() {
  exportButtonIMG.src = '../../../logo/archive_dirty.png';
}

export function removeDirtyFlag() {
  exportButtonIMG.src = '../../../logo/archive.png';
}