import CommandStack from "diagram-js/lib/command";
import DomainStoryModeling from "../modeling";
import ElementRegistryService from "../../domain/service";
import { DomainStoryUpdateHandler } from "./DomainStoryUpdateHandler";

export default {
    __depends__: [DomainStoryModeling, ElementRegistryService, CommandStack],
    __init__: ["domainStoryUpdateHandler"],
    domainStoryUpdateHandler: ["type", DomainStoryUpdateHandler],
};
