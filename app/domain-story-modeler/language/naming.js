
'use strict';

export function getNameFromType(type) {

  // Polyfill for test
  if (!String.prototype.includes) {
    String.prototype.includes = function(search, start) {
      'use strict';
      if (typeof start !== 'number') {
        start = 0;
      }

      if (start + search.length > this.length) {
        return false;
      } else {
        return this.indexOf(search, start) !== -1;
      }
    };
  }

  if (type.includes('domainStory:actor')) {
    return type.replace('domainStory:actor', '');
  }
  else if (type.includes('domainStory:workObject')) {
    return type.replace('domainStory:workObject', '');
  }
}