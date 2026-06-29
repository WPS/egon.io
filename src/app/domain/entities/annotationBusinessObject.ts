import {
  BusinessObject,
  testBusinessObject,
} from 'src/app/domain/entities/business-object';
import { ElementTypes } from 'src/app/domain/entities/element-types';

export interface AnnotationBusinessObject extends BusinessObject {
  text: string;
}

export const testAnnotationBusinessObject: AnnotationBusinessObject = {
  ...testBusinessObject,
  text: 'test',

  type: ElementTypes.TEXTANNOTATION,
};
