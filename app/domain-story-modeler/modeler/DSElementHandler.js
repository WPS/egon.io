'use strict';

export default function DSElementHandler(commandStack, eventBus) {

  commandStack.registerHandler('element.colorChange', element_colorChange);

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
}