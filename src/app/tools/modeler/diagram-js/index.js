import BaseViewer from "./BaseViewer";
import ResizeModule from "diagram-js/lib/features/resize";
import { assign, isArray } from "min-dash";
import inherits from "inherits";

import DomainStoryModule from "./features";
import LabelEditingModule from "./features/labeling";
import ModelingModule from "./features/modeling";
import { ElementTypes } from "../../../domain/entities/elementTypes";

import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import KeyboardMoveModule from "diagram-js/lib/navigation/keyboard-move";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";

import MoveModule from "diagram-js/lib/features/move";
import Bendpoints from "diagram-js/lib/features/bendpoints";
import ConnectionPreview from "diagram-js/lib/features/connection-preview";
import CopyPasteModule from "./features/copyPaste";
import SpaceToolModule from "diagram-js/lib/features/space-tool";
import LassoToolModule from "diagram-js/lib/features/lasso-tool";
import HandToolModule from "diagram-js/lib/features/hand-tool";
import ConnectModule from "diagram-js/lib/features/connect";
import KeyboardModule from "diagram-js/lib/features/keyboard";
import EditorActionsModule from "diagram-js/lib/features/editor-actions";
import SnappingModule from "diagram-js/lib/features/snapping";
import AdditionalShortcuts from "./features/shortcuts";
import minimapModule from "diagram-js-minimap";
import AlignToOrigin from "@bpmn-io/align-to-origin";

export default function DomainStoryModeler(options) {
  BaseViewer.call(this, options);
  this._elements = [];
  this._groupElements = [];
}

inherits(DomainStoryModeler, BaseViewer);

DomainStoryModeler.prototype._modules = [].concat(
  [DomainStoryModule, LabelEditingModule, ModelingModule],
  [ResizeModule],
  [SpaceToolModule, LassoToolModule, HandToolModule],
  [MoveCanvasModule, KeyboardMoveModule, ZoomScrollModule], // Navigation on Canvas
  [MoveModule, Bendpoints, ConnectionPreview, CopyPasteModule, ConnectModule], // Move/Create/Alter Elements
  [KeyboardModule, EditorActionsModule, AdditionalShortcuts], // Shortcuts
  [SnappingModule], // Alignment
  [AlignToOrigin], // places diagram in the lower right quadrant (+x/+y) of the canvas
  [minimapModule],
);

DomainStoryModeler.prototype._createElementFromBusinessObject = function (bo) {
  let parentId = bo.parent;
  delete bo.children;
  delete bo.parent;
  this._elements.push(bo);

  let canvas = this.get("canvas"),
    elementFactory = this.get("elementFactory");

  let attributes = assign({ businessObject: bo }, bo);
  let shape = elementFactory.create("shape", attributes);

  if (isOfTypeGroup(bo)) {
    this._groupElements[bo.id] = shape;
  }

  if (parentId) {
    let parentShape = this._groupElements[parentId];

    if (isOfTypeGroup(parentShape)) {
      return canvas.addShape(shape, parentShape, parentShape.id);
    }
  }
  return canvas.addShape(shape);
};

DomainStoryModeler.prototype._addConnection = function (element) {
  this._elements.push(element);

  let canvas = this.get("canvas"),
    elementFactory = this.get("elementFactory"),
    elementRegistry = this.get("elementRegistry");

  let attributes = assign({ businessObject: element }, element);

  let connection = elementFactory.create(
    "connection",
    assign(attributes, {
      source: elementRegistry.get(element.source),
      target: elementRegistry.get(element.target),
    }),
    elementRegistry.get(element.source).parent,
  );

  return canvas.addConnection(connection);
};

DomainStoryModeler.prototype.importBusinessObjects = function (
  businessObjects,
) {
  this.get("eventBus").fire("diagram.clear", {});
  this._elements = [];
  this._groupElements = [];

  if (!isArray(businessObjects)) {
    throw new Error("argument must be an array");
  }

  let connections = [],
    groups = [],
    otherElementTypes = [];

  businessObjects.forEach(function (bo) {
    if (isOfTypeConnection(bo)) {
      connections.push(bo);
    } else if (isOfTypeGroup(bo)) {
      groups.push(bo);
    } else {
      otherElementTypes.push(bo);
    }
  });

  // add groups before shapes and other element types before connections so that connections
  // can already rely on the shapes being part of the diagram
  groups.forEach(this._createElementFromBusinessObject, this);
  otherElementTypes.forEach(this._createElementFromBusinessObject, this);
  connections.forEach(this._addConnection, this);
};

/**
 * Make sure that the whole story is in the visible quadrant of the canvas.
 * To achieve this, the element coordinates are manipulated so that coordinate 0/0 is in the top left corner (avoids problems with HTML export)
 * Then, the canvas is scrolled and zoom level adjusted so that the whole story is visible.
 */
DomainStoryModeler.prototype.fitStoryToScreen = function () {
  this.get("alignToOrigin").align();
  this.get("canvas")._fitViewport({ x: 0, y: 0 });
};

function isOfTypeConnection(element) {
  return (
    element.type === ElementTypes.ACTIVITY ||
    element.type === ElementTypes.CONNECTION
  );
}

function isOfTypeGroup(element) {
  return element && element.type === ElementTypes.GROUP;
}
