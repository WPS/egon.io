import Modeling, { ModelingHints } from "diagram-js/lib/features/modeling/Modeling";

import EventBus from "diagram-js/lib/core/EventBus";
import ElementFactory from "diagram-js/lib/core/ElementFactory";
import CommandStack from "diagram-js/lib/command/CommandStack";
import { Element, Shape } from "diagram-js/lib/model/Types";
import { Rect } from "diagram-js/lib/util/Types";

export class DomainStoryModeling extends Modeling {
    constructor(
        eventBus: EventBus,
        elementFactory: ElementFactory,
        private readonly commandStack: CommandStack,
    ) {
        super(eventBus, elementFactory, commandStack);
    }

    override replaceShape(
        oldShape: Shape,
        newData: Partial<Shape>,
        hints: ModelingHints,
    ): Shape {
        const context = {
            oldShape,
            newData,
            hints: hints || {},
        };

        this.commandStack.execute("shape.replace", context);

        // @ts-expect-error context will be altered
        return context.newShape;
    }

    updateLabel(element: Element, newLabel: string, newBounds?: Rect) {
        // if (
        //     element.businessObject
        //         ? newLabel !== element.businessObject.name
        //         : newLabel !== element.name
        // ) {
        this.commandStack.execute("element.updateLabel", {
            element: element,
            newLabel: newLabel,
            newBounds: newBounds,
        });
        // }
    }

    updateNumber(element: Element, newNumber: number, newBounds?: Rect) {
        // if (
        //     element.businessObject
        //         ? newNumber !== element.businessObject.number
        //         : newNumber !== element.number
        // ) {
        this.commandStack.execute("element.updateLabel", {
            element: element,
            newNumber: newNumber,
            newBounds: newBounds,
        });
        // }
    }

    removeGroup(element: Element) {
        this.commandStack.execute("shape.removeGroupWithoutChildren", {
            element: element,
        });

        this.removeElements([element]);
    }
}

DomainStoryModeling.$inject = [
    "eventBus",
    "elementFactory",
    "commandStack",
    "domainStoryRules",
];
