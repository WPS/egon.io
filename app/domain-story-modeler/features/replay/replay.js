'use strict';

import { CONNECTION, GROUP } from '../../language/elementTypes';
import {
  getActivitesFromActors,
  getAllCanvasObjects,
  wasInitialized,
  getAllActivities
} from '../../language/canvasElementRegistry';
import { traceActivities } from './initializeReplay';

let canvas;
let selection;

let replayOn = false;
let currentStep = 0;
let replaySteps = [];
let initialViewbox;

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

export function initReplay(inCanvas, inSelection) {
  canvas = inCanvas;
  selection = inSelection;

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
      initialViewbox = canvas.viewbox();
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
      canvas.viewbox(initialViewbox);
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
    step.sources.forEach(source => {
      shownElements.push(source);
      if (source.outgoing) {
        source.outgoing.forEach(out => {
          if (out.type.includes(CONNECTION)) {
            shownElements.push(out, out.target);
          }
        });
      }
    });

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

function removeHighlights() {
  const allActivities = getAllActivities();

  allActivities.forEach(activity => {
    const activityDomObject = document.querySelector(
      '[data-element-id=' + activity.id + ']'
    ).getElementsByTagName('polyline')[0];

    activityDomObject.style.stroke = activity.businessObject.pickedColor || 'black';
    activityDomObject.style.strokeWidth = 1.5;

  });

  const allCanvasObjects = getAllCanvasObjects();

  allCanvasObjects.forEach(canvasObject =>{

    const sourceDomObject = document.querySelector(
      '[data-element-id=' + canvasObject.id + ']'
    ).getElementsByTagName('g')[0].getElementsByTagName('svg')[0];

    if (sourceDomObject && sourceDomObject.tagName == 'svg') {
      console.log(sourceDomObject, sourceDomObject.tagName);
      sourceDomObject.style.stroke = 'unset';
    }

  });
}

function hightlightStep(step) {
  const highlightColour = '#42aebb';

  step.activities.forEach(activity => {
    const activityDomObject = document.querySelector(
      '[data-element-id=' + activity.id + ']'
    ).getElementsByTagName('polyline')[0];

    activityDomObject.style.stroke = highlightColour;
    activityDomObject.style.strokeWidth = 3;
  });

  const sourceDomObject = document.querySelector(
    '[data-element-id=' + step.source.id + ']'
  ).getElementsByTagName('svg')[0];

  sourceDomObject.style.stroke = highlightColour;

  step.targets.forEach(target => {
    const targetDomObject = document.querySelector(
      '[data-element-id=' + target.id + ']'
    ).getElementsByTagName('svg')[0];

    targetDomObject.style.stroke = highlightColour;
  });
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

  removeSelectionAndEditing();

  const contextPadElements = document.getElementsByClassName('djs-context-pad');
  const paletteElements = document.getElementsByClassName('djs-palette');

  const infoContainer = document.getElementById('infoContainer');
  infoContainer.style.display = 'none';

  const editModeButtons = document.getElementById('editModeButtons');
  editModeButtons.style.display = 'none';
  editModeButtons.style.pointerEvents = 'none';

  const presentationModeButtons = document.getElementById(
    'presentationModeButtons'
  );
  presentationModeButtons.style.display = 'block';
  presentationModeButtons.style.pointerEvents = 'all';

  const headerAndCanvas = document.getElementsByClassName('headerAndCanvas')[0];
  headerAndCanvas.style.gridTemplateRows = '0px 50px 1px auto';

  const headlineAndButtons = document.getElementById('headlineAndButtons');
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

function removeSelectionAndEditing() {
  selection.select([]);
  const directEditingBoxes = document.getElementsByClassName('djs-direct-editing-parent');

  if (directEditingBoxes.length > 0) {
    const directEditing = directEditingBoxes[0];
    directEditing.parentElement.removeChild(directEditing);
  }
}

function editMode() {
  removeHighlights();

  const contextPadElements = document.getElementsByClassName('djs-context-pad');
  const paletteElements = document.getElementsByClassName('djs-palette');

  const infoContainer = document.getElementById('infoContainer');
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
  headerAndCanvas.style.gridTemplateRows = '0px 125px 1px auto';

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

  const shownElements = getAllShown(stepsUntilNow);

  const notShownElements = getAllNotShown(allObjects, shownElements);

  removeHighlights();
  hightlightStep(replaySteps[currentStep]);

  // hide all elements, that are not to be shown
  notShownElements.forEach(element => {
    const domObject = document.querySelector(
      '[data-element-id=' + element.id + ']'
    );
    domObject.style.display = 'none';
  });

  shownElements.forEach(element => {
    const domObject = document.querySelector(
      '[data-element-id=' + element.id + ']'
    );
    domObject.style.display = 'block';
  });

  // if (currentStepNotInView()) {
  //   focusOnActiveActivity();
  // }
}

/*
function currentStepNotInView() {
  const currentViewbox = canvas.viewbox();

  const step = replaySteps[currentStep];

  let elements = [];
  step.targets.forEach(target => {
    elements.push(target);
  });

  let initialElement = step.source;
  let stepBounds = {
    x: initialElement.x,
    y: initialElement.y,
    width: initialElement.width,
    height: initialElement.height
  };
  elements.forEach(element => {
    if (element.x < stepBounds.x) {
      stepBounds.x = element.x;
    } else {
      if (stepBounds.width < element.x + element.width) {
        stepBounds.width = element.x + element.width;
      }
    }
    if (element.y < stepBounds.y) {
      stepBounds.y = element.y;
    } else {
      if (stepBounds.height < element.y + element.height) {
        stepBounds.height = element.y + element.height;
      }
    }
  });

  if (currentViewbox.x < stepBounds.x && currentViewbox.y < stepBounds.y) {
    if (
      currentViewbox.x + currentViewbox.width >
      stepBounds.x + stepBounds.width
    ) {
      if (
        currentViewbox.y + currentViewbox.height >
        stepBounds.y + stepBounds.height
      ) {
        return false;
      }
    }
  }
  return true;
}

function focusOnActiveActivity() {
  const step = replaySteps[currentStep];
  const activitiesInStep = step.activities;
  const activityToFocusOn = activitiesInStep[0];
  const elX = activityToFocusOn.waypoints[0].x - initialViewbox.width / 2;
  const elY = activityToFocusOn.waypoints[0].y - initialViewbox.height / 2;
  let stepViewbox = {
    x: elX,
    y: elY,
    height: initialViewbox.height,
    width: initialViewbox.width,
    scale: initialViewbox.scale,
    outer: initialViewbox.outer,
    inner: initialViewbox.inner
  };

  canvas.viewbox(stepViewbox);
}
*/
