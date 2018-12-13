import { getNameFromType } from '../../language/naming';
<<<<<<< HEAD
import { getActorRegistry } from '../../language/ActorRegistry';
import { getWorkObjectRegistry } from '../../language/WorkObjectRegistry';
import { getIconForType } from '../../language/iconRegistry';
=======
import { getIconForType } from '../../language/icons';
import { getActorRegistry } from '../../language/ActorRegistry';
import { getWorkObjectRegistry } from '../../language/WorkObjectRegistry';
>>>>>>> a472f8941459aabc528bd832548643e91d33faa5

'use strict';

export function actorReplaceOptions(name) {
  var actorTypes = getActorRegistry();

  var replaceOption = {};
  var i=0;

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
  var workObjectTypes = getWorkObjectRegistry();

  var replaceOption = {};
  var i=0;

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
