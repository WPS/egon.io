'use strict';

import { getActivitesFromActors } from '../../util/DSActivityUtil';

import { getAllObjectsFromCanvas } from '../../util/DSUtil';

var canvas;
var elementRegistry;

var replayOn = false;
var currentStep = 0;
var replaySteps = [];

export function initReplay(inCanvas, inElementRegistry) {
  canvas = inCanvas;
  elementRegistry = inElementRegistry;
}

export function isPlaying() {
  return replayOn;
}

var modal = document.getElementById('modal'),
    startReplayButton = document.getElementById('buttonStartReplay'),
    nextStepButton = document.getElementById('buttonNextStep'),
    previousStepButton = document.getElementById('buttonPreviousStep'),
    stopReplayButton = document.getElementById('buttonStopReplay'),
    currentReplayStepLabel = document.getElementById('replayStep'),
    headline = document.getElementById('headline'),
    incompleteStoryDialog = document.getElementById('incompleteStoryInfo'),
    importExportSVGButtonsContainer = document.getElementById('importExportSVGButton');

startReplayButton.addEventListener('click', function() {
  var canvasObjects = canvas._rootElement.children;
  var activities = getActivitesFromActors(canvasObjects);

  if (!replayOn && activities.length > 0) {
    replaySteps = traceActivities(activities, elementRegistry);

    if (isStoryConsecutivelyNumbered(replaySteps)) {
      replayOn = true;
      disableCanvasInteraction();
      currentStep = 0;
      showCurrentStep();
    }
    else {
      incompleteStoryDialog.style.display = 'block';
      modal.style.display = 'block';
    }
  }
});

nextStepButton.addEventListener('click', function() {
  if (replayOn) {
    if (currentStep < replaySteps.length - 1) {
      currentStep += 1;
      showCurrentStep();
    }
  }
});

previousStepButton.addEventListener('click', function() {
  if (replayOn) {
    if (currentStep > 0) {
      currentStep -= 1;
      showCurrentStep();
    }
  }
});

stopReplayButton.addEventListener('click', function() {
  if (replayOn) {
    enableCanvasInteraction();

    // show all canvas elements
    var allObjects = [];
    var groupObjects = [];
    var canvasObjects = canvas._rootElement.children;
    var i = 0;

    for (i = 0; i < canvasObjects.length; i++) {
      if (canvasObjects[i].type.includes('domainStory:group')) {
        groupObjects.push(canvasObjects[i]);
      }
      else {
        allObjects.push(canvasObjects[i]);
      }
    }

    i = groupObjects.length - 1;
    while (groupObjects.length >= 1) {
      var currentgroup = groupObjects.pop();
      currentgroup.children.forEach(child => {
        if (child.type.includes('domainStory:group')) {
          groupObjects.push(child);
        }
        else {
          allObjects.push(child);
        }
      });
      i = groupObjects.length - 1;
    }
    allObjects.forEach(element => {
      var domObject = document.querySelector('[data-element-id=' + element.id + ']');
      domObject.style.display = 'block';
    });

    replayOn = false;
    currentStep = 0;
  }
});

// create a trace through all activities, that recreates the path from the beginning to the end of the story
export function traceActivities(activitiesFromActors, elementRegistry) {
  var tracedActivities = [];

  // order the activities with numbers by their number
  activitiesFromActors.forEach(element => {
    var number = element.businessObject.number;
    tracedActivities[number - 1] = element;
  });

  var allSteps = [];

  // create a step for each activity with a number
  for (var i = 0; i < tracedActivities.length; i++) {
    var traceStep = createStep(tracedActivities[i], elementRegistry);

    allSteps.push(traceStep);
  }
  return allSteps;
}

