import { TestBed } from '@angular/core/testing';

import { LabelDictionaryService } from 'src/app/label-dictionary/service/label-dictionary.service';

describe('LabelDictionaryService', () => {
  let service: LabelDictionaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabelDictionaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
