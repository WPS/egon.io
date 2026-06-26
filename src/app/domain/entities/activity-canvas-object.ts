import {
  CanvasObject,
  testCanvasObject,
} from 'src/app/domain/entities/canvas-object';
import { Waypoint } from './waypoint';
import {
  ActivityBusinessObject,
  testActivityBusinessObject,
} from 'src/app/domain/entities/activity-business-object';
import { ElementTypes } from 'src/app/domain/entities/element-types';

export interface ActivityCanvasObject extends CanvasObject {
  source: CanvasObject;
  target: CanvasObject;

  waypoints: Waypoint[];
  businessObject: ActivityBusinessObject;
}

export const testActivityCanvasObject: ActivityCanvasObject = {
  ...testCanvasObject,

  source: testCanvasObject,
  target: testCanvasObject,

  type: ElementTypes.ACTIVITY,

  waypoints: [],

  businessObject: testActivityBusinessObject,
};
