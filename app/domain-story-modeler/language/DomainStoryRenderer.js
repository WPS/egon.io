'use strict';

import inherits from 'inherits';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import Ids from 'ids';

import { getAnnotationBoxHeight } from '../features/labeling/DSLabelEditingPreview';


import {
  labelPosition,
  calculateXY,
  calculateDeg
} from '../util/DSActivityUtil';

import {
  componentsToPath,
  createLine
} from 'diagram-js/lib/util/RenderUtil';

import {
  calculateTextWidth
} from '../util/DSUtil';

import sanitize from '../util/Sanitizer';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses
} from 'tiny-svg';

import { query as domQuery } from 'min-dom';

import {
  isObject,
  assign
} from 'min-dash';
import { getNumberStash } from '../features/labeling/DSLabelEditingProvider';
import { numberBoxDefinitions, generateAutomaticNumber } from '../features/numbering/numbering';

var RENDERER_IDS = new Ids();
var numbers = [];
/**
 * a renderer that knows how to render custom elements.
 */
export default function DomainStoryRenderer(eventBus, styles, canvas, textRenderer, pathMap, commandStack) {

  BaseRenderer.call(this, eventBus, 2000);

  var rendererId = RENDERER_IDS.next();
  var markers = {};
  var computeStyle = styles.computeStyle;

  // generate the automatic Number for an activity origintaing from an actor
  function generateActivityNumber(parentGfx, element, box) {

    // whenever we want to edit an activity, it gets redrawn as a new object
    // and the custom information is lost,
    // so we stash it before the editing occurs and set the value here

    var numberStash = getNumberStash();
    var semantic = element.businessObject;

    if (numberStash.use) {
      semantic.number = numberStash.number;
    }

    box.x -= 15;
    renderNumber(parentGfx, '.', backgroundStyle(box), element.type);

    numbers[semantic.number] = true;
    box.x += 39;
    box.y -= 5;

    renderNumber(parentGfx, semantic.number, numberStyle(box), element.type);
  }

  // style functions
  function numberStyle(box) {
    return {
      box: box,
      fitBox: true,
      style: assign(
        {},
        textRenderer.getExternalStyle(),
        {
          fill: 'black',
          backgroundColor: 'green',
          position: 'absolute'
        }
      )
    };
  }

  function backgroundStyle(box) {
    return {
      box: box,
      fitBox: true,
      style: assign(
        {},
        textRenderer.getExternalStyle(),
        {
          fill: '#42aebb',
          fontSize: 150,
          position: 'absolute',
          fontFamily: 'Courier'
        }
      )
    };
  }

  // render functions
  // render label associated with actors and workobjects
  function renderEmbeddedLabel(parentGfx, element, align, padding) {
    var semantic = element.businessObject;
    return renderLabel(parentGfx, semantic.name, {
      box: element,
      align: align,
      padding: padding ? padding : 0,
      style: {
        fill: '#000000',
      }
    }, element.type);
  }

  // render label associated with activities
  function renderExternalLabel(parentGfx, element) {

    var semantic = element.businessObject;
    var waypoints = element.waypoints;

    if (element.waypoints != null) {
      var position = labelPosition(waypoints);
      var startPoint = element.waypoints[position.selected];
      var endPoint = element.waypoints[position.selected + 1];
      var angle = calculateDeg(startPoint, endPoint);
      var alignment = 'left';
      var boxWidth = 500;
      var xStart = position.x;

      // if the activity is horizontal, we want to center the label
      if (angle == 0 || angle == 180) {
        boxWidth = Math.abs(startPoint.x - endPoint.x);
        alignment = 'center';
        xStart = calculateXY(startPoint.x, endPoint.x) - calculateTextWidth(semantic.name);
      }

      var box = {
        textAlign: alignment,
        width: boxWidth,
        height: 30,
        x: xStart,
        y: position.y
      };

      if (semantic.name.length) {
        return renderLabel(parentGfx, semantic.name, {
          box: box,
          fitBox: true,
          style: assign(
            {},
            textRenderer.getExternalStyle(),
            {
              fill: 'black',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              hyphens: 'auto'
            }
          )
        }, element.type);
      }
    }
  }

  // render the number associated with an activity
  function renderExternalNumber(parentGfx, element) {
    if (element && element.source) {
      var semantic = element.businessObject;

      var box = numberBoxDefinitions(element);

      if (semantic.number == null && element.source.type && element.source.type.includes('domainStory:actor')) {
        generateAutomaticNumber(element, canvas, commandStack);
      }

      // render the bacground for the number
      if (semantic.number != '' && semantic.number != null && element.source.type.includes('domainStory:actor')) {
        generateActivityNumber(parentGfx, element, box);
      } else {
        semantic.number = null;
      }
    }
  }

  // render a number on the canvas
  function renderNumber(parentGfx, number, options, type) {

    if (number < 10) {
      number = '0' + String(number);
    }
    number = String(number);
    var text = textRenderer.createText(number || '', options);
    var height = 0;

    svgClasses(text).add('djs-labelNumber');

    // the coordinates of the activity label must be set directly and will not be taken from the box
    if (/:activity$/.test(type)) {
      text.innerHTML = manipulateInnerHTMLXLabel(text.children, options.box.x, 0);
      text.innerHTML = manipulateInnerHTMLYLabel(text.children, options.box.y, 0);
    } else if (/:actor/.test(type)) {
      height = parentGfx.firstChild.attributes.height.nodeValue;
      text.innerHTML = manipulateInnerHTMLYLabel(text.children, height, 0);
    } else if (/:workObject/.test(type)) {
      height = parentGfx.firstChild.attributes.height.nodeValue;
      text.innerHTML = manipulateInnerHTMLYLabel(text.children, height, 26);
    }

    svgAppend(parentGfx, text);
    return text;
  }

  // render a label on the canvas
  function renderLabel(parentGfx, label, options, type) {

    label = sanitize(label);
    var text = textRenderer.createText(label || '', options);
    var height = 0;

    svgClasses(text).add('djs-label');

    // the coordinates of the activity label must be set directly and will not be taken from the box
    if (/:activity$/.test(type)) {
      text.innerHTML = manipulateInnerHTMLXLabel(text.children, options.box.x, 0);
      text.innerHTML = manipulateInnerHTMLYLabel(text.children, options.box.y, 0);
    } else if (/:actor/.test(type)) {
      height = parentGfx.firstChild.attributes.height.nodeValue;
      text.innerHTML = manipulateInnerHTMLYLabel(text.children, height, 0);
    } else if (/:workObject/.test(type)) {
      height = parentGfx.firstChild.attributes.height.nodeValue;
      text.innerHTML = manipulateInnerHTMLYLabel(text.children, height, 26);
    }

    svgAppend(parentGfx, text);
    return text;
  }

  // determine the Y-coordinate of the label / number to be rendered
  function manipulateInnerHTMLYLabel(children, y, offset) {
    if (children) {
      var result = '';
      for (var i = 0; i < children.length; i++) {
        result += children[i].outerHTML.replace(/y="-?\d*.\d*"/, 'y="' + (Number(y) + offset + (14 * i)) + '"');
      }

      return result;
    }
  }

  // determine the X-coordinate of the label / number to be rendered
  function manipulateInnerHTMLXLabel(children, x, offset) {
    if (children) {
      var result = '';
      for (var i = 0; i < children.length; i++) {
        result += children[i].outerHTML.replace(/x="-?\d*.\d*"/, 'x="' + (Number(x) + offset + (14 * 1)) + '"');
      }

      return result;
    }
  }

  // draw functions
  this.drawGroup = function(parentGfx, element) {
    var rect = drawRect(parentGfx, element.width, element.height, 0, assign({
      fill: 'none',
      stroke: 'black',
    }, element.attrs));

    renderEmbeddedLabel(parentGfx, element, 'left-top', 8);

    return rect;
  };

  this.drawActor = function(p, element) {
    var svgDynamicSizeAttributes = {
          width: element.width,
          height: element.height,
        },
        actor;

    switch (element.type) {
    case 'domainStory:actorPerson':
      actor = svgCreate('<svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 5.9c1.16 0 2.1.94 2.1 2.1s-.94 2.1-2.1 2.1S9.9 9.16 9.9 8s.94-2.1 2.1-2.1m0 9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 9c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z"/><path d="M0 0h24v24H0z" fill="none"/></svg>');
      break;
    case 'domainStory:actorGroup':
      actor = svgCreate('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M16.5 13c-1.2 0-3.07.34-4.5 1-1.43-.67-3.3-1-4.5-1C5.33 13 1 14.08 1 16.25V19h22v-2.75c0-2.17-4.33-3.25-6.5-3.25zm-4 4.5h-10v-1.25c0-.54 2.56-1.75 5-1.75s5 1.21 5 1.75v1.25zm9 0H14v-1.25c0-.46-.2-.86-.52-1.22.88-.3 1.96-.53 3.02-.53 2.44 0 5 1.21 5 1.75v1.25zM7.5 12c1.93 0 3.5-1.57 3.5-3.5S9.43 5 7.5 5 4 6.57 4 8.5 5.57 12 7.5 12zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 5.5c1.93 0 3.5-1.57 3.5-3.5S18.43 5 16.5 5 13 6.57 13 8.5s1.57 3.5 3.5 3.5zm0-5.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/></svg>');
      break;
    case 'domainStory:actorSystem':
      actor = svgCreate('<svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20,18c1.1,0,2-0.9,2-2V6c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6v10c0,1.1,0.9,2,2,2H0v2h24v-2H20z M4,6h16v10H4V6z"/></svg>');
      break;
    }
    svgAttr(actor, svgDynamicSizeAttributes);
    svgAppend(p, actor);

    renderEmbeddedLabel(p, element, 'center', -5);
    return actor;
  };

  this.drawWorkObject = function(p, element) {

    var svgDynamicSizeAttributes = {
      width: element.width * 0.65,
      height: element.height * 0.65,
      x: element.width / 2 - 25,
      y: element.height / 2 - 25
    };
    var workObject;

    switch (element.type) {
    case 'domainStory:workObject':
      workObject = svgCreate('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 24 24" enable-background="new 0 0 24 24" xml:space="preserve"><g id="Header_x2F_BG" display="none"><rect x="-402" y="-270" display="inline" fill="#F1F1F2" width="520" height="520"/></g><g id="Bounding_Boxes"><g id="ui_x5F_spec_x5F_header_copy_3"></g><path fill="none" d="M0,0h24v24H0V0z"/></g><g id="Rounded" display="none"><g id="ui_x5F_spec_x5F_header_copy_5" display="inline"></g><path display="inline" d="M14.59,2.59C14.21,2.21,13.7,2,13.17,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.89,2,1.99,2H18c1.1,0,2-0.9,2-2V8.83c0-0.53-0.21-1.04-0.59-1.41L14.59,2.59z M15,18H9c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C16,17.55,15.55,18,15,18z M15,14H9c-0.55,0-1-0.45-1-1v0c0-0.55,0.45-1,1-1h6c0.55,0,1,0.45,1,1v0C16,13.55,15.55,14,15,14z M13,8V3.5L18.5,9H14C13.45,9,13,8.55,13,8z"/></g><g id="Sharp" display="none"><g id="ui_x5F_spec_x5F_header_copy_4" display="inline"></g><path display="inline" d="M14,2H4v20h16V8L14,2z M16,18H8v-2h8V18z M16,14H8v-2h8V14z M13,9V3.5L18.5,9H13z"/></g><g id="Outline"><g id="ui_x5F_spec_x5F_header"></g><g><rect x="8" y="16" width="8" height="2"/><rect x="8" y="12" width="8" height="2"/><path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.89,2,1.99,2H18c1.1,0,2-0.9,2-2V8L14,2z M18,20L6,20V4h7v5h5V20z"/></g></g><g id="Duotone" display="none"><g id="ui_x5F_spec_x5F_header_copy_2" display="inline"></g><g display="inline"><path opacity="0.3" d="M13,4H6v16l12,0V9h-5V4z M16,18H8v-2h8V18z M16,12v2H8v-2H16z"/><g><rect x="8" y="16" width="8" height="2"/><rect x="8" y="12" width="8" height="2"/><path d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.89,2,1.99,2H18c1.1,0,2-0.9,2-2V8L14,2z M18,20L6,20V4h7v5h5V20z"/></g></g></g><g id="Fill" display="none"><g id="ui_x5F_spec_x5F_header_copy" display="inline"></g><path display="inline" d="M14,2H6C4.9,2,4,2.9,4,4v16c0,1.1,0.89,2,1.99,2H18c1.1,0,2-0.9,2-2V8L14,2z M16,18H8v-2h8V18z M16,14H8v-2h8V14z M13,9V3.5L18.5,9H13z"/></g><g id="nyt_x5F_exporter_x5F_info" display="none"></g></svg>');
      break;
    case 'domainStory:workObjectFolder':
      workObject = svgCreate('<svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h24v24H0V0z"/><path d="M9.17,6l2,2H20v10L4,18V6H9.17 M10,4H4C2.9,4,2.01,4.9,2.01,6L2,18c0,1.1,0.9,2,2,2h16c1.1,0,2-0.9,2-2V8c0-1.1-0.9-2-2-2 h-8L10,4L10,4z"/></svg>');
      break;
    case 'domainStory:workObjectCall':
      workObject = svgCreate('<svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h24v24H0V0z"/><path d="M6.54,5C6.6,5.89,6.75,6.76,6.99,7.59l-1.2,1.2C5.38,7.59,5.12,6.32,5.03,5H6.54 M16.4,17.02c0.85,0.24,1.72,0.39,2.6,0.45 v1.49c-1.32-0.09-2.59-0.35-3.8-0.75L16.4,17.02 M7.5,3H4C3.45,3,3,3.45,3,4c0,9.39,7.61,17,17,17c0.55,0,1-0.45,1-1v-3.49	c0-0.55-0.45-1-1-1c-1.24,0-2.45-0.2-3.57-0.57c-0.1-0.04-0.21-0.05-0.31-0.05c-0.26,0-0.51,0.1-0.71,0.29l-2.2,2.2 c-2.83-1.45-5.15-3.76-6.59-6.59l2.2-2.2C9.1,8.31,9.18,7.92,9.07,7.57C8.7,6.45,8.5,5.25,8.5,4C8.5,3.45,8.05,3,7.5,3L7.5,3z"/></svg>');
      break;
    case 'domainStory:workObjectEmail':
      workObject = svgCreate('<svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h24v24H0V0z"/><path fill-opacity="0.9" d="M12,1.95c-5.52,0-10,4.48-10,10s4.48,10,10,10h5v-2h-5c-4.34,0-8-3.66-8-8s3.66-8,8-8s8,3.66,8,8v1.43 c0,0.79-0.71,1.57-1.5,1.57S17,14.17,17,13.38v-1.43c0-2.76-2.24-5-5-5s-5,2.24-5,5s2.24,5,5,5c1.38,0,2.64-0.56,3.54-1.47 c0.65,0.89,1.77,1.47,2.96,1.47c1.97,0,3.5-1.6,3.5-3.57v-1.43C22,6.43,17.52,1.95,12,1.95z M12,14.95c-1.66,0-3-1.34-3-3 s1.34-3,3-3s3,1.34,3,3S13.66,14.95,12,14.95z"/></svg>');
      break;
    case 'domainStory:workObjectBubble':
      workObject = svgCreate('<svg fill="#000000" height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>');
      break;
    case 'domainStory:workObjectInfo':
      workObject = svgCreate('<svg fill="#000000" height="48" viewBox="0 0 24 24" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M0 0h24v24H0z" fill="none"/><path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z"/></svg>');
      break;
    }

    svgAttr(workObject, svgDynamicSizeAttributes);
    svgAppend(p, workObject);
    renderEmbeddedLabel(p, element, 'center', -5);

    return workObject;
  };

  this.drawActivity = function(p, element) {
    if (element) {
      var attrs = computeStyle(attrs, {
        stroke: '#000000',
        fill: 'none',
        strokeWidth: 1.5,
        strokeLinejoin: 'round',
        markerEnd: marker('activity', 'black', '#000000')
      });

      var x = svgAppend(p, createLine(element.waypoints, attrs));
      renderExternalLabel(p, element);
      renderExternalNumber(p, element);

      return x;
    }
  };

  this.drawDSConnection = function(p, element) {
    var attrs = computeStyle(attrs, {
      stroke: '#000000',
      strokeWidth: 1.5,
      strokeLinejoin: 'round',
      strokeDasharray: '5, 5',
    });

    return svgAppend(p, createLine(element.waypoints, attrs));
  };

  this.drawAnnotation = function(parentGfx, element) {
    var style = {
      'fill': 'none',
      'stroke': 'none'
    };

    var text = element.businessObject.text || '';
    if (element.businessObject.text) {
      var height = getAnnotationBoxHeight();

      if (height == 0 && element.businessObject.number) {
        height = element.businessObject.number;
      }
      assign(element, {
        height: height
      });
      // for some reason the keyword height is not exported, so we use another, which we know will be exported,
      // to ensure persistent annotation heights betweens sessions
      assign(element.businessObject, {
        number: height
      });
    }

    var textElement = drawRect(parentGfx, element.width, element.height, 0, 0, style);
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

    drawPath(parentGfx, textPathData, {
      stroke: 'black'
    });

    renderLabel(parentGfx, text, {
      box: element,
      align: 'left-top',
      padding: 5,
      style: {
        fill: 'black'
      }
    });

    return textElement;
  };

  // draw helper functions
  function drawPath(parentGfx, d, attrs) {

    attrs = computeStyle(attrs, ['no-fill'], {
      strokeWidth: 2,
      stroke: 'black'
    });

    var path = svgCreate('path');
    svgAttr(path, { d: d });
    svgAttr(path, attrs);

    svgAppend(parentGfx, path);

    return path;
  }

  function drawRect(parentGfx, width, height, r, offset, attrs) {

    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;
    attrs = computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    var rect = svgCreate('rect');
    svgAttr(rect, {
      x: offset,
      y: offset,
      width: width - offset * 2,
      height: height - offset * 2,
      rx: r,
      ry: r
    });

    svgAttr(rect, attrs);
    svgAppend(parentGfx, rect);

    return rect;
  }

  // marker functions
  function marker(type, fill, stroke) {
    var id = type + '-' + fill + '-' + stroke + '-' + rendererId;

    if (!markers[id]) {
      createMarker(type, fill, stroke);
    }
    return 'url(#' + id + ')';
  }

  function createMarker(type, fill, stroke) {
    var id = type + '-' + fill + '-' + stroke + '-' + rendererId;

    if (type === 'activity') {
      var sequenceflowEnd = svgCreate('path');
      svgAttr(sequenceflowEnd, { d: 'M 1 5 L 11 10 L 1 15 Z' });

      addMarker(id, {
        element: sequenceflowEnd,
        ref: { x: 11, y: 10 },
        scale: 0.5,
        attrs: {
          fill: stroke,
          stroke: stroke
        }
      });
    }
  }

  function addMarker(id, options) {
    var attrs = assign({
      fill: 'black',
      strokeWidth: 1,
      strokeLinecap: 'round',
      strokeDasharray: 'none'
    }, options.attrs);

    var ref = options.ref || { x: 0, y: 0 };
    var scale = options.scale || 1;

    // resetting stroke dash array
    if (attrs.strokeDasharray === 'none') {
      attrs.strokeDasharray = [10000, 1];
    }

    var marker = svgCreate('marker');

    svgAttr(options.element, attrs);
    svgAppend(marker, options.element);
    svgAttr(marker, {
      id: id,
      viewBox: '0 0 20 20',
      refX: ref.x,
      refY: ref.y,
      markerWidth: 20 * scale,
      markerHeight: 20 * scale,
      orient: 'auto'
    });

    var defs = domQuery('defs', canvas._svg);
    if (!defs) {
      defs = svgCreate('defs');
      svgAppend(canvas._svg, defs);
    }
    svgAppend(defs, marker);
    markers[id] = marker;
  }

  // path functions
  this.getWorkObjectPath = function(shape) {
    var rectangle = getRectPath(shape);
    return componentsToPath(rectangle);
  };

  this.getGroupPath = function(shape) {
    var rectangle = getRectPath(shape);
    return componentsToPath(rectangle);
  };

  this.getActivityPath = function(connection) {
    var waypoints = connection.waypoints.map(function(p) {
      return p.original || p;
    });

    var activityPath = [
      ['M', waypoints[0].x, waypoints[0].y]
    ];

    waypoints.forEach(function(waypoint, index) {
      if (index !== 0) {
        activityPath.push(['L', waypoint.x, waypoint.y]);
      }
    });
    return componentsToPath(activityPath);
  };

  this.getActorPath = function(shape) {
    var rectangle = getRectPath(shape);
    return componentsToPath(rectangle);
  };
}

