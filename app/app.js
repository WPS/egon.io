import $ from 'jquery';

import DomainStoryModeler from './domain-story-modeler';
import sanitize from './domain-story-modeler/domain-story/util/Sanitizer';

import {
  updateExistingNumbersAtEditing,
  getActivitesFromActors
}
  from './domain-story-modeler/domain-story/label-editing/DSLabelUtil';

import { setStash } from './domain-story-modeler/domain-story/label-editing/DSLabelEditingProvider';

var modeler = new DomainStoryModeler({
  container: '#canvas',
  keyboard: {
    bindTo: document
  }
});

var canvas = modeler.get('canvas');
var eventBus = modeler.get('eventBus');
var commandStack = modeler.get('commandStack');

commandStack.registerHandler('activity.changed', activity_changed);

function activity_changed(modeling) {

  this.preExecute = function(context) {
    context.oldLabel = context.businessObject.name;

    if (context.oldLabel.length < 1) {
      context.oldLabel = ' ';
    }

    var oldNumbersWithIDs = getNumebrsAndIDs();

    context.oldNumber = context.businessObject.number;
    context.oldNumbersWithIDs = oldNumbersWithIDs;
    modeling.updateLabel(context.businessObject, context.newLabel);
    modeling.updateNumber(context.businessObject, context.newNumber);
  };

  this.execute = function(context) {
    var semantic = context.businessObject;
    var element = context.element;

    if (context.newLabel.length < 1) {
      context.newLabel = ' ';
    }

    semantic.name = context.newLabel;
    semantic.number = context.newNumber;

    eventBus.fire('element.changed', { element });
  };

  this.revert = function(context) {
    var semantic = context.businessObject;
    var element = context.element;
    semantic.name = context.oldLabel;
    semantic.number = context.oldNumber;

    revertChange(context.oldNumbersWithIDs);

    eventBus.fire('element.changed', { element });
  };
}

function revertChange(iDWithNumber) {
  var canvasObjects = canvas._rootElement.children;
  var activities = getActivitesFromActors(canvasObjects);
  for (var i = activities.length - 1; i >= 0; i--) {
    for (var j = iDWithNumber.length - 1; j >= 0; j--) {
      if (iDWithNumber[j].id.includes(activities[i].businessObject.id)) {
        var element = activities[i];
        element.businessObject.number = iDWithNumber[j].number;
        j = -5;
        eventBus.fire('element.changed', { element });
        iDWithNumber.splice(j, 1);
      }
    }
  }
}


function getNumebrsAndIDs() {
  var iDWithNumber = [];
  var canvasObjects = canvas._rootElement.children;
  var activities = getActivitesFromActors(canvasObjects);

  for (var i = activities.length - 1; i >= 0; i--) {
    var id = activities[i].businessObject.id;
    var number = activities[i].businessObject.number;
    iDWithNumber.push({ id: id, number: number });
  }
  return iDWithNumber;
}

eventBus.on('element.dblclick', function(e) {
  var element = e.element;
  if (element.type == 'domainStory:activity') {
    var canvasObjects = modeler._customElements;
    var semantic = element.businessObject;

    setStash(false);

    for (var i = 0; i < canvasObjects.length; i++) {
      if (canvasObjects[i].id == semantic.source) {
        if (canvasObjects[i].type.includes('domainStory:actor')) {
          showNumberDialog(element);
          document.getElementById('inputLabel').focus();
        }
        else if (canvasObjects[i].type.includes('domainStory:workObject')) {
          showLabelDialog(element);
          document.getElementById('labelInputLabel').focus();
        }
      }
    }

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
});

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
    modal = document.getElementById('modal'),
    arrow = document.getElementById('arrow'),
    info = document.getElementById('info'),
    infoText = document.getElementById('infoText'),
    inputNumber = document.getElementById('inputNumber'),
    inputLabel = document.getElementById('inputLabel'),
    numberDialog = document.getElementById('numberDialog'),
    labelDialog = document.getElementById('labelDialog'),
    numberSaveButton = document.getElementById('numberSaveButton'),
    numberQuitButton = document.getElementById('numberQuitButton'),
    labelInputLabel = document.getElementById('labelInputLabel'),
    labelSaveButton = document.getElementById('labelSaveButton'),
    labelQuitButton = document.getElementById('labelQuitButton'),
    svgSaveButton = document.getElementById('buttonSVG');

// interal variables
var keysPressed = [];
var svgData;

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

// -----

headline.addEventListener('click', function() {
  showDialog();
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
  keyReleased(e.keyCode);
});

info.addEventListener('keydown', function(e) {
  checkPressedKeys(e.keyCode, 'infoDialog');
  checkInput(info);
});

info.addEventListener('keyup', function(e) {
  checkInput(info);
  keyReleased(e.keyCode);
});

labelInputLabel.addEventListener('keyup', function() {
  checkInput(labelInputLabel);
});

inputLabel.addEventListener('keyup', function(e) {
  keyReleased(e.keyCode);
  checkInput(inputLabel);
});

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

function keyReleased(keyCode) {
  keysPressed[keyCode] = false;
}

exportButton.addEventListener('click', function() {

  var object = modeler.getCustomElements();
  var text = info.innerText;
  var newObject = object.slice(0);

  newObject.push({ info: text });
  var json = JSON.stringify(newObject);
  var filename = title.innerText + '_' + new Date().toISOString().slice(0, 10);

  // start file download
  download(filename, json);
});

function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename + '.dst');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

svgSaveButton.addEventListener('click', function() {
  var filename = title.innerText + '_' + new Date().toISOString().slice(0, 10);
  downloadSVG(filename);
});


function downloadSVG(filename) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:application/bpmn20-xml;charset=UTF-8,' + svgData);
  element.setAttribute('download', filename + '.svg');

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

document.getElementById('import').onchange = function() {

  var input = document.getElementById('import').files[0];
  var reader = new FileReader();
  if (input.name.includes('.dst')) {
    var titleText = input.name.replace(/_\d+-\d+-\d+( ?_?\(\d+\))?.dst/, '');
    titleText = sanitize(titleText);
    titleInput.value = titleText;
    title.innerText = titleText;
    lastInputTitle = titleInput.value;

    reader.onloadend = function(e) {
      var text = e.target.result;

      var elements = JSON.parse(text);
      var lastElement = elements.pop();

      var inputInfoText = sanitize(lastElement.info ? lastElement.info : '');
      info.innerText = inputInfoText;
      info.value = inputInfoText;
      lastInputDescription = info.value;
      infoText.innerText = inputInfoText;

      modeler.importCustomElements(elements);
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

function checkInput(field) {
  field.value = sanitize(field.value);
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
  var endNumber = element.businessObject.number;
  var labelInput = '';
  var numberInput = '';
  if (inputLabel != '') {
    labelInput = inputLabel.value;
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

  updateExistingNumbersAtEditing(activitiesFromActors, numberInput, endNumber, eventBus);
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
}

// helper
function debounce(fn, timeout) {

  var timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout);
  };
}