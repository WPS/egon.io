import { TestBed } from '@angular/core/testing';

import { StoryCreatorService } from './story-creator.service';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { StorySentence } from '../domain/storySentence';
import { ActivityCanvasObject } from '../../../domain/entities/common/activityCanvasObject';
import { CanvasObject } from '../../../domain/entities/common/canvasObject';
import { ElementTypes } from '../../../domain/entities/common/elementTypes';
import { testGroupCanvasObject } from '../../../domain/entities/common/groupCanvasObject';
import {
  createReplaySentenceObjects,
  preBuildTestStory,
} from '../../../utils/testHelpers.spec';

describe('StoryCreatorService', () => {
  let service: StoryCreatorService;
  let elementRegistryServiceSpy: jasmine.SpyObj<ElementRegistryService>;

  beforeEach(() => {
    const elementRegistryServiceMock = jasmine.createSpyObj(
      'ElementRegistryService',
      ['getActivitiesFromActors', 'getAllGroups'],
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
      ElementRegistryService,
    ) as jasmine.SpyObj<ElementRegistryService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('traceActivitiesAndCreateStory', () => {
    const story: StorySentence[] = [];

    beforeEach(() => {
      let objects: CanvasObject[] = [];
      const group = structuredClone(testGroupCanvasObject);

      let i = 1;
      while (i <= 3) {
        const previousSentence = i > 1 ? story[i - 1] : undefined;
        const sentenceObjects = createReplaySentenceObjects(
          i,
          previousSentence,
        );

        objects
          ? (objects = objects.concat(sentenceObjects))
          : (objects = sentenceObjects);

        let storyObjects = sentenceObjects.map((o) => o.businessObject);
        if (previousSentence) {
          storyObjects = storyObjects.concat(previousSentence.objects);
        }
        story.push({
          objects: storyObjects,
          highlightedObjects: sentenceObjects.map((o) => o.id),
        });
        i++;
      }

      group.children!.push(objects[2]);

      elementRegistryServiceSpy.getActivitiesFromActors.and.returnValue(
        (
          objects.filter(
            (o) => o.type === ElementTypes.ACTIVITY,
          ) as ActivityCanvasObject[]
        ).filter((o) => o.businessObject.number != null),
      );
      // No Idea why this works!
      elementRegistryServiceSpy.getAllGroups.and.returnValue(group as any);
    });

    it('should trace activities and create Story', () => {
      const tracedStory = service.traceActivitiesAndCreateStory();

      for (let i = 0; i < tracedStory.length; i++) {
        const sentence = tracedStory[i];
        const refSentence = story[i];

        const ids = sentence.highlightedObjects.sort();
        const refIds = refSentence.highlightedObjects.sort();

        expect(ids).toEqual(refIds);
      }
    });
  });

  describe('isStoryConsecutivelyNumbered', () => {
    let story: StorySentence[];

    beforeEach(() => {
      story = preBuildTestStory(7);
    });

    it('should be missing sequence number 2, 4 und 6 in sorting order', () => {
      story[1].objects = [];
      story[3].objects = [];
      story[5].objects = [];

      const missingSequenceNumbers = service.getMissingSentences(story);

      expect(missingSequenceNumbers.length).toBe(3);
      expect(missingSequenceNumbers[0]).toBe(2);
      expect(missingSequenceNumbers[1]).toBe(4);
      expect(missingSequenceNumbers[2]).toBe(6);
    });

    it('should be true', () => {
      expect(service.getMissingSentences(story).length).toBe(0);
    });

    it(' should be false', () => {
      story[1].objects = [];
      expect(service.getMissingSentences(story).length > 0).toBeTrue();
    });
  });
});
