import {
  updateExistingNumbersAtGeneration,
  getActivitesFromActors } from '../label-editing/DSLabelUtil';

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

// determine the next available number that is not yet in
export function generateAutomaticNumber(elementActivity,canvas, commandStack) {
  var semantic = elementActivity.businessObject;
  var canvasObjects = canvas._rootElement.children;
  var activiesFromActors = [];
  var usedNumbers = [0];
  var wantedNumber = -1;

  activiesFromActors = getActivitesFromActors(canvasObjects);
  activiesFromActors.forEach(element => {
    if (element.businessObject.number != null) {
      usedNumbers.push(element.businessObject.number);
    }
  });
  for (var i = 0; i < usedNumbers.length; i++) {
    if ((!usedNumbers.includes(i))) {
      if (!usedNumbers.includes(String(i))) {
        wantedNumber = i;
        i = usedNumbers.length;
      }
    }
  }
  if (wantedNumber == -1) {
    wantedNumber = usedNumbers.length;
  }
  updateExistingNumbersAtGeneration(activiesFromActors, wantedNumber, commandStack);
  semantic.number = wantedNumber;
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

export function isDomainStory(element) {
  return element && /domainStory:/.test(element.type);
}

export function isDomainStoryGroup(element) {
  return element && /domainStory:group/.test(element.type);
}

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