import IconDictionaryService from "../../icon-set-config/service";
import ElementRegistryService from "../../domain/service";
import { LabelDictionaryService } from "./LabelDictionaryService";

export default {
    __depends__: [IconDictionaryService, ElementRegistryService],
    __init__: ["domainStoryLabelDictionaryService"],
    domainStoryLabelDictionaryService: ["type", LabelDictionaryService],
};
