import { Element } from "diagram-js/lib/model/Types";

import { ElementTypes } from "../../domain/entities/elementTypes";
import { is } from "../../utils/util";
import EventBus from "diagram-js/lib/core/EventBus";

function getLabelAttr(semantic: any) {
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
    } else {
        return "";
    }
}

function getNumberAttr(semantic: any) {
    if (is(semantic, ElementTypes.ACTIVITY)) {
        return "number";
    } else {
        return "";
    }
}

export function getLabel(element: Element) {
    let semantic;
    if (element.businessObject) {
        semantic = element.businessObject;
    } else {
        semantic = element;
    }
    const attr = getLabelAttr(semantic);
    if (attr && semantic) {
        return semantic[attr] || "";
    }
}

export function getNumber(element: Element) {
    const semantic = element.businessObject,
        attr = getNumberAttr(semantic);

    if (attr) {
        return semantic[attr] || "";
    }
}

export function setLabel(element: Element, text: string) {
    let semantic;
    if (element.businessObject) {
        semantic = element.businessObject;
    } else {
        semantic = element;
    }
    const attr = getLabelAttr(semantic);

    if (attr) {
        semantic[attr] = text;
    }
    return element;
}

export function setNumber(element: Element, textNumber: string) {
    const semantic = element.businessObject,
        attr = getNumberAttr(semantic);

    if (attr) {
        semantic[attr] = textNumber;
    }

    return element;
}

// select at which part of the activity the label should be attached to
export function selectPartOfActivity(waypoints: any, angleActivity: any) {
    const lineLength = 49;
    let selectedActivity = 0;

    for (let i = 0; i < waypoints.length; i++) {
        if (angleActivity[i] === 0 || angleActivity[i] === 180) {
            const length = Math.abs(waypoints[i].x - waypoints[i + 1].x);
            if (length > lineLength) {
                selectedActivity = i;
            }
        }
    }
    return selectedActivity;
}

// approximate the width of the label text, standard fontsize: 11
export function calculateTextWidth(text: string) {
    if (!text) {
        return 0;
    }

    let fontsize = text.length * 5.1;
    fontsize = fontsize / 2;

    // add an initial offset to the absolute middle of the activity
    fontsize += 20;
    return fontsize;
}

/**
 * copied from https://www.w3schools.com/howto/howto_js_autocomplete.asp on 18.09.2018
 */
export function autocomplete(
    input: HTMLInputElement,
    workObjectNames: string[],
    element: Element,
    eventBus: EventBus,
) {
    closeAllLists();

    // the autocomplete function takes three arguments,
    // the text field element and an array of possible autocompleted values and
    // an optional element to which it is appended:
    let currentFocus: number, filteredWorkObjectNames: string[];

    // execute a function when someone writes in the text field:
    input.addEventListener("input", function () {
        if (workObjectNames.length === 0) {
            return;
        }

        // the direct editing field of actors and workobjects is a recycled
        // html-element and has old values that need to be overridden
        if (element["type"].includes(ElementTypes.WORKOBJECT)) {
            this.value = this.innerHTML;
        }

        const val = this.value;
        let autocompleteItem;

        // close any already open lists of autocompleted values
        closeAllLists();
        currentFocus = -1;

        // create a DIV element that will contain the items (values):
        const autocompleteList = document.createElement("DIV");
        autocompleteList.setAttribute("id", "autocomplete-list");
        autocompleteList.setAttribute("class", "autocomplete-items");

        // append the DIV element as a child of the autocomplete container:
        this.parentNode?.appendChild(autocompleteList);

        // for each item in the array...
        filteredWorkObjectNames = [];
        for (const name of workObjectNames) {
            // check if the item starts with the same letters as the text field value:
            if (val) {
                if (name.substring(0, val.length).toUpperCase() === val.toUpperCase()) {
                    // create a DIV element for each matching element:
                    autocompleteItem = document.createElement("DIV");

                    // make the matching letters bold:
                    autocompleteItem.innerHTML =
                        "<strong>" +
                        name.substring(0, val.length) +
                        "</strong>" +
                        name.substring(val.length);

                    // insert an input field that will hold the current name:
                    autocompleteItem.innerHTML +=
                        "<input type='hidden' value='" + name + "'>";
                    autocompleteList.appendChild(autocompleteItem);

                    filteredWorkObjectNames.push(name);
                }
            }
        }

        // if we edit an actor, we do not want auto-complete, since actors generally are unique
        if (element["type"].includes(ElementTypes.ACTOR)) {
            autocompleteList.style.visibility = "hidden";
        }
    });

    // execute a function presses a key on the keyboard:
    input.onkeydown = function (e: KeyboardEvent) {
        let autocompleteList: HTMLElement | HTMLCollectionOf<HTMLDivElement> | null =
            document.getElementById("autocomplete-list");
        if (autocompleteList) {
            autocompleteList = autocompleteList.getElementsByTagName("div");
        } else {
            return;
        }

        switch (e.key) {
            case "40": {
                // If the arrow DOWN key is pressed,
                // increase the currentFocus letiable:
                currentFocus++;

                // and make the current item more visible:
                addActive(autocompleteList);
                break;
            }
            case "38": {
                // up
                // If the arrow UP key is pressed,
                // decrease the currentFocus letiable:
                currentFocus--;

                // and make the current item more visible:
                addActive(autocompleteList);
                break;
            }
            case "13": {
                e.preventDefault();
                // If the ENTER key is pressed, prevent the form from being submitted,
                if (currentFocus > -1) {
                    element.businessObject.name = filteredWorkObjectNames[currentFocus];
                    eventBus.fire("element.changed", { element });
                }
                break;
            }
        }
    };

    /**
     *  a function to classify an item as "active":
     */
    function addActive(autocompleteList: HTMLCollectionOf<HTMLDivElement>) {
        if (!autocompleteList || autocompleteList.length < 1) return false;

        /* start by removing the "active" class on all items:*/
        removeActive(autocompleteList);
        if (currentFocus >= autocompleteList.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = autocompleteList.length - 1;

        /* add class "autocomplete-active":*/
        autocompleteList[currentFocus].classList.add("autocomplete-active");
        return true;
    }

    /**
     *  a function to remove the "active" class from all autocomplete items:
     */
    function removeActive(autocompleteList: HTMLCollectionOf<HTMLDivElement>) {
        if (autocompleteList.length > 1) {
            for (const item of autocompleteList) {
                item.classList.remove("autocomplete-active");
            }
        }
    }

    /**
     *  close all autocomplete lists in the document,
     *  except the one passed as an argument:
     */
    function closeAllLists(survivor?: any) {
        const autocompleteList = document.getElementsByClassName("autocomplete-items");
        for (const item of autocompleteList) {
            if (survivor != item && survivor != input) {
                item.parentNode?.removeChild(item);
            }
        }
    }

    /* execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}
