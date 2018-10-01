'use strict';

export default function DomainStoryLabelChangeHandlers(commandStack, eventBus) {

  commandStack.registerHandler('domainStoryObjects.massRename',massRename);

  function massRename(modeling) {

    this.preExecute = function(context) {
      var relevantElements = context.elements;

      context.oldLabel = relevantElements[0].businessObject.name;

      relevantElements.forEach(element => {
        modeling.updateLabel(element.businessObject, confirm.newValue);
      });
    };

    this.execute = function(context) {
      var relevantElements = context.elements;
      relevantElements.forEach(element =>{
        var semantic=element.businessObject;
        semantic.name=context.newValue;

        eventBus.fire('element.changed', { element });
      });
    };

    this.revert = function(context) {
      var relevantElements = context.elements;
      relevantElements.forEach(element =>{
        var semantic=element.businessObject;
        semantic.name=context.oldLabel;

        eventBus.fire('element.changed', { element });
      });
    };
  }
}