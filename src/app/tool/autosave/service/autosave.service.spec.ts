import { TestBed } from '@angular/core/testing';

import { AutosaveService, DRAFTS_TAG } from './autosave.service';
import { MockProviders } from 'ng-mocks';
import { RendererService } from '../../../Service/Renderer/renderer.service';
import { IconSetConfigurationService } from '../../../Service/IconSetConfiguration/icon-set-configuration.service';
import { ExportService } from '../../../Service/Export/export.service';
import { AutosaveConfigurationService } from './autosave-configuration.service';
import { Draft } from '../domain/draft';
import { testConfigAndDst } from '../../../Domain/Export/configAndDst';
import { StorageService } from '../../../Service/BrowserStorage/storage.service';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('AutosaveService', () => {
  let service: AutosaveService;

  let rendererServiceSpy: jasmine.SpyObj<RendererService>;
  let autosaveStateSpy: jasmine.SpyObj<AutosaveConfigurationService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  const autosaveConfigurationServiceMock = jasmine.createSpyObj(
    'AutosaveConfigurationService',
    ['setConfiguration'],
    { configuration$: of({ activated: true, maxDrafts: 1, interval: 1 }) },
  );

  beforeEach(() => {
    const renderServiceMock = jasmine.createSpyObj('RendererService', [
      'importStory',
      'getStory',
    ]);
    const storageServiceMock = jasmine.createSpyObj('StorageService', [
      'get',
      'set',
    ]);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: RendererService,
          useValue: renderServiceMock,
        },
        {
          provide: AutosaveConfigurationService,
          useValue: autosaveConfigurationServiceMock,
        },
        {
          provide: StorageService,
          useValue: storageServiceMock,
        },
        MockProviders(IconSetConfigurationService, ExportService, MatSnackBar),
      ],
    });
    rendererServiceSpy = TestBed.inject(
      RendererService,
    ) as jasmine.SpyObj<RendererService>;
    autosaveStateSpy = TestBed.inject(
      AutosaveConfigurationService,
    ) as jasmine.SpyObj<AutosaveConfigurationService>;
    storageServiceSpy = TestBed.inject(
      StorageService,
    ) as jasmine.SpyObj<StorageService>;

    service = TestBed.inject(AutosaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('applyAutosave', () => {
    beforeEach(() => {
      rendererServiceSpy.importStory.and.returnValue();
    });

    it('should call rendererService.importStory', () => {
      service.loadDraft(
        createEmptyAutosave(Date.now().toString().slice(0, 25)),
      );
      expect(rendererServiceSpy.importStory).toHaveBeenCalled();
    });
  });

  describe('loadCurrentAutosaves', () => {
    let autosaves: Draft[] = [];

    beforeEach(() => {
      autosaves = [
        createEmptyAutosave(
          Date.UTC(2000, 1, 1, 1, 1, 1).toString().slice(0, 25),
        ),
        createEmptyAutosave(Date.now().toString().slice(0, 25)),
      ];
    });

    it('should getItem from local Storage', () => {
      storageServiceSpy.get.withArgs(DRAFTS_TAG).and.returnValue([]);
      const loadedAutosaves = service.loadCurrentDrafts();

      expect(storageServiceSpy.get).toHaveBeenCalledWith(DRAFTS_TAG);
      expect(loadedAutosaves).toEqual([]);
    });

    it('should return sorted autosaves', () => {
      storageServiceSpy.get.withArgs(DRAFTS_TAG).and.returnValue(autosaves);

      const loadedAutosaves = service.loadCurrentDrafts();

      expect(storageServiceSpy.get).toHaveBeenCalledWith(DRAFTS_TAG);
      expect(loadedAutosaves).toEqual(autosaves);
    });
  });

  function createEmptyAutosave(date: string): Draft {
    return {
      description: 'desc',
      title: 'title',
      configAndDST: structuredClone(testConfigAndDst),
      date,
    };
  }
});
