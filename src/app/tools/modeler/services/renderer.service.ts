import { Injectable } from '@angular/core';
import { ModelerService } from 'src/app/tools/modeler/services/modeler.service';
import { BusinessObject } from 'src/app/domain/entities/businessObject';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { DirtyFlagService } from 'src/app/domain/services/dirty-flag.service';
import { IconSetConfiguration } from '../../../domain/entities/icon-set-configuration';

@Injectable({
  providedIn: 'root',
})
export class RendererService {
  constructor(
    private modelerService: ModelerService,
    private elementRegistryService: ElementRegistryService,
    private dirtyFlagService: DirtyFlagService,
  ) {}

  renderStory(domainStory: BusinessObject[]): void {
    this.modelerService.getModeler().importCustomElements(domainStory);
  }

  reset(): void {
    this.renderStory([]);
    this.dirtyFlagService.makeClean();
  }

  importStory(
    domainStory: BusinessObject[],
    configurationChange: boolean,
    config?: IconSetConfiguration,
    makeClean = true,
  ): void {
    this.modelerService.restart(config, domainStory);
    this.renderStory(domainStory);

    this.elementRegistryService.correctInitialize();

    this.modelerService.commandStackChanged();
    this.modelerService.startDebounce();

    if (makeClean) {
      this.dirtyFlagService.makeClean();
    }
  }

  getStory(): BusinessObject[] {
    return this.elementRegistryService
      .createObjectListForDSTDownload()
      .map((c) => c.businessObject);
  }
}
