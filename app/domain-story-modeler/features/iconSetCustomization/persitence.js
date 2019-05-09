'use strict';

import { getSelectedActorsDictionary, getSelectedWorkObjectsDictionary, getAppendedIconDictionary, getIconSource, addToSelectedWorkObjects, addToSelectedActors, resetSelectionDictionaries } from './dictionaries';
import { createObjectListForDSTDownload } from '../export/dstDownload';
import { version } from '../../../../package.json';
import { appendSRCFile } from '../../language/icon/iconConfig';
import { createListElement, createListElementInSeletionList, resetHTMLSelectionList } from './customizationDialog';
import { ACTOR, WORKOBJECT } from '../../language/elementTypes';
import { domExists } from '../../language/testmode';
import { getTypeDictionary } from '../../language/icon/dictionaries';

export const useCustomConfigTag = 'useCustomConfig';
export const customConfigTag ='customConfig';
export const appendedIconsTag = 'appendedIcons';
export const storyPersistTag = 'persistetStory';
export const customConfigNameTag ='persitedDomainName';

export function setToDefault() {
  persistStory();
  localStorage.removeItem(useCustomConfigTag);
  localStorage.removeItem(customConfigTag);
  localStorage.removeItem(appendedIconsTag);

  location.reload();
}

export function exportConfiguration() {
  let actors = getSelectedActorsDictionary();
  let workObjects = getSelectedWorkObjectsDictionary();

  let configJSONString;

  if (actors.size >0 && workObjects.size>0) {
    configJSONString = JSON.stringify(createConfigFromDictionaries(actors, workObjects));

    let domainNameInput = document.getElementById('domainNameInput');

    let filename = domainNameInput.value || 'domain';
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(configJSONString));
    element.setAttribute('download', filename + '.config');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  return configJSONString;
}

export function importConfiguration(input) {

  let reader = new FileReader();

  if (input.name.endsWith('.config')) {
    let domainName = input.name.replace('.config', '');
    let domainNameInput = document.getElementById('domainNameInput');
    domainNameInput.value = domainName;
  }

  reader.onloadend = function(e) {
    loadConfiguration(e.target.result);
  };
  reader.readAsText(input);
}

export function saveIconConfiguration() {
  persistStory();

  let actors = getSelectedActorsDictionary();
  let workObjects = getSelectedWorkObjectsDictionary();

  if (!actors.size >0) {
    actors = getTypeDictionary(ACTOR);
  }
  if (!workObjects.size>0) {
    workObjects = getTypeDictionary(WORKOBJECT);
  }

  let configJSONString = JSON.stringify(createConfigFromDictionaries(actors, workObjects));
  localStorage.setItem(useCustomConfigTag, true);
  localStorage.setItem(customConfigTag, configJSONString);
  localStorage.setItem(appendedIconsTag, JSON.stringify(getAppendedIconDictionary()));

  let domainNameInput = document.getElementById('domainNameInput');
  localStorage.setItem(customConfigNameTag, domainNameInput.value);

  location.reload();
}

export function loadConfiguration(customConfig) {
  let customConfigJSON = JSON.parse(customConfig);

  let actors = customConfigJSON.actors;
  let workObjects = customConfigJSON.workObjects;

  const dictionary = require('collections/dict');

  resetSelectionDictionaries();

  let actorDict = new dictionary();
  let workObjectDict = new dictionary();

  actorDict.addEach(actors);
  workObjectDict.addEach(workObjects);

  actors = actorDict.keysArray();
  workObjects = workObjectDict.keysArray();

  appendSRCFile(actors, actorDict, workObjects, workObjectDict);

  let appendedDict = getAppendedIconDictionary();

  if (domExists()) {
    updateHTMLLists(appendedDict, actorDict, workObjectDict);
  }

  actorDict.keysArray().forEach(name => {
    addToSelectedActors(name, getIconSource(name));
  });
  workObjectDict.keysArray().forEach(name => {
    addToSelectedWorkObjects(name, getIconSource(name));
  });
}

function updateHTMLLists(appendedDict, actorDict, workObjectDict) {
  let htmlList = document.getElementById('allIconsList');
  let selectedActorsList = document.getElementById('selectedActorsList');
  let selectedWorkObjectList = document. getElementById('selectedWorkObjectsList');

  resetHTMLSelectionList();

  appendedDict.keysArray().forEach(name => {
    let listElement = createListElement(name);
    htmlList.appendChild(listElement);
  });

  for (let i=0; i < htmlList.children.length; i++) {
    let child = htmlList.children[i];
    let childText = child.innerText;

    actorDict.keysArray().forEach(name=> {
      if (childText.startsWith(name)) {
        child.children[0].children[1].checked = true;
        createListElementInSeletionList(name, getIconSource(name), selectedActorsList);
      }
    });
    workObjectDict.keysArray().forEach(name=> {
      if (childText.startsWith(name)) {
        child.children[0].children[2].checked = true;
        createListElementInSeletionList(name, getIconSource(name), selectedWorkObjectList);
      }
    });
  }
}

export function createConfigFromDictionaries(actorsDict, workObjectsDict) {
  let actors = actorsDict.keysArray();
  let workObjects = workObjectsDict.keysArray();

  let actorsJSON = {};
  let workObjectJSON = {};

  actors.forEach (actor => {
    actorsJSON[actor.replace(ACTOR, '')] = actorsDict.get(actor);
  });

  workObjects.forEach(workObject => {
    workObjectJSON[workObject.replace(WORKOBJECT, '')] = workObjectsDict.get(workObject);
  });

  let config = {
    'actors': actorsJSON,
    'workObjects': workObjectJSON
  };

  return config;
}

function persistStory() {
  let title = document.getElementById('title');
  let objects = createObjectListForDSTDownload(version);
  let titleText = title.innerText;

  let completeJSON = {
    title: titleText,
    objects: objects
  };

  let storyJSON = JSON.stringify(completeJSON);

  localStorage.setItem(storyPersistTag, storyJSON);
}