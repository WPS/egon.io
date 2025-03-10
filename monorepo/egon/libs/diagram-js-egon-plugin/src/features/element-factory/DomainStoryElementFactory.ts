import ElementFactory from "diagram-js/lib/core/ElementFactory";
import { DomainStoryIdFactory } from "../id-factory/DomainStoryIdFactory";
import { Connection, Label, Root, Shape } from "diagram-js/lib/model/Types";
import { ElementTypes } from "../../domain/entities/elementTypes";
import { assign } from "min-dash";

type ElementFactoryType = "shape" | "label" | "connection" | "root";

type ElementFactoryAttribute = Shape | Label | Connection | Root;

export class DomainStoryElementFactory extends ElementFactory<
    Connection,
    Label,
    Root,
    Shape
> {
    static $inject: string[] = [];

    constructor(private readonly domainStoryIdFactory: DomainStoryIdFactory) {
        super();
    }

    override create(type: "label", attrs?: Partial<Label>): Label;
    override create(type: "connection", attrs?: Partial<Connection>): Connection;
    override create(type: "shape", attrs?: Partial<Shape>): Shape;
    override create(type: "root", attrs?: Partial<Root>): Root;
    override create(
        type: ElementFactoryType,
        attrs: Partial<ElementFactoryAttribute>,
    ): ElementFactoryAttribute {
        if (!attrs) {
            // @ts-expect-error TypeScript does not understand that all four types are possible
            return super.create(type, attrs);
        }

        if (!attrs?.businessObject) {
            attrs.businessObject = {
                type: attrs["type"],
                name: attrs["name"] ? attrs["name"] : "",
            };
        }

        if (attrs.id) {
            this.domainStoryIdFactory.registerId(attrs.id);
        } else {
            attrs.id = this.domainStoryIdFactory.getId(type);
        }
        assign(attrs.businessObject, {
            id: attrs.id,
        });

        const id = attrs.id;
        attrs.businessObject.get = function (key: string) {
            if (key === "id") {
                return id;
            } else {
                return undefined;
            }
        };
        attrs.businessObject.set = function (key: string, value: any) {
            if (key === "id") {
                assign(attrs.businessObject, { id: value });
            }
        };

        // add width and height if shape
        if (type === "shape") {
            const alreadyHasSize = attrs.height || attrs.width; // if a story is imported, groups and annotations already have dimensions; we must not overwrite them with default values

            if (!alreadyHasSize) {
                assign(attrs, this.getShapeSize(attrs["type"]));
            }
        }

        if (!("$instanceOf" in attrs.businessObject)) {
            // ensure we can use ModelUtil#is for type checks
            Object.defineProperty(attrs.businessObject, "$instanceOf", {
                value: function (type: string) {
                    return this.type === type;
                },
            });
        }

        // @ts-expect-error TypeScript does not understand that all four types are possible
        return super.create(type, attrs);
    }

    private getShapeSize(dstElementType: string) {
        const shapes: { [index: string]: { width: number; height: number } } = {
            __default: { width: 75, height: 75 },
            [ElementTypes.TEXTANNOTATION]: { width: 100, height: 30 },
            [ElementTypes.GROUP]: { width: 300, height: 200 },
        };

        return shapes[dstElementType] || shapes["__default"];
    }
}

DomainStoryElementFactory.$inject = ["domainStoryIdFactory"];
