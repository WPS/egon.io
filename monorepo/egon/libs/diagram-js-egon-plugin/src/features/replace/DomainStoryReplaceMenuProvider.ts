import { Shape } from "diagram-js/lib/model/Types";
import { forEach } from "min-dash";
import { ElementTypes } from "../../domain/entities/elementTypes";
import { DomainStoryReplace } from "./DomainStoryReplace";
import { DomainStoryReplaceOption, ReplaceOption } from "./DomainStoryReplaceOption";
import PopupMenuProvider, {
    PopupMenuEntries,
    PopupMenuEntriesProvider,
    PopupMenuEntry,
} from "diagram-js/lib/features/popup-menu/PopupMenuProvider";
import { PopupMenuTarget } from "diagram-js/lib/features/popup-menu/PopupMenu";

export class DomainStoryReplaceMenuProvider implements PopupMenuProvider {
    static $inject: string[] = [];

    constructor(
        private readonly domainStoryReplace: DomainStoryReplace,
        private readonly domainStoryReplaceOption: DomainStoryReplaceOption,
    ) {}

    getPopupMenuEntries(
        target: PopupMenuTarget,
    ): PopupMenuEntriesProvider | PopupMenuEntries {
        return this.getEntries(target);
    }

    /**
     * Get all entries from replaceOptions for the given element and apply filters
     * on them. Get, for example, only elements, which are different from the current one.
     * @return a list of menu entry items
     */
    private getEntries(element: PopupMenuTarget) {
        const el = element as Shape;

        let entries: ReplaceOption[] = [];
        if (el["type"].includes(ElementTypes.ACTOR)) {
            entries = this.domainStoryReplaceOption.actorReplaceOptions(el["type"]);
        } else if (el["type"].includes(ElementTypes.WORKOBJECT)) {
            entries = this.domainStoryReplaceOption.workObjectReplaceOptions(el["type"]);
        }

        return this.createEntries(el, entries);
    }

    /**
     * Creates an array of menu entry objects for a given element and filters the replaceOptions
     * according to a filter function.
     * @return a list of menu items
     */
    private createEntries(element: Shape, replaceOptions: ReplaceOption[]) {
        const menuEntries: Record<string, PopupMenuEntry> = {};

        forEach(replaceOptions, (definition) => {
            menuEntries[definition.actionName] = this.createMenuEntry(
                definition,
                element,
            );
        });

        return menuEntries;
    }

    /**
     * Creates and returns a single menu entry item.
     *
     * @param  definition a single replace options definition object
     * @param  element the element to replace
     * @param  action an action callback function which gets called when
     *         the menu entry is being triggered.
     *
     * @return menu entry item
     */
    private createMenuEntry(
        definition: ReplaceOption,
        element: Shape,
        action?: () => void,
    ): PopupMenuEntry {
        const replaceAction = () => {
            return this.domainStoryReplace.replaceElement(element, definition.target);
        };

        action = action || replaceAction;

        return {
            label: definition.label,
            className: definition.className,
            // id: definition.actionName,
            action: action,
        };
    }
}

DomainStoryReplaceMenuProvider.$inject = [
    "domainStoryReplace",
    "domainStoryReplaceOption",
];
