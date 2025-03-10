import {
    forEach,
    isArray,
    isUndefined,
    omit,
    reduce,
    StringKeyValueCollection,
} from "min-dash";
import EventBus from "diagram-js/lib/core/EventBus";
import { DomainStoryPropertyCopy } from "./DomainStoryPropertyCopy";
import { getBusinessObject } from "../../utils/util";
import { isLabel } from "diagram-js/lib/util/ModelUtil";

const LOW_PRIORITY = 750;

export class DomainStoryCopyPaste {
    static $inject: string[] = [];

    private references: Record<string, any> = {};

    constructor(
        private readonly domainStoryPropertyCopy: DomainStoryPropertyCopy,
        eventBus: EventBus,
    ) {
        eventBus.on("copyPaste.copyElement", LOW_PRIORITY, function (context: any) {
            const descriptor = context.descriptor,
                element = context.element;

            const businessObject = (descriptor.oldBusinessObject =
                getBusinessObject(element));

            descriptor.type = element.type;

            copyProperties(businessObject, descriptor, "name");

            if (isLabel(descriptor)) {
                return descriptor;
            }
        });

        eventBus.on("copyPaste.pasteElements", () => {
            this.references = {};
        });

        eventBus.on("copyPaste.pasteElement", (context: any) => {
            const cache = context.cache,
                descriptor = context.descriptor,
                oldBusinessObject = descriptor.oldBusinessObject,
                newBusinessObject: Record<string, any> = {};

            // do NOT copy a business object if external label
            if (isLabel(descriptor)) {
                descriptor.businessObject = getBusinessObject(
                    cache[descriptor.labelTarget],
                );

                return;
            }

            descriptor.businessObject = this.domainStoryPropertyCopy.copyElement(
                oldBusinessObject,
                newBusinessObject,
            );

            // resolve references e.g. default sequence flow
            this.resolveReferences(descriptor, cache);

            copyProperties(descriptor, newBusinessObject, ["name"]);

            removeProperties(descriptor, "oldBusinessObject");
        });
    }

    private resolveReferences(descriptor: any, cache: any) {
        const businessObject = getBusinessObject(descriptor);

        // boundary events
        if (descriptor.host) {
            // relationship can be resolved immediately
            getBusinessObject(descriptor).attachedToRef = getBusinessObject(
                cache[descriptor.host],
            );
        }

        this.references = omit(
            this.references,
            reduce(
                this.references as StringKeyValueCollection<any>,
                function (array: any[], reference: any, key: string) {
                    const element = reference.element,
                        property = reference.property;

                    if (key === descriptor.id) {
                        element[property] = businessObject;

                        array.push(descriptor.id);
                    }

                    return array;
                },
                [],
            ),
        );
    }
}

DomainStoryCopyPaste.$inject = ["domainStoryPropertyCopy", "eventBus"];

function copyProperties(source: any, target: any, properties: any) {
    if (!isArray(properties)) {
        properties = [properties];
    }

    forEach(properties, function (property: any) {
        if (!isUndefined(source[property])) {
            target[property] = source[property];
        }
    });
}

function removeProperties(element: any, properties: any) {
    if (!isArray(properties)) {
        properties = [properties];
    }

    forEach(properties, function (property: any) {
        if (element[property]) {
            delete element[property];
        }
    });
}
