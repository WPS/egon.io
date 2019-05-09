'use strict';

import Modeler from 'bpmn-js/lib/Modeler';
import ResizeModule from 'diagram-js/lib/features/resize';


import {
  assign,
  isArray
} from 'min-dash';

import inherits from 'inherits';

import DomainStoryModule from './modeler';
import LabelEditingModule from './features/labeling';
import ModelingModule from './features/modeling';
import { ACTIVITY, CONNECTION, GROUP } from './language/elementTypes';


export default function DomainStoryModeler(options) {
  Modeler.call(this, options);

  this._customElements = [];
  this._groupElements = [];
}

inherits(DomainStoryModeler, Modeler);

DomainStoryModeler.prototype._modules = [].concat(
  DomainStoryModeler.prototype._modules,
  [
    DomainStoryModule,
    LabelEditingModule,
    ModelingModule
  ],
  [ResizeModule]
);

/**
 * add a single custom element to the underlying diagram
 *
 * @param {Object} customElement
 */
DomainStoryModeler.prototype._addCustomShape = function(customElement) {
  let parentId = customElement.parent;
  delete customElement.children;
  delete customElement.parent;
  this._customElements.push(customElement);

  let canvas = this.get('canvas'),
      elementFactory = this.get('elementFactory');

  let customAttrs = assign({ businessObject: customElement }, customElement);
  let customShape = elementFactory.create('shape', customAttrs);

  if (isGroup(customElement)) {
    this._groupElements[customElement.id] = customShape;
  }

  if (parentId) {
    let parentShape = this._groupElements[parentId];

    if (isGroup(parentShape)) {
      return canvas.addShape(customShape, parentShape, parentShape.id);
    }
  }
  return canvas.addShape(customShape);
};

DomainStoryModeler.prototype._addCustomConnection = function(customElement) {

  this._customElements.push(customElement);

  let canvas = this.get('canvas'),
      elementFactory = this.get('elementFactory'),
      elementRegistry = this.get('elementRegistry');

  let customAttrs = assign({ businessObject: customElement }, customElement);

  let connection = elementFactory.create('connection', assign(customAttrs, {
    source: elementRegistry.get(customElement.source),
    target: elementRegistry.get(customElement.target)
  }),
  elementRegistry.get(customElement.source).parent);

  return canvas.addConnection(connection);

};

DomainStoryModeler.prototype.importCustomElements = function(elements) {


  this.get('eventBus').fire('diagram.clear', {});
  this._customElements = [];
  this._groupElements = [];

  this.addCustomElements(elements);
};


/**
 * add a number of custom elements and connections to the underlying diagram.
 *
 * @param {Array<Object>} customElements
 */
DomainStoryModeler.prototype.addCustomElements = function(customElements) {

  if (!isArray(customElements)) {
    throw new Error('argument must be an array');
  }

  let shapes = [],
      connections = [],
      groups = [];

  customElements.forEach(function(customElement) {
    if (isConnection(customElement)) {
      connections.push(customElement);
    } else if (isGroup(customElement)) {
      groups.push(customElement);
    } else {
      shapes.push(customElement);
    }
  });

  // add groups before shapes and shapes before connections so that connections
  // can already rely on the shapes being part of the diagram
  groups.forEach(this._addCustomShape, this);
  shapes.forEach(this._addCustomShape, this);
  connections.forEach(this._addCustomConnection, this);
};

/**
 * get custom elements with their current status.
 *
 * @return {Array<Object>} custom elements on the diagram
 */
DomainStoryModeler.prototype.getCustomElements = function() {
  return this._customElements;
};

// override standard fucntion to prevent default elements on canvas
DomainStoryModeler.prototype.createDiagram = function(done) {
};

function isConnection(element) {
  return element.type === ACTIVITY || element.type === CONNECTION;
}

function isGroup(element) {
  return element && element.type === GROUP;
}

