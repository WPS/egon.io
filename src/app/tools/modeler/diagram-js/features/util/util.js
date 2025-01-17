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
 * TODO: This is copied from bpmn-js 8.8.3 and might be simplified because we only use it for rendering annotations
 * ---
 * Scales the path to the given height and width.
 * <h1>Use case</h1>
 * <p>Use case is to scale the content of elements (event, gateways) based
 * on the element bounding box's size.
 * </p>
 * <h1>Why not transform</h1>
 * <p>Scaling a path with transform() will also scale the stroke and IE does not support
 * the option 'non-scaling-stroke' to prevent this.
 * Also there are use cases where only some parts of a path should be
 * scaled.</p>
 *
 * @param {string} pathId The ID of the path.
 * @param {Object} param <p>
 *   Example param object scales the path to 60% size of the container (data.width, data.height).
 *   <pre>
 *   {
 *     xScaleFactor: 0.6,
 *     yScaleFactor:0.6,
 *     containerWidth: data.width,
 *     containerHeight: data.height,
 *     position: {
 *       mx: 0.46,
 *       my: 0.2,
 *     }
 *   }
 *   </pre>
 *   <ul>
 *    <li>targetpathwidth = xScaleFactor * containerWidth</li>
 *    <li>targetpathheight = yScaleFactor * containerHeight</li>
 *    <li>Position is used to set the starting coordinate of the path. M is computed:
 *    <ul>
 *      <li>position.x * containerWidth</li>
 *      <li>position.y * containerHeight</li>
 *    </ul>
 *    Center of the container <pre> position: {
 *       mx: 0.5,
 *       my: 0.5,
 *     }</pre>
 *     Upper left corner of the container
 *     <pre> position: {
 *       mx: 0.0,
 *       my: 0.0,
 *     }</pre>
 *    </li>
 *   </ul>
 * </p>
 *
 */
export function getScaledPath(param) {
  const rawPath = {
    d: "m {mx}, {my} m 10,0 l -10,0 l 0,{e.y0} l 10,0",
    height: 30,
    width: 10,
    heightElements: [30],
    widthElements: [10],
  };

  // positioning
  // compute the start point of the path
  var mx, my;

  if (param.abspos) {
    mx = param.abspos.x;
    my = param.abspos.y;
  } else {
    mx = param.containerWidth * param.position.mx;
    my = param.containerHeight * param.position.my;
  }

  var coordinates = {}; // map for the scaled coordinates
  if (param.position) {
    // path
    var heightRatio =
      (param.containerHeight / rawPath.height) * param.yScaleFactor;
    var widthRatio =
      (param.containerWidth / rawPath.width) * param.xScaleFactor;

    // Apply height ratio
    for (
      var heightIndex = 0;
      heightIndex < rawPath.heightElements.length;
      heightIndex++
    ) {
      coordinates["y" + heightIndex] =
        rawPath.heightElements[heightIndex] * heightRatio;
    }

    // Apply width ratio
    for (
      var widthIndex = 0;
      widthIndex < rawPath.widthElements.length;
      widthIndex++
    ) {
      coordinates["x" + widthIndex] =
        rawPath.widthElements[widthIndex] * widthRatio;
    }
  }

  // Apply value to raw path
  var path = format(rawPath.d, {
    mx: mx,
    my: my,
    e: coordinates,
  });
  return path;
}

function format(str, obj) {
  return String(str).replace(tokenRegex, function (all, key) {
    return replacer(all, key, obj);
  });
}

// copied and adjusted from https://github.com/adobe-webplatform/Snap.svg/blob/master/src/svg.js
var tokenRegex = /\{([^{}]+)\}/g,
  objNotationRegex = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g; // matches .xxxxx or ["xxxxx"] to run over object properties

function replacer(all, key, obj) {
  var res = obj;
  key.replace(
    objNotationRegex,
    function (all, name, quote, quotedName, isFunc) {
      name = name || quotedName;
      if (res) {
        if (name in res) {
          res = res[name];
        }
        typeof res == "function" && isFunc && (res = res());
      }
    },
  );
  res = (res == null || res == obj ? all : res) + "";

  return res;
}
