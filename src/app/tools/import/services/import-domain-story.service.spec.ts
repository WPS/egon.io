import { TestBed } from '@angular/core/testing';

import { ImportDomainStoryService } from 'src/app/tools/import/services/import-domain-story.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { IconDictionaryService } from '../../icon-set-config/services/icon-dictionary.service';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';
import { ImportRepairService } from './import-repair.service';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { ModelerService } from 'src/app/tools/modeler/services/modeler.service';
import { MockService } from 'ng-mocks';
import { DialogService } from 'src/app/tools/dialog/services/dialog.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomainStory } from 'src/app/domain/entities/domain-story';
import { ImportDialogComponent } from '../presentation/import-dialog/import-dialog.component';
import { UnsavedChangesReminderDialogComponent } from 'src/app/tools/unsaved-changes-reminder/presentation/unsaved-changes-reminder-dialog.component';
import { ExternalResourcesWarningDialogComponent } from 'src/app/tools/import/presentation/external-resources-warning-dialog/external-resources-warning-dialog.component';

import * as dst_v_1_0_0 from './test-files/dst_export_version_1_0_0.json';
import * as dst_v_1_1_0 from './test-files/dst_export_version_1_1_0.json';
import * as dst_v_1_2_0 from './test-files/dst_export_version_1_2_0.json';
import * as dst_v_1_3_0 from './test-files/dst_export_version_1_3_0.json';
import * as dst_v_1_4_0 from './test-files/dst_export_version_1_4_0.json';
import * as dst_v_1_5_0 from './test-files/dst_export_version_1_5_0.json';
import * as dst_v_2_2_0 from './test-files/dst_export_version_2_2_0.json';
import * as egn_v_4_0_0 from 'src/app/tools/import/services/test-files/egn_export_version_4_0_0.json';
import {
  DomainPurity,
  Granularity_Grain,
  PointInTime,
  Scope,
} from 'src/app/domain/entities/scope';

