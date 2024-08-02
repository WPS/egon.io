import { TestBed } from '@angular/core/testing';

import { PngService } from 'src/app/tool/export/service/png.service';

describe('SvgService', () => {
  let service: PngService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PngService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
