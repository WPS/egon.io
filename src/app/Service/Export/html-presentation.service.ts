import { Injectable } from '@angular/core';
import { sanitizeForDesktop } from '../../Utils/sanitizer';
import { ElementRegistryService } from '../ElementRegistry/element-registry.service';
import { DialogService } from '../Dialog/dialog.service';
import { StoryCreatorService } from '../Replay/storyCreator/story-creator.service';
// @ts-ignore
import doT from 'dot';
import { ReplayService } from '../Replay/replay.service';
import { deepCopy } from '../../Utils/deepCopy';

@Injectable({
  providedIn: 'root',
})
/**
 * Initial idea and PR from https://github.com/indika-dev
 */
export class HtmlPresentationService {
  constructor(
    private elementRegistryService: ElementRegistryService,
    private dialogService: DialogService,
    private storyCreatorService: StoryCreatorService,
    private replayService: ReplayService
  ) {}

  private multiplexSecret: any;
  private multiplexId: any;

  private canvas: any;
  private selection: any;
  private modeler: any;

  private initialized = false;

  public initialize(canvas: any, selection: any, modeler: any): void {
    this.canvas = canvas;
    this.selection = selection;
    this.modeler = modeler;
    this.initialized = true;
  }

  private static viewBoxCoordinates(svg: any): any {
    const ViewBoxCoordinate =
      /width="([^"]+)"\s+height="([^"]+)"\s+viewBox="([^"]+)"/;
    const match = svg.match(ViewBoxCoordinate);
    return match[3];
  }

  /*
  ---------------------------
  SVG handling starts here
  ----------------------------
  */

  // tslint:disable-next-line:align
  private static createSVGData(svg: any): string {
    let data = deepCopy(svg);

    // to ensure that the title and description are inside the SVG container and do not overlap with any elements,
    // we change the confines of the SVG viewbox
    let viewBoxIndex = data.indexOf('width="');

    const viewBox = HtmlPresentationService.viewBoxCoordinates(data);

    let xLeft: number;
    let width: number;
    let yUp: number;
    let height: number;
    const splitViewBox = viewBox.split(/\s/);

    xLeft = +splitViewBox[0];
    yUp = +splitViewBox[1];
    width = +splitViewBox[2];
    height = +splitViewBox[3];

    if (width < 300) {
      width += 300;
    }

    const dataStart = data.substring(0, viewBoxIndex);
    viewBoxIndex = data.indexOf('" version');
    const dataEnd = data.substring(viewBoxIndex);
    dataEnd.substring(viewBoxIndex);

    data = dataStart + this.createBounds(xLeft, yUp, width, height) + dataEnd;

    return encodeURIComponent(data);
  }

  private static createBounds(
    xLeft: number,
    yUp: number,
    width: number,
    height: number
  ) {
    return (
      'width="100%"' +
      ' height="auto" ' +
      ' preserveAspectRatio="xMidYMid meet"' +
      ' viewBox="' +
      xLeft +
      ' ' +
      yUp +
      ' ' +
      (xLeft + width) +
      ' ' +
      (yUp + height)
    );
  }

  public async downloadHTMLPresentation(filename: string): Promise<void> {
    const svgData = [];
    // export all sentences of domain story
    this.replayService.startReplay();
    try {
      const result = await this.modeler.saveSVG({});
      this.fixActivityMarkersForEachStep(
        result,
        this.replayService.getCurrentStepNumber()
      );
      svgData.push({
        content: HtmlPresentationService.createSVGData(result.svg),
        transition: 'slide',
      });
    } catch (err) {
      alert('There was an error exporting the SVG.\n' + err);
    }
    while (
      this.replayService.getCurrentStepNumber() <
      this.replayService.getMaxStepNumber()
    ) {
      this.replayService.nextStep();
      try {
        const result = await this.modeler.saveSVG({});
        this.fixActivityMarkersForEachStep(
          result,
          this.replayService.getCurrentStepNumber()
        );
        svgData.push({
          content: HtmlPresentationService.createSVGData(result.svg),
          transition: 'slide',
        });
      } catch (err) {
        alert('There was an error exporting the SVG.\n' + err);
      }
    }
    this.replayService.stopReplay();

    // create download for presentation
    const revealjsTemplate = document.getElementById('revealjs-template');
    // @ts-ignore
    const dots = doT.template(revealjsTemplate.innerHTML);
    const revealjsData = {
      script: 'script',
      // @ts-ignore
      title: document.getElementById('title').innerHTML,
      // @ts-ignore
      description: document.getElementById('descriptionText').innerHTML,
      sentences: svgData,
      multiplexSecret: this.multiplexSecret,
      multiplexId: this.multiplexId,
    };
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/html;charset=UTF-8,' + dots(revealjsData)
    );
    element.setAttribute('download', sanitizeForDesktop(filename) + '.html');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  /**
   * There is a Problem in the HTML-Presentation, where the Arrow-Heads of the Activities are not shown after the 4th Step
   * This is due to the fact, that the marker for the Arrow-Head is defined in each Step with the same ID
   * When the 5th step is reached, the first marker is set to display none, which propagates to all other markers
   *
   * To fix this, for each Step the marker and its references are renamed
   */
  private fixActivityMarkersForEachStep(
    result: { svg: string },
    sectionIndex: number
  ): void {
    const defs = result.svg.substring(
      result.svg.indexOf('<defs>'),
      result.svg.indexOf('</defs>') + 7
    );
    const split = defs.split('<marker ');

    let newDefs = split[0];

    for (let i = 1; i < split.length; i++) {
      const ids = split[i].match(/(id="[^"]*")/g);
      // @ts-ignore
      ids.forEach((id) => {
        const idToReplace = id.substring(4, id.length - 1);
        const newId =
          idToReplace.slice(0, id.length - 5) +
          'customId' +
          sectionIndex +
          idToReplace.slice(idToReplace.length - 2);
        // @ts-ignore
        result.svg = result.svg.replaceAll(idToReplace, newId);
      });
      newDefs += '<marker display= "block !important"; ' + split[i];
    }

    result.svg = result.svg.replace(defs, newDefs);
  }
}
