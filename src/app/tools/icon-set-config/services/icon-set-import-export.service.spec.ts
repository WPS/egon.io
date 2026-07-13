import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';

import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';
import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { StorageService } from 'src/app/utils/services/storage.service';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import { IconSet } from 'src/app/domain/entities/icon-set';
import { ICON_SET_CONFIGURATION_KEY } from 'src/app/domain/entities/constants';
import * as downloadFileModule from 'src/app/utils/downloadFile';

describe('IconSetImportExportService', () => {
  let service: IconSetImportExportService;
  let iconDictionaryServiceSpy: jest.Mocked<IconDictionaryService>;
  let storageServiceSpy: jest.Mocked<StorageService>;
  let downloadFileSpy: jest.SpyInstance;

  beforeEach(() => {
    downloadFileSpy = jest
      .spyOn(downloadFileModule, 'downloadFile')
      .mockImplementation(() => undefined);

    TestBed.configureTestingModule({
      providers: [
        MockProvider(IconDictionaryService),
        MockProvider(StorageService),
      ],
    });
    iconDictionaryServiceSpy = TestBed.inject(
      IconDictionaryService,
    ) as jest.Mocked<IconDictionaryService>;
    storageServiceSpy = TestBed.inject(
      StorageService,
    ) as jest.Mocked<StorageService>;
    service = TestBed.inject(IconSetImportExportService);
  });

  afterEach(() => downloadFileSpy.mockRestore());

  function stubAssignedIcons(withContent: boolean): void {
    iconDictionaryServiceSpy.getIconsAssignedAs.mockImplementation((type) => {
      const dict = new Dictionary<string>();
      if (withContent) {
        if (type === ElementTypes.ACTOR) {
          dict.set(ElementTypes.ACTOR + 'Person', '<svg>person</svg>');
        } else {
          dict.set(ElementTypes.WORKOBJECT + 'Document', '<svg>doc</svg>');
        }
      }
      return dict;
    });
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('icon set name', () => {
    it('should get and set the icon set name', () => {
      service.setIconSetName('My Icons');
      expect(service.getIconSetName()).toBe('My Icons');
      expect(service.iconSetName()).toBe('My Icons');
    });
  });

  describe('getCurrentConfigurationForExport', () => {
    it('should build a record with stripped icon names when actors and work objects exist', () => {
      stubAssignedIcons(true);

      const config = service.getCurrentConfigurationForExport();

      expect(config).toEqual({
        name: expect.any(String),
        actors: { Person: '<svg>person</svg>' },
        workObjects: { Document: '<svg>doc</svg>' },
      });
    });

    it('should return undefined when there are no assigned icons', () => {
      stubAssignedIcons(false);

      expect(service.getCurrentConfigurationForExport()).toBeUndefined();
    });
  });

  describe('exportConfiguration', () => {
    it('should download an .iconset file when a configuration exists', () => {
      stubAssignedIcons(true);
      service.setIconSetName('my-set');

      service.exportConfiguration();

      expect(downloadFileSpy).toHaveBeenCalledWith(
        expect.any(String),
        'data:text/plain;charset=utf-8,',
        'my-set',
        '.iconset',
      );
    });

    it('should not download anything when there is no configuration', () => {
      stubAssignedIcons(false);

      service.exportConfiguration();

      expect(downloadFileSpy).not.toHaveBeenCalled();
    });
  });

  describe('loadIconSet', () => {
    const iconSet: IconSet = {
      name: 'loaded',
      actors: new Dictionary<string>(),
      workObjects: new Dictionary<string>(),
    };

    it('should update the registries and the name by default', () => {
      service.loadIconSet(iconSet);

      expect(
        iconDictionaryServiceSpy.updateIconRegistries,
      ).toHaveBeenCalledWith(iconSet);
      expect(service.getIconSetName()).toBe('loaded');
    });

    it('should keep the current name when told not to update it', () => {
      service.setIconSetName('kept');

      service.loadIconSet(iconSet, false);

      expect(service.getIconSetName()).toBe('kept');
    });
  });

  describe('createIconSetConfiguration', () => {
    it('should return an empty configuration for undefined input', () => {
      const config = service.createIconSetConfiguration(undefined as any);

      expect(config.name).toBe('');
      expect(config.actors.isEmpty()).toBe(true);
      expect(config.workObjects.isEmpty()).toBe(true);
    });

    it('should build dictionaries from a file configuration', () => {
      const config = service.createIconSetConfiguration({
        name: 'from-file',
        actors: { Person: 'a' },
        workObjects: { Document: 'b' },
      });

      expect(config.name).toBe('from-file');
      expect(config.actors.get('Person')).toBe('a');
      expect(config.workObjects.get('Document')).toBe('b');
    });
  });

  describe('stored configuration', () => {
    it('should return undefined when nothing is stored', () => {
      storageServiceSpy.get.mockReturnValue(null as any);

      expect(service.getStoredIconSetConfiguration()).toBeUndefined();
    });

    it('should return a valid stored configuration', () => {
      storageServiceSpy.get.mockReturnValue(
        JSON.stringify({
          name: 'stored',
          actors: { A: 'a', B: 'b' },
          workObjects: { C: 'c', D: 'd' },
        }),
      );

      const config = service.getStoredIconSetConfiguration();

      expect(config?.name).toBe('stored');
    });

    it('should reject an invalid stored configuration', () => {
      storageServiceSpy.get.mockReturnValue(
        JSON.stringify({
          name: 'invalid',
          actors: { A: 'a' },
          workObjects: { C: 'c' },
        }),
      );

      expect(service.getStoredIconSetConfiguration()).toBeUndefined();
    });

    it('should serialize the configuration when storing it', () => {
      const config: IconSet = {
        name: 'to-store',
        actors: Dictionary.fromRecord({ A: 'a' }),
        workObjects: Dictionary.fromRecord({ C: 'c' }),
      };

      service.setStoredIconSetConfiguration(config);

      expect(storageServiceSpy.set).toHaveBeenCalledWith(
        ICON_SET_CONFIGURATION_KEY,
        expect.any(String),
      );
    });
  });

  describe('notifyIconSetSaved', () => {
    it('should emit on the icon set changed observable', () => {
      const handler = jest.fn();
      service.iconSetChanged$.subscribe(handler);

      service.notifyIconSetSaved();

      expect(handler).toHaveBeenCalled();
    });
  });
});
