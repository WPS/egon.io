'use strict';

import { selectPartOfActivity } from './DSLabelUtil';

export function countLines(str) {
  return str.split(/\r\n|\r|\n/).length;
}

// determine the position of the label at the activity
export function labelPosition(waypoints, lines = 1) {
  let amountWaypoints = waypoints.length;
  let determinedPosition = {};
  let xPos = 0;
  let yPos = 0;

  if (amountWaypoints > 2) {
    let angleActivity = new Array(amountWaypoints - 1);
    for (let i = 0; i < amountWaypoints - 1; i++) { // calculate the angles of the activities
      angleActivity[i] = Math.angleBetween(waypoints[i], waypoints[i + 1]);
    }

    let selectedActivity = selectPartOfActivity(waypoints, angleActivity);

    xPos = labelPositionX(waypoints[selectedActivity], waypoints[selectedActivity + 1]);
    yPos = labelPositionY(waypoints[selectedActivity], waypoints[selectedActivity + 1], lines);

    determinedPosition = {
      x: xPos,
      y: yPos,
      selected: selectedActivity
    };

    return determinedPosition;

  } else {
    xPos = labelPositionX(waypoints[0], waypoints[1]);
    yPos = labelPositionY(waypoints[0], waypoints[1], lines);

    determinedPosition = {
      x: xPos,
      y: yPos,
      selected: 0
    };

    return determinedPosition;
  }
}

// calculate the X position of the label
export function labelPositionX(startPoint, endPoint) {
  let angle = Math.angleBetween(startPoint, endPoint);
  let offsetX = 0;
  let scaledangle = 0;

  if (angle === 0 || angle === 180 || angle === 90 || angle === 270) {
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
  return offsetX + (startPoint.x + endPoint.x)/2;
}

// calculate the Y position of the label
export function labelPositionY(startPoint, endPoint, lines=1) {
  let angle = Math.angleBetween(startPoint, endPoint);
  let offsetY = 0;
  let scaledangle = 0;

  if (angle === 0 || angle === 180) {
    offsetY = 15
    ;
  }
  else if (angle === 90 || angle === 270) {
    offsetY = 0;
  }
  else if (angle > 0 && angle < 90) { // endpoint in upper right quadrant
    offsetY = 15 - angle / 6;
  }
  else if (angle > 90 && angle < 180) { // endpoint in upper left quadrant
    scaledangle = angle - 90;
    offsetY = -scaledangle / 9 * lines;
  }
  else if (angle > 180 && angle < 270) { // endpoint in lower left quadrant
    scaledangle = angle - 180;
    offsetY = 15 - scaledangle / 3;
  }
  else if (angle > 270) { // endpoint in lower right quadrant
    scaledangle = angle - 270;
    offsetY = -scaledangle / 9 * lines;
  }
  return offsetY + (startPoint.y + endPoint.y)/2;
}