import DomainStoryTextRenderer from "../text-renderer";
import ElementRegistryService from "../../domain/service";
import DirtyFlagService from "../../domain/service";
import IconDictionaryService from "../../icon-set-config/service";

import { DomainStoryRenderer } from "./DomainStoryRenderer";
import CommandStack from "diagram-js/lib/command";

export default {
    __depends__: [
        DomainStoryTextRenderer,
        ElementRegistryService,
        DirtyFlagService,
        IconDictionaryService,
        CommandStack,
    ],
    __init__: ["domainStoryRenderer"],
    domainStoryRenderer: ["type", DomainStoryRenderer],
};
