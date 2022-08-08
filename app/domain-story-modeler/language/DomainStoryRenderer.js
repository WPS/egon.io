'use strict';

import inherits from 'inherits';

import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';

import Ids from 'ids';

import { getAnnotationBoxHeight } from '../features/labeling/DSLabelEditingPreview';

import {
  componentsToPath,
  createLine
} from 'diagram-js/lib/util/RenderUtil';

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

import { numberBoxDefinitions, generateAutomaticNumber, addNumberToRegistry } from '../features/numbering/numbering';

import { calculateTextWidth } from '../features/labeling/DSLabelUtil';
import { ACTIVITY, ACTOR, WORKOBJECT, CONNECTION, GROUP, TEXTANNOTATION } from './elementTypes';
import { correctElementRegitryInit } from '../language/canvasElementRegistry';
import { makeDirty } from '../features/export/dirtyFlag';
import { countLines, labelPosition } from '../features/labeling/position';
import { getTypeIconSRC } from './icon/dictionaries';

let RENDERER_IDS = new Ids();
let numbers = [];
const DEFAULT_COLOR = 'black';

/**
 * a renderer that knows how to render custom elements.
 */
export default function DomainStoryRenderer(eventBus, styles, canvas, textRenderer, pathMap, commandStack) {

  BaseRenderer.call(this, eventBus, 2000);

  let rendererId = RENDERER_IDS.next();
  let markers = {};
  let computeStyle = styles.computeStyle;

  // generate the automatic Number for an activity origintaing from an actor
  function generateActivityNumber(parentGfx, element, box) {

    // whenever we want to edit an activity, it gets redrawn as a new object
    // and the custom information is lost,
    // so we stash it before the editing occurs and set the value here
    let numberStash = getNumberStash();
    let semantic = element.businessObject;

    if (numberStash.use) {
      semantic.number = numberStash.number;
    }

    box.x -= 15;
    renderNumber(parentGfx, '.', backgroundStyle(box), element.type);

    numbers[semantic.number] = true;
    box.x += 39;
    box.y -= 5;

    let newRenderedNumber = renderNumber(parentGfx, semantic.number, numberStyle(box), element.type);
    addNumberToRegistry(newRenderedNumber, semantic.number);
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
          fill: 'white',
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
    let semantic = element.businessObject;
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

    let semantic = element.businessObject;
    let waypoints = element.waypoints;

    let lines = countLines(semantic.name);

    if (element.waypoints != null) {
      let position = labelPosition(waypoints, lines);
      let startPoint = element.waypoints[position.selected];
      let endPoint = element.waypoints[position.selected + 1];
      let angle = Math.angleBetween(startPoint, endPoint);
      let alignment = 'left';
      let boxWidth = 500;
      let xStart = position.x;

      // if the activity is horizontal, we want to center the label
      if (angle === 0 || angle === 180) {
        boxWidth = Math.abs(startPoint.x - endPoint.x);
        alignment = 'center';
        xStart = (startPoint.x + endPoint.x)/2 - calculateTextWidth(semantic.name);
      }

      let box = {
        textAlign: alignment,
        width: boxWidth,
        height: 30,
        x: xStart,
        y: position.y
      };

      if (semantic.name && semantic.name.length) {
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
      let semantic = element.businessObject;

      let box = numberBoxDefinitions(element);

      if (semantic.number == null && element.source.type && element.source.type.includes(ACTOR)) {
        generateAutomaticNumber(element, commandStack);
      }

      // render the bacground for the number
      if (semantic.number != '' && semantic.number != null && element.source.type.includes(ACTOR)) {
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
    let text = textRenderer.createText(number || '', options);
    let height = 0;

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

    let text = textRenderer.createText(label || '', options);
    let height = 0;

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
      let result = '';
      for (let i = 0; i < children.length; i++) {
        result += children[i].outerHTML.replace(/y="-?\d*.\d*"/, 'y="' + (Number(y) + offset + (14 * i)) + '"');
      }

      return result;
    }
  }

  // determine the X-coordinate of the label / number to be rendered
  function manipulateInnerHTMLXLabel(children, x, offset) {
    if (children) {
      let result = '';
      for (let i = 0; i < children.length; i++) {
        result += children[i].outerHTML.replace(/x="-?\d*.\d*"/, 'x="' + (Number(x) + offset + (14 * 1)) + '"');
      }

      return result;
    }
  }

  // draw functions
  this.drawGroup = function(parentGfx, element) {
    if (!element.businessObject.pickedColor) {
      element.businessObject.pickedColor = DEFAULT_COLOR;
    }
    let rect = drawRect(parentGfx, element.width, element.height, 0, assign({
      fill: 'none',
      stroke: element.businessObject.pickedColor,
    }, element.attrs));

    renderEmbeddedLabel(parentGfx, element, 'left-top', 8);

    return rect;
  };

  this.drawActor = function(p, element) {
    let svgDynamicSizeAttributes = {
          width: element.width,
          height: element.height,
        },
        actor;
    let iconSRC = getTypeIconSRC(ACTOR, element.type);

    if (iconSRC.startsWith('data')) {
      iconSRC = '<svg viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'+
      '<image width="24" height="24" xlink:href="'+ iconSRC+ '"/></svg>';
    }
    else {
      if (!element.businessObject.pickedColor) {
        element.businessObject.pickedColor = DEFAULT_COLOR;
      }
      const match = iconSRC.match(/fill=".*?"/);
      if (match && match.length > 1) {
        iconSRC=iconSRC.replace(/fill=".*?"/, 'fill="'+ element.businessObject.pickedColor +'"');
      } else {
        const index = iconSRC.indexOf('<svg ') + 5;
        iconSRC = iconSRC.substring(0, index) + ' fill=" '+ element.businessObject.pickedColor +'" ' + iconSRC.substring(index);
      }
    }
    actor = svgCreate(iconSRC);

    svgAttr(actor, svgDynamicSizeAttributes);
    svgAppend(p, actor);

    renderEmbeddedLabel(p, element, 'center', -5);
    return actor;
  };

  this.drawWorkObject = function(p, element) {
    let svgDynamicSizeAttributes = {
          width: element.width * 0.65,
          height: element.height * 0.65,
          x: element.width / 2 - 25,
          y: element.height / 2 - 25
        },
        workObject;
    let iconSRC = getTypeIconSRC(WORKOBJECT, element.type);
    if (iconSRC.startsWith('data')) {
      iconSRC = '<svg viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'+
      '<image width="24" height="24" xlink:href="'+ iconSRC+ '"/></svg>';
    }
    else {
      if (!element.businessObject.pickedColor) {
        element.businessObject.pickedColor = DEFAULT_COLOR;
      }
      if (iconSRC.match(/fill=".*?"/).length > 1) {
        iconSRC=iconSRC.replace(/fill=".*?"/, 'fill="'+ element.businessObject.pickedColor +'"');
      } else {
        const index = iconSRC.indexOf('<svg ') + 5;
        iconSRC = iconSRC.substring(0, index) + ' fill=" '+ element.businessObject.pickedColor +'" ' + iconSRC.substring(index);
      }
    }
    workObject = svgCreate(iconSRC);

    svgAttr(workObject, svgDynamicSizeAttributes);
    svgAppend(p, workObject);
    renderEmbeddedLabel(p, element, 'center', -5);

    return workObject;
  };

  this.drawActivity = function(p, element) {
    adjustForTextOverlapp(element);

    if (element) {
      if (!element.businessObject.pickedColor) {
        element.businessObject.pickedColor='black';
      }
      let attrs = computeStyle(attrs, {
        stroke: element.businessObject.pickedColor,
        fill: 'none',
        strokeWidth: 1.5,
        strokeLinejoin: 'round',
        markerEnd: marker('activity', 'black', element.businessObject.pickedColor)
      });

      let x = svgAppend(p, createLine(element.waypoints, attrs));
      renderExternalLabel(p, element);
      renderExternalNumber(p, element);

      // just adjusting the start- and enpoint of the connection-element moves only the drawn connection,
      // not the interactive line. This can be fixed by manually overriding the points of the interactive polyline
      // in the HTMl with the points of the drawn one.
      // this however does not adjust the surrounding box of the connection.
      fixConnectionInHTML(p.parentElement);

      return x;
    }
  };

  function adjustForTextOverlapp(element) {
    let source = element.source;
    let target = element.target;

    let waypoints = element.waypoints;
    let startPoint = waypoints[0];
    let endPoint = waypoints[waypoints.length -1];

    if (startPoint && endPoint && source && target) {

      // check if Startpoint can overlapp with text
      if (startPoint.y > source.y + 60) {
        if ((startPoint.x > source.x + 3) && (startPoint.x < source.x + 72)) {
          let lineOffset = getLineOffset(source);
          if ((source.y + 75 + lineOffset) > startPoint.y) {
            startPoint.y += lineOffset;
          }
        }
      }

      // check if Endpoint can overlapp with text
      if (endPoint.y > target.y +60) {
        if ((endPoint.x > target.x + 3) && (endPoint.x < target.x + 72)) {
          let lineOffset = getLineOffset(target);
          if ((target.y + 75 + lineOffset) > endPoint.y) {
            endPoint.y += lineOffset;
          }
        }
      }
    }
  }

  function getLineOffset(element) {
    let id = element.id;
    let offset =0;

    let objects = document.getElementsByClassName('djs-element djs-shape');
    for (let i=0; i<objects.length; i++) {
      let data_id = objects.item(i).getAttribute('data-element-id');
      if (data_id == id) {
        let object = objects.item(i);
        let text = object.getElementsByTagName('text')[0];
        let tspans = text.getElementsByTagName('tspan');
        let tspan = tspans[tspans.length -1];
        let y = tspan.getAttribute('y');
        offset = y;
      }
    }
    return offset - 70;
  }

  function fixConnectionInHTML(wantedConnection) {
    if (wantedConnection) {
      let polylines = wantedConnection.getElementsByTagName('polyline');
      if (polylines.length > 1) {
        polylines[1].setAttribute('points', polylines[0].getAttribute('points'));
      }
    }
  }

  this.drawDSConnection = function(p, element) {
    let attrs = computeStyle(attrs, {
      stroke: '#000000',
      strokeWidth: 1.5,
      strokeLinejoin: 'round',
      strokeDasharray: '5, 5',
    });

    return svgAppend(p, createLine(element.waypoints, attrs));
  };

  this.drawAnnotation = function(parentGfx, element) {
    let style = {
      'fill': 'none',
      'stroke': 'none'
    };

    let text = element.businessObject.text || '';
    if (element.businessObject.text) {
      let height = getAnnotationBoxHeight();

      if (height === 0 && element.businessObject.number) {
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

    let textElement = drawRect(parentGfx, element.width, element.height, 0, 0, style);
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

    let path = svgCreate('path');
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

    let rect = svgCreate('rect');
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
    let id = type + '-' + fill + '-' + stroke + '-' + rendererId;

    if (!markers[id]) {
      createMarker(type, fill, stroke);
    }
    return 'url(#' + id + ')';
  }

  function createMarker(type, fill, stroke) {
    let id = type + '-' + fill + '-' + stroke + '-' + rendererId;

    if (type === 'activity') {
      let sequenceflowEnd = svgCreate('path');
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
    let attrs = assign({
      fill: 'black',
      strokeWidth: 1,
      strokeLinecap: 'round',
      strokeDasharray: 'none'
    }, options.attrs);

    let ref = options.ref || { x: 0, y: 0 };
    let scale = options.scale || 1;

    // resetting stroke dash array
    if (attrs.strokeDasharray === 'none') {
      attrs.strokeDasharray = [10000, 1];
    }

    let marker = svgCreate('marker');

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

    let defs = domQuery('defs', canvas._svg);
    if (!defs) {
      defs = svgCreate('defs');
      svgAppend(canvas._svg, defs);
    }
    svgAppend(defs, marker);
    markers[id] = marker;
  }

  // path functions
  this.getWorkObjectPath = function(shape) {
    let rectangle = getRectPath(shape);
    return componentsToPath(rectangle);
  };

  this.getGroupPath = function(shape) {
    let rectangle = getRectPath(shape);
    return componentsToPath(rectangle);
  };

  this.getActivityPath = function(connection) {
    let waypoints = connection.waypoints.map(function(p) {
      return p.original || p;
    });

    let activityPath = [
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
    let rectangle = getRectPath(shape);
    return componentsToPath(rectangle);
  };
}

inherits(DomainStoryRenderer, BaseRenderer);

DomainStoryRenderer.$inject = ['eventBus', 'styles', 'canvas', 'textRenderer', 'pathMap', 'commandStack'];

DomainStoryRenderer.prototype.canRender = function(element) {
  return /^domainStory:/.test(element.type);
};

DomainStoryRenderer.prototype.drawShape = function(p, element) {

  // polyfill for tests
  if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
      value: function(search, pos) {
        pos = !pos || pos < 0 ? 0 : +pos;
        return this.substring(pos, pos + search.length) === search;
      }
    });
  }

  let type = element.type;
  element.businessObject.type = type;

  correctElementRegitryInit();
  makeDirty();

  if (type.includes(ACTOR)) {
    return this.drawActor(p, element);
  }
  else if (type.includes(WORKOBJECT)) {
    return this.drawWorkObject(p, element);
  }
  else if (type.includes(TEXTANNOTATION)) {
    return this.drawAnnotation(p, element);
  }
  else if (type.includes(GROUP)) {
    return this.drawGroup(p, element);
  }
};

DomainStoryRenderer.prototype.getShapePath = function(shape) {
  let type = shape.type;

  if (type.includes(ACTOR)) {
    return this.getActorPath(shape);
  }
  else if (type.includes(WORKOBJECT)) {
    return this.getWorkObjectPath(shape);
  }
  else if (type.includes(GROUP)) {
    return this.getGroupPath(shape);
  }
};

DomainStoryRenderer.prototype.drawConnection = function(p, element) {
  let type = element.type;

  makeDirty();

  if (!element.businessObject.type) {
    element.businessObject.type = type;
  }

  if (type === ACTIVITY) {
    return this.drawActivity(p, element);
  } else if (type === CONNECTION) {
    return this.drawDSConnection(p, element);
  }
};

DomainStoryRenderer.prototype.getConnectionPath = function(connection) {
  let type = connection.type;

  if (type === ACTIVITY || type === CONNECTION) {
    return this.getActivityPath(connection);
  }
};

// creates a SVG path that describes a rectangle which encloses the given shape.
function getRectPath(shape) {
  let offset = 5;
  let x = shape.x,
      y = shape.y,
      width = (shape.width / 2) + offset,
      height = (shape.height / 2) + offset;

  let rectPath = [
    ['M', x, y],
    ['l', width, 0],
    ['l', width, height],
    ['l', -width, height],
    ['l', -width, 0],
    ['z']
  ];
  return rectPath;
}