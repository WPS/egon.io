/**
 * The code in the <project-logo></project-logo> area
 * must not be changed.
 *
 * @see http://bpmn.io/license for more information.
 */
import { assign, isNumber, omit } from "min-dash";

import {
  domify,
  assignStyle,
  query as domQuery,
  remove as domRemove,
} from "min-dom";

import { innerSVG } from "tiny-svg";

import Diagram from "diagram-js";

import inherits from "inherits-browser";

export default function BaseViewer(options) {
  options = assign({}, DEFAULT_OPTIONS, options);

  this._container = this._createContainer(options);

  /* <project-logo> */
  addProjectLogo(this._container);
  /* </project-logo> */

  this._init(this._container, options);
}

inherits(BaseViewer, Diagram);

BaseViewer.prototype.saveSVG = async function saveSVG() {
  this._emit("saveSVG.start");

  let svg, err;

  try {
    const canvas = this.get("canvas");

    const contentNode = canvas.getActiveLayer(),
      defsNode = domQuery(":scope > defs", canvas._svg);

    const contents = innerSVG(contentNode),
      defs = defsNode ? "<defs>" + innerSVG(defsNode) + "</defs>" : "";

    const bbox = contentNode.getBBox();

    svg =
      '<?xml version="1.0" encoding="utf-8"?>\n' +
      "<!-- created with diagram-js / http://bpmn.io -->\n" +
      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
      'width="' +
      bbox.width +
      '" height="' +
      bbox.height +
      '" ' +
      'viewBox="' +
      bbox.x +
      " " +
      bbox.y +
      " " +
      bbox.width +
      " " +
      bbox.height +
      '" version="1.1">' +
      defs +
      contents +
      "</svg>";
  } catch (e) {
    err = e;
  }

  this._emit("saveSVG.done", {
    error: err,
    svg: svg,
  });

  if (err) {
    throw err;
  }

  return { svg };
};

BaseViewer.prototype.getModules = function () {
  return this._modules;
};

BaseViewer.prototype.clear = function () {
  if (!this.getDefinitions()) {
    // no diagram to clear
    return;
  }

  // remove drawn elements
  Diagram.prototype.clear.call(this);
};

BaseViewer.prototype.destroy = function () {
  // diagram destroy
  Diagram.prototype.destroy.call(this);

  // dom detach
  domRemove(this._container);
};

BaseViewer.prototype.on = function (events, priority, callback, that) {
  return this.get("eventBus").on(events, priority, callback, that);
};

BaseViewer.prototype.off = function (events, callback) {
  this.get("eventBus").off(events, callback);
};

BaseViewer.prototype.attachTo = function (parentNode) {
  if (!parentNode) {
    throw new Error("parentNode required");
  }

  // ensure we detach from the
  // previous, old parent
  this.detach();

  // unwrap jQuery if provided
  if (parentNode.get && parentNode.constructor.prototype.jquery) {
    parentNode = parentNode.get(0);
  }

  if (typeof parentNode === "string") {
    parentNode = domQuery(parentNode);
  }

  parentNode.appendChild(this._container);

  this._emit("attach", {});

  this.get("canvas").resized();
};

BaseViewer.prototype.detach = function () {
  const container = this._container,
    parentNode = container.parentNode;

  if (!parentNode) {
    return;
  }
  this._emit("detach", {});

  parentNode.removeChild(container);
};

BaseViewer.prototype._init = function (container, options) {
  const baseModules = options.modules || this.getModules(options),
    additionalModules = options.additionalModules || [],
    staticModules = [
      {
        egon: ["value", this],
      },
    ];

  const diagramModules = [].concat(
    staticModules,
    baseModules,
    additionalModules,
  );

  const diagramOptions = assign(omit(options, ["additionalModules"]), {
    canvas: assign({}, options.canvas, { container: container }),
    modules: diagramModules,
  });

  // invoke diagram constructor
  Diagram.call(this, diagramOptions);

  if (options && options.container) {
    this.attachTo(options.container);
  }
};

BaseViewer.prototype._emit = function (type, event) {
  return this.get("eventBus").fire(type, event);
};

BaseViewer.prototype._createContainer = function (options) {
  const container = domify('<div class="egon-container"></div>');

  assignStyle(container, {
    width: ensureUnit(options.width),
    height: ensureUnit(options.height),
    position: options.position,
  });

  return container;
};

BaseViewer.prototype._modules = [];

// helpers ///////////////

function addWarningsToError(err, warningsAry) {
  err.warnings = warningsAry;
  return err;
}

const DEFAULT_OPTIONS = {
  width: "100%",
  height: "100%",
  position: "relative",
};

/**
 * Ensure the passed argument is a proper unit (defaulting to px)
 */
function ensureUnit(val) {
  return val + (isNumber(val) ? "px" : "");
}

import {
  open as openPoweredBy,
  BPMNIO_IMG,
  LOGO_STYLES,
  LINK_STYLES,
} from "./features/util/PoweredByUtil";

import { event as domEvent } from "min-dom";

/**
 * Adds the project logo to the diagram container as
 * required by the bpmn.io license.
 *
 * @see http://bpmn.io/license
 *
 * @param {Element} container
 */
function addProjectLogo(container) {
  const img = BPMNIO_IMG;

  const linkMarkup =
    '<a href="http://bpmn.io" ' +
    'target="_blank" ' +
    'class="bjs-powered-by" ' +
    'title="Powered by bpmn.io" ' +
    ">" +
    img +
    "</a>";

  const linkElement = domify(linkMarkup);

  assignStyle(domQuery("svg", linkElement), LOGO_STYLES);
  assignStyle(linkElement, LINK_STYLES, {
    position: "absolute",
    bottom: "15px",
    right: "15px",
    zIndex: "100",
  });

  container.appendChild(linkElement);

  domEvent.bind(linkElement, "click", function (event) {
    openPoweredBy();

    event.preventDefault();
  });
}

/* </project-logo> */
