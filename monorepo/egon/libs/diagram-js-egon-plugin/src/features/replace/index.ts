import DomainStoryModeling from "../modeling";
import IconDictionaryService from "../../icon-set-config/service";

import { DomainStoryReplaceMenuProvider } from "./DomainStoryReplaceMenuProvider";
import { DomainStoryReplace } from "./DomainStoryReplace";
import { DomainStoryReplaceOption } from "./DomainStoryReplaceOption";

export default {
    __depends__: [DomainStoryModeling, IconDictionaryService],
    __init__: ["domainStoryReplaceMenuProvider", "domainStoryReplace"],
    domainStoryReplace: ["type", DomainStoryReplace],
    domainStoryReplaceOption: ["type", DomainStoryReplaceOption],
    domainStoryReplaceMenuProvider: ["type", DomainStoryReplaceMenuProvider],
};
