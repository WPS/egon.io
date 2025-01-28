"use strict";

import inherits from "inherits";

import { pick, assign } from "min-dash";

import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";

import {
  add as collectionAdd,
  remove as collectionRemove,
} from "diagram-js/lib/util/Collections";

import { reworkGroupElements } from "./util/util";
import { ElementTypes } from "../../../../domain/entities/elementTypes";

/**
 * a handler responsible for updating the element's businessObject
 * once changes on the diagram happen.
 */
export default function DomainStoryUpdater(eventBus, egon, connectionDocking) {
  CommandInterceptor.call(this, eventBus);

  function updateElement(e) {
    let context = e.context,
      shape = context.shape;

    if (!shape) {
      return;
    }
    let businessObject = shape.businessObject;
    let parent = shape.parent;
    let elements = egon._elements;

    // make sure element is added / removed from egon._elements
    if (!parent) {
      collectionRemove(elements, businessObject);
    } else {
      collectionAdd(elements, businessObject);
    }

    // save element position
    assign(businessObject, pick(shape, ["x", "y"]));

    // save element size if resizable
    if (shape.type === ElementTypes.GROUP) {
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
      shape.parent.type === ElementTypes.GROUP
    ) {
      assign(businessObject, {
        parent: shape.parent.id,
      });
    }
  }

  function updateConnection(e) {
    let context = e.context,
      connection = context.connection,
      source = connection.source,
      target = connection.target,
      businessObject = connection.businessObject;

    if (e.newTarget) {
      target = e.newTarget;
    }
    if (e.newSource) {
      source = e.newSource;
    }

    let parent = connection.parent;
    let elements = egon._elements;

    // make sure element is added / removed from egon._elements
    if (!parent) {
      collectionRemove(elements, businessObject);
    } else {
      collectionAdd(elements, businessObject);
    }

    // update waypoints
    assign(businessObject, {
      waypoints: copyWaypoints(connection),
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
  }

  function copyWaypoints(connection) {
    return connection.waypoints.map(function (p) {
      if (p.original) {
        return {
          original: {
            x: p.original.x,
            y: p.original.y,
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

  // crop connection ends during create/update
  function cropConnection(e) {
    var context = e.context,
      hints = context.hints || {},
      connection;

    if (!context.cropped && hints.createElementsBehavior !== false) {
      connection = context.connection;
      connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
      context.cropped = true;
    }
  }

  // cropping must be done before updateElement
  // do not change the order of these .executed calls
  this.executed(["connection.layout", "connection.create"], cropConnection);

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
    ifDomainStoryElement(updateElement),
  );

  this.reverted(
    [
      "shape.create",
      "shape.move",
      "shape.delete",
      "shape.resize",
      "shape.removeGroupWithChildren",
    ],
    ifDomainStoryElement(updateElement),
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
    ifDomainStoryElement(updateConnection),
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
    ifDomainStoryElement(updateConnection),
  );
}

// check if element in the context of an event is a domainStory element
function ifDomainStoryElement(fn) {
  return (event) => {
    const context = event.context;
    const element = context.shape || context.connection;

    if (isDomainStory(element)) {
      fn(event);
    }
  };
}

function isDomainStory(element) {
  return element && /domainStory:/.test(element.type);
}

inherits(DomainStoryUpdater, CommandInterceptor);

DomainStoryUpdater.$inject = ["eventBus", "egon", "connectionDocking"];
