"use strict";

import { labelPosition } from "../labeling/position";
import { angleBetween } from "../../../Utils/mathExtensions";

let numberRegistry = [];
let multipleNumberRegistry = [false];

let canvasElementRegistry;

export function initializeNumbering(canvasElementRegistryService) {
  canvasElementRegistry = canvasElementRegistryService;
}

// defines the box for activity numbers
export function numberBoxDefinitions(element) {
  let alignment = "center";
  let boxWidth = 30;
  let boxHeight = 30;
  let position = labelPosition(element.waypoints);
  let angle = 0;
  if (element.waypoints.length > 1) {
    angle = angleBetween(
      element.waypoints[element.waypoints.length - 2],
      element.waypoints[element.waypoints.length - 1]
    );
  }
  let x = position.x;
  let y = position.y;

  // TODO: Use trigonometric functions to make the positioning more consistent.
  // This would require to touch the label code as well.
  if (angle >= 0 && angle <= 45) {
    y = y - 30 + angle / 2;
    x = x - 25 - angle / 2;
  } else if (angle <= 90) {
    y = y - 10 + (angle - 45) / 4.5;
    x = x - 35 - angle / 9;
  } else if (angle <= 145) {
    y = y + angle / 7.25;
    x = x - 45 - angle / 14.5;
  } else if (angle < 180) {
    y = y + 20 + angle / 9;
    x = x - 50 + angle / 4.5;
  } else if (angle <= 225) {
    y = y - 45 + angle / 12.25;
    x = x + 10 - angle / 6.125;
  } else if (angle <= 270) {
    y = y - 80 + angle / 3.375;
    x = x - 5 - angle / 6.125;
  } else if (angle <= 315) {
    y = y - 135 + angle / 2;
    x = x - 50;
  } else {
    y = y + 22.5 + (angle - 315) / 6;
    x = x - 50 + (angle - 315) / 1.8;
  }

  return {
    textAlign: alignment,
    width: boxWidth,
    height: boxHeight,
    x: x,
    y: y,
  };
}

// determine the next available number that is not yet used
export function generateAutomaticNumber(elementActivity, commandStack) {
  const semantic = elementActivity.businessObject;
  const usedNumbers = [0];
  let wantedNumber = -1;

  const activitiesFromActors = canvasElementRegistry.getActivitiesFromActors();

  activitiesFromActors.forEach((element) => {
    if (element.businessObject.number) {
      usedNumbers.push(+element.businessObject.number);
    }
  });
  for (let i = 0; i < usedNumbers.length; i++) {
    if (!usedNumbers.includes(i)) {
      if (!usedNumbers.includes(i)) {
        wantedNumber = i;
        i = usedNumbers.length;
      }
    }
  }
  if (wantedNumber === -1) {
    wantedNumber = usedNumbers.length;
  }

  updateExistingNumbersAtGeneration(
    activitiesFromActors,
    wantedNumber,
    commandStack
  );
  semantic.number = wantedNumber;
  return wantedNumber;
}

// update the numbers at the activities when generating a new activity
export function updateExistingNumbersAtGeneration(
  activitiesFromActors,
  wantedNumber,
  commandStack
) {
  activitiesFromActors.forEach((element) => {
    let number = +element.businessObject.number;

    if (number >= wantedNumber) {
      wantedNumber++;
      setTimeout(function () {
        commandStack.execute("activity.changed", {
          businessObject: element.businessObject,
          newLabel: element.businessObject.name,
          newNumber: number,
          element: element,
        });
      }, 10);
    }
  });
}

// update the numbers at the activities when editing an activity
export function updateExistingNumbersAtEditing(
  activitiesFromActors,
  wantedNumber,
  eventBus
) {
  // get a sorted list of all activities that could need changing
  let sortedActivities = [[]];
  activitiesFromActors.forEach((activity) => {
    if (!sortedActivities[activity.businessObject.number]) {
      sortedActivities[activity.businessObject.number] = [];
    }
    sortedActivities[activity.businessObject.number].push(activity);
  });

  // set the number of each activity to the next highest number, starting from the number, we overrode
  let currentNumber = wantedNumber;
  for (
    currentNumber;
    currentNumber < sortedActivities.length;
    currentNumber++
  ) {
    if (sortedActivities[currentNumber]) {
      wantedNumber++;
      setNumberOfActivity(
        sortedActivities[currentNumber],
        wantedNumber,
        eventBus
      );
    }
  }
}

// get the IDs of activities with their associated number, only returns activities that are originating from an actor
export function getNumbersAndIDs() {
  let iDWithNumber = [];
  let activities = canvasElementRegistry.getActivitiesFromActors();

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
    elementArray.forEach((element) => {
      if (element) {
        let businessObject = element.businessObject;
        if (businessObject) {
          businessObject.number = wantedNumber;
        }
        eventBus.fire("element.changed", { element });
      }
    });
  }
}
