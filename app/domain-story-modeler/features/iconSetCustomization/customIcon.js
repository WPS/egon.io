'use strict';

import { appendedIcons } from '../../language/all_Icons';
import { createListElement } from './creation';

export function addSVGToIconRegistry(input, name) {
  appendedIcons[name] = input;

  var htmlList = document.getElementById('allIconsList');
  var listElement = createListElement(name);
  htmlList.appendChild(listElement);
}

export function addIMGToIconRegistry(input, nameWithEnding) {

}