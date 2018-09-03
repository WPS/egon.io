import Modeler from 'bpmn-js/lib/Modeler';
import ResizeModule from 'diagram-js/lib/features/resize';


import {
  assign,
  isArray
} from 'min-dash';

import inherits from 'inherits';

import DomainStoryModule from './domain-story';
import LabelEditingModule from './domain-story/label-editing';
import ModelingModule from './domain-story/modeling';


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
  var parentId = customElement.parent;
  delete customElement.children;
  delete customElement.parent;
  this._customElements.push(customElement);

  var canvas = this.get('canvas'),
      elementFactory = this.get('elementFactory');

  var customAttrs = assign({ businessObject: customElement }, customElement);
  var customShape = elementFactory.create('shape', customAttrs);

  if (isGroup(customElement)) {
    this._groupElements[customElement.id] = customShape;
  }

  if (parentId) {
    var parentShape = this._groupElements[parentId];

    if (isGroup(parentShape)) {
      return canvas.addShape(customShape, parentShape, parentShape.id);
    }
  }
  return canvas.addShape(customShape);
};

DomainStoryModeler.prototype._addCustomConnection = function(customElement) {

  this._customElements.push(customElement);

  var canvas = this.get('canvas'),
      elementFactory = this.get('elementFactory'),
      elementRegistry = this.get('elementRegistry');

  var customAttrs = assign({ businessObject: customElement }, customElement);

  var connection = elementFactory.create('connection', assign(customAttrs, {
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

  var shapes = [],
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

var initialDiagram =
  '<?xml version="1.0" encoding="UTF-8"?>' +
  // '<xmlns:domainStory="http://wps.de/DomainstoryTelling">' +
  '<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
  'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
  'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" ' +
  'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" ' +
  'targetNamespace="http://bpmn.io/schema/bpmn" ' +
  'xmlns:domainStory="http://wps.de/DomainstoryTelling" ' +
  'id="Definitions_1">' +
  '<bpmn:process id="Process_1" isExecutable="false">' +
  '<bpmn:startEvent id="StartEvent_1"/>' +
  '</bpmn:process>' +
  '<bpmndi:BPMNDiagram id="BPMNDiagram_1">' +
  '<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">' +
  '</bpmndi:BPMNPlane>' +
  '</bpmndi:BPMNDiagram>' +
  '</bpmn:definitions>';

DomainStoryModeler.prototype.createDiagram = function(done) {
  return this.importXML(initialDiagram, done);
};

function isConnection(element) {
  return element.type === 'domainStory:activity' || element.type === 'domainStory:connection';
}

function isGroup(element) {
  return element && element.type === 'domainStory:group';
}

