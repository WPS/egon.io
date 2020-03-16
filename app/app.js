'use strict';

import './domain-story-modeler/util/MathExtensions';
import DomainStoryModeler from './domain-story-modeler';
import SearchPad from '../node_modules/diagram-js/lib/features/search-pad/SearchPad';
import EventBus from 'diagram-js/lib/core/EventBus';
import DSActivityHandlers from './domain-story-modeler/modeler/UpdateHandler/DSActivityHandlers';
import { toggleStashUse } from './domain-story-modeler/features/labeling/DSLabelEditingProvider';
import { version } from '../package.json';
import DSMassRenameHandlers from './domain-story-modeler/modeler/UpdateHandler/DSMassRenameHandlers';
import {
  getActivityDictionary,
  cleanDictionaries,
  openDictionary,
  dictionaryClosed
} from './domain-story-modeler/features/dictionary/dictionary';
import {
  isPlaying,
  initReplay,
  getReplayOn
} from './domain-story-modeler/features/replay/replay';
import { autocomplete } from './domain-story-modeler/features/labeling/DSLabelUtil';
import {
  updateExistingNumbersAtEditing,
  getNumberRegistry,
  getMultipleNumberRegistry,
  setNumberIsMultiple
} from './domain-story-modeler/features/numbering/numbering';
import {
  ACTIVITY,
  ACTOR,
  WORKOBJECT
} from './domain-story-modeler/language/elementTypes';
import {
  downloadDST,
  createObjectListForDSTDownload
} from './domain-story-modeler/features/export/dstDownload';
import {
  downloadSVG,
  setEncoded
} from './domain-story-modeler/features/export/svgDownload';
import { downloadPNG } from './domain-story-modeler/features/export/pngDownload';
import {
  loadPersistedDST,
  initImports,
  getDescriptionInputLast,
  setDescriptionInputLast,
  getTitleInputLast,
  setTitleInputLast
} from './domain-story-modeler/features/import/import';
import {
  getActivitesFromActors,
  initElementRegistry
} from './domain-story-modeler/language/canvasElementRegistry';
import { createListOfAllIcons } from './domain-story-modeler/features/iconSetCustomization/customizationDialog';
import {
  setToDefault,
  saveIconConfiguration,
  storyPersistTag,
  exportConfiguration
} from './domain-story-modeler/features/iconSetCustomization/persitence';
import {
  debounce
} from './domain-story-modeler/util/helpers';
import {
  isDirty,
  makeDirty
} from './domain-story-modeler/features/export/dirtyFlag';
import DSElementHandler from './domain-story-modeler/modeler/UpdateHandler/DSElementHandler';
import headlineAndDescriptionUpdateHandler from './domain-story-modeler/modeler/UpdateHandler/headlineAndDescriptionUpdateHandler';

const modeler = new DomainStoryModeler({
  container: '#canvas',
  keyboard: {
    bindTo: document
  }
});
const canvas = modeler.get('canvas');
const elementRegistry = modeler.get('elementRegistry');
const eventBus = modeler.get('eventBus');
const commandStack = modeler.get('commandStack');
const selection = modeler.get('selection');

initialize(canvas, elementRegistry, version, modeler, eventBus, fnDebounce);

// interal variables
let keysPressed = [];

