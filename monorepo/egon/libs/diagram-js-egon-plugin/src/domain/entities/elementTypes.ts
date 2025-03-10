export enum ElementTypes {
    ACTIVITY = "domainStory:activity",
    CONNECTION = "domainStory:connection",
    ACTOR = "domainStory:actor",
    WORKOBJECT = "domainStory:workObject",
    GROUP = "domainStory:group",
    TEXTANNOTATION = "domainStory:textAnnotation",
}

export function getIconId(type: string): string {
    if (type.startsWith(ElementTypes.ACTOR)) {
        return type.replace(ElementTypes.ACTOR, "");
    } else if (type.startsWith(ElementTypes.WORKOBJECT)) {
        return type.replace(ElementTypes.WORKOBJECT, "");
    }
    return "";
}
