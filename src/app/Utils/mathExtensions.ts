'use strict';

// convert rad to deg
export function degrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

// calculate the angle between two points in 2D
export function angleBetween(
  startPoint: Point,
  endPoint: Point
): number | undefined {
  let quadrant;

  // determine in which quadrant we are
  if (startPoint.x <= endPoint.x) {
    if (startPoint.y >= endPoint.y) {
      quadrant = 0;
    } // upper right quadrant
    else {
      quadrant = 3;
    } // lower right quadrant
  } else {
    if (startPoint.y >= endPoint.y) {
      quadrant = 1;
    } // upper left Quadrant
    else {
      quadrant = 2;
    } // lower left quadrant
  }

  const adjacent = Math.abs(startPoint.y - endPoint.y);
  const opposite = Math.abs(startPoint.x - endPoint.x);

  // since the arcus-tangens only gives values between 0 and 90, we have to adjust for the quadrant we are in

  if (quadrant === 0) {
    return 90 - degrees(Math.atan2(opposite, adjacent));
  }
  if (quadrant === 1) {
    return 90 + degrees(Math.atan2(opposite, adjacent));
  }
  if (quadrant === 2) {
    return 270 - degrees(Math.atan2(opposite, adjacent));
  }
  if (quadrant === 3) {
    return 270 + degrees(Math.atan2(opposite, adjacent));
  }
  return undefined;
}

export function positionsMatch(
  width: number,
  height: number,
  elementX: number,
  elementY: number,
  clickX: number,
  clickY: number
): boolean {
  if (clickX > elementX && clickX < elementX + width) {
    if (clickY > elementY && clickY < elementY + height) {
      return true;
    }
  }
  return false;
}

export class Point {
  public y = 0;
  public x = 0;
}
