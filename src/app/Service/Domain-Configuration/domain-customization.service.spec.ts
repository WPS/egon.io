import {TestBed} from '@angular/core/testing';

import {DomainCustomizationService} from './domain-customization.service';
import {IconDictionaryService} from "./icon-dictionary.service";
import {MockProviders} from "ng-mocks";
import {ElementRegistryService} from "../ElementRegistry/element-registry.service";
import {TitleService} from "../Title/title.service";

describe('DomainCustomizationService', () => {
  let service: DomainCustomizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockProviders(IconDictionaryService, ElementRegistryService, TitleService)
      ]
    });
    service = TestBed.inject(DomainCustomizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
