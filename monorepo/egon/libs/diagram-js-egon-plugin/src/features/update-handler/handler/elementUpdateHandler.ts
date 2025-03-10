import EventBus from "diagram-js/lib/core/EventBus";
import CommandHandler from "diagram-js/lib/command/CommandHandler";
import { CommandContext } from "diagram-js/lib/command/CommandStack";
import { Element, ElementLike, Shape } from "diagram-js/lib/model/Types";
import { ElementTypes } from "../../../domain/entities/elementTypes";
import { reworkGroupElements, undoGroupRework } from "../../../utils/util";

export class ElementColorChangeHandler implements CommandHandler {
    static $inject: string[] = [];

    constructor(private readonly eventBus: EventBus) {}

    preExecute(context: CommandContext) {
        context.oldColor = context.businessObject.pickedColor;
    }

    execute(context: CommandContext): ElementLike[] {
        const semantic = context.businessObject;
        const element: Element = context.element;

        if (semantic.type.includes(ElementTypes.TEXTANNOTATION) && element.incoming[0]) {
            element.incoming[0].businessObject.pickedColor = context.newColor;
            this.eventBus.fire("element.changed", { element: element.incoming[0] });
        }

        semantic.pickedColor = context.newColor;

        this.eventBus.fire("element.changed", { element });

        return [
            {
                id: element.id,
                businessObject: semantic,
            },
        ];
    }

    revert(context: CommandContext): ElementLike[] {
        const semantic = context.businessObject;
        const element: Element = context.element;

        if (semantic.type.includes(ElementTypes.TEXTANNOTATION) && element.incoming[0]) {
            element.incoming[0].businessObject.pickedColor = context.oldColor;
            this.eventBus.fire("element.changed", { element: element.incoming[0] });
        }

        semantic.pickedColor = context.oldColor;

        this.eventBus.fire("element.changed", { element });

        return [
            {
                id: element.id,
                businessObject: semantic,
            },
        ];
    }
}

export class RemoveGroupWithoutChildrenHandler implements CommandHandler {
    static $inject: string[] = [];

    constructor(private readonly eventBus: EventBus) {}

    preExecute(context: CommandContext) {
        context.parent = context.element.parent;
        context.children = context.element.children.slice();
    }

    execute(context: CommandContext): ElementLike[] {
        const element: Element = context.element;
        context.children.forEach((child: Shape) => {
            undoGroupRework(element, child);
            this.eventBus.fire("element.changed", { element: child });
        });
        this.eventBus.fire("shape.remove", { element });

        return [
            {
                id: element.id,
                businessObject: element.businessObject,
            },
        ];
    }

    revert(context: CommandContext): ElementLike[] {
        const element: Element = context.element;
        this.eventBus.fire("shape.added", { element });

        context.element.children.forEach((child: Shape) => {
            reworkGroupElements(element, child);
        });

        return [
            {
                id: element.id,
                businessObject: element.businessObject,
            },
        ];
    }
}

ElementColorChangeHandler.$inject = ["eventBus"];

RemoveGroupWithoutChildrenHandler.$inject = ["eventBus"];
