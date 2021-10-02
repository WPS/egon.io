import { Injectable } from '@angular/core';
import { sanitizeForDesktop } from '../../common/util/sanitizer';
import { ElementRegistryService } from '../../elementRegistry-service/element-registry.service';
import { DialogService } from '../../dialog/service/dialog.service';
import { StoryCreatorService } from '../../storyCreator-service/story-creator.service';
// @ts-ignore
import doT from 'dot';
import { ReplayService } from '../../replay-service/replay.service';

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
    let data = JSON.parse(JSON.stringify(svg));

    // to ensure that the title and description are inside the SVG container and do not overlapp with any elements,
    // we change the confines of the SVG viewbox
    let viewBoxIndex = data.indexOf('width="');

    const viewBox = HtmlPresentationService.viewBoxCoordinates(data);

    let xLeft: number;
    let width: number;
    let yUp: number;
    let height: number;
    let bounds: string;
    const splitViewBox = viewBox.split(/\s/);

    xLeft = +splitViewBox[0];
    yUp = +splitViewBox[1];
    width = +splitViewBox[2];
    height = +splitViewBox[3];

    if (width < 300) {
      width += 300;
    }

    bounds =
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
      (yUp + height);

    const dataStart = data.substring(0, viewBoxIndex);
    viewBoxIndex = data.indexOf('" version');
    const dataEnd = data.substring(viewBoxIndex);
    dataEnd.substring(viewBoxIndex);

    data = dataStart + bounds + dataEnd;

    return encodeURIComponent(data);
  }

  public initialize(canvas: any, selection: any, modeler: any): void {
    this.canvas = canvas;
    this.selection = selection;
    this.modeler = modeler;
    this.initialized = true;
  }

  public async downloadHTMLPresentation(filename: string): Promise<void> {
    const svgData = [];
    // export all sentences of domain story
    this.replayService.startReplay();
    try {
      const result = await this.modeler.saveSVG({});
      this.fixSvgDefinitions(result, this.replayService.getCurrentStepNumber());
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
        this.fixSvgDefinitions(
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

  private fixSvgDefinitions(
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
