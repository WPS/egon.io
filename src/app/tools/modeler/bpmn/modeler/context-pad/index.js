import CommandStack from "diagram-js/lib/command/CommandStack";
import DSModeling from "../modeling/dSModeling";

export default {
  __depends__: [],
  __init__: [
    "domainStoryRenderer",
    "paletteProvider",
    "domainStoryRules",
    "domainStoryUpdater",
    "contextPadProvider",
    "replaceMenuProvider",
  ],
  commandStack: ["type", CommandStack],
  modeling: ["type", DSModeling],
};
