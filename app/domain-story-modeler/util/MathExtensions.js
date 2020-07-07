'use strict';

export function dummy() {
}

// convert rad to deg
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

// calculate the angle between two points in 2D
Math.angleBetween = function(startPoint, endPoint) {
  let quadrant = 0;

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

  let adjacenten = Math.abs(startPoint.y - endPoint.y);
  let opposite = Math.abs(startPoint.x - endPoint.x);

  // since the arcus-tangens only gives values between 0 and 90, we have to adjust for the quadrant we are in

  if (quadrant === 0) {
    return 90 - Math.degrees(Math.atan2(opposite, adjacenten));
  }
  if (quadrant === 1) {
    return 90 + Math.degrees(Math.atan2(opposite, adjacenten));
  }
  if (quadrant === 2) {
    return 270 - Math.degrees(Math.atan2(opposite, adjacenten));
  }
  if (quadrant === 3) {
    return 270 + Math.degrees(Math.atan2(opposite, adjacenten));
  }
};
