import { elementTypes } from 'src/app/Domain/Common/elementTypes';

// TODO: td: This can cause a lot of errors
export function getNameFromType(type: string): string {
  if (type.includes(elementTypes.ACTOR)) {
    return type.replace(elementTypes.ACTOR, '');
  } else if (type.includes(elementTypes.WORKOBJECT)) {
    return type.replace(elementTypes.WORKOBJECT, '');
  }
  return '';
}
