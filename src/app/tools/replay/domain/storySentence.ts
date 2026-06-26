import { BusinessObject } from 'src/app/domain/entities/business-object';

export interface StorySentence {
  objects: BusinessObject[];
  highlightedObjects: string[];
}
