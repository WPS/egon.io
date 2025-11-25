// TODO: this will not work for actors and work objects as the name of the icon is part of the type
export function is(element, type) {
  const bo = getBusinessObject(element);

  return bo && bo.type === type;
}

export function getBusinessObject(element) {
  return (element && element.businessObject) || element;
}

export function reworkGroupElements(parent, shape) {
  parent.children.slice().forEach((innerShape) => {
    if (innerShape.id !== shape.id) {
      if (innerShape.x >= shape.x && innerShape.x <= shape.x + shape.width) {
        if (innerShape.y >= shape.y && innerShape.y <= shape.y + shape.height) {
          if (innerShape.children.includes(shape)) {
            innerShape.children.remove(shape);
          }
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
    "[data-element-id=" + shape.id + "]",
  ).parentElement;
  const svgGroup = svgShape.parentElement;
  const svgGroupParent = svgGroup.parentElement.parentElement;
  svgGroup.removeChild(svgShape);
  svgGroupParent.appendChild(svgShape);
}

export function isCustomIcon(icon) {
  // default icons are provided as SVG
  // custom icons are provided as "Data URL" with a base64-encoded image as payload
  return icon.startsWith("data");
}

export function isCustomSvgIcon(icon) {
  // default icons are provided as SVG
  // custom icons are provided as "Data URL" with a base64-encoded image as payload
  return icon.startsWith("data:image/svg");
}

/**
 * Annotations have a bracket on the left side.
 */
export function getAnnotationBracketSvg(height) {
  return `m 0, 0 m 10,0 l -10,0 l 0,${height} l 10,0`;
}
