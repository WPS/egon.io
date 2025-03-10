import Connect from "diagram-js/lib/features/connect/Connect";
import Create from "diagram-js/lib/features/create/Create";
import Canvas from "diagram-js/lib/core/Canvas";
import ContextPad, {
    ContextPadTarget,
} from "diagram-js/lib/features/context-pad/ContextPad";
import PopupMenu from "diagram-js/lib/features/popup-menu/PopupMenu";
import CommandStack from "diagram-js/lib/command/CommandStack";
import EventBus from "diagram-js/lib/core/EventBus";
import ContextPadProvider, {
    ContextPadEntries,
    ContextPadEntry,
} from "diagram-js/lib/features/context-pad/ContextPadProvider";
import { Connection, Element } from "diagram-js/lib/model/Types";
import { hasPrimaryModifier } from "diagram-js/lib/util/Mouse";
import { DomainStoryElementFactory } from "../element-factory/DomainStoryElementFactory";
import { DomainStoryModeling } from "../modeling/DomainStoryModeling";
import { DomainStoryReplaceMenuProvider } from "../replace/DomainStoryReplaceMenuProvider";
import { DirtyFlagService } from "../../domain/service/DirtyFlagService";
import { IconDictionaryService } from "../../icon-set-config/service/IconDictionaryService";
import { hexToRGBA, isHexWithAlpha, rgbaToHex } from "../../utils/colorConverter";
import { ElementTypes } from "../../domain/entities/elementTypes";
import Rules from "diagram-js/lib/features/rules/Rules";
import { assign, isArray } from "min-dash";
import { generateAutomaticNumber } from "../../utils/numbering";
import { ElementRegistryService } from "../../domain/service/ElementRegistryService";

export class DomainStoryContextPadProvider implements ContextPadProvider<Element> {
    static $inject: string[] = [];

    private selectedElement: Element | undefined;

    constructor(
        private readonly elementFactory: DomainStoryElementFactory,
        private readonly modeling: DomainStoryModeling,
        replaceMenuProvider: DomainStoryReplaceMenuProvider,
        private readonly dirtyFlagService: DirtyFlagService,
        private readonly iconDictionaryService: IconDictionaryService,
        private readonly elementRegistryService: ElementRegistryService,
        private readonly rules: Rules,
        private readonly connect: Connect,
        private readonly translate: any,
        private readonly create: Create,
        private readonly canvas: Canvas,
        private readonly contextPad: ContextPad,
        private readonly popupMenu: PopupMenu,
        private readonly commandStack: CommandStack,
        eventBus: EventBus,
    ) {
        contextPad.registerProvider(this);
        popupMenu.registerProvider("ds-replace", replaceMenuProvider);

        eventBus.on("create.end", (event: any) => {
            const context = event.context,
                shape = context.shape;

            if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
                return;
            }

            const entries = contextPad.getEntries(shape);

            if (entries["replace"]) {
                // @ts-expect-error Action has attribute "click"
                entries["replace"].action.click(event, shape);
            }
        });

