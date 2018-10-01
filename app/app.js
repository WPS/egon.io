'use strict';

import $ from 'jquery';

import DomainStoryModeler from './domain-story-modeler';

import SearchPad from '../node_modules/diagram-js/lib/features/search-pad/SearchPad';

import DomainStoryActivityHandlers from './domain-story-modeler/domain-story/handlers/DomainStoryActivityHandlers';

import DomainStoryLabelChangeHandlers from './domain-story-modeler/domain-story/handlers/DomainStoryLabelChangeHandlers';

import sanitize from './domain-story-modeler/domain-story/util/Sanitizer';

import {
  setStash,
  setLabelStash,
  getWorkobjectDictionary
} from './domain-story-modeler/domain-story/label-editing/DSLabelEditingProvider';

import {
  traceActivities,
  isStoryConsecutivelyNumbered,
  getAllNotShown,
  getAllShown
} from './domain-story-modeler/domain-story/replay/ReplayUtil';

import {
  getActivitesFromActors,
  updateExistingNumbersAtEditing
} from './domain-story-modeler/domain-story/util/DSActivityUtil';

import { version } from '../package.json';

import {
  checkInput,
  keyReleased,
  getAllObjectsFromCanvas,
  debounce,
  openDictionary
} from './domain-story-modeler/domain-story/util/AppUtil';

import {
  getActivityDictionary,
  setActivityDictionary,
  cleanActicityDictionary,
  autocomplete
} from './domain-story-modeler/domain-story/util/DSUtil';

var modeler = new DomainStoryModeler({
  container: '#canvas',
  keyboard: {
    bindTo: document
  }
});

var canvas = modeler.get('canvas');
var eventBus = modeler.get('eventBus');
var commandStack = modeler.get('commandStack');
var elementRegistry = modeler.get('elementRegistry');

// we need to initiate the activity commandStack elements
DomainStoryActivityHandlers(commandStack, eventBus, canvas);
DomainStoryLabelChangeHandlers(commandStack, eventBus, canvas);

// disable BPMN SearchPad
SearchPad.prototype.toggle=function() { };

modeler.createDiagram();
// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;

// HTML-Elements

var modal = document.getElementById('modal'),
    arrow = document.getElementById('arrow'),
    // Logos
    wpsLogo = document.getElementById('imgWPS'),
    dstLogo = document.getElementById('imgDST'),
    // Text-elements
    wpsInfotext = document.getElementById('wpsLogoInnerText'),
    wpsInfotextPart2 = document.getElementById('wpsLogoInnerText2'),
    dstInfotext = document.getElementById('dstLogoInnerText'),
    // Labels
    headline = document.getElementById('headline'),
    title = document.getElementById('title'),
    info = document.getElementById('info'),
    infoText = document.getElementById('infoText'),
    importedVersionLabel = document.getElementById('importedVersion'),
    modelerVersionLabel = document.getElementById('modelerVersion'),
    currentReplayStepLabel = document.getElementById('replayStep'),
    // Inputs
    titleInput = document.getElementById('titleInput'),
    titleInputLast = '',
    descriptionInputLast = '',
    activityInputNumber = document.getElementById('inputNumber'),
    activityInputLabelWithNumber = document.getElementById('inputLabel'),
    activityInputLabelWithoutNumber = document.getElementById('labelInputLabel'),
    // Dialogs
    headlineDialog = document.getElementById('dialog'),
    activityWithNumberDialog = document.getElementById('numberDialog'),
    activityWithoutNumberDialog = document.getElementById('labelDialog'),
    versionDialog = document.getElementById('versionDialog'),
    incompleteStoryDialog = document.getElementById('incompleteStoryInfo'),
    wpsLogoDialog = document.getElementById('wpsLogoInfo'),
    dstLogoDialog = document.getElementById('dstLogoInfo'),
    dictionaryDialog = document.getElementById('dictionary'),
    // Container
    activityDictionaryContainer = document.getElementById('activityDictionaryContainer'),
    workobjectDictionaryContainer = document.getElementById('workobjectDictionaryContainer'),
    importExportSVGButtonsContainer = document.getElementById('importExportSVGButton'),
    // Buttons
    headlineDialogButtonSave = document.getElementById('saveButton'),
    headlineDialogButtonCancel = document.getElementById('quitButton'),
    exportButton = document.getElementById('export'),
    startReplayButton = document.getElementById('buttonStartReplay'),
    nextStepButton = document.getElementById('buttonNextStep'),
    previousStepButton = document.getElementById('buttonPreviousStep'),
    stopReplayButton = document.getElementById('buttonStopReplay'),
    dictionaryButtonOpen = document.getElementById('dictionaryButton'),
    dictionaryButtonSave = document.getElementById('closeDictionaryButtonSave'),
    dictionaryButtonCancel = document.getElementById('closeDictionaryButtonCancel'),
    activityNumberDialogButtonSave = document.getElementById('numberSaveButton'),
    activityNumberDialogButtonCancel = document.getElementById('numberQuitButton'),
    activityLabelButtonSave = document.getElementById('labelSaveButton'),
    activityLabelButtonCancel = document.getElementById('labelQuitButton'),
    svgSaveButton = document.getElementById('buttonSVG'),
    wpsLogoButton = document.getElementById('closeWPSLogoInfo'),
    dstLogoButton = document.getElementById('closeDSTLogoInfo'),
    incompleteStoryDialogButtonCancel = document.getElementById('closeIncompleteStoryInfo'),
    versionDialogButtonCanvel = document.getElementById('closeVersionDialog');

