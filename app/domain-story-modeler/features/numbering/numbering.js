'use strict';

import { labelPosition, getActivitesFromActors } from '../../util/DSActivityUtil';

// defines the box for activity numbers
export function numberBoxDefinitions(element) {
  var alignement = 'center';
  var boxWidth = 30;
  var boxHeight = 30;
  var position = labelPosition(element.waypoints);
  var xPos = position.x - 50;
  var yPos = position.y - 19;

  var box = {
    textAlign: alignement,
    width: boxWidth,
    height: boxHeight,
    x: xPos,
    y: yPos
  };
  return box;
}


// determine the next available number that is not yet used
export function generateAutomaticNumber(elementActivity, canvas, commandStack) {
  var semantic = elementActivity.businessObject;
  var canvasObjects = canvas._rootElement.children;
  var activiesFromActors = [];
  var usedNumbers = [0];
  var wantedNumber = -1;

  activiesFromActors = getActivitesFromActors(canvasObjects);
  activiesFromActors.forEach(element => {
    if (element.businessObject.number != null) {
      usedNumbers.push(element.businessObject.number);
    }
  });
  for (var i = 0; i < usedNumbers.length; i++) {
    if ((!usedNumbers.includes(i))) {
      if (!usedNumbers.includes(String(i))) {
        wantedNumber = i;
        i = usedNumbers.length;
      }
    }
  }
  if (wantedNumber == -1) {
    wantedNumber = usedNumbers.length;
  }
  updateExistingNumbersAtGeneration(activiesFromActors, wantedNumber, commandStack);
  semantic.number = wantedNumber;
}

// update the numbers at the activities when generating a new activity
export function updateExistingNumbersAtGeneration(activiesFromActors, wantedNumber, commandStack) {
  activiesFromActors.forEach(element => {

    var number = +element.businessObject.number;

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
  var sortedActivities = [];
  activiesFromActors.forEach(activity => {
    sortedActivities[activity.businessObject.number] = activity;
  });

  // set the number of each activity to the next highest number, starting from the number, we overrode
  for (var currentNumber = wantedNumber; currentNumber < sortedActivities.length; currentNumber++) {
    var element = sortedActivities[currentNumber];
    if (element) {
      var businessObject = element.businessObject;
      if (businessObject) {
        wantedNumber++;
        businessObject.number = wantedNumber;
      }
      eventBus.fire('element.changed', { element });
    }
  }
}