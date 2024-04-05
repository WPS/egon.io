import { testActivityCanvasObject } from '../Domain/Common/activityCanvasObject';
import { CanvasObject, testCanvasObject } from '../Domain/Common/canvasObject';
import { elementTypes } from '../Domain/Common/elementTypes';
import { StoryStep } from '../Domain/Replay/storyStep';

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
  previousStep?: StoryStep,
): CanvasObject[] {
  const activityFromActor = structuredClone(testActivityCanvasObject);

  activityFromActor.id = 'activity-' + stepNumber;
  activityFromActor.businessObject.id = activityFromActor.id;
  activityFromActor.businessObject.number = stepNumber;

  // No idea why this works!
  const source = (
    previousStep
      ? previousStep.objects.filter(
          (o) => o.id === previousStep.highlightedObjects[4],
        )
      : structuredClone(testCanvasObject)
  ) as CanvasObject;
  source.type = elementTypes.ACTOR;
  if (!previousStep) {
    source.id = 'source-' + stepNumber;
    source.type = elementTypes.ACTOR;
    source.businessObject.id = source.id;
    source.businessObject.type = elementTypes.ACTOR;
  }
  if (!source.outgoing) {
    source.outgoing = [];
  }
  source.outgoing.push(activityFromActor);

  const workObject = structuredClone(testCanvasObject);
  workObject.type = elementTypes.WORKOBJECT;
  workObject.id = 'target-' + stepNumber;
  workObject.businessObject.id = workObject.id;
  workObject.businessObject.type = elementTypes.WORKOBJECT;
  workObject.incoming!.push(activityFromActor);

  activityFromActor.source = source;
  activityFromActor.target = workObject;
  // @ts-ignore
  activityFromActor.businessObject.source = source.businessObject;
  // @ts-ignore
  activityFromActor.businessObject.target = workObject.businessObject;

  const activityFromWorkObject = structuredClone(testActivityCanvasObject);

  activityFromWorkObject.id = 'activity2-' + stepNumber;
  activityFromWorkObject.businessObject.id = activityFromWorkObject.id;

  const endActor = structuredClone(testCanvasObject);
  endActor.type = elementTypes.ACTOR;
  endActor.id = 'source-' + stepNumber;
  endActor.businessObject.id = source.id;
  endActor.businessObject.type = elementTypes.ACTOR;
  endActor.incoming!.push(activityFromWorkObject);

  activityFromWorkObject.source = workObject;
  activityFromWorkObject.target = endActor;
  // @ts-ignore
  activityFromWorkObject.businessObject.source = workObject.businessObject;
  // @ts-ignore
  activityFromWorkObject.businessObject.target = endActor.businessObject;

  workObject.outgoing!.push(activityFromWorkObject);

  return [
    source,
    activityFromActor,
    workObject,
    activityFromWorkObject,
    endActor,
  ];
}
