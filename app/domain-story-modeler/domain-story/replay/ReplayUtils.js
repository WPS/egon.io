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
  var initialSource;
  var activities=[tracedActivity];
  var targetObjects=[];
  if (tracedActivity) {
    initialSource = elementRegistry.get(tracedActivity.businessObject.source);

    // add the first Object to the tracedtargets, this can only be a workObject, since actors cannot connect to other actors
    var currentTarget = elementRegistry.get(tracedActivity.businessObject.target);
    targetObjects.push(currentTarget);

    // check the outgoing activities for each target
    for (var i=0;i<targetObjects.length;i++) {
      var checkTarget=targetObjects[i];
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
    }
  }

  var traceStep = {
    source: initialSource,
    activities: activities,
    targets: targetObjects
  };
  return traceStep;
}

export function completeStory(replaySteps) {
  var complete=true;
  for (var i=0;i<replaySteps.length;i++) {
    if (!replaySteps[i].activities[0]) {
      complete=false;
    }
  }
  return complete;
}

// get all elements, that are supposed to be shown in the current step
export function getAllShown(stepsUntilNow) {
  var shownElements = [];
  stepsUntilNow.forEach(step => {
    shownElements.push(step.source);
    if (step.source.outgoing) {
      step.source.outgoing.forEach(out=>{
        if (out.type.includes('domainStory:connection')) {
          shownElements.push(out, out.target);
        }
      });
    }
    step.targets.forEach(target => {
      shownElements.push(target);
      if (target.outgoing) {
        target.outgoing.forEach(out=>{
          if (out.type.includes('domainStory:connection')) {
            shownElements.push(out, out.target);
          }
        });
      }
      step.activities.forEach(activity => {
        shownElements.push(activity);
      });
    });
  });
  return shownElements;
}


// get all elements, that are supposed to be hidden in the current step
export function getAllNonShown(allObjects, shownElements) {
  var notShownElements = [];

  allObjects.forEach(element => {
    if (!shownElements.includes(element)) {
      if (element.type.includes('domainStory:connection')) {
        if (!element.source.type.includes('domainStory:group')) {
          notShownElements.push(element);
        }
        else {
          shownElements.push(element.target);
        }
      }
      else {
        notShownElements.push(element);
      }
    }
  });
  return notShownElements;
}
