"use strict";

import { assign } from "min-dash";

import inherits from "inherits";

import BaseElementFactory from "diagram-js/lib/core/ElementFactory";

import DomainStoryIdFactory from "./domainStoryIdFactory";
import { ElementTypes } from "src/app/domain/entities/elementTypes";

export default function DomainStoryElementFactory() {
  let self = this;
  let domainStoryIdFactory = new DomainStoryIdFactory();

  /**
   * create a diagram-js element
   *
   * @param  {String} djsElementType
   * @param  {Object} attrs
   *
   * @return {djs.model.Base}
   */
  this.create = function (djsElementType, attrs) {
    let dstElementType = attrs.type;

    if (!attrs.businessObject) {
      attrs.businessObject = {
        type: dstElementType,
        name: attrs.name ? attrs.name : "",
      };
    }

    if (attrs.id) {
      domainStoryIdFactory.registerId(attrs.id);
    } else {
      attrs.id = domainStoryIdFactory.getId(djsElementType);
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
    if (djsElementType === "shape") {
      let alreadyHasSize = attrs.height || attrs.width; // if a story is imported, groups and annotations already have dimensions; we must not overwrite them with default values

      if (!alreadyHasSize) {
        assign(attrs, self._getShapeSize(dstElementType));
      }
    }

    if (!("$instanceOf" in attrs.businessObject)) {
      // ensure we can use ModelUtil#is for type checks
      Object.defineProperty(attrs.businessObject, "$instanceOf", {
        value: function (type) {
          return this.type === type;
        },
      });
    }

    return self.baseCreate(djsElementType, attrs);
  };
}

inherits(DomainStoryElementFactory, BaseElementFactory);

DomainStoryElementFactory.prototype.baseCreate =
  BaseElementFactory.prototype.create;

/**
 * returns the default size for shapes.
 * *
 * @param {String} dstElementType
 *
 * @return {width, height} object representing the size of the element
 */
DomainStoryElementFactory.prototype._getShapeSize = function (dstElementType) {
  let shapes = {
    __default: { width: 75, height: 75 },
    [ElementTypes.TEXTANNOTATION]: { width: 100, height: 30 },
    [ElementTypes.GROUP]: { width: 300, height: 200 },
  };

  return shapes[dstElementType] || shapes.__default;
};
