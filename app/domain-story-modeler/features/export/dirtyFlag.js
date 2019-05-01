'use strict';

import { testMode } from '../../language/testmode';

var exportButtonIMG = document.getElementById('exportButtonIMG');


export function makeDirty() {
  if (!testMode()) {
    exportButtonIMG.src = '../../../logo/archive_dirty.png';
  }
}

export function removeDirtyFlag() {
  if (!testMode()) {
    exportButtonIMG.src = '../../../logo/archive.png';
  }
}