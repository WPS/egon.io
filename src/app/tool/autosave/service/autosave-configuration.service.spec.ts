import { TestBed } from '@angular/core/testing';

import { AutosaveConfigurationService } from './autosave-configuration.service';
import { StorageService } from '../../../_domain/service/storage.service';
import { MockProvider } from 'ng-mocks';

describe('AutosaveConfigurationService', () => {
  let service: AutosaveConfigurationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(StorageService)],
    });

    service = TestBed.inject(AutosaveConfigurationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
