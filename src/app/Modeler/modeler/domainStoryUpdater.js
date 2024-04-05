"use strict";

import inherits from "inherits";

import { pick, assign } from "min-dash";

import CommandInterceptor from "diagram-js/lib/command/CommandInterceptor";

import {
  add as collectionAdd,
  remove as collectionRemove,
} from "diagram-js/lib/util/Collections";

import { reworkGroupElements } from "./util";
import { elementTypes } from "../../Domain/Common/elementTypes";

/**
 * a handler responsible for updating the custom element's businessObject
 * once changes on the diagram happen.
 */
export default function DomainStoryUpdater(eventBus, bpmnjs) {
  CommandInterceptor.call(this, eventBus);

  function updateCustomElement(e) {
    let context = e.context,
      shape = context.shape,
      businessObject = shape.businessObject;

    if (!shape || !shape.type.includes(elementTypes.DOMAINSTORY)) {
      return;
    }

    let parent = shape.parent;
    let customElements = bpmnjs._customElements;

    // make sure element is added / removed from bpmnjs.customElements
    if (!parent) {
      collectionRemove(customElements, businessObject);
    } else {
      collectionAdd(customElements, businessObject);
    }

    // save custom element position
    assign(businessObject, pick(shape, ["x", "y"]));

    // save custom element size if resizable
    if (shape.type === elementTypes.GROUP) {
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
      shape.parent.type === elementTypes.GROUP
    ) {
      assign(businessObject, {
        parent: shape.parent.id,
      });
    }
  }

  function updateCustomConnection(e) {
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
    let customElements = bpmnjs._customElements;

    // make sure element is added / removed from bpmnjs.customElements
    if (!parent) {
      collectionRemove(customElements, businessObject);
    } else {
      collectionAdd(customElements, businessObject);
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

  this.executed(
    [
      "shape.create",
      "shape.move",
      "shape.delete",
      "shape.resize",
      "shape.removeGroupWithChildren",
    ],
    ifDomainStoryElement(updateCustomElement),
  );

  this.reverted(
    [
      "shape.create",
      "shape.move",
      "shape.delete",
      "shape.resize",
      "shape.removeGroupWithChildren",
    ],
    ifDomainStoryElement(updateCustomElement),
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
    ifDomainStoryElement(updateCustomConnection),
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
    ifDomainStoryElement(updateCustomConnection),
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

DomainStoryUpdater.$inject = ["eventBus", "bpmnjs"];
