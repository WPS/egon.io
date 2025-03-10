import ElementRegistry from "diagram-js/lib/core/ElementRegistry";
import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";
import EventBus from "diagram-js/lib/core/EventBus";
import CroppingConnectionDocking from "diagram-js/lib/layout/CroppingConnectionDocking";
import {
    add as collectionAdd,
    remove as collectionRemove,
} from "diagram-js/lib/util/Collections";
import { Point } from "diagram-js/lib/util/Types";
import { assign, pick } from "min-dash";
import { Connection, Shape } from "diagram-js/lib/model/Types";
import { ElementTypes } from "../../domain/entities/elementTypes";
import { reworkGroupElements } from "../../utils/util";

export class DomainStoryUpdater extends CommandInterceptor {
    constructor(
        eventBus: EventBus,
        private readonly elementRegistry: ElementRegistry,
        private readonly connectionDocking: CroppingConnectionDocking,
    ) {
        super(eventBus);

        // cropping must be done before updateElement
        // do not change the order of these .executed calls
        this.executed(["connection.layout", "connection.create"], this.cropConnection());

        this.reverted(["connection.layout"], function (e) {
            delete e.context.cropped;
        });

        this.executed(
            [
                "shape.create",
                "shape.move",
                "shape.delete",
                "shape.resize",
                "shape.removeGroupWithChildren",
            ],
            this.updateElement(),
        );

        this.reverted(
            [
                "shape.create",
                "shape.move",
                "shape.delete",
                "shape.resize",
                "shape.removeGroupWithChildren",
            ],
            this.updateElement(),
        );

        this.executed(
            [
                "connection.create",
                "connection.reconnect",
                "connection.updateWaypoints",
                "connection.delete",
                "connection.layout",
                "connection.move",
            ],
            this.updateConnection(),
        );

        this.reverted(
            [
                "connection.create",
                "connection.reconnect",
                "connection.updateWaypoints",
                "connection.delete",
                "connection.layout",
                "connection.move",
            ],
            this.updateConnection(),
        );
    }

    private updateElement(): (event: any) => void {
        return (event: any) => {
            const context = event.context,
                shape: Shape = context.shape;

            if (!shape) {
                return;
            }
            const businessObject = shape.businessObject;
            const parent = shape.parent;
            const elements = this.elementRegistry.filter(
                (element) => !element.id.startsWith("root"),
            );

            // make a sure element is added / removed from egon._elements
            if (!parent) {
                collectionRemove(elements, businessObject);
            } else {
                collectionAdd(elements, businessObject);
            }

            // save element position
            assign(businessObject, pick(shape, ["x", "y"]));

            // save element size if resizable
            if (shape["type"] === ElementTypes.GROUP) {
                assign(businessObject, pick(shape, ["height", "width"]));

                // rework the child-parent relations if a group was moved, such that all Objects that are visually in the group are also associated with it
                // since we do not have access to the standard-canvas object here, we cannot use the function correctGroupChildren() from DSLabelUtil
                if (parent != null) {
                    reworkGroupElements(parent, shape);
                }
            }
            if (
                shape &&
                shape.parent &&
                "type" in shape.parent &&
                shape.parent["type"] === ElementTypes.GROUP
            ) {
                assign(businessObject, {
                    parent: shape.parent.id,
                });
            }
        };
    }

    private updateConnection(): (event: any) => void {
        return (event: any) => {
            const context = event.context,
                connection: Connection = context.connection,
                businessObject = connection.businessObject;

            let source = connection.source,
                target = connection.target;

            if (event.newTarget) {
                target = event.newTarget;
            }
            if (event.newSource) {
                source = event.newSource;
            }

            const parent = connection.parent;
            const elements = this.elementRegistry.filter(
                (element) => !element.id.startsWith("root"),
            );

            // make a sure element is added / removed from egon._elements
            if (!parent) {
                collectionRemove(elements, businessObject);
            } else {
                collectionAdd(elements, businessObject);
            }

            // update waypoints
            assign(businessObject, {
                waypoints: this.copyWaypoints(connection),
            });

            if (source) {
                if (!businessObject.source) {
                    assign(businessObject, { source: source.id });
                } else {
                    businessObject.source = source.id;
                }
            }
            if (target) {
                if (!businessObject.target) {
                    assign(businessObject, { target: target.id });
                } else {
                    businessObject.target = target.id;
                }
            }
        };
    }

    // crop connection ends during create/update
    private cropConnection(): (event: any) => void {
        return (event: any) => {
            const context = event.context,
                hints = context.hints || {};

            if (!context.cropped && hints.createElementsBehavior !== false) {
                const connection: Connection = context.connection;
                connection.waypoints = this.connectionDocking.getCroppedWaypoints(
                    connection,
                    connection.source,
                    connection.target,
                );
                context.cropped = true;
            }
        };
    }

    private copyWaypoints(connection: Connection): Point[] {
        return connection.waypoints.map(function (p) {
            // @ts-expect-error Property original does exist on type Point
            const original: Point | undefined = p.original;

            if (original) {
                return {
                    original: {
                        x: original.x,
                        y: original.y,
                    },
                    x: p.x,
                    y: p.y,
                };
            } else {
                return {
                    x: p.x,
                    y: p.y,
                };
            }
        });
    }
}

DomainStoryUpdater.$inject = ["eventBus", "elementRegistry", "connectionDocking"];
