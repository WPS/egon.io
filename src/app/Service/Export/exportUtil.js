import {
  SVG_LINK,
  TEXTSPAN_DESCRIPTION_HEIGHT,
  TEXTSPAN_TITLE_HEIGHT,
  X_OFFSET_UTIL,
} from "../../Domain/Export/exportConstants";

let dynamicHeightOffset = 0;

// Has to be js File so we can access te correct non-standard HTML-Properties without excessive usage of ts-ignore
export function createTitleAndDescriptionSVGElement(
  initDynamicHeightOffset,
  title,
  description,
  xLeft,
  yUp,
  width,
) {
  dynamicHeightOffset = initDynamicHeightOffset;

  title = title.replace("&lt;", "").replace("&gt;", "");

  let titleElement = createTitle(title, width);

  let descriptionElement = createDescription(description, width);

  // to display the title and description in the SVG-file, we need to add a container for our text-elements

  let insertText =
    '<g class="djs-group"><g class="djs-element djs-shape" style = "display:block" transform="translate(' +
    (xLeft - 10) +
    " " +
    (yUp - dynamicHeightOffset) +
    ')"><g class="djs-visual">' +
    titleElement +
    descriptionElement +
    "</g></g></g>";
  return { insertText, dynamicHeightOffset: dynamicHeightOffset };
}

function createTitle(text, width) {
  let tempCanvas = document.createElement("canvas");
  let ctx = tempCanvas.getContext("2d");
  ctx.font = "30px Arial";

  return createTextSpans(text, width, ctx, 10, TEXTSPAN_TITLE_HEIGHT, 30);
}

function createDescription(text, width) {
  let description = "";
  let descriptionParts = text.split("<br>");

  let tempCanvas = document.createElement("canvas");
  let ctx = tempCanvas.getContext("2d");
  ctx.font = "12px Arial";

  for (let i = 0; i < descriptionParts.length; i++) {
    description += createTextSpans(
      descriptionParts[i],
      width,
      ctx,
      0,
      TEXTSPAN_DESCRIPTION_HEIGHT,
      12,
    );
  }
  return description;
}

function createTextSpans(text, width, ctx, yOffset, heightOffset, fontSize) {
  let textSpans = "";
  let words = text.split(" ");

  let textTag =
    '<text lineHeight="1.2" class="djs-label" style="font-family: Arial, sans-serif; font-size: ' +
    fontSize +
    '; font-weight: normal; fill: rgb(0, 0, 0);">';

  let textSpan = document.createElementNS(SVG_LINK, "tspan");
  let textNode = document.createTextNode(words[0]);

  textSpan.setAttribute("x", X_OFFSET_UTIL);
  textSpan.setAttribute("y", yOffset + dynamicHeightOffset);
  textSpan.setAttribute("font-size", fontSize);
  textSpan.appendChild(textNode);

  for (let j = 1; j < words.length; j++) {
    if (textSpan.firstChild && textSpan.firstChild.data) {
      let len = textSpan.firstChild.data.length;
      textNode.data += " " + words[j];

      if (ctx.measureText(textNode.data).width > width - 16) {
        dynamicHeightOffset += heightOffset;
        textSpan.firstChild.data = textSpan.firstChild.data.slice(0, len); // remove overflow word

        textSpans += textTag + textSpan.outerHTML + "</text>"; // append line

        // create new textspan for line break
        textSpan = document.createElementNS(SVG_LINK, "tspan");
        textNode = document.createTextNode(words[j]);
        textSpan.setAttribute("x", X_OFFSET_UTIL);
        textSpan.setAttribute("y", yOffset + dynamicHeightOffset);
        textSpan.appendChild(textNode);
      }
    }
  }
  dynamicHeightOffset += heightOffset;

  textSpans += textTag + textSpan.outerHTML + "</text>";
  return textSpans;
}
