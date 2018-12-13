'use strict';

var Icons = require('collections/dict');
var icons = new Icons();

export function getIcons() {
  return icons;
}

export function getIconKeys() {
  return icons.keysArray();
}

export function registerIcon(name, src) {
  icons.set(name, src);
}

export function getIconForType(type) {
  return icons.get(type);
}
