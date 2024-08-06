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

  // this check will give the wrong result for imported domain stories created with <= 1.3.x
  // because the "-custom" suffix for custom icons was introduced with a later version
  export function isCustomType(type: string): boolean {
    return type.endsWith(ElementTypes.CUSTOM);
  }

  // this check will give the wrong result for imported domain stories created with <= 1.3.x
  // because the "-custom" suffix for custom icons was introduced with a later version
  export function isCustomSvgType(type: string) {
    return type.endsWith('_svg' + ElementTypes.CUSTOM);
  }
}
