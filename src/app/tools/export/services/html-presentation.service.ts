import { Injectable } from '@angular/core';
import { sanitizeForDesktop } from '../../../utils/sanitizer';
import { ReplayService } from '../../replay/services/replay.service';
// @ts-ignore
import doT from 'dot';
import { TitleService } from '../../title/services/title.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Initial idea and PR from https://github.com/indika-dev
 */
export class HtmlPresentationService {
  constructor(
    private replayService: ReplayService,
    private titleService: TitleService,
  ) {}

  private multiplexSecret: any;
  private multiplexId: any;

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

  async downloadHTMLPresentation(
    filename: string,
    modeler: any,
  ): Promise<void> {
    modeler.fitStoryToScreen(); // fixes problem with HTML export when story is not in the visible area of the canvas
    const svgData = [];
    // export all sentences of domain story
    this.replayService.startReplay();
    try {
      const result = await modeler.saveSVG({});
      this.fixActivityMarkersForEachSentence(
        result,
        this.replayService.getCurrentSentenceNumber(),
      );
      svgData.push({
        content: HtmlPresentationService.createSVGData(result.svg),
        transition: 'slide',
      });
    } catch (err) {
      alert('There was an error exporting the SVG.\n' + err);
    }
    while (
      this.replayService.getCurrentSentenceNumber() <
      this.replayService.getMaxSentenceNumber()
    ) {
      this.replayService.nextSentence();
      try {
        const result = await modeler.saveSVG({});
        this.fixActivityMarkersForEachSentence(
          result,
          this.replayService.getCurrentSentenceNumber(),
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
    const dots = doT.template(revealjsTemplate?.innerHTML);
    const revealjsData = {
      script: 'script',
      title: this.titleService.getTitle(),
      description: this.titleService.getDescription(),
      sentences: svgData,
      multiplexSecret: this.multiplexSecret,
      multiplexId: this.multiplexId,
    };
    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/html;charset=UTF-8,' +
        this.fixMalformedHtmlScript(dots, revealjsData),
    );
    element.setAttribute('download', sanitizeForDesktop(filename) + '.html');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  private fixMalformedHtmlScript(
    dots: any,
    revealjsData: {
      multiplexId: any;
      sentences: any[];
      multiplexSecret: any;
      description: string;
      title: string;
      script: string;
    },
  ) {
    return dots(revealjsData).replace('</ script', '</script');
  }

  // tslint:disable-next-line:align
  private static createSVGData(svg: any): string {
    let data = structuredClone(svg);

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
    height: number,
  ) {
    return (
      'width="100%"' +
      ' height="100%" ' +
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

  /**
   * There is a Problem in the HTML-Presentation, where the Arrow-Heads of the Activities are not shown after the 4th sentence
   * This is due to the fact, that the marker for the Arrow-Head is defined in each sentence with the same ID
   * When the 5th sentence is reached, the first marker is set to display none, which propagates to all other markers
   *
   * To fix this, for each sentence the marker and its references are renamed
   */
  private fixActivityMarkersForEachSentence(
    result: { svg: string },
    sectionIndex: number,
  ): void {
    const defs = result.svg.substring(
      result.svg.indexOf('<defs>'),
      result.svg.indexOf('</defs>') + 7,
    );
    const split = defs.split('<marker ');

    let newDefs = split[0];

    for (let i = 1; i < split.length; i++) {
      const ids = split[i].match(/(id="[^"]*")/g);
      ids?.forEach((id) => {
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
