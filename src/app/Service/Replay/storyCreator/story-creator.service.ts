import { Injectable } from '@angular/core';
import { elementTypes } from '../../../Domain/Common/elementTypes';
import { ActivityCanvasObject } from '../../../Domain/Common/activityCanvasObject';
import { BusinessObject } from '../../../Domain/Common/businessObject';
import { CanvasObject } from '../../../Domain/Common/canvasObject';
import { ElementRegistryService } from '../../ElementRegistry/element-registry.service';
import { StoryStep } from '../../../Domain/Replay/storyStep';
import { Dictionary } from '../../../Domain/Common/dictionary/dictionary';

@Injectable({
  providedIn: 'root',
})
export class StoryCreatorService {
  constructor(private elementRegistryService: ElementRegistryService) {}

  traceActivitiesAndCreateStory(): StoryStep[] {
    const tracedActivityMap = new Dictionary();
    const story: StoryStep[] = [];
    const activities = this.elementRegistryService.getActivitiesFromActors();

    activities.forEach((activity) => {
      const activityNumber = activity.businessObject.number;
      // @ts-ignore
      const tracedItem = tracedActivityMap.get(activityNumber - 1)
        ? // @ts-ignore
          tracedActivityMap.get(activityNumber - 1)
        : [];
      tracedItem.push(activity);
      // @ts-ignore
      tracedActivityMap.set(activityNumber - 1, tracedItem);
    });

    // @ts-ignore
    for (let i = 0; i < tracedActivityMap.keysArray().length; i++) {
      this.createStep(tracedActivityMap, i, story);
    }
    this.addGroupStep(story);
    return story;
  }

  private createStep(
    tracedActivityMap: Dictionary,
    i: number,
    story: StoryStep[]
  ): void {
    // @ts-ignore
    const stepObjects = this.getStepObjects(tracedActivityMap.get(i) || []);
    const highlightedElements = stepObjects.map((t) => t.id);
    if (i > 0) {
      story[i - 1].objects.forEach((object) => {
        if (!stepObjects.includes(object)) {
          stepObjects.push(object);
        }
      });
    }
    story[i] = {
      highlightedObjects: highlightedElements,
      objects: stepObjects,
    };
  }

  isStoryConsecutivelyNumbered(story: StoryStep[]): boolean {
    if (!story || story.length === 0) {
      return false;
    }

    let complete = true;
    for (let i = 0; i < story.length; i++) {
      if (
        !story[i] ||
        !(story[i].objects.length > 0) ||
        story[i].objects.filter(
          (element) => element.type === elementTypes.ACTIVITY
        ).length <= 0
      ) {
        complete = false;
      }
    }
    return complete;
  }

  private getStepObjects(
    tracedActivity: ActivityCanvasObject[]
  ): BusinessObject[] {
    const initialSource: CanvasObject[] = [];
    const activities = tracedActivity;
    const targetObjects: CanvasObject[] = [];

    tracedActivity.forEach((parallelStep: ActivityCanvasObject) => {
      // @ts-ignore
      initialSource.push(parallelStep.source);

      const firstTarget = parallelStep.target;
      // @ts-ignore
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
            // @ts-ignore
            activities.push(activity);
            const activityTarget = activity.target;
            // @ts-ignore
            if (!targetObjects.includes(activityTarget)) {
              // @ts-ignore
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

  /** Groups should be shown at the End of the Story **/
  private addGroupStep(story: StoryStep[]): void {
    const groups = this.elementRegistryService.getAllGroups() as CanvasObject[];
    if (groups.length > 0) {
      story.push({
        highlightedObjects: [],
        objects: groups
          .map((g) => g.businessObject)
          .concat(story[story.length - 1].objects),
      });
    }
  }
}