// interal variables
var keysPressed = [];
var svgData;
var replayOn = false;
var currentStep = 0;
var replaySteps = [];

// eventBus listeners

eventBus.on('element.dblclick', function(e) {
  if (!replayOn) {
    var element = e.element;
    if (element.type == 'domainStory:activity') {
      var source = element.source;

      var dict = getActivityDictionary();
      autocomplete(activityInputLabelWithNumber, dict, element);
      autocomplete(activityInputLabelWithoutNumber, dict, element);

      // ensure the right number when changing the direction of an activity
      setStash(false);

      if (source.type.includes('domainStory:actor')) {
        showActivityWithNumberDialog(element);
        document.getElementById('inputLabel').focus();
      }
      else if (source.type.includes('domainStory:workObject')) {
        showActivityWithoutLabelDialog(element);
        document.getElementById('labelInputLabel').focus();
      }

      // onclick and key functions, that need the element to which the event belongs
      activityLabelButtonSave.onclick = function() {
        saveActivityInputLabelWithoutNumber(element);
      };

      activityNumberDialogButtonSave.onclick = function() {
        saveActivityInputLabelWithNumber(element);
      };

      activityInputLabelWithoutNumber.onkeydown = function(e) {
        checkInput(activityInputLabelWithoutNumber);
        checkPressedKeys(e.keyCode, 'labelDialog', element);
      };

      activityInputNumber.onkeydown = function(e) {
        checkInput(activityInputNumber);
        checkPressedKeys(e.keyCode, 'numberDialog', element);
      };

      activityInputLabelWithNumber.onkeydown = function(e) {
        checkInput(activityInputLabelWithNumber);
        checkPressedKeys(e.keyCode, 'numberDialog', element);
      };
    }
  }
});

// when in replay, do not allow any interaction on the canvas
eventBus.on([
  'element.click',
  'element.dblclick',
  'element.mousedown',
  'drag.init',
  'canvas.viewbox.changing',
  'autoPlace',
  'popupMenu.open'
], 10000000000, function(event) {
  if (replayOn) {
    event.stopPropagation();
    event.preventDefault();
  }
});

// ----

wpsInfotext.innerText = 'Domain Story Modeler v' + version + '\nA tool to visualize Domain Stories in the browser.\nProvided by';
wpsInfotextPart2.innerText = ' and licensed under GPLv3.';
dstInfotext.innerText = 'Learn more about Domain Storytelling at';

// HTML-Element event listeners

headline.addEventListener('click', function() {
  showDialog();
});

wpsLogo.addEventListener('click', function() {
  modal.style.display = 'block';
  wpsLogoDialog.style.display = 'block';
});

dstLogo.addEventListener('click', function() {
  modal.style.display = 'block';
  dstLogoDialog.style.display = 'block';
});

wpsLogoButton.addEventListener('click', function() {
  wpsLogoDialog.style.display = 'none';
  modal.style.display = 'none';
});

dstLogoButton.addEventListener('click', function() {
  dstLogoDialog.style.display = 'none';
  modal.style.display = 'none';
});

headlineDialogButtonSave.addEventListener('click', function() {
  saveDialog();
});

headlineDialogButtonCancel.addEventListener('click', function() {
  closeDialog();
});

