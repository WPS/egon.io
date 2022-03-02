import { elementTypes } from 'src/app/Domain/Common/elementTypes';

export function getNameFromType(type: string): string {
  if (type.includes(elementTypes.ACTOR)) {
    return type.replace(elementTypes.ACTOR, '');
  } else if (type.includes(elementTypes.WORKOBJECT)) {
    return type.replace(elementTypes.WORKOBJECT, '');
  }

  return '';
  // error Handling    else throw new InvalidTypeError(type);
}
