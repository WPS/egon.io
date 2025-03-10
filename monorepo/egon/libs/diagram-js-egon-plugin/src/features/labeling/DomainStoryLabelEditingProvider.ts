import { Element, Shape } from "diagram-js/lib/model/Types";
import Canvas from "diagram-js/lib/core/Canvas";
import EventBus from "diagram-js/lib/core/EventBus";
import { DirectEditing } from "diagram-js-direct-editing/lib";
import ResizeHandles from "diagram-js/lib/features/resize/ResizeHandles";
import { Rect } from "diagram-js/lib/util/Types";
import { assign } from "min-dash";
import { DomainStoryModeling } from "../modeling/DomainStoryModeling";
import { DomainStoryTextRenderer } from "../text-renderer/DomainStoryTextRenderer";
import { LabelDictionaryService } from "../../label-dictionary/service/LabelDictionaryService";
import { ElementTypes } from "../../domain/entities/elementTypes";
import { isBackground } from "../rules/DomainStoryRules";
import { autocomplete, getLabel } from "./utils";
import { is } from "../../utils/util";
import { sanitizeTextForSVGExport } from "../../utils/sanitizer";
import CommandStack from "diagram-js/lib/command/CommandStack";
import { DomainStoryUpdateLabelHandler } from "./handler/DomainStoryUpdateLabelHandler";

let numberStash = 0;
let stashUse = false;

export function getNumberStash() {
    const number = { use: stashUse, number: numberStash };
    stashUse = false;
    return number;
}

export function toggleStashUse(use: boolean) {
    stashUse = use;
}

export function focusElement(element: HTMLDivElement) {
    // Opening an Angular Dialog seems to mess with the focus logic somehow.
    // My guess is that it makes the mousedown event passive, which prevents "preventDefault" from intercepting.
    // I am not sure how to fix it, but this seems to be a workaround.
    setTimeout(() => element.focus(), 0);
}

export class DomainStoryLabelEditingProvider {
    static $inject: string[] = [];

    constructor(
        private readonly modeling: DomainStoryModeling,
        private readonly domainStoryTextRenderer: DomainStoryTextRenderer,
        private readonly labelDictionaryService: LabelDictionaryService,
        private readonly eventBus: EventBus,
        private readonly canvas: Canvas,
        private readonly directEditing: DirectEditing,
        resizeHandles: ResizeHandles,
        commandStack: CommandStack,
    ) {
        commandStack.registerHandler(
            "element.updateLabel",
            DomainStoryUpdateLabelHandler,
        );

        this.directEditing.registerProvider(this);

        // listen to dblclick on non-root elements
        eventBus.on("element.dblclick", (event: any) => {
            this.activateDirectEdit(event.element);
            if (is(event.element, ElementTypes.ACTIVITY)) {
                // if we edit an activity, we do not want the standard editing box
                numberStash = event.element.businessObject.number;
                stashUse = true;
                this.directEditing.complete();
            }
        });

        // complete on followup canvas operation
        eventBus.on(
            [
                "element.mousedown",
                "drag.init",
                "canvas.viewbox.changing",
                "autoPlace",
                "popupMenu.open",
            ],
            () => {
                if (this.directEditing.isActive()) {
                    this.directEditing.complete();
                }
            },
        );

        // cancel on command stack changes
        eventBus.on(["commandStack.changed"], () => {
            if (this.directEditing.isActive()) {
                this.directEditing.cancel();
            }
        });

        eventBus.on("directEditing.activate", (event: any) => {
            resizeHandles.removeResizers();
            const element = event.active.element;
            this.createAutocomplete(element);
        });

        eventBus.on("create.end", 500, (event: any) => {
            const element = event.shape,
                canExecute = event.context.canExecute;

            if (!canExecute) {
                return;
            }
            if (!is(element, ElementTypes.ACTIVITY)) {
                this.activateDirectEdit(element);
            }
            const editingBox = document.getElementsByClassName(
                "djs-direct-editing-content",
            );
            focusElement(editingBox.item(0) as HTMLDivElement);
        });

        eventBus.on("autoPlace.end", 500, (event: any) => {
            this.activateDirectEdit(event.shape);
        });
    }

    /**
     * activate direct editing for activities and text annotations.
     * @return an object with properties bounds (position and size), text and options
     */
    activate(element: Shape): any {
        // text
        if (isBackground(element)) {
            return;
        }
        const text = getLabel(element);

        if (text === undefined) {
            return;
        }

        const context = {
            text: text,
        };

        // bounds
        const bounds = this.getEditingBBox(element);

        assign(context, bounds);

        const options = {};

        if (is(element, ElementTypes.TEXTANNOTATION)) {
            assign(options, {
                resizable: true,
                autoResize: true,
            });
        }

        assign(context, {
            options: options,
        });

        return context;
    }

