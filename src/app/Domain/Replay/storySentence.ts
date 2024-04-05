import { BusinessObject } from 'src/app/Domain/Common/businessObject';

export interface StorySentence {
  objects: BusinessObject[];
  highlightedObjects: string[];
}
