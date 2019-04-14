'use strict';

import { appendedIcons } from '../../language/all_Icons';
import { createListElement } from './customizationDialog';

export function addIMGToIconDictionary(input, name) {
  appendedIcons[name] = input;

  var htmlList = document.getElementById('allIconsList');
  var listElement = createListElement(name);
  htmlList.appendChild(listElement);
}
