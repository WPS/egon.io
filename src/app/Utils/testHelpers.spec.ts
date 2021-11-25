import {StoryStep} from '../Domain/Replay/storyStep';
import {CanvasObject, testCanvasObject} from '../Domain/Common/canvasObject';
import {testActivityCanvasObject} from '../Domain/Common/activityCanvasObject';
import {deepCopy} from './deepCopy';
import {elementTypes} from '../Domain/Common/elementTypes';

export function preBuildTestStory(stepAmount: number): StoryStep[] {
  const story: StoryStep[] = [];
  let i = 0;
  while (i < stepAmount) {
    const previousStep = i > 0 ? story[i] : undefined;
    const stepObjects = createReplayStepObjects(i + 1, previousStep);
    const storyObjects = stepObjects.map((o) => o.businessObject);
    if (previousStep) {
      storyObjects.concat(previousStep.objects);
    }
    story.push({
      objects: storyObjects,
      highlightedObjects: stepObjects.map((o) => o.id),
    });
    i++;
  }
  return story;
}

export function createTestCanvasObjects(stepAmount: number): CanvasObject[] {
  const steps = [createReplayStepObjects(1)];

  if (stepAmount === 1) {
    return steps[0];
  }
  let i = 1;
  while (i < stepAmount) {
    steps[i] = createReplayStepObjects(i + 1, {
      objects: steps[i - 1].map((o) => o.businessObject),
      highlightedObjects: [],
    });

    i++;
  }
  let allObjects: CanvasObject[] = [];
  for (const step of steps) {
    allObjects = allObjects.concat(step);
  }

  return allObjects;
}

export function createReplayStepObjects(
  stepNumber: number,
  previousStep?: StoryStep
): CanvasObject[] {
  const activityFromActor = deepCopy(testActivityCanvasObject);

  activityFromActor.id = 'activity-' + stepNumber;
  activityFromActor.businessObject.id = activityFromActor.id;
  activityFromActor.businessObject.number = stepNumber;

  const source = previousStep
    ? previousStep.objects.filter(
      (o) => o.id === previousStep.highlightedObjects[4]
    )
    : deepCopy(testCanvasObject);
  source.type = elementTypes.ACTOR;
  if (!previousStep) {
    source.id = 'source-' + stepNumber;
    source.businessObject.id = source.id;
    source.businessObject.type = elementTypes.ACTOR;
  }
  source.outgoing.push(activityFromActor);

  const workObject = deepCopy(testCanvasObject);
  workObject.type = elementTypes.ACTOR;
  workObject.id = 'target-' + stepNumber;
  workObject.businessObject.id = workObject.id;
  workObject.businessObject.type = elementTypes.WORKOBJECT;
  workObject.incoming.push(activityFromActor);

  activityFromActor.source = source;
  activityFromActor.target = workObject;
  activityFromActor.businessObject.source = source.businessObject;
  activityFromActor.businessObject.target = workObject.businessObject;

  const activityFromWorkObject = deepCopy(testActivityCanvasObject);

  activityFromWorkObject.id = 'activity2-' + stepNumber;
  activityFromWorkObject.businessObject.id = activityFromWorkObject.id;

  const endActor = deepCopy(testCanvasObject);
  endActor.type = elementTypes.ACTOR;
  endActor.id = 'source-' + stepNumber;
  endActor.businessObject.id = source.id;
  endActor.businessObject.type = elementTypes.ACTOR;
  endActor.incoming.push(activityFromWorkObject);

  activityFromWorkObject.source = workObject;
  activityFromWorkObject.target = endActor;
  activityFromWorkObject.businessObject.source = workObject.businessObject;
  activityFromWorkObject.businessObject.target = endActor.businessObject;

  workObject.outgoing.push(activityFromWorkObject);

  return [
    source,
    activityFromActor,
    workObject,
    activityFromWorkObject,
    endActor,
  ];
}
