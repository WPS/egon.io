import Diagram from 'diagram-js';

import {
  assign,
  isNumber,
  omit
} from 'min-dash';

import {
  domify,
  query as domQuery,
} from 'min-dom';

import inherits from 'inherits-browser';

export default function BaseViewer(options) {

  options = assign({}, DEFAULT_OPTIONS, options);

  this._container = this._createContainer(options);

  this._init(this._container, options);
}

inherits(BaseViewer, Diagram);

BaseViewer.prototype._init = function(container, options) {

  var baseModules = options.modules || this.getModules(),
    additionalModules = options.additionalModules || [],
    staticModules = [
      {
        bpmnjs: [ 'value', this ] //TODO
      }
    ];

  var diagramModules = [].concat(staticModules, baseModules, additionalModules);

  var diagramOptions = assign(omit(options, [ 'additionalModules' ]), {
    canvas: assign({}, options.canvas, { container: container }),
    modules: diagramModules
  });

  // invoke diagram constructor
  Diagram.call(this, diagramOptions);

  if (options && options.container) {
    this.attachTo(options.container);
  }
};

BaseViewer.prototype._createContainer = function(options) {

  var container = domify('<div class="egon-container"></div>');

  assign(container.style, {
    width: ensureUnit(options.width),
    height: ensureUnit(options.height),
    position: options.position
  });

  return container;
};

BaseViewer.prototype.attachTo = function(parentNode) {

  if (!parentNode) {
    throw new Error('parentNode required');
  }

  // ensure we detach from the
  // previous, old parent
  this.detach();

  // unwrap jQuery if provided
  if (parentNode.get && parentNode.constructor.prototype.jquery) {
    parentNode = parentNode.get(0);
  }

  if (typeof parentNode === 'string') {
    parentNode = domQuery(parentNode);
  }

  parentNode.appendChild(this._container);

  this._emit('attach', {});

  this.get('canvas').resized();
};

BaseViewer.prototype.detach = function() {

  const container = this._container,
    parentNode = container.parentNode;

  if (!parentNode) {
    return;
  }

  /**
   * A `detach` event.
   *
   * @event BaseViewer#DetachEvent
   * @type {Object}
   */
  this._emit('detach', {});

  parentNode.removeChild(container);
};

BaseViewer.prototype.getModules = function() {
  return this._modules;
};

BaseViewer.prototype._emit = function(type, event) {
  return this.get('eventBus').fire(type, event);
};

function ensureUnit(val) {
  return val + (isNumber(val) ? 'px' : '');
}

var DEFAULT_OPTIONS = {
  width: '100%',
  height: '100%',
  position: 'relative'
};
