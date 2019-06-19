'use strict';

import {
  setLabel,
  getLabel,
  setNumber,
  getNumber
} from './DSLabelUtil';

import {
  getExternalLabelMid,
  isLabelExternal,
  hasExternalLabel,
  isLabel
} from 'bpmn-js/lib/util/LabelUtil';

import {
  getBusinessObject,
  is
} from 'bpmn-js/lib/util/ModelUtil';
import { TEXTANNOTATION } from '../../language/elementTypes';

const NULL_DIMENSIONS = {
  width: 0,
  height: 0
};


/**
 * a handler that updates the text of a BPMN element.
 */
export default function DSUpdateLabelHandler(modeling, textRenderer, commandStack) {

  commandStack.registerHandler('element.updateCustomLabel',handlerFunction);

  function handlerFunction() {

    /**
   * Set the label and return the changed elements.
   *
   * Element parameter can be label itself or connection (i.e. sequence flow).
   *
   * @param {djs.model.Base} element
   * @param {String} text
   */

    this.preExecute = function(ctx) {
      let element = ctx.element,
          businessObject = element.businessObject,
          newLabel = ctx.newLabel,
          newNumber=ctx.newNumber;

      if (!isLabel(element)
        && isLabelExternal(element)
        && !hasExternalLabel(element)
        && (newLabel !== '' || newNumber !== '')) {

        // create label
        let paddingTop = 7;

        let labelCenter = getExternalLabelMid(element);

        labelCenter = {
          x: labelCenter.x,
          y: labelCenter.y + paddingTop
        };

        modeling.createLabel(element, labelCenter, {
          id: businessObject.id + '_label',
          businessObject: businessObject
        });
      }
    };

    this.execute = function(ctx) {
      ctx.oldLabel = getLabel(ctx.element);
      ctx.oldNumber= getNumber(ctx.element);
      return setText(ctx.element, ctx.newLabel, ctx.newNumber);
    };

    this.revert = function(ctx) {
      return setText(ctx.element, ctx.oldLabel, ctx.oldNumber);
    };

    this.postExecute = function(ctx) {
      let element = ctx.element,
          label = element.label || element,
          newLabel = ctx.newLabel,
          newBounds = ctx.newBounds;

      if (isLabel(label) && newLabel.trim() === '') {
        modeling.removeShape(label);

        return;
      }

      // ignore internal labels for elements except text annotations
      if (!isLabelExternal(element) && !is(element, TEXTANNOTATION)) {
        return;
      }

      let bo = getBusinessObject(label);

      let text = bo.name || bo.text;

      // don't resize without text
      if (!text) {
        return;
      }

      // resize element based on label _or_ pre-defined bounds
      if (typeof newBounds === 'undefined') {
        newBounds = textRenderer.getLayoutedBounds(label, text);
      }

      // setting newBounds to false or _null_ will
      // disable the postExecute resize operation
      if (newBounds) {
        modeling.resizeShape(label, newBounds, NULL_DIMENSIONS);
      }
    };
  }
}

function setText(element, text, textNumber) {

  // external label if present
  let label = element.label || element;

  let number= element.number || element;

  let labelTarget = element.labelTarget || element;

  let numberTarget= element.numberTarget || element;
  setLabel(label, text);
  setNumber(number, textNumber);

  return [ label, labelTarget, number, numberTarget ];
}

DSUpdateLabelHandler.$inject = [
  'modeling',
  'textRenderer',
  'commandStack'
];