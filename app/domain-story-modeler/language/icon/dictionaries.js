import { ACTOR, WORKOBJECT } from '../elementTypes';
import { all_icons, appendedIcons } from './all_Icons';
import { getNameFromType } from '../naming';
import { registerIcon } from './iconDictionary';
import { default_conf } from './iconConfig';

const prefix = 'icon-domain-story-';
const Collection = require('collections/dict');
let actorIconDictionary = new Collection();
let workObjectDictionary = new Collection();

export function allInTypeDictionary(type, elements) {
  let collection;
  if (type == ACTOR) {
    collection = actorIconDictionary;
  } else if (type == WORKOBJECT) {
    collection = workObjectDictionary;
  }

  let allIn = true;
  if (elements) {
    elements.forEach(element => {
      if (!collection.has(element.type)) {
        allIn = false;
      }
    });
  } else {
    return false;
  }
  return allIn;
}

export function registerIcons(type, elements) {
  let collection;
  if (type == ACTOR) {
    collection = actorIconDictionary;
  } else if (type == WORKOBJECT) {
    collection = workObjectDictionary;
  }

  let allTypes=new Collection();
  allTypes.addEach(all_icons);
  allTypes.addEach(appendedIcons);

  elements.forEach(element => {
    if (!collection.has(element.type)) {
      const name = getNameFromType(element.type);
      registerTypeIcon(type, element.type, allTypes.get(name));
      registerIcon(element.type, prefix + name.toLowerCase());
    }
  });
}

export function registerTypeIcon(type, name, src) {
  if (!name.includes(type)) {
    name = type + name;
  }

  let collection;
  if (type == ACTOR) {
    collection = actorIconDictionary;
  } else if (type == WORKOBJECT) {
    collection = workObjectDictionary;
  }
  collection.set(name, src);
}

export function isInTypeDictionary(type, name) {
  let collection;
  if (type == ACTOR) {
    collection = actorIconDictionary;
  } else if (type == WORKOBJECT) {
    collection = workObjectDictionary;
  }
  return collection.has(name);
}

export function initTypeDictionaries(actors, workObjetcs) {
  if (!actors) {
    actors = default_conf.actors;
  }
  if (!workObjetcs) {
    workObjetcs = default_conf.workObjects;
  }

  let allTypes=new Collection();
  allTypes.addEach(all_icons);
  allTypes.addEach(appendedIcons);

  for (let i=0; i < actors.length; i++) {
    const key = ACTOR + actors[i];
    actorIconDictionary.add(allTypes.get(actors[i]), key);
  }

  actorIconDictionary.keysArray().forEach(actor => {
    let name = getNameFromType(actor);
    registerIcon(actor, 'icon-domain-story-' + name.toLowerCase());
  });

  for (let i=0; i < workObjetcs.length; i++) {
    const key = WORKOBJECT + workObjetcs[i];
    workObjectDictionary.add(allTypes.get(workObjetcs[i]), key);
  }

  workObjectDictionary.keysArray().forEach(workObject => {
    let name = getNameFromType(workObject);
    registerIcon(workObject, 'icon-domain-story-' + name.toLowerCase());
  });
}

export function getTypeDictionary(type) {
  let collection;
  if (type == ACTOR) {
    collection = actorIconDictionary;
  } else if (type == WORKOBJECT) {
    collection = workObjectDictionary;
  }

  return collection;
}

export function getTypeDictionaryKeys(type) {
  let collection;
  if (type == ACTOR) {
    collection = actorIconDictionary;
  } else if (type == WORKOBJECT) {
    collection = workObjectDictionary;
  }

  return collection.keysArray();
}

export function getTypeIconSRC(type, name) {
  let collection;
  if (type == ACTOR) {
    collection = actorIconDictionary;
  } else if (type == WORKOBJECT) {
    collection = workObjectDictionary;
  }

  return collection.get(name);
}