
export function traceActivities(activitiesFromActors, elementRegistry) {
  var tracedActivities = [];

  // order the activities wih numbers by their number
  activitiesFromActors.forEach(element => {
    var number = element.businessObject.number;
    tracedActivities[number - 1] = element;
  });

  var allSteps = [];

  // create a trace for each activity with a number
  for (var i = 0; i < tracedActivities.length; i++) {

    var traceStep = createStep(tracedActivities[i], elementRegistry);

    allSteps.push(traceStep);
  }
  return allSteps;
}


function createStep(tracedActivity, elementRegistry) {
  var initialSource = elementRegistry.get(tracedActivity.businessObject.source);

  var activities = [tracedActivity];
  var targetObjects = [];

  // add the first Object to the tracedtargets, this can only be a workObject, since actors cannot connect to other actors
  var currentTarget = elementRegistry.get(tracedActivity.businessObject.target);
  targetObjects.push(currentTarget);

  // check the outgoing activities for each target
  targetObjects.forEach(checkTarget => {
    if (!checkTarget.businessObject.type.includes('actor')&& checkTarget.outgoing) {
      // check the target for each outgoing activity
      checkTarget.outgoing.forEach(activity => {
        activities.push(activity);
        var activityTarget=elementRegistry.get(activity.businessObject.target);
        if (!targetObjects.includes(activityTarget)) {
          targetObjects.push(activityTarget);
        }
      });
    }
  });

  var traceStep = {
    source: initialSource,
    activities: activities,
    targets: targetObjects
  };
  return traceStep;
}
