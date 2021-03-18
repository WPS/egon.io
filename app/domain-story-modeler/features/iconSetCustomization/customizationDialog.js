'use strict';

import {
  initializeAllIcons,
  getAllIconDictioary,
  deleteFromSelectedWorkObjectDictionary,
  deleteFromSelectedActorDictionary,
  getIconSource,
  addToSelectedActors,
  addToSelectedWorkObjects,
  selectedDitionariesAreNotEmpty,
  getAppendedIconDictionary,
  emptySelectedActorsDictionary,
  emptySelectedWorkObjectsDictionary,
  getSelectedActorsDictionary,
  getSelectedWorkObjectsDictionary
} from './dictionaries';
import { ACTOR, WORKOBJECT } from '../../language/elementTypes';
import { domExists } from '../../language/testmode';
import { isInTypeDictionary } from '../../language/icon/dictionaries';
import { customConfigTag } from './persitence';
import { default_conf } from '../../language/icon/iconConfig';
import { setListElementStyle, setRadioElementStyle, setVerticalLineElementStyle, setImageElementStyle, iconSize } from './styling';

let htmlList = document.getElementById('allIconsList');
let selectedActorsList = document.getElementById('selectedActorsList');
let selectedWorkObjectList = document.getElementById('selectedWorkObjectsList');

const Sortable = require('sortablejs');
const highlightBackgroundColor = '#f6f6f6';

let actorListArray = [];
let workObjectListArray = [];
let alreadyAddedNames = [];

// options for drag&drop lists
const mainListOptions = {
  group: 'allIconList',
  sort: 'true',
  onEnd: function() {
    updateBackgroundColors();
  }
};

const actorListOptions = {
  group: {
    name: 'actorIconList',
    put: ['actorIconList', 'workObjectIconList']
  },
  sort: 'false',
  onEnd: function(event) {
    dropElement(event);
  }
};

const workObjectListOptions = {
  group: {
    name: 'workObjectIconList',
    put: ['actorIconList', 'workObjectIconList']
  },
  sort: 'false',
  onEnd: function(event) {
    dropElement(event);
  }
};

export function createListElement(name, greyBackground) {
  let iconSRC = getIconSource(name);

  let listElement = document.createElement('li');
  let radioElement = document.createElement('div');
  let verticalLineElement = document.createElement('div');
  let imageElement = document.createElement('img');
  let nameElement = document.createElement('text');

  let inputRadioNone = document.createElement('input');
  let inputRadioActor = document.createElement('input');
  let inputRadioWorkObject = document.createElement('input');

  nameElement.innerHTML = name;

  setStyles(listElement, radioElement, verticalLineElement, imageElement, greyBackground);

  setRadioButtonAttributes(inputRadioNone, name, 'none');
  setRadioButtonAttributes(inputRadioActor, name, 'actor');
  setRadioButtonAttributes(inputRadioWorkObject, name, 'workObject');


  if (iconSRC.startsWith('data')) {
    imageElement.src = iconSRC;
  } else {
    imageElement.src = 'data:image/svg+xml,' + iconSRC;
  }

  if (isInTypeDictionary(ACTOR, ACTOR + name)) {
    inputRadioActor.checked = true;
  } else if (isInTypeDictionary(WORKOBJECT, WORKOBJECT + name)) {
    inputRadioWorkObject.checked = true;
  } else {
    inputRadioNone.checked = true;
  }

  fillRadioElement(radioElement, inputRadioNone, inputRadioActor, inputRadioWorkObject);

  listElement.appendChild(radioElement);
  listElement.appendChild(verticalLineElement);
  listElement.appendChild(imageElement);
  listElement.appendChild(nameElement);

  return listElement;
}

export function resetHTMLSelectionList() {
  if (domExists()) {
    let i = 0;
    for (i = selectedWorkObjectList.children.length - 1; i >= 0; i--) {
      const child = selectedWorkObjectList.children[i];
      selectedWorkObjectList.removeChild(child);
    }

    for (i = selectedActorsList.children.length - 1; i >= 0; i--) {
      const child = selectedActorsList.children[i];
      selectedActorsList.removeChild(child);
    }
  }
}

