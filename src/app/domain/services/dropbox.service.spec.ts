import { TestBed } from '@angular/core/testing';

import { DropboxService } from './dropbox.service';

describe('DropboxService', () => {
  let service: DropboxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropboxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
