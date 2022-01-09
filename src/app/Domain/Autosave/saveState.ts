import { BusinessObject } from '../Common/businessObject';

export interface SaveState {
  title: string;
  description: string;
  domainStory: BusinessObject[];
}