// HTML-Elements
let modal = document.getElementById('modal'),
    arrow = document.getElementById('arrow'),

    // logos
    wpsLogo = document.getElementById('imgWPS'),
    dstLogo = document.getElementById('imgDST'),

    // text-elements
    wpsInfotext = document.getElementById('wpsLogoInnerText'),
    wpsInfotextPart2 = document.getElementById('wpsLogoInnerText2'),
    dstInfotext = document.getElementById('dstLogoInnerText'),

    // labels
    headline = document.getElementById('headline'),
    title = document.getElementById('title'),
    info = document.getElementById('info'),
    infoText = document.getElementById('infoText'),

    // inputs
    titleInput = document.getElementById('titleInput'),
    activityInputNumber = document.getElementById('inputNumber'),
    activityInputLabelWithNumber = document.getElementById('inputLabel'),
    activityInputLabelWithoutNumber = document.getElementById('labelInputLabel'),
    multipleNumberAllowedCheckBox = document.getElementById(
      'multipleNumberAllowed'
    ),

    // dialogs
    headlineDialog = document.getElementById('dialog'),
    activityWithNumberDialog = document.getElementById('numberDialog'),
    activityWithoutNumberDialog = document.getElementById('labelDialog'),
    incompleteStoryDialog = document.getElementById('incompleteStoryInfo'),
    wpsLogoDialog = document.getElementById('wpsLogoInfo'),
    dstLogoDialog = document.getElementById('dstLogoInfo'),
    dictionaryDialog = document.getElementById('dictionaryDialog'),
    keyboardShortcutInfo = document.getElementById('keyboardShortcutInfo'),
    downloadDialog = document.getElementById('downloadDialog'),
    noContentOnCanvasDialog = document.getElementById('noContentOnCanvasInfo'),

    // container
    iconCustomizationContainer = document.getElementById(
      'iconCustomizationContainer'
    ),
    activityDictionaryContainer = document.getElementById(
      'activityDictionaryContainer'
    ),
    workobjectDictionaryContainer = document.getElementById(
      'workobjectDictionaryContainer'
    ),

    // buttons
    headlineDialogButtonSave = document.getElementById('saveButton'),
    headlineDialogButtonCancel = document.getElementById('quitButton'),
    exportButton = document.getElementById('export'),
    dictionaryButtonOpen = document.getElementById('dictionaryButton'),
    dictionaryButtonSave = document.getElementById('closeDictionaryButtonSave'),
    dictionaryButtonCancel = document.getElementById(
      'closeDictionaryButtonCancel'
    ),
    activityNumberDialogButtonSave = document.getElementById('numberSaveButton'),
    activityNumberDialogButtonCancel = document.getElementById(
      'numberQuitButton'
    ),
    activityLabelButtonSave = document.getElementById('labelSaveButton'),
    activityLabelButtonCancel = document.getElementById('labelQuitButton'),
    buttonImageDownloads = document.getElementById('buttonImageDownloads'),
    buttonImageDownloadsCancel = document.getElementById(
      'downloadDialogCancelButton'
    ),
    pngSaveButton = document.getElementById('buttonPNG'),
    svgSaveButton = document.getElementById('buttonSVG'),
    wpsLogoButton = document.getElementById('closeWPSLogoInfo'),
    dstLogoButton = document.getElementById('closeDSTLogoInfo'),
    exportConfigurationButton = document.getElementById(
      'exportConfigurationButton'
    ),
    resetIconCustomizationButton = document.getElementById(
      'resetIconConfigButton'
    ),
    cancelIconCustomizationButton = document.getElementById(
      'cancelIconCustomizationButton'
    ),
    iconCustomizationSaveButton = document.getElementById(
      'customIconConfigSaveButton'
    ),
    iconCustomizationButton = document.getElementById('iconCustomizationButton'),
    keyboardShortcutInfoButton = document.getElementById(
      'keyboardShortcutInfoButton'
    ),
    keyboardShortcutInfoButtonCancel = document.getElementById(
      'keyboardShortcutInfoDialogButtonCancel'
    ),
    incompleteStoryDialogButtonCancel = document.getElementById(
      'closeIncompleteStoryInfo'
    ),
    noContentOnCanvasDialogCuttonCancel = document.getElementById(
      'closeNoContentOnCanvasInfo'
    );

wpsInfotext.innerText =
  'Domain Story Modeler v' +
  version +
  '\nA tool to visualize Domain Stories in the browser.\nProvided by';
wpsInfotextPart2.innerText = ' and licensed under GPLv3.';
dstInfotext.innerText = 'Learn more about Domain Storytelling at';

