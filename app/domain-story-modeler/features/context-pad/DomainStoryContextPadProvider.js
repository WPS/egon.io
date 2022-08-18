'use strict';

import inherits from 'inherits';

import ContextPadProvider from 'bpmn-js/lib/features/context-pad/ContextPadProvider';
import Picker from 'vanilla-picker';

import {
  assign,
  bind
} from 'min-dash';
import { generateAutomaticNumber } from '../numbering/numbering';
import { getNameFromType } from '../../language/naming';
import { getIconForType } from '../../language/icon/iconDictionary';
import { ACTIVITY, ACTOR, GROUP, TEXTANNOTATION, WORKOBJECT } from '../../language/elementTypes';
import { getTypeDictionary } from '../../language/icon/dictionaries';
import { makeDirty } from '../export/dirtyFlag';
import { getAllStandardIconKeys } from '../../language/icon/all_Icons';
import { getAllGroups, getAllCanvasObjects, getAllActivities } from '../../language/canvasElementRegistry';

export default function DomainStoryContextPadProvider(injector, connect, translate, elementFactory, create, canvas, contextPad, popupMenu, replaceMenuProvider, commandStack, eventBus, modeling) {


  let selectedID;
  let startConnect;

  injector.invoke(ContextPadProvider, this);
  let autoPlace = injector.get('autoPlace', false);

  let cached = bind(this.getContextPadEntries, this);

  const picker = new Picker(document.getElementById('pickerAnchor'));
  const pickerOptions = {
    color: 'black',
    popup: 'bottom'
  };

  picker.setOptions(pickerOptions);
  picker.onDone = function(color) {
    if (selectedID.includes('shape')) {
      const allGroups = getAllGroups();
      const allCanvasObjects = getAllCanvasObjects();

      const isDone=pickerFunction(allCanvasObjects, color);

      if (!isDone) {
        pickerFunction(allGroups, color);
      }
    }
    else if (selectedID.includes('connection')) {
      const allActivities = getAllActivities();
      pickerFunction(allActivities, color);
    }
  };

  function pickerFunction(objects, color) {
    let isDone = false;
    objects.forEach(elem => {
      if (elem.id == selectedID) {

        const context = {
          businessObject: elem.businessObject,
          newColor: color.hex,
          element: elem
        };

        commandStack.execute('element.colorChange', context);
        makeDirty();
        isDone=true;
      }
    });
    return isDone;
  }

  popupMenu.registerProvider('ds-replace', replaceMenuProvider);
  popupMenu.registerProvider('bpmn-replace', replaceMenuProvider);

  this.getContextPadEntries = function(element) {

    /**
     * Get modal elements
     */
    const modal_chaosExperiment = document.getElementById('modal_resilience');

    // const modal_loadtest = document.getElementById('modal_loadtest');
    // const modal_monitoring = document.getElementById('modal_monitoring');

    /**
     * Constants
     */
    const EXPERIMENT = 'ChaosExperiment';
    const LOADTEST = 'Loadtest';
    const MONITORING = 'Monitoring';
    const SERVICE_DELAY = 'ServiceDelay';

    let ids = [];
    let idExists = false;
    const chaosExperiment__label = 'domainStory:workObjectChaosExperiment';

    const allStandardIconKeys = getAllStandardIconKeys();
    let actions = cached(element);

    startConnect= function(event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    };

    // Hier modal box öffnen, falls das Element entweder ein Chaos Experiment, Load test
    // oder resilience test ist
    if (element.type.includes(EXPERIMENT)) {
      console.log('Element in contextprovider is EXPERIMENT', element);
      console.log(element.id);

      let elementContainer = document.getElementById('runtimeAnalysisSummaryContainer');
      let modal_resilience = document.getElementById('modal_resilience');
      let elementName = element.id;
      ids.push(elementName);
      console.log(ids);

      if (elementContainer.hasChildNodes) {
        for (let node of elementContainer.childNodes) {
          if (ids.includes(node.id)) {
            console.log('Node is in container');
            idExists = true;
            break;
          }
        }

        if (!idExists) {
          let newRuntimeAnalysisElement = document.createElement('button');

          newRuntimeAnalysisElement.id = element.id;
          newRuntimeAnalysisElement.classList.add(elementName);
          newRuntimeAnalysisElement.innerText = 'Chaos Experiment ' + element.id.toString();

          newRuntimeAnalysisElement.addEventListener('click', () => {
            modal_resilience.style.display = 'block';
          });

          elementContainer.appendChild(newRuntimeAnalysisElement);
        }
      }

      // modal_chaosExperiment.style.display = 'block';

    } else if (element.type.includes(LOADTEST)) {
      console.log('Element in contextprovider is LOADTEST', element);
    } else if (element.type.includes(MONITORING)) {
      console.log('Element in contextprovider is MONITORING', element);
    } else if (element.type.includes(SERVICE_DELAY)) {
      console.log('Element in contextprovider is SERVICE_DELAY', element);
    }

    if (element.type.includes(WORKOBJECT)) {

      if (element.type.includes(chaosExperiment__label)) {
        addInputFields(actions);
      }

      if (allStandardIconKeys.includes(element.type.replace(WORKOBJECT, ''))) {
        addColorChange(actions);
      }
      addConnectWithActivity(actions, startConnect);
      addTextAnnotation(actions);
      addActors(appendAction, actions);
      addWorkObjects(appendAction, actions);
      addChangeWorkObjectTypeMenu(actions);
    }



    else if (element.type.includes(ACTOR)) {
      if (allStandardIconKeys.includes(element.type.replace(ACTOR, ''))) {
        addColorChange(actions);
      }
      addConnectWithActivity(actions, startConnect);
      addTextAnnotation(actions);
      addWorkObjects(appendAction, actions);
      addChangeActorTypeMenu(actions);
    }

    else if (element.type.includes(GROUP)) {
      delete actions.delete;
      addTextAnnotation(actions);
      assign(actions, {
        'deleteGroup': {
          group: 'edit',
          className: 'bpmn-icon-trash',
          title: 'Remove Group without Child-Elements',
          action: {
            click: function(event, element) {
              modeling.removeGroup(element);
              makeDirty();
            }
          }
        }
      });
      addColorChange(actions);
    }

    else if (element.type.includes(ACTIVITY)) {
      moveDeleteActionToEndOfArray(actions);

      addColorChange(actions);

      assign(actions, {
        'delete': {
          group: 'edit',
          className: 'bpmn-icon-trash',
          title: 'Remove',
          action: {
            click: function(event, element) {
              modeling.removeElements({ element });
              makeDirty();
            }
          }
        }
      });
    }

    return actions;
  };

  function moveDeleteActionToEndOfArray(actions) {
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
  }

  function addChangeActorTypeMenu(actions) {
    assign(actions, {
      'replace': {
        group: 'edit',
        className: 'bpmn-icon-screw-wrench',
        title: translate('Change type'),
        action: {
          click: function(event, element) {
            let position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y }
            });
            popupMenu.open(element, 'ds-replace', position);
          }
        }
      }
    });
  }

  function addColorChange(actions) {
    assign(actions, {
      'colorChange': {
        group:'edit',
        className:'icon-domain-story-color-picker',
        title: translate('Change color'),
        action: {
          click: function(event, element) {
            selectedID = element.id;
            picker.show();

          }
        }
      }
    });
  }

  function addTextAnnotation(actions) {
    assign(actions, {
      'append.text-annotation': appendAction(TEXTANNOTATION, 'bpmn-icon-text-annotation', 'textannotation', 'connect')
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

  function addInputFields(actions) {
    assign(actions, {
      group: 'type',
      className: 'bpmn-icon-testType',
      title: translate('Give a test type')
    });
  }

  function addWorkObjects(appendAction, actions) {
    let workObjectTypes = getTypeDictionary(WORKOBJECT);
    workObjectTypes.keysArray().forEach(workObjectType => {
      let name = getNameFromType(workObjectType);
      let icon = getIconForType(workObjectType);
      let action = [];
      action['append.workObject' + name] = appendAction(workObjectType, icon, name, 'workObjects');
      assign(actions, action);
    });
  }

  function addActors(appendAction, actions) {
    let actorTypes = getTypeDictionary(ACTOR);
    actorTypes.keysArray().forEach(actorType => {
      let name = getNameFromType(actorType);
      let icon = getIconForType(actorType);
      let action = [];
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
            let position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y }
            });
            popupMenu.open(element, 'ds-replace', position);
          }
        }
      }
    });
  }

  function changeDirection(element) {
    let context;
    let businessObject = element.businessObject;
    let newNumber;

    if (element.source.type.includes(ACTOR)) {
      newNumber = 0;
    }
    else {
      newNumber = generateAutomaticNumber(element, commandStack);
    }
    context = {
      businessObject: businessObject,
      newNumber: newNumber,
      element: element
    };
    commandStack.execute('activity.directionChange', context);
  }

  function getReplaceMenuPosition(element) {

    let Y_OFFSET = 5;

    let diagramContainer = canvas.getContainer(),
        pad = contextPad.getPad(element).html;

    let diagramRect = diagramContainer.getBoundingClientRect(),
        padRect = pad.getBoundingClientRect();

    let top = padRect.top - diagramRect.top;
    let left = padRect.left - diagramRect.left;

    let pos = {
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

      let shape = elementFactory.createShape(assign({ type: type }, options));
      let context = {
        elements: [shape],
        hints: {},
        source:element
      };
      create.start(event, shape, context);
    }

    autoPlace ? function(element) {
      let shape = elementFactory.createShape(assign({ type: type }, options));

      autoPlace.append(element, shape);
    } : appendStart;

    return {
      group: group,
      className: className,
      title: 'Append ' + title,
      action: {
        dragstart: startConnect,
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
