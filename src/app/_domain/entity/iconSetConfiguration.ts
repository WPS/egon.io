import { INITIAL_ICON_SET_NAME } from './common/constants';
import { testBusinessObject } from './common/businessObject';
import { ElementTypes } from './common/elementTypes';
import { Dictionary } from './common/dictionary';

export interface IconSetConfiguration {
  name: string;
  actors: Dictionary;
  workObjects: Dictionary;
}

export interface IconSetConfigurationForExport {
  name: string;
  actors: any;
  workObjects: any;
}

export interface CustomIconSetConfiguration {
  name: string;
  actors: string[];
  workObjects: string[];
}
const actor = structuredClone(testBusinessObject);
actor.type = ElementTypes.ACTOR;

export const testCustomIconSetConfiguration: CustomIconSetConfiguration = {
  name: INITIAL_ICON_SET_NAME,
  actors: ['Person'],
  workObjects: ['Document'],
};

export function fromConfigurationFromFile(configFromFile: {
  name: string;
  actors: { [p: string]: any };
  workObjects: { [p: string]: any };
}) {
  const actorsDict = new Dictionary();
  const workObjectsDict = new Dictionary();
  Object.keys(configFromFile.actors).forEach((key) => {
    let icon = configFromFile.actors[key];
    if (icon) {
      // make sure the actor has an icon
      actorsDict.add(icon, key);
    }
  });
  Object.keys(configFromFile.workObjects).forEach((key) => {
    let icon = configFromFile.workObjects[key];
    if (icon) {
      // make sure the work object has an icon
      workObjectsDict.add(icon, key);
    }
  });

  return {
    name: configFromFile.name,
    actors: actorsDict,
    workObjects: workObjectsDict,
  };
}
