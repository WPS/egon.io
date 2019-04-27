'use strict';

import { CONNECTION, GROUP } from '../../language/elementTypes';
import { getActivitesFromActors, getAllCanvasObjects, wasInitialized } from '../canvasElements/canvasElementRegistry';

var canvas;
var elementRegistry;

var replayOn = false;
var currentStep = 0;
var replaySteps = [];

var errorStep =0;

export function initReplay(inCanvas) {
  canvas = inCanvas;
}

export function isPlaying() {
  return replayOn;
}

let modal = document.getElementById('modal');
let startReplayButton = document.getElementById('buttonStartReplay');
let nextStepButton = document.getElementById('buttonNextStep');
let previousStepButton = document.getElementById('buttonPreviousStep');
let stopReplayButton = document.getElementById('buttonStopReplay');
let currentReplayStepLabel = document.getElementById('replayStep');
let incompleteStoryDialog = document.getElementById('incompleteStoryInfo');

startReplayButton.addEventListener('click', function() {
  if (wasInitialized()) {

    var activities = getActivitesFromActors();

    if (!replayOn && activities.length > 0) {
      replaySteps = traceActivities(activities, elementRegistry);

      if (isStoryConsecutivelyNumbered(replaySteps)) {
        replayOn = true;
        presentationMode();
        currentStep = 0;
        showCurrentStep();
      }
      else {
        var errorText = '\nThe numbers: ';
        for (var i=0; i<replaySteps.length; i++) {
          if (errorStep[i]) {
            errorText+= ((i + 1) + ',');
          }
        }
        errorText = errorText.substring(0, errorText.length - 1);
        errorText+= ' are missing!';

        var oldText = incompleteStoryDialog.getElementsByTagName('text');
        if (oldText) {
          for (i=0; i < oldText.length; i++) {
            incompleteStoryDialog.removeChild(oldText[i]);
          }
        }

        var text = document.createElement('text');
        text.innerHTML = ' The activities in this Domain Story are not numbered consecutively.<br>' +
        'Please fix the numbering in order to replay the story.<br>' +
        errorText;
        incompleteStoryDialog.appendChild(text);
        incompleteStoryDialog.style.display = 'block';
        modal.style.display = 'block';
      }
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
    editMode();

    // show all canvas elements
    var allObjects = [];
    var groupObjects = [];
    var canvasObjects = canvas._rootElement.children;
    var i = 0;

    for (i = 0; i < canvasObjects.length; i++) {
      if (canvasObjects[i].type.includes(GROUP)) {
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
        if (child.type.includes(GROUP)) {
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
function createStep(tracedActivity) {
  var initialSource;
  var activities = [tracedActivity];
  var targetObjects = [];
  if (tracedActivity) {
    initialSource = tracedActivity.source;

    // add the first Object to the traced targets, this can only be a workObject, since actors cannot connect to other actors
    var firstTarget = tracedActivity.target;
    targetObjects.push(firstTarget);

    // check the outgoing activities for each target
    for (var i = 0; i < targetObjects.length; i++) {
      var checkTarget = targetObjects[i];
      if (checkTarget.businessObject && !checkTarget.businessObject.type.includes('actor') && checkTarget.outgoing) {
        // check the target for each outgoing activity
        checkTarget.outgoing.forEach(activity => {
          activities.push(activity);
          var activityTarget = activity.target;
          if (!targetObjects.includes(activityTarget)) {
            targetObjects.push(activityTarget);
          }
        });
      }
    }
  }

  var tracedStep = {
    source: initialSource,
    activities: activities,
    targets: targetObjects
  };
  return tracedStep;
}

export function isStoryConsecutivelyNumbered(replaySteps) {
  errorStep = [];
  var complete = true;
  for (var i = 0; i < replaySteps.length; i++) {
    if (!replaySteps[i].activities[0]) {
      complete = false;
      errorStep[i] = true;
    } else {
      errorStep[i] = false;
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
        if (out.type.includes(CONNECTION)) {
          shownElements.push(out, out.target);
        }
      });
    }

    // add the target of the step and their annotations to the shown elements
    step.targets.forEach(target => {
      shownElements.push(target);
      if (target.outgoing) {
        target.outgoing.forEach(out => {
          if (out.type.includes(CONNECTION)) {
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
      if (element.type.includes(CONNECTION)) {
        if (!element.source.type.includes(GROUP)) {
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

function presentationMode() {
  var contextPadElements = document.getElementsByClassName('djs-context-pad');
  var paletteElements = document.getElementsByClassName('djs-palette');

  var infoContainer = document.getElementById('infoContainer');
  infoContainer.style.display = 'none';

  var editModeButtons = document.getElementById('editModeButtons');
  editModeButtons.style.display = 'none';
  editModeButtons.style.pointerEvents = 'none';

  var presentationModeButtons = document.getElementById('presentationModeButtons');
  presentationModeButtons.style.display = 'block';
  presentationModeButtons.style.pointerEvents = 'all';

  var headerAndCanvas = document.getElementsByClassName('headerAndCanvas')[0];
  headerAndCanvas.style.gridTemplateRows = '50px 1px auto';

  var headlineAndButtons = document.getElementById('headlineAndButtons');
  headlineAndButtons.style.gridTemplateColumns= 'auto 230px 3px';

  var i = 0;
  for (i = 0; i < contextPadElements.length; i++) {
    contextPadElements[i].style.display = 'none';
  }

  for (i = 0; i < paletteElements.length; i++) {
    paletteElements[i].style.display = 'none';
  }

  currentReplayStepLabel.style.opacity = 1;
}

function editMode() {
  var contextPadElements = document.getElementsByClassName('djs-context-pad');
  var paletteElements = document.getElementsByClassName('djs-palette');

  var infoContainer = document.getElementById('infoContainer');
  infoContainer.style.display = 'inherit';

  var editModeButtons = document.getElementById('editModeButtons');
  editModeButtons.style.display = 'inherit';
  editModeButtons.style.pointerEvents = 'all';

  var presentationModeButtons = document.getElementById('presentationModeButtons');
  presentationModeButtons.style.display = 'none';
  presentationModeButtons.style.pointerEvents = 'none';

  var headerAndCanvas = document.getElementsByClassName('headerAndCanvas')[0];
  headerAndCanvas.style.gridTemplateRows = '125px 1px auto';

  var headlineAndButtons = document.getElementById('headlineAndButtons');
  headlineAndButtons.style.gridTemplateColumns= 'auto 355px 3px';

  var i = 0;
  for (i = 0; i < contextPadElements.length; i++) {
    contextPadElements[i].style.display = 'block';
  }

  for (i = 0; i < paletteElements.length; i++) {
    paletteElements[i].style.display = 'block';
  }
  currentReplayStepLabel.style.opacity = 0;
}

function showCurrentStep() {
  var stepsUntilNow = [];
  var allObjects = [];
  var i = 0;

  currentReplayStepLabel.innerText = (currentStep + 1) + ' / ' + replaySteps.length;

  for (i = 0; i <= currentStep; i++) {
    stepsUntilNow.push(replaySteps[i]);
  }

  allObjects = getAllCanvasObjects(canvas);

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
