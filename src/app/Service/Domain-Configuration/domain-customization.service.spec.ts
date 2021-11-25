import { TestBed } from '@angular/core/testing';

import { DomainCustomizationService } from './domain-customization.service';

describe('DomainCustomizationService', () => {
  let service: DomainCustomizationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomainCustomizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
