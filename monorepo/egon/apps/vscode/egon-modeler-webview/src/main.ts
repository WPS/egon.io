import Diagram from "diagram-js";
import Canvas from "diagram-js/lib/core/Canvas";
import ElementFactory from "diagram-js/lib/core/ElementFactory";

import EgonIo, {
    DirtyFlagService,
    ElementRegistryService,
    IconDictionaryService,
    LabelDictionaryService,
} from "@egon/diagram-js-egon-plugin";

const additionalModules = [EgonIo];

const editor = new Diagram({
    container: document.getElementById("domainStoryEditor"),
    width: "100%",
    height: "100%",
    position: "relative",
    modules: [...additionalModules],
});

const canvas: Canvas = editor.get("canvas");
const elementFactory: ElementFactory = editor.get("elementFactory");

const root = elementFactory.createRoot();

canvas.setRootElement(root);

const elementRegistryService: ElementRegistryService = editor.get(
    "domainStoryElementRegistryService",
);
const dirtyFlagService: DirtyFlagService = editor.get("domainStoryDirtyFlagService");
const iconDictionaryService: IconDictionaryService = editor.get(
    "domainStoryIconDictionaryService",
);
const labelDictionaryService: LabelDictionaryService = editor.get(
    "domainStoryLabelDictionaryService",
);

console.log("elementRegistryService", elementRegistryService);
console.log("dirtyFlagService", dirtyFlagService);
console.log("iconDictionaryService", iconDictionaryService);
console.log("labelDictionaryService", labelDictionaryService);