export function createListElementInSeletionList(name, src, list) {
  const children = list.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const listElementName = child.children[1].innerText;
    if (name == listElementName) {
      return;
    }
  }

  if (domExists()) {
    const listElement = document.createElement('li');
    const nameElement = document.createElement('text');
    const imageElement = document.createElement('img');

    imageElement.width = iconSize;
    imageElement.heigth = iconSize;
    if (src.startsWith('data')) {
      imageElement.src = src;
    } else {
      imageElement.src = 'data:image/svg+xml,' + src;
    }

    nameElement.innerHTML = name;
    nameElement.style.marginLeft = '5px';

    listElement.appendChild(imageElement);
    listElement.appendChild(nameElement);

    return listElement;
  }
  return null;
}

export function createListOfAllIcons() {
  resetHTMLSelectionList();
  initializeAllIcons();
  clearAllElementList();
  actorListArray = [];
  workObjectListArray = [];

  new Sortable(htmlList, mainListOptions);
  new Sortable(selectedActorsList, actorListOptions);
  new Sortable(selectedWorkObjectList, workObjectListOptions);

  let allIconDictionary = getAllIconDictioary();
  const allIconNamesSorted = allIconDictionary.keysArray().sort();
  const appendIconDictionary = getAppendedIconDictionary();
  const allAppendIconNames = appendIconDictionary.keysArray();
  const customConfig = JSON.parse(localStorage.getItem(customConfigTag));

  let i = 0;
  allIconNamesSorted.forEach(name => {
    if (!alreadyAddedNames.includes(name)) {
      const listElement = createListElement(name, i % 2 === 0);
      htmlList.appendChild(listElement);
      i++;
      alreadyAddedNames.push(name);
    }
  });

  allAppendIconNames.forEach(name => {
    if (!alreadyAddedNames.includes(name)) {
      const listElement = createListElement(name, i % 2 === 0);
      htmlList.appendChild(listElement);
      i++;
    }
  });

  if (customConfig &&
    (
      customConfig.actors && Object.keys(customConfig.actors).length !== 0 ||
      customConfig.workObjects && Object.keys(customConfig.workObjects).length !== 0
    )) {
    createCustomActorAndWorkobjectIconList(customConfig);
  } else {
    createStandardActorAndWorkobjectIconList();
  }
}

function setStyles(listElement, radioElement, verticalLineElement, imageElement, greyBackground) {
  setListElementStyle(listElement);
  setRadioElementStyle(radioElement);
  setVerticalLineElementStyle(verticalLineElement);
  setImageElementStyle(imageElement);

  if (greyBackground) {
    listElement.style.backgroundColor = highlightBackgroundColor;
  }
}

function fillRadioElement(radioElement, inputRadioNone, inputRadioActor, inputRadioWorkObject) {

  radioElement.appendChild(inputRadioNone);
  radioElement.appendChild(inputRadioActor);
  radioElement.appendChild(inputRadioWorkObject);

  radioElement.addEventListener('click', function() {
    const children = radioElement.children;
    const actorButton = children[1];
    const workObjectButton = children[2];

    const currentSelectionName = actorButton.name;
    let addToActors = false;
    let addToWorkObjects = false;
    if (actorButton.checked) {
      addToActors = true;
    } else if (workObjectButton.checked) {
      addToWorkObjects = true;
    }
    updateSelectedWorkObjectsAndActors(
      currentSelectionName,
      addToActors,
      addToWorkObjects,
      true
    );
  });

}

function setRadioButtonAttributes(button, name, value) {
  button.setAttribute('type', 'radio');
  button.setAttribute('name', name);
  button.setAttribute('value', value);
}

