import { getBusinessObject } from "../util";

import { forEach, isArray, isUndefined, omit, reduce } from "min-dash";

function copyProperties(source, target, properties) {
  if (!isArray(properties)) {
    properties = [properties];
  }

  forEach(properties, function (property) {
    if (!isUndefined(source[property])) {
      target[property] = source[property];
    }
  });
}

function removeProperties(element, properties) {
  if (!isArray(properties)) {
    properties = [properties];
  }

  forEach(properties, function (property) {
    if (element[property]) {
      delete element[property];
    }
  });
}

var LOW_PRIORITY = 750;

export default function EgonCopyPaste(eventBus, propertyCopy) {
  eventBus.on("copyPaste.copyElement", LOW_PRIORITY, function (context) {
    var descriptor = context.descriptor,
      element = context.element;

    var businessObject = (descriptor.oldBusinessObject =
      getBusinessObject(element));

    descriptor.type = element.type;

    copyProperties(businessObject, descriptor, "name");

    if (isLabel(descriptor)) {
      return descriptor;
    }
  });

  var references;

  function resolveReferences(descriptor, cache) {
    var businessObject = getBusinessObject(descriptor);

    // boundary events
    if (descriptor.host) {
      // relationship can be resolved immediately
      getBusinessObject(descriptor).attachedToRef = getBusinessObject(
        cache[descriptor.host],
      );
    }

    references = omit(
      references,
      reduce(
        references,
        function (array, reference, key) {
          var element = reference.element,
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

  eventBus.on("copyPaste.pasteElements", function () {
    references = {};
  });

  eventBus.on("copyPaste.pasteElement", function (context) {
    var cache = context.cache,
      descriptor = context.descriptor,
      oldBusinessObject = descriptor.oldBusinessObject,
      newBusinessObject;

    // do NOT copy business object if external label
    if (isLabel(descriptor)) {
      descriptor.businessObject = getBusinessObject(
        cache[descriptor.labelTarget],
      );

      return;
    }

    newBusinessObject = propertyCopy.createDefaultElement(
      oldBusinessObject.$type,
    );

    descriptor.businessObject = propertyCopy.copyElement(
      oldBusinessObject,
      newBusinessObject,
    );

    // resolve references e.g. default sequence flow
    resolveReferences(descriptor, cache);

    copyProperties(descriptor, newBusinessObject, ["name"]);

    removeProperties(descriptor, "oldBusinessObject");
  });
}

EgonCopyPaste.$inject = ["eventBus", "propertyCopy"];

// helpers //////////

function isLabel(element) {
  return !!element.labelTarget;
}
