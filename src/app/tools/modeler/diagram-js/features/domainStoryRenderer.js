"use strict";

import inherits from "inherits-browser";
import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import Ids from "ids";
import { componentsToPath, createLine } from "diagram-js/lib/util/RenderUtil";
import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
} from "tiny-svg";
import { query as domQuery } from "min-dom";
import { assign, isObject } from "min-dash";
import { getNumberStash } from "src/app/tools/modeler/diagram-js/features/labeling/dsLabelEditingProvider";
import {
  addNumberToRegistry,
  generateAutomaticNumber,
  numberBoxDefinitions,
} from "src/app/tools/modeler/diagram-js/features/numbering/numbering";

import { calculateTextWidth } from "src/app/tools/modeler/diagram-js/features/labeling/dsLabelUtil";
import {
  countLines,
  labelPosition,
} from "src/app/tools/modeler/diagram-js/features/labeling/position";
import { ElementTypes } from "src/app/domain/entities/elementTypes";
import { angleBetween } from "../../../../utils/mathExtensions";
import {
  isCustomIcon,
  isCustomSvgIcon,
  getAnnotationBracketSvg,
} from "./util/util";

let RENDERER_IDS = new Ids();
let numbers = [];
const DEFAULT_COLOR = "#000000";

let _iconDictionaryService;
let _elementRegistryService;
let _dirtyFlagService;

export function initializeRenderer(
  iconDictionaryService,
  elementRegistryService,
  dirtyFlagService,
) {
  _iconDictionaryService = iconDictionaryService;
  _elementRegistryService = elementRegistryService;
  _dirtyFlagService = dirtyFlagService;
}

