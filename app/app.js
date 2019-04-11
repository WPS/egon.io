'use strict';

import $ from 'jquery';

import './domain-story-modeler/util/MathExtensions';

import DomainStoryModeler from './domain-story-modeler';

import SearchPad from '../node_modules/diagram-js/lib/features/search-pad/SearchPad';

import DSActivityHandlers from './domain-story-modeler/modeler/DSActivityHandlers';

import { toggleStashUse } from './domain-story-modeler/features/labeling/DSLabelEditingProvider';

import { version } from '../package.json';

import DSMassRenameHandlers from './domain-story-modeler/features/dictionary/DSMassRenameHandlers';

import { getActivityDictionary, cleanDictionaries, getWorkObjectDictionary, openDictionary } from './domain-story-modeler/features/dictionary/dictionary';

import { isPlaying, initReplay } from './domain-story-modeler/features/replay/replay';

import { autocomplete } from './domain-story-modeler/features/labeling/DSLabelUtil';

import { updateExistingNumbersAtEditing, getNumberRegistry } from './domain-story-modeler/features/numbering/numbering';

import { ACTIVITY, ACTOR, WORKOBJECT } from './domain-story-modeler/language/elementTypes';
import { downloadDST, createObjectListForDSTDownload } from './domain-story-modeler/features/export/dstDownload';
import { downloadSVG, setEncoded } from './domain-story-modeler/features/export/svgDownload';
import { downloadPNG } from './domain-story-modeler/features/export/pngDownload';
import { importDST, loadPersistedDST } from './domain-story-modeler/features/import/import';
import { getActivitesFromActors, getAllCanvasObjects, initElementRegistry } from './domain-story-modeler/features/canvasElements/canvasElementRegistry';
import { createListOfAllIcons } from './domain-story-modeler/features/iconSetCustomization/creation';
import { setToDefault, saveIconConfiguration, storyPersistTag, exportConfiguration, importConfiguration } from './domain-story-modeler/features/iconSetCustomization/persitence';

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

initReplay(canvas);
initElementRegistry(elementRegistry);

// disable BPMN SearchPad
SearchPad.prototype.toggle=function() { };

modeler.createDiagram();
// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;

// if there is a persitent Story, load it
if (localStorage.getItem(storyPersistTag)) {
  loadPersistedDST(modeler);
}

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
    incompleteStoryDialog = document.getElementById('incompleteStoryInfo'),
    wpsLogoDialog = document.getElementById('wpsLogoInfo'),
    dstLogoDialog = document.getElementById('dstLogoInfo'),
    dictionaryDialog = document.getElementById('dictionary'),
    keyboardShortcutInfoDialog = document.getElementById('keyboardShortcutInfoDialog'),
    downloadDialog = document.getElementById('downloadDialog'),
    noContentOnCanvasDialog = document.getElementById('noContentOnCanvasInfo'),
    // Container
    iconCustomizationContainer = document.getElementById('iconCustomizationContainer'),
    activityDictionaryContainer = document.getElementById('activityDictionaryContainer'),
    workobjectDictionaryContainer = document.getElementById('workobjectDictionaryContainer'),
    // Buttons
    headlineDialogButtonSave = document.getElementById('saveButton'),
    headlineDialogButtonCancel = document.getElementById('quitButton'),
    exportButton = document.getElementById('export'),
    dictionaryButtonOpen = document.getElementById('dictionaryButton'),
    dictionaryButtonSave = document.getElementById('closeDictionaryButtonSave'),
    dictionaryButtonCancel = document.getElementById('closeDictionaryButtonCancel'),
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
    exportConfigurationButton = document.getElementById('exportConfigurationButton'),
    resetIconCustomizationButton = document.getElementById('resetIconConfigButton'),
    cancelIconCustomizationButton = document.getElementById('cancelIconCustomizationButton'),
    customIconConfigCancelButton = document.getElementById('customIconConfigCancelButton'),
    iconCustomizationSaveButton = document.getElementById('customIconConfigSaveButton'),
    iconCustomizationButton = document.getElementById('iconCustomizationButton'),
    keyboardShortcutInfoButton = document.getElementById('keyboardShortcutInfoButton'),
    keyboardShortcutInfoButtonCancel = document.getElementById('keyboardShortcutInfoDialogButtonCancel'),
    incompleteStoryDialogButtonCancel = document.getElementById('closeIncompleteStoryInfo'),
    noContentOnCanvasDialogCuttonCancel = document.getElementById('closeNoContentOnCanvasInfo');

