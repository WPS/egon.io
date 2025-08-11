'use strict';

import { undoGroupRework } from '../util/util';
import { ElementTypes } from '../../../../../domain/entities/elementTypes';

export default function elementUpdateHandler(commandStack, eventBus) {
  commandStack.registerHandler('element.colorChange', element_colorChange);
  commandStack.registerHandler(
    'shape.removeGroupWithoutChildren',
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
        eventBus.fire('element.changed', { element: element.incoming[0] });
      }

      semantic.pickedColor = context.newColor;

      eventBus.fire('element.changed', { element });
    };

    this.revert = function (context) {
      let semantic = context.businessObject;
      let element = context.element;

      if (
        semantic.type.includes(ElementTypes.TEXTANNOTATION) &&
        element.incoming[0]
      ) {
        element.incoming[0].businessObject.pickedColor = context.oldColor;
        eventBus.fire('element.changed', { element: element.incoming[0] });
      }

      semantic.pickedColor = context.oldColor;

      eventBus.fire('element.changed', { element });
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
        eventBus.fire('element.changed', { element: child });
      });
      eventBus.fire('shape.remove', { element });
    };

    this.revert = function (ctx) {
      let element = ctx.element;
      eventBus.fire('shape.added', { element });

      ctx.element.children.forEach((child) => {
        reworkGroupElements(element, child);
      });
    };
  }
}
