'use strict';
// TODO rename

import { initializeAllIcons, getAllIconDictioary, deleteFromSelectedWorkObjectDictionary, deleteFromSelectedActorDictionary, getIconSource, addToSelectedActors, addToSelectedWorkObjects } from './dictionaries';
import { isInActorIconRegsitry } from '../../language/actorIconRegistry';
import { isInWorkObjectIconRegsitry } from '../../language/workObjectIconRegistry';
import { ACTOR, WORKOBJECT } from '../../language/elementTypes';

var htmlList = document.getElementById('allIconsList');
var selectedActorsList = document.getElementById('selectedActorsList');
var selectedWorkObjectList = document. getElementById('selectedWorkObjectsList');

const iconSize = 15;

export function createListOfAllIcons() {

  initializeAllIcons();

  var allIconDictionary = getAllIconDictioary();

  var allIconNames = allIconDictionary.keysArray();
  allIconNames.forEach(name => {
    var listElement = createListElement(name);
    htmlList.appendChild(listElement);
  });
}

function updateSelectedWorkObjectsAndActors(currentSelectionName, addToActors, addToWorkObjects) {

  deleteFromSelectedWorkObjectDictionary(currentSelectionName);
  if (deleteFromSelectedActorDictionary(currentSelectionName)) {
    removeChild(currentSelectionName, selectedActorsList);
  } else {
    removeChild(currentSelectionName, selectedWorkObjectList);
  }

  var iconSRC = getIconSource(currentSelectionName);
  if (addToActors) {
    addToSelectedActors(currentSelectionName, iconSRC);
    createSelectedListEntry(currentSelectionName, iconSRC, selectedActorsList);
  }
  else if (addToWorkObjects) {
    addToSelectedWorkObjects(currentSelectionName, iconSRC);
    createSelectedListEntry(currentSelectionName, iconSRC, selectedWorkObjectList);
  }
}

function removeChild(name, list) {
  var children = list.children;
  var wantedChild;
  for (var i=0; i<children.length; i++) {
    var child = children[i];
    var innerText = child.innerText;
    if (innerText.includes(name)) {
      wantedChild = child;
    }
  }
  if (wantedChild) {
    list.removeChild(wantedChild);
  }
}

export function createListElement(name) {
  var iconSRC = getIconSource(name);

  var listElement = document.createElement('li');
  var nameElement = document.createElement('text');
  var imageElement = document.createElement('img');
  var radioElement = document.createElement('div');

  var inputRadioNone = document.createElement('input');
  var inputRadioActor = document.createElement('input');
  var inputRadioWorkObject = document.createElement('input');

  var unselectedText = document.createElement('text');
  var actorText = document.createElement('text');
  var workObjectText = document.createElement('text');

  unselectedText.innerHTML = ' ';
  actorText.innerHTML='Actor';
  workObjectText.innerHTML='WorkObject';

  radioElement.style.display = 'inline';

  inputRadioNone.setAttribute('type', 'radio');
  inputRadioNone.setAttribute('name', name);
  inputRadioNone.setAttribute('value', 'none');

  inputRadioActor.setAttribute('type', 'radio');
  inputRadioActor.setAttribute('name', name);
  inputRadioActor.setAttribute('value', 'actor');

  inputRadioWorkObject.setAttribute('type', 'radio');
  inputRadioWorkObject.setAttribute('name', name);
  inputRadioWorkObject.setAttribute('value', 'workObject');

  if (isInActorIconRegsitry(ACTOR +name)) {
    inputRadioActor.checked = true;
    createSelectedListEntry(name, getIconSource(name), selectedActorsList);
    addToSelectedActors(name, getIconSource(name));
  } else if (isInWorkObjectIconRegsitry(WORKOBJECT + name)) {
    inputRadioWorkObject.checked = true;
    createSelectedListEntry(name, getIconSource(name), selectedWorkObjectList);
    addToSelectedWorkObjects(name, getIconSource(name));
  }
  else {
    inputRadioNone.checked = true;
  }

  imageElement.width = iconSize;
  imageElement.heigth = iconSize;
  imageElement.src= ('data:image/svg+xml,' + iconSRC);

  nameElement.innerHTML = name;

  radioElement.appendChild(inputRadioNone);
  radioElement.appendChild(unselectedText);
  radioElement.appendChild(inputRadioActor);
  radioElement.appendChild(actorText);
  radioElement.appendChild(inputRadioWorkObject);
  radioElement.appendChild(workObjectText);

  radioElement.addEventListener('click', function() {
    var children = radioElement.children;
    var actorButton = children[2];
    var workObjectButton = children[4];

    var currentSelectionName = actorButton.name;
    var addToActors = false;
    var addToWorkObjects = false;
    if (actorButton.checked) {
      addToActors = true;
    }
    else if (workObjectButton.checked) {
      addToWorkObjects = true;
    }
    updateSelectedWorkObjectsAndActors(currentSelectionName, addToActors, addToWorkObjects);
  });

  listElement.appendChild(imageElement);
  listElement.appendChild(nameElement);
  listElement.appendChild(radioElement);

  return listElement;
}

export function createSelectedListEntry(name, src, list) {
  var listElement = document.createElement('li');
  var nameElement = document.createElement('text');
  var imageElement = document.createElement('img');

  imageElement.width = iconSize;
  imageElement.heigth = iconSize;
  imageElement.src= ('data:image/svg+xml,' + src);

  nameElement.innerHTML = name;

  listElement.appendChild(imageElement);
  listElement.appendChild(nameElement);

  list.appendChild(listElement);
}
