import {TestBed} from '@angular/core/testing';

import {IconDictionaryService} from 'src/app/Service/Domain-Configuration/icon-dictionary.service';

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
