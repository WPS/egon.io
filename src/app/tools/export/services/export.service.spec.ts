import { TestBed } from '@angular/core/testing';

import { ExportService } from 'src/app/tools/export/services/export.service';
import { HtmlPresentationService } from './html-presentation.service';
import { MockModule, MockService } from 'ng-mocks';
import { IconSetConfigurationService } from '../../icon-set-config/services/icon-set-configuration.service';
import { PngService } from './png.service';
import { SvgService } from './svg.service';
import { RendererService } from '../../modeler/services/renderer.service';
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
          provide: IconSetConfigurationService,
          useValue: MockService(IconSetConfigurationService),
        },
        {
          provide: PngService,
          useValue: MockService(PngService),
        },
        {
          provide: SvgService,
          useValue: MockService(SvgService),
        },
        {
          provide: RendererService,
          useValue: MockService(RendererService),
        },
      ],
    });
    service = TestBed.inject(ExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
