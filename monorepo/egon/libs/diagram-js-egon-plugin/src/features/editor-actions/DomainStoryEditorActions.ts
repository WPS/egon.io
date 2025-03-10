import EditorActions from "diagram-js/lib/features/editor-actions/EditorActions";
import { Injector } from "didi";
import Canvas from "diagram-js/lib/core/Canvas";
import ElementRegistry from "diagram-js/lib/core/ElementRegistry";
import SpaceTool from "diagram-js/lib/features/space-tool/SpaceTool";
import Selection from "diagram-js/lib/features/selection/Selection";
import LassoTool from "diagram-js/lib/features/lasso-tool/LassoTool";
import HandTool from "diagram-js/lib/features/hand-tool/HandTool";
import { DirectEditing } from "diagram-js-direct-editing/lib";

export class DomainStoryEditorActions {
    static $inject: string[] = [];

    private readonly canvas: Canvas;
    private readonly elementRegistry: ElementRegistry;
    private readonly selection: Selection;
    private readonly spaceTool: SpaceTool;
    private readonly lassoTool: LassoTool;
    private readonly handTool: HandTool;
    private readonly directEditing: DirectEditing;

    constructor(injector: Injector, editorActions: EditorActions) {
        this.canvas = injector.get("canvas");
        this.elementRegistry = injector.get("elementRegistry");
        this.selection = injector.get("selection");
        this.spaceTool = injector.get("spaceTool");
        this.lassoTool = injector.get("lassoTool");
        this.handTool = injector.get("handTool");
        this.directEditing = injector.get("directEditing");

        const actions = {
            selectElements: this.selectAll(),
            spaceTool: this.toggleSpaceTool(),
            lassoTool: this.toggleLassoTool(),
            handTool: this.toggleHandTool(),
            directEditing: this.activateDirectEditing(),
        };

        editorActions.register(actions);
    }

    /**
     * select all elements except for the invisible root element
     * @private
     */
    private selectAll(): () => void {
        return () => {
            const rootElement = this.canvas.getRootElement();

            const elements = this.elementRegistry.filter(function (element) {
                return element !== rootElement;
            });

            this.selection.select(elements);

            return elements;
        };
    }

    private toggleSpaceTool(): () => void {
        return () => {
            this.spaceTool.toggle();
        };
    }

    private toggleLassoTool(): () => void {
        return () => {
            this.lassoTool.toggle();
        };
    }

    private toggleHandTool(): () => void {
        return () => {
            this.handTool.toggle();
        };
    }

    private activateDirectEditing(): () => void {
        return () => {
            const currentSelection = this.selection.get();

            if (currentSelection.length) {
                this.directEditing.activate(currentSelection[0]);
            }
        };
    }
}

DomainStoryEditorActions.$inject = ["injector", "editorActions"];