        document.addEventListener("pickedColor", (event: any) => {
            if (this.selectedElement) {
                this.executeCommandStack(event);
            }
        });
    }

    getContextPadEntries(element: Element): ContextPadEntries {
        this.selectedElement = element;

        let pickedColor = this.selectedElement.businessObject.pickedColor;

        if (isHexWithAlpha(pickedColor)) {
            pickedColor = hexToRGBA(pickedColor);
        }
        document.dispatchEvent(
            new CustomEvent("defaultColor", {
                detail: {
                    color: pickedColor ?? "#000000",
                },
            }),
        );

        let entries: Map<string, ContextPadEntry> = new Map();

        if (element["type"].includes(ElementTypes.WORKOBJECT)) {
            entries.set(...this.addDelete([element]));
            entries.set(...this.addColorChange());
            entries.set(...this.addConnectWithActivity());
            entries.set(...this.addTextAnnotation());
            entries = new Map([...entries, ...this.addActors()]);
            entries = new Map([...entries, ...this.addWorkObjects()]);
            entries.set(...this.addChangeWorkObjectTypeMenu());
        } else if (element["type"].includes(ElementTypes.ACTOR)) {
            entries.set(...this.addDelete([element]));
            entries.set(...this.addColorChange());
            entries.set(...this.addConnectWithActivity());
            entries.set(...this.addTextAnnotation());
            entries = new Map([...entries, ...this.addWorkObjects()]);
            entries.set(...this.addChangeActorTypeMenu());
        } else if (element["type"].includes(ElementTypes.GROUP)) {
            entries.set(...this.addDeleteGroupWithoutChildren());
            entries.set(...this.addTextAnnotation());
            entries.set(...this.addColorChange());
        } else if (element["type"].includes(ElementTypes.ACTIVITY)) {
            entries.set(...this.addDelete([element]));
            entries.set(...this.addChangeDirection());
            entries.set(...this.addColorChange());
        } else if (element["type"].includes(ElementTypes.TEXTANNOTATION)) {
            entries.set(...this.addDelete([element]));
            entries.set(...this.addColorChange());
        } else if (element["type"].includes(ElementTypes.CONNECTION)) {
            entries.set(...this.addDelete([element]));
        }

        return Object.fromEntries(entries);
    }

    getMultiElementContextPadEntries(elements: Element[]): ContextPadEntries {
        const entries: Map<string, ContextPadEntry> = new Map();
        entries.set(...this.addDelete(elements));
        return Object.fromEntries(entries);
    }

    private executeCommandStack(event: any) {
        const selectedBusinessObject = this.getSelectedBusinessObject(event);

        this.commandStack.execute("element.colorChange", selectedBusinessObject);
        this.dirtyFlagService.makeDirty();
    }

    private getSelectedBusinessObject(event: any) {
        const oldColor = this.selectedElement?.businessObject.pickedColor;
        let newColor = event.detail.color;
        if (isHexWithAlpha(oldColor)) {
            newColor = rgbaToHex(newColor);
        }

        return {
            businessObject: this.selectedElement?.businessObject,
            newColor: newColor,
            element: this.selectedElement,
        };
    }

    private startConnect(): (
        event: any,
        element: Element,
        autoActivate: boolean,
    ) => void {
        return (event: any, element: Element, autoActivate: boolean) =>
            this.connect.start(event, element, undefined, autoActivate);
    }

    private addDelete(elements: Element[]): [string, ContextPadEntry<any>] {
        // delete element entry, only show if allowed by rules
        let deleteAllowed = this.rules.allowed("elements.delete", {
            elements: { element: elements },
        });

        if (isArray(deleteAllowed)) {
            // was the element returned as a deletion candidate?
            deleteAllowed = deleteAllowed[0] === elements;
        }

        if (deleteAllowed) {
            return [
                "delete",
                {
                    group: "edit",
                    className: "bpmn-icon-trash",
                    title: this.translate("Remove"),
                    action: {
                        click: (event: any, element: Element) => {
                            if (isArray(element)) {
                                const groups = element.filter((el) =>
                                    el.type.includes(ElementTypes.GROUP),
                                );
                                const otherElements = element.filter(
                                    (el) => !el.type.includes(ElementTypes.GROUP),
                                );
                                groups.forEach((group) =>
                                    this.modeling.removeGroup(group),
                                );
                                this.modeling.removeElements(otherElements.slice());
                            } else {
                                this.modeling.removeElements([element]);
                            }
                            this.dirtyFlagService.makeDirty();
                        },
                    },
                },
            ];
        }

        throw new Error("Delete not allowed");
    }

    private addDeleteGroupWithoutChildren(): [string, ContextPadEntry<any>] {
        return [
            "deleteGroup",
            {
                group: "edit",
                className: "bpmn-icon-trash",
                title: this.translate("Remove Group without Child-Elements"),
                action: {
                    click: (event, element: Element) => {
                        this.modeling.removeGroup(element);
                        this.dirtyFlagService.makeDirty();
                    },
                },
            },
        ];
    }

    private addChangeDirection(): [string, ContextPadEntry<any>] {
        return [
            "changeDirection",
            {
                group: "edit",
                className: "icon-domain-story-changeDirection",
                title: this.translate("Change direction"),
                action: {
                    // event needs to be addressed
                    click: (event: any, element: Connection) => {
                        this.changeDirection(element);
                        this.dirtyFlagService.makeDirty();
                    },
                },
            },
        ];
    }

    private addChangeActorTypeMenu(): [string, ContextPadEntry<any>] {
        return [
            "replace",
            {
                group: "edit",
                className: "bpmn-icon-screw-wrench",
                title: this.translate("Change type"),
                action: {
                    click: (event: any, element: ContextPadTarget) => {
                        const position = assign(this.getReplaceMenuPosition(element), {
                            cursor: { x: event.x, y: event.y },
                        });
                        this.popupMenu.open(element, "ds-replace", position);
                    },
                },
            },
        ];
    }

    private addColorChange(): [string, ContextPadEntry<any>] {
        return [
            "colorChange",
            {
                group: "edit",
                className: "icon-domain-story-color-picker",
                title: this.translate("Change color"),
                action: {
                    click: function (event, element) {
                        document.dispatchEvent(new CustomEvent("openColorPicker"));
                    },
                },
            },
        ];
    }

    private addTextAnnotation(): [string, ContextPadEntry<any>] {
        return [
            "append.text-annotation",
            this.appendAction(
                ElementTypes.TEXTANNOTATION,
                "bpmn-icon-text-annotation",
                "textannotation",
                "connect",
            ),
        ];
    }

    private addConnectWithActivity(): [string, ContextPadEntry<any>] {
        return [
            "connect",
            {
                group: "connect",
                className: "bpmn-icon-connection",
                title: this.translate("Connect with activity"),
                action: {
                    click: this.startConnect(),
                    dragstart: this.startConnect(),
                },
            },
        ];
    }

    private addWorkObjects(): Map<string, ContextPadEntry> {
        const workObjects = this.iconDictionaryService.getIconsAssignedAs(
            ElementTypes.WORKOBJECT,
        );
        const entries: Map<string, ContextPadEntry> = new Map();
        workObjects.keysArray().forEach((workObjectType) => {
            const name = workObjectType;
            const icon = this.iconDictionaryService.getCSSClassOfIcon(workObjectType);
            entries.set(
                "append.workObject" + name,
                this.appendAction(
                    `${ElementTypes.WORKOBJECT}${workObjectType}`,
                    icon,
                    name,
                    "workObjects",
                ),
            );
        });
        return entries;
    }

    private addActors(): Map<string, ContextPadEntry> {
        const actors = this.iconDictionaryService.getIconsAssignedAs(ElementTypes.ACTOR);
        const entries: Map<string, ContextPadEntry> = new Map();
        actors.keysArray().forEach((actorType) => {
            const name = actorType;
            const icon = this.iconDictionaryService.getCSSClassOfIcon(actorType);
            entries.set(
                "append.actor" + name,
                this.appendAction(
                    `${ElementTypes.ACTOR}${actorType}`,
                    icon,
                    name,
                    "actors",
                ),
            );
        });
        return entries;
    }

    private addChangeWorkObjectTypeMenu(): [string, ContextPadEntry<any>] {
        return [
            "replace",
            {
                group: "edit",
                className: "bpmn-icon-screw-wrench",
                title: this.translate("Change type"),
                action: {
                    click: (event: any, element: ContextPadTarget) => {
                        const position = assign(this.getReplaceMenuPosition(element), {
                            cursor: { x: event.x, y: event.y },
                        });
                        this.popupMenu.open(element, "ds-replace", position);
                    },
                },
            },
        ];
    }

    private changeDirection(element: Connection) {
        const businessObject = element.businessObject;
        const source = element.source;
        let newNumber;

        if (source && source["type"].includes(ElementTypes.ACTOR)) {
            newNumber = 0;
        } else {
            newNumber = generateAutomaticNumber(
                element,
                this.commandStack,
                this.elementRegistryService,
            );
        }
        const context = {
            businessObject: businessObject,
            newNumber: newNumber,
            element: element,
        };
        this.commandStack.execute("activity.directionChange", context);
    }

    private getReplaceMenuPosition(element: ContextPadTarget) {
        const Y_OFFSET = 5;

        const diagramContainer = this.canvas.getContainer(),
            pad = this.contextPad.getPad(element).html;

        const diagramRect = diagramContainer.getBoundingClientRect(),
            padRect = pad.getBoundingClientRect();

        const top = padRect.top - diagramRect.top;
        const left = padRect.left - diagramRect.left;

        return {
            x: left,
            y: top + padRect.height + Y_OFFSET,
        };
    }

    private appendAction(
        type: string,
        className: string,
        title: any,
        group: string,
        options?: any,
    ): ContextPadTarget<any> {
        if (typeof title !== "string") {
            options = title;
            title = this.translate("{type}", {
                type: type.replace(/^domainStory:/, ""),
            });
        }

        const appendStart = (event: any, element: any) => {
            const shape = this.elementFactory.createShape(
                assign({ type: type }, options),
            );
            const context = {
                elements: [shape],
                hints: {},
                source: element,
            };
            this.create.start(event, shape, context);
        };

        return {
            group: group,
            className: className,
            title: "Append " + title,
            action: {
                dragstart: this.startConnect(),
                click: appendStart,
            },
        };
    }
}

DomainStoryContextPadProvider.$inject = [
    "elementFactory",
    "modeling",
    "domainStoryReplaceMenuProvider",
    "domainStoryDirtyFlagService",
    "domainStoryIconDictionaryService",
    "domainStoryElementRegistryService",
    "rules",
    "connect",
    "translate",
    "create",
    "canvas",
    "contextPad",
    "popupMenu",
    "commandStack",
    "eventBus",
];
