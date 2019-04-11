'use strict';

import { getSelectedActorsDictionary, getSelectedWorkObjectsDictionary, getAppendedIconDictionary, getIconSource, addToSelectedWorkObjects, addToSelectedActors } from './dictionaries';
import { createObjectListForDSTDownload } from '../export/dstDownload';
import { version } from '../../../../package.json';
import { appendSRCFile } from '../../language/iconConfig';
import { createListElement, createSelectedListEntry } from './creation';
import { getActorIconRegistry } from '../../language/actorIconRegistry';
import { getWorkObjectIconRegistry } from '../../language/workObjectIconRegistry';
import { ACTOR, WORKOBJECT } from '../../language/elementTypes';

export const useCustomConfigTag = 'useCustomConfig';
export const customConfigTag ='customConfig';
export const storyPersistTag = 'persistetStory';
export const customConfigNameTag ='persitedDomainName';

export function saveIconConfiguration() {
  persistStory();

  var actors = getSelectedActorsDictionary();
  var workObjects = getSelectedWorkObjectsDictionary();

  if (!actors.size >0) {
    actors = getActorIconRegistry();
  }
  if (!workObjects.size>0) {
    workObjects = getWorkObjectIconRegistry();
  }

  var configJSONString = JSON.stringify(createConfigFromDictionaries(actors, workObjects));
  localStorage.setItem(useCustomConfigTag, true);
  localStorage.setItem(customConfigTag, configJSONString);

  var domainNameInput = document.getElementById('domainNameInput');
  localStorage.setItem(customConfigNameTag, domainNameInput.value);

  location.reload();
}

export function createConfigFromDictionaries(actorsDict, workObjectsDict) {
  var actors = actorsDict.keysArray();
  var workObjects = workObjectsDict.keysArray();

  var actorsJSON = {};
  var workObjectJSON = {};

  actors.forEach (actor => {
    actorsJSON[actor.replace(ACTOR, '')] = actorsDict.get(actor);
  });

  workObjects.forEach(workObject => {
    workObjectJSON[workObject.replace(WORKOBJECT, '')] = workObjectsDict.get(workObject);
  });

  var config = {
    'actors': actorsJSON,
    'workObjects': workObjectJSON
  };

  return config;
}

export function setToDefault() {
  persistStory();
  localStorage.removeItem(useCustomConfigTag);
  localStorage.removeItem(customConfigTag);

  location.reload();
}

export function exportConfiguration() {
  var actors = getSelectedActorsDictionary();
  var workObjects = getSelectedWorkObjectsDictionary();

  if (actors.size >0 && workObjects.size>0) {
    var configJSONString = JSON.stringify(createConfigFromDictionaries(actors, workObjects));

    var domainNameInput = document.getElementById('domainNameInput');

    var filename = domainNameInput.value || 'domain';
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(configJSONString));
    element.setAttribute('download', filename + '.config');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  } else {
    // showDialog
  }
}

export function importConfiguration(input) {

  var reader = new FileReader();

  if (input.name.endsWith('.config')) {
    var domainName = input.name.replace('.config', '');
    var domainNameInput = document.getElementById('domainNameInput');
    domainNameInput.value = domainName;
  }

  reader.onloadend = function(e) {
    loadConfiguration(e.target.result);
  };
  reader.readAsText(input);
}

export function loadConfiguration(customConfig) {
  var customConfigJSON = JSON.parse(customConfig);

  var actors = customConfigJSON.actors;
  var workObjects = customConfigJSON.workObjects;


  var dictionary = require('collections/dict');
  var actorDict = new dictionary();
  var workObjectDict = new dictionary();

  actorDict.addEach(actors);
  workObjectDict.addEach(workObjects);

  actors = actorDict.keysArray();
  workObjects = workObjectDict.keysArray();

  appendSRCFile(actors, actorDict, workObjects, workObjectDict);

  var appendedDict = getAppendedIconDictionary();

  var htmlList = document.getElementById('allIconsList');

  appendedDict.keysArray().forEach(name => {
    var listElement = createListElement(name);
    htmlList.appendChild(listElement);
  });


  var selectedActorsList = document.getElementById('selectedActorsList');
  var selectedWorkObjectList = document. getElementById('selectedWorkObjectsList');

  for (var i=0; i < htmlList.children.length; i++) {
    var child = htmlList.children[i];
    var childText = child.innerText;

    actorDict.keysArray().forEach(name=> {
      if (childText.startsWith(name)) {
        child.children[2].children[2].checked = true;
        createSelectedListEntry(name, getIconSource(name), selectedActorsList);
      }
    });
    workObjectDict.keysArray().forEach(name=> {
      if (childText.startsWith(name)) {
        child.children[2].children[4].checked = true;
        createSelectedListEntry(name, getIconSource(name), selectedWorkObjectList);
      }
    });
  }
  actorDict.keysArray().forEach(name => {
    addToSelectedActors(name, getIconSource(name));
  });
  workObjectDict.keysArray().forEach(name => {
    addToSelectedWorkObjects(name, getIconSource(name));
  });
}

function persistStory() {
  var title = document.getElementById('title');
  var objects = createObjectListForDSTDownload(version);
  var titleText = title.innerText;

  var completeJSON = {
    title: titleText,
    objects: objects
  };

  var storyJSON = JSON.stringify(completeJSON);

  localStorage.setItem(storyPersistTag, storyJSON);
}