export default function DomainStoryRenderer(
  eventBus,
  styles,
  canvas,
  textRenderer,
  commandStack,
) {
  BaseRenderer.call(this, eventBus, 2000);

  let rendererId = RENDERER_IDS.next();
  let markers = {};
  let computeStyle = styles.computeStyle;

  // generate the automatic Number for an activity originating from an actor
  function generateActivityNumber(parentGfx, element, box) {
    // whenever we want to edit an activity, it gets redrawn as a new object
    // and the custom information is lost,
    // so we stash it before the editing occurs and set the value here

    let numberStash = getNumberStash();
    let semantic = element.businessObject;

    if (numberStash.use) {
      semantic.number = numberStash.number;
    }

    numbers[semantic.number] = true;
    box.x -= 26;
    box.y -= 16;

    if (semantic.number < 10) {
      box.x += 3;
    }

    let newRenderedNumber = renderNumber(
      parentGfx,
      semantic.number,
      numberStyle(box),
      element.type,
    );
    addNumberToRegistry(newRenderedNumber, semantic.number);
  }

  // style functions
  function numberStyle(box) {
    return {
      box: box,
      fitBox: true,
      style: assign({}, textRenderer.getExternalStyle(), {
        fill: "black",
        position: "absolute",
      }),
    };
  }

  function renderActorAndWorkObjectLabel(parentGfx, element, align, padding) {
    let businessObject = element.businessObject;
    return renderLabel(
      parentGfx,
      businessObject.name,
      {
        box: element,
        align: align,
        padding: padding ? padding : 0,
        style: {
          fill: "#000000",
        },
      },
      element.type,
    );
  }

  function renderActivityLabel(parentGfx, element) {
    let semantic = element.businessObject;
    let waypoints = element.waypoints;
    let lines = countLines(semantic.name);

    if (element.waypoints != null) {
      let position = labelPosition(waypoints, lines);
      let startPoint = element.waypoints[position.selected];
      let endPoint = element.waypoints[position.selected + 1];
      let angle = angleBetween(startPoint, endPoint);
      let alignment = "left";
      let boxWidth = 500;
      let xStart = position.x;

      // if the activity is horizontal, we want to center the label
      if (angle === 0 || angle === 180) {
        boxWidth = Math.abs(startPoint.x - endPoint.x);
        alignment = "center";
        xStart =
          (startPoint.x + endPoint.x) / 2 - calculateTextWidth(semantic.name);
      }

      let box = {
        textAlign: alignment,
        width: boxWidth,
        height: 30,
        x: xStart,
        y: position.y,
      };

      if (semantic.name && semantic.name.length) {
        return renderLabel(
          parentGfx,
          semantic.name,
          {
            box: box,
            fitBox: true,
            style: assign({}, textRenderer.getExternalStyle(), {
              fill: "black",
              wordWrap: "break-word",
              overflowWrap: "break-word",
              hyphens: "auto",
            }),
          },
          element.type,
        );
      }
    }
  }

  // render the number associated with an activity
  function renderExternalNumber(parentGfx, element) {
    if (element && element.source) {
      let semantic = element.businessObject;

      let box = numberBoxDefinitions(element);

      if (
        semantic.number == null &&
        element.source.type &&
        element.source.type.includes(ElementTypes.ACTOR)
      ) {
        generateAutomaticNumber(element, commandStack);
      }

      // render the background for the number
      if (semantic.number && element.source.type.includes(ElementTypes.ACTOR)) {
        generateActivityNumber(parentGfx, element, box);
      } else {
        semantic.number = null;
      }
    }
  }

  // render a number on the canvas
  function renderNumber(parentGfx, number, options, type) {
    if (number < 10) {
      number = String(number);
    }
    number = String(number);
    let text = textRenderer.createText(number || "", options);
    let height = 0;

    svgClasses(text).add("djs-labelNumber");

    setCoordinates(type, text, options, height, parentGfx);

    // !IMPORTANT!
    // When converting svg-files via Inkscape or Photoshop the svg-circle is converted to a black dot that obscures the number.
    // To circumvent this, we draw an arc.
    let circle = svgCreate("path");
    let radius = 11;
    let x = options.box.x + 18 + (number > 9 ? 3 : 0);
    let y = options.box.y - radius + 7;
    svgAttr(circle, {
      d: `
      M ${x} ${y}
      m ${radius},0
      a ${radius},${radius} 0 1,0 ${-radius * 2},0
      a ${radius},${radius} 0 1,0 ${radius * 2},0
      `,
      fill: "white",
      stroke: "black",
    });

    svgAppend(parentGfx, circle);
    svgAppend(parentGfx, text);

    return text;
  }

  // the coordinates of the activity label must be set directly and will not be taken from the box
  function setCoordinates(type, text, options, height, parentGfx) {
    if (/:activity$/.test(type)) {
      text.innerHTML = manipulateInnerHTMLXLabel(
        text.children,
        options.box.x,
        0,
      );
      text.innerHTML = manipulateInnerHTMLYLabel(
        text.children,
        options.box.y,
        0,
      );
    } else if (/:actor/.test(type)) {
      height = parentGfx.firstChild.attributes.height.nodeValue;
      text.innerHTML = manipulateInnerHTMLYLabel(text.children, height, 0);
    } else if (/:workObject/.test(type)) {
      height = parentGfx.firstChild.attributes.height.nodeValue;
      text.innerHTML = manipulateInnerHTMLYLabel(text.children, height, 26);
    }
  }

  // render a label on the canvas
  function renderLabel(parentGfx, label, options, type) {
    let text = textRenderer.createText(label || "", options);
    let height = 0;

    svgClasses(text).add("djs-label");
    setCoordinates(type, text, options, height, parentGfx);

    svgAppend(parentGfx, text);
    return text;
  }

  // determine the Y-coordinate of the label / number to be rendered
  function manipulateInnerHTMLYLabel(children, y, offset) {
    if (children) {
      let result = "";
      for (let i = 0; i < children.length; i++) {
        result += children[i].outerHTML.replace(
          /y="-?\d*.\d*"/,
          'y="' + (Number(y) + offset + 14 * i) + '"',
        );
      }
      return result;
    }
  }

  // determine the X-coordinate of the label / number to be rendered
  function manipulateInnerHTMLXLabel(children, x, offset) {
    if (children) {
      let result = "";
      for (let i = 0; i < children.length; i++) {
        result += children[i].outerHTML.replace(
          /x="-?\d*.\d*"/,
          'x="' + (Number(x) + offset + 14) + '"',
        );
      }
      return result;
    }
  }

  // draw functions
  this.drawGroup = function (parentGfx, element) {
    if (!element.businessObject.pickedColor) {
      element.businessObject.pickedColor = DEFAULT_COLOR;
    }
    let rect = drawRect(
      parentGfx,
      element.width,
      element.height,
      0,
      assign(
        {
          fill: "none",
          stroke: element.businessObject.pickedColor,
        },
        element.attrs,
      ),
    );
    renderActorAndWorkObjectLabel(parentGfx, element, "left-top", 8);

    return rect;
  };

  function applyColorToCustomSvgIcon(pickedColor, iconSvg) {
    if (!pickedColor) {
      return iconSvg;
    }
    const [rest, base64Svg] = iconSvg.split("base64,");
    const svg = atob(base64Svg);
    const coloredSvg = applyColorToIcon(pickedColor, svg);
    const encodedColoredSvg = btoa(coloredSvg);
    return rest + "base64," + encodedColoredSvg;
  }

  function applyColorToIcon(pickedColor = DEFAULT_COLOR, iconSvg) {
    const match = iconSvg.match(
      /fill=\s*"(?!none).*?"|fill:\s*[#r]\w*[;\s]{1}/,
    );
    if (match && match.some((it) => it)) {
      return iconSvg
        .replaceAll(/fill=\s*"(?!none).*?"/g, `fill="${pickedColor} "`)
        .replaceAll(/fill:\s*[#r]\w*[;\s]{1}/g, `fill:${pickedColor};`);
    } else {
      const index = iconSvg.indexOf("<svg ") + 5;
      return (
        iconSvg.substring(0, index) +
        ' fill=" ' +
        pickedColor +
        '" ' +
        iconSvg.substring(index)
      );
    }
  }

  function getIconSvg(icon, element) {
    const pickedColor = element.businessObject.pickedColor;
    if (isCustomIcon(icon)) {
      let dataURL;
      if (isCustomSvgIcon(icon)) {
        dataURL = applyColorToCustomSvgIcon(pickedColor, icon);
      } else {
        dataURL = icon;
        if (pickedColor && pickedColor !== DEFAULT_COLOR) {
          document.dispatchEvent(new CustomEvent("errorColoringOnlySvg"));
        }
      }
      return (
        '<svg viewBox="0 0 24 24" width="48" height="48" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">' +
        '<image width="24" height="24" xlink:href="' +
        dataURL +
        '"/></svg>'
      );
    } else {
      return applyColorToIcon(pickedColor, icon);
    }
  }

  this.drawActor = function (parent, element) {
    let svgDynamicSizeAttributes = {
      width: element.width,
      height: element.height,
    };
    let iconSRC = _iconDictionaryService.getTypeIconSRC(
      ElementTypes.ACTOR,
      ElementTypes.getIconId(element.type),
    );
    iconSRC = getIconSvg(iconSRC, element);
    let actor = svgCreate(iconSRC);

    svgAttr(actor, svgDynamicSizeAttributes);
    svgAppend(parent, actor);

    renderActorAndWorkObjectLabel(parent, element, "center", -5);
    return actor;
  };

  this.drawWorkObject = function (parent, element) {
    let svgDynamicSizeAttributes = {
        width: element.width * 0.65,
        height: element.height * 0.65,
        x: element.width / 2 - 25,
        y: element.height / 2 - 25,
      },
      workObject;
    let iconSRC = _iconDictionaryService.getTypeIconSRC(
      ElementTypes.WORKOBJECT,
      ElementTypes.getIconId(element.type),
    );
    iconSRC = getIconSvg(iconSRC, element);
    workObject = svgCreate(iconSRC);

    svgAttr(workObject, svgDynamicSizeAttributes);
    svgAppend(parent, workObject);
    renderActorAndWorkObjectLabel(parent, element, "center", -5);

    return workObject;
  };

  function useColorForActivity(element) {
    if (!element.businessObject.pickedColor) {
      element.businessObject.pickedColor = "black";
    }
    let attrs = "";
    return computeStyle(attrs, {
      stroke: element.businessObject.pickedColor,
      fill: "none",
      strokeWidth: 1.5,
      strokeLinejoin: "round",
      markerEnd: marker(
        "activity",
        "black",
        element.businessObject.pickedColor,
      ),
    });
  }

  this.drawActivity = function (p, element) {
    adjustForTextOverlap(element);

    if (element) {
      let attrs = useColorForActivity(element);

      let x = svgAppend(p, createLine(element.waypoints, attrs));
      renderActivityLabel(p, element);
      renderExternalNumber(p, element);

      // just adjusting the start- and endpoint of the connection-element moves only the drawn connection,
      // not the interactive line. This can be fixed by manually overriding the points of the interactive polyline
      // in the HTMl with the points of the drawn one.
      // this however does not adjust the surrounding box of the connection.
      fixConnectionInHTML(p.parentElement);

      // changes the color of the moved activity back to original instead of blue
      if (p.className.baseVal === "djs-dragger") {
        svgClasses(p).remove("djs-dragger");
        svgClasses(p).add("djs-connection-preview");
      }

      return x;
    }
  };

  function checkIfPointOverlapsText(point, source) {
    if (point.y > source.y + 60) {
      if (point.x > source.x + 3 && point.x < source.x + 72) {
        let lineOffset = getLineOffset(source);
        if (source.y + 75 + lineOffset > point.y) {
          point.y += lineOffset;
        }
      }
    }
  }

  function adjustForTextOverlap(element) {
    let source = element.source;
    let target = element.target;

    let waypoints = element.waypoints;
    let startPoint = waypoints[0];
    let endPoint = waypoints[waypoints.length - 1];

    if (startPoint && endPoint && source && target) {
      checkIfPointOverlapsText(startPoint, source);
      checkIfPointOverlapsText(endPoint, source);
    }
  }

  function getLineOffset(element) {
    let id = element.id;
    let offset = 0;

    let objects = document.getElementsByClassName("djs-element djs-shape");
    for (let i = 0; i < objects.length; i++) {
      let data_id = objects.item(i).getAttribute("data-element-id");
      if (data_id === id) {
        let object = objects.item(i);
        let text = object.getElementsByTagName("text")[0];
        let tspans = text.getElementsByTagName("tspan");
        let tspan = tspans[tspans.length - 1];
        offset = tspan.getAttribute("y");
      }
    }
    return offset - 70;
  }

  function fixConnectionInHTML(wantedConnection) {
    if (wantedConnection) {
      let polylines = wantedConnection.getElementsByTagName("polyline");
      if (polylines.length > 1) {
        polylines[1].setAttribute(
          "points",
          polylines[0].getAttribute("points"),
        );
      }
    }
  }

  this.drawDSConnection = function (p, element) {
    let attrs = "";
    attrs = computeStyle(attrs, {
      stroke: element.businessObject.pickedColor ?? "black",
      strokeWidth: 1.5,
      strokeLinejoin: "round",
      strokeDasharray: "5, 5",
    });

    return svgAppend(p, createLine(element.waypoints, attrs));
  };

  this.drawAnnotation = function (parentGfx, element) {
    let style = {
      fill: "none",
      stroke: "none",
    };

    let text = element.businessObject.text || "";
    if (element.businessObject.text) {
      let height = element.height ?? 0;

      if (height === 0 && element.businessObject.number) {
        height = element.businessObject.number;
      }
      assign(element, {
        height: height,
      });

      // for some reason the keyword height is not exported, so we use another, which we know will be exported,
      // to ensure persistent annotation heights between sessions
      assign(element.businessObject, {
        number: height,
      });
    }

    let textElement = drawRect(
      parentGfx,
      element.width,
      element.height,
      0,
      0,
      style,
    );
    let bracketPath = getAnnotationBracketSvg(element.height);

    drawPath(parentGfx, bracketPath, {
      stroke: element.businessObject.pickedColor ?? "black",
    });

    renderLabel(parentGfx, text, {
      box: element,
      align: "left-top",
      padding: 5,
      style: {
        fill: element.businessObject.pickedColor ?? "black",
      },
    });

    return textElement;
  };

  // draw helper functions
  function drawPath(parentGfx, d, attrs) {
    attrs = computeStyle(attrs, ["no-fill"], {
      strokeWidth: 2,
      stroke: "black",
    });

    let path = svgCreate("path");
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
      stroke: "black",
      strokeWidth: 2,
      fill: "white",
    });

    let rect = svgCreate("rect");
    svgAttr(rect, {
      x: offset,
      y: offset,
      width: width - offset * 2,
      height: height - offset * 2,
      rx: r,
      ry: r,
    });

    svgAttr(rect, attrs);
    svgAppend(parentGfx, rect);

    return rect;
  }

  // marker functions ("markers" are arrowheads of activities)
  function marker(type, fill, stroke) {
    let id = type + "-" + fill + "-" + stroke + "-" + rendererId;

    if (!markers[id]) {
      createMarker(type, fill, stroke);
    }
    return "url(#" + id + ")";
  }

  function createMarker(type, fill, stroke) {
    let id = type + "-" + fill + "-" + stroke + "-" + rendererId;

    if (type === "activity") {
      let activityArrow = svgCreate("path");
      svgAttr(activityArrow, { d: "M 1 5 L 11 10 L 1 15 Z" });

      addMarker(id, {
        element: activityArrow,
        ref: { x: 11, y: 10 },
        scale: 0.5,
        attrs: {
          fill: stroke,
          stroke: stroke,
        },
      });
    }
  }

  function addMarker(id, options) {
    let attrs = assign(
      {
        fill: "black",
        strokeWidth: 1,
        strokeLinecap: "round",
        strokeDasharray: "none",
      },
      options.attrs,
    );

    let ref = options.ref || { x: 0, y: 0 };
    let scale = options.scale || 1;

    // resetting stroke dash array
    if (attrs.strokeDasharray === "none") {
      attrs.strokeDasharray = [10000, 1];
    }

    let marker = svgCreate("marker");

    svgAttr(options.element, attrs);
    svgAppend(marker, options.element);
    svgAttr(marker, {
      id: id,
      viewBox: "0 0 20 20",
      refX: ref.x,
      refY: ref.y,
      markerWidth: 20 * scale,
      markerHeight: 20 * scale,
      orient: "auto",
    });

    let defs = domQuery("defs", canvas._svg);
    if (!defs) {
      defs = svgCreate("defs");
      svgAppend(canvas._svg, defs);
    }
    svgAppend(defs, marker);
    markers[id] = marker;
  }

  // path functions
  this.getWorkObjectPath = function (shape) {
    let rectangle = getRectPath(shape);
    return componentsToPath(rectangle);
  };

  this.getGroupPath = function (shape) {
    let rectangle = getRectPath(shape);
    return componentsToPath(rectangle);
  };

  this.getActivityPath = function (connection) {
    let waypoints = connection.waypoints.map(function (p) {
      return p.original || p;
    });

    let activityPath = [["M", waypoints[0].x, waypoints[0].y]];

    waypoints.forEach(function (waypoint, index) {
      if (index !== 0) {
        activityPath.push(["L", waypoint.x, waypoint.y]);
      }
    });
    return componentsToPath(activityPath);
  };

  this.getActorPath = function (shape) {
    let rectangle = getRectPath(shape);
    return componentsToPath(rectangle);
  };

  eventBus.on("bendpoint.move.start", 200, function (event) {
    // the bendpoint which we are dragging will otherwise be displayed with 0.3 opacity
    // through bendpoint-dragging we match the css class more specificly, hence our style applies
    svgClasses(event.context.draggerGfx).add("bendpoint-dragging");
    // the old path of the activity will otherwise be displayed in gray
    canvas.addMarker(event.context.connection, "djs-element-hidden");
  });

  eventBus.on("bendpoint.move.end", 2000, function (event) {
    // the acitvity will not be displayed if we don't remove the marker we added during bendpoint.move.start
    // high priority is neccessary, so we come before something that might stop the execution
    canvas.removeMarker(event.context.connection, "djs-element-hidden");
  });
}

inherits(DomainStoryRenderer, BaseRenderer);

DomainStoryRenderer.$inject = [
  "eventBus",
  "styles",
  "canvas",
  "textRenderer",
  "commandStack",
];

DomainStoryRenderer.prototype.canRender = function (element) {
  return /^domainStory:/.test(element.type);
};

DomainStoryRenderer.prototype.drawShape = function (p, element) {
  // polyfill for tests
  if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, "startsWith", {
      value: function (search, pos) {
        pos = !pos || pos < 0 ? 0 : +pos;
        return this.substring(pos, pos + search.length) === search;
      },
    });
  }

  let type = element.type;
  element.businessObject.type = type;

  _elementRegistryService.correctInitialize();
  _dirtyFlagService.makeDirty();

  if (type.includes(ElementTypes.ACTOR)) {
    return this.drawActor(p, element);
  } else if (type.includes(ElementTypes.WORKOBJECT)) {
    return this.drawWorkObject(p, element);
  } else if (type.includes(ElementTypes.TEXTANNOTATION)) {
    return this.drawAnnotation(p, element);
  } else if (type.includes(ElementTypes.GROUP)) {
    return this.drawGroup(p, element);
  }
};