activityNumberDialogButtonCancel.addEventListener('click', function() {
  closeActivityInputLabelWithNumber();
});

activityLabelButtonCancel.addEventListener('click', function() {
  closeActivityInputLabelWithoutNumber();
});

titleInput.addEventListener('keydown', function(e) {
  checkPressedKeys(e.keyCode, 'titleDialog');
  checkInput(titleInput);
});

titleInput.addEventListener('keyup', function(e) {
  checkInput(titleInput);
  keyReleased(keysPressed, e.keyCode);
});

info.addEventListener('keydown', function(e) {
  checkPressedKeys(e.keyCode, 'infoDialog');
  checkInput(info);
});

info.addEventListener('keyup', function(e) {
  checkInput(info);
  keyReleased(keysPressed, e.keyCode);
});

activityInputLabelWithoutNumber.addEventListener('keyup', function() {
  checkInput(activityInputLabelWithoutNumber);
});

activityInputLabelWithNumber.addEventListener('keyup', function(e) {
  keyReleased(keysPressed, e.keyCode);
  checkInput(activityInputLabelWithNumber);
});

dictionaryButtonOpen.addEventListener('click', function() {
  openDictionary(canvas);
});

dictionaryButtonSave.addEventListener('click', function(e) {
  dictionrayClosed();

  dictionaryDialog.style.display='none';
  modal.style.display='none';
});

dictionaryButtonCancel.addEventListener('click', function(e) {
  dictionaryDialog.style.display='none';
  modal.style.display='none';
});

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

exportButton.addEventListener('click', function() {
  var object = modeler.getCustomElements();
  var text = info.innerText;
  var newObject = object.slice(0);

  newObject.push({ info: text });
  newObject.push({ version: version });
  var json = JSON.stringify(newObject);
  var filename = title.innerText + '_' + new Date().toISOString().slice(0, 10);

  // start file download
  download(filename, json);
});

svgSaveButton.addEventListener('click', function() {
  var filename = title.innerText + '_' + new Date().toISOString().slice(0, 10);
  downloadSVG(filename);
});

incompleteStoryDialogButtonCancel.addEventListener('click', function() {
  modal.style.display = 'none';
  incompleteStoryDialog.style.display = 'none';
});

versionDialogButtonCanvel.addEventListener('click', function() {
  modal.style.display = 'none';
  versionDialog.style.display = 'none';
});

// -----

document.getElementById('import').onchange = function() {

  var input = document.getElementById('import').files[0];
  var reader = new FileReader();
  if (input.name.endsWith('.dst')) {
    var titleText = input.name.replace(/_\d+-\d+-\d+( ?_?\(\d+\))?.dst/, '');
    titleText = sanitize(titleText);
    titleInput.value = titleText;
    title.innerText = titleText;
    titleInputLast = titleInput.value;

    reader.onloadend = function(e) {
      var text = e.target.result;

      var elements = JSON.parse(text);
      var lastElement = elements.pop();

      var importVersionNumber = lastElement;
      if (lastElement.version) {
        lastElement = elements.pop();
      }

      if (importVersionNumber.version) {
        importVersionNumber = importVersionNumber.version;
      } else {
        importVersionNumber = '?';
      }

      if (version != importVersionNumber) {
        importedVersionLabel.innerText = 'v' + importVersionNumber;
        modelerVersionLabel.innerText = 'v' + version;
        showVersionDialog();
      }

      var inputInfoText = sanitize(lastElement.info ? lastElement.info : '');
      info.innerText = inputInfoText;
      info.value = inputInfoText;
      descriptionInputLast = info.value;
      infoText.innerText = inputInfoText;

      modeler.importCustomElements(elements);
      cleanActicityDictionary(canvas);
      setLabelStash(canvas);
    };

    reader.readAsText(input);

    // to update the title of the svg, we need to tell the command stack, that a value has changed
    var exportArtifacts = debounce(function() {

      saveSVG(function(err, svg) {
        setEncoded(err ? null : svg);
      });
    }, 500);

    eventBus.fire('commandStack.changed', exportArtifacts);
  }
};


