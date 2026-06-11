import { TestBed } from '@angular/core/testing';

import {
  IconSetChangedService,
  IconSetCustomizationService,
} from './icon-set-customization.service';
import { IconDictionaryService } from './icon-dictionary.service';
import { MockProvider, MockProviders } from 'ng-mocks';
import { TitleService } from '../../title/services/title.service';
import { ImportDomainStoryService } from '../../import/services/import-domain-story.service';
import { Dictionary } from '../../../domain/entities/dictionary';
import {
  INITIAL_ICON_SET_NAME,
  SNACKBAR_DURATION,
  SNACKBAR_SUCCESS,
} from '../../../domain/entities/constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { IconSet } from '../../../domain/entities/iconSet';
import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';
import { AutosaveService } from 'src/app/tools/autosave/services/autosave.service';
import { Subject } from 'rxjs';
import { signal } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';

describe(IconSetCustomizationService.name, () => {
  let service: IconSetCustomizationService;

  let matSnackbarSpy: jasmine.SpyObj<MatSnackBar>;
  let iconDictionarySpy: jasmine.SpyObj<IconDictionaryService>;
  let iconSetImportExportServiceSpy: jasmine.SpyObj<IconSetImportExportService>;

  beforeEach(() => {
    const matSnackbarMock = jasmine.createSpyObj(MatSnackBar.name, ['open']);
    const iconDictionaryMock = jasmine.createSpyObj(
      IconDictionaryService.name,
      [
        'addCustomIcon',
        'getFullDictionary',
        'getIconsAssignedAs',
        'getIconSource',
        'addIconsToCss',
        'registerIconForType',
        'unregisterIconForType',
      ],
    );
    const autosaveServiceMock = jasmine.createSpyObj(AutosaveService.name, [], {
      importConfigChanged: signal(undefined),
    });
    const iconSetImportExportServiceMock = jasmine.createSpyObj(
      IconSetImportExportService.name,
      [
        'getStoredIconSetConfiguration',
        'createIconSetConfiguration',
        'getIconSetName',
        'setIconSetName',
        'setStoredIconSetConfiguration',
        'notifyIconSetSaved',
      ],
      {
        iconSetChangedSubject: new Subject<void>(),
      },
    );

    const elementRegistryServiceMock = jasmine.createSpyObj(
      ElementRegistryService.name,
      ['getUsedIcons'],
    );

    const actorDefaultDictionary = new Dictionary<string>();
    actorDefaultDictionary.set('actorkey', 'actorSvg');
    const INITIAL_ICON_SET_CONFIGURATION = {
      name: INITIAL_ICON_SET_NAME,
      actors: actorDefaultDictionary,
      workObjects: new Dictionary<string>(),
    };

    TestBed.configureTestingModule({
      providers: [
        MockProviders(TitleService),
        {
          provide: MatSnackBar,
          useValue: matSnackbarMock,
        },
        {
          provide: AutosaveService,
          useValue: autosaveServiceMock,
        },
        MockProvider(ImportDomainStoryService),
        MockProvider(IconSetChangedService, {
          iconConfigurationChanged(): Observable<IconSet> {
            return of(INITIAL_ICON_SET_CONFIGURATION);
          },
        }),
        {
          provide: IconDictionaryService,
          useValue: iconDictionaryMock,
        },

        {
          provide: ElementRegistryService,
          useValue: elementRegistryServiceMock,
        },
        {
          provide: IconSetImportExportService,
          useValue: iconSetImportExportServiceMock,
        },
      ],
    });
    matSnackbarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    iconDictionarySpy = TestBed.inject(
      IconDictionaryService,
    ) as jasmine.SpyObj<IconDictionaryService>;

    iconDictionarySpy.getFullDictionary.and.returnValue(
      new Dictionary<string>(),
    );
    iconDictionarySpy.getIconsAssignedAs.and.returnValue(
      new Dictionary<string>(),
    );
    elementRegistryServiceMock.getUsedIcons.and.returnValue({
      actors: [],
      workObjects: [],
    });

    iconSetImportExportServiceSpy = TestBed.inject(
      IconSetImportExportService,
    ) as jasmine.SpyObj<IconSetImportExportService>;

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
      matSnackbarSpy.open.calls.reset();
      iconDictionarySpy.getIconSource.calls.reset();

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
    //   matSnackbarSpy.open.calls.reset();
    //   iconDictionarySpy.getIconSource.calls.reset();
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
