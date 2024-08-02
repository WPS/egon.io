import { TestBed } from '@angular/core/testing';

import { IconSetCustomizationService } from './icon-set-customization.service';
import { IconDictionaryService } from './icon-dictionary.service';
import { MockProvider, MockProviders } from 'ng-mocks';
import { TitleService } from '../../tool/header/service/title.service';
import { IconSetConfigurationService } from './icon-set-configuration.service';
import { ImportDomainStoryService } from '../../tool/import/service/import-domain-story.service';
import {
  IconSetConfiguration,
  testCustomIconSetConfiguration,
} from '../../Domain/Icon-Set-Configuration/iconSetConfiguration';
import { Dictionary } from '../../Domain/Common/dictionary/dictionary';
import { Observable, of } from 'rxjs';
import {
  INITIAL_ICON_SET_NAME,
  SNACKBAR_DURATION,
  SNACKBAR_SUCCESS,
} from '../../Domain/Common/constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from '../BrowserStorage/storage.service';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';

describe(IconSetCustomizationService.name, () => {
  let service: IconSetCustomizationService;

  let matSnackbarSpy: jasmine.SpyObj<MatSnackBar>;
  let iconDictionarySpy: jasmine.SpyObj<IconDictionaryService>;
  let configurationServiceSpy: jasmine.SpyObj<IconSetConfigurationService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const matSnackbarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    const iconDictionaryMock = jasmine.createSpyObj('IconDictionaryService', [
      'getAllIconDictionary',
      'getFullDictionary',
      'getActorsDictionary',
      'getWorkObjectsDictionary',
      'getIconSource',
      'addIconsToCss',
      'registerIconForType',
      'unregisterIconForType',
    ]);
    const configurationServiceMock = jasmine.createSpyObj(
      'ConfigurationService',
      [
        'createMinimalConfigurationWithDefaultIcons',
        'getCurrentConfigurationNamesWithoutPrefix',
      ],
    );
    const storageServiceMock = jasmine.createSpyObj(StorageService.name, [
      'setStoredIconSetConfiguration',
      'getStoredIconSetConfiguration',
    ]);
    const elementRegistryServiceMock = jasmine.createSpyObj(
      'ElementRegistryService',
      ['getUsedIcons'],
    );

    TestBed.configureTestingModule({
      providers: [
        MockProviders(TitleService),
        {
          provide: StorageService,
          useValue: storageServiceMock,
        },
        {
          provide: MatSnackBar,
          useValue: matSnackbarMock,
        },
        MockProvider(ImportDomainStoryService, {
          get importedConfigurationEvent(): Observable<IconSetConfiguration> {
            const iconSetConfiguration: IconSetConfiguration = {
              name: INITIAL_ICON_SET_NAME,
              actors: new Dictionary(),
              workObjects: new Dictionary(),
            };
            return of(iconSetConfiguration);
          },
        }),
        {
          provide: IconDictionaryService,
          useValue: iconDictionaryMock,
        },
        {
          provide: IconSetConfigurationService,
          useValue: configurationServiceMock,
        },
        {
          provide: ElementRegistryService,
          useValue: elementRegistryServiceMock,
        },
      ],
    });
    matSnackbarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    iconDictionarySpy = TestBed.inject(
      IconDictionaryService,
    ) as jasmine.SpyObj<IconDictionaryService>;
    configurationServiceSpy = TestBed.inject(
      IconSetConfigurationService,
    ) as jasmine.SpyObj<IconSetConfigurationService>;
    storageServiceSpy = TestBed.inject(
      StorageService,
    ) as jasmine.SpyObj<StorageService>;

    iconDictionarySpy.getAllIconDictionary.and.returnValue(new Dictionary());
    iconDictionarySpy.getFullDictionary.and.returnValue(new Dictionary());
    iconDictionarySpy.getActorsDictionary.and.returnValue(new Dictionary());
    iconDictionarySpy.getWorkObjectsDictionary.and.returnValue(
      new Dictionary(),
    );
    configurationServiceSpy.getCurrentConfigurationNamesWithoutPrefix.and.returnValue(
      structuredClone(testCustomIconSetConfiguration),
    );
    configurationServiceSpy.createMinimalConfigurationWithDefaultIcons.and.returnValue(
      {
        name: INITIAL_ICON_SET_NAME,
        actors: new Dictionary(),
        workObjects: new Dictionary(),
      },
    );

    service = TestBed.inject(IconSetCustomizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('importConfiguration and SaveDomain', () => {
    const actors = new Dictionary();
    const workobjects = new Dictionary();

    actors.add('', 'Person');
    actors.add('TestValue', 'TestActor');

    workobjects.add('', 'Document');
    workobjects.add('TestValue2 - The Testening', 'TestWorkObject');

    const customConfig: IconSetConfiguration = {
      name: INITIAL_ICON_SET_NAME,
      actors: actors,
      workObjects: workobjects,
    };

    it('Should save Domain', () => {
      matSnackbarSpy.open.calls.reset();
      iconDictionarySpy.getIconSource.calls.reset();

      service.importConfiguration(customConfig);

      const selectedActors = service.selectedActors$.value;
      const selectedWorkObjects = service.selectedWorkobjects$.value;

      expect(selectedActors).toContain('Person');
      expect(selectedActors).toContain('TestActor');
      expect(selectedWorkObjects).toContain('Document');
      expect(selectedWorkObjects).toContain('TestWorkObject');

      expect(
        storageServiceSpy.setStoredIconSetConfiguration,
      ).toHaveBeenCalled();

      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Person');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('TestActor');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Document');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith(
        'TestWorkObject',
      );

      expect(matSnackbarSpy.open).toHaveBeenCalledWith(
        'Configuration imported successfully',
        undefined,
        {
          duration: SNACKBAR_DURATION,
          panelClass: SNACKBAR_SUCCESS,
        },
      );
    });

    it('Should not save Domain', () => {
      matSnackbarSpy.open.calls.reset();
      iconDictionarySpy.getIconSource.calls.reset();
      service.importConfiguration(customConfig, false);

      const selectedActors = service.selectedActors$.value;
      const selectedWorkObjects = service.selectedWorkobjects$.value;

      expect(selectedActors).toContain('Person');
      expect(selectedActors).toContain('TestActor');
      expect(selectedWorkObjects).toContain('Document');
      expect(selectedWorkObjects).toContain('TestWorkObject');

      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Person');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('TestActor');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Document');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith(
        'TestWorkObject',
      );
      expect(matSnackbarSpy.open).not.toHaveBeenCalled();
    });
  });

  describe('reset Domain', () => {
    it('should call correct function', () => {
      service.resetIconSet();

      expect(
        configurationServiceSpy.createMinimalConfigurationWithDefaultIcons,
      ).toHaveBeenCalled();
    });
  });

  describe('addNewIcon', () => {
    it('should add Icon', () => {
      service.addNewIcon('test');

      expect(iconDictionarySpy.getIconSource).toHaveBeenCalled();
      expect(service.getIconForName('test')).toBeTruthy();
    });
  });
});
