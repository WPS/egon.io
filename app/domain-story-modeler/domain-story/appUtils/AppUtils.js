import sanitize from '../util/Sanitizer';

import {
  getActivitesFromActors
}
  from '../label-editing/DSLabelUtil';

export function getNumebrsAndIDs(canvas) {
  var iDWithNumber = [];
  var canvasObjects = canvas._rootElement.children;
  var activities = getActivitesFromActors(canvasObjects);

  for (var i = activities.length - 1; i >= 0; i--) {
    var id = activities[i].businessObject.id;
    var number = activities[i].businessObject.number;
    iDWithNumber.push({ id: id, number: number });
  }
  return iDWithNumber;
}

export function revertChange(iDWithNumber, canvas, eventBus) {
  var canvasObjects = canvas._rootElement.children;
  var activities = getActivitesFromActors(canvasObjects);
  for (var i = activities.length - 1; i >= 0; i--) {
    for (var j = iDWithNumber.length - 1; j >= 0; j--) {
      if (iDWithNumber[j].id.includes(activities[i].businessObject.id)) {
        var element = activities[i];
        element.businessObject.number = iDWithNumber[j].number;
        j = -5;
        eventBus.fire('element.changed', { element });
        iDWithNumber.splice(j, 1);
      }
    }
  }
}

export function keyReleased(keysPressed, keyCode) {
  keysPressed[keyCode] = false;
}

export function checkInput(field) {
  field.value = sanitize(field.value);
}

export function getAllObjectsFromCanvas(canvas) {
  var canvasObjects=canvas._rootElement.children;
  var allObjects=[];
  var groupObjects=[];

  var i=0;
  for (i = 0; i < canvasObjects.length; i++) {
    if (canvasObjects[i].type.includes('domainStory:group')) {
      groupObjects.push(canvasObjects[i]);
    }
    else {
      allObjects.push(canvasObjects[i]);
    }
  }

  i = groupObjects.length - 1;
  while (groupObjects.length >= 1) {
    var currentgroup = groupObjects.pop();
    currentgroup.children.forEach(child => {
      if (child.type.includes('domainStory:group')) {
        groupObjects.push(child);
      }
      else {
        allObjects.push(child);
      }
    });
    i = groupObjects.length - 1;
  }
  return allObjects;
}

// helper

export function debounce(fn, timeout) {

  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}