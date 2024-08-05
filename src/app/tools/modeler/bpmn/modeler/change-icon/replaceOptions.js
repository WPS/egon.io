import { ElementTypes } from "src/app/domain/entities/elementTypes";

let iconDictionaryService;

export function initializeReplaceOptions(iconDictionary) {
  iconDictionaryService = iconDictionary;
}

export function actorReplaceOptions(name) {
  const actorTypes = iconDictionaryService.getTypeDictionary(
    ElementTypes.ACTOR,
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
          ElementTypes.ACTOR,
          actorType,
        ),
        target: {
          type: `${ElementTypes.ACTOR}${actorType}`,
        },
      };
      i++;
    }
  });
  return replaceOption;
}

export function workObjectReplaceOptions(name) {
  const workObjectTypes = iconDictionaryService.getTypeDictionary(
    ElementTypes.WORKOBJECT,
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
          ElementTypes.WORKOBJECT,
          workObjectType,
        ),
        target: {
          type: `${ElementTypes.WORKOBJECT}${workObjectType}`,
        },
      };
    }
    i++;
  });
  return replaceOption;
}
