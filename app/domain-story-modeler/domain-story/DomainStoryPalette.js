'use strict';

import { assign } from 'min-dash';

/**
 * A palette that allows you to create BPMN _and_ custom elements.
 */

export default function PaletteProvider(palette, create, elementFactory, spaceTool, lassoTool) {

  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;

  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'modeling'
];

PaletteProvider.prototype.getPaletteEntries = function() {

  var actions = {},
      create = this._create,
      elementFactory = this._elementFactory,
      spaceTool = this._spaceTool,
      lassoTool = this._lassoTool;

  function createAction(type, group, className, title, options) {

    function createListener(event) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      assign(shape.businessObject, {
        id: shape.id
      });

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      create.start(event, shape);
    }

    var shortType = type.replace(/^domainStory:/, '');

    return {
      group: group,
      className: className,
      title: 'Create ' + title || 'Create ' + shortType,
      action: {
        dragstart: createListener,
        click: createListener
      }
    };
  }

  assign(actions, {
    'domainStory-actorPerson': createAction(
      'domainStory:actorPerson', 'actor', 'icon-domain-story-actor-person', 'person'
    ),
    'domainStory-actorGroup': createAction(
      'domainStory:actorGroup', 'actor', 'icon-domain-story-actor-group', 'people'
    ),
    'domainStory-actorSystem': createAction(
      'domainStory:actorSystem', 'actor', 'icon-domain-story-actor-system', 'system'
    ),
    'actor-separator': {
      group: 'actor',
      separator: true
    },
    'domainStory-workObject': createAction(
      'domainStory:workObject', 'workObject', 'icon-domain-story-workObject', 'document'
    ),
    'domainStory-workObjectFolder': createAction(
      'domainStory:workObjectFolder', 'workObject', 'icon-domain-story-workObject-folder', 'folder'
    ),
    'domainStory-workObjectCall': createAction(
      'domainStory:workObjectCall', 'workObject', 'icon-domain-story-workObject-call', 'call'
    ),
    'domainStory-workObjectEmail': createAction(
      'domainStory:workObjectEmail', 'workObject', 'icon-domain-story-workObject-email', 'email'
    ),
    'domainStory-workObjectBubble': createAction(
      'domainStory:workObjectBubble', 'workObject', 'icon-domain-story-workObject-bubble', 'conversation'
    ),
    'domainStory-workObjectInfo': createAction(
      'domainStory:workObjectInfo', 'workObject', 'icon-domain-story-workObject-info', 'infomation'
    ),
    'workObject-separator': {
      group: 'workObject',
      separator: true
    },
    'domainStory-group': createAction(
      'domainStory:group', 'group', 'icon-domain-story-group', 'group'
    ),
    'group-separator': {
      group: 'group',
      separator: true
    },
    'lasso-tool': {
      group: 'tools',
      className: 'bpmn-icon-lasso-tool',
      title: 'Activate the lasso tool',
      action: {
        click: function(event) {
          lassoTool.activateSelection(event);
        }
      }
    },
    'space-tool': {
      group: 'tools',
      className: 'bpmn-icon-space-tool',
      title: 'Activate the create/remove space tool',
      action: {
        click: function(event) {
          spaceTool.activateSelection(event);
        }
      }
    }
  });

  return actions;
};