'use strict';

import $ from 'jquery';

import './domain-story-modeler/util/MathExtensions';

import DomainStoryModeler from './domain-story-modeler';

import SearchPad from '../node_modules/diagram-js/lib/features/search-pad/SearchPad';

import DSActivityHandlers from './domain-story-modeler/modeler/DSActivityHandlers';

import sanitize from './domain-story-modeler/util/Sanitizer';

import { toggleStashUse } from './domain-story-modeler/features/labeling/DSLabelEditingProvider';

import { version } from '../package.json';

import DSMassRenameHandlers from './domain-story-modeler/features/dictionary/DSMassRenameHandlers';

import { getActivityDictionary, cleanDictionaries, getWorkObjectDictionary, openDictionary } from './domain-story-modeler/features/dictionary/dictionary';

import { isPlaying, initReplay } from './domain-story-modeler/features/replay/replay';

import { autocomplete } from './domain-story-modeler/features/labeling/DSLabelUtil';

import { updateExistingNumbersAtEditing } from './domain-story-modeler/features/numbering/numbering';

import {
  correctGroupChildren,
  getAllObjectsFromCanvas,
  getActivitesFromActors,
  updateCustomElementsPreviousv050
} from './domain-story-modeler/util/CanvasObjects';
import { allInWorkObjectRegistry, registerWorkObjects } from './domain-story-modeler/language/workObjectRegistry';
import { allInActorRegistry, registerActors } from './domain-story-modeler/language/actorRegistry';
import { ACTIVITY, ACTOR, WORKOBJECT, DOMAINSTORY, CONNECTION } from './domain-story-modeler/language/elementTypes';
import { download, downloadSVG, downloadPNG, setEncoded } from './domain-story-modeler/features/export/download';

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
DSActivityHandlers(commandStack, eventBus, canvas);
DSMassRenameHandlers(commandStack, eventBus, canvas);

initReplay(canvas, elementRegistry);

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
    brokenDSTDialog = document.getElementById('brokenDSTDialog'),
    versionDialog = document.getElementById('versionDialog'),
    incompleteStoryDialog = document.getElementById('incompleteStoryInfo'),
    wpsLogoDialog = document.getElementById('wpsLogoInfo'),
    dstLogoDialog = document.getElementById('dstLogoInfo'),
    dictionaryDialog = document.getElementById('dictionary'),
    keyboardShortcutInfoDialog = document.getElementById('keyboardShortcutInfoDialog'),
    downloadDialog = document.getElementById('downloadDialog'),
    // Container
    activityDictionaryContainer = document.getElementById('activityDictionaryContainer'),
    workobjectDictionaryContainer = document.getElementById('workobjectDictionaryContainer'),
    // Buttons
    headlineDialogButtonSave = document.getElementById('saveButton'),
    headlineDialogButtonCancel = document.getElementById('quitButton'),
    exportButton = document.getElementById('export'),
    dictionaryButtonOpen = document.getElementById('dictionaryButton'),
    dictionaryButtonSave = document.getElementById('closeDictionaryButtonSave'),
    dictionaryButtonCancel = document.getElementById('closeDictionaryButtonCancel'),
    brokenDSTDialogButtonCancel = document.getElementById('brokenDSTDialogButtonCancel'),
    activityNumberDialogButtonSave = document.getElementById('numberSaveButton'),
    activityNumberDialogButtonCancel = document.getElementById('numberQuitButton'),
    activityLabelButtonSave = document.getElementById('labelSaveButton'),
    activityLabelButtonCancel = document.getElementById('labelQuitButton'),
    buttonImageDownloads = document.getElementById('buttonImageDownloads'),
    buttonImageDownloadsCancel = document.getElementById('downloadDialogCancelButton'),
    pngSaveButton = document.getElementById('buttonPNG'),
    svgSaveButton = document.getElementById('buttonSVG'),
    wpsLogoButton = document.getElementById('closeWPSLogoInfo'),
    dstLogoButton = document.getElementById('closeDSTLogoInfo'),
    keyboardShortcutInfoButton = document.getElementById('keyboardShortcutInfoButton'),
    keyboardShortcutInfoButtonCancel = document.getElementById('keyboardShortcutInfoDialogButtonCancel'),
    incompleteStoryDialogButtonCancel = document.getElementById('closeIncompleteStoryInfo'),
    versionDialogButtonCancel = document.getElementById('closeVersionDialog');

