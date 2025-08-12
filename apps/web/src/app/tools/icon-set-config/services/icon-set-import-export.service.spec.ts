import { TestBed } from '@angular/core/testing';

import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';

describe(IconSetImportExportService.name, () => {
  let service: IconSetImportExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IconSetImportExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
