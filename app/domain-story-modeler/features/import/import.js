'use strict';

import { DOMAINSTORY, WORKOBJECT, ACTOR } from '../../language/elementTypes';
import {
  checkElementReferencesAndRepair,
  updateCustomElementsPreviousv050,
  adjustPositions,
  correctGroupChildren
} from './ImportRepair';
import { cleanDictionaries } from '../dictionary/dictionary';
import {
  correctElementRegitryInit,
  initElementRegistry
} from '../../language/canvasElementRegistry';
import {
  storyPersistTag,
  loadConfiguration,
  importConfiguration,
  saveIconConfiguration
} from '../iconSetCustomization/persitence';
import { removeDirtyFlag } from '../export/dirtyFlag';
import { addIMGToIconDictionary } from '../iconSetCustomization/appendIconDictionary';
import { debounce, changeWebsiteTitle } from '../../util/helpers';
import { domExists } from '../../language/testmode';
import {
  getTypeDictionaryKeys,
  allInTypeDictionary,
  registerIcons
} from '../../language/icon/dictionaries';
import { sanitizeIconName } from '../../util/Sanitizer';
import { Dict } from '../../language/classes/collection';

export const DST_TYPE = 1;
export const SVG_TYPE = 2;

let modal = document.getElementById('modal'),
    info = document.getElementById('info'),
    infoText = document.getElementById('infoText'),
    titleInput = document.getElementById('titleInput'),
    title = document.getElementById('title'),
    versionInfo = document.getElementById('versionInfo'),
    brokenDSTInfo = document.getElementById('brokenDSTInfo'),
    brokenSVGInfo = document.getElementById('brokenSVGInfo'),
    importedVersionLabel = document.getElementById('importedVersion'),
    modelerVersionLabel = document.getElementById('modelerVersion'),
    brokenDSTDialogButtonCancel = document.getElementById(
      'brokenDSTDialogButtonCancel'
    ),
    brokenSVGDialogButtonCancel = document.getElementById(
      'brokenSVGDialogButtonCancel'
    ),
    versionDialogButtonCancel = document.getElementById('closeVersionDialog');

let titleInputLast = '',
    descriptionInputLast = '';

if (versionDialogButtonCancel) {
  versionDialogButtonCancel.addEventListener('click', function() {
    modal.style.display = 'none';
    versionInfo.style.display = 'none';
  });

  brokenDSTDialogButtonCancel.addEventListener('click', function() {
    closeBrokenDSTDialog();
  });

  brokenSVGDialogButtonCancel.addEventListener('click', function() {
    closeBrokenSVGDialog();
  });
}

export function getTitleInputLast() {
  return titleInputLast;
}

export function getDescriptionInputLast() {
  return descriptionInputLast;
}

export function setDescriptionInputLast(description) {
  descriptionInputLast = description;
}

export function setTitleInputLast(title) {
  titleInputLast = title;
}

export function initImports(
    elementRegistry,
    version,
    modeler,
    eventBus,
    saveSVG
) {
  document.getElementById('import').onchange = function() {
    initElementRegistry(elementRegistry);
    const filename = document.getElementById('import').files[0].name;
    if (filename.endsWith('.dst')) {
      importDST(document.getElementById('import').files[0], filename, version, modeler);
    } else if (filename.endsWith('.svg')) {
      importSVG(document.getElementById('import').files[0], filename, version, modeler);
    }

    // to update the title of the svg, we need to tell the command stack, that a value has changed
    eventBus.fire('commandStack.changed', debounce(saveSVG, 500));

    titleInputLast = titleInput.value;
  };

  document.getElementById('importIcon').onchange = function() {
    const inputIcon = document.getElementById('importIcon').files[0];
    let reader = new FileReader();
    const endIndex = inputIcon.name.lastIndexOf('.');
    let name = sanitizeIconName(inputIcon.name.substring(0, endIndex));

    reader.onloadend = function(e) {
      addIMGToIconDictionary(e.target.result, name + '-custom');
    };

    reader.readAsDataURL(inputIcon);
  };

  document.getElementById('importConfig').onchange = function() {
    importConfiguration(document.getElementById('importConfig').files[0]);
  };
}

