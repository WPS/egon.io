import { BusinessObject } from './businessObject';

export interface DomainStory {
  businessObjects: BusinessObject[];
  description: string;
  version: string;
}
