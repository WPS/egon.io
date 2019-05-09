'use strict';

import { initializeAllIcons, getAllIconDictioary, deleteFromSelectedWorkObjectDictionary, deleteFromSelectedActorDictionary, getIconSource, addToSelectedActors, addToSelectedWorkObjects, selectedCitionariesAreNotEmpty, getAppendedIconDictionary } from './dictionaries';
import { ACTOR, WORKOBJECT } from '../../language/elementTypes';
import { domExists } from '../../language/testmode';
import { isInTypeDictionary } from '../../language/icon/dictionaries';

let htmlList = document.getElementById('allIconsList');
let selectedActorsList = document.getElementById('selectedActorsList');
let selectedWorkObjectList = document. getElementById('selectedWorkObjectsList');

const Sortable = require('sortablejs');
const iconSize = 20;
const highlightBackgroundColor = '#f6f6f6';

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
  sort: 'true',
  onEnd: function(event) {
    dropElement(event);
  }
};

const workObjectListOptions = {
  group: {
    name: 'workObjectIconList',
    put: ['actorIconList', 'workObjectIconList']
  },
  sort: 'true',
  onEnd: function(event) {
    dropElement(event);
  }
};

function updateBackgroundColors() {
  let children = htmlList.children;
  for (let i=0; i<children.length; i++) {
    let child = children[i];
    if (i%2 ==0) {
      child.style.backgroundColor = highlightBackgroundColor;
    } else {
      child.style.backgroundColor = 'white';
    }
  }
}

function dropElement(event) {
  let target = event.to;
  let source = event.srcElement;
  let draggedItem = event.item;

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
    updateSelectedWorkObjectsAndActors(listEntryName, addToActors, addToWorkObjects, false);
  }
}

export function createListOfAllIcons() {
  new Sortable(htmlList, mainListOptions);
  new Sortable(selectedActorsList, actorListOptions);
  new Sortable(selectedWorkObjectList, workObjectListOptions);

  initializeAllIcons();

  let allIconDictionary = getAllIconDictioary();

  let allIconNames = allIconDictionary.keysArray();
  let i=0;
  allIconNames.forEach(name => {
    let listElement = createListElement(name, (i%2)==0);
    htmlList.appendChild(listElement);
    i++;
  });

  let appendIconDictionary = getAppendedIconDictionary();
  let allAppendIconNames = appendIconDictionary.keysArray();
  allAppendIconNames.forEach(name => {
    let listElement = createListElement(name, (i%2)==0);
    htmlList.appendChild(listElement);
    i++;
  });
}

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

  listElement.style.marginLeft = '5px';
  listElement.style.height = '20px';
  listElement.style.display ='grid';
  listElement.style.gridTemplateColumns = '125px 10px 30px auto';
  listElement.style.borderTop = 'solid 1px black';
  if (greyBackground) {
    listElement.style.backgroundColor = highlightBackgroundColor;
  }

  radioElement.id = 'radioButtons';
  radioElement.style.display = 'grid';
  radioElement.style.gridTemplateColumns = '45px 45px 30px';

  inputRadioNone.setAttribute('type', 'radio');
  inputRadioNone.setAttribute('name', name);
  inputRadioNone.setAttribute('value', 'none');

  inputRadioActor.setAttribute('type', 'radio');
  inputRadioActor.setAttribute('name', name);
  inputRadioActor.setAttribute('value', 'actor');

  inputRadioWorkObject.setAttribute('type', 'radio');
  inputRadioWorkObject.setAttribute('name', name);
  inputRadioWorkObject.setAttribute('value', 'workObject');

  if (isInTypeDictionary(ACTOR, ACTOR +name)) {
    inputRadioActor.checked = true;
    createListElementInSeletionList(name, getIconSource(name), selectedActorsList);
    addToSelectedActors(name, getIconSource(name));
  } else if (isInTypeDictionary(WORKOBJECT, WORKOBJECT + name)) {
    inputRadioWorkObject.checked = true;
    createListElementInSeletionList(name, getIconSource(name), selectedWorkObjectList);
    addToSelectedWorkObjects(name, getIconSource(name));
  }
  else {
    inputRadioNone.checked = true;
  }

  verticalLineElement.style.display = 'inline';
  verticalLineElement.style.borderLeft = 'solid 1px black';
  verticalLineElement.width ='1px';
  verticalLineElement.heigth = '15px';
  verticalLineElement.style.overflowY = 'visible';
  verticalLineElement.style.marginLeft = '5px';

  imageElement.width = iconSize;
  imageElement.heigth = iconSize;
  imageElement.style.marginLeft = '5px';
  if (iconSRC.startsWith('data')) {
    imageElement.src= iconSRC;
  } else {
    imageElement.src= ('data:image/svg+xml,' + iconSRC);
  }

  nameElement.innerHTML = name;

  radioElement.appendChild(inputRadioNone);
  radioElement.appendChild(inputRadioActor);
  radioElement.appendChild(inputRadioWorkObject);

  radioElement.addEventListener('click', function() {
    let children = radioElement.children;
    let actorButton = children[1];
    let workObjectButton = children[2];

    let currentSelectionName = actorButton.name;
    let addToActors = false;
    let addToWorkObjects = false;
    if (actorButton.checked) {
      addToActors = true;
    }
    else if (workObjectButton.checked) {
      addToWorkObjects = true;
    }
    updateSelectedWorkObjectsAndActors(currentSelectionName, addToActors, addToWorkObjects, true);
  });

  listElement.appendChild(radioElement);
  listElement.appendChild(verticalLineElement);
  listElement.appendChild(imageElement);
  listElement.appendChild(nameElement);

  return listElement;
}

