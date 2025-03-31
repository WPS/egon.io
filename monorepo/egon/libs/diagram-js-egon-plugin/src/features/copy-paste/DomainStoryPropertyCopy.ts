import EventBus from "diagram-js/lib/core/EventBus";
import { forEach, has, isArray, isDefined, isObject, reduce, sortBy } from "min-dash";

type CopiedProperty = boolean | Record<string, any>;

const DISALLOWED_PROPERTIES = ["incoming", "outgoing"];

export class DomainStoryPropertyCopy {
    static $inject: string[] = [];

    constructor(private readonly eventBus: EventBus) {
        // copy extension elements last
        eventBus.on("propertyCopy.canCopyProperties", function (context: any) {
            const propertyNames: string[] = context.propertyNames;

            if (!propertyNames || !propertyNames.length) {
                return undefined;
            }

            return sortBy(propertyNames, function (propertyName): any {
                return propertyName === "extensionElements";
            });
        });

        // default check whether property can be copied
        eventBus.on("propertyCopy.canCopyProperty", function (context: any) {
            const propertyName = context.propertyName;
            return !(propertyName && DISALLOWED_PROPERTIES.indexOf(propertyName) !== -1);
        });
    }

    copyElement(
        sourceElement: Record<string, any>,
        targetElement: Record<string, any>,
        propertyNames?: string[],
    ) {
        if (propertyNames && !isArray(propertyNames)) {
            propertyNames = [propertyNames];
        }

        const canCopyProperties = this.eventBus.fire("propertyCopy.canCopyProperties", {
            propertyNames: propertyNames,
            sourceElement: sourceElement,
            targetElement: targetElement,
        });

        if (canCopyProperties === false) {
            return targetElement;
        }

        if (isArray(canCopyProperties)) {
            propertyNames = canCopyProperties;
        }

        // copy properties
        forEach(propertyNames, (propertyName) => {
            let sourceProperty;

            if (has(sourceElement, propertyName)) {
                sourceProperty = sourceElement[propertyName];
            }

            const copiedProperty = this.copyProperty(
                sourceProperty,
                targetElement,
                propertyName,
            );

            const canSetProperty = this.eventBus.fire(
                "propertyCopy.canSetCopiedProperty",
                {
                    parent: targetElement,
                    property: copiedProperty,
                    propertyName: propertyName,
                },
            );

            if (canSetProperty === false) {
                return;
            }

            if (isDefined(copiedProperty)) {
                targetElement[propertyName] = copiedProperty;
            }
        });

        return targetElement;
    }

    copyProperty(
        property: Record<string, any>,
        parent: Record<string, any>,
        propertyName: string,
    ): CopiedProperty | undefined {
        // allow others to copy property
        let copiedProperty: CopiedProperty | undefined = this.eventBus.fire(
            "propertyCopy.canCopyProperty",
            {
                parent: parent,
                property: property,
                propertyName: propertyName,
            },
        );

        // return if copying is NOT allowed
        if (typeof copiedProperty === "boolean" && !copiedProperty) {
            return undefined;
        }

        if (copiedProperty) {
            if (isObject(copiedProperty) && !copiedProperty["$parent"]) {
                copiedProperty["$parent"] = parent;
            }

            // if copiedProperty is a boolean and true, returns true
            // if copiedProperty is an object, returns the object
            // if copiedProperty is whatever, returns whatever
            return copiedProperty;
        }

        // TODO: Does the following part get ever executed???

        // copy arrays
        if (isArray(property)) {
            return reduce(
                property,
                (childProperties: any, childProperty: any): any => {
                    // recursion
                    copiedProperty = this.copyProperty(
                        childProperty,
                        parent,
                        propertyName,
                    );

                    // copying might NOT be allowed
                    if (copiedProperty && typeof copiedProperty !== "boolean") {
                        copiedProperty["$parent"] = parent;

                        return childProperties.concat(copiedProperty);
                    }

                    return childProperties;
                },
                [],
            );
        }

        // copy model elements
        if (isObject(property)) {
            copiedProperty = {};

            copiedProperty["$parent"] = parent;

            // recursion
            copiedProperty = this.copyElement(property, copiedProperty);

            return copiedProperty;
        }

        // copy primitive properties
        return property;
    }
}

DomainStoryPropertyCopy.$inject = ["eventBus"];
