import { CanvasObject, testCanvasObject } from './canvasObject';
import { Waypoint } from './waypoint';
import {
  ActivityBusinessObject,
  testActivityBusinessObject,
} from './activityBusinessObject';
import { elementTypes } from './elementTypes';

export interface ActivityCanvasObject extends CanvasObject {
  source: CanvasObject | undefined;
  target: CanvasObject | undefined;

  waypoints: Waypoint[] | undefined;
  businessObject: ActivityBusinessObject;
}

export const testActivityCanvasObject: ActivityCanvasObject = {
  ...testCanvasObject,

  source: undefined,
  target: undefined,

  type: elementTypes.ACTIVITY,

  waypoints: undefined,

  businessObject: testActivityBusinessObject,
};
