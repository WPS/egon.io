import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';

import {
  translate
} from 'diagram-js/lib/util/SvgTransformUtil';

var MARKER_HIDDEN = 'djs-element-hidden',
    MARKER_LABEL_HIDDEN = 'djs-label-hidden';

var annotationBoxHeight = 0;

export function getAnnotationBoxHeight() {
  return annotationBoxHeight;
}

export default function DSLabelEditingPreview(
    eventBus, canvas, elementRegistry,
    pathMap) {

  var self = this;

  var defaultLayer = canvas.getDefaultLayer();

  var element, absoluteElementBBox, gfx;

  eventBus.on('directEditing.activate', function(context) {
    var activeProvider = context.active;

    element = activeProvider.element.label || activeProvider.element;

    // text annotation
    if (is(element, 'domainStory:textAnnotation')) {
      absoluteElementBBox = canvas.getAbsoluteBBox(element);

      gfx = svgCreate('g');

      annotationBoxHeight = element.height;

      var textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
        xScaleFactor: 1,
        yScaleFactor: 1,
        containerWidth: element.width,
        containerHeight: element.height,
        position: {
          mx: 0.0,
          my: 0.0
        }
      });

      var path = self.path = svgCreate('path');

      svgAttr(path, {
        d: textPathData,
        strokeWidth: 2,
        stroke: getStrokeColor(element)
      });

      svgAppend(gfx, path);

      svgAppend(defaultLayer, gfx);

      translate(gfx, element.x, element.y);
    }

    if (is(element, 'domainStory:textAnnotation') ||
      element.labelTarget) {
      canvas.addMarker(element, MARKER_HIDDEN);
    } else if (is(element, 'domainStory:actorPerson') ||
      is(element, 'domainStory:actorGroup') ||
      is(element, 'domainStory:actorSystem') ||
      is(element, 'domainStory:workObject') ||
      is(element, 'domainStory:workObjectFolder') ||
      is(element, 'domainStory:workObjectCall') ||
      is(element, 'domainStory:workObjectEmail') ||
      is(element, 'domainStory:workObjectBubble') ||
      is(element, 'domainStory:activity') ||
      is(element, 'domainStory:group') ||
      is(element, 'domainStory:workObjectInfo')) {
      canvas.addMarker(element, MARKER_LABEL_HIDDEN);
    }
  });

  eventBus.on('directEditing.resize', function(context) {

    // text annotation
    if (is(element, 'domainStory:textAnnotation')) {
      var height = context.height,
          dy = context.dy;

      var newElementHeight = Math.max(element.height / absoluteElementBBox.height * (height + dy), 0);
      annotationBoxHeight = newElementHeight;

      var textPathData = pathMap.getScaledPath('TEXT_ANNOTATION', {
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
    var activeProvider = context.active;

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
  'elementRegistry',
  'pathMap'
];


// helpers ///////////////////

function getStrokeColor() {
  return 'black';
}