import { Injectable } from '@angular/core';
import { ConfigAndDST } from 'src/app/tools/export/domain/export/configAndDst';
import { createTitleAndDescriptionSVGElement } from 'src/app/tools/export/services/exportUtil';
import { ModelerService } from '../../modeler/services/modeler.service';
import {
  DEFAULT_PADDING,
  TEXTSPAN_TITLE_HEIGHT,
} from '../domain/export/exportConstants';
import { StoryCreatorService } from '../../replay/services/story-creator.service';
import { StorySentence } from '../../replay/domain/storySentence';
import { sanitizeTextForSVGExport } from 'src/app/utils/sanitizer';

@Injectable({
  providedIn: 'root',
})
export class SvgService {
  private cacheData = '';

  constructor(
    private modelerService: ModelerService,
    private storyCreatorService: StoryCreatorService,
  ) {}

  createSVGData(
    title: string,
    description: string,
    dst: ConfigAndDST,
    withTitle: boolean,
    useWhiteBackground: boolean,
    animationSpeed?: number,
  ): string {
    this.cacheData = this.modelerService.getEncoded();

    let domainStorySvg = structuredClone(this.cacheData);

    if (animationSpeed) {
      domainStorySvg = this.createAnimatedSvg(domainStorySvg, animationSpeed);
    }

    let viewBoxIndex = domainStorySvg.indexOf('width="');

    let { width, height, viewBox } = this.viewBoxCoordinates(domainStorySvg);

    // The value of the viewBox attribute is a list of four numbers separated by whitespace
    // and/or a comma: min-x, min-y, width, and height. min-x and min-y represent the smallest
    // X and Y coordinates that the viewBox may have (the origin coordinates of the viewBox)
    // and the width and height specify the viewBox size. The resulting viewBox is a
    // rectangle in user space mapped to the bounds of the viewport of an SVG element.
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox

    let min_x: number;
    let viewBoxWidth: number;
    let min_y: number;
    let viewBoxHeight: number;
    const splitViewBox = viewBox.split(/\s/);

    min_x = +splitViewBox[0];
    min_y = +splitViewBox[1];
    viewBoxWidth = +splitViewBox[2];
    viewBoxHeight = +splitViewBox[3];

    // Set minimum width to ensure title and description are displayed reasonably
    if (viewBoxWidth < 300) {
      viewBoxWidth += 300;
      width += 300;
    }

    const { insertText, dynamicHeightOffset } =
      createTitleAndDescriptionSVGElement(
        0,
        title,
        description,
        min_x,
        min_y,
        width,
      );

    const bounds = this.createBounds(
      width,
      height,
      min_x,
      min_y,
      viewBoxWidth,
      viewBoxHeight,
      withTitle,
      dynamicHeightOffset,
    );

    const dataStart = domainStorySvg.substring(0, viewBoxIndex);
    viewBoxIndex = domainStorySvg.indexOf('" version');

    const dataEnd = domainStorySvg.substring(viewBoxIndex);
    dataEnd.substring(viewBoxIndex);

    domainStorySvg = dataStart + bounds + dataEnd;

    const insertIndex = this.findIndexToInsertData(domainStorySvg);

    if (withTitle) {
      domainStorySvg =
        domainStorySvg.slice(0, insertIndex) +
        insertText +
        domainStorySvg.slice(insertIndex);
    }

    if (useWhiteBackground) {
      const svgIndex = domainStorySvg.indexOf('width="');
      const backgroundColorWhite = 'style="background-color:white" ';
      domainStorySvg =
        domainStorySvg.slice(0, svgIndex) +
        backgroundColorWhite +
        domainStorySvg.slice(svgIndex);
    }

    return this.appendSourceCode(domainStorySvg, dst);
  }

