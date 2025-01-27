"use strict";

import { assign } from "min-dash";

import inherits from "inherits";

import BaseElementFactory from "diagram-js/lib/core/ElementFactory";

import DomainStoryIdFactory from "./domainStoryIdFactory";
import { ElementTypes } from "src/app/domain/entities/elementTypes";

const DEFAULT_LABEL_SIZE = {
  width: 90,
  height: 20,
};

export default function DomainStoryElementFactory() {
  let self = this;
  let domainStoryIdFactory = new DomainStoryIdFactory();

  /**
   * create a diagram-js element with the given type (any of shape, connection, label).
   *
   * @param  {String} elementType
   * @param  {Object} attrs
   *
   * @return {djs.model.Base}
   */
  this.create = function (elementType, attrs) {
    let type = attrs.type;

    if (elementType === "label") {
      return self.baseCreate(
        elementType,
        assign({ type: "label" }, DEFAULT_LABEL_SIZE, attrs),
      );
    }

    // add type to businessObject if custom
    if (/^domainStory:/.test(type)) {
      if (!attrs.businessObject) {
        attrs.businessObject = {
          type: type,
          name: attrs.name ? attrs.name : "",
        };
      }

      if (attrs.id) {
        domainStoryIdFactory.registerId(attrs.id);
      } else {
        attrs.id = domainStoryIdFactory.getId(elementType);
      }
      assign(attrs.businessObject, {
        id: attrs.id,
      });

      let id = attrs.id;
      attrs.businessObject.get = function (key) {
        if (key === "id") {
          return id;
        }
      };
      attrs.businessObject.set = function (key, value) {
        if (key === "id") {
          assign(attrs.businessObject, { id: value });
        }
      };

      // add width and height if shape
      if (
        (!/:activity$/.test(type) || !/:connection$/.test(type)) &&
        !((/:group$/.test(type) && attrs.height) || attrs.width)
      ) {
        assign(attrs, self._getCustomElementSize(type));
      }

      if (!("$instanceOf" in attrs.businessObject)) {
        // ensure we can use ModelUtil#is for type checks
        Object.defineProperty(attrs.businessObject, "$instanceOf", {
          value: function (type) {
            return this.type === type;
          },
        });
      }

      return self.baseCreate(elementType, attrs);
    }
  };
}

inherits(DomainStoryElementFactory, BaseElementFactory);

DomainStoryElementFactory.prototype.baseCreate =
  BaseElementFactory.prototype.create;

/**
 * returns the default size of custom shapes.
 * *
 * @param {String} type
 *
 * @return {Dimensions} a {width, height} object representing the size of the element
 */
DomainStoryElementFactory.prototype._getCustomElementSize = function (type) {
  let shapes = {
    __default: { width: 75, height: 75 },
    [ElementTypes.TEXTANNOTATION]: { width: 100, height: 30 },
    [ElementTypes.GROUP]: { width: 300, height: 200 },
  };

  return shapes[type] || shapes.__default;
};

class Dimensions {
  width;
  height;
}
