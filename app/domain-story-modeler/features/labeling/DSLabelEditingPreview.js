'use strict';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { translate } from 'diagram-js/lib/util/SvgTransformUtil';
import { ACTIVITY, ACTOR, WORKOBJECT, GROUP, TEXTANNOTATION } from '../../language/elementTypes';

const MARKER_HIDDEN = 'djs-element-hidden',
      MARKER_LABEL_HIDDEN = 'djs-label-hidden';

let annotationBoxHeight = 0;

export function getAnnotationBoxHeight() {
  return annotationBoxHeight;
}

export default function DSLabelEditingPreview(
    eventBus, canvas, pathMap) {

  let self = this;

  let defaultLayer = canvas.getDefaultLayer();
  let element, absoluteElementBBox, gfx;

  eventBus.on('directEditing.activate', function(context) {
    let activeProvider = context.active;

    element = activeProvider.element.label || activeProvider.element;

    // text annotation
    if (is(element, TEXTANNOTATION)) {
      absoluteElementBBox = canvas.getAbsoluteBBox(element);

      gfx = svgCreate('g');

      annotationBoxHeight = element.height;

      let textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.0,
          my: 0.0
        }
      });

      let path = self.path = svgCreate('path');

      svgAttr(path, {
        d: textPathData,
        strokeWidth: 2,
        stroke: getStrokeColor(element)
      });

      svgAppend(gfx, path);

      svgAppend(defaultLayer, gfx);

      translate(gfx, element.x, element.y);
    }

    if (is(element, TEXTANNOTATION) ||
      element.labelTarget) {
      canvas.addMarker(element, MARKER_HIDDEN);
    } else if (
      element.type.includes(ACTOR) ||
      element.type.includes(WORKOBJECT) ||
      element.type.includes(ACTIVITY) ||
      element.type.includes(GROUP)) {
      canvas.addMarker(element, MARKER_LABEL_HIDDEN);
    }
  });

  eventBus.on('directEditing.resize', function(context) {

    // text annotation
    if (is(element, TEXTANNOTATION)) {
      let height = context.height,
          dy = context.dy;

      let newElementHeight = Math.max(element.height / absoluteElementBBox.height * (height + dy), 0);
      annotationBoxHeight = newElementHeight;

      let textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: newElementHeight,
        position: {
          mx: 0.0,
          my: 0.0
        }
      });

      svgAttr(self.path, {
        d: textPathData
      });
    }
  });

  eventBus.on(['directEditing.complete', 'directEditing.cancel'], function(context) {
    let activeProvider = context.active;

    if (activeProvider) {
      canvas.removeMarker(activeProvider.element.label || activeProvider.element, MARKER_HIDDEN);
      canvas.removeMarker(element, MARKER_LABEL_HIDDEN);
    }

    element = undefined;
    absoluteElementBBox = undefined;

    if (gfx) {
      svgRemove(gfx);

      gfx = undefined;
    }
  });
}

DSLabelEditingPreview.$inject = [
  'eventBus',
  'canvas',
  'pathMap'
];


// helpers ///////////////////

function getStrokeColor() {
  return 'black';
}