function createCustomActorAndWorkobjectIconList(customConfig) {

  const orderedActorsList = Object.keys(customConfig.actors);
  const orderedWorkobjectList = Object.keys(customConfig.workObjects);

  orderedActorsList.forEach(a => addToSelectedActors(a, customConfig.actors[a]));
  createSelectedActionsIconList();

  orderedWorkobjectList.forEach(w => addToSelectedWorkObjects(w, customConfig.workObjects[w]));
  createSelectedWorkObjectsIconList();

  orderedActorsList.forEach(actorKey => {
    selectedActorsList.appendChild(
      actorListArray.filter(element => element.getElementsByTagName('text')[0].innerText === actorKey)[0]
    );
  });
  orderedWorkobjectList.forEach(workObjectKey => {
    selectedWorkObjectList.appendChild(
      workObjectListArray.filter(element => element.getElementsByTagName('text')[0].innerText === workObjectKey)[0]
    );
  });

  actorListArray.filter(element => !orderedActorsList.includes(element.getElementsByTagName('text')[0].innerText)).forEach(ele => {
    selectedActorsList.appendChild(ele);
  });

  workObjectListArray.filter(element => !orderedWorkobjectList.includes(element.getElementsByTagName('text')[0].innerText)).forEach(ele => {
    selectedWorkObjectList.appendChild(ele);
  });
}

function createStandardActorAndWorkobjectIconList() {
  default_conf.actors.forEach(a => addToSelectedActors(a, getAllIconDictioary().get(a)));
  createSelectedActionsIconList(); // fill actorListArray

  default_conf.workObjects.forEach(w => addToSelectedWorkObjects(w, getAllIconDictioary().get(w)));
  createSelectedWorkObjectsIconList(); // fill workObjectListArray

  actorListArray = sortAfterDefaultConfig(default_conf.actors, actorListArray);
  workObjectListArray = sortAfterDefaultConfig(default_conf.workObjects, workObjectListArray);

  actorListArray.forEach(actor => {
    selectedActorsList.appendChild(actor);
  });

  workObjectListArray.forEach(workobject => {
    selectedWorkObjectList.appendChild(workobject);
  });
}

function updateBackgroundColors() {
  const children = htmlList.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (i % 2 === 0) {
      child.style.backgroundColor = highlightBackgroundColor;
    } else {
      child.style.backgroundColor = 'white';
    }
  }
}

function dropElement(event) {
  const target = event.to;
  const source = event.srcElement;
  const draggedItem = event.item;

  let listEntryName = draggedItem.lastChild.innerText;
  if (target != source) {
    let addToActors, addToWorkObjects;
    if (target == selectedActorsList) {
      addToActors = true;
      addToWorkObjects = false;
    } else {
      addToActors = false;
      addToWorkObjects = true;
    }
    updateSelectedWorkObjectsAndActors(
      listEntryName,
      addToActors,
      addToWorkObjects,
      false
    );
  } else {
    let updateActors, updateWorkObjects;
    if (target == selectedActorsList) {
      updateActors = true;
      updateWorkObjects = false;
    } else {
      updateActors = false;
      updateWorkObjects = true;
    }
    updateDictionaryOrder(updateActors, updateWorkObjects);
  }
}

function updateDictionaryOrder(updateActors, updateWorkObjects) {
  if (updateActors) {
    emptySelectedActorsDictionary();
    const actorListElements = selectedActorsList.getElementsByTagName('li');

    let element;
    for (element of actorListElements) {
      addToSelectedActors(element.innerText, getIconSource(element.innerText));
    }

  } else if (updateWorkObjects) {
    emptySelectedWorkObjectsDictionary();
    const workObjectListElements = selectedWorkObjectList.getElementsByTagName('li');

    let element;
    for (element of workObjectListElements) {
      addToSelectedWorkObjects(element.innerText, getIconSource(element.innerText));
    }
  }
}

function removeListEntry(name, list) {
  const children = list.children;
  let wantedChild;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    let innerText = child.innerText;
    if (innerText.includes(name)) {
      wantedChild = child;
    }
  }
  if (wantedChild) {
    list.removeChild(wantedChild);
  }
}