export function loadPersistedDST(modeler) {
  (titleInputLast = ''), (descriptionInputLast = '');

  const persitedStory = localStorage.getItem(storyPersistTag);
  localStorage.removeItem(storyPersistTag);

  const completeJSON = JSON.parse(persitedStory);
  const titleText = completeJSON.title;
  const elements = completeJSON.objects;

  const title = document.getElementById('title');
  title.innerText = titleText;
  changeWebsiteTitle(titleText);

  let lastElement = elements.pop();
  let importVersionNumber = lastElement;
  if (lastElement.version) {
    lastElement = elements.pop();
  }
  if (importVersionNumber.version) {
    importVersionNumber = importVersionNumber.version;
  } else {
    importVersionNumber = '?';
  }

  updateIconRegistries(elements);

  setInfoText(lastElement);

  modeler.importCustomElements(elements);
  correctElementRegitryInit();
  cleanDictionaries();
  removeDirtyFlag();
}

export function restoreTitleFromFileName(filename, isSVG) {
  let title = '';

  const dstRegex = /_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?.dst/;
  const svgRegex = /_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?.dst.svg/;

  const dstSuffix = '.dst';
  const svgSuffix = '.svg';

  let filenameWithoutDateSuffix = filename.replace(isSVG ? svgRegex : dstRegex,
    ''
  );
  if (filenameWithoutDateSuffix.includes(isSVG? svgSuffix : dstSuffix, '')) {
    filenameWithoutDateSuffix = filenameWithoutDateSuffix.replace(isSVG? svgSuffix : dstSuffix, '');
  }
  title = filenameWithoutDateSuffix;
  return title;
}

export function importDST(input, filename, version, modeler) {
  titleInputLast = '';
  descriptionInputLast = '';

  const reader = new FileReader();
  let titleText = restoreTitleFromFileName(filename, false);
  titleInput.value = titleText;
  title.innerText = titleText;
  changeWebsiteTitle(titleText);

  reader.onloadend = function(e) {
    readerFunction(e.target.result, version, modeler, DST_TYPE);
  };

  reader.readAsText(input);
}

export function importSVG(input, filename, version, modeler) {
  titleInputLast = '';
  descriptionInputLast = '';

  const reader = new FileReader();
  let titleText = restoreTitleFromFileName(filename, true);
  titleInput.value = titleText;
  title.innerText = titleText;
  changeWebsiteTitle(titleText);

  reader.onloadend = function(e) {
    readerFunction(e.target.result, version, modeler, SVG_TYPE);
  };

  reader.readAsText(input);
}

export function readerFunction(text, version, modeler, type) {
  let dstText;
  if (type === SVG_TYPE) {
    dstText = removeXMLComments(text);
  } else if (type === DST_TYPE) {
    dstText = text;
  }

  let elements, config;
  let configChanged = false;

  let dstAndConfig;
  try {
    dstAndConfig = JSON.parse(dstText);
  } catch (e) {
    if (type === DST_TYPE) {
      showBrokenDSTDialog();
    }
    else if (type === SVG_TYPE) {
      showBrokenSVGDialog();
    }
  }

  if (dstAndConfig == null) {
    return;
  }

  if (dstAndConfig.domain) {
    config = dstAndConfig.domain;
    configChanged = configHasChanged(config);
    if (configChanged) {
      const name = loadConfiguration(config);
      if (domExists()) {
        const domainNameInput = document.getElementById('domainNameInput');
        domainNameInput.value = name;
      }
    }
    elements = JSON.parse(dstAndConfig.dst);
  } else {
    if (dstAndConfig.config) {
      config = dstAndConfig.config;
      configChanged = configHasChanged(config);
      if (configChanged) {
        const name = loadConfiguration(config);
        if (domExists()) {
          const domainNameInput = document.getElementById('domainNameInput');
          domainNameInput.value = name;
        }
      }
      elements = JSON.parse(dstAndConfig.dst);
    } else {
      elements = JSON.parse(dstText);
    }
  }

  let lastElement = elements.pop();
  let importVersionNumber = lastElement;

  if (lastElement.version) {
    lastElement = elements.pop();
  }
  if (domExists()) {
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

    const allReferences = checkElementReferencesAndRepair(elements);
    if (!allReferences) {
      showBrokenDSTDialog();
    }

    setInfoText(lastElement);

    adjustPositions(elements);
  }

  updateIconRegistries(elements);
  modeler.importCustomElements(elements);

  if (configChanged) {
    saveIconConfiguration();
  }
  if (domExists()) {
    correctElementRegitryInit();
    cleanDictionaries();
    correctGroupChildren();
    removeDirtyFlag();
  }
}

