'use strict';

import { sanitizeForDesktop } from '../../util/Sanitizer';
import { GROUP } from '../../language/elementTypes';
import {
  getActivitesFromActors,
  wasInitialized,
} from '../../language/canvasElementRegistry';
import { traceActivities } from '../replay/initializeReplay';
import doT from 'dot';
import { editMode, presentationMode, showCurrentStep } from '../replay/replayFunctions';

let canvas;
let selection;

let replayOn = false;
let currentStep = 0;
let replaySteps = [];
let initialViewbox;

let errorStep = 0;

let dsModeler;

let modal = document.getElementById('modal');
let incompleteStoryDialog = document.getElementById('incompleteStoryInfo');

export function initStoryDownload(inCanvas, inSelection, modeler) {
  canvas = inCanvas;
  selection = inSelection;
  dsModeler = modeler;
}

export async function downloadStory(filename) {
  var svgData = [];
  currentStep = 0;

  // export all sentences of domain story
  startReplay();
  try {
    const result = await dsModeler.saveSVG({ });
    fixSvgDefinitions(result, currentStep);

    svgData.push({ content: createSVGData(result.svg), transition: 'slide' });
  } catch (err) {
    alert('There was an error exporting the SVG.\n' + err);
  }
  while (currentStep < replaySteps.length - 1) {
    nextStep();
    try {
      const result = await dsModeler.saveSVG({ });
      fixSvgDefinitions(result, currentStep);
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
        presentationMode(selection);
        currentStep = 0;
        showCurrentStep(currentStep, replaySteps, canvas);
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
    let canvasObjects = canvas._activePlane._rootElement.children;
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
      showCurrentStep(currentStep, replaySteps, canvas);
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

  let xLeft, width, yUp, height;
  let bounds = '';
  let splitViewBox = viewBox.split(/\s/);

  xLeft = +splitViewBox[0];
  yUp = +splitViewBox[1];
  width = +splitViewBox[2];
  height = +splitViewBox[3];

  if (width < 300) {
    width += 300;
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
    (xLeft + width) +
    ' ' +
    (yUp + height);
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


function fixSvgDefinitions(result, sectionIndex) {
  let defs = result.svg.substring(result.svg.indexOf('<defs>'), result.svg.indexOf('</defs>') + 7);
  const split = defs.split('<marker ');

  let newDefs = split[0];

  for (let i = 1; i < split.length; i++) {
    const ids = split[i].match(/(id="[^"]*")/g);
    ids.forEach(id => {
      let idToReplace = id.substring(4, id.length-1);
      let newId = idToReplace.slice(0, id.length-5) + 'customId' + sectionIndex + idToReplace.slice(idToReplace.length-2);
      result.svg = result.svg.replaceAll(idToReplace, newId);
    });
    newDefs += ('<marker display= "block !important"; ' + split[i]);
  }

  result.svg = result.svg.replace(defs, newDefs);
}