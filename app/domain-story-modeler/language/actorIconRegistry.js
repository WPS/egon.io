import { registerIcon } from './iconRegistry';
import { getNameFromType } from './naming';
import { all_icons, appendedIcons } from './all_Icons';
import { ACTOR } from './elementTypes';

'use strict';

var ActorTypes = require('collections/dict');
var actorIconRegistry = new ActorTypes();

export function getActorIconRegistry() {
  return actorIconRegistry;
}

export function getActorIconRegistryKeys() {
  return actorIconRegistry.keysArray();
}

export function allInActorIconRegistry(actors) {
  var allIn = true;
  actors.forEach(actor => {
    if (!actorIconRegistry.has(actor.type)) {
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
    if (!actorIconRegistry.has(actor.type)) {
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
  actorIconRegistry.set(name, src);
}

export function getActorIconSrc(name) {
  return actorIconRegistry.get(name);
}

export function isInActorIconRegsitry(name) {
  return actorIconRegistry.has(name);
}

export function initActorIconRegistry(actors) {
  var allTypes=new ActorTypes();
  allTypes.addEach(all_icons);

  for (var i=0; i < actors.length; i++) {
    const key = ACTOR + actors[i];
    actorIconRegistry.add(allTypes.get(actors[i]), key);
  }

  actorIconRegistry.keysArray().forEach(type => {
    var name = getNameFromType(type);
    registerIcon(type, 'icon-domain-story-' + name.toLowerCase());
  });
}