import inherits from 'inherits';

import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';

import { generateAutomaticNumber } from './util/DSActivityUtil';

import {
  assign,
  bind
} from 'min-dash';
import Modeler from 'bpmn-js/lib/Modeler';


export default function DomainStoryContextPadProvider(injector, connect, translate, elementFactory, create, canvas, contextPad, popupMenu, replaceMenuProvider, commandStack, eventBus, modeling) {

  injector.invoke(ContextPadProvider, this);
  var autoPlace = injector.get('autoPlace', false);

  var cached = bind(this.getContextPadEntries, this);

  popupMenu.registerProvider('ds-replace', replaceMenuProvider);
  popupMenu.registerProvider('bpmn-replace', replaceMenuProvider);

  this.getContextPadEntries = function(element) {
    var actions = cached(element);

    function startConnect(event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    }

    // entries only for specific types of elements:
    switch (element.type) {
    // Google Material Icon Font does not seem to allow to put the icon name inline
    // since diagram-js's ContextPad does assume the icon is provided inline,
    // we could either write our own ContextPad or fix the html manually. Here, we do the latter:
    case 'domainStory:workObject':
    case 'domainStory:workObjectFolder':
    case 'domainStory:workObjectCall':
    case 'domainStory:workObjectEmail':
    case 'domainStory:workObjectBubble':
    case 'domainStory:workObjectInfo':

      assign(actions, {
        'append.actorPerson': appendAction('domainStory:actorPerson', 'icon-domain-story-actor-person', 'person', 'actors'),
        'append.actorGroup':  appendAction('domainStory:actorGroup', 'icon-domain-story-actor-group', 'people', 'actors'),
        'append.actorSystem': appendAction('domainStory:actorSystem', 'icon-domain-story-actor-system', 'system', 'actors')
      });

    case 'domainStory:actorPerson':
    case 'domainStory:actorGroup':
    case 'domainStory:actorSystem':

      assign(actions, {
        'append.workObject': appendAction('domainStory:workObject', 'icon-domain-story-workObject', 'workobject', 'workObjects'),
        'append.workObjectFolder': appendAction('domainStory:workObjectFolder', 'icon-domain-story-workObject-folder', 'folder', 'workObjects'),
        'append.workObjectCall': appendAction('domainStory:workObjectCall', 'icon-domain-story-workObject-call', 'call', 'workObjects'),
        'append.workObjectEmail': appendAction('domainStory:workObjectEmail', 'icon-domain-story-workObject-email', 'email', 'workObjects'),
        'append.workObjectBubble': appendAction('domainStory:workObjectBubble', 'icon-domain-story-workObject-bubble', 'conversation', 'workObjects'),
        'append.workObjectInfo': appendAction('domainStory:workObjectInfo', 'icon-domain-story-workObject-info', 'information', 'workObjects')
      });

      // replace menu entry
      assign(actions, {
        'replace': {
          group: 'edit',
          className: 'bpmn-icon-screw-wrench',
          title: translate('Change type'),
          action: {
            click: function(event, element) {

              var position = assign(getReplaceMenuPosition(element), {
                cursor: { x: event.x, y: event.y }
              });
              popupMenu.open(element, 'ds-replace', position);
            }
          }
        }
      });

      assign(actions, {
        'connect': {
          group: 'connect',
          className: 'bpmn-icon-connection',
          title: translate('Connect using custom connection'),
          action: {
            click: startConnect,
            dragstart: startConnect
          }
        }
      });

    case 'domainStory:group':

      assign(actions, {
        'append.text-annotation': appendAction('domainStory:textAnnotation', 'bpmn-icon-text-annotation')
      });
      break;

    case 'domainStory:activity' :
    // for some reason, the change direction icon is appended at the end of the edit group
    // to make sure, that the delete icon is the last one, we remove it from the actions-object
    // and add it after adding the change direction functionality
      delete actions.delete;
      assign(actions, {
        'changeDirection': {
          group: 'edit',
          className: 'icon-domain-story-changeDirection',
          title: translate('Change direction'),
          action: {
            // event needs to be adressed
            click: function(event, element) {
              changeDirection(element);
            }
          }
        }
      });
      assign(actions,{
        'delete': {
          group: 'edit',
          className: 'bpmn-icon-trash',
          title: 'Remove',
          action: {
            click: function(event, element) {
              Modeler.removeElement(element);
            }
          }
        }
      });
    }
    return actions;
  };

  function changeDirection(element) {

    var context;
    var businessObject = element.businessObject;
    var newNumber;

    if (element.source.type.includes('domainStory:actor')) {
      newNumber = 0;
    }
    else {
      newNumber = generateAutomaticNumber(element, canvas, commandStack);
    }

    context ={
      businessObject: businessObject,
      newNumber: newNumber,
      element: element
    };
    commandStack.execute('activity.directionChange', context);
  }

  function getReplaceMenuPosition(element) {

    var Y_OFFSET = 5;

    var diagramContainer = canvas.getContainer(),
        pad = contextPad.getPad(element).html;

    var diagramRect = diagramContainer.getBoundingClientRect(),
        padRect = pad.getBoundingClientRect();

    var top = padRect.top - diagramRect.top;
    var left = padRect.left - diagramRect.left;

    var pos = {
      x: left,
      y: top + padRect.height + Y_OFFSET
    };

    return pos;
  }

  /**
  * create an append action
  *
  * @param {String} type
  * @param {String} className
  * @param {String} [title]
  * @param {Object} [options]
  *
  * @return {Object} descriptor
  */
  function appendAction(type, className, title, group, options) {

    if (typeof title !== 'string') {
      options = title;
      title = translate('{type}', { type: type.replace(/^domainStory:/, '') });
    }

    function appendStart(event, element) {

      var shape = elementFactory.createShape(assign({ type: type }, options));
      create.start(event, shape, element);
    }

    autoPlace ? function(element) {
      var shape = elementFactory.createShape(assign({ type: type }, options));

      autoPlace.append(element, shape);
    } : appendStart;

    return {
      group: group,
      className: className,
      title: 'Append ' + title,
      action: {
        dragstart: appendStart,
        click: appendStart
      }
    };
  }
}

inherits(DomainStoryContextPadProvider, ContextPadProvider);

DomainStoryContextPadProvider.$inject = [
  'injector',
  'connect',
  'translate',
  'elementFactory',
  'create',
  'canvas',
  'contextPad',
  'popupMenu',
  'replaceMenuProvider',
  'commandStack',
  'eventBus',
  'modeling'
];