// interal variables
var keysPressed = [];

// eventBus listeners

eventBus.on('element.dblclick', function(e) {
  if (!isPlaying()) {
    var element = e.element;
    if (element.type == ACTIVITY) {
      activityDoubleClick(element);
    } else {
      var renderedNumberRegistry = getNumberRegistry();

      if (renderedNumberRegistry.length > 1) {

        var allActivities = getActivitesFromActors();

        if (allActivities.length >0) {

          var htmlCanvas = document.getElementById('canvas');
          var container = htmlCanvas.getElementsByClassName('djs-container');
          var svgElements = container[0].getElementsByTagName('svg');
          var outerSVGElement = svgElements[0];
          var viewport = outerSVGElement.getElementsByClassName('viewport')[0];
          var transform = viewport.getAttribute('transform');
          var transformX = 0,
              transformY = 0,
              zoomX = 1,
              zoomY = 1;
          var nums;

          var clickX = e.originalEvent.offsetX;
          var clickY = e.originalEvent.offsetY;

          if (transform) {
            transform = transform.replace('matrix(', '');
            transform.replace(')');
            nums = transform.split(',');
            zoomX = parseFloat(nums[0]);
            zoomY = parseFloat(nums[3]);
            transformX = parseInt(nums[4]);
            transformY = parseInt(nums[5]);
          }

          var width = 25 * zoomX;
          var height = 22 * zoomY;

          for (var i = 1; i<renderedNumberRegistry.length; i++) {
            var currentNum = renderedNumberRegistry[i];
            var tspan = currentNum.getElementsByTagName('tspan')[0];
            var tx = tspan.getAttribute('x');
            var ty = tspan.getAttribute('y');
            var tNumber = parseInt(tspan.innerHTML);

            var elementX = (tx * zoomX) + (transformX - 5 * zoomX);
            var elementY = (ty * zoomY) + (transformY - 15 * zoomY);

            for (var j=0; j<allActivities.length; j++) {
              var activity = allActivities[j];
              if (activity.businessObject.number == tNumber) {
                if (positionsMatch(width, height, elementX, elementY, clickX, clickY)) {
                  activityDoubleClick(activity);
                }
              }
            }

          }
        }
      }
    }
  }
});

function positionsMatch(width, height, elementX, elementY, clickX, clickY) {
  if (clickX > elementX && clickX < (elementX + width)) {
    if (clickY > elementY && clickY < (elementY + height)) {
      return true;
    }
  }
  return false;
}

function activityDoubleClick(activity) {
  var source = activity.source;

  var dict = getActivityDictionary();
  autocomplete(activityInputLabelWithNumber, dict, activity);
  autocomplete(activityInputLabelWithoutNumber, dict, activity);

  // ensure the right number when changing the direction of an activity
  toggleStashUse(false);

  if (source.type.includes(ACTOR)) {
    showActivityWithNumberDialog(activity);
    document.getElementById('inputLabel').focus();
  }
  else if (source.type.includes(WORKOBJECT)) {
    showActivityWithoutLabelDialog(activity);
    document.getElementById('labelInputLabel').focus();
  }

  // onclick and key functions, that need the element to which the event belongs
  activityLabelButtonSave.onclick = function() {
    saveActivityInputLabelWithoutNumber(activity);
  };

  activityNumberDialogButtonSave.onclick = function() {
    saveActivityInputLabelWithNumber(activity);
  };

  activityInputLabelWithoutNumber.onkeydown = function(e) {
    checkPressedKeys(e.keyCode, 'labelDialog', activity);
  };

  activityInputNumber.onkeydown = function(e) {
    checkPressedKeys(e.keyCode, 'numberDialog', activity);
  };

  activityInputLabelWithNumber.onkeydown = function(e) {
    checkPressedKeys(e.keyCode, 'numberDialog', activity);
  };
}

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
});

