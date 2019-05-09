import { getNameFromType } from '../../language/naming';
import { getIconForType } from '../../language/icon/iconDictionary';
import { getTypeDictionary } from '../../language/icon/dictionaries';
import { ACTOR, WORKOBJECT } from '../../language/elementTypes';

'use strict';

export function actorReplaceOptions(name) {
  const actorTypes = getTypeDictionary(ACTOR);

  let replaceOption = {};
  let i=0;

  actorTypes.keysArray().forEach(actorType => {
    if (!name.includes(actorType)) {
      const typeName = getNameFromType(actorType);
      replaceOption[i] ={
        label: 'Change to ' + typeName,
        actionName: 'replace-with-actor-' + typeName.toLowerCase(),
        className: getIconForType(actorType),
        target: {
          type: actorType
        }
      };
      i++;
    }
  });
  return replaceOption;
}

export function workObjectReplaceOptions(name) {
  const workObjectTypes = getTypeDictionary(WORKOBJECT);

  let replaceOption = {};
  let i=0;

  workObjectTypes.keysArray().forEach(workObjectType => {
    if (!name.includes(workObjectType)) {
      const typeName = getNameFromType(workObjectType);
      replaceOption[i] = {
        label: 'Change to ' + typeName,
        actionName: 'replace-with-actor-' + typeName,
        className: getIconForType(workObjectType),
        target: {
          type: workObjectType
        }
      };
    }
    i++;
  });
  return replaceOption;
}
