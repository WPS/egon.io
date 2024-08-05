import { testActivityCanvasObject } from '../domain/entity/common/activityCanvasObject';
import {
  CanvasObject,
  testCanvasObject,
} from '../domain/entity/common/canvasObject';
import { ElementTypes } from '../domain/entity/common/elementTypes';
import { StorySentence } from '../tools/replay/domain/storySentence';

export function preBuildTestStory(sentenceAmount: number): StorySentence[] {
  const story: StorySentence[] = [];
  let i = 0;
  while (i < sentenceAmount) {
    const previousSentence = i > 0 ? story[i] : undefined;
    const sentenceObjects = createReplaySentenceObjects(
      i + 1,
      previousSentence,
    );
    const storyObjects = sentenceObjects.map((o) => o.businessObject);
    if (previousSentence) {
      storyObjects.concat(previousSentence.objects);
    }
    story.push({
      objects: storyObjects,
      highlightedObjects: sentenceObjects.map((o) => o.id),
    });
    i++;
  }
  return story;
}

export function createTestCanvasObjects(
  sentenceAmount: number,
): CanvasObject[] {
  const sentences = [createReplaySentenceObjects(1)];

  if (sentenceAmount === 1) {
    return sentences[0];
  }
  let i = 1;
  while (i < sentenceAmount) {
    sentences[i] = createReplaySentenceObjects(i + 1, {
      objects: sentences[i - 1].map((o) => o.businessObject),
      highlightedObjects: [],
    });

    i++;
  }
  let allObjects: CanvasObject[] = [];
  for (const sentence of sentences) {
    allObjects = allObjects.concat(sentence);
  }

  return allObjects;
}

export function createReplaySentenceObjects(
  sentenceNumber: number,
  previousSentence?: StorySentence,
): CanvasObject[] {
  const activityFromActor = structuredClone(testActivityCanvasObject);

  activityFromActor.id = 'activity-' + sentenceNumber;
  activityFromActor.businessObject.id = activityFromActor.id;
  activityFromActor.businessObject.number = sentenceNumber;

  // No idea why this works!
  const source = (
    previousSentence
      ? previousSentence.objects.filter(
          (o) => o.id === previousSentence.highlightedObjects[4],
        )
      : structuredClone(testCanvasObject)
  ) as CanvasObject;
  source.type = ElementTypes.ACTOR;
  if (!previousSentence) {
    source.id = 'source-' + sentenceNumber;
    source.type = ElementTypes.ACTOR;
    source.businessObject.id = source.id;
    source.businessObject.type = ElementTypes.ACTOR;
  }
  if (!source.outgoing) {
    source.outgoing = [];
  }
  source.outgoing.push(activityFromActor);

  const workObject = structuredClone(testCanvasObject);
  workObject.type = ElementTypes.WORKOBJECT;
  workObject.id = 'target-' + sentenceNumber;
  workObject.businessObject.id = workObject.id;
  workObject.businessObject.type = ElementTypes.WORKOBJECT;
  workObject.incoming!.push(activityFromActor);

  activityFromActor.source = source;
  activityFromActor.target = workObject;
  // @ts-ignore
  activityFromActor.businessObject.source = source.businessObject;
  // @ts-ignore
  activityFromActor.businessObject.target = workObject.businessObject;

  const activityFromWorkObject = structuredClone(testActivityCanvasObject);

  activityFromWorkObject.id = 'activity2-' + sentenceNumber;
  activityFromWorkObject.businessObject.id = activityFromWorkObject.id;

  const endActor = structuredClone(testCanvasObject);
  endActor.type = ElementTypes.ACTOR;
  endActor.id = 'source-' + sentenceNumber;
  endActor.businessObject.id = source.id;
  endActor.businessObject.type = ElementTypes.ACTOR;
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
