import {
  BusinessObject,
  testBusinessObject,
} from 'src/app/domain/entities/business-object';
import { Waypoint } from './waypoint';
import { ElementTypes } from 'src/app/domain/entities/element-types';

export interface ActivityBusinessObject extends BusinessObject {
  number: number | undefined;

  waypoints: Waypoint[];

  source: string;
  target: string;
  multipleNumberAllowed?: boolean;
}

export const testActivityBusinessObject: ActivityBusinessObject = {
  ...testBusinessObject,

  number: undefined,
  waypoints: [],

  type: ElementTypes.ACTIVITY,

  source: '1',
  target: '2',
};
