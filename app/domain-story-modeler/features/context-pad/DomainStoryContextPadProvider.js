'use strict';

import inherits from 'inherits';

import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';


import {
  assign,
  bind
} from 'min-dash';
import { generateAutomaticNumber } from '../numbering/numbering';
import { getNameFromType } from '../../language/naming';
import { getWorkObjectIconDictionary } from '../../language/icon/workObjectIconDictionary';
import { getActorIconDictionary } from '../../language/icon/actorIconDictionary';
import { getIconForType } from '../../language/icon/iconDictionary';
import { ACTIVITY, ACTOR, GROUP, TEXTANNOTATION } from '../../language/elementTypes';

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

    if (element.type.includes('workObject')) {
      addActors(appendAction, actions);
      addWorkObjects(appendAction, actions);
      addChangeWorkObjectTypeMenu(actions);
      addConnectWithActivity(actions, startConnect);
      addTextAnnotation(actions);
    }

    else if (element.type.includes('actor')) {
      addWorkObjects(appendAction, actions);
      addChangeActorTypeMenu(actions);
      addConnectWithActivity(actions, startConnect);
      addTextAnnotation(actions);
    }

    else if (element.type.includes(GROUP)) {
      addTextAnnotation(actions);
    }
    else if (element.type.includes(ACTIVITY)) {
      // the change direction icon is appended at the end of the edit group by default,
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

      assign(actions, {
        'delete': {
          group: 'edit',
          className: 'bpmn-icon-trash',
          title: 'Remove',
          action: {
            click: function(event, element) {
              modeling.removeElements({ element });
            }
          }
        }
      });
    }

    return actions;
  };

  function addChangeActorTypeMenu(actions) {
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
  }

  function addTextAnnotation(actions) {
    assign(actions, {
      'append.text-annotation': appendAction(TEXTANNOTATION, 'bpmn-icon-text-annotation')
    });
  }

  function addConnectWithActivity(actions, startConnect) {
    assign(actions, {
      'connect': {
        group: 'connect',
        className: 'bpmn-icon-connection',
        title: translate('Connect with activity'),
        action: {
          click: startConnect,
          dragstart: startConnect
        }
      }
    });
  }

  function addWorkObjects(appendAction, actions) {
    var workObjectTypes = getWorkObjectIconDictionary();
    workObjectTypes.keysArray().forEach(workObjectType => {
      var name = getNameFromType(workObjectType);
      var icon = getIconForType(workObjectType);
      var action = [];
      action['append.workObject' + name] = appendAction(workObjectType, icon, name, 'workObjects');
      assign(actions, action);
    });
  }

  function addActors(appendAction, actions) {
    var actorTypes = getActorIconDictionary();
    actorTypes.keysArray().forEach(actorType => {
      var name = getNameFromType(actorType);
      var icon = getIconForType(actorType);
      var action = [];
      action['append.actor' + name] = appendAction(actorType, icon, name, 'actors');
      assign(actions, action);
    });
  }

  function addChangeWorkObjectTypeMenu(actions) {
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
  }

  // change the direction of an activity
  function changeDirection(element) {
    var context;
    var businessObject = element.businessObject;
    var newNumber;

    if (element.source.type.includes(ACTOR)) {
      newNumber = 0;
    }
    else {
      newNumber = generateAutomaticNumber(element, canvas, commandStack);
    }
    context = {
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
