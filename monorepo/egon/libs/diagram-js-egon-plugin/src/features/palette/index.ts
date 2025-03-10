import SpaceTool from "diagram-js/lib/features/space-tool";
import LassoToolModule from "diagram-js/lib/features/lasso-tool";
import PaletteModule from "diagram-js/lib/features/palette";
import CreateModule from "diagram-js/lib/features/create";
import IconDictionaryService from "../../icon-set-config/service";

import { DomainStoryPaletteProvider } from "./DomainStoryPalette";

export default {
    __depends__: [
        IconDictionaryService,
        CreateModule,
        SpaceTool,
        LassoToolModule,
        PaletteModule,
    ],
    __init__: ["domainStoryPaletteProvider"],
    domainStoryPaletteProvider: ["type", DomainStoryPaletteProvider],
};
