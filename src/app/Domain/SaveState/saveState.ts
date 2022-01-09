import { BusinessObject } from '../Common/businessObject';

/**
 * A snapshot of the current state of the application. The purpose creating a save state is to prevent work from being
 * lost when the application is reloaded.
 */
export interface SaveState {
  title: string;
  description: string;
  domainStory: BusinessObject[];
}
