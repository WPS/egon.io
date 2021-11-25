import {TestBed} from '@angular/core/testing';

import {ModelerService} from 'src/app/Service/Modeler/modeler.service';
import {InitializerService} from './initializer.service';
import {ElementRegistryService} from '../ElementRegistry/element-registry.service';
import {IconDictionaryService} from '../Domain-Configuration/icon-dictionary.service';
import {DomainConfigurationService} from '../Domain-Configuration/domain-configuration.service';
import {MockService} from 'ng-mocks';

describe('ModelerService', () => {
  let service: ModelerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: InitializerService,
          useValue: MockService(InitializerService),
        },
        {
          provide: ElementRegistryService,
          useValue: MockService(ElementRegistryService),
        },
        {
          provide: IconDictionaryService,
          useValue: MockService(IconDictionaryService),
        },
        {
          provide: DomainConfigurationService,
          useValue: MockService(DomainConfigurationService),
        },
      ],
    });
    service = TestBed.inject(ModelerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
