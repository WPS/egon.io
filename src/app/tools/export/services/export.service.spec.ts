import { TestBed } from '@angular/core/testing';
import { MockModule, MockProvider, MockService } from 'ng-mocks';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ExportService } from 'src/app/tools/export/services/export.service';
import { HtmlPresentationService } from './html-presentation.service';
import { IconSetImportExportService } from '../../icon-set-config/services/icon-set-import-export.service';
import { PngService } from './png.service';
import { SvgService } from './svg.service';
import { ModelerService } from '../../modeler/services/modeler.service';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';
import { CommandStackService } from 'src/app/tools/modeler/services/command-stack.service';
import { DialogService } from 'src/app/tools/dialog/services/dialog.service';
import { ExportDialogComponent } from '../presentation/export-dialog/export-dialog.component';
import { ExportDialogData } from '../domain/dialog/exportDialogData';
import { BusinessObject } from 'src/app/domain/entities/business-object';
import * as downloadFileModule from 'src/app/utils/downloadFile';

describe('ExportService', () => {
  let service: ExportService;
  let modelerServiceSpy: jest.Mocked<ModelerService>;
  let svgServiceSpy: jest.Mocked<SvgService>;
  let dirtyFlagServiceSpy: jest.Mocked<DirtyFlagService>;
  let dialogServiceSpy: jest.Mocked<DialogService>;
  let snackbarSpy: jest.Mocked<MatSnackBar>;
  let htmlPresentationServiceSpy: jest.Mocked<HtmlPresentationService>;
  let propertiesService: PropertiesService;
  let downloadFileSpy: jest.SpyInstance;

  const businessObject = { id: 'a' } as BusinessObject;

  beforeEach(() => {
    downloadFileSpy = jest
      .spyOn(downloadFileModule, 'downloadFile')
      .mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      imports: [MockModule(MatDialogModule)],
      providers: [
        MockProvider(ModelerService),
        MockProvider(DirtyFlagService),
        MockProvider(DialogService),
        MockProvider(MatSnackBar),
        MockProvider(CommandStackService),
        {
          provide: HtmlPresentationService,
          useValue: MockService(HtmlPresentationService),
        },
        {
          provide: IconSetImportExportService,
          useValue: MockService(IconSetImportExportService),
        },
        { provide: PngService, useValue: MockService(PngService) },
        { provide: SvgService, useValue: MockService(SvgService) },
      ],
    });

    modelerServiceSpy = TestBed.inject(
      ModelerService,
    ) as jest.Mocked<ModelerService>;
    svgServiceSpy = TestBed.inject(SvgService) as jest.Mocked<SvgService>;
    dirtyFlagServiceSpy = TestBed.inject(
      DirtyFlagService,
    ) as jest.Mocked<DirtyFlagService>;
    dialogServiceSpy = TestBed.inject(
      DialogService,
    ) as jest.Mocked<DialogService>;
    snackbarSpy = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
    htmlPresentationServiceSpy = TestBed.inject(
      HtmlPresentationService,
    ) as jest.Mocked<HtmlPresentationService>;
    propertiesService = TestBed.inject(PropertiesService);
    propertiesService.updateTitleAndDescriptionAndScope(
      'My Story',
      'a description',
      undefined,
      false,
    );

    modelerServiceSpy.getStory.mockReturnValue([]);
    service = TestBed.inject(ExportService);
  });

  afterEach(() => downloadFileSpy.mockRestore());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isDomainStoryExportable', () => {
    it('should be false for an empty story', () => {
      modelerServiceSpy.getStory.mockReturnValue([]);
      expect(service.isDomainStoryExportable()).toBe(false);
    });

    it('should be true for a non-empty story', () => {
      modelerServiceSpy.getStory.mockReturnValue([businessObject]);
      expect(service.isDomainStoryExportable()).toBe(true);
    });
  });

  describe('downloadEGN', () => {
    it('should download a .egn file and clean the dirty flag', () => {
      modelerServiceSpy.getStory.mockReturnValue([businessObject]);

      service.downloadEGN('story');

      expect(downloadFileSpy).toHaveBeenCalledWith(
        expect.any(String),
        'data:text/plain;charset=utf-8,',
        'story',
        '.egn',
      );
      expect(dirtyFlagServiceSpy.makeClean).toHaveBeenCalled();
    });
  });

  describe('downloadSVG', () => {
    it('should build svg data and download a .egn.svg file', () => {
      modelerServiceSpy.getStory.mockReturnValue([businessObject]);
      svgServiceSpy.createSVGData.mockReturnValue('<svg></svg>');

      service.downloadSVG('story', true, false, 200);

      expect(svgServiceSpy.createSVGData).toHaveBeenCalledWith(
        'My Story',
        'a description',
        expect.anything(),
        true,
        false,
        200,
      );
      expect(downloadFileSpy).toHaveBeenCalledWith(
        '<svg></svg>',
        'data:application/bpmn20-xml;charset=UTF-8,',
        'story',
        '.egn.svg',
      );
      expect(dirtyFlagServiceSpy.makeClean).toHaveBeenCalled();
    });
  });

  describe('openDownloadDialog', () => {
    it('should open the export dialog with all four options when exportable', () => {
      modelerServiceSpy.getStory.mockReturnValue([businessObject]);

      service.openDownloadDialog();

      expect(dialogServiceSpy.openDialog).toHaveBeenCalledWith(
        ExportDialogComponent,
        expect.anything(),
      );
      const config = dialogServiceSpy.openDialog.mock.calls[0][1];
      const data = config.data as ExportDialogData;
      expect(data.options.map((o) => o.text)).toEqual([
        'SVG',
        'EGN',
        'PNG',
        'HTML-Presentation',
      ]);
      expect(snackbarSpy.open).not.toHaveBeenCalled();
    });

    it('should show a snackbar instead of a dialog when not exportable', () => {
      modelerServiceSpy.getStory.mockReturnValue([]);

      service.openDownloadDialog();

      expect(dialogServiceSpy.openDialog).not.toHaveBeenCalled();
      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'No Domain Story to be exported',
        undefined,
        expect.anything(),
      );
    });
  });

  describe('downloadHTMLPresentation', () => {
    it('should delegate to the html presentation service', () => {
      htmlPresentationServiceSpy.downloadHTMLPresentation.mockResolvedValue(
        undefined,
      );

      service.downloadHTMLPresentation('story');

      expect(
        htmlPresentationServiceSpy.downloadHTMLPresentation,
      ).toHaveBeenCalledWith('story');
    });
  });

  describe('getFilename', () => {
    it('should sanitize the title when no filename has been set', () => {
      expect(service.getFilename()).toBe('My Story');
    });

    it('should return the last used filename once one has been set', () => {
      modelerServiceSpy.getStory.mockReturnValue([businessObject]);
      service.downloadEGN('explicit-name');

      expect(service.getFilename()).toBe('explicit-name');
    });
  });

  describe('downloadPNG', () => {
    afterEach(() => {
      document.getElementById('canvas')?.remove();
    });

    it('should do nothing when there is no canvas element', () => {
      const pngService = TestBed.inject(PngService) as jest.Mocked<PngService>;

      service.downloadPNG('story', true);

      expect(pngService.createSvgAndImage).not.toHaveBeenCalled();
    });

    it('should render and download a .png when a canvas is present', () => {
      const canvas = document.createElement('div');
      canvas.id = 'canvas';
      document.body.appendChild(canvas);

      const pngService = TestBed.inject(PngService) as jest.Mocked<PngService>;
      const image = new Image();
      pngService.createSvgAndImage.mockReturnValue({
        svg: '<svg/>',
        image,
        width: 100,
        height: 80,
      } as any);
      pngService.createTempCanvas.mockReturnValue(
        document.createElement('canvas'),
      );

      service.downloadPNG('story', true);
      // jsdom does not fire load events; invoke the handler directly
      (image.onload as any)(new Event('load'));

      expect(downloadFileSpy).toHaveBeenCalledWith(
        expect.any(String),
        '',
        'story',
        '.png',
        false,
      );
    });
  });
});