    /**
     * get the editing bounding box based on the element's size and position
     * @return an object containing information about position
     *         and size (fixed or minimum and/or maximum)
     */
    getEditingBBox(element: Shape) {
        const target = element.label || element;

        const bbox = this.canvas.getAbsoluteBBox(target);

        // default position
        const bounds = { x: bbox.x, y: bbox.y };

        /** The canvas is an object from diagram-js. The IDE might say that zoom is deprecated,
         * because it thinks that canvas is the standard HTML element.**/
        const zoom = this.canvas.zoom();
        const defaultStyle = this.domainStoryTextRenderer.getDefaultStyle();

        // take zoom into account
        const defaultFontSize = (defaultStyle?.fontSize ?? 1) * zoom,
            defaultLineHeight = defaultStyle?.lineHeight;

        const style = {
            fontFamily: this.domainStoryTextRenderer.getDefaultStyle()?.fontFamily,
            fontWeight: this.domainStoryTextRenderer.getDefaultStyle()?.fontWeight,
        };

        // adjust for groups
        if (is(element, ElementTypes.GROUP)) {
            assign(bounds, {
                minWidth: bbox.width / 2.5 > 125 ? bbox.width / 2.5 : 125,
                maxWidth: bbox.width,
                minHeight: 30 * zoom,
                x: bbox.x,
                y: bbox.y,
            });

            assign(style, {
                fontSize: defaultFontSize + "px",
                lineHeight: defaultLineHeight,
                paddingTop: 7 * zoom + "px",
                paddingBottom: 7 * zoom + "px",
                paddingLeft: 5 * zoom + "px",
                paddingRight: 5 * zoom + "px",
                textAlign: "left",
            });
        }

        if (
            // we can't use util's is() function here because the type contains the name of the icon
            /^domainStory:actor\w*/.test(element["type"]) ||
            /^domainStory:workObject\w*/.test(element["type"])
        ) {
            assign(bounds, {
                width: bbox.width,
                minHeight: 30,
                y: bbox.y + bbox.height - 20,
                x: bbox.x,
            });

            assign(style, {
                fontSize: defaultFontSize + "px",
                lineHeight: defaultLineHeight,
                paddingTop: 7 * zoom + "px",
                paddingBottom: 7 * zoom + "px",
                paddingLeft: 5 * zoom + "px",
                paddingRight: 5 * zoom + "px",
            });
        }

        // text annotations
        if (is(element, ElementTypes.TEXTANNOTATION)) {
            assign(bounds, {
                width: bbox.width,
                height: bbox.height,
                minWidth: 30 * zoom,
                minHeight: 10 * zoom,
            });

            assign(style, {
                textAlign: "left",
                paddingTop: 7 * zoom + "px",
                paddingBottom: 7 * zoom + "px",
                paddingLeft: 5 * zoom + "px",
                paddingRight: 5 * zoom + "px",
                fontSize: defaultFontSize + "px",
                lineHeight: defaultLineHeight,
            });
        }

        return { bounds: bounds, style: style };
    }

    update(element: Shape, newLabel: string, activeContextText: string, bounds: Rect) {
        const bbox = this.canvas.getAbsoluteBBox(element);

        let newBounds: Rect | undefined;
        if (!is(element, ElementTypes.TEXTANNOTATION)) {
            newBounds = {
                x: element.x,
                y: element.y,
                width: (element.width / bbox.width) * bounds.width,
                height: (element.height / bbox.height) * bounds.height,
            };
        }

        this.modeling.updateLabel(
            element,
            sanitizeTextForSVGExport(newLabel),
            newBounds,
        );
    }

    private activateDirectEdit(element: Element) {
        this.directEditing.activate(element);
    }

    private createAutocomplete(element: Element) {
        const editingBox = document.getElementsByClassName("djs-direct-editing-content");
        focusElement(editingBox.item(0) as HTMLDivElement);
        autocomplete(
            editingBox[0] as HTMLInputElement,
            this.labelDictionaryService.getUniqueWorkObjectNames(),
            element,
            this.eventBus,
        );
    }
}

DomainStoryLabelEditingProvider.$inject = [
    "modeling",
    "domainStoryTextRenderer",
    "domainStoryLabelDictionaryService",
    "eventBus",
    "canvas",
    "directEditing",
    "resizeHandles",
    "commandStack",
];