DomainStoryRenderer.prototype.getShapePath = function (shape) {
  let type = shape.type;

  if (type.includes(ElementTypes.ACTOR)) {
    return this.getActorPath(shape);
  } else if (type.includes(ElementTypes.WORKOBJECT)) {
    return this.getWorkObjectPath(shape);
  } else if (type.includes(ElementTypes.GROUP)) {
    return this.getGroupPath(shape);
  }
};

DomainStoryRenderer.prototype.drawConnection = function (p, element) {
  let type = element.type;

  _dirtyFlagService.makeDirty();

  // fixes activities that were copy-pasted
  if (!element.businessObject.type) {
    element.businessObject.type = type;
  }
  if (type === ElementTypes.ACTIVITY) {
    return this.drawActivity(p, element);
  } else if (type === ElementTypes.CONNECTION) {
    return this.drawDSConnection(p, element);
  }
};

// creates a SVG path that describes a rectangle which encloses the given shape.
function getRectPath(shape) {
  let offset = 5;
  let x = shape.x,
    y = shape.y,
    width = shape.width / 2 + offset,
    height = shape.height / 2 + offset;

  return [
    ["M", x, y],
    ["l", width, 0],
    ["l", width, height],
    ["l", -width, height],
    ["l", -width, 0],
    ["z"],
  ];
}
