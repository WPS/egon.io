import {
  forEach,
  isArray,
  isDefined,
  isObject,
  reduce,
  has,
  sortBy,
} from "min-dash";

var DISALLOWED_PROPERTIES = ["incoming", "outgoing"];

export default function PropertyCopy(eventBus) {
  this._eventBus = eventBus;

  // copy extension elements last
  eventBus.on("propertyCopy.canCopyProperties", function (context) {
    var propertyNames = context.propertyNames;

    if (!propertyNames || !propertyNames.length) {
      return;
    }

    return sortBy(propertyNames, function (propertyName) {
      return propertyName === "extensionElements";
    });
  });

  // default check whether property can be copied
  eventBus.on("propertyCopy.canCopyProperty", function (context) {
    var propertyName = context.propertyName;

    if (propertyName && DISALLOWED_PROPERTIES.indexOf(propertyName) !== -1) {
      // disallow copying property
      return false;
    }
  });
}

PropertyCopy.$inject = ["eventBus"];

PropertyCopy.prototype.copyElement = function (
  sourceElement,
  targetElement,
  propertyNames,
) {
  var self = this;

  if (propertyNames && !isArray(propertyNames)) {
    propertyNames = [propertyNames];
  }

  var canCopyProperties = this._eventBus.fire(
    "propertyCopy.canCopyProperties",
    {
      propertyNames: propertyNames,
      sourceElement: sourceElement,
      targetElement: targetElement,
    },
  );

  if (canCopyProperties === false) {
    return targetElement;
  }

  if (isArray(canCopyProperties)) {
    propertyNames = canCopyProperties;
  }

  // copy properties
  forEach(propertyNames, function (propertyName) {
    var sourceProperty;

    if (has(sourceElement, propertyName)) {
      sourceProperty = sourceElement.get(propertyName);
    }

    var copiedProperty = self.copyProperty(
      sourceProperty,
      targetElement,
      propertyName,
    );

    var canSetProperty = self._eventBus.fire(
      "propertyCopy.canSetCopiedProperty",
      {
        parent: targetElement,
        property: copiedProperty,
        propertyName: propertyName,
      },
    );

    if (canSetProperty === false) {
      return;
    }

    if (isDefined(copiedProperty)) {
      targetElement.set(propertyName, copiedProperty);
    }
  });

  return targetElement;
};

PropertyCopy.prototype.copyProperty = function (
  property,
  parent,
  propertyName,
) {
  var self = this;

  // allow others to copy property
  var copiedProperty = this._eventBus.fire("propertyCopy.canCopyProperty", {
    parent: parent,
    property: property,
    propertyName: propertyName,
  });

  // return if copying is NOT allowed
  if (copiedProperty === false) {
    return;
  }

  if (copiedProperty) {
    if (isObject(copiedProperty) && !copiedProperty.$parent) {
      copiedProperty.$parent = parent;
    }

    return copiedProperty;
  }

  // copy arrays
  if (isArray(property)) {
    return reduce(
      property,
      function (childProperties, childProperty) {
        // recursion
        copiedProperty = self.copyProperty(childProperty, parent, propertyName);

        // copying might NOT be allowed
        if (copiedProperty) {
          copiedProperty.$parent = parent;

          return childProperties.concat(copiedProperty);
        }

        return childProperties;
      },
      [],
    );
  }

  // copy model elements
  if (isObject(property)) {
    copiedProperty = {};

    copiedProperty.$parent = parent;

    // recursion
    copiedProperty = self.copyElement(property, copiedProperty);

    return copiedProperty;
  }

  // copy primitive properties
  return property;
};
