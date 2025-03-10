import HandToolModule from "diagram-js/lib/features/hand-tool";
import { DomainStoryEditorActions } from "./DomainStoryEditorActions";

export default {
    __depends__: [HandToolModule],
    __init__: ["domainStoryEditorActions"],
    domainStoryEditorActions: ["type", DomainStoryEditorActions],
};
