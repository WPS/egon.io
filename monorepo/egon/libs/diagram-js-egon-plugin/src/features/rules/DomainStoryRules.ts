import { assign, every, reduce } from "min-dash";
import { Connection, Element, Label, Shape } from "diagram-js/lib/model/Types";
import EventBus from "diagram-js/lib/core/EventBus";
import RuleProvider from "diagram-js/lib/features/rules/RuleProvider";
import { ElementTypes } from "../../domain/entities/elementTypes";
import { is } from "../../utils/util";

const HIGH_PRIORITY = 1500;
const MIN_SIZE = 125;

function isGroup(element: Element) {
    return element && /^domainStory:group/.test(element["type"]);
}

function isActor(element: Element) {
    return element && /^domainStory:actor\w*/.test(element["type"]);
}

function isWorkObject(element: Element) {
    return element && /^domainStory:workObject/.test(element["type"]);
}

function isActivity(element: Element) {
    return element && /^domainStory:activity/.test(element["type"]);
}

function isConnection(element: Element): element is Connection {
    return element && /^domainStory:connection/.test(element["type"]);
}

function isAnnotation(element: Element) {
    return element && /^domainStory:textAnnotation/.test(element["type"]);
}

// indirect usage of IMPLICIT_ROOT_ID, constant not used because of Regex
export function isBackground(element: Element) {
    const isRoot = element && /^__implicitroot/.test(element.id);
    console.log("isRoot", isRoot);
    return isRoot;
}

export function isLabel(element: Element): element is Label {
    return element && !!element.label?.labelTarget;
}

function nonExistingOrLabel(element: Element) {
    return !element || isLabel(element);
}

function canStartConnection(element: Element) {
    if (nonExistingOrLabel(element)) {
        return null;
    }
    return false;
}

/**
 * can source and target be connected?
 */
function canConnect(source: Element, target: Element) {
    // never connect to background; since the direction of the activity can get reversed during dragging, we also have to check if the source
    if (isBackground(target) || isBackground(source)) {
        return false;
    }

    if (isGroup(target)) {
        return false;
    }

    // do not allow a connection from one element to itself
    if (source === target) {
        return false;
    }

    // do not allow a connection between two actors
    if (isActor(source) && isActor(target)) {
        return false;
    }

    // do not allow a connection, where the source or target is an activity
    if (isActivity(source) || isActivity(target)) {
        return false;
    }

    // do not allow a connection, where the source or target is an annotation connection
    if (isConnection(source) || isConnection(target)) {
        return false;
    }

    // do not allow a connection to a connection (the special type of connection between an element and a comment box)
    // when the target is an annotation, the connection type is an annotation connection instead of an activity
    if (isAnnotation(target)) {
        return { type: ElementTypes.CONNECTION };
    }

    return { type: ElementTypes.ACTIVITY };
}

function canResize(shape: Shape, newBounds: Shape) {
    if (is(shape, ElementTypes.GROUP)) {
        if (newBounds) {
            const lowerLeft = { x: shape.x, y: shape.y + shape.height };
            const lowerRight = { x: shape.x + shape.width, y: shape.y + shape.height };
            const upperRight = { x: shape.x + shape.width, y: shape.y };

            if (newBounds.x !== shape.x && newBounds.y !== shape.y) {
                // upper left
                if (newBounds.x > lowerRight.x - MIN_SIZE) {
                    assign(newBounds, { x: lowerRight.x - MIN_SIZE });
                }
                if (newBounds.y > lowerRight.y - MIN_SIZE) {
                    assign(newBounds, { y: lowerRight.y - MIN_SIZE });
                }
            }

            if (newBounds.x !== shape.x && newBounds.y === shape.y) {
                // lower left
                if (newBounds.x > upperRight.x - MIN_SIZE) {
                    assign(newBounds, { x: upperRight.x - MIN_SIZE });
                }
            }

            if (newBounds.x === shape.x && newBounds.y !== shape.y) {
                // upper right
                if (newBounds.y > lowerLeft.y - MIN_SIZE) {
                    assign(newBounds, { y: lowerLeft.y - MIN_SIZE });
                }
            }

            if (newBounds.height < MIN_SIZE) {
                assign(newBounds, {
                    height: MIN_SIZE,
                });
            }
            if (newBounds.width < MIN_SIZE) {
                assign(newBounds, {
                    width: MIN_SIZE,
                });
            }
        }
        return true;
    }

    return false;
}

function canConnectToAnnotation(source: Element, target: Element, connection: Element) {
    // do not allow an activity connecting to an annotation
    if (isActivity(connection) && isAnnotation(target)) {
        return false;
    }

    // do not allow an annotation connection between two annotations
    if (isConnection(connection) && isAnnotation(source) && isAnnotation(target)) {
        return false;
    }

    // do not allow an annotation connection between an actor or workObject and anything except an annotation
    return !(
        isConnection(connection) &&
        !isAnnotation(target) &&
        (isActor(source) || isWorkObject(source))
    );
}

export class DomainStoryRules extends RuleProvider {
    constructor(eventBus: EventBus) {
        super(eventBus);
    }

    override init() {
        this.addRule("elements.create", (context) => {
            const elements = context.elements,
                target = context.target;

            return every(elements, (element: Element) => {
                if (isConnection(element)) {
                    if (!element.source || !element.target) {
                        return false;
                    }
                    return canConnect(element.source, element.target);
                }

                return this.canCreate(element, target);
            });
        });

        this.addRule("elements.move", HIGH_PRIORITY, (context: any) => {
            const target = context.target,
                shapes = context.shapes;

            // The idea of this code is to make sure that if any of the selected shapes cannot be moved,
            // then the whole selection cannot be moved. However, it actually only checks
            // if the shape under the mouse cursor is over another shape.
            // This is probably enough as a full detection over overlapping shapes might make it hard
            // to move large selections
            return reduce(
                shapes,
                (result: any, s: Element) => {
                    if (result === false) {
                        return false;
                    }
                    return this.canCreate(s, target);
                },
                undefined,
            );
        });

        this.addRule("shape.create", HIGH_PRIORITY, (context: any) => {
            const target = context.target,
                shape = context.shape;

            return this.canCreate(shape, target);
        });

        this.addRule("connection.create", HIGH_PRIORITY, (context) => {
            const source = context.source,
                target = context.target;

            return canConnect(source, target);
        });

        this.addRule("connection.reconnect", HIGH_PRIORITY, (context: any) => {
            const connection: Connection = context.connection,
                source: Element = context.hover || context.source,
                target: Element = context.target;

            const result = canConnectToAnnotation(source, target, connection);

            if (!result) {
                return undefined;
            }

            return canConnect(source, target);
        });

        this.addRule("shape.resize", function (context: any) {
            const shape: Shape = context.shape,
                newBounds: Shape = context.newBounds;

            return canResize(shape, newBounds);
        });

        this.addRule("connection.start", function (context: any) {
            const source = context.source;

            return canStartConnection(source);
        });

        this.addRule("connection.updateWaypoints", function (context: any) {
            return {
                type: context.connection.type,
            };
        });

        // CopyPaste.js requires this empty-looking rule to exist
        this.addRule("element.copy", function () {
            return true;
        });
    }

    /**
     * can a shape be created on target?
     */
    private canCreate(shape: Element, target: Element) {
        // allow creation on canvas || allow groups on everything || allow everything on groups
        return isBackground(target) || isGroup(shape) || isGroup(target);
    }
}

DomainStoryRules.$inject = ["eventBus"];
