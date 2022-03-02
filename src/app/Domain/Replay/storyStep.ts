import { BusinessObject } from 'src/app/Domain/Common/businessObject';

export interface StoryStep {
  objects: BusinessObject[];
  highlightedObjects: string[];
}
