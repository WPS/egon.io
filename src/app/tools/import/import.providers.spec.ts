import { provideImportDomainStory } from 'src/app/tools/import/import.providers';
import { ImportDomainStoryService } from 'src/app/tools/import/services/import-domain-story.service';
import { IconSetChangedService } from 'src/app/tools/icon-set-config/services/icon-set-customization.service';

describe('provideImportDomainStory', () => {
  it('should alias IconSetChangedService to the existing ImportDomainStoryService', () => {
    const providers = provideImportDomainStory();

    expect(providers).toEqual([
      {
        provide: IconSetChangedService,
        useExisting: ImportDomainStoryService,
      },
    ]);
  });
});
