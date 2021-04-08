'use strict';

import {
  assign
} from 'min-dash';

import inherits from 'inherits';

import BpmnElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';

import { DEFAULT_LABEL_SIZE } from 'bpmn-js/lib/util/LabelUtil';

import DomainStoryIdFactory from './DomainStoryIdFactory';

/**
 * A custom factory that knows how to create BPMN _and_ custom elements.
 */
export default function DomainStoryElementFactory(bpmnFactory, moddle) {
  BpmnElementFactory.call(this, bpmnFactory, moddle);

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
  this.create = function(elementType, attrs) {
    let type = attrs.type;

    if (elementType === 'label') {
      return self.baseCreate(elementType, assign({ type: 'label' }, DEFAULT_LABEL_SIZE, attrs));
    }

    // add type to businessObject if custom
    if (/^domainStory:/.test(type)) {

      if (!attrs.businessObject) {
        attrs.businessObject = {
          type: type,
          name: attrs.name ? attrs.name : ''
        };
      }

      if (attrs.id) {
        domainStoryIdFactory.registerId(attrs.id);
      } else {
        attrs.id = domainStoryIdFactory.getId(elementType);
      }
      assign(attrs.businessObject, {
        id: attrs.id
      });

      let id = attrs.id;
      attrs.businessObject.get = function(key) {
        if (key == 'id') {
          return id;
        }
      };
      attrs.businessObject.set = function(key, value) {
        if (key == 'id') {
          assign(attrs.businessObject, { id: value });
        }
      };

      if (!attrs.businessObject.$type) {
        assign(attrs.businessObject, { $type: 'Element' });
      }
      assign(attrs.businessObject, { di: {} });
      if (!attrs.businessObject.$descriptor) {
        assign(attrs.businessObject, { $descriptor: {} });
      }

      // add width and height if shape
      if ((!/:activity$/.test(type) || !/:connection$/.test(type)) && !(/:group$/.test(type) && attrs.height || attrs.width)) {
        assign(attrs, self._getCustomElementSize(type));
      }

      if (!('$instanceOf' in attrs.businessObject)) {

        // ensure we can use ModelUtil#is for type checks
        Object.defineProperty(attrs.businessObject, '$instanceOf', {
          value: function(type) {
            return this.type === type;
          }
        });
      }

      return self.baseCreate(elementType, attrs);
    }

    return self.createBpmnElement(elementType, attrs);
  };
}

inherits(DomainStoryElementFactory, BpmnElementFactory);

DomainStoryElementFactory.$inject = [
  'bpmnFactory',
  'moddle'
];


/**
 * returns the default size of custom shapes.
 *
 * the following example shows an interface on how
 * to setup the custom shapes's dimensions.
 * *
 * @param {String} type
 *
 * @return {Dimensions} a {width, height} object representing the size of the element
 */
DomainStoryElementFactory.prototype._getCustomElementSize = function(type) {
  let shapes = {
    __default: { width: 75, height: 75 },
    'domainStory:textAnnotation': { width: 100, height: 30 },
    'domainStory:group': { width: 525, height: 275 }
  };

  return shapes[type] || shapes.__default;
};
