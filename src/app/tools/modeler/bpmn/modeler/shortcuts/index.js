import EditorActionsModule from "diagram-js/lib/features/editor-actions";
import KeyboardModule from "diagram-js/lib/features/keyboard";
import AdditionalEditorActions from "./AdditionalEditorActions";
import AdditionalKeyboardBindings from "./AdditionalKeyboardBindings";

export default {
  __depends__: [EditorActionsModule, KeyboardModule],
  __init__: [ 'additionalEditorActions', 'additionalKeyBindings' ],
  additionalEditorActions: [ 'type', AdditionalEditorActions ],
  additionalKeyBindings: [ 'type', AdditionalKeyboardBindings ]
};
