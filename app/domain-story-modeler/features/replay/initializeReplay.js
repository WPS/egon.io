'use strict';

import { Dict } from '../../language/classes/collection';
import { getAllGroups } from '../../language/canvasElementRegistry';

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

  const groups = getAllGroups();
  addGroupSteps(groups, allSteps);

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
        const checkTarget = targetObjects[i];
        if (
          checkTarget.businessObject &&
            !checkTarget.businessObject.type.includes('actor') &&
            checkTarget.outgoing
        ) {

          // check the target for each outgoing activity
          checkTarget.outgoing.forEach(activity => {
            activities.push(activity);
            const activityTarget = activity.target;
            if (!targetObjects.includes(activityTarget)) {
              targetObjects.push(activityTarget);
            }
          });
        }
      }
    }
  });

  const tracedStep = {
    sources: initialSources,
    activities: activities,
    targets: targetObjects
  };
  return tracedStep;
}

function addGroupSteps(groups, allSteps) {

  if (groups.length >0) {
    allSteps.push({
      groups: groups,
      activities: [true]
    });
  }

  // const [orderedGroups, unorderedGroups] = getGroupOrder(groups, allSteps);

  // orderedGroups.forEach(group => {
  //   allSteps.push (
  //     {
  //       groups: [group],
  //       activities: [true]
  //     });
  // });

  // if (unorderedGroups.length >0) {
  //   allSteps.push({
  //     groups: unorderedGroups,
  //     activities:[true]
  //   });
  // }
}

// function getGroupOrder(groups, allSteps) {
//   const groupOrder = [];

//   [];

//   for (let i =0; i< allSteps.length; i++) {
//     const step = allSteps[i];
//     const targetIds = step.targets.map(target =>target.id);

//     groups.forEach(group => {
//       const groupId = group.id;
//       const childIds = group.children.map(child => child.id);

//       if (childIds.diff(targetIds).length > 0) {
//         if (!groupOrder.some(id => id === groupId)) {
//           groupOrder.push(groupId);
//         }
//       }
//     });
//   }

//   const orderedGroups = [];
//   groupOrder.forEach(id => {
//     orderedGroups.push(groups.filter(group => group.id === id)[0]);
//   });

//   const unorderedGroups = [];
//   groups.forEach(group => {
//     if (!orderedGroups.includes(group)) {
//       unorderedGroups.push(group);
//     }
//   });

//   return [orderedGroups, unorderedGroups];
// }