  private createAnimatedSvg(
    domainStorySvg: string,
    animationSpeed: number = 2,
  ) {
    const story: StorySentence[] =
      this.storyCreatorService.traceActivitiesAndCreateStory();
    const usedElementId: string[] = [];
    const storyLength = story.length;
    const visibleTimeInPercent = Math.floor(100 / storyLength);
    const durationOfAnimation = storyLength * animationSpeed;
    let sentenceCounter = 1;
    let currentVisibleTimeInPercent = visibleTimeInPercent;
    let previousVisibleTimeInPercent = visibleTimeInPercent;
    story.forEach((sentence) => {
      const objects = sentence.objects.filter(
        (it) => !usedElementId.includes(it.id),
      );
      objects.forEach((objectId) => {
        usedElementId.push(objectId.id);
        const idIndex = domainStorySvg.indexOf(objectId.id);
        const insertIdIndex = domainStorySvg.indexOf('>', idIndex);
        domainStorySvg = `${domainStorySvg.slice(0, insertIdIndex)} id="group${sentenceCounter}" ${domainStorySvg.slice(insertIdIndex)}`;

        const index = domainStorySvg.indexOf(objectId.id);
        const insertIndex = domainStorySvg.indexOf('>', index) + 1;
        if (sentenceCounter > 1) {
          domainStorySvg = `${domainStorySvg.slice(0, insertIndex)}
            <style>
              #group${sentenceCounter} {
                  opacity: 0;
                  animation: visibilityControl${sentenceCounter} ${durationOfAnimation}s infinite;
              }
              @keyframes visibilityControl${sentenceCounter} {
                  ${previousVisibleTimeInPercent - 1}% { opacity: 0; }    /* Initially invisible */
                  ${previousVisibleTimeInPercent}% { opacity: 1; }  /* Starts becoming visible */
                  98% { opacity: 1; }   /* Stays visible */
                  99% { opacity: 0; }   /* Starts disappearing */
                  100% { opacity: 0; }  /* Fully invisible */
              }
            </style>  ${domainStorySvg.slice(insertIndex)}`;
        }
      });
      sentenceCounter += 1;
      previousVisibleTimeInPercent = currentVisibleTimeInPercent;
      currentVisibleTimeInPercent = visibleTimeInPercent * sentenceCounter;
    });
    return domainStorySvg;
  }

  private findIndexToInsertData(data: string) {
    let insertIndex = data.indexOf('</defs>');
    if (insertIndex < 0) {
      insertIndex = data.indexOf('version="1.1">') + 14; // diagram-js exports SVG v. 1.1
    } else {
      insertIndex += 7;
    }
    return insertIndex;
  }

  private createBounds(
    width: number,
    height: number,
    min_x: number,
    min_y: number,
    viewBoxWidth: number,
    viewBoxHeight: number,
    withTitle: boolean,
    dynamicHeightOffset: number,
  ): string {
    height = withTitle
      ? height + dynamicHeightOffset + TEXTSPAN_TITLE_HEIGHT
      : height;
    min_x = min_x - DEFAULT_PADDING;
    min_y = withTitle
      ? min_y - dynamicHeightOffset - TEXTSPAN_TITLE_HEIGHT
      : min_y;
    viewBoxHeight = withTitle
      ? viewBoxHeight +
        dynamicHeightOffset +
        TEXTSPAN_TITLE_HEIGHT +
        DEFAULT_PADDING
      : viewBoxHeight;
    viewBoxWidth = viewBoxWidth + DEFAULT_PADDING;

    return `width="${width}" height="${height}" viewBox="${min_x} ${min_y} ${viewBoxWidth} ${viewBoxHeight}`;
  }

  private viewBoxCoordinates(svg: string): {
    width: number;
    height: number;
    viewBox: string;
  } {
    const ViewBoxCoordinate =
      /width="([^"]+)"\s+height="([^"]+)"\s+viewBox="([^"]+)"/;
    const match = svg.match(ViewBoxCoordinate);
    if (match) {
      return { width: +match[1], height: +match[2], viewBox: match[3] };
    }
    return { width: 0, height: 0, viewBox: '' };
  }

  private appendSourceCode(data: string, dst: ConfigAndDST): string {
    data +=
      '\n<!-- <DST>\n' +
      sanitizeTextForSVGExport(JSON.stringify(dst, null, 2)) +
      '\n </DST> -->';
    return data;
  }
}
