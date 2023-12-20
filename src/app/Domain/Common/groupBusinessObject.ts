import { BusinessObject, testBusinessObject } from './businessObject';

export interface GroupBusinessObject extends BusinessObject {
  children: string[];
}

export const testGroupBusinessObject: GroupBusinessObject = {
  ...testBusinessObject,

  children: [],
};
