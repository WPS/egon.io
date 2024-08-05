import { BusinessObject } from 'src/app/domain/entities/common/businessObject';

export interface StorySentence {
  objects: BusinessObject[];
  highlightedObjects: string[];
}
