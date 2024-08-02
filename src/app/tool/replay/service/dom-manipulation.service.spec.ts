import { TestBed } from '@angular/core/testing';

import { DomManipulationService } from 'src/app/tool/replay/service/dom-manipulation.service';
import { ElementRegistryService } from '../../../domain/service/element-registry.service';
import { preBuildTestStory } from '../../../utils/testHelpers.spec';

describe('DomManipulationService', () => {
  let domManipulationService: DomManipulationService;

  let elementRegistryServiceSpy: jasmine.SpyObj<ElementRegistryService>;

  beforeEach(() => {
    const elementRegistryServiceMock = jasmine.createSpyObj(
      'ElementRegsitryService',
      [
        'getAllCanvasObjects',
        'getAllGroups',
        'getAllActivities',
        'getAllConnections',
      ],
    );

    TestBed.configureTestingModule({
      providers: [
        {
          provide: ElementRegistryService,
          useValue: elementRegistryServiceMock,
        },
      ],
    });
    domManipulationService = TestBed.inject(DomManipulationService);
    elementRegistryServiceSpy = TestBed.inject(
      ElementRegistryService,
    ) as jasmine.SpyObj<ElementRegistryService>;
    spyOn(document, 'querySelector').and.returnValue(null);
  });

  it('should be created', () => {
    expect(domManipulationService).toBeTruthy();
  });

  beforeEach(() => {
    elementRegistryServiceSpy.getAllConnections.and.returnValue([]);
    elementRegistryServiceSpy.getAllActivities.and.returnValue([]);
    elementRegistryServiceSpy.getAllGroups.and.returnValue([]);
    elementRegistryServiceSpy.getAllCanvasObjects.and.returnValue([]);
  });

  it('showAll', () => {
    domManipulationService.showAll();

    expect(elementRegistryServiceSpy.getAllCanvasObjects).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllActivities).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllGroups).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllConnections).toHaveBeenCalled();
  });

  it('showSentence', () => {
    domManipulationService.showSentence(preBuildTestStory(2)[1]);

    expect(elementRegistryServiceSpy.getAllCanvasObjects).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllActivities).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllGroups).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllConnections).toHaveBeenCalled();
  });
});
