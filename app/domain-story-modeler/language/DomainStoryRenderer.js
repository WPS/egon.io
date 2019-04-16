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

import {
  labelPosition,
  calculateTextWidth
} from '../features/labeling/DSLabelUtil';
import { getActorIconSrc } from './actorIconRegistry';
import { getWorkObjectIconSrc } from './workObjectIconRegistry';
import { ACTIVITY, ACTOR, WORKOBJECT, CONNECTION, GROUP, TEXTANNOTATION } from './elementTypes';
import { correctElementRegitryInit } from '../features/canvasElements/canvasElementRegistry';

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

    var newRenderedNumber = renderNumber(parentGfx, semantic.number, numberStyle(box), element.type);
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
      var angle = Math.angleBetween(startPoint, endPoint);
      var alignment = 'left';
      var boxWidth = 500;
      var xStart = position.x;

      // if the activity is horizontal, we want to center the label
      if (angle == 0 || angle == 180) {
        boxWidth = Math.abs(startPoint.x - endPoint.x);
        alignment = 'center';
        xStart = (startPoint.x + endPoint.x)/2 - calculateTextWidth(semantic.name);
      }

      var box = {
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
      var semantic = element.businessObject;

      var box = numberBoxDefinitions(element);

      if (semantic.number == null && element.source.type && element.source.type.includes(ACTOR)) {
        generateAutomaticNumber(element, canvas, commandStack);
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

    actor = svgCreate(getActorIconSrc(element.type));

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
    workObject = svgCreate(getWorkObjectIconSrc(element.type));

    svgAttr(workObject, svgDynamicSizeAttributes);
    svgAppend(p, workObject);
    renderEmbeddedLabel(p, element, 'center', -5);

    return workObject;
  };

  this.drawActivity = function(p, element) {
    adjustForTextOverlapp(element);

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

      // Just adjusting the start- and enpoint of the connection-element moves only the drawn connection,
      // not the interactive line. This can be fixed by manually overriding the points of the interactive polyline
      // in the HTMl with the points of the drawn one.
      // This however does not adjust the surrounding box of the connection.
      fixConnectionInHTML(p.parentElement);

      return x;
    }
  };

  function adjustForTextOverlapp(element) {
    var source = element.source;
    var target = element.target;

    var waypoints = element.waypoints;
    var startPoint = waypoints[0];
    var endPoint = waypoints[waypoints.length -1];

    // check if Startpoint can overlapp with text
    if (startPoint.y > source.y + 60) {
      if ((startPoint.x > source.x + 3) && (startPoint.x < source.x + 72)) {
        var lineOffset = getLineOffset(source);
        if ((source.y + 75 + lineOffset) > startPoint.y) {
          startPoint.y += lineOffset;
        }
      }
    }

    // check if Endpoint can overlapp with text
    if (endPoint.y > target.y +60) {
      if ((endPoint.x > target.x + 3) && (endPoint.x < target.x + 72)) {
        lineOffset = getLineOffset(target);
        if ((target.y + 75 + lineOffset) > endPoint.y) {
          endPoint.y += lineOffset;
        }
      }
    }
  }

  function getLineOffset(element) {
    var id = element.id;
    var offset =0;

    var objects = document.getElementsByClassName('djs-element djs-shape');
    for (var i=0; i<objects.length; i++) {
      var data_id = objects.item(i).getAttribute('data-element-id');
      if (data_id == id) {
        var object = objects.item(i);
        var text = object.getElementsByTagName('text')[0];
        var tspans = text.getElementsByTagName('tspan');
        var tspan = tspans[tspans.length -1];
        var y = tspan.getAttribute('y');
        offset = y;
      }
    }
    return offset - 70;
  }

  function fixConnectionInHTML(wantedConnection) {
    if (wantedConnection) {
      var polylines = wantedConnection.getElementsByTagName('polyline');
      if (polylines.length > 1) {
        polylines[1].setAttribute('points', polylines[0].getAttribute('points'));
      }
    }
  }

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
  correctElementRegitryInit();

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
  var type = shape.type;

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
  var type = element.type;

  if (type === ACTIVITY) {
    return this.drawActivity(p, element);
  } else if (type === CONNECTION) {
    return this.drawDSConnection(p, element);
  }
};

DomainStoryRenderer.prototype.getConnectionPath = function(connection) {
  var type = connection.type;

  if (type === ACTIVITY || type === CONNECTION) {
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