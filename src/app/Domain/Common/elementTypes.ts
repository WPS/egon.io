export enum ElementTypes {
  ACTIVITY = 'domainStory:activity',
  CONNECTION = 'domainStory:connection',
  ACTOR = 'domainStory:actor',
  WORKOBJECT = 'domainStory:workObject',
  GROUP = 'domainStory:group',
  TEXTANNOTATION = 'domainStory:textAnnotation',
  DOMAINSTORY = 'domainStory:',
}

export namespace ElementTypes {
  export function getNameFromType(type: string): string {
    if (type.includes(ElementTypes.ACTOR)) {
      return type.replace(ElementTypes.ACTOR, '');
    } else if (type.includes(ElementTypes.WORKOBJECT)) {
      return type.replace(ElementTypes.WORKOBJECT, '');
    }
    return '';
  }
}
