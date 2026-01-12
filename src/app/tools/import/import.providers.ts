import { ImportDomainStoryService } from './services/import-domain-story.service';
import { IconSetChangedService } from '../icon-set-config/services/icon-set-customization.service';

export function provideImportDomainStory() {
  return [
    {
      provide: IconSetChangedService,
      useExisting: ImportDomainStoryService,
    },
  ];
}
