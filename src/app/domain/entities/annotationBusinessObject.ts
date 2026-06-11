import { BusinessObject, testBusinessObject } from './businessObject';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';

export interface AnnotationBusinessObject extends BusinessObject {
  text: string;
}

export const testAnnotationBusinessObject: AnnotationBusinessObject = {
  ...testBusinessObject,
  text: 'test',

  type: ElementTypes.TEXTANNOTATION,
};
