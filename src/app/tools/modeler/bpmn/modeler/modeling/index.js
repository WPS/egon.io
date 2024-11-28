"use strict";

import DomainStoryPalette from "../palette/domainStoryPalette";
import CreateModule from "diagram-js/lib/features/create";
import PathMap from "bpmn-js/lib/draw/PathMap";
import PopupMenuModule from "bpmn-js/lib/features/popup-menu";
import ContextPadModule from "diagram-js/lib/features/context-pad";
import CommandStack from "diagram-js/lib/command/CommandStack";
import UpdateLabelHandler from "../updateHandler/updateLabelHandler";
import DomainStoryUpdater from "../domainStoryUpdater";
import DomainStoryElementFactory from "../domainStoryElementFactory";
import headlineAndDescriptionUpdateHandler from "../updateHandler/headlineAndDescriptionUpdateHandler";
import DomainStoryRenderer from "../domainStoryRenderer";
import DSModeling from "./dSModeling";
import DomainStoryRules from "../domainStoryRules";
import ReplaceMenuProvider from "../change-icon/replaceMenuProvider";
import DomainStoryContextPadProvider from "../context-pad/domainStoryContextPadProvider";

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
