import {Injectable} from '@angular/core';
import {ConfigAndDST} from 'src/app/Domain/Export/configAndDst';
import {createTitleAndDescriptionSVGElement} from 'src/app/Service/Export/exportUtil';
import {ModelerService} from '../Modeler/modeler.service';
import {deepCopy} from '../../Utils/deepCopy';

@Injectable({
  providedIn: 'root',
})
export class SvgService {
  private cacheData = '';

  constructor(private modelerService: ModelerService) {
  }

  public createSVGData(
    title: string,
    description: string,
    dst: ConfigAndDST
  ): string {
    this.cacheData = this.modelerService.getEncoded();

    let data = deepCopy(this.cacheData);

    // to ensure that the title and description are inside the SVG container and do not overlap with any elements,
    // we change the confines of the SVG viewbox
    let viewBoxIndex = data.indexOf('width="');

    // tslint:disable-next-line:prefer-const
    let {width, height, viewBox} = this.viewBoxCoordinates(data);

    let xLeft;
    let xRight;
    let yUp;
    let yDown;
    let bounds;
    const splitViewBox = viewBox.split(/\s/);

    height += 80;
    xLeft = +splitViewBox[0];
    yUp = +splitViewBox[1];
    xRight = +splitViewBox[2];
    yDown = +splitViewBox[3];

    if (xRight < 300) {
      xRight += 300;
      width += 300;
    }

    // to display the title and description in the SVG-file, we need to add a container for our text-elements
    const {insertText, extraHeight} = createTitleAndDescriptionSVGElement(
      title,
      description,
      xLeft,
      yUp,
      width
    );
    height += extraHeight;

    bounds =
      'width="' +
      width +
      '" height=" ' +
      height +
      '" viewBox="' +
      xLeft +
      ' ' +
      (yUp - 80) +
      ' ' +
      xRight +
      ' ' +
      (yDown + 30);
    const dataStart = data.substring(0, viewBoxIndex);
    viewBoxIndex = data.indexOf('" version');
    const dataEnd = data.substring(viewBoxIndex);
    dataEnd.substring(viewBoxIndex);

    data = dataStart + bounds + dataEnd;

    let insertIndex = data.indexOf('</defs>');
    if (insertIndex < 0) {
      insertIndex = data.indexOf('version="1.2">') + 14;
    } else {
      insertIndex += 7;
    }

    data = [
      data.slice(0, insertIndex),
      insertText,
      data.slice(insertIndex),
    ].join('');

    data = this.appendDST(data, dst);

    return encodeURIComponent(data);
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
      return {width: +match[1], height: +match[2], viewBox: match[3]};
    }
    return {width: 0, height: 0, viewBox: ''};
  }

  private appendDST(data: string, dst: ConfigAndDST): string {
    data += '\n<!-- <DST>\n' + JSON.stringify(dst) + '\n </DST> -->';
    return data;
  }
}
