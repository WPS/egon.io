"use strict";

import LassoTool from "diagram-js/lib/features/lasso-tool";
import SpaceTool from "diagram-js/lib/features/space-tool";
import Palette from "diagram-js/lib/features/palette";
import TextRenderer from "../../diagram-js/copiedClasses/TextRenderer";
import DomainStoryElementFactory from "./domainStoryElementFactory";
import DomainStoryRenderer from "./domainStoryRenderer";
import DomainStoryPalette from "./palette/domainStoryPalette";
import DomainStoryRules from "./domainStoryRules";
import DomainStoryUpdater from "./domainStoryUpdater";
import CreateModule from "diagram-js/lib/features/create";
import ContextPadModule from "diagram-js/lib/features/context-pad";
import CommandStack from "diagram-js/lib/command/CommandStack";
import UpdateLabelHandler from "./updateHandler/updateLabelHandler";
import headlineAndDescriptionUpdateHandler from "./updateHandler/headlineAndDescriptionUpdateHandler";
import DomainStoryContextPadProvider from "./context-pad/domainStoryContextPadProvider";
import ReplaceMenuProvider from "./change-icon/replaceMenuProvider";
import DSModeling from "./modeling/dSModeling";
import BaseLayouter from "diagram-js/lib/layout/BaseLayouter";
import CroppingConnectionDocking from "diagram-js/lib/layout/CroppingConnectionDocking";

export default {
  __depends__: [CreateModule, ContextPadModule, Palette, SpaceTool, LassoTool],
  __init__: [
    "domainStoryRenderer",
    "paletteProvider",
    "domainStoryRules",
    "domainStoryUpdater",
    "contextPadProvider",
    "replaceMenuProvider",
  ],
  connectionDocking: ["type", CroppingConnectionDocking],
  layouter: ["type", BaseLayouter],
  textRenderer: ["type", TextRenderer],
  elementFactory: ["type", DomainStoryElementFactory],
  domainStoryRenderer: ["type", DomainStoryRenderer],
  paletteProvider: ["type", DomainStoryPalette],
  domainStoryRules: ["type", DomainStoryRules],
  domainStoryUpdater: ["type", DomainStoryUpdater],
  contextPadProvider: ["type", DomainStoryContextPadProvider],
  replaceMenuProvider: ["type", ReplaceMenuProvider],
  commandStack: ["type", CommandStack],
  updateLabelHandler: ["type", UpdateLabelHandler],
  headlineAndDescriptionUpdateHandler: [
    "type",
    headlineAndDescriptionUpdateHandler,
  ],
  modeling: ["type", DSModeling],
};