describe('ImportDomainStoryService', () => {
  let service: ImportDomainStoryService;

  let iconDictionarySpy: jest.Mocked<IconDictionaryService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ElementRegistryService,
          useValue: MockService(ElementRegistryService),
        },
        {
          provide: IconDictionaryService,
          useValue: MockService(IconDictionaryService),
        },
        {
          provide: DirtyFlagService,
        },
        {
          provide: ImportRepairService,
          useValue: MockService(ImportRepairService),
        },
        {
          provide: PropertiesService,
        },
        {
          provide: DialogService,
          useValue: MockService(DialogService),
        },
        {
          provide: MatSnackBar,
          useValue: MockService(MatSnackBar),
        },
        {
          provide: ModelerService,
          useValue: MockService(ModelerService),
        },
      ],
    });
    iconDictionarySpy = TestBed.inject(
      IconDictionaryService,
    ) as jest.Mocked<IconDictionaryService>;
    service = TestBed.inject(ImportDomainStoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('should process title of story correctly', () => {
    const input_with_title = JSON.stringify(egn_v_4_0_0);
    const input_without_title = JSON.stringify(dst_v_2_2_0);
    let filename: string;
    let expectedTitle: string;

    beforeEach(function () {
      jest.spyOn(
        PropertiesService.prototype,
        'updateTitleAndDescriptionAndScope',
      );
    });

    it('.egn', () => {
      filename = 'meine domain story.egn';
      expectedTitle = 'meine domain story';
      service.processDomainStoryImport(
        input_without_title,
        filename,
        false,
        true,
        false,
      );
      expect(
        PropertiesService.prototype.updateTitleAndDescriptionAndScope,
      ).toHaveBeenCalledWith(expectedTitle, 'version 2.2.0', undefined, false);
    });

    it('.egn.svg', () => {
      filename = 'meine domain story.egn.svg';
      expectedTitle = 'meine domain story';
      service.processDomainStoryImport(
        input_without_title,
        filename,
        false,
        true,
        false,
      );
      expect(
        PropertiesService.prototype.updateTitleAndDescriptionAndScope,
      ).toHaveBeenCalledWith(expectedTitle, 'version 2.2.0', undefined, false);
    });

    it('.dst', () => {
      filename = 'meine domain story.dst';
      expectedTitle = 'meine domain story';
      service.processDomainStoryImport(
        input_without_title,
        filename,
        false,
        true,
        false,
      );
      expect(
        PropertiesService.prototype.updateTitleAndDescriptionAndScope,
      ).toHaveBeenCalledWith(expectedTitle, 'version 2.2.0', undefined, false);
    });

    it('.dst.svg', () => {
      filename = 'meine domain story.dst.svg';
      expectedTitle = 'meine domain story';
      service.processDomainStoryImport(
        input_without_title,
        filename,
        false,
        true,
        false,
      );
      expect(
        PropertiesService.prototype.updateTitleAndDescriptionAndScope,
      ).toHaveBeenCalledWith(expectedTitle, 'version 2.2.0', undefined, false);
    });

    it('.egn mit Datum', () => {
      filename =
        'alphorn-5a-riskassessment-fine-digitalized-tobe-colored_2024-08-08.egn';
      expectedTitle = 'alphorn-5a-riskassessment-fine-digitalized-tobe-colored';
      service.processDomainStoryImport(
        input_without_title,
        filename,
        false,
        true,
        false,
      );
      expect(
        PropertiesService.prototype.updateTitleAndDescriptionAndScope,
      ).toHaveBeenCalledWith(expectedTitle, 'version 2.2.0', undefined, false);
    });

    it('.egn.svg mit Datum', () => {
      filename =
        'alphorn-1a-standardcase-withboundaries-coarse-pure-asis_2024-08-08.egn.svg';
      expectedTitle = 'alphorn-1a-standardcase-withboundaries-coarse-pure-asis';
      service.processDomainStoryImport(
        input_without_title,
        filename,
        false,
        true,
        false,
      );
      expect(
        PropertiesService.prototype.updateTitleAndDescriptionAndScope,
      ).toHaveBeenCalledWith(expectedTitle, 'version 2.2.0', undefined, false);
    });

    it('.dst mit Datum', () => {
      filename = 'Organizing an investment conference_2024-08-08.dst';
      expectedTitle = 'Organizing an investment conference';
      service.processDomainStoryImport(
        input_without_title,
        filename,
        false,
        true,
        false,
      );
      expect(
        PropertiesService.prototype.updateTitleAndDescriptionAndScope,
      ).toHaveBeenCalledWith(expectedTitle, 'version 2.2.0', undefined, false);
    });

    it('story with integrated title', () => {
      filename = 'Organizing an investment conference_2024-08-08.dst';
      expectedTitle = 'testTitle';
      const expectedScope: Scope = {
        granularity: Granularity_Grain.COARSE,
        pointInTime: PointInTime.TO_BE,
        domainPurity: DomainPurity.DIGITALIZED,
      };
      service.processDomainStoryImport(
        input_with_title,
        filename,
        false,
        true,
        false,
      );
      expect(
        PropertiesService.prototype.updateTitleAndDescriptionAndScope,
      ).toHaveBeenCalledWith(
        expectedTitle,
        'version 4.0.0 (implement new DomainStory model)',
        expectedScope,
        false,
      );
    });
  });

  describe('should create DomainStory from import of json-context of ', () => {
    it('dst file in version 1.0.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.exportToDomainStory(
        dst_v_1_0_0,
        'test',
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_8939');
      expect(domainStory!.description).toBe('version 1.0.0');
      expect(domainStory!.version).toBe('1.0.0');
    });

    it('dst file in version 1.1.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.exportToDomainStory(
        dst_v_1_1_0,
        '',
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_2543');
      expect(domainStory!.description).toBe('version 1.1.0');
      expect(domainStory!.version).toBe('1.1.0');
    });

    it('dst file in version 1.2.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.exportToDomainStory(
        dst_v_1_2_0,
        '',
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_8939');
      expect(domainStory!.description).toBe('version 1.2.0');
      expect(domainStory!.version).toBe('1.2.0');
    });

    it('dst file in version 1.3.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.exportToDomainStory(
        dst_v_1_3_0,
        '',
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_2543');
      expect(domainStory!.description).toBe('version 1.3.0');
      expect(domainStory!.version).toBe('1.3.0');
    });

    it('dst file in version 1.4.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.exportToDomainStory(
        dst_v_1_4_0,
        '',
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_8939');
      expect(domainStory!.description).toBe('version 1.4.0');
      expect(domainStory!.version).toBe('1.4.0');
    });

    it('dst file in version 1.5.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.exportToDomainStory(
        dst_v_1_5_0,
        '',
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('shape_2543');
      expect(domainStory!.description).toBe('version 1.5.0');
      expect(domainStory!.version).toBe('1.5.0');
    });

    it('dst file in version 2.2.0', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.exportToDomainStory(
        dst_v_2_2_0,
        '',
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('connection_5930');
      expect(domainStory!.description).toBe('version 2.2.0');
      expect(domainStory!.version).toBe('2.2.0');
    });

    it('dst file of domain story', () => {
      // This import represents the import of a dst file.
      const domainStory: DomainStory | null = service.exportToDomainStory(
        egn_v_4_0_0,
        '',
      );

      expect(domainStory!.businessObjects.length).toBe(13);
      expect(domainStory!.businessObjects[0].id).toBe('connection_5930');
      expect(domainStory!.description).toBe(
        'version 4.0.0 (implement new DomainStory model)',
      );
      expect(domainStory!.version).toBe('4.0.0');
      expect(domainStory!.title).toBe('testTitle');
    });
  });

  describe('file input handling', () => {
    let snackbarSpy: jest.Mocked<MatSnackBar>;

    beforeEach(() => {
      snackbarSpy = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
    });

    afterEach(() => {
      document.getElementById('import')?.remove();
    });

    it('performDropImport should import supported files', () => {
      const importSpy = jest.spyOn(service, 'import').mockReturnValue(null);
      const file = new File(['{}'], 'story.egn');

      service.performDropImport(file);

      expect(importSpy).toHaveBeenCalledWith(file, 'story.egn');
    });

    it('performDropImport should reject unsupported files', () => {
      const importSpy = jest.spyOn(service, 'import').mockReturnValue(null);
      const file = new File(['{}'], 'story.txt');

      service.performDropImport(file);

      expect(importSpy).not.toHaveBeenCalled();
      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'File type not supported',
        undefined,
        expect.anything(),
      );
    });

    it('performImport should warn when there is no file input element', () => {
      document.getElementById('import')?.remove();

      service.performImport();

      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'No file selected or invalid input element.',
        undefined,
        expect.anything(),
      );
    });

    it('performImport should import the selected file', () => {
      const importSpy = jest.spyOn(service, 'import').mockReturnValue(null);
      const input = document.createElement('input');
      input.id = 'import';
      input.type = 'file';
      const file = new File(['{}'], 'story.dst');
      Object.defineProperty(input, 'files', { value: [file] });
      document.body.appendChild(input);

      service.performImport();

      expect(importSpy).toHaveBeenCalledWith(file, 'story.dst');
    });
  });

  describe('import from url', () => {
    let snackbarSpy: jest.Mocked<MatSnackBar>;
    let dialogServiceSpy: jest.Mocked<DialogService>;
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
      snackbarSpy = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
      dialogServiceSpy = TestBed.inject(
        DialogService,
      ) as jest.Mocked<DialogService>;
      originalFetch = global.fetch;
    });

    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('should reject a non-http url', () => {
      service.importFromUrl('ftp://example.com/file.egn');

      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'Url not valid',
        undefined,
        expect.anything(),
      );
    });

    it('should convert github urls and report network errors', async () => {
      const fetchMock = jest.fn().mockRejectedValue(new Error('network'));
      global.fetch = fetchMock as unknown as typeof global.fetch;

      service.importFromUrl('https://github.com/user/repo/blob/main/story.egn');
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(fetchMock).toHaveBeenCalledWith(
        'https://raw.githubusercontent.com/user/repo/main/story.egn',
      );
      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'Request blocked by server (CORS error) or Network error',
        undefined,
        expect.anything(),
      );
    });

    it('importNotDirtyFromUrl should open the reminder dialog when dirty', () => {
      service.importNotDirtyFromUrl('https://example.com/story.egn', true);

      expect(dialogServiceSpy.openDialog).toHaveBeenCalledWith(
        UnsavedChangesReminderDialogComponent,
        expect.anything(),
      );
    });

    it('importNotDirtyFromUrl should import directly when not dirty', () => {
      const importFromUrlSpy = jest
        .spyOn(service, 'importFromUrl')
        .mockImplementation(() => undefined);

      service.importNotDirtyFromUrl('https://example.com/story.egn', false);

      expect(importFromUrlSpy).toHaveBeenCalledWith(
        'https://example.com/story.egn',
      );
    });

    it('openImportFromUrlDialog should open the import dialog', () => {
      service.openImportFromUrlDialog(false);

      expect(dialogServiceSpy.openDialog).toHaveBeenCalledWith(
        ImportDialogComponent,
        expect.anything(),
      );
    });

    it('openExternalResourcesWarningDialog should open the warning dialog', () => {
      service.openExternalResourcesWarningDialog(() => undefined);

      expect(dialogServiceSpy.openDialog).toHaveBeenCalledWith(
        ExternalResourcesWarningDialogComponent,
        expect.anything(),
      );
    });
  });

  describe('import (FileReader flow)', () => {
    let snackbarSpy: jest.Mocked<MatSnackBar>;

    beforeEach(() => {
      snackbarSpy = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
    });

    // jsdom's FileReader dispatches its events on a real timer, so a single
    // macrotask tick is not enough to observe the callback. Poll until the
    // expected side effect happens instead of waiting a fixed amount of time.
    const waitFor = async (
      predicate: () => boolean,
      timeout = 1000,
    ): Promise<void> => {
      const step = 5;
      let waited = 0;
      while (!predicate() && waited < timeout) {
        await new Promise((resolve) => setTimeout(resolve, step));
        waited += step;
      }
    };

    it('reads the file and forwards its content to processDomainStoryImport', async () => {
      const processSpy = jest
        .spyOn(service, 'processDomainStoryImport')
        .mockReturnValue({} as DomainStory);
      const file = new File(['{"dst":{"businessObjects":[]}}'], 'story.egn');

      service.import(file, 'story.egn');
      await waitFor(() => processSpy.mock.calls.length > 0);

      expect(processSpy).toHaveBeenCalledWith(
        expect.any(String),
        'story.egn',
        false,
        true,
        false,
      );
    });

    it('reports failure when processing throws', async () => {
      jest.spyOn(service, 'processDomainStoryImport').mockImplementation(() => {
        throw new Error('boom');
      });
      const file = new File(['garbage'], 'story.dst');

      service.import(file, 'story.dst');
      await waitFor(() => snackbarSpy.open.mock.calls.length > 0);

      expect(snackbarSpy.open).toHaveBeenCalledWith(
        'Import failed',
        undefined,
        expect.anything(),
      );
    });
  });

  describe('exportToDomainStory legacy formats', () => {
    it('handles the flat legacy array format', () => {
      const legacy = [
        { type: 'actorPerson', id: 'a1' },
        { version: '0.0.1' },
        { info: 'my description' },
      ];

      const domainStory = service.exportToDomainStory(legacy, 'legacyTitle');

      expect(domainStory.businessObjects.length).toBe(1);
      expect(domainStory.businessObjects[0].id).toBe('a1');
      expect(domainStory.version).toBe('0.0.1');
      expect(domainStory.description).toBe('my description');
      expect(domainStory.title).toBe('legacyTitle');
    });

    it('handles a "dst" property that is an array', () => {
      const parsed = {
        dst: [
          { type: 'actorPerson', id: 'a1' },
          { info: 'array description' },
          { version: '1.0.0' },
        ],
      };

      const domainStory = service.exportToDomainStory(parsed, 'title');

      expect(domainStory.businessObjects.length).toBe(1);
      expect(domainStory.description).toBe('array description');
      expect(domainStory.version).toBe('1.0.0');
    });

    it('handles a "dst" property that is a stringified array', () => {
      const parsed = {
        dst: JSON.stringify([{ type: 'actorPerson', id: 'x' }]),
      };

      const domainStory = service.exportToDomainStory(parsed, 'title');

      expect(domainStory.businessObjects.length).toBe(1);
      expect(domainStory.businessObjects[0].id).toBe('x');
    });
  });
});
