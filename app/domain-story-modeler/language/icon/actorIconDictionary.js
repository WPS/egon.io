
'use strict';

import { all_icons, appendedIcons } from './all_Icons';
import { getNameFromType } from '../naming';
import { registerIcon } from './iconDictionary';
import { ACTOR } from '../elementTypes';

var ActorTypes = require('collections/dict');
var actorIconDictionary = new ActorTypes();

export function getActorIconDictionary() {
  return actorIconDictionary;
}

export function getActorIconDictionaryKeys() {
  return actorIconDictionary.keysArray();
}

export function allInActorIconDictionary(actors) {
  var allIn = true;
  actors.forEach(actor => {
    if (!actorIconDictionary.has(actor.type)) {
      allIn = false;
    }
  });
  return allIn;
}

export function registerActorIcons(actors) {
  var allTypes=new ActorTypes();
  allTypes.addEach(all_icons);
  allTypes.addEach(appendedIcons);

  actors.forEach(actor => {
    if (!actorIconDictionary.has(actor.type)) {
      const name = getNameFromType(actor.type);
      registerActorIcon(actor.type, allTypes.get(name));
      registerIcon(actor.type, 'icon-domain-story-' + name.toLowerCase());
    }
  });
}

export function registerActorIcon(name, src) {
  if (!name.includes(ACTOR)) {
    name = ACTOR + name;
  }
  actorIconDictionary.set(name, src);
}

export function getActorIconSrc(name) {
  return actorIconDictionary.get(name);
}

export function isInActorIconDictionary(name) {
  return actorIconDictionary.has(name);
}

export function initActorIconDictionary(actors) {
  var allTypes=new ActorTypes();
  allTypes.addEach(all_icons);
  allTypes.addEach(appendedIcons);

  for (var i=0; i < actors.length; i++) {
    const key = ACTOR + actors[i];
    actorIconDictionary.add(allTypes.get(actors[i]), key);
  }

  actorIconDictionary.keysArray().forEach(type => {
    var name = getNameFromType(type);
    registerIcon(type, 'icon-domain-story-' + name.toLowerCase());
  });
}