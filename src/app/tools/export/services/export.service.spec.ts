import { TestBed } from '@angular/core/testing';

import { ExportService } from 'src/app/tools/export/services/export.service';
import { HtmlPresentationService } from './html-presentation.service';
import { StoryAsSpecService } from './story-as-spec.service';
import { MockModule, MockService } from 'ng-mocks';
import { IconSetImportExportService } from '../../icon-set-config/services/icon-set-import-export.service';
import { PngService } from './png.service';
import { SvgService } from './svg.service';
import { MatDialogModule } from '@angular/material/dialog';

describe('ExportService', () => {
  let service: ExportService;
  let storyAsSpecService: StoryAsSpecService;

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
        {
          provide: StoryAsSpecService,
          useValue: MockService(StoryAsSpecService),
        },
      ],
    });
    service = TestBed.inject(ExportService);
    storyAsSpecService = TestBed.inject(StoryAsSpecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('downloadStoryAsSpec generates a story-as-spec summary', () => {
    spyOn(storyAsSpecService, 'generateStoryAsSpec').and.returnValue(
      'This Domain Story describes how Test interacts with Thing across 1 step.',
    );

    service.downloadStoryAsSpec('test-filename');

    expect(storyAsSpecService.generateStoryAsSpec).toHaveBeenCalled();
  });
});
