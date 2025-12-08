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
import { Observable, of } from 'rxjs';
import {
  INITIAL_ICON_SET_NAME,
  SNACKBAR_DURATION,
  SNACKBAR_SUCCESS,
} from '../../../domain/entities/constants';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { IconSet } from '../../../domain/entities/iconSet';

describe(IconSetCustomizationService.name, () => {
  let service: IconSetCustomizationService;

  let matSnackbarSpy: jasmine.SpyObj<MatSnackBar>;
  let iconDictionarySpy: jasmine.SpyObj<IconDictionaryService>;

  beforeEach(() => {
    const matSnackbarMock = jasmine.createSpyObj(MatSnackBar.name, ['open']);
    const iconDictionaryMock = jasmine.createSpyObj(
      IconDictionaryService.name,
      [
        'addCustomIcon',
        'getFullDictionary',
        'getActorsDictionary',
        'getWorkObjectsDictionary',
        'getIconSource',
        'addIconsToCss',
        'registerIconForType',
        'unregisterIconForType',
      ],
    );

    const elementRegistryServiceMock = jasmine.createSpyObj(
      ElementRegistryService.name,
      ['getUsedIcons'],
    );

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
        }),
        {
          provide: IconDictionaryService,
          useValue: iconDictionaryMock,
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

    iconDictionarySpy.getFullDictionary.and.returnValue(new Dictionary());
    iconDictionarySpy.getActorsDictionary.and.returnValue(new Dictionary());
    iconDictionarySpy.getWorkObjectsDictionary.and.returnValue(
      new Dictionary(),
    );
    elementRegistryServiceMock.getUsedIcons.and.returnValue({
      actors: [],
      workobjects: [],
    });

    service = TestBed.inject(IconSetCustomizationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('import icon set', () => {
    const actors = new Dictionary();
    const workobjects = new Dictionary();

    actors.add('svg1', 'Person');
    actors.add('svg2', 'Pet');

    workobjects.add('svg3', 'Document');
    workobjects.add('svg3', 'Call');

    const customConfig: IconSet = {
      name: INITIAL_ICON_SET_NAME,
      actors: actors,
      workObjects: workobjects,
    };

    it('Should save icon set', () => {
      matSnackbarSpy.open.calls.reset();
      iconDictionarySpy.getIconSource.calls.reset();

      service.importConfiguration(customConfig);

      const selectedActors = service.selectedActors$.value;
      const selectedWorkObjects = service.selectedWorkobjects$.value;

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
    });

    // TODO: figure out a better way to test the saveIconSet() method than by spying on the snackbar
    // it('Should not save icon set', () => {
    //   matSnackbarSpy.open.calls.reset();
    //   iconDictionarySpy.getIconSource.calls.reset();
    //   service.importConfiguration(customConfig, false);

    //   const selectedActors = service.selectedActors$.value;
    //   const selectedWorkObjects = service.selectedWorkobjects$.value;

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
      service.addNewIcon('test');

      expect(service.getIconForName('test')).toBeTruthy();
    });
  });
});