export function createListElementInSeletionList(name, src, list) {
  if (domExists()) {
    var listElement = document.createElement('li');
    var nameElement = document.createElement('text');
    var imageElement = document.createElement('img');

    imageElement.width = iconSize;
    imageElement.heigth = iconSize;
    if (src.startsWith('data')) {
      imageElement.src= src;
    } else {
      imageElement.src= ('data:image/svg+xml,' + src);
    }

    nameElement.innerHTML = name;
    nameElement.style.marginLeft ='5px';

    listElement.appendChild(imageElement);
    listElement.appendChild(nameElement);

    list.appendChild(listElement);
  }
}

function removeListEntry(name, list) {
  let children = list.children;
  let wantedChild;
  for (let i=0; i<children.length; i++) {
    let child = children[i];
    let innerText = child.innerText;
    if (innerText.includes(name)) {
      wantedChild = child;
    }
  }
  if (wantedChild) {
    list.removeChild(wantedChild);
  }
}

function updateSelectedWorkObjectsAndActors(currentSelectionName, addToActors, addToWorkObjects, updateHTML) {

  deleteFromSelectedWorkObjectDictionary(currentSelectionName);
  if (deleteFromSelectedActorDictionary(currentSelectionName)) {
    if (updateHTML) {
      removeListEntry(currentSelectionName, selectedActorsList);
    }
  } else {
    if (updateHTML) {
      removeListEntry(currentSelectionName, selectedWorkObjectList);
    }
  }

  let iconSRC = getIconSource(currentSelectionName);
  if (addToActors) {
    addToSelectedActors(currentSelectionName, iconSRC);
    if (updateHTML) {
      createListElementInSeletionList(currentSelectionName, iconSRC, selectedActorsList);
    }
  }
  else if (addToWorkObjects) {
    addToSelectedWorkObjects(currentSelectionName, iconSRC);
    if (updateHTML) {
      createListElementInSeletionList(currentSelectionName, iconSRC, selectedWorkObjectList);
    }
  }

  let exportConfigurationButton = document.getElementById('exportConfigurationButton');
  let customIconConfigSaveButton = document.getElementById('customIconConfigSaveButton');

  if (selectedCitionariesAreNotEmpty()) {
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

  if (!updateHTML) {
    let correspondingAllIconElement = document.evaluate('//text[contains(., \''+currentSelectionName +'\')]', document, null, XPathResult.ANY_TYPE, null).iterateNext().parentNode;
    let radioButtons = correspondingAllIconElement.children[0];

    //    let radioNone = radioButtons.children[0];
    let radioActor = radioButtons.children[1];
    let radioWorkObject = radioButtons.children[2];

    if (addToActors) {
      radioActor.checked = true;
      radioWorkObject.checked = false;
    } else {
      radioActor.checked = false;
      radioWorkObject.checked = true;
    }
  }
}


export function resetHTMLSelectionList() {
  let i=0, child;
  for (i=selectedWorkObjectList.children.length -1; i>=0; i--) {
    child = selectedWorkObjectList.children[i];
    selectedWorkObjectList.removeChild(child);
  }

  for (i=selectedActorsList.children.length -1; i>=0; i--) {
    child = selectedActorsList.children[i];
    selectedActorsList.removeChild(child);
  }
}