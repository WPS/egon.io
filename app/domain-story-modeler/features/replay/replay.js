'use strict';

import { CONNECTION, GROUP } from '../../language/elementTypes';
import {
  getActivitesFromActors,
  getAllCanvasObjects,
  wasInitialized
} from '../canvasElements/canvasElementRegistry';

let canvas;
const map = require('collections/map');

let replayOn = false;
let currentStep = 0;
let replaySteps = [];

let errorStep = 0;

let modal = document.getElementById('modal');
let startReplayButton = document.getElementById('buttonStartReplay');
let nextStepButton = document.getElementById('buttonNextStep');
let previousStepButton = document.getElementById('buttonPreviousStep');
let stopReplayButton = document.getElementById('buttonStopReplay');
let currentReplayStepLabel = document.getElementById('replayStep');
let incompleteStoryDialog = document.getElementById('incompleteStoryInfo');

export function getReplayOn() {
  return replayOn;
}

export function initReplay(inCanvas) {
  canvas = inCanvas;

  document.addEventListener('keydown', function(e) {
    if (replayOn) {
      if (e.keyCode == 37 || e.keyCode == 40) {
        // leftArrow or downArrow
        previousStep();
      } else if (e.keyCode == 39 || e.keyCode == 38) {
        // rightArrow or UpArrow
        nextStep();
      }
    }
  });

  startReplayButton.addEventListener('click', function() {
    if (wasInitialized()) {
      let activities = getActivitesFromActors();

      if (!replayOn && activities.length > 0) {
        replaySteps = traceActivities(activities);

        if (isStoryConsecutivelyNumbered(replaySteps)) {
          replayOn = true;
          presentationMode();
          currentStep = 0;
          showCurrentStep();
        } else {
          let errorText = '\nThe numbers: ';
          for (let i = 0; i < replaySteps.length; i++) {
            if (errorStep[i]) {
              errorText += i + 1 + ',';
            }
          }
          errorText = errorText.substring(0, errorText.length - 1);
          errorText += ' are missing!';

          let oldText = incompleteStoryDialog.getElementsByTagName('text');
          if (oldText) {
            for (let i = 0; i < oldText.length; i++) {
              incompleteStoryDialog.removeChild(oldText[i]);
            }
          }

          let text = document.createElement('text');
          text.innerHTML =
            ' The activities in this Domain Story are not numbered consecutively.<br>' +
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
    nextStep();
  });

  previousStepButton.addEventListener('click', function() {
    previousStep();
  });

  stopReplayButton.addEventListener('click', function() {
    if (replayOn) {
      editMode();

      // show all canvas elements
      let allObjects = [];
      let groupObjects = [];
      let canvasObjects = canvas._rootElement.children;
      let i = 0;

      for (i = 0; i < canvasObjects.length; i++) {
        if (canvasObjects[i].type.includes(GROUP)) {
          groupObjects.push(canvasObjects[i]);
        } else {
          allObjects.push(canvasObjects[i]);
        }
      }

      i = groupObjects.length - 1;
      while (groupObjects.length >= 1) {
        let currentgroup = groupObjects.pop();
        currentgroup.children.forEach(child => {
          if (child.type.includes(GROUP)) {
            groupObjects.push(child);
          } else {
            allObjects.push(child);
          }
        });
        i = groupObjects.length - 1;
      }
      allObjects.forEach(element => {
        let domObject = document.querySelector(
          '[data-element-id=' + element.id + ']'
        );
        domObject.style.display = 'block';
      });

      replayOn = false;
      currentStep = 0;
    }
  });
}

function nextStep() {
  if (replayOn) {
    if (currentStep < replaySteps.length - 1) {
      currentStep += 1;
      showCurrentStep();
    }
  }
}

function previousStep() {
  if (replayOn) {
    if (currentStep > 0) {
      currentStep -= 1;
      showCurrentStep();
    }
  }
}

export function isPlaying() {
  return replayOn;
}

// create a trace through all activities, that recreates the path from the beginning to the end of the story
export function traceActivities(activitiesFromActors) {
  const tracedActivityMap = new map();

  // order the activities with numbers by their number
  activitiesFromActors.forEach(element => {
    let number = element.businessObject.number;
    let tracedItem = tracedActivityMap.get(number-1) || [];
    tracedItem.push(element);
    tracedActivityMap.set(number-1, tracedItem);
  });

  let allSteps = [];
  // create a step for each activity with a number
  for (let i = 0; i < tracedActivityMap.keysArray().length; i++) {
    let traceStep = createStep(tracedActivityMap.get(i));

    allSteps.push(traceStep);
  }
  return allSteps;
}

// create a step for the replay function
export function createStep(tracedActivity) {
  let initialSource;
  let activities = tracedActivity;
  let targetObjects = [];
  if (tracedActivity) {
    initialSource = tracedActivity.source;

    // add the first Object to the traced targets, this can only be a workObject, since actors cannot connect to other actors
    let firstTarget = tracedActivity.target;
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
  });

  let tracedStep = {
    source: initialSource,
    activities: activities,
    targets: targetObjects
  };
  return tracedStep;
}

export function isStoryConsecutivelyNumbered(replaySteps) {
  errorStep = [];
  let complete = true;
  for (let i = 0; i < replaySteps.length; i++) {
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
  let shownElements = [];

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
  let notShownElements = [];

  // every element that is not referenced in shownElements
  // and is neither a group (since they are not refeenced n allObjects),
  // nor an annotation conntected to a group should be hidden
  allObjects.forEach(element => {
    if (!shownElements.includes(element)) {
      if (element.type.includes(CONNECTION)) {
        if (!element.source.type.includes(GROUP)) {
          notShownElements.push(element);
        } else {
          shownElements.push(element.target);
        }
      } else {
        notShownElements.push(element);
      }
    }
  });
  return notShownElements;
}

// replay functions

function presentationMode() {
  let contextPadElements = document.getElementsByClassName('djs-context-pad');
  let paletteElements = document.getElementsByClassName('djs-palette');

  let infoContainer = document.getElementById('infoContainer');
  infoContainer.style.display = 'none';

  let editModeButtons = document.getElementById('editModeButtons');
  editModeButtons.style.display = 'none';
  editModeButtons.style.pointerEvents = 'none';

  let presentationModeButtons = document.getElementById(
    'presentationModeButtons'
  );
  presentationModeButtons.style.display = 'block';
  presentationModeButtons.style.pointerEvents = 'all';

  let headerAndCanvas = document.getElementsByClassName('headerAndCanvas')[0];
  headerAndCanvas.style.gridTemplateRows = '50px 1px auto';

  let headlineAndButtons = document.getElementById('headlineAndButtons');
  headlineAndButtons.style.gridTemplateColumns = 'auto 230px 3px';

  let i = 0;
  for (i = 0; i < contextPadElements.length; i++) {
    contextPadElements[i].style.display = 'none';
  }

  for (i = 0; i < paletteElements.length; i++) {
    paletteElements[i].style.display = 'none';
  }

  currentReplayStepLabel.style.opacity = 1;
}

function editMode() {
  let contextPadElements = document.getElementsByClassName('djs-context-pad');
  let paletteElements = document.getElementsByClassName('djs-palette');

  let infoContainer = document.getElementById('infoContainer');
  infoContainer.style.display = 'block';
  infoContainer.style.height = '75px';

  let editModeButtons = document.getElementById('editModeButtons');
  editModeButtons.style.display = 'inherit';
  editModeButtons.style.pointerEvents = 'all';

  let presentationModeButtons = document.getElementById(
    'presentationModeButtons'
  );
  presentationModeButtons.style.display = 'none';
  presentationModeButtons.style.pointerEvents = 'none';

  let headerAndCanvas = document.getElementsByClassName('headerAndCanvas')[0];
  headerAndCanvas.style.gridTemplateRows = '125px 1px auto';

  let headlineAndButtons = document.getElementById('headlineAndButtons');
  headlineAndButtons.style.gridTemplateColumns = 'auto 390px 3px';

  let i = 0;
  for (i = 0; i < contextPadElements.length; i++) {
    contextPadElements[i].style.display = 'block';
  }

  for (i = 0; i < paletteElements.length; i++) {
    paletteElements[i].style.display = 'block';
  }
  currentReplayStepLabel.style.opacity = 0;
}

function showCurrentStep() {
  let stepsUntilNow = [];
  let allObjects = [];
  let i = 0;

  currentReplayStepLabel.innerText =
    currentStep + 1 + ' / ' + replaySteps.length;

  for (i = 0; i <= currentStep; i++) {
    stepsUntilNow.push(replaySteps[i]);
  }

  allObjects = getAllCanvasObjects(canvas);

  let shownElements = getAllShown(stepsUntilNow);

  let notShownElements = getAllNotShown(allObjects, shownElements);

  // hide all elements, that are not to be shown
  notShownElements.forEach(element => {
    let domObject = document.querySelector(
      '[data-element-id=' + element.id + ']'
    );
    domObject.style.display = 'none';
  });

  shownElements.forEach(element => {
    let domObject = document.querySelector(
      '[data-element-id=' + element.id + ']'
    );
    domObject.style.display = 'block';
  });
}
