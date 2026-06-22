"use strict";

import { EVENT_ELEMENT_CHANGED } from "../diagramJSConstants";

export default function DSMassRenameHandler(commandStack, eventBus) {
  commandStack.registerHandler("domainStoryObjects.massRename", massRename);

  function massRename(modeling) {
    this.preExecute = function (context) {
      let relevantElements = context.elements;

      context.oldLabel = relevantElements[0].businessObject.name;

      relevantElements.forEach((element) => {
        modeling.updateLabel(element.businessObject, confirm.newValue);
      });
    };

    this.execute = function (context) {
      let relevantElements = context.elements;
      relevantElements.forEach((element) => {
        let semantic = element.businessObject;
        semantic.name = context.newValue;

        eventBus.fire(EVENT_ELEMENT_CHANGED, { element });
      });
    };

    this.revert = function (context) {
      let relevantElements = context.elements;
      relevantElements.forEach((element) => {
        let semantic = element.businessObject;
        semantic.name = context.oldLabel;

        eventBus.fire(EVENT_ELEMENT_CHANGED, { element });
      });
    };
  }
}