function removeXMLComments(xmlText) {
  xmlText = xmlText.substring(xmlText.indexOf('<DST>'));
  while (xmlText.includes('<!--') || xmlText.includes('-->')) {
    xmlText = xmlText.replace('<!--', '').replace('-->', '');
  }
  xmlText = xmlText.replace('<DST>', '');
  xmlText = xmlText.replace('</DST>', '');
  return xmlText;
}

export function configHasChanged(config) {
  const customConfigJSON = JSON.parse(config);
  const newActorsDict = new Dict();
  const newWorkObjectsDict = new Dict();

  newActorsDict.addEach(customConfigJSON.actors);
  newWorkObjectsDict.addEach(customConfigJSON.workObjects);

  const newActorKeys = newActorsDict.keysArray();
  const newWorkObjectKeys = newWorkObjectsDict.keysArray();
  const currentActorKeys = getTypeDictionaryKeys(ACTOR);
  const currentWorkobjectKeys = getTypeDictionaryKeys(WORKOBJECT);

  let changed = false;

  for (let i = 0; i < newActorKeys.length; i++) {
    if (
      currentActorKeys[i] != newActorKeys[i] &&
      currentActorKeys[i] != (ACTOR + newActorKeys[i])
    ) {
      changed = true;
      i = newActorKeys.length;
    }
  }
  if (!changed) {
    for (let i = 0; i < newWorkObjectKeys.length; i++) {
      if (
        currentWorkobjectKeys[i] != newWorkObjectKeys[i] &&
        currentWorkobjectKeys[i] != (WORKOBJECT + newWorkObjectKeys[i])
      ) {
        changed = true;
        i = newWorkObjectKeys.length;
      }
    }
  }
  return changed;
}

function setInfoText(element) {
  const inputInfoText = element.info ? element.info : '';
  info.innerText = inputInfoText;
  info.value = inputInfoText;
  infoText.innerText = inputInfoText;
}

function updateIconRegistries(elements) {
  const actorIcons = getElementsOfType(elements, 'actor');
  const workObjectIcons = getElementsOfType(elements, 'workObject');

  if (!allInTypeDictionary(ACTOR, actorIcons)) {
    registerIcons(ACTOR, actorIcons);
  }
  if (!allInTypeDictionary(WORKOBJECT, workObjectIcons)) {
    registerIcons(WORKOBJECT, workObjectIcons);
  }
}

function getElementsOfType(elements, type) {
  let elementOfType = [];
  elements.forEach(element => {
    if (element.type.includes(DOMAINSTORY + type)) {
      elementOfType.push(element);
    }
  });
  return elementOfType;
}

function showVersionDialog() {
  versionInfo.style.display = 'block';
  modal.style.display = 'block';
}

function showBrokenDSTDialog() {
  brokenDSTInfo.style.display = 'block';
  modal.style.display = 'block';
}

function showBrokenSVGDialog() {
  brokenSVGInfo.style.display = 'block';
  modal.style.display = 'block';
}

function closeBrokenSVGDialog() {
  brokenSVGInfo.style.display = 'none';
  modal.style.display = 'none';
}

function closeBrokenDSTDialog() {
  brokenDSTInfo.style.display = 'none';
  modal.style.display = 'none';
}