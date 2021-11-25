import { BusinessObject, testBusinessObject } from './businessObject';
import { Waypoint } from './waypoint';
import { elementTypes } from './elementTypes';

export interface ActivityBusinessObject extends BusinessObject {
  number: number | undefined;

  waypoints: Waypoint[] | undefined;

  source: BusinessObject | undefined;
  target: BusinessObject | undefined;
}

export const testActivityBusinessobject: ActivityBusinessObject = {
  ...testBusinessObject,

  number: undefined,
  waypoints: undefined,

  type: elementTypes.ACTIVITY,

  source: undefined,
  target: undefined,
};
