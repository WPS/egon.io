"use strict";

import { assign, every, reduce } from "min-dash";

import inherits from "inherits";

import RuleProvider from "diagram-js/lib/features/rules/RuleProvider";
import { ElementTypes } from "src/app/domain/entities/elementTypes";
import { is } from "./util/util";

const HIGH_PRIORITY = 1500;
const MIN_SIZE = 125;

function isDomainStory(element) {
  return element && /^domainStory:/.test(element.type);
}

function isDomainStoryGroup(element) {
  return element && /^domainStory:group/.test(element.type);
}

function isActor(element) {
  return element && /^domainStory:actor\w*/.test(element.type);
}

function isWorkObject(element) {
  return element && /^domainStory:workObject/.test(element.type);
}

function isActivity(element) {
  return element && /^domainStory:activity/.test(element.type);
}

function isConnection(element) {
  return element && /^domainStory:connection/.test(element.type);
}

function isAnnotation(element) {
  return element && /^domainStory:textAnnotation/.test(element.type);
}

// indirect usage of IMPLICIT_ROOT_ID, constant not used because of Regex
export function isBackground(element) {
  return element && /^__implicitroot/.test(element.id);
}

export function isLabel(element) {
  return element && !!element.labelTarget;
}

function nonExistingOrLabel(element) {
  return !element || isLabel(element);
}

function canStartConnection(element) {
  if (nonExistingOrLabel(element)) {
    return null;
  }
  return false;
}

/**
 * can source and target be connected?
 */
function canConnect(source, target) {
  // never connect to background
  if (isBackground(target)) {
    return false;
  }

  // only judge about two custom elements
  if (
    isDomainStoryGroup(target) ||
    !isDomainStory(source) ||
    !isDomainStory(target)
  ) {
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

  // do not allow a connection to a connection(the special type of connection between an element and a comment box)
  // when the target is an annotation, the connection type is an annotation connection instead of an activity
  if (isAnnotation(target)) {
    return { type: ElementTypes.CONNECTION };
  }

  return { type: ElementTypes.ACTIVITY };
}

function canResize(shape, newBounds) {
  if (is(shape, ElementTypes.GROUP)) {
    if (newBounds) {
      let lowerLeft = { x: shape.x, y: shape.y + shape.height };
      let lowerRight = { x: shape.x + shape.width, y: shape.y + shape.height };
      let upperRight = { x: shape.x + shape.width, y: shape.y };

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

function canAttach(elements, target, source) {
  if (!Array.isArray(elements)) {
    elements = [elements];
  }

  // disallow appending as boundary event
  if (source) {
    return false;
  }

  // only (re-)attach one element at a time
  if (elements.length !== 1) {
    return false;
  }

  // allow default move operation
  if (!target) {
    return true;
  }

  // only allow drop on DomainStory Elements
  if (!isDomainStory(target)) {
    return false;
  }

  return "attach";
}

function canConnectToAnnotation(source, target, connection) {
  // do not allow an activity connect to an annotation
  if (isActivity(connection) && isAnnotation(target)) {
    return false;
  }

  // do not allow an annotation connection between two annotations
  if (
    isConnection(connection) &&
    isAnnotation(source) &&
    isAnnotation(target)
  ) {
    return false;
  }

  // do not allow an annotation connection between an actor or workObject and anything except an annotation
  return !(
    isConnection(connection) &&
    !isAnnotation(target) &&
    (isActor(source) || isWorkObject(source))
  );
}

/**
 * specific rules for custom elements
 */
export default function DomainStoryRules(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(DomainStoryRules, RuleProvider);

DomainStoryRules.$inject = ["eventBus"];

DomainStoryRules.prototype.init = function () {
  /**
   * can shape be created on target container?
   */
  function canCreate(shape, target) {
    // only judge about custom elements
    if (!isDomainStory(shape)) {
      return;
    }

    // allow creation just on groups
    return !isDomainStory(target) || isDomainStoryGroup(target);
  }

  this.addRule("elements.create", function (context) {
    const elements = context.elements,
      position = context.position,
      target = context.target;

    return every(elements, function (element) {
      if (isConnection(element)) {
        return canConnect(element.source, element.target, element);
      }

      if (element.host) {
        return canAttach(element, element.host, null, position);
      }

      return canCreate(element, target, null, position);
    });
  });

  this.addRule("elements.move", HIGH_PRIORITY, function (context) {
    let target = context.target,
      shapes = context.shapes;

    let type;

    // do not allow mixed movements of custom / diagram-js shapes
    // if any shape cannot be moved, the group cannot be moved, too

    // reject, if we have at least one
    // custom element that cannot be moved
    return reduce(
      shapes,
      function (result, s) {
        if (type === undefined) {
          type = isDomainStory(s);
        }

        if (type !== isDomainStory(s) || result === false) {
          return false;
        }

        return canCreate(s, target);
      },
      undefined,
    );
  });

  this.addRule("shape.create", HIGH_PRIORITY, function (context) {
    let target = context.target,
      shape = context.shape;

    return canCreate(shape, target);
  });

  this.addRule("connection.create", HIGH_PRIORITY, function (context) {
    let source = context.source,
      target = context.target;

    return canConnect(source, target);
  });

  this.addRule("connection.reconnect", HIGH_PRIORITY, function (context) {
    let connection = context.connection,
      source = context.hover || context.source,
      target = context.target;

    // --------------------------------------------------------------
    let result = canConnectToAnnotation(source, target, connection);

    if (!result) {
      return;
    }

    // --------------------------------------------------------------

    return canConnect(source, target, connection);
  });

  this.addRule("shape.resize", function (context) {
    let shape = context.shape,
      newBounds = context.newBounds;

    return canResize(shape, newBounds);
  });

  this.addRule("connection.start", function (context) {
    var source = context.source;

    return canStartConnection(source);
  });

  this.addRule("connection.updateWaypoints", function (context) {
    return {
      type: context.connection.type,
    };
  });

  // CopyPaste.js requires this empty-looking rule to exist
  this.addRule("element.copy", function (context) {
    return true;
  });
};

DomainStoryRules.prototype.canConnect = canConnect;
DomainStoryRules.prototype.canAttach = canAttach;
DomainStoryRules.prototype.isDomainStory = isDomainStory;
DomainStoryRules.prototype.canResize = canResize;
