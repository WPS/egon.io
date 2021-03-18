'use strict';

import { assign } from 'min-dash';

/**
 * service that allow replacing of elements.
 */
export default function Replace(modeling) {

  this._modeling = modeling;

}

/**
 * @param {Element} oldElement - element to be replaced
 * @param {Object}  newElementData - containing information about the new Element, for example height, width, type.
 * @param {Object}  options - custom options that will be attached to the context. It can be used to inject data
 *                            that is needed in the command chain. For example it could be used in
 *                            eventbus.on('commandStack.shape.replace.postExecute') to change shape attributes after
 *                            shape creation.
 */
function replaceElement(oldElement, newElementData, modeling) {

  // let modeling = this._modeling;

  let newElement = setCenterOfElement(newElementData, oldElement, newElement, modeling);
  let outgoingActivities = newElement.outgoing;
  let incomingActivties = newElement.incoming;

  outgoingActivities.forEach(element => {
    element.businessObject.source = newElement.id;
  });

  incomingActivties.forEach(element => {
    element.businessObject.target = newElement.id;
  });

  return newElement;
}

function setCenterOfElement(newElementData, oldElement, newElement, modeling) {
  newElementData.x = Math.ceil(oldElement.x + (newElementData.width || oldElement.width) / 2);
  newElementData.y = Math.ceil(oldElement.y + (newElementData.height || oldElement.height) / 2);

  assign(newElementData, { name: oldElement.businessObject.name });

  return modeling.replaceShape(oldElement, newElementData, {});
}


Replace.prototype.replaceElement = replaceElement;