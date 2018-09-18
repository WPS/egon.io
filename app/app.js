import $ from 'jquery';

import DomainStoryModeler from './domain-story-modeler';

import { setStash } from './domain-story-modeler/domain-story/label-editing/DSLabelEditingProvider';

import {
  traceActivities,
  completeStory,
  getAllNonShown,
  getAllShown
} from './domain-story-modeler/domain-story/replay/ReplayUtil';

import {
  getActivitesFromActors,
  updateExistingNumbersAtEditing
} from './domain-story-modeler/domain-story/util/DSActivityUtil';

import { version } from '../package.json';

import DomainStoryActivityHandlers from './domain-story-modeler/domain-story/DomainStoryActivityHandlers';

import {
  checkInput,
  keyReleased,
  getAllObjectsFromCanvas,
  debounce
} from './domain-story-modeler/domain-story/util/AppUtil';

import sanitize from './domain-story-modeler/domain-story/util/Sanitizer';

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

// we nned to initiate the activity commandStack elements
DomainStoryActivityHandlers(commandStack, eventBus, canvas);

modeler.createDiagram();
// expose bpmnjs to window for debugging purposes
window.bpmnjs = modeler;

// HTML-Elements
var lastInputTitle = '',
    lastInputDescription = '',
    headline = document.getElementById('headline'),
    title = document.getElementById('title'),
    dialog = document.getElementById('dialog'),
    saveButton = document.getElementById('saveButton'),
    quitButton = document.getElementById('quitButton'),
    titleInput = document.getElementById('titleInput'),
    exportButton = document.getElementById('export'),
    importExportSVGDiv = document.getElementById('importExportSVGButton'),
    replayStepLabel = document.getElementById('replayStep'),
    modal = document.getElementById('modal'),
    arrow = document.getElementById('arrow'),
    info = document.getElementById('info'),
    infoText = document.getElementById('infoText'),
    inputNumber = document.getElementById('inputNumber'),
    inputLabel = document.getElementById('inputLabel'),
    numberDialog = document.getElementById('numberDialog'),
    labelDialog = document.getElementById('labelDialog'),
    startReplayButton = document.getElementById('buttonStartReplay'),
    nextStepButton = document.getElementById('buttonNextStep'),
    previousStepbutton = document.getElementById('buttonPreviousStep'),
    stopReplayButton = document.getElementById('buttonStopReplay'),
    numberSaveButton = document.getElementById('numberSaveButton'),
    numberQuitButton = document.getElementById('numberQuitButton'),
    labelInputLabel = document.getElementById('labelInputLabel'),
    labelSaveButton = document.getElementById('labelSaveButton'),
    labelQuitButton = document.getElementById('labelQuitButton'),
    svgSaveButton = document.getElementById('buttonSVG'),
    wpsLogo = document.getElementById('imgWPS'),
    dstLogo = document.getElementById('imgDST'),
    wpsLogoInfo = document.getElementById('wpsLogoInfo'),
    dstLogoInfo = document.getElementById('dstLogoInfo'),
    wpsButton = document.getElementById('closeWPSLogoInfo'),
    dstButton = document.getElementById('closeDSTLogoInfo'),
    wpsInfotext = document.getElementById('wpsLogoInnerText'),
    wpsInfotext2 = document.getElementById('wpsLogoInnerText2'),
    dstInfotext = document.getElementById('dstLogoInnerText'),
    incompleteStoryInfo = document.getElementById('incompleteStoryInfo'),
    closeIncompleteStoryInfoButton = document.getElementById('closeIncompleteStoryInfo'),
    versionDialog = document.getElementById('versionDialog'),
    closeVersionDialogButton = document.getElementById('closeVersionDialog'),
    importedVersionLabel = document.getElementById('importedVersion'),
    modelerVersionLabel = document.getElementById('modelerVersion');

// interal variables
var keysPressed = [];
var svgData;
var replayOn = false;
var currentStep = 0;
var replaySteps = [];
var activityLabelStash = [];

