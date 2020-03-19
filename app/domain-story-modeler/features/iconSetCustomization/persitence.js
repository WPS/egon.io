'use strict';

import {
  getSelectedActorsDictionary,
  getSelectedWorkObjectsDictionary,
  getAppendedIconDictionary,
  getIconSource,
  addToSelectedWorkObjects,
  addToSelectedActors,
  resetSelectionDictionaries
} from './dictionaries';
import { createObjectListForDSTDownload } from '../export/dstDownload';
import { version } from '../../../../package.json';
import { appendSRCFile } from '../../language/icon/iconConfig';
import {
  createListElement,
  createListElementInSeletionList,
  resetHTMLSelectionList
} from './customizationDialog';
import { ACTOR, WORKOBJECT } from '../../language/elementTypes';
import { domExists } from '../../language/testmode';
import { getTypeDictionary } from '../../language/icon/dictionaries';
import { all_icons } from '../../language/icon/all_Icons';
import { getAllCanvasObjects } from '../../language/canvasElementRegistry';
import { Dict } from '../../language/collection';

export const useCustomConfigTag = 'useCustomConfig';
export const useNecessaryConfigTag = 'useNecessaryConfig';
export const customConfigTag = 'customConfig';
export const appendedIconsTag = 'appendedIcons';
export const storyPersistTag = 'persistetStory';
export const customConfigNameTag = 'persitedDomainName';

export function setToDefault() {
  persistStory();
  localStorage.removeItem(useCustomConfigTag);
  localStorage.removeItem(customConfigTag);
  localStorage.removeItem(appendedIconsTag);
  localStorage.removeItem(customConfigNameTag);
  localStorage.setItem(useNecessaryConfigTag, true);
  persistNecessaryConfig();
  if (domExists()) {
    location.reload();
  }
}

export function exportConfiguration() {
  let actors = getSelectedActorsDictionary();
  let workObjects = getSelectedWorkObjectsDictionary();
  let configJSONString;

  if (actors.size() > 0 && workObjects.size() > 0) {
    configJSONString = JSON.stringify(
      createConfigFromDictionaries(
        actors,
        undefined,
        workObjects,
        undefined,
        document.getElementById('domainNameInput').value
      )
    );

    let domainNameInput = document.getElementById('domainNameInput');
    let filename = domainNameInput.value || 'domain';
    let element = document.createElement('a');

    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(configJSONString)
    );
    element.setAttribute('download', filename + '.domain');
    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  return configJSONString;
}

export function importConfiguration(input) {
  let reader = new FileReader();

  reader.onloadend = function(e) {
    let domainName = loadConfiguration(e.target.result);
    if (!domainName && input.name.endsWith('.domain')) {
      domainName = input.name.replace('.domain');
    }
    const domainNameInput = document.getElementById('domainNameInput');
    domainNameInput.value = domainName;
  };
  reader.readAsText(input);
}

export function saveIconConfiguration(elements) {
  persistStory(elements);

  let actors = getSelectedActorsDictionary();
  let workObjects = getSelectedWorkObjectsDictionary();
  let actorOrder = [], workobjectOrder = [];
  let selectedActorsList = document.getElementById('selectedActorsList');
  let domainNameInput = document.getElementById('domainNameInput');
  let name = '';

  if (selectedActorsList) {
    if (!actors.size > 0) {
      actors = getTypeDictionary(ACTOR);
    } else {
      actors.entries.forEach(entry => actorOrder.push(entry.key));
    }
    if (!workObjects.size > 0) {
      workObjects = getTypeDictionary(WORKOBJECT);
    } else {
      workObjects.entries.forEach(entry => workobjectOrder.push(entry.key));
    }
    if (domainNameInput) {
      name = domainNameInput.value;
    }
  }

  let configJSONString = JSON.stringify(
    createConfigFromDictionaries(actors, actorOrder, workObjects, workobjectOrder, name)
  );


  localStorage.setItem(useCustomConfigTag, true);
  localStorage.setItem(customConfigTag, configJSONString);
  localStorage.setItem(
    appendedIconsTag,
    JSON.stringify(getAppendedIconDictionary())
  );
  localStorage.setItem(customConfigNameTag, name);

  if (domExists()) {
    location.reload();
  }
}

export function loadConfiguration(customConfig) {
  let actorDict = new Dict();
  let workObjectDict = new Dict();
  let customConfigJSON = JSON.parse(customConfig);

  const configurationName = customConfigJSON.name;
  let actors = customConfigJSON.actors;
  let workObjects = customConfigJSON.workObjects;

  resetSelectionDictionaries();
  resetHTMLSelectionList();

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

  return configurationName;
}

