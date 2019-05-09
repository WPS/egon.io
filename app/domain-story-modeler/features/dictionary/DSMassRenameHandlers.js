'use strict';

export default function DSMassRenameHandler(commandStack, eventBus) {

  commandStack.registerHandler('domainStoryObjects.massRename',massRename);

  function massRename(modeling) {

    this.preExecute = function(context) {
      let relevantElements = context.elements;

      context.oldLabel = relevantElements[0].businessObject.name;

      relevantElements.forEach(element => {
        modeling.updateLabel(element.businessObject, confirm.newValue);
      });
    };

    this.execute = function(context) {
      let relevantElements = context.elements;
      relevantElements.forEach(element =>{
        let semantic=element.businessObject;
        semantic.name=context.newValue;

        eventBus.fire('element.changed', { element });
      });
    };

    this.revert = function(context) {
      let relevantElements = context.elements;
      relevantElements.forEach(element =>{
        let semantic=element.businessObject;
        semantic.name=context.oldLabel;

        eventBus.fire('element.changed', { element });
      });
    };
  }
}