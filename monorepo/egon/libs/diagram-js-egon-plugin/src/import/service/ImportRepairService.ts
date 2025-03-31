import { BusinessObject } from "../../domain/entities/businessObject";
import { ActivityBusinessObject } from "../../domain/entities/activityBusinessObject";
import { ElementTypes } from "../../domain/entities/elementTypes";

export class ImportRepairService {
    checkForUnreferencedElementsInActivitiesAndRepair(
        elements: BusinessObject[],
    ): boolean {
        const activities: ActivityBusinessObject[] = [];
        const objectIDs: string[] = [];

        let complete = true;

        elements.forEach((element) => {
            const type = element.type;
            if (type === ElementTypes.ACTIVITY || type === ElementTypes.CONNECTION) {
                activities.push(element as ActivityBusinessObject);
            } else {
                objectIDs.push(element.id);
            }
        });

        activities.forEach((activity) => {
            const source = activity.source;
            const target = activity.target;
            if (!objectIDs.includes(source) || !objectIDs.includes(target)) {
                complete = false;
                const activityIndex = elements.indexOf(activity);
                elements = elements.splice(activityIndex, 1);
            }
        });
        return complete;
    }

    /**
     * Ensure backwards compatibility.
     * Previously Document had no special name and was just addressed as workObject
     * Bubble was renamed to Conversation
     */
    updateCustomElementsPreviousV050(elements: BusinessObject[]): BusinessObject[] {
        for (const element of elements) {
            if (element.type === ElementTypes.WORKOBJECT) {
                element.type = ElementTypes.WORKOBJECT + "Document";
            } else if (element.type === ElementTypes.WORKOBJECT + "Bubble") {
                element.type = ElementTypes.WORKOBJECT + "Conversation";
            }
        }
        return elements;
    }

    // Early versions of Egon allowed Whitespaces in Icon names which are now not supported anymore.
    // To find the right icon in the dictionary, they need to be replaced.
    removeWhitespacesFromIcons(elements: BusinessObject[]) {
        elements.forEach((bo) => {
            if (bo.type) {
                bo.type = bo.type.replace(/ /g, "-");
            }
        });
    }

    removeUnnecessaryBpmnProperties(elements: BusinessObject[]) {
        elements.forEach((bo) => {
            // @ts-expect-error Property $type does exist
            if (bo.$type) {
                // @ts-expect-error Property $type does exist
                bo.$type = undefined;
            }
            // @ts-expect-error Property $type does exist
            if (bo.$descriptor) {
                // @ts-expect-error Property $type does exist
                bo.$descriptor = undefined;
            }
            // @ts-expect-error Property $type does exist
            if (bo.di) {
                // @ts-expect-error Property $type does exist
                bo.di = undefined;
            }
        });
    }
}
