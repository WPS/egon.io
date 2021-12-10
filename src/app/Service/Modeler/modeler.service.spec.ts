import { TestBed } from '@angular/core/testing';

import { ModelerService } from 'src/app/Service/Modeler/modeler.service';
import { InitializerService } from './initializer.service';
import { ElementRegistryService } from '../ElementRegistry/element-registry.service';
import { IconDictionaryService } from '../DomainConfiguration/icon-dictionary.service';
import { DomainConfigurationService } from '../DomainConfiguration/domain-configuration.service';
import { DomainConfiguration } from '../../Domain/Common/domainConfiguration';
import { createTestCanvasObjects } from '../../Utils/testHelpers.spec';
import { BusinessObject } from '../../Domain/Common/businessObject';
import { INITIAL_DOMAIN_NAME } from '../../Domain/Common/constants';
import { elementTypes } from '../../Domain/Common/elementTypes';
import { Dictionary } from 'src/app/Domain/Common/dictionary/dictionary';
// @ts-ignore
import Modeler from 'bpmn-js/lib/Modeler';
import { SettingsService } from '../Settings/settings.service';
import { MockProvider } from 'ng-mocks';
import { StorageService } from '../BrowserStorage/storage.service';

describe('ModelerService', () => {
  let service: ModelerService;

  let elementRegistrySpy: jasmine.SpyObj<ElementRegistryService>;
  let iconDictionarySpy: jasmine.SpyObj<IconDictionaryService>;
  let domainConfigurationSpy: jasmine.SpyObj<DomainConfigurationService>;
  let initializerSpy: jasmine.SpyObj<InitializerService>;

  let testDomainStory: BusinessObject[] = createTestCanvasObjects(1).map(
    (e) => e.businessObject
  );
  const actorsDict = new Dictionary();
  actorsDict.add('', elementTypes.ACTOR);

  const workObjectsDict = new Dictionary();
  workObjectsDict.add('', elementTypes.WORKOBJECT);

  let testConfiguration: DomainConfiguration = {
    name: INITIAL_DOMAIN_NAME,
    actors: actorsDict,
    workObjects: workObjectsDict,
  };

  beforeEach(() => {
    const elementRegistryMock = jasmine.createSpyObj('ElementRegistryService', [
      'createObjectListForDSTDownload',
      'clear',
      'correctInitialize',
    ]);
    const iconDictionaryMock = jasmine.createSpyObj('IconDictionaryService', [
      'setCusomtConfiguration',
      'createIconConfiguration',
    ]);
    const domainConfigurationMock = jasmine.createSpyObj(
      'DomainConfigurationService',
      ['loadConfiguration']
    );
    const initializerMock = jasmine.createSpyObj('InitializerService', [
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
          provide: DomainConfigurationService,
          useValue: domainConfigurationMock,
        },
        MockProvider(StorageService),
      ],
    });
    elementRegistrySpy = TestBed.inject(
      ElementRegistryService
    ) as jasmine.SpyObj<ElementRegistryService>;

    elementRegistrySpy.createObjectListForDSTDownload.and.returnValue(
      createTestCanvasObjects(1)
    );

    iconDictionarySpy = TestBed.inject(
      IconDictionaryService
    ) as jasmine.SpyObj<IconDictionaryService>;
    domainConfigurationSpy = TestBed.inject(
      DomainConfigurationService
    ) as jasmine.SpyObj<DomainConfigurationService>;
    initializerSpy = TestBed.inject(
      InitializerService
    ) as jasmine.SpyObj<InitializerService>;
    service = TestBed.inject(ModelerService);

    spyOn(document, 'getElementById').and.returnValue({
      onchange,
    } as HTMLElement);
    spyOn(Modeler, 'call').and.returnValue({
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
        initializerSpy.initializeDomainStoryModelerClasses
      ).toHaveBeenCalled();
      expect(
        initializerSpy.initializeDomainStoryModelerEventHandlers
      ).toHaveBeenCalled();
      expect(
        initializerSpy.propagateDomainStoryModelerClassesToServices
      ).toHaveBeenCalled();
      expect(initializerSpy.initiateEventBusListeners).toHaveBeenCalled();
    });
  });

  describe('restart', () => {
    it('with story and no configuration', () => {
      service.restart(undefined, testDomainStory);

      expect(
        elementRegistrySpy.createObjectListForDSTDownload
      ).toHaveBeenCalledTimes(0);
      expect(iconDictionarySpy.setCusomtConfiguration).toHaveBeenCalledTimes(0);
      expect(domainConfigurationSpy.loadConfiguration).toHaveBeenCalledTimes(0);
      expect(elementRegistrySpy.clear).toHaveBeenCalled();

      expect(
        initializerSpy.initializeDomainStoryModelerClasses
      ).toHaveBeenCalled();
      expect(
        initializerSpy.initializeDomainStoryModelerEventHandlers
      ).toHaveBeenCalled();
      expect(
        initializerSpy.propagateDomainStoryModelerClassesToServices
      ).toHaveBeenCalled();
      expect(initializerSpy.initiateEventBusListeners).toHaveBeenCalled();
    });

    it('with configuration and no story', () => {
      service.restart(testConfiguration);

      expect(
        elementRegistrySpy.createObjectListForDSTDownload
      ).toHaveBeenCalled();
      expect(iconDictionarySpy.setCusomtConfiguration).toHaveBeenCalledWith(
        testConfiguration
      );
      expect(domainConfigurationSpy.loadConfiguration).toHaveBeenCalledWith(
        testConfiguration
      );
      expect(elementRegistrySpy.clear).toHaveBeenCalled();

      expect(
        initializerSpy.initializeDomainStoryModelerClasses
      ).toHaveBeenCalled();
      expect(
        initializerSpy.initializeDomainStoryModelerEventHandlers
      ).toHaveBeenCalled();
      expect(
        initializerSpy.propagateDomainStoryModelerClassesToServices
      ).toHaveBeenCalled();
      expect(initializerSpy.initiateEventBusListeners).toHaveBeenCalled();
    });

    it('with no story and no configuration', () => {
      service.restart();

      expect(
        elementRegistrySpy.createObjectListForDSTDownload
      ).toHaveBeenCalled();
      expect(iconDictionarySpy.setCusomtConfiguration).toHaveBeenCalledTimes(0);
      expect(domainConfigurationSpy.loadConfiguration).toHaveBeenCalledTimes(0);
      expect(elementRegistrySpy.clear).toHaveBeenCalled();

      expect(
        initializerSpy.initializeDomainStoryModelerClasses
      ).toHaveBeenCalled();
      expect(
        initializerSpy.initializeDomainStoryModelerEventHandlers
      ).toHaveBeenCalled();
      expect(
        initializerSpy.propagateDomainStoryModelerClassesToServices
      ).toHaveBeenCalled();
      expect(initializerSpy.initiateEventBusListeners).toHaveBeenCalled();
    });
  });
});
