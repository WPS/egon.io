'use strict';

import { appendedIcons } from '../../language/icon/all_Icons';
import { createListElement } from './customizationDialog';
import { isTestMode } from '../../language/testmode';

export function addIMGToIconDictionary(input, name) {
  appendedIcons[name] = input;

  if (!isTestMode()) {
    let htmlList = document.getElementById('allIconsList');
    let listElement = createListElement(name);
    htmlList.appendChild(listElement);
  }
}
