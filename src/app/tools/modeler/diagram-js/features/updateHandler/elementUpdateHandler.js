"use strict";

import { undoGroupRework } from "../util/util";
import { ElementTypes } from "../../../../../domain/entities/elementTypes";
import {
  ELEMENT_COLOR_CHANGE_EVENT,
  EVENT_ELEMENT_CHANGED,
  EVENT_SHAPE_ADDED,
  EVENT_SHAPE_REMOVED,
  SHAPE_REMOVE_GROUP_WITHOUT_CHILDREN_EVENT,
} from "../diagramJSConstants";

export default function elementUpdateHandler(commandStack, eventBus) {
  commandStack.registerHandler(ELEMENT_COLOR_CHANGE_EVENT, element_colorChange);
  commandStack.registerHandler(
    SHAPE_REMOVE_GROUP_WITHOUT_CHILDREN_EVENT,
    removeGroupWithoutChildren,
  );

  function element_colorChange() {
    this.preExecute = function (context) {
      context.oldColor = context.businessObject.pickedColor;
    };

    this.execute = function (context) {
      let semantic = context.businessObject;
      let element = context.element;

      if (
        semantic.type.includes(ElementTypes.TEXTANNOTATION) &&
        element.incoming[0]
      ) {
        element.incoming[0].businessObject.pickedColor = context.newColor;
        eventBus.fire(EVENT_ELEMENT_CHANGED, { element: element.incoming[0] });
      }

      semantic.pickedColor = context.newColor;

      eventBus.fire(EVENT_ELEMENT_CHANGED, { element });
    };

    this.revert = function (context) {
      let semantic = context.businessObject;
      let element = context.element;

      if (
        semantic.type.includes(ElementTypes.TEXTANNOTATION) &&
        element.incoming[0]
      ) {
        element.incoming[0].businessObject.pickedColor = context.oldColor;
        eventBus.fire(EVENT_ELEMENT_CHANGED, { element: element.incoming[0] });
      }

      semantic.pickedColor = context.oldColor;

      eventBus.fire(EVENT_ELEMENT_CHANGED, { element });
    };
  }

  function removeGroupWithoutChildren() {
    this.preExecute = function (ctx) {
      ctx.parent = ctx.element.parent;
      ctx.children = ctx.element.children.slice();
    };

    this.execute = function (ctx) {
      let element = ctx.element;
      ctx.children.forEach((child) => {
        undoGroupRework(element, child);
        eventBus.fire(EVENT_ELEMENT_CHANGED, { element: child });
      });
      eventBus.fire(EVENT_SHAPE_REMOVE, { element });
    };

    this.revert = function (ctx) {
      let element = ctx.element;
      eventBus.fire(EVENT_SHAPE_ADDED, { element });

      ctx.element.children.forEach((child) => {
        reworkGroupElements(element, child);
      });
    };
  }
}
