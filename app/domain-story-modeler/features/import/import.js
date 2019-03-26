'use strict';

import { registerWorkObjects, allInWorkObjectRegistry } from '../../language/workObjectRegistry';
import { allInActorRegistry, registerActors } from '../../language/actorRegistry';
import { DOMAINSTORY, ACTIVITY, CONNECTION } from '../../language/elementTypes';
import { updateCustomElementsPreviousv050, correctGroupChildren } from '../../util/CanvasObjects';
import { checkElementReferencesAndRepair } from '../../util/ImportRepair';
import { cleanDictionaries } from '../dictionary/dictionary';

var modal = document.getElementById('modal'),
    info = document.getElementById('info'),
    infoText = document.getElementById('infoText'),
    titleInput = document.getElementById('titleInput'),
    title = document.getElementById('title'),
    versionDialog = document.getElementById('versionDialog'),
    brokenDSTDialog = document.getElementById('brokenDSTDialog'),
    importedVersionLabel = document.getElementById('importedVersion'),
    modelerVersionLabel = document.getElementById('modelerVersion'),
    brokenDSTDialogButtonCancel = document.getElementById('brokenDSTDialogButtonCancel'),
    versionDialogButtonCancel = document.getElementById('closeVersionDialog');



versionDialogButtonCancel.addEventListener('click', function() {
  modal.style.display = 'none';
  versionDialog.style.display = 'none';
});

brokenDSTDialogButtonCancel.addEventListener('click', function() {
  closeBrokenDSTDialog();
});

function closeBrokenDSTDialog() {
  brokenDSTDialog.style.display = 'none';
  modal.style.display = 'none';
}

export function importDST(input, version, canvas, eventBus, modeler) {

  var reader = new FileReader();
  if (input.name.endsWith('.dst')) {
    var titleText = input.name.replace(/_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?.dst/, '');
    if (titleText.includes('.dst')) {
      titleText = titleText.replace('.dst','');
    }
    titleInput.value = titleText;
    title.innerText = titleText;

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

      var inputInfoText = lastElement.info ? lastElement.info : '';
      info.innerText = inputInfoText;
      info.value = inputInfoText;
      infoText.innerText = inputInfoText;

      adjustPositions(elements);

      modeler.importCustomElements(elements);
      cleanDictionaries(canvas);
      correctGroupChildren(canvas);
    };

    reader.readAsText(input);
  }
}

function adjustPositions(elements) {
  var xLeft , yUp;
  xLeft = elements[0].x;
  yUp = elements[0].y;

  elements.forEach(element => {
    var elXLeft = parseFloat(element.x),
        elYUp = parseFloat(element.y);
    if (elXLeft < xLeft) {
      xLeft = elXLeft;
    }
    if (elYUp < yUp) {
      yUp = elYUp;
    }
  });

  elements.forEach(element => {
    if (element.type == ACTIVITY || element.type == CONNECTION) {
      var waypoints = element.waypoints;
      waypoints.forEach(point => {
        point.x -= xLeft;
        point.y -= yUp;

        if (point.original) {
          point.original.x = point.x;
          point.original.y = point.y;
        }
      });
    } else {
      element.x -= xLeft;
      element.y -= yUp;
    }
  });
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

function showVersionDialog() {
  versionDialog.style.display = 'block';
  modal.style.display = 'block';
}

function showBrokenDSTDialog() {
  brokenDSTDialog.style.display = 'block';
  modal.style.display = 'block';
}
