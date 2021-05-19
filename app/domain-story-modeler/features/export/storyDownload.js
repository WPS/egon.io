'use strict';

import { sanitizeForDesktop } from '../../util/Sanitizer';
import { CONNECTION, GROUP } from '../../language/elementTypes';
import {
  getActivitesFromActors,
  getAllCanvasObjects,
  wasInitialized,
  getAllGroups,
  getAllActivities,
  getAllConnections
} from '../../language/canvasElementRegistry';
import { traceActivities } from '../replay/initializeReplay';
import doT from 'dot';

let canvas;
let selection;

let multiplexSecret;
let multiplexId;

let replayOn = false;
let currentStep = 0;
let replaySteps = [];
let initialViewbox;

let errorStep = 0;

let dsModeler;

let modal = document.getElementById('modal');
let currentReplayStepLabel = document.getElementById('replayStep');
let incompleteStoryDialog = document.getElementById('incompleteStoryInfo');

export function initStoryDownload(inCanvas, inSelection, modeler) {
  canvas = inCanvas;
  selection = inSelection;
  dsModeler = modeler;

  // cors.bridged.cc is a CORS ANYWHERE server. For details: https://blog.bridged.xyz/cors-anywhere-for-everyone-free-reliable-cors-proxy-service-73507192714e
  fetch('https://cors.bridged.cc/https://reveal-multiplex.glitch.me/token', { headers: { 'x-requested-with':'XMLHttpRequest' } }).then(res => res.json()).then((out) => {
    multiplexSecret=out.secret;
    multiplexId=out.socketId;
  }).catch(err => console.error(err));
}

export async function downloadStory(filename) {
  var svgData = [];
  currentStep = 0;

  // export all sentences of domain story
  startReplay();
  try {
    const result = await dsModeler.saveSVG({ });
    svgData.push({ content: createSVGData(result.svg), transition: 'slide' });
  } catch (err) {
    alert('There was an error exporting the SVG.\n' + err);
  }
  while (currentStep < replaySteps.length - 1) {
    nextStep();
    try {
      const result = await dsModeler.saveSVG({ });
      svgData.push({ content: createSVGData(result.svg), transition: 'slide' });
    } catch (err) {
      alert('There was an error exporting the SVG.\n' + err);
    }
  }
  stopReplay();

  // create download for presentation
  let revealjsTemplate = document.getElementById('revealjs-template');
  var dots = doT.template(revealjsTemplate.innerHTML);
  var revealjsData = { };
  revealjsData.script = 'script'; // don't change this!!
  revealjsData.title = document.getElementById('title').innerHTML;
  revealjsData.description = document.getElementById('infoText').innerHTML;
  revealjsData.sentences = svgData;
  revealjsData.multiplexSecret = multiplexSecret;
  revealjsData.multiplexId = multiplexId;
  let element;
  element = document.createElement('a');
  element.setAttribute(
    'href',
    'data:text/html;charset=UTF-8,' + dots(revealjsData)
  );
  element.setAttribute('download', sanitizeForDesktop(filename) + '.html');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function startReplay() {
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
}

function stopReplay() {
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
        allObjects.push(currentgroup);
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
}

function nextStep() {
  if (replayOn) {
    if (currentStep < replaySteps.length - 1) {
      currentStep += 1;
      showCurrentStep();
    }
  }
}

function isStoryConsecutivelyNumbered(replaySteps) {
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

function getNumberDomForActivity(activity) {
  const numberDOMS = activity.parentElement.getElementsByClassName('djs-labelNumber');
  return {
    numberBackgroundDom: numberDOMS[0],
    numberTextDom: numberDOMS[1]
  };
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

/*
---------------------------
SVG handling starts here
----------------------------
*/

function createSVGData(svg) {

  let data = JSON.parse(JSON.stringify(svg));

  // to ensure that the title and description are inside the SVG container and do not overlapp with any elements,
  // we change the confines of the SVG viewbox
  let viewBoxIndex = data.indexOf('width="');

  let viewBox = viewBoxCoordinates(data);

  let xLeft, xRight, yUp, yDown;
  let bounds = '';
  let splitViewBox = viewBox.split(/\s/);

  xLeft = +splitViewBox[0];
  yUp = +splitViewBox[1];
  xRight = +splitViewBox[2];
  yDown = +splitViewBox[3];

  if (xRight < 300) {
    xRight += 300;
  }

  bounds =
    'width="100%"' +
    ' height="auto" ' +
    ' preserveAspectRatio="xMidYMid meet"' +
    ' viewBox="' +
    xLeft +
    ' ' +
    yUp +
    ' ' +
    xRight +
    ' ' +
    (yDown + 30);
  let dataStart = data.substring(0, viewBoxIndex);
  viewBoxIndex = data.indexOf('" version');
  let dataEnd = data.substring(viewBoxIndex);
  dataEnd.substring(viewBoxIndex);

  data = dataStart + bounds + dataEnd;

  let insertIndex = data.indexOf('</defs>');
  if (insertIndex < 0) {
    insertIndex = data.indexOf('version="1.2">') + 14;
  } else {
    insertIndex += 7;
  }

  return encodeURIComponent(data);
}

function viewBoxCoordinates(svg) {
  const ViewBoxCoordinate = /width="([^"]+)"\s+height="([^"]+)"\s+viewBox="([^"]+)"/;
  const match = svg.match(ViewBoxCoordinate);
  return match[3];
}
