import { TestBed } from '@angular/core/testing';

import { CopyPasteService } from './copy-paste.service';

describe('CopyPasteService', () => {
  let service: CopyPasteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CopyPasteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
