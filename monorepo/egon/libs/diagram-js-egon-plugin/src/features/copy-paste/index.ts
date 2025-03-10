import CopyPasteModule from "diagram-js/lib/features/copy-paste";

import { DomainStoryCopyPaste } from "./DomainStoryCopyPaste";
import { DomainStoryPropertyCopy } from "./DomainStoryPropertyCopy";

export default {
    __depends__: [CopyPasteModule],
    __init__: ["domainStoryCopyPaste", "domainStoryPropertyCopy"],
    domainStoryCopyPaste: ["type", DomainStoryCopyPaste],
    domainStoryPropertyCopy: ["type", DomainStoryPropertyCopy],
};
