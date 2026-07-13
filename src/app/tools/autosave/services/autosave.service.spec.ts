import { TestBed } from '@angular/core/testing';

import { AutosaveService } from './autosave.service';
import { MockProvider, MockProviders } from 'ng-mocks';
import { ModelerService } from '../../modeler/services/modeler.service';
import { IconSetImportExportService } from '../../icon-set-config/services/icon-set-import-export.service';
import { ExportService } from '../../export/services/export.service';
import { AutosaveConfigurationService } from './autosave-configuration.service';
import { Draft } from '../domain/draft';
import { StorageService } from '../../../utils/services/storage.service';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DRAFTS_KEY } from 'src/app/domain/entities/constants';
import { signal } from '@angular/core';
import { testConfigAndDst } from 'src/app/tools/export/services/test-files/test_config_and_dst';

describe('AutosaveService', () => {
  let service: AutosaveService;

  let modelerServiceSpy: jest.Mocked<ModelerService>;
  let autosaveStateSpy: jest.Mocked<AutosaveConfigurationService>;
  let storageServiceSpy: jest.Mocked<StorageService>;
  let iconSetImportExportService: jest.Mocked<IconSetImportExportService>;

  const configurationSignal = signal({
    activated: true,
    maxDrafts: 1,
    interval: 1,
  });

  beforeEach(() => {
    const iconSetChangedSubject = new Subject<void>();

    TestBed.configureTestingModule({
      providers: [
        MockProvider(ModelerService),
        MockProvider(AutosaveConfigurationService, {
          configuration: configurationSignal.asReadonly(),
        }),
        MockProvider(StorageService),
        MockProvider(IconSetImportExportService, {
          iconSetChangedEmitterSubject: iconSetChangedSubject,
          iconSetChanged$: iconSetChangedSubject.asObservable(),
        }),
        MockProviders(ExportService, MatSnackBar),
      ],
    });
    modelerServiceSpy = TestBed.inject(
      ModelerService,
    ) as jest.Mocked<ModelerService>;
    autosaveStateSpy = TestBed.inject(
      AutosaveConfigurationService,
    ) as jest.Mocked<AutosaveConfigurationService>;
    storageServiceSpy = TestBed.inject(
      StorageService,
    ) as jest.Mocked<StorageService>;
    iconSetImportExportService = TestBed.inject(
      IconSetImportExportService,
    ) as jest.Mocked<IconSetImportExportService>;

    service = TestBed.inject(AutosaveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadDraft', () => {
    beforeEach(() => {
      modelerServiceSpy.importStory.mockReturnValue(undefined);
    });

    it('should call ModelerService.importStory', () => {
      service.loadDraft(createDraft(Date.now().toString().slice(0, 25)));
      expect(modelerServiceSpy.importStory).toHaveBeenCalled();
    });
  });

  describe('getDrafts', () => {
    let drafts: Draft[] = [];

    beforeEach(() => {
      drafts = [
        createDraft(Date.UTC(2000, 1, 1, 1, 1, 1).toString().slice(0, 25)),
        createDraft(Date.now().toString().slice(0, 25)),
      ];
    });

    it('should getItem from local Storage', () => {
      storageServiceSpy.get.mockReturnValue([]);
      const loadedDrafts = service.getDrafts();

      expect(storageServiceSpy.get).toHaveBeenCalledWith(DRAFTS_KEY);
      expect(loadedDrafts).toEqual([]);
    });

    it('should return sorted drafts', () => {
      storageServiceSpy.get.mockReturnValue(drafts);

      const loadedDrafts = service.getDrafts();

      expect(storageServiceSpy.get).toHaveBeenCalledWith(DRAFTS_KEY);
      expect(loadedDrafts).toEqual(drafts);
    });
  });

  describe('autosave when iconSetChanged triggers', () => {
    it('should call autosave', () => {
      const serviceSpy = jest.spyOn(service, 'autosave');

      iconSetImportExportService.iconSetChangedEmitterSubject.next();

      expect(serviceSpy).toHaveBeenCalledWith(1, false);
    });
  });

  function createDraft(date: string): Draft {
    return {
      description: 'desc',
      title: 'title',
      configAndDST: structuredClone(testConfigAndDst),
      date,
    };
  }
});
