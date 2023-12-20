"use strict";

import DomainStoryElementFactory from "./domainStoryElementFactory";
import DomainStoryRenderer from "./domainStoryRenderer";
import DomainStoryPalette from "./palette/domainStoryPalette";
import DomainStoryRules from "./domainStoryRules";
import DomainStoryUpdater from "./domainStoryUpdater";
import ElementFactory from "bpmn-js/lib/features/modeling/ElementFactory";
import CreateModule from "diagram-js/lib/features/create";
import PathMap from "bpmn-js/lib/draw/PathMap";
import PopupMenuModule from "bpmn-js/lib/features/popup-menu";
import ContextPadModule from "diagram-js/lib/features/context-pad";
import CommandStack from "diagram-js/lib/command/CommandStack";
import UpdateLabelHandler from "./updateHandler/updateLabelHandler";
import headlineAndDescriptionUpdateHandler from "./updateHandler/headlineAndDescriptionUpdateHandler";
import DomainStoryContextPadProvider from "./context-pad/domainStoryContextPadProvider";
import ReplaceMenuProvider from "./change-icon/replaceMenuProvider";
import DSModeling from "./modeling/dSModeling";

export default {
  __depends__: [CreateModule, ContextPadModule, PopupMenuModule],
  __init__: [
    "domainStoryRenderer",
    "paletteProvider",
    "domainStoryRules",
    "domainStoryUpdater",
    "contextPadProvider",
    "replaceMenuProvider",
  ],
  elementFactory: ["type", DomainStoryElementFactory],
  domainStoryRenderer: ["type", DomainStoryRenderer],
  paletteProvider: ["type", DomainStoryPalette],
  domainStoryRules: ["type", DomainStoryRules],
  domainStoryUpdater: ["type", DomainStoryUpdater],
  contextPadProvider: ["type", DomainStoryContextPadProvider],
  elementFactoryBpmn: ["type", ElementFactory],
  pathMap: ["type", PathMap],
  replaceMenuProvider: ["type", ReplaceMenuProvider],
  commandStack: ["type", CommandStack],
  updateLabelHandler: ["type", UpdateLabelHandler],
  headlineAndDescriptionUpdateHandler: [
    "type",
    headlineAndDescriptionUpdateHandler,
  ],
  modeling: ["type", DSModeling],
};
