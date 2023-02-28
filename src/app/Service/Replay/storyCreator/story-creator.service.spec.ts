import { TestBed } from '@angular/core/testing';

import { StoryCreatorService } from './story-creator.service';
import { ElementRegistryService } from '../../ElementRegistry/element-registry.service';
import { StoryStep } from '../../../Domain/Replay/storyStep';
import { ActivityCanvasObject } from '../../../Domain/Common/activityCanvasObject';
import { CanvasObject } from '../../../Domain/Common/canvasObject';
import { elementTypes } from '../../../Domain/Common/elementTypes';
import { testGroupCanvasObject } from '../../../Domain/Common/groupCanvasObject';
import {
  createReplayStepObjects,
  preBuildTestStory,
} from '../../../Utils/testHelpers.spec';

describe('StoryCreatorService', () => {
  let service: StoryCreatorService;
  let elementRegistryServiceSpy: jasmine.SpyObj<ElementRegistryService>;

  beforeEach(() => {
    const elementRegistryServiceMock = jasmine.createSpyObj(
      'ElementRegistryService',
      ['getActivitiesFromActors', 'getAllGroups']
    );
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ElementRegistryService,
          useValue: elementRegistryServiceMock,
        },
      ],
    });
    service = TestBed.inject(StoryCreatorService);
    elementRegistryServiceSpy = TestBed.inject(
      ElementRegistryService
    ) as jasmine.SpyObj<ElementRegistryService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('traceActivitiesAndCreateStory', () => {
    const story: StoryStep[] = [];

    beforeEach(() => {
      let objects: CanvasObject[] = [];
      const group = structuredClone(testGroupCanvasObject);

      let i = 1;
      while (i <= 3) {
        const previousStep = i > 1 ? story[i - 1] : undefined;
        const stepObjects = createReplayStepObjects(i, previousStep);

        objects
          ? (objects = objects.concat(stepObjects))
          : (objects = stepObjects);

        let storyObjects = stepObjects.map((o) => o.businessObject);
        if (previousStep) {
          storyObjects = storyObjects.concat(previousStep.objects);
        }
        story.push({
          objects: storyObjects,
          highlightedObjects: stepObjects.map((o) => o.id),
        });
        i++;
      }

      group.children.push(objects[2]);

      elementRegistryServiceSpy.getActivitiesFromActors.and.returnValue(
        (
          objects.filter(
            (o) => o.type === elementTypes.ACTIVITY
          ) as ActivityCanvasObject[]
        ).filter((o) => o.businessObject.number != null)
      );
      elementRegistryServiceSpy.getAllGroups.and.returnValue(group);
    });

    it('should trace activities and create Story', () => {
      const tracedStory = service.traceActivitiesAndCreateStory();

      for (let i = 0; i < tracedStory.length; i++) {
        const step = tracedStory[i];
        const refStep = story[i];

        const ids = step.highlightedObjects.sort();
        const refIds = refStep.highlightedObjects.sort();

        expect(ids).toEqual(refIds);
      }
    });
  });

  describe('isStoryConsecutivelyNumbered', () => {
    let story: StoryStep[];

    beforeEach(() => {
      story = preBuildTestStory(3);
    });

    it('should be true', () => {
      expect(service.getMissingSteps(story).length).toBe(0);
    });

    it(' should be false', () => {
      story[1].objects = [];
      expect(service.getMissingSteps(story).length > 0).toBeTrue();
    });
  });
});
