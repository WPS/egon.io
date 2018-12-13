
'use strict';

export function getNameFromType(type) {
  if (type.includes('domainStory:actor')) {
    return type.replace('domainStory:actor', '');
  }
  else if (type.includes('domainStory:workObject')) {
    return type.replace('domainStory:workObject', '');
  }
}