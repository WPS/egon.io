import { Injectable } from '@angular/core';
import { ElementTypes } from '../../../Domain/Common/elementTypes';
import { ActivityCanvasObject } from '../../../Domain/Common/activityCanvasObject';
import { BusinessObject } from '../../../Domain/Common/businessObject';
import { CanvasObject } from '../../../Domain/Common/canvasObject';
import { ElementRegistryService } from '../../ElementRegistry/element-registry.service';
import { StorySentence } from '../../../Domain/Replay/storySentence';
import { Dictionary } from '../../../Domain/Common/dictionary/dictionary';

@Injectable({
  providedIn: 'root',
})
export class StoryCreatorService {
  constructor(private elementRegistryService: ElementRegistryService) {}

  traceActivitiesAndCreateStory(): StorySentence[] {
    const tracedActivityMap = new Dictionary();
    const story: StorySentence[] = [];
    const activities = this.elementRegistryService.getActivitiesFromActors();

    activities.forEach((activity) => {
      const activityNumber = Number(activity.businessObject.number); // Sometimes the activityNumber is a string for some reason
      const tracedItem = tracedActivityMap.get(`${activityNumber - 1}`)
        ? tracedActivityMap.get(`${activityNumber - 1}`)
        : [];
      tracedItem.push(activity);
      tracedActivityMap.set(`${activityNumber - 1}`, tracedItem);
    });

    for (
      let i = 0;
      i <= Math.max(...tracedActivityMap.keysArray().map((it) => Number(it)));
      i++
    ) {
      this.createSentence(tracedActivityMap, i, story);
    }
    this.addGroupsToLastSentence(story);
    return story;
  }

  private createSentence(
    tracedActivityMap: Dictionary,
    i: number,
    story: StorySentence[],
  ): void {
    const sentenceObjects = this.getSentenceObjects(
      tracedActivityMap.get(`${i}`) || [],
    );
    const highlightedElements = sentenceObjects.map((t) => t.id);
    if (i > 0) {
      story[i - 1].objects.forEach((object) => {
        if (!sentenceObjects.includes(object)) {
          sentenceObjects.push(object);
        }
      });
    }
    story[i] = {
      highlightedObjects: highlightedElements,
      objects: sentenceObjects,
    };
  }

  getMissingSentences(story: StorySentence[]): number[] {
    if (!story || story.length === 0) {
      return [];
    }

    const missingSentences: number[] = [];
    for (let i = 0; i < story.length; i++) {
      if (
        !story[i] ||
        story[i].objects.length <= 0 ||
        story[i].highlightedObjects.length === 0 ||
        story[i].objects.filter(
          (element) => element.type === ElementTypes.ACTIVITY,
        ).length <= 0
      ) {
        missingSentences.push(i + 1);
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
    return initialSource
      .map((e) => e.businessObject)
      .concat(activities.map((a) => a.businessObject))
      .concat(targetObjects.map((t) => t.businessObject));
  }

  private addGroupsToLastSentence(story: StorySentence[]): void {
    const groups = this.elementRegistryService.getAllGroups() as CanvasObject[];
    if (groups.length > 0) {
      story[story.length - 1].objects = story[story.length - 1].objects.concat(
        groups.map((g) => g.businessObject),
      );
    }
  }
}
