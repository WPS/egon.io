import { INITIAL_DOMAIN_NAME } from './constants';
import { deepCopy } from '../../Utils/deepCopy';
import { testBusinessObject } from './businessObject';
import { elementTypes } from './elementTypes';

export interface DomainConfiguration {
  name: string;
  actors: { [key: string]: any };
  workObjects: { [key: string]: any };
}

export interface CustomDomainCofiguration {
  name: string;
  actors: string[];
  workObjects: string[];
}
const actor = deepCopy(testBusinessObject);
actor.type = elementTypes.ACTOR;

export const testCustomDomainConfiguration: CustomDomainCofiguration = {
  name: INITIAL_DOMAIN_NAME,
  actors: [actor],
  workObjects: [deepCopy(testBusinessObject)],
};
