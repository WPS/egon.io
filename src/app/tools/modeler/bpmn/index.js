import BaseViewer from "../diagram-js";
import ResizeModule from "diagram-js/lib/features/resize";
import { assign, isArray } from "min-dash";
import inherits from "inherits";

import DomainStoryModule from "./modeler";
import LabelEditingModule from "./modeler/labeling";
import ModelingModule from "./modeler/modeling";
import { ElementTypes } from "../../../domain/entities/elementTypes";

import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas';
import KeyboardMoveModule from 'diagram-js/lib/navigation/keyboard-move';
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";

import MoveModule from "diagram-js/lib/features/move";
import Bendpoints from "diagram-js/lib/features/bendpoints";
import ConnectionPreview from "diagram-js/lib/features/connection-preview";
import CopyPaste from "diagram-js/lib/features/copy-paste";
import SpaceToolModule from "diagram-js/lib/features/space-tool";
import LassoToolModule from "diagram-js/lib/features/lasso-tool";
import ConnectModule from "diagram-js/lib/features/connect";
import KeyboardModule from "diagram-js/lib/features/keyboard";
import EditorActionsModule from "diagram-js/lib/features/editor-actions";

export default function DomainStoryModeler(options) {
  BaseViewer.call(this, options);
  this._customElements = [];
  this._groupElements = [];
}

inherits(DomainStoryModeler, BaseViewer);

DomainStoryModeler.prototype._modules = [].concat(
  [DomainStoryModule, LabelEditingModule, ModelingModule],
  [ResizeModule],
  [SpaceToolModule, LassoToolModule],
  [MoveCanvasModule, KeyboardMoveModule, ZoomScrollModule], // Navigation on Canvas
  [MoveModule, Bendpoints, ConnectionPreview, CopyPaste, ConnectModule], // Move/Create/Alter Elements
  [KeyboardModule, EditorActionsModule]
);

/**
 * add a single custom element to the underlying diagram
 *
 * @param {Object} customElement
 */
DomainStoryModeler.prototype._addCustomShape = function (customElement) {
  let parentId = customElement.parent;
  delete customElement.children;
  delete customElement.parent;
  this._customElements.push(customElement);

  let canvas = this.get("canvas"),
    elementFactory = this.get("elementFactory");

  let customAttrs = assign({ businessObject: customElement }, customElement);
  let customShape = elementFactory.create("shape", customAttrs);

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

DomainStoryModeler.prototype._addCustomConnection = function (customElement) {
  this._customElements.push(customElement);

  let canvas = this.get("canvas"),
    elementFactory = this.get("elementFactory"),
    elementRegistry = this.get("elementRegistry");

  let customAttrs = assign({ businessObject: customElement }, customElement);

  let connection = elementFactory.create(
    "connection",
    assign(customAttrs, {
      source: elementRegistry.get(customElement.source),
      target: elementRegistry.get(customElement.target),
    }),
    elementRegistry.get(customElement.source).parent,
  );

  return canvas.addConnection(connection);
};

//** We import BusinessObjects, not the whole Canvas Object!!!!!!!!
DomainStoryModeler.prototype.importCustomElements = function (elements) {
  this.get("eventBus").fire("diagram.clear", {});
  this._customElements = [];
  this._groupElements = [];

  this.addCustomElements(elements);
};

/**
 * add a number of custom elements and connections to the underlying diagram.
 *
 * @param {Array<Object>} customElements
 */
DomainStoryModeler.prototype.addCustomElements = function (customElements) {
  if (!isArray(customElements)) {
    throw new Error("argument must be an array");
  }

  let shapes = [],
    connections = [],
    groups = [];

  customElements.forEach(function (customElement) {
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
DomainStoryModeler.prototype.getCustomElements = function () {
  return this._customElements;
};

function isConnection(element) {
  return (
    element.type === ElementTypes.ACTIVITY ||
    element.type === ElementTypes.CONNECTION
  );
}

function isGroup(element) {
  return element && element.type === ElementTypes.GROUP;
}
