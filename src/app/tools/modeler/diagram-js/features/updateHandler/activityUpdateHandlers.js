"use strict";

import { getNumbersAndIDs } from "../numbering/numbering";

/**
 * commandStack Handler for changes at activities
 */

let canvasElementRegistry;
export function initializeActivityUpdateHandler(canvasElementRegistryService) {
  canvasElementRegistry = canvasElementRegistryService;
}

export default function activityUpdateHandler(commandStack, eventBus) {
  commandStack.registerHandler(
    "activity.directionChange",
    activity_directionChange,
  );
  commandStack.registerHandler("activity.changed", activity_changed);

  // update the activity from the activity-dialog, either with or without number
  // and change other activities too, to keep the numbers consistent
  function activity_changed(modeling) {
    this.preExecute = function (context) {
      context.oldLabel = context.businessObject.name || " ";

      let oldNumbersWithIDs = getNumbersAndIDs();
      modeling.updateLabel(context.businessObject, context.newLabel);
      modeling.updateNumber(context.businessObject, context.newNumber);

      context.oldNumber = context.businessObject.number;
      context.oldNumbersWithIDs = oldNumbersWithIDs;
    };

    this.execute = function (context) {
      let businessObject = context.businessObject;
      let element = context.element;

      if (context.newLabel && context.newLabel.length < 1) {
        context.newLabel = " ";
      }

      businessObject.name = context.newLabel;
      businessObject.number = context.newNumber;

      eventBus.fire("element.changed", { element });
    };

    this.revert = function (context) {
      let semantic = context.businessObject;
      let element = context.element;
      semantic.name = context.oldLabel;
      semantic.number = context.oldNumber;

      revertAutomaticNumberGenerationChange(
        context.oldNumbersWithIDs,
        eventBus,
      );

      eventBus.fire("element.changed", { element });
    };
  }

  // change the direction of a single activity without affecting other activities
  function activity_directionChange(modeling) {
    this.preExecute = function (context) {
      context.oldNumber = context.businessObject.number;
      context.oldWaypoints = context.element.waypoints;
      context.name = context.businessObject.name;

      if (!context.oldNumber) {
        context.oldNumber = 0;
      }
      modeling.updateNumber(context.businessObject, context.newNumber);
    };

    this.execute = function (context) {
      let businessObject = context.businessObject;
      let element = context.element;
      let swapSource = element.source;
      let newWaypoints = [];
      let waypoints = element.waypoints;

      for (let i = waypoints.length - 1; i >= 0; i--) {
        newWaypoints.push(waypoints[i]);
      }

      element.source = element.target;
      businessObject.source = businessObject.target;
      element.target = swapSource;
      businessObject.target = swapSource.id;

      businessObject.name = context.name;
      businessObject.number = context.newNumber;
      element.waypoints = newWaypoints;

      eventBus.fire("element.changed", { element });
    };

    this.revert = function (context) {
      let semantic = context.businessObject;
      let element = context.element;
      let swapSource = element.source;

      element.source = element.target;
      semantic.source = semantic.target;
      element.target = swapSource;
      semantic.target = swapSource.id;

      semantic.name = context.name;

      semantic.number = context.oldNumber;
      element.waypoints = context.oldWaypoints;

      eventBus.fire("element.changed", { element });
    };
  }
}

// reverts the automatic changed done by the automatic number-generation at editing
function revertAutomaticNumberGenerationChange(iDWithNumber, eventBus) {
  let activities = canvasElementRegistry?.getActivitesFromActors();
  for (let i = activities.length - 1; i >= 0; i--) {
    for (let j = iDWithNumber.length - 1; j >= 0; j--) {
      if (iDWithNumber[j].id.includes(activities[i].businessObject.id)) {
        let element = activities[i];
        element.businessObject.number = iDWithNumber[j].number;
        j = -5;
        eventBus.fire("element.changed", { element });
        iDWithNumber.splice(j, 1);
      }
    }
  }
}
