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