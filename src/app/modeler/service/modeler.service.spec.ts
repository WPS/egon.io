import { TestBed } from '@angular/core/testing';

import { ModelerService } from 'src/app/modeler/service/modeler.service';
import { InitializerService } from './initializer.service';
import { ElementRegistryService } from '../../elementRegistry-service/element-registry.service';
import { IconDictionaryService } from '../../domain-configuration/service/icon-dictionary.service';
import { DomainConfigurationService } from '../../domain-configuration/service/domain-configuration.service';
import { MockService } from 'ng-mocks';

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
