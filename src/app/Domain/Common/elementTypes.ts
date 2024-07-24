export enum ElementTypes {
  ACTIVITY = 'domainStory:activity',
  CONNECTION = 'domainStory:connection',
  ACTOR = 'domainStory:actor',
  WORKOBJECT = 'domainStory:workObject',
  GROUP = 'domainStory:group',
  TEXTANNOTATION = 'domainStory:textAnnotation',
  DOMAINSTORY = 'domainStory:',
  CUSTOM = '-custom',
}

export namespace ElementTypes {
  export function getIconId(type: string): string {
    if (type.startsWith(ElementTypes.ACTOR)) {
      return type.replace(ElementTypes.ACTOR, '');
    } else if (type.startsWith(ElementTypes.WORKOBJECT)) {
      return type.replace(ElementTypes.WORKOBJECT, '');
    }
    return '';
  }

  export function isCustomType(type: string): boolean {
    return type.endsWith(ElementTypes.CUSTOM);
  }
}