titleInput.addEventListener('keyup', function(e) {
  keyReleased(keysPressed, e.keyCode);
});

info.addEventListener('keydown', function(e) {
  checkPressedKeys(e.keyCode, 'infoDialog');
});

info.addEventListener('keyup', function(e) {
  keyReleased(keysPressed, e.keyCode);
});

activityInputLabelWithNumber.addEventListener('keyup', function(e) {
  keyReleased(keysPressed, e.keyCode);
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

exportButton.addEventListener('click', function() {

  if (canvas._rootElement) {

    var objects = createObjectListForDSTDownload(version);

    var json = JSON.stringify(objects);
    var filename = title.innerText + '_' + new Date().toISOString().slice(0, 10);

    // start file download
    downloadDST(filename, json);
  } else {
    showNoContentDialog();
  }
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

noContentOnCanvasDialogCuttonCancel.addEventListener('click', function() {
  closeNoContentDialog();
});

keyboardShortcutInfoButton.addEventListener('click', function() {
  modal.style.display = 'block';
  keyboardShortcutInfoDialog.style.display = 'block';
});

iconCustomizationSaveButton.addEventListener('click', function() {
  saveIconConfiguration();
});

cancelIconCustomizationButton.addEventListener('click', function() {
  modal.style.display = 'none';
  iconCustomizationContainer.style.display = 'none';
});

customIconConfigCancelButton.addEventListener('click', function() {
  modal.style.display = 'none';
  iconCustomizationContainer.style.display = 'none';
});

iconCustomizationButton.addEventListener('click', function() {
  modal.style.display = 'block';
  iconCustomizationContainer.style.display = 'block';
  createListOfAllIcons();
});


resetIconCustomizationButton.addEventListener('click', function() {
  setToDefault();
});

exportConfigurationButton.addEventListener('click', function() {
  exportConfiguration();
});

// -----

document.getElementById('import').onchange = function() {

  var input = document.getElementById('import').files[0];

  initElementRegistry(elementRegistry);

  importDST(input, version, modeler);

  // to update the title of the svg, we need to tell the command stack, that a value has changed
  var exportArtifacts = debounce(fnDebounce, 500);

  eventBus.fire('commandStack.changed', exportArtifacts);

  titleInputLast = titleInput.value;
};


document.getElementById('importConfig').onchange = function() {
  var input = document.getElementById('importConfig').files[0];

  importConfiguration(input);
};


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
  var allObjects = getAllCanvasObjects();
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

function showNoContentDialog() {
  noContentOnCanvasDialog.style.display = 'block';
  modal.style.display = 'block';
}

function closeNoContentDialog() {
  noContentOnCanvasDialog.style.display = 'none';
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
  if (descriptionInputLast == '') {
    descriptionInputLast = infoText.innerText;
  }
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
    title.innerText = inputTitle;
  }
  else {
    title.innerText = '<name of this Domain Story>';
  }
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

  var activitiesFromActors = getActivitesFromActors();

  var index = activitiesFromActors.indexOf(element);
  activitiesFromActors.splice(index, 1);

  commandStack.execute('activity.changed', {
    businessObject: element.businessObject,
    newLabel: labelInput,
    newNumber: numberInput,
    element: element
  });

  updateExistingNumbersAtEditing(activitiesFromActors, numberInput, eventBus);
  cleanDictionaries();
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

  cleanDictionaries();
}

function keyReleased(keysPressed, keyCode) {
  keysPressed[keyCode] = false;
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