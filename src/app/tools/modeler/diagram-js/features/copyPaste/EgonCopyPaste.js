import { getBusinessObject } from "../util/util";

import { forEach, isArray, isUndefined, omit, reduce } from "min-dash";
import { EVENT_COPY_PASE_PASTE_ELEMENT } from "../diagramJSConstants";

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

const LOW_PRIORITY = 750;

export default function EgonCopyPaste(eventBus, propertyCopy) {
  eventBus.on("copyPaste.copyElement", LOW_PRIORITY, function (context) {
    const descriptor = context.descriptor,
      element = context.element;

    const businessObject = (descriptor.oldBusinessObject =
      getBusinessObject(element));

    descriptor.type = element.type;

    copyProperties(businessObject, descriptor, "name");

    if (isLabel(descriptor)) {
      return descriptor;
    }
  });

  let references;

  function resolveReferences(descriptor, cache) {
    const businessObject = getBusinessObject(descriptor);

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
          const element = reference.element,
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

  eventBus.on(EVENT_COPY_PASE_PASTE_ELEMENTS, function () {
    references = {};
  });

  eventBus.on(EVENT_COPY_PASE_PASTE_ELEMENT, function (context) {
    const cache = context.cache,
      descriptor = context.descriptor,
      oldBusinessObject = descriptor.oldBusinessObject;
    let newBusinessObject;

    // do NOT copy business object if external label
    if (isLabel(descriptor)) {
      descriptor.businessObject = getBusinessObject(
        cache[descriptor.labelTarget],
      );

      return;
    }

    newBusinessObject = {};

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
