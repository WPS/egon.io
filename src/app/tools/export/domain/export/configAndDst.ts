import { DomainStory } from '../../../../domain/entities/domainStory';
import { IconSetConfigurationForExport } from 'src/app/domain/entities/icon-set-configuration-for-export';

export class ConfigAndDST {
  iconSet: IconSetConfigurationForExport | undefined;
  domainStory: DomainStory;

  constructor(
    domain: IconSetConfigurationForExport | undefined,
    dst: DomainStory,
  ) {
    this.iconSet = domain;
    this.domainStory = dst;
  }
}
