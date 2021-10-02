import { elementTypes } from "src/app/common/domain/elementTypes";
import { getNameFromType } from "src/app/common/util/naming";

("use strict");

let iconDictionaryService;

export function initializeReplaceOptions(iconDictionary) {
  iconDictionaryService = iconDictionary;
}

export function actorReplaceOptions(name) {
  const actorTypes = iconDictionaryService.getTypeDictionary(
    elementTypes.ACTOR
  );

  let replaceOption = {};
  let i = 0;

  actorTypes.keysArray().forEach((actorType) => {
    if (!name.includes(actorType)) {
      const typeName = getNameFromType(actorType);
      replaceOption[i] = {
        label: "Change to " + typeName,
        actionName: "replace-with-actor-" + typeName.toLowerCase(),
        className: iconDictionaryService.getIconForType(actorType),
        target: {
          type: actorType,
        },
      };
      i++;
    }
  });
  return replaceOption;
}

export function workObjectReplaceOptions(name) {
  const workObjectTypes = iconDictionaryService.getTypeDictionary(
    elementTypes.WORKOBJECT
  );

  let replaceOption = {};
  let i = 0;

  workObjectTypes.keysArray().forEach((workObjectType) => {
    if (!name.includes(workObjectType)) {
      const typeName = getNameFromType(workObjectType);
      replaceOption[i] = {
        label: "Change to " + typeName,
        actionName: "replace-with-actor-" + typeName,
        className: iconDictionaryService.getIconForType(workObjectType),
        target: {
          type: workObjectType,
        },
      };
    }
    i++;
  });
  return replaceOption;
}
