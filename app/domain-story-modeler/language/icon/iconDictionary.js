'use strict';

import { Dict } from '../classes/collection';

const icons = new Dict();

export function getIconDictionary() {
  return icons;
}

export function getIconDictionaryKeys() {
  return icons.keysArray();
}

export function registerIcon(name, src) {
  icons.set(name, src);
}

export function getIconForType(type) {
  return icons.get(type);
}
