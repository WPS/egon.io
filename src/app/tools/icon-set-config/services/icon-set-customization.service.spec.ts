import { TestBed } from '@angular/core/testing';

import {
  IconSetChangedService,
  IconSetCustomizationService,
} from './icon-set-customization.service';
import { IconDictionaryService } from './icon-dictionary.service';
import { MockProvider, MockProviders } from 'ng-mocks';
import { TitleService } from '../../title/services/title.service';
import { IconSetConfigurationService } from './icon-set-configuration.service';
import { ImportDomainStoryService } from '../../import/services/import-domain-story.service';
import { Dictionary } from '../../../domain/entities/dictionary';
import { Observable, of } from 'rxjs';
import {
  INITIAL_ICON_SET_NAME,
  SNACKBAR_DURATION,
  SNACKBAR_SUCCESS,
} from '../../../domain/entities/constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { IconSet } from '../../../domain/entities/iconSet';
import { CustomIconSetConfiguration } from '../../../domain/entities/custom-icon-set-configuration';

describe(IconSetCustomizationService.name, () => {
  let service: IconSetCustomizationService;

  let matSnackbarSpy: jasmine.SpyObj<MatSnackBar>;
  let iconDictionarySpy: jasmine.SpyObj<IconDictionaryService>;
  let configurationServiceSpy: jasmine.SpyObj<IconSetConfigurationService>;

  beforeEach(() => {
    const matSnackbarMock = jasmine.createSpyObj(MatSnackBar.name, ['open']);
    const iconDictionaryMock = jasmine.createSpyObj(
      IconDictionaryService.name,
      [
        'getAllIconDictionary',
        'getFullDictionary',
        'getActorsDictionary',
        'getWorkObjectsDictionary',
        'getIconSource',
        'addIconsToCss',
        'registerIconForType',
        'unregisterIconForType',
      ],
    );
    const configurationServiceMock = jasmine.createSpyObj(
      IconSetConfigurationService.name,
      [
        'createMinimalConfigurationWithDefaultIcons',
        'getCurrentConfigurationNamesWithoutPrefix',
        'setStoredIconSetConfiguration',
        'getStoredIconSetConfiguration',
      ],
    );

    const elementRegistryServiceMock = jasmine.createSpyObj(
      ElementRegistryService.name,
      ['getUsedIcons'],
    );

    const testCustomIconSetConfiguration: CustomIconSetConfiguration = {
      name: INITIAL_ICON_SET_NAME,
      actors: ['Person'],
      workObjects: ['Document'],
    };

    const actorDefaultDictionary = new Dictionary();
    actorDefaultDictionary.add('actorSvg', 'actorkey');
    const INITIAL_ICON_SET_CONFIGURATION = {
      name: INITIAL_ICON_SET_NAME,
      actors: actorDefaultDictionary,
      workObjects: new Dictionary(),
    };

    TestBed.configureTestingModule({
      providers: [
        MockProviders(TitleService),
        {
          provide: MatSnackBar,
          useValue: matSnackbarMock,
        },
        MockProvider(ImportDomainStoryService),
        MockProvider(IconSetChangedService, {
          iconConfigrationChanged(): Observable<IconSet> {
            const iconSetConfiguration: IconSet =
              INITIAL_ICON_SET_CONFIGURATION;
            return of(iconSetConfiguration);
          },
          getConfiguration(): IconSet {
            return INITIAL_ICON_SET_CONFIGURATION;
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

    iconDictionarySpy.getAllIconDictionary.and.returnValue(new Dictionary());
    iconDictionarySpy.getFullDictionary.and.returnValue(new Dictionary());
    iconDictionarySpy.getActorsDictionary.and.returnValue(new Dictionary());
    iconDictionarySpy.getWorkObjectsDictionary.and.returnValue(
      new Dictionary(),
    );
    elementRegistryServiceMock.getUsedIcons.and.returnValue({
      actors: [],
      workobjects: [],
    });
    configurationServiceSpy.getCurrentConfigurationNamesWithoutPrefix.and.returnValue(
      structuredClone(testCustomIconSetConfiguration),
    );
    configurationServiceSpy.createMinimalConfigurationWithDefaultIcons.and.returnValue(
      INITIAL_ICON_SET_CONFIGURATION,
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

    const customConfig: IconSet = {
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
        configurationServiceSpy.setStoredIconSetConfiguration,
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
