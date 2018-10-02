import { getAllObjectsFromCanvas } from '../../domain-story/util/DSUtil';

var activityDictionary = [];
var workObjectDictionary =[];

// dictionary Getter & Setter
export function getActivityDictionary() {
  return activityDictionary.slice();
}

export function getWorkObjectDictionary() {
  return workObjectDictionary.slice();
}

export function cleanDictionaries(canvas) {
  cleanActicityDictionary(canvas);
  cleanWorkObjecDictionary(canvas);

  var dictionaryButton = document.getElementById('dictionaryButton');

  if (activityDictionary.length > 0 || workObjectDictionary.length >0) {
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
function cleanActicityDictionary(canvas) {
  activityDictionary=[];
  var allObjects = getAllObjectsFromCanvas(canvas);
  allObjects.forEach(element => {
    var name=element.businessObject.name;
    if (name.length > 0 && element.type.includes('domainStory:activity') && !activityDictionary.includes(name)) {
      activityDictionary.push(name);
    }
  });
  activityDictionary.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
}

// rework the label-dictionary with the changed labels on the canvas
function cleanWorkObjecDictionary(canvas) {
  workObjectDictionary = [];

  var allObjects = getAllObjectsFromCanvas(canvas);

  allObjects.forEach(element =>{
    var name = element.businessObject.name;
    if (name.length > 0 && element.type.includes('domainStory:workObject') && !workObjectDictionary.includes(name)) {
      workObjectDictionary.push(name);
    }
  });
  workObjectDictionary.sort(function(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });
}