// eventBus listeners

eventBus.on('element.dblclick', function(e) {
  if (!replayOn) {
    var element = e.element;
    if (element.type == 'domainStory:activity') {
      var source=element.source;

      setStash(false);

      if (source.type.includes('domainStory:actor')) {
        showNumberDialog(element);
        document.getElementById('inputLabel').focus();
      }
      else if (source.type.includes('domainStory:workObject')) {
        showLabelDialog(element);
        document.getElementById('labelInputLabel').focus();
      }

      // onclick and key functions, that need the element to which the event belongs
      labelSaveButton.onclick = function() {
        saveLabelDialog(element);
      };

      numberSaveButton.onclick = function() {
        saveNumberDialog(element);
      };

      labelInputLabel.onkeydown = function(e) {
        checkInput(labelInputLabel);
        checkPressedKeys(e.keyCode, 'labelDialog', element);
      };

      inputNumber.onkeydown = function(e) {
        checkInput(inputNumber);
        checkPressedKeys(e.keyCode, 'numberDialog', element);
      };

      inputLabel.onkeydown = function(e) {
        checkInput(inputLabel);
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
wpsInfotext2.innerText = ' and licensed under GPLv3.';
dstInfotext.innerText = 'Learn more about Domain Storytelling at';

// HTML-Element event listeners

headline.addEventListener('click', function() {
  showDialog();
});

wpsLogo.addEventListener('click', function() {
  modal.style.display = 'block';
  wpsLogoInfo.style.display = 'block';
});

dstLogo.addEventListener('click', function() {
  modal.style.display = 'block';
  dstLogoInfo.style.display = 'block';
});

wpsButton.addEventListener('click', function() {
  wpsLogoInfo.style.display = 'none';
  modal.style.display = 'none';
});

dstButton.addEventListener('click', function() {
  dstLogoInfo.style.display = 'none';
  modal.style.display = 'none';
});

saveButton.addEventListener('click', function() {
  saveDialog();
});

quitButton.addEventListener('click', function() {
  closeDialog();
});

numberQuitButton.addEventListener('click', function() {
  closeNumberDialog();
});

labelQuitButton.addEventListener('click', function() {
  closeLabelDialog();
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

labelInputLabel.addEventListener('keyup', function() {
  checkInput(labelInputLabel);
});

inputLabel.addEventListener('keyup', function(e) {
  keyReleased(keysPressed, e.keyCode);
  checkInput(inputLabel);
});

startReplayButton.addEventListener('click', function() {

  var canvasObjects = canvas._rootElement.children;
  var activities = getActivitesFromActors(canvasObjects);

  if (!replayOn && activities.length > 0) {

    replaySteps = traceActivities(activities, elementRegistry);

    if (completeStory(replaySteps)) {
      replayOn = true;
      disableCanvasInteraction();
      currentStep = 0;
      showCurrentStep();
    }
    else {
      incompleteStoryInfo.style.display = 'block';
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

previousStepbutton.addEventListener('click', function() {
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

closeIncompleteStoryInfoButton.addEventListener('click', function() {
  modal.style.display = 'none';
  incompleteStoryInfo.style.display = 'none';
});

closeVersionDialogButton.addEventListener('click', function() {
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
    lastInputTitle = titleInput.value;

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
      lastInputDescription = info.value;
      infoText.innerText = inputInfoText;

      modeler.importCustomElements(elements);
      cleanActicityLabelStash();
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
  // keyCode 13 is enter
  // keyCode 16 is shift
  // keyCode 17 is crtl
  // keyCode 18 is alt
  // keyCode 27 is esc

  keysPressed[keyCode] = true;

  if (keysPressed[27]) {
    closeDialog();
    closeLabelDialog();
    closeNumberDialog();
  }
  else if ((keysPressed[17] && keysPressed[13]) || (keysPressed[18] && keysPressed[13])) {
    if (dialog == 'infoDialog') {
      info.value += '\n';
    }
  }
  else if (keysPressed[13] && !keysPressed[16]) {
    if (dialog == 'titleDialog' || dialog == 'infoDialog') {
      saveDialog();
    }
    else if (dialog == 'labelDialog') {
      saveLabelDialog(element);
    }
    else if (dialog == 'numberDialog') {
      saveNumberDialog(element);
    }
  }
}

// dialog functions

function showVersionDialog() {
  versionDialog.style.display = 'block';
  modal.style.display = 'block';
}

function closeDialog() {
  keysPressed = [];
  dialog.style.display = 'none';
  modal.style.display = 'none';
  arrow.style.display = 'none';
}

function showDialog() {
  info.value = lastInputDescription;
  titleInput.value = lastInputTitle;
  dialog.style.display = 'block';
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

  lastInputTitle = inputTitle;
  lastInputDescription = inputText;

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

function showNumberDialog(event) {
  modal.style.display = 'block';
  numberDialog.style.display = 'block';
  inputLabel.value = '';
  inputNumber.value = '';

  if (event.businessObject.name != null) {
    inputLabel.value = event.businessObject.name;
  }
  if (event.businessObject.number != null) {
    inputNumber.value = event.businessObject.number;
  }
}

function showLabelDialog(event) {
  modal.style.display = 'block';
  labelDialog.style.display = 'block';
  labelInputLabel.value = '';

  if (event.businessObject.name != null) {
    labelInputLabel.value = event.businessObject.name;
  }
}

function closeNumberDialog() {
  inputLabel.value = '';
  inputNumber.value = '';
  keysPressed = [];
  numberDialog.style.display = 'none';
  modal.style.display = 'none';
}


function saveNumberDialog(element) {
  var labelInput = '';
  var numberInput = '';
  if (inputLabel != '') {
    labelInput = inputLabel.value;
    if (!activityLabelStash.includes(labelInput)) {
      activityLabelStash.push(labelInput);
    }
  }
  if (inputNumber != '') {
    numberInput = inputNumber.value;
  }

  numberDialog.style.display = 'none';
  modal.style.display = 'none';

  inputLabel.value = '';
  inputNumber.value = '';
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
  cleanActicityLabelStash();
}

function cleanActicityLabelStash() {
  activityLabelStash=[];
  var allObjects = getAllObjectsFromCanvas(canvas);
  allObjects.forEach(element => {
    if (element.type.includes('domainStory:activity')) {
      activityLabelStash.push(element.businessObject.name);
    }
  });

  autocomplete(inputLabel, activityLabelStash);
  autocomplete(labelInputLabel, activityLabelStash);
}

function closeLabelDialog() {
  labelInputLabel.value = '';
  keysPressed = [];
  labelDialog.style.display = 'none';
  modal.style.display = 'none';
}

function saveLabelDialog(element) {
  var labelInput = '';
  if (labelInputLabel != '') {
    labelInput = labelInputLabel.value;
    if (!activityLabelStash.includes(labelInput)) {
      activityLabelStash.push(labelInput);
    }
  }

  labelDialog.style.display = 'none';
  modal.style.display = 'none';

  labelInputLabel.value = '';
  keysPressed = [];

  commandStack.execute('activity.changed', {
    businessObject: element.businessObject,
    newLabel: labelInput,
    element: element
  });
  cleanActicityLabelStash();
}

// replay functions

function disableCanvasInteraction() {
  var contextPadElements = document.getElementsByClassName('djs-context-pad');
  var paletteElements = document.getElementsByClassName('djs-palette');

  headline.style.pointerEvents = 'none';

  importExportSVGDiv.style.opacity = 0.2;
  importExportSVGDiv.style.pointerEvents = 'none';

  startReplayButton.style.opacity = 0.2;
  startReplayButton.style.pointerEvents = 'none';

  stopReplayButton.style.opacity = 1;
  stopReplayButton.style.pointerEvents = 'all';

  nextStepButton.style.opacity = 1;
  nextStepButton.style.pointerEvents = 'all';

  previousStepbutton.style.opacity = 1;
  previousStepbutton.style.pointerEvents = 'all';

  var i = 0;
  for (i = 0; i < contextPadElements.length; i++) {
    contextPadElements[i].style.display = 'none';
  }

  for (i = 0; i < paletteElements.length; i++) {
    paletteElements[i].style.display = 'none';
  }

  replayStepLabel.style.display = 'block';
}

function enableCanvasInteraction() {
  var contextPadElements = document.getElementsByClassName('djs-context-pad');
  var paletteElements = document.getElementsByClassName('djs-palette');

  headline.style.pointerEvents = 'all';

  importExportSVGDiv.style.opacity = 1;
  importExportSVGDiv.style.pointerEvents = 'all';

  startReplayButton.style.opacity = 1;
  startReplayButton.style.pointerEvents = 'all';

  stopReplayButton.style.opacity = 0.2;
  stopReplayButton.style.pointerEvents = 'none';

  nextStepButton.style.opacity = 0.2;
  nextStepButton.style.pointerEvents = 'none';

  previousStepbutton.style.opacity = 0.2;
  previousStepbutton.style.pointerEvents = 'none';

  var i = 0;
  for (i = 0; i < contextPadElements.length; i++) {
    contextPadElements[i].style.display = 'block';
  }

  for (i = 0; i < paletteElements.length; i++) {
    paletteElements[i].style.display = 'block';
  }
  replayStepLabel.style.display = 'none';
}

function showCurrentStep() {
  var stepsUntilNow = [];
  var allObjects = [];
  var i = 0;

  replayStepLabel.innerText = (currentStep + 1) + ' / ' + replaySteps.length;

  for (i = 0; i <= currentStep; i++) {
    stepsUntilNow.push(replaySteps[i]);
  }

  allObjects = getAllObjectsFromCanvas(canvas);

  var shownElements = getAllShown(stepsUntilNow);

  var notShownElements = getAllNonShown(allObjects, shownElements);

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

/**
 * copied from https://www.w3schools.com/howto/howto_js_autocomplete.asp on 18.09.2018
 */
function autocomplete(inp, arr) {
  /* the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /* execute a function when someone writes in the text field:*/
  inp.addEventListener('input', function(e) {
    var a, b, i, val = this.value;
    /* close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) { return false;}
    currentFocus = -1;
    /* create a DIV element that will contain the items (values):*/
    a = document.createElement('DIV');
    a.setAttribute('id', this.id + 'autocomplete-list');
    a.setAttribute('class', 'autocomplete-items');
    /* append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /* for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /* check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /* create a DIV element for each matching element:*/
        b = document.createElement('DIV');
        /* make the matching letters bold:*/
        b.innerHTML = '<strong>' + arr[i].substr(0, val.length) + '</strong>';
        b.innerHTML += arr[i].substr(val.length);
        /* insert a input field that will hold the current array item's value:*/
        b.innerHTML += '<input type=\'hidden\' value=\'' + arr[i] + '\'>';
        /* execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener('click', function(e) {
          /* insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName('input')[0].value;
          /* close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });
  /* execute a function presses a key on the keyboard:*/
  inp.addEventListener('keydown', function(e) {
    var x = document.getElementById(this.id + 'autocomplete-list');
    if (x) x = x.getElementsByTagName('div');
    if (e.keyCode == 40) {
      /* If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
      currentFocus++;
      /* and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { // up
      /* If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
      currentFocus--;
      /* and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /* If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /* and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /* a function to classify an item as "active":*/
    if (!x) return false;
    /* start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /* add class "autocomplete-active":*/
    x[currentFocus].classList.add('autocomplete-active');
  }
  function removeActive(x) {
    /* a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove('autocomplete-active');
    }
  }
  function closeAllLists(elmnt) {
    /* close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName('autocomplete-items');
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /* execute a function when someone clicks in the document:*/
  document.addEventListener('click', function(e) {
    closeAllLists(e.target);
  });
}