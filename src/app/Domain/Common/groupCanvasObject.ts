import { CanvasObject, testCanvasObject } from './canvasObject';
import {
  GroupBusinessObject,
  testGroupBusinessObject,
} from './groupBusinessObject';
import { elementTypes } from './elementTypes';

export interface GroupCanvasObject extends CanvasObject {
  businessObject: GroupBusinessObject;
  children: CanvasObject[] | undefined;
}

export const testGroupCanvasObject: GroupCanvasObject = {
  ...testCanvasObject,
  type: elementTypes.GROUP,

  businessObject: testGroupBusinessObject,
  children: [],
};
