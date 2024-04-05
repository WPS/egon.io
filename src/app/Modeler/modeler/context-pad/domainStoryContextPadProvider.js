"use strict";

import inherits from "inherits";

import ContextPadProvider from "bpmn-js/lib/features/context-pad/ContextPadProvider";

import { assign, bind } from "min-dash";
import { generateAutomaticNumber } from "../numbering/numbering";
import { elementTypes } from "src/app/Domain/Common/elementTypes";
import { getAllStandardIconKeys } from "src/app/Domain/Domain-Configuration/allIcons";

let dirtyFlagService;
let iconDictionaryService;

export function initializeContextPadProvider(dirtyFlag, iconDictionary) {
  dirtyFlagService = dirtyFlag;
  iconDictionaryService = iconDictionary;
}

export default function DomainStoryContextPadProvider(
  injector,
  connect,
  translate,
  elementFactory,
  create,
  canvas,
  contextPad,
  popupMenu,
  replaceMenuProvider,
  commandStack,
  eventBus,
  modeling,
) {
  let startConnect;
  let selectedElement;

  injector.invoke(ContextPadProvider, this);
  let autoPlace = injector.get("autoPlace", false);

  let cached = bind(this.getContextPadEntries, this);

  const colorPicker = document.getElementById("colorPicker");
  colorPicker.onchange = (ev) => {
    const context = {
      businessObject: selectedElement.businessObject,
      newColor: ev.target.value,
      element: selectedElement,
    };

    commandStack.execute("element.colorChange", context);
    dirtyFlagService.makeDirty();
  };

  popupMenu.registerProvider("ds-replace", replaceMenuProvider);
  popupMenu.registerProvider("bpmn-replace", replaceMenuProvider);

  this.getContextPadEntries = function (element) {
    const allStandardIconKeys = getAllStandardIconKeys();
    let actions = cached(element);

    startConnect = function (event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    };

    if (element.type.includes(elementTypes.WORKOBJECT)) {
      if (
        allStandardIconKeys.includes(
          element.type.replace(elementTypes.WORKOBJECT, ""),
        )
      ) {
        addColorChange(actions);
      }
      addConnectWithActivity(actions, startConnect);
      addTextAnnotation(actions);
      addActors(appendAction, actions);
      addWorkObjects(appendAction, actions);
      addChangeWorkObjectTypeMenu(actions);
    } else if (element.type.includes(elementTypes.ACTOR)) {
      if (
        allStandardIconKeys.includes(
          element.type.replace(elementTypes.ACTOR, ""),
        )
      ) {
        addColorChange(actions);
      }
      addConnectWithActivity(actions, startConnect);
      addTextAnnotation(actions);
      addWorkObjects(appendAction, actions);
      addChangeActorTypeMenu(actions);
    } else if (element.type.includes(elementTypes.GROUP)) {
      delete actions.delete;
      addTextAnnotation(actions);
      assign(actions, {
        deleteGroup: {
          group: "edit",
          className: "bpmn-icon-trash",
          title: "Remove Group without Child-Elements",
          action: {
            click: function (event, element) {
              modeling.removeGroup(element);
              dirtyFlagService.makeDirty();
            },
          },
        },
      });
      addColorChange(actions);
    } else if (element.type.includes(elementTypes.ACTIVITY)) {
      moveDeleteActionToEndOfArray(actions);

      addColorChange(actions);

      assign(actions, {
        delete: {
          group: "edit",
          className: "bpmn-icon-trash",
          title: "Remove",
          action: {
            click: function (event, element) {
              modeling.removeElements({ element });
              dirtyFlagService.makeDirty();
            },
          },
        },
      });
    }

    return actions;
  };

  function moveDeleteActionToEndOfArray(actions) {
    delete actions.delete;

    assign(actions, {
      changeDirection: {
        group: "edit",
        className: "icon-domain-story-changeDirection",
        title: translate("Change direction"),
        action: {
          // event needs to be addressed
          click: function (event, element) {
            changeDirection(element);
          },
        },
      },
    });
  }

  function addChangeActorTypeMenu(actions) {
    assign(actions, {
      replace: {
        group: "edit",
        className: "bpmn-icon-screw-wrench",
        title: translate("Change type"),
        action: {
          click: function (event, element) {
            let position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y },
            });
            popupMenu.open(element, "ds-replace", position);
          },
        },
      },
    });
  }

  function addColorChange(actions) {
    assign(actions, {
      colorChange: {
        group: "edit",
        className: "icon-domain-story-color-picker",
        title: translate("Change color"),
        action: {
          click: function (event, element) {
            selectedElement = element;
            colorPicker.click();
          },
        },
      },
    });
  }

  function addTextAnnotation(actions) {
    assign(actions, {
      "append.text-annotation": appendAction(
        elementTypes.TEXTANNOTATION,
        "bpmn-icon-text-annotation",
        "textannotation",
        "connect",
      ),
    });
  }

  function addConnectWithActivity(actions, startConnect) {
    assign(actions, {
      connect: {
        group: "connect",
        className: "bpmn-icon-connection",
        title: translate("Connect with activity"),
        action: {
          click: startConnect,
          dragstart: startConnect,
        },
      },
    });
  }

  function addWorkObjects(appendAction, actions) {
    let workObjectTypes = iconDictionaryService.getTypeDictionary(
      elementTypes.WORKOBJECT,
    );
    workObjectTypes.keysArray().forEach((workObjectType) => {
      let name = workObjectType;
      let icon = iconDictionaryService.getIconForBPMN(
        elementTypes.WORKOBJECT,
        workObjectType,
      );
      let action = [];
      action["append.workObject" + name] = appendAction(
        `${elementTypes.WORKOBJECT}${workObjectType}`,
        icon,
        name,
        "workObjects",
      );
      assign(actions, action);
    });
  }

  function addActors(appendAction, actions) {
    let actorTypes = iconDictionaryService.getTypeDictionary(
      elementTypes.ACTOR,
    );
    actorTypes.keysArray().forEach((actorType) => {
      let name = actorType;
      let icon = iconDictionaryService.getIconForBPMN(
        elementTypes.ACTOR,
        actorType,
      );
      let action = [];
      action["append.actor" + name] = appendAction(
        `${elementTypes.ACTOR}${actorType}`,
        icon,
        name,
        "actors",
      );
      assign(actions, action);
    });
  }

  function addChangeWorkObjectTypeMenu(actions) {
    assign(actions, {
      replace: {
        group: "edit",
        className: "bpmn-icon-screw-wrench",
        title: translate("Change type"),
        action: {
          click: function (event, element) {
            let position = assign(getReplaceMenuPosition(element), {
              cursor: { x: event.x, y: event.y },
            });
            popupMenu.open(element, "ds-replace", position);
          },
        },
      },
    });
  }

  function changeDirection(element) {
    let context;
    let businessObject = element.businessObject;
    let newNumber;

    if (element.source.type.includes(elementTypes.ACTOR)) {
      newNumber = 0;
    } else {
      newNumber = generateAutomaticNumber(element, commandStack);
    }
    context = {
      businessObject: businessObject,
      newNumber: newNumber,
      element: element,
    };
    commandStack.execute("activity.directionChange", context);
  }

  function getReplaceMenuPosition(element) {
    let Y_OFFSET = 5;

    let diagramContainer = canvas.getContainer(),
      pad = contextPad.getPad(element).html;

    let diagramRect = diagramContainer.getBoundingClientRect(),
      padRect = pad.getBoundingClientRect();

    let top = padRect.top - diagramRect.top;
    let left = padRect.left - diagramRect.left;

    return {
      x: left,
      y: top + padRect.height + Y_OFFSET,
    };
  }

  /**
   * create an append action
   *
   * @param {String} type
   * @param {String} className
   * @param {String} [title]
   * @param {String} group
   * @param {Object} [options]
   *
   * @return {Object} descriptor
   */
  function appendAction(type, className, title, group, options) {
    if (typeof title !== "string") {
      options = title;
      title = translate("{type}", { type: type.replace(/^domainStory:/, "") });
    }

    function appendStart(event, element) {
      let shape = elementFactory.createShape(assign({ type: type }, options));
      let context = {
        elements: [shape],
        hints: {},
        source: element,
      };
      create.start(event, shape, context);
    }

    return {
      group: group,
      className: className,
      title: "Append " + title,
      action: {
        dragstart: startConnect,
        click: appendStart,
      },
    };
  }
}

inherits(DomainStoryContextPadProvider, ContextPadProvider);

DomainStoryContextPadProvider.$inject = [
  "injector",
  "connect",
  "translate",
  "elementFactory",
  "create",
  "canvas",
  "contextPad",
  "popupMenu",
  "replaceMenuProvider",
  "commandStack",
  "eventBus",
  "modeling",
];