// create a step for the replay function
function createStep(tracedActivity, elementRegistry) {
  var initialSource;
  var activities = [tracedActivity];
  var targetObjects = [];
  if (tracedActivity) {
    initialSource = elementRegistry.get(tracedActivity.businessObject.source);

    // add the first Object to the traced targets, this can only be a workObject, since actors cannot connect to other actors
    var currentTarget = elementRegistry.get(tracedActivity.businessObject.target);
    targetObjects.push(currentTarget);

    // check the outgoing activities for each target
    for (var i = 0; i < targetObjects.length; i++) {
      var checkTarget = targetObjects[i];
      if (!checkTarget.businessObject.type.includes('actor') && checkTarget.outgoing) {
        // check the target for each outgoing activity
        checkTarget.outgoing.forEach(activity => {
          activities.push(activity);
          var activityTarget = elementRegistry.get(activity.businessObject.target);
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

export function isStoryConsecutivelyNumbered(replaySteps) {
  var complete = true;
  for (var i = 0; i < replaySteps.length; i++) {
    if (!replaySteps[i].activities[0]) {
      complete = false;
    }
  }
  return complete;
}

// get all elements, that are supposed to be shown in the current step
export function getAllShown(stepsUntilNow) {
  var shownElements = [];

  // for each step until the current one, add all referenced elements to the list of shown elements
  stepsUntilNow.forEach(step => {

    // add the source of the step and their annotations to the shown elements
    shownElements.push(step.source);
    if (step.source.outgoing) {
      step.source.outgoing.forEach(out => {
        if (out.type.includes('domainStory:connection')) {
          shownElements.push(out, out.target);
        }
      });
    }

    // add the target of the step and their annotations to the shown elements
    step.targets.forEach(target => {
      shownElements.push(target);
      if (target.outgoing) {
        target.outgoing.forEach(out => {
          if (out.type.includes('domainStory:connection')) {
            shownElements.push(out, out.target);
          }
        });
      }

      // add each activity to the step
      step.activities.forEach(activity => {
        shownElements.push(activity);
      });
    });
  });
  return shownElements;
}

// get all elements, that are supposed to be hidden in the current step
export function getAllNotShown(allObjects, shownElements) {
  var notShownElements = [];

  // every element that is not referenced in shownElements
  // and is neither a group (since they are not refeenced n allObjects),
  // nor an annotation conntected to a group should be hidden
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

// replay functions

function disableCanvasInteraction() {
  var contextPadElements = document.getElementsByClassName('djs-context-pad');
  var paletteElements = document.getElementsByClassName('djs-palette');

  headline.style.pointerEvents = 'none';

  importExportSVGButtonsContainer.style.opacity = 0.2;
  importExportSVGButtonsContainer.style.pointerEvents = 'none';

  startReplayButton.style.opacity = 0.2;
  startReplayButton.style.pointerEvents = 'none';

  stopReplayButton.style.opacity = 1;
  stopReplayButton.style.pointerEvents = 'all';

  nextStepButton.style.opacity = 1;
  nextStepButton.style.pointerEvents = 'all';

  previousStepButton.style.opacity = 1;
  previousStepButton.style.pointerEvents = 'all';

  var i = 0;
  for (i = 0; i < contextPadElements.length; i++) {
    contextPadElements[i].style.display = 'none';
  }

  for (i = 0; i < paletteElements.length; i++) {
    paletteElements[i].style.display = 'none';
  }

  currentReplayStepLabel.style.display = 'block';
}

function enableCanvasInteraction() {
  var contextPadElements = document.getElementsByClassName('djs-context-pad');
  var paletteElements = document.getElementsByClassName('djs-palette');

  headline.style.pointerEvents = 'all';

  importExportSVGButtonsContainer.style.opacity = 1;
  importExportSVGButtonsContainer.style.pointerEvents = 'all';

  startReplayButton.style.opacity = 1;
  startReplayButton.style.pointerEvents = 'all';

  stopReplayButton.style.opacity = 0.2;
  stopReplayButton.style.pointerEvents = 'none';

  nextStepButton.style.opacity = 0.2;
  nextStepButton.style.pointerEvents = 'none';

  previousStepButton.style.opacity = 0.2;
  previousStepButton.style.pointerEvents = 'none';

  var i = 0;
  for (i = 0; i < contextPadElements.length; i++) {
    contextPadElements[i].style.display = 'block';
  }

  for (i = 0; i < paletteElements.length; i++) {
    paletteElements[i].style.display = 'block';
  }
  currentReplayStepLabel.style.display = 'none';
}

function showCurrentStep() {
  var stepsUntilNow = [];
  var allObjects = [];
  var i = 0;

  currentReplayStepLabel.innerText = (currentStep + 1) + ' / ' + replaySteps.length;

  for (i = 0; i <= currentStep; i++) {
    stepsUntilNow.push(replaySteps[i]);
  }

  allObjects = getAllObjectsFromCanvas(canvas);

  var shownElements = getAllShown(stepsUntilNow);

  var notShownElements = getAllNotShown(allObjects, shownElements);

  // hide all elements, that are not to be shown
  notShownElements.forEach(element => {
    var domObject = document.querySelector('[data-element-id=' + element.id + ']');
    domObject.style.display = 'none';
  });

  shownElements.forEach(element => {
    var domObject = document.querySelector('[data-element-id=' + element.id + ']');
    domObject.style.display = 'block';
  });
}