function updateHTMLLists(appendedDict, actorDict, workObjectDict) {
  let htmlList = document.getElementById('allIconsList');
  let selectedActorsList = document.getElementById('selectedActorsList');
  let selectedWorkObjectList = document.getElementById(
    'selectedWorkObjectsList'
  );

  resetHTMLSelectionList();

  appendedDict.keysArray().forEach(name => {
    let listElement = createListElement(name);
    htmlList.appendChild(listElement);
  });

  actorDict.keysArray().forEach(name => {
    for (let i = 0; i < htmlList.children.length; i++) {
      let child = htmlList.children[i];

      if (child.innerText.startsWith(name)) {
        child.children[0].children[1].checked = true;
        selectedActorsList.appendChild(createListElementInSeletionList(
          name,
          getIconSource(name),
          selectedActorsList
        ));
      }
    }
  });

  workObjectDict.keysArray().forEach(name => {
    for (let i = 0; i < htmlList.children.length; i++) {
      let child = htmlList.children[i];

      if (child.innerText.startsWith(name)) {
        child.children[0].children[2].checked = true;
        selectedWorkObjectList.appendChild(createListElementInSeletionList(
          name,
          getIconSource(name),
          selectedWorkObjectList
        ));
      }
    }
  });
}

export function createConfigFromDictionaries(
    actorsDict,
    actorOrder,
    workObjectsDict,
    workobjectOrder,
    name
) {
  let actors = actorsDict.keysArray();
  let workObjects = workObjectsDict.keysArray();
  let actorsJSON = {};
  let workObjectJSON = {};

  if (actorOrder) {
    actorOrder.forEach(actor => {
      actorsJSON[actor.replace(ACTOR, '')] = actorsDict.get(actor);
    });
  }
  if (workobjectOrder) {
    workobjectOrder.forEach(workObject => {
      workObjectJSON[workObject.replace(WORKOBJECT, '')] = workObjectsDict.get(
        workObject
      );
    });
  }

  actors.forEach(actor => {
    if (!actorOrder || !actorOrder.includes(actor)) {
      actorsJSON[actor.replace(ACTOR, '')] = actorsDict.get(actor);
    }
  });

  workObjects.forEach(workObject => {
    if (!workobjectOrder || !workobjectOrder.includes(workObject)) {
      workObjectJSON[workObject.replace(WORKOBJECT, '')] = workObjectsDict.get(
        workObject
      );
    }
  });

  let config = {
    name: name,
    actors: actorsJSON,
    workObjects: workObjectJSON
  };

  return config;
}

function persistStory() {
  let objects = createObjectListForDSTDownload(version);
  let title = document.getElementById('title');
  let titleText = '';

  if (title) {
    titleText = title.innerText;
  }

  localStorage.setItem(
    storyPersistTag,
    JSON.stringify({
      title: titleText,
      objects: objects
    })
  );
}

function persistNecessaryConfig() {
  let currentConfig = createConfigFromDictionaries(
    getSelectedActorsDictionary(),
    null,
    getSelectedWorkObjectsDictionary(),
    null,
    ''
  );

  let currentActors = new Dict();
  currentActors.addEach(currentConfig.actors);
  let currentWorkobjects = new Dict();
  currentWorkobjects.addEach(currentConfig.workObjects);
  let allActors = new Dict();
  let allWorkobjects = new Dict();

  currentActors.keysArray().forEach(name => {
    if (!all_icons[name]) {
      allActors.add(currentActors.get(name), name);
    }
  });

  currentWorkobjects.keysArray().forEach(name => {
    if (!all_icons[name]) {
      allWorkobjects.add(currentWorkobjects.get(name), name);
    }
  });

  const allCanvasObjects = getAllCanvasObjects();
  let canvasObjectTypes = [];
  allCanvasObjects.forEach(object => {
    const objectType = object.type.replace(ACTOR, '').replace(WORKOBJECT, '');
    if (!canvasObjectTypes.includes(objectType)) {
      canvasObjectTypes.push(objectType);
    }
  });

  let newActors = {};
  let newWorkobjects = {};
  allActors.keysArray().forEach(key => {
    if (canvasObjectTypes.includes(key)) {
      newActors[key] = allActors.get(key);
    }
  });
  allWorkobjects.keysArray().forEach(key => {
    if (canvasObjectTypes.includes(key)) {
      newWorkobjects[key] = allWorkobjects.get(key);
    }
  });

  let config = {
    name: '',
    actors: newActors,
    workObjects: newWorkobjects
  };

  localStorage.setItem(customConfigTag, JSON.stringify(config));
  localStorage.setItem(
    appendedIconsTag,
    JSON.stringify(getAppendedIconDictionary())
  );
}