function dictionrayClosed() {
  var oldActivityDictionary = getActivityDictionary();
  var oldWorkobjectDictionary = getWorkobjectDictionary();
  var activityNewNames = [];
  var workObjectNewNames = [];

  activityDictionaryContainer.childNodes.forEach(child=>{
    if (child.value) {
      activityNewNames[child.id] = child.value;
    }
  });

  workobjectDictionaryContainer.childNodes.forEach(child=>{
    if (child.value) {
      workObjectNewNames[child.id] = child.value;
    }
  });

  if (activityNewNames.length == oldActivityDictionary.length && workObjectNewNames.length==oldWorkobjectDictionary.length) {
    dictionaryDifferences(activityNewNames, oldActivityDictionary, workObjectNewNames, oldWorkobjectDictionary);
  }
}

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename + '.dst');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function downloadSVG(filename) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + svgData);
  element.setAttribute('download', filename + '.svg');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

function checkPressedKeys(keyCode, dialog, element) {
  const KEY_ENTER = 13;
  const KEY_SHIFT = 16;
  const KEY_CTRL = 17;
  const KEY_ALT = 18;
  const KEY_ESC = 27;

  keysPressed[keyCode] = true;

  if (keysPressed[KEY_ESC]) {
    closeDialog();
    closeActivityInputLabelWithoutNumber();
    closeActivityInputLabelWithNumber();
  }
  else if ((keysPressed[KEY_CTRL] && keysPressed[KEY_ENTER]) || (keysPressed[KEY_ALT] && keysPressed[KEY_ENTER])) {
    if (dialog == 'infoDialog') {
      info.value += '\n';
    }
  }
  else if (keysPressed[KEY_ENTER] && !keysPressed[KEY_SHIFT]) {
    if (dialog == 'titleDialog' || dialog == 'infoDialog') {
      saveDialog();
    }
    else if (dialog == 'labelDialog') {
      saveActivityInputLabelWithoutNumber(element);
    }
    else if (dialog == 'numberDialog') {
      saveActivityInputLabelWithNumber(element);
    }
  }
}

function dictionaryDifferences(activityNames, oldActivityDictionary, workObjectNames, oldWorkobjectDictionary) {
  var i=0;
  for (i=0;i<oldActivityDictionary.length;i++) {
    if (!activityNames[i]) {
      activityNames[i]='';
    }
    if (!((activityNames[i].includes(oldActivityDictionary[i])) && (oldActivityDictionary[i].includes(activityNames[i])))) {
      massChangeNames(oldActivityDictionary[i], activityNames[i], 'domainStory:activity');
    }
  }
  for (i=0;i<oldWorkobjectDictionary.length;i++) {
    if (!workObjectNames[i]) {
      workObjectNames[i]='';
    }
    if (!((workObjectNames[i].includes(oldWorkobjectDictionary[i])) && (oldWorkobjectDictionary[i].includes(workObjectNames[i])))) {
      massChangeNames(oldWorkobjectDictionary[i], workObjectNames[i], 'domainStory:workObject');
    }
  }
  // delete old entires from stashes
}

function massChangeNames(oldValue, newValue, type) {
  var allObjects = getAllObjectsFromCanvas(canvas);
  var allRelevantObjects=[];

  allObjects.forEach(element =>{
    if (element.type.includes(type) && element.businessObject.name == oldValue) {
      allRelevantObjects.push(element);
    }
  });

  var context = {
    elements: allRelevantObjects,
    newValue: newValue
  };

  commandStack.execute('domainStoryObjects.massRename', context);
}

// dialog functions

function showVersionDialog() {
  versionDialog.style.display = 'block';
  modal.style.display = 'block';
}

function closeDialog() {
  keysPressed = [];
  headlineDialog.style.display = 'none';
  modal.style.display = 'none';
  arrow.style.display = 'none';
}

function showDialog() {
  info.value = descriptionInputLast;
  titleInput.value = titleInputLast;
  headlineDialog.style.display = 'block';
  modal.style.display = 'block';
  arrow.style.display = 'block';
  titleInput.focus();
}

function saveDialog() {
  var inputTitle = titleInput.value;
  var inputText = info.value;
  if (inputTitle !== '') {
    title.innerText = sanitize(inputTitle);
  }
  else {
    title.innerText = '<name of this Domain Story>';
  }
  inputText = sanitize(inputText);
  info.innerText = inputText;
  infoText.innerText = inputText;

  titleInputLast = inputTitle;
  descriptionInputLast = inputText;

  // to update the title of the svg, we need to tell the command stack, that a value has changed
  var exportArtifacts = debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded(err ? null : svg);
    });
  }, 500);

  eventBus.fire('commandStack.changed', exportArtifacts);

  keysPressed = [];
  closeDialog();
}

