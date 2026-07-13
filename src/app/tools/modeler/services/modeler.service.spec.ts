import { TestBed } from '@angular/core/testing';

import { ModelerService } from 'src/app/tools/modeler/services/modeler.service';
import { InitializerService } from './initializer.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { IconDictionaryService } from '../../icon-set-config/services/icon-dictionary.service';
import { IconSetImportExportService } from '../../icon-set-config/services/icon-set-import-export.service';
import { createTestCanvasObjects } from '../../../utils/test-helpers';
import { MockProviders } from 'ng-mocks';
import {
  BusinessObject,
  testBusinessObject,
} from 'src/app/domain/entities/business-object';
import { INITIAL_ICON_SET_NAME } from '../../../domain/entities/constants';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { IconSet } from 'src/app/domain/entities/icon-set';
import BaseViewer from '../diagram-js/BaseViewer';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';

describe('ModelerService', () => {
  let service: ModelerService;

  let elementRegistrySpy: jest.Mocked<ElementRegistryService>;
  let iconDictionarySpy: jest.Mocked<IconDictionaryService>;
  let iconSetConfigurationSpy: jest.Mocked<IconSetImportExportService>;
  let initializerSpy: jest.Mocked<InitializerService>;
  let dirtyFlagSpy: jest.Mocked<DirtyFlagService>;

  const actorsDict = new Dictionary<string>();
  actorsDict.set(ElementTypes.ACTOR, '');

  const workObjectsDict = new Dictionary<string>();
  workObjectsDict.set(ElementTypes.WORKOBJECT, '');

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

    TestBed.configureTestingModule({
      providers: [
        MockProviders(
          InitializerService,
          ElementRegistryService,
          IconDictionaryService,
          IconSetImportExportService,
          DirtyFlagService,
        ),
      ],
    });
    elementRegistrySpy = TestBed.inject(
      ElementRegistryService,
    ) as jest.Mocked<ElementRegistryService>;

    elementRegistrySpy.createObjectListForDSTDownload.mockReturnValue(
      createTestCanvasObjects(1),
    );

    iconDictionarySpy = TestBed.inject(
      IconDictionaryService,
    ) as jest.Mocked<IconDictionaryService>;
    iconSetConfigurationSpy = TestBed.inject(
      IconSetImportExportService,
    ) as jest.Mocked<IconSetImportExportService>;
    initializerSpy = TestBed.inject(
      InitializerService,
    ) as jest.Mocked<InitializerService>;
    dirtyFlagSpy = TestBed.inject(
      DirtyFlagService,
    ) as jest.Mocked<DirtyFlagService>;
    service = TestBed.inject(ModelerService);

    jest.spyOn(document, 'getElementById').mockReturnValue({
      onchange,
    } as HTMLElement);
    // @ts-ignore
    jest.spyOn(BaseViewer, 'call').mockReturnValue({
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
      expect(iconSetConfigurationSpy.loadIconSet).toHaveBeenCalledTimes(0);
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
      expect(iconSetConfigurationSpy.loadIconSet).toHaveBeenCalledWith(
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
      expect(iconSetConfigurationSpy.loadIconSet).toHaveBeenCalledTimes(0);
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
  //     elementRegistrySpy.correctInitialize.mockReturnValue();
  //     dirtyFlagSpy.makeClean.mockReturnValue();
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
