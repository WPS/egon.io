"use strict";

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove,
} from "tiny-svg";

import { translate } from "diagram-js/lib/util/SvgTransformUtil";
import { ElementTypes } from "src/app/domain/entities/elementTypes";
import { is, getAnnotationBracketSvg } from "../util/util";

const MARKER_HIDDEN = "djs-element-hidden",
  MARKER_LABEL_HIDDEN = "djs-label-hidden";

export default function DSLabelEditingPreview(eventBus, canvas) {
  let self = this;

  let defaultLayer = canvas.getDefaultLayer();
  let element, absoluteElementBBox, gfx;

  eventBus.on("directEditing.activate", function (context) {
    let activeProvider = context.active;

    element = activeProvider.element.label || activeProvider.element;

    if (is(element, ElementTypes.TEXTANNOTATION)) {
      absoluteElementBBox = canvas.getAbsoluteBBox(element);
      gfx = svgCreate("g");

      let bracketPath = getAnnotationBracketSvg(element.height);
      let path = (self.path = svgCreate("path"));

      svgAttr(path, {
        d: bracketPath,
        strokeWidth: 2,
        stroke: "black",
      });

      svgAppend(gfx, path);

      svgAppend(defaultLayer, gfx);

      translate(gfx, element.x, element.y);
    }

    if (is(element, ElementTypes.TEXTANNOTATION) || element.labelTarget) {
      canvas.addMarker(element, MARKER_HIDDEN);
    } else if (
      element.type.includes(ElementTypes.ACTOR) ||
      element.type.includes(ElementTypes.WORKOBJECT) ||
      element.type.includes(ElementTypes.ACTIVITY) ||
      element.type.includes(ElementTypes.GROUP)
    ) {
      canvas.addMarker(element, MARKER_LABEL_HIDDEN);
    }
  });

  eventBus.on("directEditing.resize", function (context) {
    if (is(element, ElementTypes.TEXTANNOTATION)) {
      let height = context.height,
        dy = context.dy;

      let newElementHeight = Math.max(
        (element.height / absoluteElementBBox.height) * (height + dy),
        0,
      );

      let bracketPath = getAnnotationBracketSvg(newElementHeight);

      svgAttr(self.path, {
        d: bracketPath,
      });
    }
  });

  eventBus.on(
    ["directEditing.complete", "directEditing.cancel"],
    function (context) {
      let activeProvider = context.active;

      if (activeProvider) {
        canvas.removeMarker(
          activeProvider.element.label || activeProvider.element,
          MARKER_HIDDEN,
        );
        canvas.removeMarker(element, MARKER_LABEL_HIDDEN);
      }

      element = undefined;
      absoluteElementBBox = undefined;

      if (gfx) {
        svgRemove(gfx);

        gfx = undefined;
      }
    },
  );
}

DSLabelEditingPreview.$inject = ["eventBus", "canvas"];
