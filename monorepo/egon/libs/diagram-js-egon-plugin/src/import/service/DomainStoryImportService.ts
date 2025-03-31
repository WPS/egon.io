import { ImportRepairService } from "./ImportRepairService";
import { BusinessObject } from "../../domain/entities/businessObject";
import Canvas from "diagram-js/lib/core/Canvas";
import { assign, isArray } from "min-dash";
import { DomainStoryElementFactory } from "../../features/element-factory/DomainStoryElementFactory";
import { Connection, ElementLike, Shape } from "diagram-js/lib/model/Types";
import ElementRegistry from "diagram-js/lib/core/ElementRegistry";
import EventBus from "diagram-js/lib/core/EventBus";
import { ConfigAndDST } from "../../export/domain/configAndDst";
import { ElementTypes } from "../../domain/entities/elementTypes";

export class DomainStoryImportService {
    static $inject: string[] = [];

    private readonly elements: ElementLike[] = [];

    private readonly groupElements: ElementLike[] = [];

    private readonly importRepairService = new ImportRepairService();

    constructor(
        private readonly canvas: Canvas,
        private readonly elementFactory: DomainStoryElementFactory,
        private readonly elementRegistry: ElementRegistry,
        private readonly eventBus: EventBus,
    ) {}

    /**
     * @throws Error if import fails
     * @param story
     */
    import(story: string) {
        const configAndDST: ConfigAndDST = JSON.parse(story);

        const domainStoryElements = configAndDST.dst;

        this.importRepairService.removeWhitespacesFromIcons(domainStoryElements);
        this.importRepairService.removeUnnecessaryBpmnProperties(domainStoryElements);

        this.eventBus.fire("diagram.clear", {});

        if (!isArray(domainStoryElements)) {
            throw new Error("argument must be an array");
        }

        const connections: Connection[] = [],
            groups: Shape[] = [],
            otherElementTypes: ElementLike[] = [];

        domainStoryElements.forEach(function (bo) {
            if (isOfTypeConnection(bo)) {
                connections.push(bo as unknown as Connection);
            } else if (isOfTypeGroup(bo)) {
                groups.push(bo as unknown as Shape);
            } else {
                otherElementTypes.push(bo);
            }
        });

        // add groups before shapes and other element types before connections so that connections
        // can already rely on the shapes being part of the diagram
        groups.forEach(this.createElementFromBusinessObject, this);
        otherElementTypes.forEach(this.createElementFromBusinessObject, this);
        connections.forEach(this.addConnection, this);
    }

    private createElementFromBusinessObject(businessObject: any) {
        const parentId = businessObject.parent;
        delete businessObject.children;
        delete businessObject.parent;

        this.elements.push(businessObject);

        const attributes = assign({ businessObject }, businessObject);
        const shape = this.elementFactory.create("shape", attributes);

        if (isOfTypeGroup(businessObject)) {
            this.groupElements[businessObject.id] = shape;
        }

        if (parentId) {
            const parentShape = this.groupElements[parentId];

            if (isOfTypeGroup(parentShape)) {
                return this.canvas.addShape(shape, parentShape, Number(parentShape.id));
            }
        }
        return this.canvas.addShape(shape);
    }

    private addConnection(element: Connection) {
        this.elements.push(element);

        const attributes = assign({ businessObject: element }, element);

        const connection = this.elementFactory.create(
            "connection",
            assign(attributes, {
                source: this.elementRegistry.get(element.source!.id),
                target: this.elementRegistry.get(element.target!.id),
            }),
            // this.elementRegistry.get(element.source!.id).parent,
        );

        return this.canvas.addConnection(connection);
    }
}

function isOfTypeConnection(element: BusinessObject) {
    return (
        element.type === ElementTypes.ACTIVITY ||
        element.type === ElementTypes.CONNECTION
    );
}

function isOfTypeGroup(element: BusinessObject | ElementLike) {
    return element && element.type === ElementTypes.GROUP;
}

DomainStoryImportService.$inject = [
    "canvas",
    "elementFactory",
    "elementRegistry",
    "eventBus",
];
