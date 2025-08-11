import { BusinessObject } from 'src/app/domain/entities/businessObject';

export interface StorySentence {
  objects: BusinessObject[];
  highlightedObjects: string[];
}
