"use strict";

import { assign, isArray} from "min-dash";
import { generateAutomaticNumber } from "../numbering/numbering";
import { ElementTypes } from "src/app/domain/entities/elementTypes";
import {
  hexToRGBA,
  isHexWithAlpha,
  rgbaToHex,
} from "../../../../../utils/colorConverter";
import {hasPrimaryModifier} from "diagram-js/lib/util/Mouse";

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
  popupMenu.registerProvider("ds-replace", replaceMenuProvider);

  let _selectedElement;
  let startConnect;

  eventBus.on('create.end', 250, function(event) {
    var context = event.context,
      shape = context.shape;

    if (!hasPrimaryModifier(event) || !contextPad.isOpen(shape)) {
      return;
    }

    var entries = contextPad.getEntries(shape);

    if (entries.replace) {
      entries.replace.action.click(event, shape);
    }
  });

  document.addEventListener("pickedColor", (event) => {
    if (_selectedElement) {
      executeCommandStack(event);
    }
  });

  this.getContextPadEntries = function (element) {
    _selectedElement = element;

    let pickedColor = _selectedElement.businessObject.pickedColor;

    if (isHexWithAlpha(pickedColor)) {
      pickedColor = hexToRGBA(pickedColor);
    }
    document.dispatchEvent(
      new CustomEvent("defaultColor", {
        detail: {
          color: pickedColor ?? "#000000",
        },
      }),
    );

    let actions = {};

    startConnect = function (event, element, autoActivate) {
      connect.start(event, element, autoActivate);
    };

    if (element.type.includes(ElementTypes.WORKOBJECT)) {
      addDelete(actions, element);
      addColorChange(actions);
      addConnectWithActivity(actions, startConnect);
      addTextAnnotation(actions);
      addActors(appendAction, actions);
      addWorkObjects(appendAction, actions);
      addChangeWorkObjectTypeMenu(actions);
    } else if (element.type.includes(ElementTypes.ACTOR)) {
      addDelete(actions, element);
      addColorChange(actions);
      addConnectWithActivity(actions, startConnect);
      addTextAnnotation(actions);
      addWorkObjects(appendAction, actions);
      addChangeActorTypeMenu(actions);
    } else if (element.type.includes(ElementTypes.GROUP)) {
      addTextAnnotation(actions);
      addDeleteGroupWithoutChildren(actions, element);
      addColorChange(actions);
    } else if (element.type.includes(ElementTypes.ACTIVITY)) {
      addChangeDirection(actions);
      addColorChange(actions);
      addDelete(actions, element);
    } else if (element.type.includes(ElementTypes.TEXTANNOTATION)) {
      addDelete(actions, element);
      addColorChange(actions);
    } else if (element.type.includes(ElementTypes.CONNECTION)) {
      addDelete(actions, element);
    }

    return actions;
  };

  function addDelete(actions, element) {
    // delete element entry, only show if allowed by rules
    var deleteAllowed = rules.allowed('elements.delete', { elements: {element} });

    if (isArray(deleteAllowed)) {
      // was the element returned as a deletion candidate?
      deleteAllowed = deleteAllowed[0] === element;
    }

    if (deleteAllowed) {
      assign(actions, {
        delete: {
          group: 'edit',
          className: 'bpmn-icon-trash',
          title: translate('Remove'),
          action: {
            click: function (event, element) {
              modeling.removeElements({ element });
              dirtyFlagService.makeDirty();
            },
          }
        }
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
            document.dispatchEvent(new CustomEvent("openColorPicker"));
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
      let icon = iconDictionaryService.getIconForBPMN(
        ElementTypes.WORKOBJECT,
        workObjectType,
      );
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
      let icon = iconDictionaryService.getIconForBPMN(
        ElementTypes.ACTOR,
        actorType,
      );
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

  function getSelectedBusinessObject(event) {
    const oldColor = _selectedElement.businessObject.pickedColor;
    let newColor = event.detail.color;
    if (isHexWithAlpha(oldColor)) {
      newColor = rgbaToHex(newColor);
    }

    return {
      businessObject: _selectedElement.businessObject,
      newColor: newColor,
      element: _selectedElement,
    };
  }

  function executeCommandStack(event) {
    const selectedBusinessObject = getSelectedBusinessObject(event);

    commandStack.execute("element.colorChange", selectedBusinessObject);
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
