"use strict";

import { assign, isArray } from "min-dash";
import { generateAutomaticNumber } from "../numbering/numbering";
import { ElementTypes } from "src/app/domain/entities/element-types";
import {
  hexToRGBA,
  isHexWithAlpha,
  rgbaToHex,
} from "../../../../../utils/colorConverter";
import { hasPrimaryModifier } from "diagram-js/lib/util/Mouse";
import {
  DS_REPLACE_PROVIDER,
  EVENT_CREATE_END,
  EVENT_PICKED_COLOR,
  EVENT_ELEMENTS_DELETE,
  ELEMENT_COLOR_CHANGE_EVENT,
  ACTIVITY_DIRECTION_CHANGE_EVENT,
  OPEN_CONTEXT_PAD_CSS_CLASS,
  OPEN_COLOR_PICKER_EVENT,
  DEFAULT_COLOR_EVENT,
} from "../diagramJSConstants";

let dirtyFlagService;
let iconDictionaryService;

export function initializeContextPadProvider(dirtyFlag, iconDictionary) {
  dirtyFlagService = dirtyFlag;
  iconDictionaryService = iconDictionary;
}

export default function DomainStoryContextPadProvider(
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
  rules,
) {
  contextPad.registerProvider(this);
  popupMenu.registerProvider(DS_REPLACE_PROVIDER, replaceMenuProvider);

  let _selectedElement;
  let startConnect;

  eventBus.on(EVENT_CREATE_END, 250, function (event) {
    const context = event.context,
      shape = context.shape;

    if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
      return;
    }

    const entries = contextPad.getEntries(shape);

    if (entries.replace) {
      entries.replace.action.click(event, shape);
    }
  });

  document.addEventListener(EVENT_PICKED_COLOR, (event) => {
    if (_selectedElement) {
      executeCommandStack(event);
    }
  });

  this.getContextPadEntries = function (element) {
    let actions = {};

    startConnect = function (event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    };

    if (element.type.includes(ElementTypes.WORKOBJECT)) {
      addDelete(actions, element);
      addColorChange(actions, element);
      addConnectWithActivity(actions, startConnect);
      addTextAnnotation(actions);
      addActors(appendAction, actions);
      addWorkObjects(appendAction, actions);
      addChangeWorkObjectTypeMenu(actions);
    } else if (element.type.includes(ElementTypes.ACTOR)) {
      addDelete(actions, element);
      addColorChange(actions, element);
      addConnectWithActivity(actions, startConnect);
      addTextAnnotation(actions);
      addWorkObjects(appendAction, actions);
      addChangeActorTypeMenu(actions);
    } else if (element.type.includes(ElementTypes.GROUP)) {
      addTextAnnotation(actions);
      addDeleteGroupWithoutChildren(actions, element);
      addColorChange(actions, element);
    } else if (element.type.includes(ElementTypes.ACTIVITY)) {
      addChangeDirection(actions);
      addColorChange(actions, element);
      addDelete(actions, element);
    } else if (element.type.includes(ElementTypes.TEXTANNOTATION)) {
      addDelete(actions, element);
      addColorChange(actions, element);
    } else if (element.type.includes(ElementTypes.CONNECTION)) {
      addDelete(actions, element);
    }

    notifyColorPickerOfCurrentElementColor();

    return actions;

    /* When the color picker is opened, the current element color should be selected. */
    function notifyColorPickerOfCurrentElementColor() {
      let currentColor = _selectedElement.businessObject.pickedColor;

      if (isHexWithAlpha(currentColor)) {
        currentColor = hexToRGBA(currentColor);
      }
      document.dispatchEvent(
        new CustomEvent(DEFAULT_COLOR_EVENT, {
          detail: {
            color: currentColor ?? "#000000",
          },
        }),
      );
    }
  };

  this.getMultiElementContextPadEntries = function (elements) {
    let actions = {};
    addDelete(actions, elements);
    addColorChange(actions, elements);
    return actions;
  };

  function addDelete(actions, element) {
    // delete element entry, only show if allowed by rules
    let deleteAllowed = rules.allowed(EVENT_ELEMENTS_DELETE, {
      elements: { element },
    });

    if (isArray(deleteAllowed)) {
      // was the element returned as a deletion candidate?
      deleteAllowed = deleteAllowed[0] === element;
    }

    if (deleteAllowed) {
      assign(actions, {
        delete: {
          group: "edit",
          className: "bpmn-icon-trash",
          title: translate("Remove"),
          action: {
            click: function (event, element) {
              if (isArray(element)) {
                const groups = element.filter((el) =>
                  el.type.includes(ElementTypes.GROUP),
                );
                const otherElements = element.filter(
                  (el) => !el.type.includes(ElementTypes.GROUP),
                );
                groups.forEach((group) => modeling.removeGroup(group));
                modeling.removeElements(otherElements.slice());
              } else {
                modeling.removeElements({ element });
              }
              dirtyFlagService.makeDirty();
            },
          },
        },
      });
    }
  }

  function addDeleteGroupWithoutChildren(actions, element) {
    assign(actions, {
      deleteGroup: {
        group: "edit",
        className: "bpmn-icon-trash",
        title: translate("Remove Group without Child-Elements"),
        action: {
          click: function (event, element) {
            modeling.removeGroup(element);
            dirtyFlagService.makeDirty();
          },
        },
      },
    });
  }

  function addChangeDirection(actions) {
    assign(actions, {
      changeDirection: {
        group: "edit",
        className: "icon-domain-story-changeDirection",
        title: translate("Change direction"),
        action: {
          // event needs to be addressed
          click: function (event, element) {
            changeDirection(element);
            dirtyFlagService.makeDirty();
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
            let position = assign(getReplaceMenuPosition(), {
              cursor: { x: event.x, y: event.y },
            });
            popupMenu.open(element, DS_REPLACE_PROVIDER, position);
          },
        },
      },
    });
  }

  function addColorChange(actions, elements) {
    _selectedElement = elements;
    assign(actions, {
      colorChange: {
        group: "edit",
        className: "icon-domain-story-color-picker",
        title: translate("Change color"),
        action: {
          click: function (event, element) {
            document.dispatchEvent(new CustomEvent(OPEN_COLOR_PICKER_EVENT));
          },
        },
      },
    });
  }

  function addTextAnnotation(actions) {
    assign(actions, {
      "append.text-annotation": appendAction(
        ElementTypes.TEXTANNOTATION,
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
    let workObjects = iconDictionaryService.getIconsAssignedAs(
      ElementTypes.WORKOBJECT,
    );
    workObjects.keysArray().forEach((workObjectType) => {
      let name = workObjectType;
      let icon = iconDictionaryService.getCSSClassOfIcon(workObjectType);
      let action = [];
      action["append.workObject" + name] = appendAction(
        `${ElementTypes.WORKOBJECT}${workObjectType}`,
        icon,
        name,
        "workObjects",
      );
      assign(actions, action);
    });
  }

  function addActors(appendAction, actions) {
    let actors = iconDictionaryService.getIconsAssignedAs(ElementTypes.ACTOR);
    actors.keysArray().forEach((actorType) => {
      let name = actorType;
      let icon = iconDictionaryService.getCSSClassOfIcon(actorType);
      let action = [];
      action["append.actor" + name] = appendAction(
        `${ElementTypes.ACTOR}${actorType}`,
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
            let position = assign(getReplaceMenuPosition(), {
              cursor: { x: event.x, y: event.y },
            });
            popupMenu.open(element, DS_REPLACE_PROVIDER, position);
          },
        },
      },
    });
  }

  function changeDirection(element) {
    let context;
    let businessObject = element.businessObject;
    let newNumber;

    if (element.source.type.includes(ElementTypes.ACTOR)) {
      newNumber = 0;
    } else {
      newNumber = generateAutomaticNumber(element, commandStack);
    }
    context = {
      businessObject: businessObject,
      newNumber: newNumber,
      element: element,
    };
    commandStack.execute(ACTIVITY_DIRECTION_CHANGE_EVENT, context);
  }

  function getReplaceMenuPosition() {
    let Y_OFFSET = 5;

    let diagramContainer = canvas.getContainer(),
      pad = document.getElementsByClassName(OPEN_CONTEXT_PAD_CSS_CLASS)[0];

    let diagramRect = diagramContainer.getBoundingClientRect(),
      padRect = pad.getBoundingClientRect();

    let top = padRect.top - diagramRect.top;
    let left = padRect.left - diagramRect.left;

    return {
      x: left,
      y: top + padRect.height + Y_OFFSET,
    };
  }

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

  /* builds a payload describing a color change */
  function getColorChangeDescription(element, newColor) {
    const oldColor = element.businessObject.pickedColor;
    if (isHexWithAlpha(oldColor)) {
      newColor = rgbaToHex(newColor);
    }

    return {
      businessObject: element.businessObject,
      newColor: newColor,
      element: element,
    };
  }

  function executeCommandStack(colorChangedEvent) {
    let newColor = colorChangedEvent.detail.color;
    if (isArray(_selectedElement)) {
      _selectedElement.forEach((el) =>
        commandStack.execute(
          ELEMENT_COLOR_CHANGE_EVENT,
          getColorChangeDescription(el, newColor),
        ),
      );
    } else {
      const colorChangeDescription = getColorChangeDescription(
        _selectedElement,
        newColor,
      );
      commandStack.execute(ELEMENT_COLOR_CHANGE_EVENT, colorChangeDescription);
    }

    dirtyFlagService.makeDirty();
  }
}

DomainStoryContextPadProvider.$inject = [
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
  "rules",
];
