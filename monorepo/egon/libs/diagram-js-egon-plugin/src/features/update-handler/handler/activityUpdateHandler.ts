import { ElementRegistryService } from "@egon/diagram-js-egon-plugin";
import { CommandContext } from "diagram-js/lib/command/CommandStack";
import EventBus from "diagram-js/lib/core/EventBus";
import CommandHandler from "diagram-js/lib/command/CommandHandler";
import { Connection, Element, ElementLike } from "diagram-js/lib/model/Types";
import { ActivityCanvasObject } from "../../../domain/entities/activityCanvasObject";
import { DomainStoryModeling } from "../../modeling/DomainStoryModeling";
import { getNumbersAndIDs } from "../../../utils/numbering";

export class ActivityChangedHandler implements CommandHandler {
    static $inject: string[] = [];

    constructor(
        private readonly modeling: DomainStoryModeling,
        private readonly elementRegistryService: ElementRegistryService,
        private readonly eventBus: EventBus,
    ) {}

    preExecute(context: CommandContext) {
        context.oldLabel = context.businessObject.name || " ";

        const oldNumbersWithIDs = getNumbersAndIDs(this.elementRegistryService);
        this.modeling.updateLabel(context.businessObject, context.newLabel);
        this.modeling.updateNumber(context.businessObject, context.newNumber);

        context.oldNumber = context.businessObject.number;
        context.oldNumbersWithIDs = oldNumbersWithIDs;
    }

    execute(context: CommandContext): ElementLike[] {
        const businessObject = context.businessObject;
        const element: Element = context.element;

        if (context.newLabel && context.newLabel.length < 1) {
            context.newLabel = " ";
        }

        businessObject.name = context.newLabel;
        businessObject.number = context.newNumber;

        this.eventBus.fire("element.changed", { element });

        return [
            {
                id: element.id,
                businessObject: businessObject,
            },
        ];
    }

    revert(context: CommandContext): ElementLike[] {
        const semantic = context.businessObject;
        const element = context.element;
        semantic.name = context.oldLabel;
        semantic.number = context.oldNumber;

        revertAutomaticNumberGenerationChange(
            context.oldNumbersWithIDs,
            this.elementRegistryService.getActivitiesFromActors(),
            this.eventBus,
        );

        this.eventBus.fire("element.changed", { element });

        return [
            {
                id: element.id,
                businessObject: semantic,
            },
        ];
    }
}

export class ActivityDirectionChangedHandler implements CommandHandler {
    static $inject: string[] = [];

    constructor(
        private readonly modeling: DomainStoryModeling,
        private readonly eventBus: EventBus,
    ) {}

    preExecute(context: CommandContext) {
        context.oldNumber = context.businessObject.number;
        context.oldWaypoints = context.element.waypoints;
        context.name = context.businessObject.name;

        if (!context.oldNumber) {
            context.oldNumber = 0;
        }
        this.modeling.updateNumber(context.businessObject, context.newNumber);
    }

    execute(context: CommandContext): ElementLike[] {
        const businessObject = context.businessObject;
        const element: Connection = context.element;
        const swapSource = element.source;
        const newWaypoints = [];
        const waypoints = element.waypoints;

        for (let i = waypoints.length - 1; i >= 0; i--) {
            newWaypoints.push(waypoints[i]);
        }

        element.source = element.target;
        businessObject.source = businessObject.target;
        element.target = swapSource;
        businessObject.target = swapSource?.id;

        businessObject.name = context.name;
        businessObject.number = context.newNumber;
        element.waypoints = newWaypoints;

        this.eventBus.fire("element.changed", { element });

        return [
            {
                id: element.id,
                businessObject: businessObject,
            },
        ];
    }

    revert(context: CommandContext): ElementLike[] {
        const semantic = context.businessObject;
        const element: Connection = context.element;
        const swapSource = element.source;

        element.source = element.target;
        semantic.source = semantic.target;
        element.target = swapSource;
        semantic.target = swapSource?.id;

        semantic.name = context.name;

        semantic.number = context.oldNumber;
        element.waypoints = context.oldWaypoints;

        this.eventBus.fire("element.changed", { element });

        return [
            {
                id: element.id,
                businessObject: semantic,
            },
        ];
    }
}

// reverts the automatic changed done by the automatic number-generation at editing
function revertAutomaticNumberGenerationChange(
    iDWithNumber: any[],
    activities: ActivityCanvasObject[],
    eventBus: EventBus,
) {
    for (let i = activities.length - 1; i >= 0; i--) {
        for (let j = iDWithNumber.length - 1; j >= 0; j--) {
            if (iDWithNumber[j].id.includes(activities[i].businessObject.id)) {
                const element = activities[i];
                element.businessObject.number = iDWithNumber[j].number;
                j = -5;
                eventBus.fire("element.changed", { element });
                iDWithNumber.splice(j, 1);
            }
        }
    }
}

ActivityChangedHandler.$inject = [
    "modeling",
    "domainStoryElementRegistryService",
    "eventBus",
];

ActivityDirectionChangedHandler.$inject = ["modeling", "eventBus"];
