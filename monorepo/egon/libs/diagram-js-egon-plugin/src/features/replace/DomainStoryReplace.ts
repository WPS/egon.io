import { assign } from "min-dash";
import { DomainStoryModeling } from "../modeling/DomainStoryModeling";
import { Shape } from "diagram-js/lib/model/Types";

/**
 * service that allow replacing of elements.
 */
export class DomainStoryReplace {
    static $inject: string[] = [];

    constructor(private readonly modeling: DomainStoryModeling) {}

    /**
     * @param oldShape - element to be replaced
     * @param newShapeData - containing information about the new Element, for example height, width, type.
     */
    replaceElement(oldShape: Shape, newShapeData: Partial<Shape>) {
        const newElement = this.setCenterOfElement(newShapeData, oldShape);
        const outgoingActivities = newElement.outgoing;
        const incomingActivities = newElement.incoming;

        outgoingActivities.forEach((element) => {
            element.businessObject.source = newElement.id;
        });

        incomingActivities.forEach((element) => {
            element.businessObject.target = newElement.id;
        });

        return newElement;
    }

    private setCenterOfElement(newShapeData: Partial<Shape>, oldShape: Shape) {
        newShapeData.x = Math.ceil(
            oldShape.x + (newShapeData.width || oldShape.width) / 2,
        );
        newShapeData.y = Math.ceil(
            oldShape.y + (newShapeData.height || oldShape.height) / 2,
        );

        assign(newShapeData, { name: oldShape.businessObject.name });

        return this.modeling.replaceShape(oldShape, newShapeData, {});
    }
}

DomainStoryReplace.$inject = ["modeling"];
