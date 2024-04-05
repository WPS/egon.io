import { elementTypes } from "src/app/Domain/Common/elementTypes";

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
      const typeName = actorType;
      replaceOption[i] = {
        label: "Change to " + typeName,
        actionName: "replace-with-actor-" + typeName.toLowerCase(),
        className: iconDictionaryService.getIconForBPMN(
          elementTypes.ACTOR,
          actorType
        ),
        target: {
          type: `${elementTypes.ACTOR}${actorType}`,
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
      const typeName = workObjectType;
      replaceOption[i] = {
        label: "Change to " + typeName,
        actionName: "replace-with-actor-" + typeName,
        className: iconDictionaryService.getIconForBPMN(
          elementTypes.WORKOBJECT,
          workObjectType
        ),
        target: {
          type: `${elementTypes.WORKOBJECT}${workObjectType}`,
        },
      };
    }
    i++;
  });
  return replaceOption;
}
