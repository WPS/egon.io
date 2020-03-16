'use strict';

import { appendedIcons } from '../../language/icon/all_Icons';
import { createListElement } from './customizationDialog';
import { domExists } from '../../language/testmode';

export function addIMGToIconDictionary(input, name) {
  appendedIcons.set(name, input);

  if (domExists()) {
    const htmlList = document.getElementById('allIconsList');
    const listElement = createListElement(name);
    htmlList.appendChild(listElement);
  }
}
