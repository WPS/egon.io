import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { MatSnackBar } from '@angular/material/snack-bar';

import { HtmlPresentationService } from './html-presentation.service';
import { ReplayService } from '../../replay/services/replay.service';
import { ModelerService } from 'src/app/tools/modeler/services/modeler.service';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { CommandStackService } from 'src/app/tools/modeler/services/command-stack.service';
import * as downloadFileModule from 'src/app/utils/downloadFile';

const SVG_WITH_MARKER =
  '<svg width="500" height="400" viewBox="0 0 500 400" version="1.1">' +
  '<defs><marker id="marker-abc"><path/></marker></defs><g/></svg>';

describe('HtmlPresentationService', () => {
  let service: HtmlPresentationService;
  let snackbarSpy: jest.Mocked<MatSnackBar>;
  let downloadFileSpy: jest.SpyInstance;
  let saveSVG: jest.Mock;

  let currentSentence: number;
  let maxSentence: number;

  const replayServiceMock = {
    startReplay: jest.fn(),
    toggleShowGroups: jest.fn(),
    stopReplay: jest.fn(),
    nextSentence: jest.fn(() => (currentSentence += 1)),
    currentSentence: jest.fn(() => currentSentence),
    maxSentenceNumber: jest.fn(() => maxSentence),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    currentSentence = 1;
    maxSentence = 1;
    saveSVG = jest.fn().mockResolvedValue({ svg: SVG_WITH_MARKER });

    downloadFileSpy = jest
      .spyOn(downloadFileModule, 'downloadFile')
      .mockImplementation(() => undefined);

    const template = document.createElement('div');
    template.id = 'revealjs-template';
    template.innerHTML = '<section>{{=it.title}}-{{=it.description}}</section>';
    document.body.appendChild(template);

    TestBed.configureTestingModule({
      providers: [
        MockProvider(MatSnackBar),
        MockProvider(CommandStackService),
        { provide: ReplayService, useValue: replayServiceMock },
        {
          provide: ModelerService,
          useValue: {
            fitStoryToScreen: jest.fn(),
            getModeler: jest.fn(() => ({ saveSVG })),
          },
        },
      ],
    });
    snackbarSpy = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
    const propertiesService = TestBed.inject(PropertiesService);
    propertiesService.updateTitleAndDescriptionAndScope(
      'Title',
      'Description',
      undefined,
      false,
    );
    service = TestBed.inject(HtmlPresentationService);
  });

  afterEach(() => {
    downloadFileSpy.mockRestore();
    document.getElementById('revealjs-template')?.remove();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fit the story to screen and drive a replay cycle', async () => {
    await service.downloadHTMLPresentation('story');

    expect(replayServiceMock.startReplay).toHaveBeenCalled();
    expect(replayServiceMock.toggleShowGroups).toHaveBeenCalled();
    expect(replayServiceMock.stopReplay).toHaveBeenCalled();
  });

  it('should download an .html file with the sanitized filename', async () => {
    await service.downloadHTMLPresentation('my story');

    expect(downloadFileSpy).toHaveBeenCalledWith(
      expect.any(String),
      'data:text/html;charset=UTF-8,',
      'my story',
      '.html',
      false,
    );
  });

  it('should export every sentence when there is more than one', async () => {
    maxSentence = 2;

    await service.downloadHTMLPresentation('story');

    expect(saveSVG).toHaveBeenCalledTimes(1);
    expect(replayServiceMock.nextSentence).toHaveBeenCalled();
    expect(downloadFileSpy).toHaveBeenCalled();
  });

  it('should show a snackbar when exporting a sentence fails', async () => {
    maxSentence = 2;
    saveSVG.mockRejectedValueOnce(new Error('boom'));

    await service.downloadHTMLPresentation('story');

    expect(snackbarSpy.open).toHaveBeenCalledWith(
      expect.stringContaining('There was an error exporting the SVG.'),
      undefined,
      expect.anything(),
    );
  });
});
