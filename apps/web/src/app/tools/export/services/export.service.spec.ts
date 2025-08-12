import { TestBed } from '@angular/core/testing';

import { ExportService } from 'src/app/tools/export/services/export.service';
import { HtmlPresentationService } from './html-presentation.service';
import { MockModule, MockService } from 'ng-mocks';
import { IconSetImportExportService } from '../../icon-set-config/services/icon-set-import-export.service';
import { PngService } from './png.service';
import { SvgService } from './svg.service';
import { MatDialogModule } from '@angular/material/dialog';

describe('ExportService', () => {
  let service: ExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MockModule(MatDialogModule)],
      providers: [
        {
          provide: HtmlPresentationService,
          useValue: MockService(HtmlPresentationService),
        },
        {
          provide: IconSetImportExportService,
          useValue: MockService(IconSetImportExportService),
        },
        {
          provide: PngService,
          useValue: MockService(PngService),
        },
        {
          provide: SvgService,
          useValue: MockService(SvgService),
        },
      ],
    });
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
