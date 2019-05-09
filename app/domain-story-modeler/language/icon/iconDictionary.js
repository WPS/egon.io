'use strict';

const Icons = require('collections/dict');
let icons = new Icons();

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
