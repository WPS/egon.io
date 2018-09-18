import { is } from 'bpmn-js/lib/util/ModelUtil';

// creates a SVG path that describes a rectangle which encloses the given shape.
export function getRectPath(shape) {
  var offset = 5;
  var x = shape.x,
      y = shape.y,
      width = (shape.width / 2) + offset,
      height = (shape.height / 2) + offset;

  var rectPath = [
    ['M', x, y],
    ['l', width, 0],
    ['l', width, height],
    ['l', -width, height],
    ['l', -width, 0],
    ['z']
  ];
  return rectPath;
}

// approximate the width of the label text, standard fontsize: 11
export function calculateTextWidth(text) {
  var fontsize = text.length * 5.1;
  fontsize = fontsize / 2;
  // add an initial offset, since the calculateXY Position gives the absolute middle of the activity and we want the start directly under the number
  fontsize += 20;
  return fontsize;
}

// check element type
export function isDomainStory(element) {
  return element && /domainStory:/.test(element.type);
}

// check if element is of type domainStory:group
export function isDomainStoryGroup(element) {
  return element && /domainStory:group/.test(element.type);
}

// check if element parent is of type domainStory:group
export function isInDomainStoryGroup(element) {
  return isDomainStoryGroup(element.parent);
}

export function ifDomainStoryElement(fn) {
  return function(event) {
    var context = event.context,
        element = context.shape || context.connection;

    if (isDomainStory(element)) {
      fn(event);
    }
  };
}

export function isDomainStoryElement(element) {
  return is(element, 'domainStory:actorPerson') ||
    is(element, 'domainStory:actorGroup') ||
    is(element, 'domainStory:actorSystem') ||
    is(element, 'domainStory:workObject') ||
    is(element, 'domainStory:workObjectFolder') ||
    is(element, 'domainStory:workObjectCall') ||
    is(element, 'domainStory:workObjectEmail') ||
    is(element, 'domainStory:workObjectBubble') ||
    is(element, 'domainStory:activity') ||
    is(element, 'domainStory:connection') ||
    is(element, 'domainStory:group') ||
    is(element, 'domainStory:workObjectInfo');
}

// -- helpers --//

export function copyWaypoints(connection) {
  return connection.waypoints.map(function(p) {
    if (p.original) {
      return {
        original: {
          x: p.original.x,
          y: p.original.y
        },
        x: p.x,
        y: p.y
      };
    } else {
      return {
        x: p.x,
        y: p.y
      };
    }
  });
}


/**
 * copied from https://www.w3schools.com/howto/howto_js_autocomplete.asp on 18.09.2018
 */
export function autocomplete(inp, arr, element) {
  /* the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /* execute a function when someone writes in the text field:*/
  inp.addEventListener('input', function(e) {
    var a, b, i, val = this.value;
    /* close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) { val=this.innerHTML;}
    currentFocus = -1;
    /* create a DIV element that will contain the items (values):*/
    a = document.createElement('DIV');
    a.setAttribute('id', 'autocomplete-list');
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
          if (this.value) {
            inp.value = this.getElementsByTagName('input')[0].value;
          } else {
            inp.innerHTML = this.getElementsByTagName('input')[0].value;
          }
          /* close the list of autocompleted values,
              (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
    // if we edit an actor, we do not want auto-complete, since actors generally are unique
    if (element.type.includes('domainStory:actor')) {
      a.style.visibility = 'hidden';
    }
  });

  /* execute a function presses a key on the keyboard:*/
  inp.addEventListener('keydown', function(e) {
    var x = document.getElementById('autocomplete-list');
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