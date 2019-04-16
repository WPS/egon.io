import { WORKOBJECT, GROUP, ACTOR, CONNECTION, ACTIVITY } from '../../language/elementTypes';

'use strict';

var elementRegistry;
var initCorrected = false;

export function initElementRegistry(registry) {
  initCorrected = false;
  elementRegistry = registry._elements;
}

// during testing, the BPMN elementRegistry is never initilized. When testing importing a domainStory, we need to supress the correction of the elementRegistry to avoid null Pointer errors in correctElementRegitryInit().
export function testCase() {
  initCorrected = true;
}

// since the elementRegistry from BPMN does a lazy initialize, where it only gets the desired children, once an Object has been added via import or by the user.
// once the desired children are present, we correct the referenced Object to the one we actually want.
export function correctElementRegitryInit() {
  if (!initCorrected) {
    if (elementRegistry.__implicitroot) {
      elementRegistry = elementRegistry.__implicitroot.element.children;
      initCorrected = true;
    }
  }
}

export function getAllActivities() {
  var activities = [];
  if (elementRegistry) {
    elementRegistry.forEach(element => {
      var type = element.type;
      if (type == ACTIVITY) {
        activities.push(element);
      }
    });
  }
  return activities;
}

export function getAllConnections() {
  var connections = [];
  elementRegistry.forEach(element => {
    var type = element.type;
    if (type == CONNECTION) {
      connections.push(element);
    }
  });
  return connections;
}

export function getAllActors() {
  var actors = [];
  elementRegistry.forEach(element => {
    var type = element.type;
    if (type == ACTOR) {
      actors.push(element);
    }
  });
  return actors;
}

export function getAllWorkObjects() {
  var workObjects = [];
  elementRegistry.forEach(element => {
    var type = element.type;
    if (type.includes(WORKOBJECT)) {
      workObjects.push(element);
    }
  });
  return workObjects;
}

export function getAllCanvasObjects() {
  var allObjects=[];
  var groupObjects=[];

  // check for every child of the canvas wether it is a group or not
  var i=0;
  for (i = 0; i < elementRegistry.length; i++) {
    var type = elementRegistry[i].type;
    if (type.includes(GROUP)) {
      // if it is a group, memorize this for later
      groupObjects.push(elementRegistry[i]);
    }
    else {
      allObjects.push(elementRegistry[i]);
    }
  }

  // for each memorized group, remove it from the group-array and check its chidren, wether they are roups or not
  // if a child is a group, memorize it in the goup-array
  // else add the child to the return-array
  i = groupObjects.length - 1;
  while (groupObjects.length >= 1) {
    var currentGroup = groupObjects.pop();
    currentGroup.children.forEach(child => {
      var type = child.type;
      if (type.includes(GROUP)) {
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

// returns all groups on the canvas and inside other groups
export function getAllGroups() {
  var groupObjects=[];
  var allObjects=[];

  // check for every child of the canvas wether it is a group or not
  var i=0;
  for (i = 0; i < elementRegistry.length; i++) {
    var type = elementRegistry[i].type;
    if (type.includes(GROUP)) {
      // if it is a group, memorize this for later
      groupObjects.push(elementRegistry[i]);
    }
    else {
      allObjects.push(elementRegistry[i]);
    }
  }
  for (i=0; i<groupObjects.length;i++) {
    var currentgroup=groupObjects[i];
    currentgroup.children.forEach(child => {
      if (child.type.includes(GROUP)) {
        groupObjects.push(child);
      }
    });
  }
  return groupObjects;
}

// get a list of activities, that originate from an actor-type
export function getActivitesFromActors() {
  var activiesFromActors = [];
  var activities = getAllActivities();

  activities.forEach(activity => {
    if (activity.source.type.includes(ACTOR)) {
      activiesFromActors.push(activity);
    }
  });
  return activiesFromActors;
}