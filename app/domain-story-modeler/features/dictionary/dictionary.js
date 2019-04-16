
import { ACTIVITY, WORKOBJECT } from '../../language/elementTypes';
import { getAllCanvasObjects } from '../canvasElements/canvasElementRegistry';


var activityDictionary = [];
var workObjectDictionary = [];

// dictionary Getter & Setter
export function getActivityDictionary() {
  return activityDictionary.slice();
}

export function getWorkObjectDictionary() {
  return workObjectDictionary.slice();
}

export function cleanDictionaries() {
  cleanActicityDictionary();
  cleanWorkObjecDictionary();

  var dictionaryButton = document.getElementById('dictionaryButton');

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

// rework the activity-dictionary with the changed labels on the canvas
function cleanActicityDictionary() {
  activityDictionary = [];
  var allObjects = getAllCanvasObjects();
  allObjects.forEach(element => {
    var name = element.businessObject.name;
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

  var allObjects = getAllCanvasObjects();

  allObjects.forEach(element => {
    var name = element.businessObject.name;
    if (name && name.length > 0 && element.type.includes(WORKOBJECT) && !workObjectDictionary.includes(name)) {
      workObjectDictionary.push(name);
    }
  });
  workObjectDictionary.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
}


// create the HTML-elements associated with the dictionary and display it
export function openDictionary(canvas) {
  if (canvas._rootElement && canvas._rootElement.children && canvas._rootElement.children.length > 0) {

    cleanDictionaries();

    var element, i = 0;
    var activityDictionary = getActivityDictionary(),
        workobjectDictionary = getWorkObjectDictionary();
    var activityDictionaryContainer = document.getElementById('activityDictionaryContainer'),
        workobjectDictionaryContainer = document.getElementById('workobjectDictionaryContainer'),
        modal = document.getElementById('modal'),
        dictionaryDialog = document.getElementById('dictionary');

    activityDictionaryContainer.innerHTML = '';
    workobjectDictionaryContainer.innerHTML = '';

    for (i; i < activityDictionary.length; i++) {
      element = document.createElement('INPUT');
      element.setAttribute('type', 'text');
      element.setAttribute('id', i);
      element.setAttribute('style', 'width:100%;  margin-bottom: 2px');
      element.value = activityDictionary[i];
      activityDictionaryContainer.appendChild(element);
      element = document.createElement('br');
      activityDictionaryContainer.appendChild(element);
    }

    for (i = 0; i < workobjectDictionary.length; i++) {
      element = document.createElement('INPUT');
      element.setAttribute('type', 'text');
      element.setAttribute('id', i);
      element.setAttribute('style', 'width:100%;  margin-bottom: 2px');
      element.value = workobjectDictionary[i];
      workobjectDictionaryContainer.appendChild(element);
      element = document.createElement('br');
      workobjectDictionaryContainer.appendChild(element);
    }

    modal.style.display = 'block';
    dictionaryDialog.style.display = 'block';
  }
}