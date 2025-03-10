import EditorActionsModule from "diagram-js/lib/features/editor-actions";
import KeyboardBindingsModule from "diagram-js/lib/features/keyboard";
import MoveCanvasModule from "diagram-js/lib/navigation/movecanvas";
import KeyboardMoveModule from "diagram-js/lib/navigation/keyboard-move";
import ZoomScrollModule from "diagram-js/lib/navigation/zoomscroll";
import MoveModule from "diagram-js/lib/features/move";
import BendpointsModule from "diagram-js/lib/features/bendpoints";
import ConnectionPreviewModule from "diagram-js/lib/features/connection-preview";
import SnappingModule from "diagram-js/lib/features/snapping";
import minimapModule from "diagram-js-minimap";

import DomainStoryElementFactory from "./features/element-factory";
import DomainStoryRenderer from "./features/renderer";
import DomainStoryModeling from "./features/modeling";
import DomainStoryUpdater from "./features/updater";
import DomainStoryPaletteProvider from "./features/palette";
import DomainStoryContextPadProvider from "./features/context-pad";
import DomainStoryLabelEditing from "./features/labeling";
import DomainStoryUpdateHandler from "./features/update-handler";
import DomainStoryCopyPaste from "./features/copy-paste";
import DomainStoryKeyBinding from "./features/keyboard";

const buildInModules = [
    EditorActionsModule,
    KeyboardBindingsModule,
    MoveCanvasModule,
    KeyboardMoveModule,
    ZoomScrollModule,
    MoveModule,
    BendpointsModule,
    ConnectionPreviewModule,
    SnappingModule,
    minimapModule,
];

const domainStoryModules = [
    DomainStoryElementFactory,
    DomainStoryRenderer,
    DomainStoryModeling,
    DomainStoryUpdater,
    DomainStoryUpdateHandler,
    DomainStoryPaletteProvider,
    DomainStoryContextPadProvider,
    DomainStoryLabelEditing,
    DomainStoryCopyPaste,
    DomainStoryKeyBinding,
];

export default {
    __depends__: [...domainStoryModules, ...buildInModules],
};
