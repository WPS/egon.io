'use strict';

import { Dict } from '../../language/collection';

// create a trace through all activities, that recreates the path from the beginning to the end of the story
export function traceActivities(activitiesFromActors) {
  const tracedActivityMap = new Dict();

  // order the activities with numbers by their number
  activitiesFromActors.forEach(element => {
    let number = element.businessObject.number;
    let tracedItem = tracedActivityMap.get(number - 1) || [];
    tracedItem.push(element);
    tracedActivityMap.set(number - 1, tracedItem);
  });

  let allSteps = [];

  // create a step for each activity with a number
  for (let i = 0; i < tracedActivityMap.keysArray().length; i++) {
    let traceStep = createStep(tracedActivityMap.get(i) || []);

    allSteps.push(traceStep);
  }
  return allSteps;
}

// create a step for the replay function
export function createStep(tracedActivity) {
  let initialSources = [];
  let activities = tracedActivity;
  let targetObjects = [];

  tracedActivity.forEach(parrallelStep => {
    if (parrallelStep) {
      initialSources.push(parrallelStep.source);

      // add the first Object to the traced targets, this can only be a workObject, since actors cannot connect to other actors
      let firstTarget = parrallelStep.target;
      targetObjects.push(firstTarget);

      // check the outgoing activities for each target
      for (let i = 0; i < targetObjects.length; i++) {
        let checkTarget = targetObjects[i];
        if (
          checkTarget.businessObject &&
            !checkTarget.businessObject.type.includes('actor') &&
            checkTarget.outgoing
        ) {

          // check the target for each outgoing activity
          checkTarget.outgoing.forEach(activity => {
            activities.push(activity);
            let activityTarget = activity.target;
            if (!targetObjects.includes(activityTarget)) {
              targetObjects.push(activityTarget);
            }
          });
        }
      }
    }
  });

  let tracedStep = {
    sources: initialSources,
    activities: activities,
    targets: targetObjects
  };
  return tracedStep;
}