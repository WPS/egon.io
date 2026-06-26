import { DomainStory } from 'src/app/domain/entities/domain-story';
import { IconSetExportConfiguration } from 'src/app/domain/entities/icon-set-export-configuration';

export class ConfigAndDST {
  iconSet: IconSetExportConfiguration | undefined;
  domainStory: DomainStory;

  constructor(
    domain: IconSetExportConfiguration | undefined,
    dst: DomainStory,
  ) {
    this.iconSet = domain;
    this.domainStory = dst;
  }
}