// ----
function initialize(
    canvas,
    elementRegistry,
    version,
    modeler,
    eventBus,
    fnDebounce
) {

  // we need to initiate the activity commandStack elements
  DSActivityHandlers(commandStack, eventBus);
  DSMassRenameHandlers(commandStack, eventBus);
  DSElementHandler(commandStack, eventBus);
  headlineAndDescriptionUpdateHandler(commandStack);

  const exportArtifacts = debounce(fnDebounce, 500);
  modeler.on('commandStack.changed', exportArtifacts);

  initReplay(canvas, selection);
  initElementRegistry(elementRegistry);
  initImports(elementRegistry, version, modeler, eventBus, fnDebounce);

  // disable BPMN SearchPad
  SearchPad.prototype.toggle = function() {};

  // override the invoke Listener function of the EventBus
  // per default the command ctrl + F is rerouted and the Browser-Search function disabled
  // to circumvent this rerouting, we return when the event is a key Event with ctrl + f pressed
  EventBus.prototype._invokeListener = function(event, args, listener) {
    if (event.keyEvent && event.keyEvent.key == 'f' && event.keyEvent.ctrlKey) {
      return;
    }

    let returnValue;

    try {

      // returning false prevents the default action
      returnValue = invokeFunction(listener.callback, args);

      // stop propagation on return value
      if (returnValue !== undefined) {
        event.returnValue = returnValue;
        event.stopPropagation();
      }

      // prevent default on return false
      if (returnValue === false) {
        event.preventDefault();
      }
    } catch (e) {
      if (!this.handleError(e)) {
        console.error('unhandled error in event listener');
        console.error(e.stack);

        throw e;
      }
    }

    return returnValue;
  };

  modeler.createDiagram();

  // expose bpmnjs to window for debugging purposes
  window.bpmnjs = modeler;

  // if there is a persited Story, load it
  if (localStorage.getItem(storyPersistTag)) {
    loadPersistedDST(modeler);

    eventBus.fire('commandStack.changed', debounce(fnDebounce, 500));
  }

  debounce(fnDebounce, 500);
}

/**
 * From BPMN.io
 * Invoke function. Be fast...
 *
 * @param {Function} fn
 * @param {Array<Object>} args
 *
 * @return {Any}
 */
function invokeFunction(fn, args) {
  return fn.apply(null, args);
}

document.onkeydown = function(e) {
  if (e.ctrlKey && e.key == 's') {
    initiateDSTDownload();

    e.preventDefault();
    e.stopPropagation();
  } else if (e.ctrlKey && e.key == 'l') {
    document.getElementById('import').click();
    e.preventDefault();
    e.stopPropagation();
  }
};

function initiateDSTDownload() {
  if (canvas._rootElement) {
    const objects = createObjectListForDSTDownload(version);

    const json = JSON.stringify(objects);
    const filename =
      title.innerText + '_' + new Date().toISOString().slice(0, 10);

    // start file download
    downloadDST(filename, json);
  } else {
    showNoContentDialog();
  }
}

// eventBus listeners
eventBus.on('element.dblclick', function(e) {
  if (!isPlaying()) {
    const element = e.element;
    if (element.type == ACTIVITY) {
      activityDoubleClick(element);
    } else {
      const renderedNumberRegistry = getNumberRegistry();

      if (renderedNumberRegistry.length > 1) {
        const allActivities = getActivitesFromActors();

        if (allActivities.length > 0) {
          const htmlCanvas = document.getElementById('canvas');
          const container = htmlCanvas.getElementsByClassName('djs-container');
          const svgElements = container[0].getElementsByTagName('svg');
          const outerSVGElement = svgElements[0];
          const viewport = outerSVGElement.getElementsByClassName(
            'viewport'
          )[0];
          let transform = viewport.getAttribute('transform');
          let transformX = 0,
              transformY = 0,
              zoomX = 1,
              zoomY = 1;
          let nums;

          const clickX = e.originalEvent.offsetX;
          const clickY = e.originalEvent.offsetY;

          if (transform) {
            transform = transform.replace('matrix(', '');
            transform.replace(')');
            nums = transform.split(',');
            zoomX = parseFloat(nums[0]);
            zoomY = parseFloat(nums[3]);
            transformX = parseInt(nums[4]);
            transformY = parseInt(nums[5]);
          }

          const width = 25 * zoomX;
          const height = 22 * zoomY;
          for (let i = 1; i < renderedNumberRegistry.length; i++) {
            const currentNum = renderedNumberRegistry[i];
            if (currentNum) {
              const tspan = currentNum.getElementsByTagName('tspan')[0];
              const tx = tspan.getAttribute('x');
              const ty = tspan.getAttribute('y');
              const tNumber = parseInt(tspan.innerHTML);

              const elementX = tx * zoomX + (transformX - 5 * zoomX);
              const elementY = ty * zoomY + (transformY - 15 * zoomY);

              allActivities.forEach(activity => {
                const activityNumber = +activity.businessObject.number;
                if (activityNumber === tNumber) {
                  if (
                    positionsMatch(
                      width,
                      height,
                      elementX,
                      elementY,
                      clickX,
                      clickY
                    )
                  ) {
                    activityDoubleClick(activity);
                  }
                }
              });
            }
          }
        }
      }
    }
  }
});

