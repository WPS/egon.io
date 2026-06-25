import {
  BusinessObject,
  testBusinessObject,
} from 'src/app/domain/entities/business-object';

export interface GroupBusinessObject extends BusinessObject {
  children: string[];
}

export const testGroupBusinessObject: GroupBusinessObject = {
  ...testBusinessObject,

  children: [],
};
