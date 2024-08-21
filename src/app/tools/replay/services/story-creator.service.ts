import { Injectable } from '@angular/core';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { ActivityCanvasObject } from '../../../domain/entities/activityCanvasObject';
import { BusinessObject } from '../../../domain/entities/businessObject';
import { CanvasObject } from '../../../domain/entities/canvasObject';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { StorySentence } from '../domain/storySentence';
import { Dictionary } from '../../../domain/entities/dictionary';
import { ActivityBusinessObject } from '../../../domain/entities/activityBusinessObject';

@Injectable({
  providedIn: 'root',
})
export class StoryCreatorService {
  constructor(private elementRegistryService: ElementRegistryService) {}

  traceActivitiesAndCreateStory(): StorySentence[] {
    const tracedActivityMap = new Dictionary();
    const story: StorySentence[] = [];
    const activities = this.elementRegistryService.getActivitiesFromActors();
    const tracedActivityMapKeys: number[] = [];
    activities.forEach((activity) => {
      const activityNumber = Number(activity.businessObject.number); // Sometimes the activityNumber is a string for some reason
      const tracedItem = tracedActivityMap.get(`${activityNumber}`) ?? [];
      if (!tracedActivityMapKeys.includes(activityNumber)) {
        tracedActivityMapKeys.push(activityNumber);
      }
      tracedItem.push(activity);
      tracedActivityMap.set(`${activityNumber}`, tracedItem);
    });

    let storyIndex = 0;
    tracedActivityMapKeys.forEach((key) => {
      this.createSentence(tracedActivityMap, key, story, storyIndex);
      storyIndex++;
    });

    this.addGroupsToLastSentence(story);
    return story;
  }

  private createSentence(
    tracedActivityMap: Dictionary,
    tracedActivityMapKey: number,
    story: StorySentence[],
    storyIndex: number,
  ): void {
    let tracedActivity = tracedActivityMap.get(`${tracedActivityMapKey}`) ?? [];
    const sentenceObjects = this.getSentenceObjects(tracedActivity);
    const highlightedElements = sentenceObjects.map((t) => t.id);
    if (storyIndex > 0) {
      story[storyIndex - 1].objects.forEach((object) => {
        if (!sentenceObjects.includes(object)) {
          sentenceObjects.push(object);
        }
      });
    }
    story[storyIndex] = {
      highlightedObjects: highlightedElements,
      objects: sentenceObjects,
    };
  }

  getMissingSentences(story: StorySentence[]): number[] {
    // if the story is empty, no sequence number is missing
    if (!story || story.length === 0) {
      return [];
    }

    // collect all sequence numbers of the story
    const allActivityNumbersFromActors: number[] = story.map((sentence) => {
      // find all activity numbers of the ActivityBusinessObject
      // and returned the highest one
      const allActivityNumbers = sentence.objects.map((businessObject) => {
        if (businessObject.type.includes('activity')) {
          const activity = businessObject as ActivityBusinessObject;
          return activity.number ?? 0;
        } else {
          return 0;
        }
      });
      return Math.max(...allActivityNumbers);
    });

    const highestSequenceNumber: number = Math.max(
      ...allActivityNumbersFromActors,
    );

    const missingSentences: number[] = [];
    // with a high sequence number like 1_000_000, this could be led
    // to long calculation or completely stop from Egon.io
    for (let i = 1; i <= highestSequenceNumber; i++) {
      if (!allActivityNumbersFromActors.includes(i)) {
        missingSentences.push(i);
      }
    }
    return missingSentences;
  }

  private getSentenceObjects(
    tracedActivity: ActivityCanvasObject[],
  ): BusinessObject[] {
    const initialSource: CanvasObject[] = [];
    const activities = tracedActivity;
    const targetObjects: CanvasObject[] = [];
    const actorTextAnnotations: CanvasObject[] = [];

    tracedActivity.forEach((parallelSentence: ActivityCanvasObject) => {
      initialSource.push(parallelSentence.source);

      const firstTarget = parallelSentence.target;
      targetObjects.push(firstTarget);

      // check the outgoing activities for each target
      for (const checkTarget of targetObjects) {
        if (
          checkTarget.businessObject &&
          !checkTarget.businessObject.type.includes('actor') &&
          checkTarget.outgoing
        ) {
          // check the target for each outgoing activity
          checkTarget.outgoing.forEach((activity: ActivityCanvasObject) => {
            activities.push(activity);
            const activityTarget = activity.target;
            if (activityTarget && !targetObjects.includes(activityTarget)) {
              targetObjects.push(activityTarget);
            }
          });
        }
      }
    });
    initialSource.forEach((actor) =>
      this.addTextAnnotationsForActorOrGroup(actor, actorTextAnnotations),
    );
    targetObjects.forEach((target) => {
      if (target.businessObject.type.includes(ElementTypes.ACTOR)) {
        this.addTextAnnotationsForActorOrGroup(target, actorTextAnnotations);
      }
    });

    return initialSource
      .map((e) => e.businessObject)
      .concat(activities.map((a) => a.businessObject))
      .concat(targetObjects.map((t) => t.businessObject))
      .concat(actorTextAnnotations.map((ta) => ta.businessObject));
  }

  private addTextAnnotationsForActorOrGroup(
    object: CanvasObject,
    objectTextAnnotations: CanvasObject[],
  ) {
    object.outgoing?.forEach((connection) => {
      // connections outgoing from actors or groups without number must be connections to text annotations
      if (!connection.businessObject.number) {
        objectTextAnnotations.push(connection);
        objectTextAnnotations.push(connection.target);
      }
    });
  }

  private addGroupsToLastSentence(story: StorySentence[]): void {
    const groups = this.elementRegistryService.getAllGroups() as CanvasObject[];
    const annotationsForGroups: CanvasObject[] = [];
    groups.forEach((group) =>
      this.addTextAnnotationsForActorOrGroup(group, annotationsForGroups),
    );
    if (groups.length > 0 && story.length > 0) {
      story[story.length - 1].objects = story[story.length - 1].objects
        .concat(groups.map((g) => g.businessObject))
        .concat(annotationsForGroups.map((a) => a.businessObject));
    }
  }
}
