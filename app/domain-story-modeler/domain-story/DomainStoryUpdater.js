import inherits from 'inherits';

import {
  pick,
  assign
} from 'min-dash';

import CommandInterceptor from 'diagram-js/lib/command/CommandInterceptor';

import {
  add as collectionAdd,
  remove as collectionRemove
} from 'diagram-js/lib/util/Collections';

import {
  ifDomainStoryElement,
  isInDomainStoryGroup,
  isDomainStory,
  copyWaypoints,
  isDomainStoryGroup
} from './util/DomainStoryUtil';

/**
 * a handler responsible for updating the custom element's businessObject
 * once changes on the diagram happen.
 */
export default function DomainStoryUpdater(eventBus, bpmnjs) {

  CommandInterceptor.call(this, eventBus);

  function updateCustomElement(e) {
    var context = e.context,
        shape = context.shape,
        businessObject = shape.businessObject;

    if (!isDomainStory(shape)) {
      return;
    }

    var parent = shape.parent;
    var customElements = bpmnjs._customElements;

    // make sure element is added / removed from bpmnjs.customElements
    if (!parent) {
      collectionRemove(customElements, businessObject);
    } else {
      collectionAdd(customElements, businessObject);
    }

    // save custom element position
    assign(businessObject, pick(shape, ['x', 'y']));
    // save custom element size if resizable
    if (isDomainStoryGroup(shape)) {

      assign(businessObject, pick(shape, ['height', 'width']));
      if (parent != null) {
        parent.children.slice().forEach(innerShape => {
          if ((innerShape.id) != shape.id) {
            if (innerShape.x >= shape.x && innerShape.x <= shape.x + shape.width) {
              if (innerShape.y >= shape.y && innerShape.y <= shape.y + shape.height) {
                innerShape.parent = shape;
                if (!shape.children.includes(innerShape)) {
                  shape.children.push(innerShape);
                }
              }
            }
          }
        });
      }
    }

    if (isInDomainStoryGroup(shape)) {
      assign(businessObject, {
        parent: shape.parent.id
      });
    }
  }

  function updateCustomConnection(e) {

    var context = e.context,
        connection = context.connection,
        source = connection.source,
        target = connection.target,
        businessObject = connection.businessObject;

    var parent = connection.parent;

    var customElements = bpmnjs._customElements;

    // make sure element is added / removed from bpmnjs.customElements
    if (!parent) {
      collectionRemove(customElements, businessObject);
    } else {
      collectionAdd(customElements, businessObject);
    }

    // update waypoints
    assign(businessObject, {
      waypoints: copyWaypoints(connection)
    });

    if ((!businessObject.source && !businessObject.target) && (source && target)) {
      assign(businessObject, {
        source: source.id,
        target: target.id
      });
    }

  }

  this.executed([
    'shape.create',
    'shape.move',
    'shape.delete',
    'shape.resize'
  ], ifDomainStoryElement(updateCustomElement));

  this.reverted([
    'shape.create',
    'shape.move',
    'shape.delete',
    'shape.resize'
  ], ifDomainStoryElement(updateCustomElement));

  this.executed([
    'connection.create',
    'connection.reconnectStart',
    'connection.reconnectEnd',
    'connection.updateWaypoints',
    'connection.delete',
    'connection.layout',
    'connection.move'
  ], ifDomainStoryElement(updateCustomConnection));

  this.reverted([
    'connection.create',
    'connection.reconnectStart',
    'connection.reconnectEnd',
    'connection.updateWaypoints',
    'connection.delete',
    'connection.layout',
    'connection.move'
  ], ifDomainStoryElement(updateCustomConnection));

}

inherits(DomainStoryUpdater, CommandInterceptor);

DomainStoryUpdater.$inject = ['eventBus', 'bpmnjs'];