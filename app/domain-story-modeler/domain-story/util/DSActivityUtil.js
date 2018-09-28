'use strict';

/**
 * Utility functions that deal with activities
*/

export function getNumbersAndIDs(canvas) {
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

// reverts the automatic changed done by the automatic number-gerneration at editing
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

// calculate the center between two points
export function calculateXY(startPoint, endPoint) {
  var centerPoint;

  if (startPoint >= endPoint) {
    centerPoint = (startPoint - endPoint) / 2 + endPoint;
  } else {
    centerPoint = (endPoint - startPoint) / 2 + startPoint;
  }

  return centerPoint;
}

// calculate the X position of the label
export function labelPositionX(startPoint, endPoint) {
  var angle = calculateDeg(startPoint, endPoint);
  var offsetX = 0;
  var scaledangle = 0;
  if (angle == 0 || angle == 180 || angle == 90 || angle == 270) {
    offsetX = 0;
  }
  else if (angle > 0 && angle < 90) { // endpoint in upper right quadrant
    offsetX = 5 - angle / 6;
  }
  else if (angle > 90 && angle < 180) { // endpoint in upper left quadrant
    scaledangle = angle - 90;
    offsetX = 5 - scaledangle / 18;
  }
  else if (angle > 180 && angle < 270) { // endpoint in lower left quadrant
    scaledangle = angle - 180;
    offsetX = scaledangle / 18;
  }
  else if (angle > 270) { // endpoint in lower right quadrant
    scaledangle = angle - 270;
    offsetX = 5 - scaledangle / 6;
  }
  return offsetX + calculateXY(startPoint.x, endPoint.x);
}

// calculate the Y position of the label
export function labelPositionY(startPoint, endPoint) {
  var angle = calculateDeg(startPoint, endPoint);
  var offsetY = 0;
  var scaledangle = 0;

  if (angle == 0 || angle == 180) {
    offsetY = 15;
  }
  else if (angle == 90 || angle == 270) {
    offsetY = 0;
  }
  else if (angle > 0 && angle < 90) { // endpoint in upper right quadrant
    offsetY = 15 - angle / 6;
  }
  else if (angle > 90 && angle < 180) { // endpoint in upper left quadrant
    scaledangle = angle - 90;
    offsetY = -scaledangle / 9;
  }
  else if (angle > 180 && angle < 270) { // endpoint in lower left quadrant
    scaledangle = angle - 180;
    offsetY = 15 - scaledangle / 3;
  }
  else if (angle > 270) { // endpoint in lower right quadrant
    scaledangle = angle - 270;
    offsetY = -scaledangle / 9;
  }
  return offsetY + calculateXY(startPoint.y, endPoint.y);
}

// select at which part of the activity the label should be attached to
export function selectActivity(waypoints, angleActivity) {
  var selectedActivity = 0;
  var i = 0;
  var linelength = 49;

  for (i = 0; i < waypoints.length; i++) {
    if ((angleActivity[i] == 0) || (angleActivity[i] == 180)) {
      var length = Math.abs(waypoints[i].x - waypoints[i + 1].x);
      if (length > linelength) {
        selectedActivity = i;
      }
    }
  }
  return selectedActivity;
}

// determine the position of the label at the activity
export function labelPosition(waypoints) {
  var amountWaypoints = waypoints.length;
  var determinedPosition = {};
  var xPos = 0;
  var yPos = 0;

  if (amountWaypoints > 2) {
    var angleActivity = new Array(amountWaypoints - 1);
    for (var i = 0; i < amountWaypoints - 1; i++) { // calculate the angles of the activities
      angleActivity[i] = calculateDeg(waypoints[i], waypoints[i + 1]);
    }

    var selectedActivity = selectActivity(waypoints, angleActivity);

    xPos = labelPositionX(waypoints[selectedActivity], waypoints[selectedActivity + 1]);
    yPos = labelPositionY(waypoints[selectedActivity], waypoints[selectedActivity + 1]);

    determinedPosition = {
      x: xPos,
      y: yPos,
      selected: selectedActivity
    };

    return determinedPosition;

  } else {
    xPos = labelPositionX(waypoints[0], waypoints[1]);
    yPos = labelPositionY(waypoints[0], waypoints[1]);

    determinedPosition = {
      x: xPos,
      y: yPos,
      selected: 0
    };

    return determinedPosition;
  }
}

// calculate the angle between two points in 2D
export function calculateDeg(startPoint, endPoint) {
  var quadrant = 0;

  // determine in which quadrant we are
  if (startPoint.x <= endPoint.x) {
    if (startPoint.y >= endPoint.y)
      quadrant = 0; // upper right quadrant
    else quadrant = 3; // lower right quadrant
  }
  else {
    if (startPoint.y >= endPoint.y)
      quadrant = 1; // upper left uadrant
    else quadrant = 2; // lower left quadrant
  }

  var adjacenten = Math.abs(startPoint.y - endPoint.y);
  var opposite = Math.abs(startPoint.x - endPoint.x);

  // since the arcus-tangens only gives values between 0 and 90, we have to adjust for the quadrant we are in

  if (quadrant == 0) {
    return 90 - Math.degrees(Math.atan2(opposite, adjacenten));
  }
  if (quadrant == 1) {
    return 90 + Math.degrees(Math.atan2(opposite, adjacenten));
  }
  if (quadrant == 2) {
    return 270 - Math.degrees(Math.atan2(opposite, adjacenten));
  }
  if (quadrant == 3) {
    return 270 + Math.degrees(Math.atan2(opposite, adjacenten));
  }
}

// convert rad to deg
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

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
        businessObject.number=wantedNumber;
      }
      eventBus.fire('element.changed', { element });
    }
  }
}

// get a list of activities, that originate from an actor-type
export function getActivitesFromActors(canvasObjects) {
  var activiesFromActors = [];

  canvasObjects.forEach(element => {
    if (element.type.includes('domainStory:activity')) {
      if (element.source.type.includes('domainStory:actor')) {
        activiesFromActors.push(element);
      }
    }
    if (element.type.includes('domainStory:group')) {
      var groupChildren = element.children;
      groupChildren.forEach(child => {
        if (child.type.includes('domainStory:activity')) {
          if (child.source.type.includes('domainStory:actor')) {
            activiesFromActors.push(child);
          }
        }
      });
    }
  });
  return activiesFromActors;
}

// determine the next available number that is not yet used
export function generateAutomaticNumber(elementActivity,canvas, commandStack) {
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