'use strict';

import { getActivitesFromActors } from '../../language/canvasElementRegistry';
import { labelPosition } from '../labeling/position';


let numberRegistry = [];
let multipleNumberRegistry = [false];

// defines the box for activity numbers
export function numberBoxDefinitions(element) {
  let alignement = 'center';
  let boxWidth = 30;
  let boxHeight = 30;
  let position = labelPosition(element.waypoints);
  let xPos = position.x - 50;
  let yPos = position.y - 19;

  let box = {
    textAlign: alignement,
    width: boxWidth,
    height: boxHeight,
    x: xPos,
    y: yPos
  };
  return box;
}

// determine the next available number that is not yet used
export function generateAutomaticNumber(elementActivity, commandStack) {
  let semantic = elementActivity.businessObject;
  let activiesFromActors = [];
  let usedNumbers = [0];
  let wantedNumber = -1;

  activiesFromActors = getActivitesFromActors();

  activiesFromActors.forEach(element => {
    if (element.businessObject.number != null) {
      usedNumbers.push(element.businessObject.number);
    }
  });
  for (let i = 0; i < usedNumbers.length; i++) {
    if ((!usedNumbers.includes(i))) {
      if (!usedNumbers.includes(String(i))) {
        wantedNumber = i;
        i = usedNumbers.length;
      }
    }
  }
  if (wantedNumber === -1) {
    wantedNumber = usedNumbers.length;
  }

  updateExistingNumbersAtGeneration(activiesFromActors, wantedNumber, commandStack);
  semantic.number = wantedNumber;
}

// update the numbers at the activities when generating a new activity
export function updateExistingNumbersAtGeneration(activiesFromActors, wantedNumber, commandStack) {

  activiesFromActors.forEach(element => {

    let number = +element.businessObject.number;

    if (number >= wantedNumber) {
      wantedNumber++;
      setTimeout(function() {
        commandStack.execute('activity.changed', {
          businessObject: element.businessObject,
          newLabel: element.businessObject.name,
          newNumber: number,
          element: element
        });
      }, 10);
    }
  });
}

// update the numbers at the activities when editing an activity
export function updateExistingNumbersAtEditing(activiesFromActors, wantedNumber, eventBus) {

  // get a sorted list of all activities that could need changing
  let sortedActivities = [[]];
  activiesFromActors.forEach(activity => {
    if (!sortedActivities[activity.businessObject.number]) {
      sortedActivities[activity.businessObject.number] = [];
    }
    sortedActivities[activity.businessObject.number].push(activity);
  });

  // set the number of each activity to the next highest number, starting from the number, we overrode
  let currentNumber = wantedNumber;
  for (currentNumber; currentNumber < sortedActivities.length; currentNumber++) {
    if (sortedActivities[currentNumber]) {
      wantedNumber++;
      setNumberOfActivity(sortedActivities[currentNumber], wantedNumber, eventBus);
    }
  }
}

// get the IDs of activities with their associated number, only returns activities that are originating from an actor
export function getNumbersAndIDs() {
  let iDWithNumber = [];
  let activities = getActivitesFromActors();

  for (let i = activities.length - 1; i >= 0; i--) {
    let id = activities[i].businessObject.id;
    let number = activities[i].businessObject.number;
    iDWithNumber.push({ id: id, number: number });
  }
  return iDWithNumber;
}

export function addNumberToRegistry(renderedNumber, number) {
  numberRegistry[number] = renderedNumber;
}

export function setNumberIsMultiple(number, multi) {
  multipleNumberRegistry[number] = multi;
}

/**
 * @returns copy of registry
 */
export function getNumberRegistry() {
  return numberRegistry.slice(0);
}

export function getMultipleNumberRegistry() {
  return multipleNumberRegistry.slice(0);
}

function setNumberOfActivity(elementArray, wantedNumber, eventBus) {
  if (elementArray) {
    elementArray.forEach(element => {
      if (element) {
        let businessObject = element.businessObject;
        if (businessObject) {
          businessObject.number = wantedNumber;
        }
        eventBus.fire('element.changed', { element });
      }
    });
  }
}