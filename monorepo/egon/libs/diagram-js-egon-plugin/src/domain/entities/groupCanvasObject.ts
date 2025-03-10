import { CanvasObject, testCanvasObject } from './canvasObject';
import {
  GroupBusinessObject,
  testGroupBusinessObject,
} from './groupBusinessObject';
import { ElementTypes } from './elementTypes';

export interface GroupCanvasObject extends CanvasObject {
  businessObject: GroupBusinessObject;
  children: CanvasObject[] | undefined;
}

export const testGroupCanvasObject: GroupCanvasObject = {
  ...testCanvasObject,
  type: ElementTypes.GROUP,

  businessObject: testGroupBusinessObject,
  children: [],
};
