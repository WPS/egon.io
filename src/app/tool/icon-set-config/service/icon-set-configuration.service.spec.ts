import { TestBed } from '@angular/core/testing';

import { IconSetConfigurationService } from 'src/app/tool/icon-set-config/service/icon-set-configuration.service';

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
