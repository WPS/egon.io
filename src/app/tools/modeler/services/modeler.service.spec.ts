import { TestBed } from '@angular/core/testing';

import { ModelerService } from 'src/app/tools/modeler/services/modeler.service';
import { InitializerService } from './initializer.service';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { IconDictionaryService } from '../../icon-set-config/services/icon-dictionary.service';
import { IconSetConfigurationService } from '../../icon-set-config/services/icon-set-configuration.service';
import { createTestCanvasObjects } from '../../../utils/testHelpers.spec';
import { BusinessObject } from '../../../domain/entities/businessObject';
import { INITIAL_ICON_SET_NAME } from '../../../domain/entities/constants';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { IconSet } from '../../../domain/entities/iconSet';
import BaseViewer from '../diagram-js/BaseViewer';

describe('ModelerService', () => {
  let service: ModelerService;

  let elementRegistrySpy: jasmine.SpyObj<ElementRegistryService>;
  let iconDictionarySpy: jasmine.SpyObj<IconDictionaryService>;
  let iconSetConfigurationSpy: jasmine.SpyObj<IconSetConfigurationService>;
  let initializerSpy: jasmine.SpyObj<InitializerService>;

  let testDomainStory: BusinessObject[] = createTestCanvasObjects(1).map(
    (e) => e.businessObject,
  );
  const actorsDict = new Dictionary();
  actorsDict.add('', ElementTypes.ACTOR);

  const workObjectsDict = new Dictionary();
  workObjectsDict.add('', ElementTypes.WORKOBJECT);

  let testConfiguration: IconSet = {
    name: INITIAL_ICON_SET_NAME,
    actors: actorsDict,
    workObjects: workObjectsDict,
  };

  beforeEach(() => {
    BaseViewer.prototype.get = undefined;
    const elementRegistryMock = jasmine.createSpyObj(
      ElementRegistryService.name,
      ['createObjectListForDSTDownload', 'clear', 'correctInitialize'],
    );
    const iconDictionaryMock = jasmine.createSpyObj(
      IconDictionaryService.name,
      ['setCustomConfiguration', 'createIconConfiguration'],
    );
    const iconSetConfigurationMock = jasmine.createSpyObj(
      IconSetConfigurationService.name,
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
          provide: IconSetConfigurationService,
          useValue: iconSetConfigurationMock,
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
      IconSetConfigurationService,
    ) as jasmine.SpyObj<IconSetConfigurationService>;
    initializerSpy = TestBed.inject(
      InitializerService,
    ) as jasmine.SpyObj<InitializerService>;
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
      service.restart(undefined, testDomainStory);

      expect(
        elementRegistrySpy.createObjectListForDSTDownload,
      ).toHaveBeenCalledTimes(0);
      expect(iconDictionarySpy.setCustomConfiguration).toHaveBeenCalledTimes(0);
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
      service.restart(testConfiguration);

      expect(
        elementRegistrySpy.createObjectListForDSTDownload,
      ).toHaveBeenCalled();
      expect(iconDictionarySpy.setCustomConfiguration).toHaveBeenCalledWith(
        testConfiguration,
      );
      expect(iconSetConfigurationSpy.loadConfiguration).toHaveBeenCalledWith(
        testConfiguration,
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
      expect(iconDictionarySpy.setCustomConfiguration).toHaveBeenCalledTimes(0);
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
});
