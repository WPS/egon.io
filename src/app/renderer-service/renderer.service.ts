import {Injectable} from '@angular/core';
import {ModelerService} from 'src/app/modeler/service/modeler.service';
import {BusinessObject} from 'src/app/common/domain/businessObject';
import {ElementRegistryService} from 'src/app/elementRegistry-service/element-registry.service';
import {DirtyFlagService} from 'src/app/dirtyFlag-service/dirty-flag.service';
import {DomainConfiguration} from 'src/app/common/domain/domainConfiguration';

@Injectable({
  providedIn: 'root',
})
export class RendererService {
  constructor(
    private modelerService: ModelerService,
    private elementRegistryService: ElementRegistryService,
    private dirtyFlagService: DirtyFlagService
  ) {}

  public renderStory(domainStory: BusinessObject[]): void {
    this.modelerService.getModeler().importCustomElements(domainStory);
  }

  public importStory(
    domainStory: BusinessObject[],
    configurationChange: boolean,
    config?: DomainConfiguration,
    makeClean = true
  ): void {
    if (configurationChange) {
      this.modelerService.restart(config, domainStory);
    } else {
      this.renderStory(domainStory);

      this.elementRegistryService.correctInitialize();

      this.modelerService.commandStackChanged();
      this.modelerService.startDebounce();
    }
    if (makeClean) {
      this.dirtyFlagService.makeClean();
    }
  }

  public getStory(): BusinessObject[] {
    return this.elementRegistryService
      .createObjectListForDSTDownload()
      .map((c) => c.businessObject);
  }
}
