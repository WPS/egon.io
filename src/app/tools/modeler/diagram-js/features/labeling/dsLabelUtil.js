"use strict";

import { ElementTypes } from "src/app/domain/entities/elementTypes";
import { is } from "../util/util";

function getLabelAttr(semantic) {
  if (
    semantic.type.includes(ElementTypes.ACTOR) ||
    semantic.type.includes(ElementTypes.WORKOBJECT) ||
    semantic.type.includes(ElementTypes.ACTIVITY) ||
    semantic.type.includes(ElementTypes.GROUP)
  ) {
    return "name";
  }
  if (semantic.type.includes(ElementTypes.TEXTANNOTATION)) {
    return "text";
  }
}

function getNumberAttr(semantic) {
  if (is(semantic, ElementTypes.ACTIVITY)) {
    return "number";
  }
}

export function getLabel(element) {
  let semantic;
  if (element.businessObject) {
    semantic = element.businessObject;
  } else {
    semantic = element;
  }
  let attr = getLabelAttr(semantic);
  if (attr && semantic) {
    return semantic[attr] || "";
  }
}

export function getNumber(element) {
  let semantic = element.businessObject,
    attr = getNumberAttr(semantic);

  if (attr) {
    return semantic[attr] || "";
  }
}

export function setLabel(element, text) {
  let semantic;
  if (element.businessObject) {
    semantic = element.businessObject;
  } else {
    semantic = element;
  }
  let attr = getLabelAttr(semantic);

  if (attr) {
    semantic[attr] = text;
  }
  return element;
}

export function setNumber(element, textNumber) {
  let semantic = element.businessObject,
    attr = getNumberAttr(semantic);

  if (attr) {
    semantic[attr] = textNumber;
  }

  return element;
}

export function selectPartOfActivity(waypoints, angleActivity) {
  let selectedActivity = 0;
  let linelength = 49;

  for (let i = 0; i < waypoints.length; i++) {
    if (angleActivity[i] === 0 || angleActivity[i] === 180) {
      let length = Math.abs(waypoints[i].x - waypoints[i + 1].x);
      if (length > linelength) {
        selectedActivity = i;
      }
    }
  }
  return selectedActivity;
}

export function approximateArialSize11TextWidthInPixel(text) {
  if (!text) {
    return 0;
  }
  // 5.1 is the approximate median width of a character in fontsize 11 with font Arial
  return text.length * 5.1;
}

export function createAutocompleteForEdit(
  editingBox,
  workObjectNames,
  businessElement,
  eventBus,
) {
  clearOldAutocompleteList();
  if (!businessElement || businessElement.type.includes(ElementTypes.ACTOR)) {
    return;
  }

  let currentFocus, workObjectNamesFilteredBySearchterm;

  editingBox.addEventListener("input", inputFunction);

  function inputFunction() {
    if (
      !workObjectNames ||
      workObjectNames.length === 0 ||
      !businessElement ||
      businessElement.type.includes(ElementTypes.ACTOR)
    ) {
      return;
    }

    // the direct editing field of actors and workobjects is a recycled html-element and has old values that need to be overridden
    if (businessElement.type.includes(ElementTypes.WORKOBJECT)) {
      this.value = this.innerHTML;
    }

    let searchterm = this.value.toUpperCase();
    currentFocus = -1;

    clearOldAutocompleteList();

    const autocompleteList = document.createElement("DIV");
    autocompleteList.setAttribute("id", "autocomplete-list");
    autocompleteList.setAttribute("class", "autocomplete-items");
    this.parentNode.appendChild(autocompleteList);

    workObjectNamesFilteredBySearchterm = [];
    for (const name of workObjectNames) {
      if (
        searchterm.length === 0 ||
        (name.toUpperCase().startsWith(searchterm) &&
          !workObjectNamesFilteredBySearchterm.includes(name))
      ) {
        const autocompleteItem = document.createElement("div");

        autocompleteItem.innerHTML = name;
        autocompleteItem.innerHTML +=
          "<input type='hidden' value='" + name + "'>";

        autocompleteItem.addEventListener("click", function (e) {
          e.preventDefault();
          currentFocus = workObjectNamesFilteredBySearchterm.indexOf(name);
          updateFocusOnAutocompleteList();
          // Keydown Events do not properly work on autoCompleteItem -> set the focus on the editigBox so the keyboard controls still work
          editingBox.focus();
        });
        // TODO dbClick should trigger the selection of the autocomplete-item

        autocompleteList.appendChild(autocompleteItem);
        workObjectNamesFilteredBySearchterm.push(name);
      }
    }
  }

  editingBox.onkeydown = function onKeyDownListener(e) {
    if (!businessElement || businessElement.type.includes(ElementTypes.ACTOR)) {
      return;
    }
    if (e.keyCode === 40) {
      // KEYDOWN
      e.preventDefault();
      currentFocus++;

      updateFocusOnAutocompleteList();
    } else if (e.keyCode === 38) {
      // KEYUP
      e.preventDefault();
      currentFocus--;

      updateFocusOnAutocompleteList();
    } else if (e.key === "Enter") {
      // ENTER
      e.preventDefault();
      if (currentFocus > -1) {
        businessElement.businessObject.name =
          workObjectNamesFilteredBySearchterm[currentFocus];
        eventBus.fire("element.changed", { element: businessElement });

        // remove obsolete listener
        // it is always added when opening the editingBox with the associated businessObject as Context
        editingBox.removeEventListener("input", inputFunction);
      }
    }
  };

  function clearOldAutocompleteList(target) {
    const oldAutocompleteList = document.getElementById("autocomplete-list");
    if (
      oldAutocompleteList &&
      !(
        target?.classList.contains("djs-direct-editing-content") ||
        target?.parentElement.id === "autocomplete-list"
      )
    ) {
      oldAutocompleteList.parentNode.removeChild(oldAutocompleteList);
      return true;
    }
    return false;
  }

  function updateFocusOnAutocompleteList() {
    const autocompleteList = document.getElementById("autocomplete-list");
    const autocompleteListItems = autocompleteList.getElementsByTagName("div");
    if (!autocompleteListItems || autocompleteListItems.length < 1) {
      return;
    }

    for (const item of autocompleteListItems) {
      item.classList.remove("autocomplete-active");
    }

    // wrapAround
    if (currentFocus >= autocompleteListItems.length) {
      currentFocus = 0;
    } else if (currentFocus < 0) {
      currentFocus = autocompleteListItems.length - 1;
    }

    autocompleteListItems[currentFocus].classList.add("autocomplete-active");
  }

  document.addEventListener("click", function (e) {
    if (clearOldAutocompleteList(e.target)) {
      // remove event listener
      // it is always added when opening the editingBox with the associated businessObject as Context
      //editingBox.removeEventListener("input", inputFunction);
    }
  });
}
