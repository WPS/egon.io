
import { ACTIVITY, WORKOBJECT } from '../../language/elementTypes';
import { getAllCanvasObjects } from '../../language/canvasElementRegistry';


let activityDictionary = [];
let workObjectDictionary = [];

export function getActivityDictionary() {
  return activityDictionary.slice();
}

export function getWorkObjectDictionary() {
  return workObjectDictionary.slice();
}

export function cleanDictionaries() {
  cleanActicityDictionary();
  cleanWorkObjecDictionary();

  let dictionaryButton = document.getElementById('dictionaryButton');

  if (activityDictionary.length > 0 || workObjectDictionary.length > 0) {
    dictionaryButton.style.opacity = 1;
    dictionaryButton.style.pointerEvents = 'all';

    dictionaryButton.onmouseover = function() {
      dictionaryButton.style.border = '1px solid #CCC';
    };
    dictionaryButton.onmouseout = function() {
      dictionaryButton.style.border = '';
    };
  } else {
    dictionaryButton.style.opacity = 0.2;
    dictionaryButton.style.pointerEvents = 'none';

    dictionaryButton.onmouseover = function() { };
    dictionaryButton.onmouseout = function() { };
  }
}

export function openDictionary() {
  cleanDictionaries();

  let element, i = 0;
  let activityDictionary = getActivityDictionary(),
      workobjectDictionary = getWorkObjectDictionary();
  let activityDictionaryContainer = document.getElementById('activityDictionaryContainer'),
      workobjectDictionaryContainer = document.getElementById('workobjectDictionaryContainer'),
      modal = document.getElementById('modal'),
      dictionaryDialog = document.getElementById('dictionaryDialog');

  activityDictionaryContainer.innerHTML = '';
  workobjectDictionaryContainer.innerHTML = '';

  for (i; i < activityDictionary.length; i++) {
    addElement(element, activityDictionaryContainer, activityDictionary, i);
  }

  for (i = 0; i < workobjectDictionary.length; i++) {
    addElement(element, workobjectDictionaryContainer, workobjectDictionary, i);
  }

  modal.style.display = 'block';
  dictionaryDialog.style.display = 'block';
}

export function dictionaryClosed(commandStack, activityDictionaryContainer, workobjectDictionaryContainer) {
  let oldActivityDictionary = getActivityDictionary();
  let oldWorkobjectDictionary = getWorkObjectDictionary();
  let activityNewNames = [];
  let workObjectNewNames = [];

  activityDictionaryContainer.childNodes.forEach(child=>{
    if (child.value) {
      activityNewNames[child.id] = child.value;
    }
  });

  workobjectDictionaryContainer.childNodes.forEach(child=>{
    if (child.value) {
      workObjectNewNames[child.id] = child.value;
    }
  });

  if (activityNewNames.length === oldActivityDictionary.length && workObjectNewNames.length === oldWorkobjectDictionary.length) {
    dictionaryDifferences(activityNewNames, oldActivityDictionary, workObjectNewNames, oldWorkobjectDictionary, commandStack);
  }
}

function addElement(element, dictionaryContainer, dictionary, i) {
  element = document.createElement('INPUT');
  element.setAttribute('type', 'text');
  element.setAttribute('id', i);
  element.setAttribute('style', 'width:100%;  margin-bottom: 2px');
  element.value = dictionary[i];
  dictionaryContainer.appendChild(element);
  element = document.createElement('br');
  dictionaryContainer.appendChild(element);
}

// rework the activity-dictionary with the changed labels on the canvas
function cleanActicityDictionary() {
  activityDictionary = [];
  let allObjects = getAllCanvasObjects();
  allObjects.forEach(element => {
    let name = element.businessObject.name;
    if (name && name.length > 0 && element.type.includes(ACTIVITY) && !activityDictionary.includes(name)) {
      activityDictionary.push(name);
    }
  });
  activityDictionary.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
}

// rework the label-dictionary with the changed labels on the canvas
function cleanWorkObjecDictionary() {
  workObjectDictionary = [];

  let allObjects = getAllCanvasObjects();

  allObjects.forEach(element => {
    let name = element.businessObject.name;
    if (name && name.length > 0 && element.type.includes(WORKOBJECT) && !workObjectDictionary.includes(name)) {
      workObjectDictionary.push(name);
    }
  });
  workObjectDictionary.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
}

function dictionaryDifferences(activityNames, oldActivityDictionary, workObjectNames, oldWorkobjectDictionary, commandStack) {
  let i=0;
  for (i=0;i<oldActivityDictionary.length;i++) {
    if (!activityNames[i]) {
      activityNames[i]='';
    }
    if (!((activityNames[i].includes(oldActivityDictionary[i])) && (oldActivityDictionary[i].includes(activityNames[i])))) {
      massChangeNames(oldActivityDictionary[i], activityNames[i], ACTIVITY, commandStack);
    }
  }
  for (i=0;i<oldWorkobjectDictionary.length;i++) {
    if (!workObjectNames[i]) {
      workObjectNames[i]='';
    }
    if (!((workObjectNames[i].includes(oldWorkobjectDictionary[i])) && (oldWorkobjectDictionary[i].includes(workObjectNames[i])))) {
      massChangeNames(oldWorkobjectDictionary[i], workObjectNames[i], WORKOBJECT, commandStack);
    }
  }

  // delete old entires from stashes
}

function massChangeNames(oldValue, newValue, type, commandStack) {
  let allObjects = getAllCanvasObjects();
  let allRelevantObjects=[];

  allObjects.forEach(element =>{
    if (element.type.includes(type) && element.businessObject.name == oldValue) {
      allRelevantObjects.push(element);
    }
  });

  let context = {
    elements: allRelevantObjects,
    newValue: newValue
  };

  commandStack.execute('domainStoryObjects.massRename', context);
}
