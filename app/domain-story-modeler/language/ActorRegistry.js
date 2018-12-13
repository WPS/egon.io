import { registerIcon } from './iconRegistry';
import { getNameFromType } from './naming';
import { all_icons } from './all_Icons';

'use strict';

var ActorTypes = require('collections/dict');
var actorRegistry = new ActorTypes();

export function getActorRegistry() {
  return actorRegistry;
}

export function getActorRegistryKeys() {
  return actorRegistry.keysArray();
}

export function registerActor(name, src) {
  if (!name.includes('domainStory:actor')) {
    name = 'domainStory:actor' + name;
  }
  actorRegistry.set(name, src);
}

export function getActorSrc(name) {
  return actorRegistry.get(name);
}

export function initActorRegistry(actors) {
  var allTypes=new ActorTypes();
  allTypes.addEach(all_icons);

  for (var i=0; i < actors.length; i++) {
    const key = 'domainStory:actor' + actors[i];
    actorRegistry.add(allTypes.get(actors[i]), key);
  }

  actorRegistry.keysArray().forEach(type => {
    var name = getNameFromType(type);
    registerIcon(type, 'icon-domain-story-' + name.toLowerCase());
  });
}