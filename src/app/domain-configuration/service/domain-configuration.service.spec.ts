import { TestBed } from '@angular/core/testing';

import { DomainConfigurationService } from 'src/app/domain-configuration/service/domain-configuration.service';

describe('DomainConfigurationService', () => {
  let service: DomainConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DomainConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
