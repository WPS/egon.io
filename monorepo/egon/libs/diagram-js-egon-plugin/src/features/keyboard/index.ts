import KeyboardModule from "diagram-js/lib/features/keyboard";
import EditorActionsModule from "diagram-js/lib/features/editor-actions";
import DomainStoryEditorActions from "../editor-actions";
import { DomainStoryKeyBinding } from "./DomainStoryKeyBinding";

export default {
    __depends__: [KeyboardModule, EditorActionsModule, DomainStoryEditorActions],
    __init__: ["domainStoryKeyBinding"],
    domainStoryKeyBinding: ["type", DomainStoryKeyBinding],
};
