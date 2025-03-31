import { ElementRegistryService } from "../../domain/service/ElementRegistryService";
import { BusinessObject } from "../../domain/entities/businessObject";
import { ConfigAndDST } from "../domain/configAndDst";

export class DomainStoryExportService {
    static $inject: string[] = [];

    constructor(private readonly elementRegistryService: ElementRegistryService) {}

    export(): string {
        const dst = this.getStory();
        const configAndDST = this.createConfigAndDST(dst);
        return JSON.stringify(configAndDST, null, 2);
    }

    private getStory(): BusinessObject[] {
        return this.elementRegistryService
            .createObjectListForDSTDownload()
            .map((c) => c.businessObject);
    }

    private createConfigAndDST(domainStory: any): ConfigAndDST {
        return new ConfigAndDST({}, domainStory);
    }
}

DomainStoryExportService.$inject = ["domainStoryElementRegistryService"];
