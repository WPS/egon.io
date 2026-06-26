import {
  CanvasObject,
  testCanvasObject,
} from 'src/app/domain/entities/canvas-object';
import {
  GroupBusinessObject,
  testGroupBusinessObject,
} from 'src/app/domain/entities/group-business-object';
import { ElementTypes } from 'src/app/domain/entities/element-types';

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
