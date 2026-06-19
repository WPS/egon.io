import { DomainStory } from '../../../../domain/entities/domainStory';
import { IconSet } from 'src/app/domain/entities/iconSet';

export class ConfigAndDST {
  iconSet: IconSet | undefined;
  domainStory: DomainStory;

  constructor(domain: IconSet | undefined, dst: DomainStory) {
    this.iconSet = domain;
    this.domainStory = dst;
  }
}
