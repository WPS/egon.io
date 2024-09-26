import { BusinessObject } from './businessObject';

export interface DomainStory {
  businessObjects: BusinessObject[];
  info: string;
  version: string;
}
