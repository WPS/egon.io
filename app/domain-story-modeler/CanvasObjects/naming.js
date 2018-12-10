
'use strict';


export function getNameFromType(type) {
  if (type.includes('domainStory:actor')) {
    return type.replace('domainStory:actor', '');
  }
  else if (type.includes('domainStory:workObject')) {
    var name = type.replace('domainStory:workObject', '');
    if (name.length >= 1) {
      return name;
    }
    else return 'document';
  }
  return type;
}