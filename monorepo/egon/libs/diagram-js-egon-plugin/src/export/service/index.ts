import ElementRegistryService from "../../domain/service";
import { DomainStoryExportService } from "./DomainStoryExportService";

export default {
    __depends__: [ElementRegistryService],
    __init__: ["domainStoryExportService"],
    domainStoryExportService: ["type", DomainStoryExportService],
};
