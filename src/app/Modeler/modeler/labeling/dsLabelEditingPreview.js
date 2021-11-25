"use strict";

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove,
} from "tiny-svg";

import { translate } from "diagram-js/lib/util/SvgTransformUtil";
import { elementTypes } from "../../../Domain/Common/elementTypes";
import { is } from "../util";

const MARKER_HIDDEN = "djs-element-hidden",
  MARKER_LABEL_HIDDEN = "djs-label-hidden";

let annotationBoxHeight = 0;

export function getAnnotationBoxHeight() {
  return annotationBoxHeight;
}

export default function DSLabelEditingPreview(eventBus, canvas, pathMap) {
  let self = this;

  let defaultLayer = canvas.getDefaultLayer();
  let element, absoluteElementBBox, gfx;

  eventBus.on("directEditing.activate", function (context) {
    let activeProvider = context.active;

    element = activeProvider.element.label || activeProvider.element;

    // text annotation
    if (is(element, elementTypes.TEXTANNOTATION)) {
      absoluteElementBBox = canvas.getAbsoluteBBox(element);

      gfx = svgCreate("g");

      annotationBoxHeight = element.height;

      let textPathData = pathMap.getScaledPath("TEXT_ANNOTATION", {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.0,
          my: 0.0,
        },
      });

      let path = (self.path = svgCreate("path"));

      svgAttr(path, {
        d: textPathData,
        strokeWidth: 2,
        stroke: getStrokeColor(element),
      });

      svgAppend(gfx, path);

      svgAppend(defaultLayer, gfx);

      translate(gfx, element.x, element.y);
    }

    if (is(element, elementTypes.TEXTANNOTATION) || element.labelTarget) {
      canvas.addMarker(element, MARKER_HIDDEN);
    } else if (
      element.type.includes(elementTypes.ACTOR) ||
      element.type.includes(elementTypes.WORKOBJECT) ||
      element.type.includes(elementTypes.ACTIVITY) ||
      element.type.includes(elementTypes.GROUP)
    ) {
      canvas.addMarker(element, MARKER_LABEL_HIDDEN);
    }
  });

  eventBus.on("directEditing.resize", function (context) {
    // text annotation
    if (is(element, elementTypes.TEXTANNOTATION)) {
      let height = context.height,
        dy = context.dy;

      let newElementHeight = Math.max(
        (element.height / absoluteElementBBox.height) * (height + dy),
        0
      );
      annotationBoxHeight = newElementHeight;

      let textPathData = pathMap.getScaledPath("TEXT_ANNOTATION", {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: newElementHeight,
        position: {
          mx: 0.0,
          my: 0.0,
        },
      });

      svgAttr(self.path, {
        d: textPathData,
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
          MARKER_HIDDEN
        );
        canvas.removeMarker(element, MARKER_LABEL_HIDDEN);
      }

      element = undefined;
      absoluteElementBBox = undefined;

      if (gfx) {
        svgRemove(gfx);

        gfx = undefined;
      }
    }
  );
}

DSLabelEditingPreview.$inject = ["eventBus", "canvas", "pathMap"];

// helpers ///////////////////

function getStrokeColor() {
  return "black";
}
