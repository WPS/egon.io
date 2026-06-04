import { BusinessObject } from './businessObject';
import { Scope } from 'src/app/domain/entities/scope';

export interface DomainStory {
  businessObjects: BusinessObject[];
  description: string;
  version: string;
  title: string;
  scope?: Scope;
}
