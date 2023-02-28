import { TestBed } from '@angular/core/testing';

import { DomainCustomizationService } from './domain-customization.service';
import { IconDictionaryService } from './icon-dictionary.service';
import { MockProvider, MockProviders } from 'ng-mocks';
import { TitleService } from '../Title/title.service';
import { DomainConfigurationService } from './domain-configuration.service';
import { ImportDomainStoryService } from '../Import/import-domain-story.service';
import {
  DomainConfiguration,
  testCustomDomainConfiguration,
} from '../../Domain/Common/domainConfiguration';
import { Dictionary } from '../../Domain/Common/dictionary/dictionary';
import { Observable, of } from 'rxjs';
import {
  INITIAL_DOMAIN_NAME,
  SNACKBAR_DURATION,
  SNACKBAR_SUCCESS,
} from '../../Domain/Common/constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StorageService } from '../BrowserStorage/storage.service';

describe('DomainCustomizationService', () => {
  let service: DomainCustomizationService;

  let matSnackbarSpy: jasmine.SpyObj<MatSnackBar>;
  let iconDictionarySpy: jasmine.SpyObj<IconDictionaryService>;
  let configurationServiceSpy: jasmine.SpyObj<DomainConfigurationService>;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;

  beforeEach(() => {
    const matSnackbarMock = jasmine.createSpyObj('MatSnackBar', ['open']);
    const iconDictionaryMock = jasmine.createSpyObj('IconDictionarySService', [
      'getAllIconDictionary',
      'getIconSource',
      'addIconsToCss',
    ]);
    const configurationServiceMock = jasmine.createSpyObj(
      'ConfigurationService',
      [
        'createMinimalConfigurationWithDefaultIcons',
        'getCurrentConfigurationNamesWithoutPrefix',
      ]
    );
    const storageServiceMock = jasmine.createSpyObj('StorageService', [
      'setStoredDomainConfiguration',
      'getStoredDomainConfiguration',
    ]);

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
          get importedConfigurationEvent(): Observable<DomainConfiguration> {
            const domainConfiguration: DomainConfiguration = {
              name: INITIAL_DOMAIN_NAME,
              actors: new Dictionary(),
              workObjects: new Dictionary(),
            };
            return of(domainConfiguration);
          },
        }),
        {
          provide: IconDictionaryService,
          useValue: iconDictionaryMock,
        },
        {
          provide: DomainConfigurationService,
          useValue: configurationServiceMock,
        },
      ],
    });
    matSnackbarSpy = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    iconDictionarySpy = TestBed.inject(
      IconDictionaryService
    ) as jasmine.SpyObj<IconDictionaryService>;
    configurationServiceSpy = TestBed.inject(
      DomainConfigurationService
    ) as jasmine.SpyObj<DomainConfigurationService>;
    storageServiceSpy = TestBed.inject(
      StorageService
    ) as jasmine.SpyObj<StorageService>;

    iconDictionarySpy.getAllIconDictionary.and.returnValue(new Dictionary());
    configurationServiceSpy.getCurrentConfigurationNamesWithoutPrefix.and.returnValue(
      structuredClone(testCustomDomainConfiguration)
    );
    configurationServiceSpy.createMinimalConfigurationWithDefaultIcons.and.returnValue(
      {
        name: INITIAL_DOMAIN_NAME,
        actors: new Dictionary(),
        workObjects: new Dictionary(),
      }
    );

    service = TestBed.inject(DomainCustomizationService);
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

    const customConfig: DomainConfiguration = {
      name: INITIAL_DOMAIN_NAME,
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

      expect(storageServiceSpy.setStoredDomainConfiguration).toHaveBeenCalled();

      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Person');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('TestActor');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith('Document');
      expect(iconDictionarySpy.getIconSource).toHaveBeenCalledWith(
        'TestWorkObject'
      );

      expect(matSnackbarSpy.open).toHaveBeenCalledWith(
        'Configuration saved sucessfully',
        undefined,
        {
          duration: SNACKBAR_DURATION,
          panelClass: SNACKBAR_SUCCESS,
        }
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
        'TestWorkObject'
      );
      expect(matSnackbarSpy.open).not.toHaveBeenCalled();
    });
  });

  describe('reset Domain', () => {
    it('should call correct function', () => {
      service.resetDomain();

      expect(
        configurationServiceSpy.createMinimalConfigurationWithDefaultIcons
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