// interal variables
var keysPressed = [];

// eventBus listeners

eventBus.on('element.dblclick', function(e) {
  if (!isPlaying()) {
    var element = e.element;
    if (element.type == ACTIVITY) {
      var source = element.source;

      var dict = getActivityDictionary();
      autocomplete(activityInputLabelWithNumber, dict, element);
      autocomplete(activityInputLabelWithoutNumber, dict, element);

      // ensure the right number when changing the direction of an activity
      toggleStashUse(false);

      if (source.type.includes(ACTOR)) {
        showActivityWithNumberDialog(element);
        document.getElementById('inputLabel').focus();
      }
      else if (source.type.includes(WORKOBJECT)) {
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
  if (isPlaying()) {
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

buttonImageDownloads.addEventListener('click', function() {
  downloadDialog.style.display = 'block';
  modal.style.display = 'block';
});

headlineDialogButtonSave.addEventListener('click', function() {
  saveDialog();
});

headlineDialogButtonCancel.addEventListener('click', function() {
  closeDialog();
});

buttonImageDownloadsCancel.addEventListener('click', function() {
  closeImageDownloadDialog();
});

activityNumberDialogButtonCancel.addEventListener('click', function() {
  closeActivityInputLabelWithNumber();
});

keyboardShortcutInfoButtonCancel.addEventListener('click', function() {
  closeKeyboardShortcutDialog();
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

activityDictionaryContainer.addEventListener('keydown', function(e) {
  dictionaryKeyBehaviour(e);
});

workobjectDictionaryContainer.addEventListener('keydown', function(e) {
  dictionaryKeyBehaviour(e);
});

dictionaryButtonOpen.addEventListener('click', function() {
  openDictionary(canvas);
});

dictionaryButtonSave.addEventListener('click', function(e) {
  dictionaryClosed();

  dictionaryDialog.style.display='none';
  modal.style.display='none';
});

dictionaryButtonCancel.addEventListener('click', function(e) {
  dictionaryDialog.style.display='none';
  modal.style.display='none';
});

brokenDSTDialogButtonCancel.addEventListener('click', function() {
  closeBrokenDSTDialog();
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
  closeImageDownloadDialog();
});

pngSaveButton.addEventListener('click', function() {
  downloadPNG();
  closeImageDownloadDialog();
});

incompleteStoryDialogButtonCancel.addEventListener('click', function() {
  modal.style.display = 'none';
  incompleteStoryDialog.style.display = 'none';
});

versionDialogButtonCancel.addEventListener('click', function() {
  modal.style.display = 'none';
  versionDialog.style.display = 'none';
});

keyboardShortcutInfoButton.addEventListener('click', function() {
  modal.style.display = 'block';
  keyboardShortcutInfoDialog.style.display = 'block';
});

// -----

document.getElementById('import').onchange = function() {

  var input = document.getElementById('import').files[0];
  var reader = new FileReader();
  if (input.name.endsWith('.dst')) {
    var titleText = input.name.replace(/_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?.dst/, '');
    if (titleText.includes('.dst')) {
      titleText = titleText.replace('.dst','');
    }
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
        elements = updateCustomElementsPreviousv050(elements);
      }

      var allReferences = checkElementReferencesAndRepair(elements);

      if (!allReferences) {
        showBrokenDSTDialog();
      }

      updateRegistries(elements);

      var inputInfoText = sanitize(lastElement.info ? lastElement.info : '');
      info.innerText = inputInfoText;
      info.value = inputInfoText;
      descriptionInputLast = info.value;
      infoText.innerText = inputInfoText;

      modeler.importCustomElements(elements);
      cleanDictionaries(canvas);
      correctGroupChildren(canvas);
    };

    reader.readAsText(input);

    // to update the title of the svg, we need to tell the command stack, that a value has changed
    var exportArtifacts = debounce(fnDebounce, 500);

    eventBus.fire('commandStack.changed', exportArtifacts);
  }
};

function checkElementReferencesAndRepair(elements) {
  var activities = [];
  var objectIDs = [];

  var complete = true;

  elements.forEach(element => {
    var type = element.type;
    if (type == ACTIVITY || type == CONNECTION) {
      activities.push(element);
    } else {
      objectIDs.push(element.id);
    }
  });

  activities.forEach(activity => {
    var source = activity.source;
    var target = activity.target;
    if (!objectIDs.includes(source) || !objectIDs.includes(target)) {
      complete = false;
      var activityIndex = elements.indexOf(activity);
      elements = elements.splice(activityIndex,1);
    }
  });
  return complete;
}

function updateRegistries(elements) {
  var actors = getElementsOfType(elements, 'actor');
  var workObjects = getElementsOfType(elements, 'workObject');

  if (!allInActorRegistry(actors)) {
    registerActors(actors);
  }
  if (!allInWorkObjectRegistry(workObjects)) {
    registerWorkObjects(workObjects);
  }
}

function getElementsOfType(elements, type) {
  var elementOfType =[];
  elements.forEach(element => {
    if (element.type.includes(DOMAINSTORY + type)) {
      elementOfType.push(element);
    }
  });
  return elementOfType;
}

function dictionaryKeyBehaviour(event) {
  const KEY_ENTER = 13;
  const KEY_ESC = 27;

  if (event.keyCode == KEY_ENTER) {
    dictionaryClosed();
    dictionaryDialog.style.display='none';
    modal.style.display='none';
  }
  else if (event.keyCode == KEY_ESC) {
    dictionaryDialog.style.display='none';
    modal.style.display='none';
  }
}

function dictionaryClosed() {
  var oldActivityDictionary = getActivityDictionary();
  var oldWorkobjectDictionary = getWorkObjectDictionary();
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
      massChangeNames(oldActivityDictionary[i], activityNames[i], ACTIVITY);
    }
  }
  for (i=0;i<oldWorkobjectDictionary.length;i++) {
    if (!workObjectNames[i]) {
      workObjectNames[i]='';
    }
    if (!((workObjectNames[i].includes(oldWorkobjectDictionary[i])) && (oldWorkobjectDictionary[i].includes(workObjectNames[i])))) {
      massChangeNames(oldWorkobjectDictionary[i], workObjectNames[i], WORKOBJECT);
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

function showBrokenDSTDialog() {
  brokenDSTDialog.style.display = 'block';
  modal.style.display = 'block';
}

function closeBrokenDSTDialog() {
  brokenDSTDialog.style.display = 'none';
  modal.style.display = 'none';
}

function closeDialog() {
  keysPressed = [];
  headlineDialog.style.display = 'none';
  modal.style.display = 'none';
  arrow.style.display = 'none';
}

function closeImageDownloadDialog() {
  downloadDialog.style.display = 'none';
  modal.style.display = 'none';
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
  var exportArtifacts = debounce(fnDebounce, 500);

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

function closeKeyboardShortcutDialog() {
  keyboardShortcutInfoDialog.style.display = 'none';
  modal.style.display = 'none';
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
  cleanDictionaries(canvas);
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

  activityWithoutNumberDialog.style.display = 'none';
  modal.style.display = 'none';

  activityInputLabelWithoutNumber.value = '';
  keysPressed = [];

  commandStack.execute('activity.changed', {
    businessObject: element.businessObject,
    newLabel: labelInput,
    element: element
  });

  cleanDictionaries(canvas);
}

function keyReleased(keysPressed, keyCode) {
  keysPressed[keyCode] = false;
}

function checkInput(field) {
  field.value = sanitize(field.value);
}

// SVG functions

function saveSVG(done) {
  modeler.saveSVG(done);
}

$(function() {
  var exportArtifacts = debounce(fnDebounce, 500);

  modeler.on('commandStack.changed', exportArtifacts);
});

// helper

function fnDebounce() {
  saveSVG(function(err, svg) {
    if (err) {
      console.log(err);
    }
    setEncoded(err ? null : svg);
  });
}

function debounce(fn, timeout) {
  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, timeout);
  };
}