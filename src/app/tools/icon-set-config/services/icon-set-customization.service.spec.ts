import { TestBed } from '@angular/core/testing';

import {
  IconSetChangedService,
  IconSetCustomizationService,
} from './icon-set-customization.service';
import { IconDictionaryService } from './icon-dictionary.service';
import { MockProvider, MockProviders, MockService } from 'ng-mocks';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { ImportDomainStoryService } from '../../import/services/import-domain-story.service';
import { Dictionary } from '../../../domain/entities/dictionary';
import {
  INITIAL_ICON_SET_NAME,
  SNACKBAR_DURATION,
  SNACKBAR_SUCCESS,
} from '../../../domain/entities/constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { IconSet } from 'src/app/domain/entities/icon-set';
import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';
import { AutosaveService } from 'src/app/tools/autosave/services/autosave.service';
import { signal } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

describe(IconSetCustomizationService.name, () => {
  let service: IconSetCustomizationService;

  let matSnackbarSpy: jest.Mocked<MatSnackBar>;
  let iconDictionarySpy: jest.Mocked<IconDictionaryService>;
  let iconSetImportExportServiceSpy: jest.Mocked<IconSetImportExportService>;

  beforeEach(() => {
    const elementRegistryServiceMock = MockService(
      ElementRegistryService,
    ) as jest.Mocked<ElementRegistryService>;

    const actorDefaultDictionary = new Dictionary<string>();
    actorDefaultDictionary.set('actorkey', 'actorSvg');
    const INITIAL_ICON_SET_CONFIGURATION = {
      name: INITIAL_ICON_SET_NAME,
      actors: actorDefaultDictionary,
      workObjects: new Dictionary<string>(),
    };

    TestBed.configureTestingModule({
      providers: [
        MockProviders(PropertiesService),
        MockProvider(MatSnackBar),
        MockProvider(AutosaveService, {
          importConfigChanged: signal(undefined),
        }),
        MockProvider(ImportDomainStoryService),
        MockProvider(IconSetChangedService, {
          iconConfigurationChanged(): Observable<IconSet> {
            return of(INITIAL_ICON_SET_CONFIGURATION);
          },
        }),
        MockProvider(IconDictionaryService),
        {
          provide: ElementRegistryService,
          useValue: elementRegistryServiceMock,
        },
        MockProvider(IconSetImportExportService),
      ],
    });
    matSnackbarSpy = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
    iconDictionarySpy = TestBed.inject(
      IconDictionaryService,
    ) as jest.Mocked<IconDictionaryService>;

    const fullDictionary = new Dictionary<string>();
    fullDictionary.set('Person', 'svg1');
    fullDictionary.set('Pet', 'svg2');
    fullDictionary.set('Document', 'svg3');
    fullDictionary.set('Call', 'svg4');
    fullDictionary.set('actorkey', 'actorSvg');

    iconDictionarySpy.getFullDictionary.mockReturnValue(fullDictionary);

    iconDictionarySpy.getIconsAssignedAs.mockReturnValue(
      new Dictionary<string>(),
    );
    elementRegistryServiceMock.getUsedIcons.mockReturnValue({
      actors: [],
      workObjects: [],
    });

    iconSetImportExportServiceSpy = TestBed.inject(
      IconSetImportExportService,
    ) as jest.Mocked<IconSetImportExportService>;

    service = TestBed.inject(IconSetCustomizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('import icon set', () => {
    const actors = new Dictionary<string>();
    const workObjects = new Dictionary<string>();

    actors.set('Person', 'svg1');
    actors.set('Pet', 'svg2');

    workObjects.set('Document', 'svg3');
    workObjects.set('Call', 'svg3');

    const customConfig: IconSet = {
      name: INITIAL_ICON_SET_NAME,
      actors: actors,
      workObjects: workObjects,
    };

    it('Should save icon set', () => {
      matSnackbarSpy.open.mockClear();
      iconDictionarySpy.getIconSource.mockClear();

      service.importConfiguration(customConfig);

      const selectedActors = service.selectedActorsSignal();
      const selectedWorkObjects = service.selectedWorkObjectsSignal();

      expect(selectedActors).toContain('Person');
      expect(selectedActors).toContain('Pet');
      expect(selectedWorkObjects).toContain('Document');
      expect(selectedWorkObjects).toContain('Call');

      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Person');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Pet');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Document');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Call');

      expect(matSnackbarSpy.open).toHaveBeenCalledWith(
        'Configuration imported successfully',
        undefined,
        {
          duration: SNACKBAR_DURATION,
          panelClass: SNACKBAR_SUCCESS,
        },
      );
      expect(
        iconSetImportExportServiceSpy.notifyIconSetSaved,
      ).toHaveBeenCalled();
    });

    // TODO: figure out a better way to test the saveIconSet() method than by spying on the snackbar
    // it('Should not save icon set', () => {
    //   matSnackbarSpy.open.mockClear();
    //   iconDictionarySpy.getIconSource.mockClear();
    //   service.importConfiguration(customConfig, false);

    //   const selectedActors = service.selectedActors$.value;
    //   const selectedWorkObjects = service.selectedWorkObjects$.value;

    //   expect(selectedActors).toContain('Person');
    //   expect(selectedActors).toContain('Pet');
    //   expect(selectedWorkObjects).toContain('Document');
    //   expect(selectedWorkObjects).toContain('Call');

    //   expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Person');
    //   expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Pet');
    //   expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Document');
    //   expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Call');
    //   expect(matSnackbarSpy.open).not.toHaveBeenCalled();
    // });
  });

  describe('addNewIcon', () => {
    it('should add Icon', () => {
      service.addNewCustomIcon('test');

      expect(service.getIconForName('test')).toBeTruthy();
    });
  });
});
