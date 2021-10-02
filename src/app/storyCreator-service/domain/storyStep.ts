import { BusinessObject } from 'src/app/common/domain/businessObject';

export interface StoryStep {
  objects: BusinessObject[];
  highlightedObjects: string[];
}
