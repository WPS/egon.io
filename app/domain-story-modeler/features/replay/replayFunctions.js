import { getAllActivities, getAllCanvasObjects, getAllConnections, getAllGroups } from '../../language/canvasElementRegistry';
import { CONNECTION, GROUP } from '../../language/elementTypes';

let currentReplayStepLabel = document.getElementById('replayStep');

export function showCurrentStep(currentStep, replaySteps, canvas) {
  let stepsUntilNow = [];
  let allObjects = [];
  let i = 0;

  currentReplayStepLabel.innerText =
      currentStep + 1 + ' / ' + replaySteps.length;

  for (i = 0; i <= currentStep; i++) {
    stepsUntilNow.push(replaySteps[i]);
  }

  allObjects = getAllCanvasObjects(canvas);
  getAllGroups().forEach(group => {
    allObjects.push(group);
  });

  let shownElements = getAllShown(stepsUntilNow);

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
}

function getAllShown(stepsUntilNow) {
  let shownElements = [];

  // for each step until the current one, add all referenced elements to the list of shown elements
  stepsUntilNow.forEach(step => {
    if (step.groups && step.groups.length > 0) {
      step.groups.forEach(group => {
        shownElements.push(group);
      });
    } else {

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
    }
  });

  return shownElements;
}

function hightlightStep(step) {
  const highlightColour = 'black';
  const numberBackgroundHighlightColour = 'orange';
  const numberHighlightColour = 'black';

  if (!step.groups) {

    step.activities.forEach(activity => {
      const activityDomObject = document.querySelector(
        '[data-element-id=' + activity.id + ']'
      ).getElementsByTagName('polyline')[0];

      activityDomObject.style.stroke = highlightColour;
      activityDomObject.style.strokeWidth = 4;

      const { numberBackgroundDom, numberTextDom } = getNumberDomForActivity(activityDomObject);
      if (numberTextDom && numberBackgroundDom) {
        numberBackgroundDom.style.fill = numberBackgroundHighlightColour;
        numberTextDom.style.fill = numberHighlightColour;
      }

    });
  }
}

// get all elements, that are supposed to be hidden in the current step
function getAllNotShown(allObjects, shownElements) {
  let notShownElements = [];

  // every element that is not referenced in shownElements
  // and is neither a group (since they are not refeenced in allObjects),
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
export function presentationMode(selected) {

  removeSelectionAndEditing(selected);

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

export function editMode() {
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

function removeSelectionAndEditing(selected) {
  selected.select([]);
  const directEditingBoxes = document.getElementsByClassName('djs-direct-editing-parent');

  if (directEditingBoxes.length > 0) {
    const directEditing = directEditingBoxes[0];
    directEditing.parentElement.removeChild(directEditing);
  }
}

function removeHighlights() {
  const numberBackgroundColour = '#42aebb';
  const numberColour = 'white';

  const allActivities = getAllActivities();
  const allConnections = getAllConnections();

  allActivities.forEach(activity => {
    const activityDomObject = document.querySelector(
      '[data-element-id=' + activity.id + ']'
    ).getElementsByTagName('polyline')[0];

    activityDomObject.style.stroke = activity.businessObject.pickedColor || 'black';
    activityDomObject.style.strokeWidth = 1.5;

    const { numberBackgroundDom, numberTextDom } = getNumberDomForActivity(activityDomObject);
    if (numberBackgroundDom && numberTextDom) {
      numberBackgroundDom.style.fill = numberBackgroundColour;
      numberTextDom.style.fill = numberColour;
    }

  });

  allConnections.forEach(connnection => {
    const connectionDomObject = document.querySelector(
      '[data-element-id=' + connnection.id + ']'
    ).getElementsByTagName('polyline')[0];

    connectionDomObject.style.stroke = connnection.businessObject.pickedColor || 'black';
    connectionDomObject.style.strokeWidth = 1.5;

  });
}

function getNumberDomForActivity(activity) {
  const numberDOMS = activity.parentElement.getElementsByClassName('djs-labelNumber');
  return {
    numberBackgroundDom: numberDOMS[0],
    numberTextDom: numberDOMS[1]
  };
}
