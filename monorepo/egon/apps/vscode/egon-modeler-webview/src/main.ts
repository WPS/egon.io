import Diagram from "diagram-js";
import Canvas from "diagram-js/lib/core/Canvas";
import ElementFactory from "diagram-js/lib/core/ElementFactory";

import EgonIo from "@egon/diagram-js-egon-plugin";

const additionalModules = [EgonIo];

const editor = new Diagram({
    container: document.getElementById("domainStoryEditor"),
    modules: [...additionalModules],
});

const canvas: Canvas = editor.get("canvas");
const elementFactory: ElementFactory = editor.get("elementFactory");

const root = elementFactory.createRoot();

canvas.setRootElement(root);
