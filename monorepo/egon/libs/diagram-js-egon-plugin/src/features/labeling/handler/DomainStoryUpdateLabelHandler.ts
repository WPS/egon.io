import { CommandContext } from "diagram-js/lib/command/CommandStack";
import CommandHandler from "diagram-js/lib/command/CommandHandler";
import { Element, ElementLike } from "diagram-js/lib/model/Types";
import { DomainStoryTextRenderer } from "../../text-renderer/DomainStoryTextRenderer";
import { DomainStoryModeling } from "../../modeling/DomainStoryModeling";
import { ElementTypes } from "../../../domain/entities/elementTypes";
import { getLabel, getNumber, setLabel, setNumber } from "../utils";
import { getBusinessObject, is } from "../../../utils/util";

const NULL_DIMENSIONS = {
    width: 0,
    height: 0,
};

export class DomainStoryUpdateLabelHandler implements CommandHandler {
    static $inject: string[] = [];

    constructor(
        private readonly modeling: DomainStoryModeling,
        private readonly domainStoryTextRenderer: DomainStoryTextRenderer,
    ) {}

    execute(context: CommandContext): ElementLike[] {
        context.oldLabel = getLabel(context.element);
        context.oldNumber = getNumber(context.element);
        return this.setText(context.element, context.newLabel, context.newNumber);
    }

    revert(context: CommandContext): ElementLike[] {
        return this.setText(context.element, context.oldLabel, context.oldNumber);
    }

    postExecute(context: CommandContext) {
        const element = context.element,
            label = element.label || element;

        let newBounds = context.newBounds;

        // resize text annotation to the amount of text that is entered
        if (is(element, ElementTypes.TEXTANNOTATION)) {
            const bo = getBusinessObject(label);

            const text = bo.name || bo.text;

            // don't resize without text
            if (!text) {
                return;
            }

            // resize an element based on labeled _or_ pre-defined bounds
            if (typeof newBounds === "undefined") {
                // newBounds = this.domainStoryTextRenderer.getLayoutedBounds(label, text);
                newBounds = this.domainStoryTextRenderer.getExternalLabelBounds(
                    label,
                    text,
                );
            }

            // setting newBounds to false or _null_ will
            // disable the postExecute resize operation
            if (newBounds) {
                this.modeling.resizeShape(label, newBounds, NULL_DIMENSIONS);
            }
        }
    }

    private setText(element: Element, text: string, textNumber: string) {
        const label = element.label || element;
        const number = element["number"] || element;
        const labelTarget = element["labelTarget"] || element;
        const numberTarget = element["numberTarget"] || element;

        setLabel(label, text);
        setNumber(number, textNumber);

        return [label, labelTarget, number, numberTarget];
    }
}

DomainStoryUpdateLabelHandler.$inject = ["modeling", "domainStoryTextRenderer"];
