import { TestBed } from '@angular/core/testing';

import { DomainCustomizationService } from './domain-customization.service';
import { IconDictionaryService } from './icon-dictionary.service';
import { MockProvider, MockProviders } from 'ng-mocks';
import { TitleService } from '../Title/title.service';
import { DomainConfigurationService } from './domain-configuration.service';
import { ImportDomainStoryService } from '../Import/import-domain-story.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  CustomDomainCofiguration,
  DomainConfiguration,
  testCustomDomainConfiguration,
} from '../../Domain/Common/domainConfiguration';
import { Dictionary } from '../../Domain/Common/dictionary/dictionary';
import { Observable, of } from 'rxjs';
import { INITIAL_DOMAIN_NAME } from '../../Domain/Common/constants';

describe('DomainCustomizationService', () => {
  let service: DomainCustomizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProviders(TitleService, MatSnackBar),
        MockProvider(ImportDomainStoryService, {
          get importedConfigurationEvent(): Observable<DomainConfiguration> {
            const domainConfiguration: DomainConfiguration = {
              name: INITIAL_DOMAIN_NAME,
              actors: new Dictionary(),
              workObjects: new Dictionary(),
            };
            return of(domainConfiguration);
          },
        }),
        MockProvider(IconDictionaryService, {
          getAllIconDictionary(): Dictionary {
            return new Dictionary();
          },
        }),
        MockProvider(DomainConfigurationService, {
          getCurrentConfigurationNamesWithoutPrefix(): CustomDomainCofiguration {
            return testCustomDomainConfiguration;
          },
        }),
      ],
    });
    service = TestBed.inject(DomainCustomizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
