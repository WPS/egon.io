import CroppingConnectionDocking from "diagram-js/lib/layout/CroppingConnectionDocking";
import { DomainStoryUpdater } from "./DomainStoryUpdater";

export default {
    __init__: ["domainStoryUpdater"],
    domainStoryUpdater: ["type", DomainStoryUpdater],
    connectionDocking: ["type", CroppingConnectionDocking],
};
