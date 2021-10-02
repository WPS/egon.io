import { TestBed } from '@angular/core/testing';

import { IconDictionaryService } from 'src/app/domain-configuration/service/icon-dictionary.service';

describe('IconDictionaryService', () => {
  let service: IconDictionaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconDictionaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