function positionsMatch(width, height, elementX, elementY, clickX, clickY) {
  if (clickX > elementX && clickX < elementX + width) {
    if (clickY > elementY && clickY < elementY + height) {
      return true;
    }
  }
  return false;
}

function activityDoubleClick(activity) {
  const source = activity.source;

  const dict = getActivityDictionary();
  autocomplete(activityInputLabelWithNumber, dict, activity);
  autocomplete(activityInputLabelWithoutNumber, dict, activity);

  // ensure the right number when changing the direction of an activity
  toggleStashUse(false);

  if (source.type.includes(ACTOR)) {
    showActivityWithNumberDialog(activity);
    document.getElementById('inputLabel').focus();
  } else if (source.type.includes(WORKOBJECT)) {
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
eventBus.on(
  [
    'element.click',
    'element.dblclick',
    'element.mousedown',
    'drag.init',
    'canvas.viewbox.changing',
    'autoPlace',
    'popupMenu.open'
  ],
  10000000000,
  function(event) {
    if (isPlaying()) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
);

// HTML-Element event listeners

// show a dialog if there are unsaved changes in the domain Story
window.onbeforeunload = function() {
  if (isDirty()) return true;
};

headline.addEventListener('click', function() {
  showHeadlineDialog();
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
  saveHeadlineDialog();
});

headlineDialogButtonCancel.addEventListener('click', function() {
  closeHeadlineDialog();
});

buttonImageDownloadsCancel.addEventListener('click', function() {
  closeImageDownloadDialog();
});

activityNumberDialogButtonCancel.addEventListener('click', function() {
  closeActivityInputLabelWithNumberDialog();
});

keyboardShortcutInfoButtonCancel.addEventListener('click', function() {
  closeKeyboardShortcutDialog();
});

activityLabelButtonCancel.addEventListener('click', function() {
  closeActivityInputLabelWithoutNumberDialog();
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
  openDictionary();
});

dictionaryButtonSave.addEventListener('click', function(e) {
  dictionaryClosed(
    commandStack,
    activityDictionaryContainer,
    workobjectDictionaryContainer
  );

  dictionaryDialog.style.display = 'none';
  modal.style.display = 'none';
});

dictionaryButtonCancel.addEventListener('click', function(e) {
  dictionaryDialog.style.display = 'none';
  modal.style.display = 'none';
});

exportButton.addEventListener('click', function() {
  initiateDSTDownload();
});

svgSaveButton.addEventListener('click', function() {
  const filename =
    title.innerText + '_' + new Date().toISOString().slice(0, 10);
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
  keyboardShortcutInfo.style.display = 'block';
});

iconCustomizationSaveButton.addEventListener('click', function() {
  saveIconConfiguration();
});

cancelIconCustomizationButton.addEventListener('click', function() {
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

function dictionaryKeyBehaviour(event) {
  const KEY_ENTER = 13;
  const KEY_ESC = 27;

  if (event.keyCode === KEY_ENTER) {
    dictionaryClosed(
      commandStack,
      activityDictionaryContainer,
      workobjectDictionaryContainer
    );
    dictionaryDialog.style.display = 'none';
    modal.style.display = 'none';
  } else if (event.keyCode === KEY_ESC) {
    dictionaryDialog.style.display = 'none';
    modal.style.display = 'none';
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
    closeHeadlineDialog();
    closeActivityInputLabelWithoutNumberDialog();
    closeActivityInputLabelWithNumberDialog();
  } else if (
    (keysPressed[KEY_CTRL] && keysPressed[KEY_ENTER]) ||
    (keysPressed[KEY_ALT] && keysPressed[KEY_ENTER])
  ) {
    if (dialog == 'infoDialog') {
      info.value += '\n';
    }
  } else if (keysPressed[KEY_ENTER] && !keysPressed[KEY_SHIFT]) {
    if (dialog == 'titleDialog' || dialog == 'infoDialog') {
      saveHeadlineDialog();
    } else if (dialog == 'labelDialog') {
      saveActivityInputLabelWithoutNumber(element);
    } else if (dialog == 'numberDialog') {
      saveActivityInputLabelWithNumber(element);
    }
  }
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

function closeHeadlineDialog() {
  keysPressed = [];
  headlineDialog.style.display = 'none';
  modal.style.display = 'none';
  arrow.style.display = 'none';
}

function closeImageDownloadDialog() {
  downloadDialog.style.display = 'none';
  modal.style.display = 'none';
}

function showHeadlineDialog() {
  if (getDescriptionInputLast() == '') {
    setDescriptionInputLast(infoText.innerText);
  }
  if (getTitleInputLast() == '') {
    setTitleInputLast(title.innerText);
  }
  info.value = getDescriptionInputLast();
  titleInput.value = getTitleInputLast();
  headlineDialog.style.display = 'block';
  modal.style.display = 'block';
  arrow.style.display = 'block';
  titleInput.focus();
}

function saveHeadlineDialog() {

  let inputTitle = titleInput.value;
  const inputText = info.value;
  if (!inputTitle) {
    inputTitle = '<name of this Domain Story>';
  }

  const headerValues = {
    newTitle: inputTitle,
    newDescription: inputText,
    oldTitle: title.innerText,
    oldDescription:infoText.innerText
  };
  commandStack.execute('story.updateHeadlineAndDescription', headerValues);

  // to update the title of the svg, we need to tell the command stack, that a value has changed
  const exportArtifacts = debounce(fnDebounce, 500);

  eventBus.fire('commandStack.changed', exportArtifacts);


  keysPressed = [];
  makeDirty();
  closeHeadlineDialog();
}

function showActivityWithNumberDialog(event) {
  modal.style.display = 'block';
  activityWithNumberDialog.style.display = 'block';
  activityInputLabelWithNumber.value = '';
  activityInputNumber.value = '';

  const numberAsNumber = +event.businessObject.number;
  const numberIsAlloedMultipleTimes =
    getMultipleNumberRegistry()[numberAsNumber] === true;

  multipleNumberAllowedCheckBox.checked = numberIsAlloedMultipleTimes;

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
  keyboardShortcutInfo.style.display = 'none';
  modal.style.display = 'none';
}

function closeActivityInputLabelWithNumberDialog() {
  activityInputLabelWithNumber.value = '';
  activityInputNumber.value = '';
  keysPressed = [];
  activityWithNumberDialog.style.display = 'none';
  modal.style.display = 'none';
}

function saveActivityInputLabelWithNumber(element) {
  let labelInput = '';
  let numberInput = '';
  const multipleNumberAllowed = multipleNumberAllowedCheckBox.checked;

  const activityDictionary = getActivityDictionary();
  if (activityInputLabelWithNumber != '') {
    labelInput = activityInputLabelWithNumber.value;
    if (!activityDictionary.includes(labelInput)) {
      activityDictionary.push(labelInput);
    }
  }
  if (activityInputNumber != '') {
    numberInput = activityInputNumber.value;
  }
  const numberInputAsNumber = +numberInput;

  activityWithNumberDialog.style.display = 'none';
  modal.style.display = 'none';

  activityInputLabelWithNumber.value = '';
  activityInputNumber.value = '';
  keysPressed = [];

  const activitiesFromActors = getActivitesFromActors();
  const index = activitiesFromActors.indexOf(element);

  activitiesFromActors.splice(index, 1);

  setNumberIsMultiple(numberInputAsNumber, multipleNumberAllowed);
  element.businessObject.multipleNumberAllowed = multipleNumberAllowed;

  commandStack.execute('activity.changed', {
    businessObject: element.businessObject,
    newLabel: labelInput,
    newNumber: numberInput,
    element: element
  });
  if (element.businessObject.multipleNumberAllowed !== false) {
    if (getMultipleNumberRegistry()[numberInputAsNumber] === false) {
      updateExistingNumbersAtEditing(
        activitiesFromActors,
        numberInput,
        eventBus
      );
    }
  } else if (element.businessObject.multipleNumberAllowed === false) {
    updateExistingNumbersAtEditing(activitiesFromActors, numberInput, eventBus);
  }
  cleanDictionaries();
}

function closeActivityInputLabelWithoutNumberDialog() {
  activityInputLabelWithoutNumber.value = '';
  keysPressed = [];
  activityWithoutNumberDialog.style.display = 'none';
  modal.style.display = 'none';
}

function saveActivityInputLabelWithoutNumber(element) {
  let labelInput = '';
  const activityDictionary = getActivityDictionary();
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

function fnDebounce() {
  saveSVG(function(err, svg) {
    if (err) {
      alert('There was an error saving the SVG.\n' + err);
    }
    if (!getReplayOn()) {
      setEncoded(err ? null : svg);
    }
  });
}