inherits(DomainStoryRenderer, BaseRenderer);

DomainStoryRenderer.$inject = ['eventBus', 'styles', 'canvas', 'textRenderer', 'pathMap', 'commandStack'];

DomainStoryRenderer.prototype.canRender = function(element) {
  return /^domainStory:/.test(element.type);
};

DomainStoryRenderer.prototype.drawShape = function(p, element) {
  var type = element.type;

  switch (type) {
  case 'domainStory:actorPerson':
  case 'domainStory:actorGroup':
  case 'domainStory:actorSystem':
    return this.drawActor(p, element);
  case 'domainStory:workObject':
  case 'domainStory:workObjectFolder':
  case 'domainStory:workObjectCall':
  case 'domainStory:workObjectEmail':
  case 'domainStory:workObjectBubble':
  case 'domainStory:workObjectInfo':
    return this.drawWorkObject(p, element);
  case 'domainStory:textAnnotation':
    return this.drawAnnotation(p, element);
  case 'domainStory:group':
    return this.drawGroup(p, element);
  }
};

DomainStoryRenderer.prototype.getShapePath = function(shape) {
  var type = shape.type;

  switch (type) {
  case 'domainStory:actorPerson':
  case 'domainStory:actorGroup':
  case 'domainStory:actorSystem':
    return this.getActorPath(shape);
  case 'domainStory:workObject':
  case 'domainStory:workObjectFolder':
  case 'domainStory:workObjectCall':
  case 'domainStory:workObjectEmail':
  case 'domainStory:workObjectBubble':
  case 'domainStory:workObjectInfo':
    return this.getWorkObjectPath(shape);
  case 'domainStory:group':
    return this.getGroupPath(shape);
  }
};

DomainStoryRenderer.prototype.drawConnection = function(p, element) {
  var type = element.type;

  if (type === 'domainStory:activity') {
    return this.drawActivity(p, element);
  } else if (type === 'domainStory:connection') {
    return this.drawDSConnection(p, element);
  }
};

DomainStoryRenderer.prototype.getConnectionPath = function(connection) {
  var type = connection.type;

  if (type === 'domainStory:activity' || type === 'domainStory:connection') {
    return this.getActivityPath(connection);
  }
};

// creates a SVG path that describes a rectangle which encloses the given shape.
function getRectPath(shape) {
  var offset = 5;
  var x = shape.x,
      y = shape.y,
      width = (shape.width / 2) + offset,
      height = (shape.height / 2) + offset;

  var rectPath = [
    ['M', x, y],
    ['l', width, 0],
    ['l', width, height],
    ['l', -width, height],
    ['l', -width, 0],
    ['z']
  ];
  return rectPath;
}