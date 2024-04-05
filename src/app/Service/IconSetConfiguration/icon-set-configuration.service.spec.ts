import { TestBed } from '@angular/core/testing';

import { IconSetConfigurationService } from 'src/app/Service/IconSetConfiguration/icon-set-configuration.service';

describe(IconSetConfigurationService.name, () => {
  let service: IconSetConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconSetConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