function updateSelectedWorkObjectsAndActors(
    currentSelectionName,
    addToActors,
    addToWorkObjects,
    updateHTML
) {
  const exportConfigurationButton = document.getElementById(
    'exportConfigurationButton'
  );
  const customIconConfigSaveButton = document.getElementById(
    'customIconConfigSaveButton'
  );
  const iconSRC = getIconSource(currentSelectionName);

  deleteFromSelectedWorkObjectDictionary(currentSelectionName);
  deleteFromSelectedActorDictionary(currentSelectionName);

  if (updateHTML) {
    removeListEntry(currentSelectionName, selectedActorsList);
    removeListEntry(currentSelectionName, selectedWorkObjectList);
  }

  if (addToActors) {
    addToActorsAndUpdateHTML(currentSelectionName, iconSRC, updateHTML);
  } else if (addToWorkObjects) {
    addToWorkobjectsAndUpdateHTML(currentSelectionName, iconSRC, updateHTML);
  }

  togglButtons(exportConfigurationButton, customIconConfigSaveButton);

  if (!updateHTML) {
    const correspondingAllIconElement = document
      .evaluate(
        "//text[contains(., '" + currentSelectionName + "')]",
        document,
        null,
        XPathResult.ANY_TYPE,
        null
      )
      .iterateNext().parentNode;

    const radioButtons = correspondingAllIconElement.children[0];
    const radioActor = radioButtons.children[1];
    const radioWorkObject = radioButtons.children[2];

    if (addToActors) {
      radioActor.checked = true;
      radioWorkObject.checked = false;
    } else {
      radioActor.checked = false;
      radioWorkObject.checked = true;
    }
  }
}

function addToActorsAndUpdateHTML(currentSelectionName, iconSRC, updateHTML) {
  addToSelectedActors(currentSelectionName, iconSRC);
  if (updateHTML) {
    selectedActorsList.appendChild(
      createListElementInSeletionList(
        currentSelectionName,
        iconSRC,
        selectedActorsList
      )
    );
  }
}

function addToWorkobjectsAndUpdateHTML(currentSelectionName, iconSRC, updateHTML) {
  addToSelectedWorkObjects(currentSelectionName, iconSRC);
  if (updateHTML) {
    selectedWorkObjectList.appendChild(

      createListElementInSeletionList(
        currentSelectionName,
        iconSRC,
        selectedWorkObjectList
      )
    );
  }
}

function togglButtons(exportConfigurationButton, customIconConfigSaveButton) {
  if (selectedDitionariesAreNotEmpty()) {
    exportConfigurationButton.disabled = false;
    exportConfigurationButton.style.opacity = 1;

    customIconConfigSaveButton.disabled = false;
    customIconConfigSaveButton.style.opacity = 1;
  } else {
    exportConfigurationButton.disabled = true;
    exportConfigurationButton.style.opacity = 0.5;

    customIconConfigSaveButton.disabled = true;
    customIconConfigSaveButton.style.opacity = 0.5;
  }
}

function createSelectedActionsIconList() {
  getSelectedActorsDictionary().entries.forEach(e => {
    actorListArray.push(createListElementInSeletionList(
      e.key,
      getIconSource(e.key),
      selectedActorsList
    ));
  });
}

function createSelectedWorkObjectsIconList() {
  getSelectedWorkObjectsDictionary().entries.forEach(e => {
    workObjectListArray.push(createListElementInSeletionList(
      e.key,
      getIconSource(e.key),
      selectedWorkObjectList
    ));
  });
}

function clearAllElementList() {
  if (domExists()) {
    while (htmlList.firstChild) {
      htmlList.removeChild(htmlList.firstChild);
    }
    alreadyAddedNames = [];
  }
}

// this function puts an array in the order given by another array
function sortAfterDefaultConfig(configArray, arrayToSort) {
  const orderedArray = [];
  configArray.forEach(element => {
    arrayToSort.forEach(entry => {
      if (entry.innerText === element) {
        orderedArray.push(entry);
      }
    });
  });
  return orderedArray;
}
