import { BusinessObject } from 'src/app/_domain/entity/common/businessObject';

export interface StorySentence {
  objects: BusinessObject[];
  highlightedObjects: string[];
}
