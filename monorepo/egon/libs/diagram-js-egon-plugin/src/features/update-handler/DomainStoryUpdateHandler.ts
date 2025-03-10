import CommandStack from "diagram-js/lib/command/CommandStack";
import {
    ActivityChangedHandler,
    ActivityDirectionChangedHandler,
} from "./handler/activityUpdateHandler";
import {
    ElementColorChangeHandler,
    RemoveGroupWithoutChildrenHandler,
} from "./handler/elementUpdateHandler";

export class DomainStoryUpdateHandler {
    static $inject: string[] = [];

    constructor(commandStack: CommandStack) {
        commandStack.registerHandler("activity.changed", ActivityChangedHandler);
        commandStack.registerHandler(
            "activity.directionChange",
            ActivityDirectionChangedHandler,
        );

        commandStack.registerHandler("element.colorChange", ElementColorChangeHandler);
        commandStack.registerHandler(
            "shape.removeGroupWithoutChildren",
            RemoveGroupWithoutChildrenHandler,
        );
    }
}

DomainStoryUpdateHandler.$inject = ["commandStack"];
