import { INITIAL_DOMAIN_NAME } from './constants';
import { deepCopy } from '../../Utils/deepCopy';
import { testBusinessObject } from './businessObject';
import { elementTypes } from './elementTypes';
import { Dictionary } from './dictionary/dictionary';

export interface DomainConfiguration {
  name: string;
  actors: Dictionary;
  workObjects: Dictionary;
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
  actors: ['Person'],
  workObjects: ['Document'],
};

export function fromConfiguratioFromFile(configFromFile: {
  name: string;
  actors: { [p: string]: any };
  workObjects: { [p: string]: any };
}) {
  const actorsDict = new Dictionary();
  const workObjectsDict = new Dictionary();
  Object.keys(configFromFile.actors).forEach((key) => {
    actorsDict.add(configFromFile.actors[key], key);
  });
  Object.keys(configFromFile.workObjects).forEach((key) => {
    workObjectsDict.add(configFromFile.workObjects[key], key);
  });

  return {
    name: configFromFile.name,
    actors: actorsDict,
    workObjects: workObjectsDict,
  };
}
