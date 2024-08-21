"use strict";

import { assign } from "min-dash";
import { Dictionary } from "src/app/domain/entities/dictionary";
import { ElementTypes } from "src/app/domain/entities/elementTypes";

let iconDictionary;
let configuration;

export function initializePalette(iconDictionaryService, configurationService) {
  iconDictionary = iconDictionaryService;
  configuration = configurationService;
}

export default function PaletteProvider(
  palette,
  create,
  elementFactory,
  spaceTool,
  lassoTool,
) {
  this._create = create;
  this._elementFactory = elementFactory;
  this._spaceTool = spaceTool;
  this._lassoTool = lassoTool;

  palette.registerProvider(this);
}

PaletteProvider.$inject = [
  "palette",
  "create",
  "elementFactory",
  "spaceTool",
  "lassoTool",
  "modeling",
];

PaletteProvider.prototype.getPaletteEntries = function () {
  let actions = {},
    create = this._create,
    elementFactory = this._elementFactory,
    spaceTool = this._spaceTool,
    lassoTool = this._lassoTool;

  function createAction(type, group, className, title, options) {
    function createListener(event) {
      let shape = elementFactory.createShape(assign({ type: type }, options));

      assign(shape.businessObject, {
        id: shape.id,
      });

      if (options) {
        shape.businessObject.di.isExpanded = options.isExpanded;
      }

      create.start(event, shape);
    }

    let shortType = type.replace(/^domainStory:/, "");

    return {
      group: group,
      className: className,
      title: "Create " + title || "Create " + shortType,
      action: {
        dragstart: createListener,
        click: createListener,
      },
    };
  }

  return initPalette(actions, spaceTool, lassoTool, createAction);
};

function appendCSSStyleCheat(customIcons) {
  const sheetEl = document.createElement("style");
  document.head.appendChild(sheetEl);

  let customIconDict = new Dictionary();

  customIconDict.appendDict(customIcons);
  let customIconDictKeys = customIconDict.keysArray();

  customIconDictKeys.forEach((name) => {
    if (iconDictionary.getAppendedIconDictionary().has(name)) {
      let src = customIconDict.get(name);

      const iconStyle =
        ".icon-domain-story-" +
        name.toLowerCase() +
        "::before{" +
        " display: block;" +
        ' content: url("data:image/svg+xml;utf8,' +
        wrapSRCInSVG(src) +
        '");' +
        " margin: 3px;}";
      sheetEl.sheet.insertRule(iconStyle, sheetEl.sheet.cssRules.length);
    }
  });
}

function initPalette(actions, spaceTool, lassoTool, createAction) {
  let config = iconDictionary?.getCurrentIconConfigurationForBPMN();

  iconDictionary?.initTypeDictionaries(config.actors, config.workObjects);

  let actorTypes = iconDictionary?.getTypeDictionary(ElementTypes.ACTOR);

  actorTypes?.keysArray().forEach((name) => {
    addCanvasObjectTypes(
      name,
      createAction,
      actions,
      "actor",
      ElementTypes.ACTOR,
    );
  });

  assign(actions, {
    "actor-separator": {
      group: "actor",
      separator: true,
    },
  });

  let workObjectTypes = iconDictionary?.getTypeDictionary(
    ElementTypes.WORKOBJECT,
  );

  workObjectTypes?.keysArray().forEach((name) => {
    addCanvasObjectTypes(
      name,
      createAction,
      actions,
      "actor",
      ElementTypes.WORKOBJECT,
    );
  });

  assign(actions, {
    "workObject-separator": {
      group: "workObject",
      separator: true,
    },
    "domainStory-group": createAction(
      ElementTypes.GROUP,
      "group",
      "icon-domain-story-tool-group",
      "group",
    ),
    "group-separator": {
      group: "group",
      separator: true,
    },
    "lasso-tool": {
      group: "tools",
      className: "bpmn-icon-lasso-tool",
      title: "Activate the lasso tool",
      action: {
        click: function (event) {
          lassoTool.activateSelection(event);
        },
      },
    },
    "space-tool": {
      group: "tools",
      className: "bpmn-icon-space-tool",
      title: "Activate the create/remove space tool",
      action: {
        click: function (event) {
          spaceTool.activateSelection(event);
        },
      },
    },
  });

  return actions;
}

function addCanvasObjectTypes(
  name,
  createAction,
  actions,
  className,
  elementType,
) {
  let icon = iconDictionary.getIconForBPMN(elementType, name);

  let action = [];
  action["domainStory-" + className + name] = createAction(
    `${elementType}${name}`,
    className,
    icon,
    name,
  );
  assign(actions, action);
}

// For some reason its important to use ' in the content for the Palette and ContextPad
// Do not change!
function wrapSRCInSVG(src) {
  return (
    "<svg viewBox='0 0 22 22' width='22' height='22' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>" +
    "<image width='22' height='22' xlink:href='" +
    src +
    "'/></svg>"
  );
}
