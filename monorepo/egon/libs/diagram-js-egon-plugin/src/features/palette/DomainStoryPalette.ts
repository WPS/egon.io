import { assign } from "min-dash";
import PaletteProvider, {
    PaletteEntries,
    PaletteEntriesCallback,
    PaletteEntry,
} from "diagram-js/lib/features/palette/PaletteProvider";
import Create from "diagram-js/lib/features/create/Create";
import ElementFactory from "diagram-js/lib/core/ElementFactory";
import SpaceTool from "diagram-js/lib/features/space-tool/SpaceTool";
import LassoTool from "diagram-js/lib/features/lasso-tool/LassoTool";
import Palette from "diagram-js/lib/features/palette/Palette";
import { IconDictionaryService } from "../../icon-set-config/service/IconDictionaryService";
import { ElementTypes } from "../../domain/entities/elementTypes";

export class DomainStoryPaletteProvider implements PaletteProvider {
    static $inject: string[] = [];

    constructor(
        palette: Palette,
        private readonly create: Create,
        private readonly elementFactory: ElementFactory,
        private readonly spaceTool: SpaceTool,
        private readonly lassoTool: LassoTool,
        private readonly iconDictionaryService: IconDictionaryService,
    ) {
        palette.registerProvider(this);
    }

    getPaletteEntries(): PaletteEntriesCallback | PaletteEntries {
        return this.initPalette();
    }

    private initPalette(): PaletteEntries {
        const actions: Record<string, PaletteEntry> = {};

        // this.iconDictionaryService.initTypeDictionaries();

        const actorTypes = this.iconDictionaryService.getIconsAssignedAs(
            ElementTypes.ACTOR,
        );

        actorTypes?.keysArray().forEach((name: any) => {
            const entries = this.addCanvasObjectTypes(name, "actor", ElementTypes.ACTOR);
            Object.entries(entries).forEach(([key, value]) => {
                actions[key] = value;
            });
        });

        actions["actor-separator"] = {
            group: "actor",
            separator: true,
            action: () => {},
        };

        const workObjectTypes = this.iconDictionaryService.getIconsAssignedAs(
            ElementTypes.WORKOBJECT,
        );

        workObjectTypes?.keysArray().forEach((name) => {
            const entries = this.addCanvasObjectTypes(
                name,
                "actor",
                ElementTypes.WORKOBJECT,
            );
            Object.entries(entries).forEach(([key, value]) => {
                actions[key] = value;
            });
        });

        actions["workObject-separator"] = {
            group: "workObject",
            separator: true,
            action: () => {},
        };
        actions["domainStory-group"] = this.createAction(
            ElementTypes.GROUP,
            "group",
            "icon-domain-story-tool-group",
            "group",
            {},
        );
        actions["group-separator"] = {
            group: "group",
            separator: true,
            action: () => {},
        };
        actions["lasso-tool"] = {
            group: "tools",
            className: "bpmn-icon-lasso-tool",
            title: "Activate the lasso tool",
            action: {
                click: (event: any) => {
                    this.lassoTool.activateSelection(event);
                },
            },
        };
        actions["space-tool"] = {
            group: "tools",
            className: "bpmn-icon-space-tool",
            title: "Activate the create/remove space tool",
            action: {
                click: (event: any) => {
                    this.spaceTool.activateSelection(event, false, false);
                },
            },
        };

        return actions;
    }

    private addCanvasObjectTypes(
        name: string,
        className: string,
        elementType: ElementTypes,
    ): PaletteEntries {
        const icon = this.iconDictionaryService.getCSSClassOfIcon(name);

        const key = `domainStory-${className}${name}`;
        const value = this.createAction(
            `${elementType}${name}`,
            className,
            icon ?? "",
            name,
            {},
        );

        return {
            [key]: value,
        };
    }

    private createAction(
        type: any,
        group: string,
        className: string,
        title: string,
        options: any,
    ): PaletteEntry {
        const createListener = (event: any) => {
            const shape = this.elementFactory.createShape(
                assign({ type: type }, options),
            );

            assign(shape.businessObject, {
                id: shape.id,
            });

            this.create.start(event, shape);
        };

        const shortType = type.replace(/^domainStory:/, "");

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
}

DomainStoryPaletteProvider.$inject = [
    "palette",
    "create",
    "elementFactory",
    "spaceTool",
    "lassoTool",
    "domainStoryIconDictionaryService",
];
