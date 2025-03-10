import { ElementRegistryService } from "./ElementRegistryService";
import { DirtyFlagService } from "./DirtyFlagService";

export default {
    __init__: ["domainStoryElementRegistryService", "domainStoryDirtyFlagService"],
    domainStoryElementRegistryService: ["type", ElementRegistryService],
    domainStoryDirtyFlagService: ["type", DirtyFlagService],
};
