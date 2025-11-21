import { TestBed } from '@angular/core/testing';

import { ModelerService } from 'src/app/tools/modeler/services/modeler.service';
import { InitializerService } from './initializer.service';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { IconDictionaryService } from '../../icon-set-config/services/icon-dictionary.service';
import { IconSetImportExportService } from '../../icon-set-config/services/icon-set-import-export.service';
import { createTestCanvasObjects } from '../../../utils/testHelpers.spec';
import {
  BusinessObject,
  testBusinessObject,
} from '../../../domain/entities/businessObject';
import { INITIAL_ICON_SET_NAME } from '../../../domain/entities/constants';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { IconSet } from '../../../domain/entities/iconSet';
import BaseViewer from '../diagram-js/BaseViewer';
import { DirtyFlagService } from 'src/app/domain/services/dirty-flag.service';

describe('ModelerService', () => {
  let service: ModelerService;

  let elementRegistrySpy: jasmine.SpyObj<ElementRegistryService>;
  let iconDictionarySpy: jasmine.SpyObj<IconDictionaryService>;
  let iconSetConfigurationSpy: jasmine.SpyObj<IconSetImportExportService>;
  let initializerSpy: jasmine.SpyObj<InitializerService>;
  let dirtyFlagSpy: jasmine.SpyObj<DirtyFlagService>;

  const actorsDict = new Dictionary();
  actorsDict.add('', ElementTypes.ACTOR);

  const workObjectsDict = new Dictionary();
  workObjectsDict.add('', ElementTypes.WORKOBJECT);

  let testIconSet: IconSet = {
    name: INITIAL_ICON_SET_NAME,
    actors: actorsDict,
    workObjects: workObjectsDict,
  };

  const actor = structuredClone(testBusinessObject);
  actor.type = ElementTypes.ACTOR + 'Person';
  const workObject = structuredClone(testBusinessObject);
  workObject.type = ElementTypes.WORKOBJECT + 'Document';
  let storyToImport: BusinessObject[] = [actor, workObject];

  beforeEach(() => {
    BaseViewer.prototype.get = undefined;
    const elementRegistryMock = jasmine.createSpyObj(
      ElementRegistryService.name,
      ['createObjectListForDSTDownload', 'clear', 'correctInitialize'],
    );
    const iconDictionaryMock = jasmine.createSpyObj(
      IconDictionaryService.name,
      ['setIconSet', 'createIconConfiguration'],
    );
    const iconSetConfigurationMock = jasmine.createSpyObj(
      IconSetImportExportService.name,
      [
        'loadConfiguration',
        'getStoredIconSetConfiguration',
        'setStoredIconSetConfiguration',
      ],
    );
    const initializerMock = jasmine.createSpyObj(InitializerService.name, [
      'initializeDomainStoryModelerClasses',
      'initializeDomainStoryModelerEventHandlers',
      'propagateDomainStoryModelerClassesToServices',
      'initiateEventBusListeners',
    ]);
    const dirtyFlagServiceMock = jasmine.createSpyObj('DirtyFlagService', [
      'makeClean',
    ]);

    TestBed.configureTestingModule({
      providers: [
        {
          provide: InitializerService,
          useValue: initializerMock,
        },
        {
          provide: ElementRegistryService,
          useValue: elementRegistryMock,
        },
        {
          provide: IconDictionaryService,
          useValue: iconDictionaryMock,
        },
        {
          provide: IconSetImportExportService,
          useValue: iconSetConfigurationMock,
        },
        {
          provide: DirtyFlagService,
          useValue: dirtyFlagServiceMock,
        },
      ],
    });
    elementRegistrySpy = TestBed.inject(
      ElementRegistryService,
    ) as jasmine.SpyObj<ElementRegistryService>;

    elementRegistrySpy.createObjectListForDSTDownload.and.returnValue(
      createTestCanvasObjects(1),
    );

    iconDictionarySpy = TestBed.inject(
      IconDictionaryService,
    ) as jasmine.SpyObj<IconDictionaryService>;
    iconSetConfigurationSpy = TestBed.inject(
      IconSetImportExportService,
    ) as jasmine.SpyObj<IconSetImportExportService>;
    initializerSpy = TestBed.inject(
      InitializerService,
    ) as jasmine.SpyObj<InitializerService>;
    dirtyFlagSpy = TestBed.inject(
      DirtyFlagService,
    ) as jasmine.SpyObj<DirtyFlagService>;
    service = TestBed.inject(ModelerService);

    spyOn(document, 'getElementById').and.returnValue({
      onchange,
    } as HTMLElement);
    // @ts-ignore
    spyOn(BaseViewer, 'call').and.returnValue({
      get: () => {
        return undefined;
      },
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('postInit', () => {
    it('should call correct functions', () => {
      service.postInit();

      expect(
        initializerSpy.initializeDomainStoryModelerEventHandlers,
      ).toHaveBeenCalled();
      expect(
        initializerSpy.propagateDomainStoryModelerClassesToServices,
      ).toHaveBeenCalled();
      expect(initializerSpy.initiateEventBusListeners).toHaveBeenCalled();
    });
  });

  describe('restart', () => {
    it('with story and no configuration', () => {
      service.restart(undefined, storyToImport);

      expect(
        elementRegistrySpy.createObjectListForDSTDownload,
      ).toHaveBeenCalledTimes(0);
      expect(iconDictionarySpy.setIconSet).toHaveBeenCalledTimes(0);
      expect(iconSetConfigurationSpy.loadConfiguration).toHaveBeenCalledTimes(
        0,
      );
      expect(elementRegistrySpy.clear).toHaveBeenCalled();

      expect(
        initializerSpy.initializeDomainStoryModelerEventHandlers,
      ).toHaveBeenCalled();
      expect(
        initializerSpy.propagateDomainStoryModelerClassesToServices,
      ).toHaveBeenCalled();
      expect(initializerSpy.initiateEventBusListeners).toHaveBeenCalled();
    });

    it('with configuration and no story', () => {
      service.restart(testIconSet);

      expect(
        elementRegistrySpy.createObjectListForDSTDownload,
      ).toHaveBeenCalled();
      expect(iconDictionarySpy.setIconSet).toHaveBeenCalledWith(testIconSet);
      expect(iconSetConfigurationSpy.loadConfiguration).toHaveBeenCalledWith(
        testIconSet,
      );
      expect(elementRegistrySpy.clear).toHaveBeenCalled();

      expect(
        initializerSpy.initializeDomainStoryModelerEventHandlers,
      ).toHaveBeenCalled();
      expect(
        initializerSpy.propagateDomainStoryModelerClassesToServices,
      ).toHaveBeenCalled();
      expect(initializerSpy.initiateEventBusListeners).toHaveBeenCalled();
    });

    it('with no story and no configuration', () => {
      service.restart();

      expect(
        elementRegistrySpy.createObjectListForDSTDownload,
      ).toHaveBeenCalled();
      expect(iconDictionarySpy.setIconSet).toHaveBeenCalledTimes(0);
      expect(iconSetConfigurationSpy.loadConfiguration).toHaveBeenCalledTimes(
        0,
      );
      expect(elementRegistrySpy.clear).toHaveBeenCalled();

      expect(
        initializerSpy.initializeDomainStoryModelerEventHandlers,
      ).toHaveBeenCalled();
      expect(
        initializerSpy.propagateDomainStoryModelerClassesToServices,
      ).toHaveBeenCalled();
      expect(initializerSpy.initiateEventBusListeners).toHaveBeenCalled();
    });
  });

  // TODO: find a way to Mock this or initialize the ModelerService properly
  // describe('importStory', () => {
  //   beforeEach(() => {
  //     DomainStoryModeler.prototype.importBusinessObjects = function (story: any) { };
  //     DomainStoryModeler.prototype.fitStoryToScreen = function () { };
  //     elementRegistrySpy.correctInitialize.and.returnValue();
  //     dirtyFlagSpy.makeClean.and.returnValue();
  //   });

  //   it('should return imported story', () => {
  //     service.importStory(storyToImport, testIconSet);

  //     expect(service.restart).toHaveBeenCalled();
  //     expect(elementRegistrySpy.correctInitialize).toHaveBeenCalledTimes(1);
  //     expect(service.commandStackChanged).toHaveBeenCalledTimes(1);
  //     expect(service.startDebounce).toHaveBeenCalledTimes(1);
  //     expect(dirtyFlagSpy.makeClean).toHaveBeenCalledTimes(1);

  //     let result = service.getStory();
  //     expect(result).toEqual(storyToImport);
  //   });
  // });
});
