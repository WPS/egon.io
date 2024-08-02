import { BusinessObject } from 'src/app/domain/entity/common/businessObject';

export interface StorySentence {
  objects: BusinessObject[];
  highlightedObjects: string[];
}
