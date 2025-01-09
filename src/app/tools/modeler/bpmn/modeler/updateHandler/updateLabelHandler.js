"use strict";

import {
  setLabel,
  getLabel,
  setNumber,
  getNumber,
} from "../labeling/dsLabelUtil";

import { ElementTypes } from "src/app/domain/entities/elementTypes";
import { getBusinessObject, is } from "../util";

const NULL_DIMENSIONS = {
  width: 0,
  height: 0,
};

/**
 * a handler that updates the text of a BPMN element.
 */
export default function UpdateLabelHandler(
  modeling,
  textRenderer,
  commandStack,
) {
  commandStack.registerHandler("element.updateCustomLabel", handlerFunction);

  function handlerFunction() {
    this.execute = function (ctx) {
      ctx.oldLabel = getLabel(ctx.element);
      ctx.oldNumber = getNumber(ctx.element);
      return setText(ctx.element, ctx.newLabel, ctx.newNumber);
    };

    this.revert = function (ctx) {
      return setText(ctx.element, ctx.oldLabel, ctx.oldNumber);
    };

    this.postExecute = function (ctx) {
      let element = ctx.element,
        label = element.label || element,
        newBounds = ctx.newBounds;

      // resize text annotation to amount of text that is entered
      if (is(element, ElementTypes.TEXTANNOTATION)) {
        let bo = getBusinessObject(label);

        let text = bo.name || bo.text;

        // don't resize without text
        if (!text) {
          return;
        }

        // resize element based on label _or_ pre-defined bounds
        if (typeof newBounds === "undefined") {
          newBounds = textRenderer.getLayoutedBounds(label, text);
        }

        // setting newBounds to false or _null_ will
        // disable the postExecute resize operation
        if (newBounds) {
          modeling.resizeShape(label, newBounds, NULL_DIMENSIONS);
        }
      }
    };
  }
}

function setText(element, text, textNumber) {
  let label = element.label || element;

  let number = element.number || element;

  let labelTarget = element.labelTarget || element;

  let numberTarget = element.numberTarget || element;
  setLabel(label, text);
  setNumber(number, textNumber);

  return [label, labelTarget, number, numberTarget];
}

UpdateLabelHandler.$inject = ["modeling", "textRenderer", "commandStack"];
