'use strict';

// convert rad to deg
export function degrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

enum Quadrant {
  upperRight,
  upperLeft,
  lowerLeft,
  lowerRight,
}

function determineQuadrant(startPoint: Point, endPoint: Point) {
  if (startPoint.x <= endPoint.x) {
    if (startPoint.y >= endPoint.y) {
      return Quadrant.upperRight;
    } else {
      return Quadrant.lowerRight;
    }
  } else {
    if (startPoint.y >= endPoint.y) {
      return Quadrant.upperLeft;
    } else {
      return Quadrant.lowerLeft;
    }
  }
}

// calculate the angle between two points in 2D
export function angleBetween(startPoint: Point, endPoint: Point): number {
  const adjacent = Math.abs(startPoint.y - endPoint.y);
  const opposite = Math.abs(startPoint.x - endPoint.x);
  const angle = degrees(Math.atan2(opposite, adjacent));

  // since the arcus-tangens only gives values between 0 and 90, we have to adjust for the quadrant we are in
  const quadrant = determineQuadrant(startPoint, endPoint);
  switch (quadrant) {
    case Quadrant.upperRight:
      return 90 - angle;
    case Quadrant.upperLeft:
      return 90 + angle;
    case Quadrant.lowerLeft:
      return 270 - angle;
    case Quadrant.lowerRight:
      return 270 + angle;
  }
}

export function positionsMatch(
  width: number,
  height: number,
  elementX: number,
  elementY: number,
  clickX: number,
  clickY: number,
): boolean {
  if (clickX > elementX && clickX < elementX + width) {
    if (clickY > elementY && clickY < elementY + height) {
      return true;
    }
  }
  return false;
}

export class Point {
  y = 0;
  x = 0;
}
