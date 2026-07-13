import { TestBed } from '@angular/core/testing';

import { DomManipulationService } from 'src/app/tools/replay/services/dom-manipulation.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { preBuildTestStory } from '../../../utils/test-helpers';
import { MockProvider } from 'ng-mocks';

describe('DomManipulationService', () => {
  let domManipulationService: DomManipulationService;

  let elementRegistryServiceSpy: jest.Mocked<ElementRegistryService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockProvider(ElementRegistryService)],
    });
    domManipulationService = TestBed.inject(DomManipulationService);
    elementRegistryServiceSpy = TestBed.inject(
      ElementRegistryService,
    ) as jest.Mocked<ElementRegistryService>;
    jest.spyOn(document, 'querySelector').mockReturnValue(null);
  });

  it('should be created', () => {
    expect(domManipulationService).toBeTruthy();
  });

  beforeEach(() => {
    elementRegistryServiceSpy.getAllConnections.mockReturnValue([]);
    elementRegistryServiceSpy.getAllActivities.mockReturnValue([]);
    elementRegistryServiceSpy.getAllGroups.mockReturnValue([]);
    elementRegistryServiceSpy.getAllCanvasObjects.mockReturnValue([]);
    elementRegistryServiceSpy.getAllBusinessObjectsFromCanvasNotIn.mockReturnValue(
      [],
    );
  });

  it('showAll', () => {
    domManipulationService.showAll();

    expect(elementRegistryServiceSpy.getAllCanvasObjects).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllActivities).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllGroups).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllConnections).toHaveBeenCalled();
  });

  it('showSentence', () => {
    domManipulationService.showSentence(
      preBuildTestStory(2).storyWithGroups[1],
    );

    expect(
      elementRegistryServiceSpy.getAllBusinessObjectsFromCanvasNotIn,
    ).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllActivities).toHaveBeenCalled();
    expect(elementRegistryServiceSpy.getAllConnections).toHaveBeenCalled();
  });
});
