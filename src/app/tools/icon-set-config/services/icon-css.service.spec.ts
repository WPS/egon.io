import { TestBed } from '@angular/core/testing';

import { IconCssService } from 'src/app/tools/icon-set-config/services/icon-css.service';

describe('IconCssService', () => {
  let service: IconCssService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconCssService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
