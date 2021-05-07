'use strict';

export function debounce(fn, timeout) {
  let timer;

  return function() {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(fn, timeout);
  };
}

export function changeWebsiteTitle(title) {
  document.title = title + ' - Domain Story Modeler';
}

export function reworkGroupElements(parent, shape) {

  parent.children.slice().forEach(innerShape => {
    if ((innerShape.id) != shape.id) {
      if (innerShape.x >= shape.x && innerShape.x <= shape.x + shape.width) {
        if (innerShape.y >= shape.y && innerShape.y <= shape.y + shape.height) {
          innerShape.parent = shape;
          if (!shape.children.includes(innerShape)) {
            shape.children.push(innerShape);
          }
        }
      }
    }
  });
}

export function undoGroupRework(parent, shape) {
  const superParent = parent.parent;

  parent.children.remove(shape);
  superParent.children.add(shape);

  shape.parent = superParent;

  const svgShape = document.querySelector(
    '[data-element-id=' + shape.id + ']'
  ).parentElement;
  const svgGroup = svgShape.parentElement;
  const svgGroupParent = svgGroup.parentElement.parentElement;

  svgGroup.removeChild(svgShape);
  svgGroupParent.appendChild(svgShape);
}