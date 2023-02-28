import { BusinessObject, testBusinessObject } from './businessObject';
import { Waypoint } from './waypoint';
import { elementTypes } from './elementTypes';

export interface ActivityBusinessObject extends BusinessObject {
  number: number | undefined;

  waypoints: Waypoint[];

  source: string;
  target: string;
}

export const testActivityBusinessObject: ActivityBusinessObject = {
  ...testBusinessObject,

  number: undefined,
  waypoints: [],

  type: elementTypes.ACTIVITY,

  source: '1',
  target: '2',
};