function showActivityWithNumberDialog(event) {
  modal.style.display = 'block';
  activityWithNumberDialog.style.display = 'block';
  activityInputLabelWithNumber.value = '';
  activityInputNumber.value = '';

  if (event.businessObject.name != null) {
    activityInputLabelWithNumber.value = event.businessObject.name;
  }
  if (event.businessObject.number != null) {
    activityInputNumber.value = event.businessObject.number;
  }
}

function showActivityWithoutLabelDialog(event) {
  modal.style.display = 'block';
  activityWithoutNumberDialog.style.display = 'block';
  activityInputLabelWithoutNumber.value = '';

  if (event.businessObject.name != null) {
    activityInputLabelWithoutNumber.value = event.businessObject.name;
  }
}

function closeActivityInputLabelWithNumber() {
  activityInputLabelWithNumber.value = '';
  activityInputNumber.value = '';
  keysPressed = [];
  activityWithNumberDialog.style.display = 'none';
  modal.style.display = 'none';
}

function saveActivityInputLabelWithNumber(element) {
  var labelInput = '';
  var numberInput = '';
  var activityDictionary = getActivityDictionary();
  if (activityInputLabelWithNumber != '') {
    labelInput = activityInputLabelWithNumber.value;
    if (!activityDictionary.includes(labelInput)) {
      activityDictionary.push(labelInput);
    }
  }
  if (activityInputNumber != '') {
    numberInput = activityInputNumber.value;
  }
  setActivityDictionary(activityDictionary);

  activityWithNumberDialog.style.display = 'none';
  modal.style.display = 'none';

  activityInputLabelWithNumber.value = '';
  activityInputNumber.value = '';
  keysPressed = [];

  var canvasObjects = canvas._rootElement.children;

  var activitiesFromActors = getActivitesFromActors(canvasObjects);

  var index = activitiesFromActors.indexOf(element);
  activitiesFromActors.splice(index, 1);

  commandStack.execute('activity.changed', {
    businessObject: element.businessObject,
    newLabel: labelInput,
    newNumber: numberInput,
    element: element
  });

  updateExistingNumbersAtEditing(activitiesFromActors, numberInput, eventBus);
  cleanActicityDictionary(canvas);
}

function closeActivityInputLabelWithoutNumber() {
  activityInputLabelWithoutNumber.value = '';
  keysPressed = [];
  activityWithoutNumberDialog.style.display = 'none';
  modal.style.display = 'none';
}

function saveActivityInputLabelWithoutNumber(element) {
  var labelInput = '';
  var activityDictionary = getActivityDictionary();
  if (activityInputLabelWithoutNumber != '') {
    labelInput = activityInputLabelWithoutNumber.value;
    if (!activityDictionary.includes(labelInput)) {
      activityDictionary.push(labelInput);
    }
  }

  setActivityDictionary(activityDictionary);

  activityWithoutNumberDialog.style.display = 'none';
  modal.style.display = 'none';

  activityInputLabelWithoutNumber.value = '';
  keysPressed = [];

  commandStack.execute('activity.changed', {
    businessObject: element.businessObject,
    newLabel: labelInput,
    element: element
  });
  cleanActicityDictionary(canvas);
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

// SVG download

function saveSVG(done) {
  modeler.saveSVG(done);
}

function setEncoded(data) {
  var indices = [];

  // in the svg-image, activities are represented as rectangles
  // to represent them as lines, we add a Fill: none characteristic
  // since only activities and annotation-conntections use markers
  // at their end, we check for their mentions to determine the
  // wanted text-position

  if (data.indexOf('marker-end: url(\'')) {
    indices[0] = data.indexOf('marker-end: url(\'');
  }

  var nextIndex = data.indexOf(indices[0], 'marker-end: url(\'');
  while (nextIndex > 0) {
    indices[indices.length] = nextIndex;
    nextIndex = data.indexOf(indices[data.length - 1], 'marker-end: url(\'');
  }

  for (var i = indices.length - 1; i >= 0; i--) {
    data = [data.slice(0, indices[i]), 'fill: none; ', data.slice(indices[i])].join('');
  }

  svgData = encodeURIComponent(data);
}

$(function() {
  var exportArtifacts = debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded(err ? null : svg);
    });
  }, 500);

  modeler.on('commandStack.changed', exportArtifacts);
});