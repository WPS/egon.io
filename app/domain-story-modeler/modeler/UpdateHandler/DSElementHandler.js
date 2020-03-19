'use strict';

export default function DSElementHandler(commandStack, eventBus, modeling) {

  commandStack.registerHandler('element.colorChange', element_colorChange);
  commandStack.registerHandler('shape.removeGroupWithChildren', removeGroupWithChildren);

  function element_colorChange() {
    this.preExecute = function(context) {
      context.oldColor= context.businessObject.pickedColor;
    };

    this.execute = function(context) {
      let semantic = context.businessObject;
      let element = context.element;

      semantic.pickedColor = context.newColor;

      eventBus.fire('element.changed', { element });
    };

    this.revert = function(context) {
      let semantic = context.businessObject;
      let element = context.element;

      semantic.pickedColor = context.oldColor;

      eventBus.fire('element.changed', { element });

    };
  }

  function removeGroupWithChildren() {
    this.preExecute = function(ctx) {
      ctx.parent = ctx.element.parent;
    };

    this.execute = function(ctx) {
      let element = ctx.element;

      eventBus.fire('element.changed', { element });
    };

    this.revert = function(ctx) {
      let element = ctx.element;

      eventBus.fire('element.changed', { element });
    };

  }
}