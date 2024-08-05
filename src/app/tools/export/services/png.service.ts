import { Injectable } from '@angular/core';
import { createTitleAndDescriptionSVGElement } from 'src/app/tools/export/services/exportUtil';
import { BrowserSpecs } from 'src/app/tools/export/domain/export/browserSpecs';
import { Box } from 'src/app/tools/export/domain/export/box';

@Injectable({
  providedIn: 'root',
})
export class PngService {
  private width: number;
  private height: number;

  constructor() {
    this.width = 0;
    this.height = 0;
  }

  private browserSpecs(): BrowserSpecs {
    const ua = navigator.userAgent;
    let tem;
    let M =
      ua.match(
        /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
      ) || [];
    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: 'IE', version: tem[1] || '' };
    }
    if (M[1] === 'Chrome') {
      tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
      if (tem != null) {
        return { name: tem[1].replace('OPR', 'Opera'), version: tem[2] };
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
    // tslint:disable-next-line:no-conditional-assignment
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
    }
    return { name: M[0], version: M[1] };
  }

  /** Needed for an SVG-Fix in CHrome where the # needs to be replaced by %23 **/
  URIHashtagFix(svg: string): string {
    let fix = false;

    const browser = this.browserSpecs();

    const name = browser.name;
    const version = parseInt(browser.version);

    // only implemented in chrome and firefox at the moment
    if (name.includes('Chrome')) {
      if (version >= 72) {
        fix = true;
        // https://www.chromestatus.com/features/5656049583390720
      }
    } else if (name.includes('Firefox')) {
      fix = true;

      // versionNumber of implementation unknown
    }
    if (fix) {
      while (svg.includes('#')) {
        svg = svg.replace('#', '%23');
      }
    }
    return svg;
  }

  findMostOuterElements(svg: HTMLElement): Box {
    let xLeft = 0;
    let xRight = 0;
    let yUp = 0;
    let yDown = 0;

    const elements = svg.getElementsByClassName('djs-group');

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      const sub = element.children;

      let elXLeft: number;
      let elXRight: number;
      let elYUp: number;
      let elYDown: number;

      const transform = sub[0].getAttribute('transform');
      if (transform) {
        let nums;

        if (transform.includes('matrix')) {
          transform.replace('matrix(', '');
          transform.replace(')', '');
          nums = transform.split(' ');
          elXLeft = parseInt(nums[4]);
          elYUp = parseInt(nums[5]);
        } else {
          transform.replace('translate(', '');
          transform.replace(')', '');
          nums = transform.split(' ');
          elXLeft = parseInt(nums[0]);
          elYUp = parseInt(nums[1]);
        }

        const rects = sub[0].getElementsByTagName('rect');
        const outerRect = rects[rects.length - 1];

        const width = outerRect.getAttribute('width');

        elXRight = elXLeft + parseInt(width != null ? width : '0');
        elYDown = elYUp + sub[0].getBoundingClientRect().height;
      } else {
        const rects = element.getElementsByTagName('rect');
        const outerRect = rects[rects.length - 1];

        const x = outerRect.getAttribute('x');
        const y = outerRect.getAttribute('y');

        elXLeft = parseInt(x != null ? x : '0');
        elYUp = parseInt(y != null ? y : '0');

        const width = outerRect.getAttribute('width');
        const height = outerRect.getAttribute('height');

        elXRight = elXLeft + parseInt(width != null ? width : '0');
        elYDown = elYUp + parseInt(height != null ? height : '0') + 20; // Add 20 px as Padding for text at the bottom
      }
      if (elXLeft < xLeft) {
        xLeft = elXLeft;
      }
      if (elXRight > xRight) {
        xRight = elXRight;
      }
      if (elYUp < yUp) {
        yUp = elYUp;
      }
      if (elYDown > yDown) {
        yDown = elYDown;
      }
    }

    yUp -= 75; // we need to adjust yUp to have space for the title and description

    return {
      xLeft,
      xRight,
      yUp,
      yDown,
    };
  }

  prepareSVG(
    svg: string,
    layerBase: any,
    description: string,
    title: string,
    withTitle: boolean,
  ): string {
    const box = this.findMostOuterElements(layerBase);
    let viewBoxIndex = svg.indexOf('width="');

    this.calculateWidthAndHeight(box);

    const { insertText, dynamicHeightOffset } =
      createTitleAndDescriptionSVGElement(
        0,
        title,
        description,
        box.xLeft + 10,
        box.yUp + 20,
        this.width,
      );
    if (withTitle) {
      this.height += dynamicHeightOffset;
    }

    const bounds = this.createBounds(box, dynamicHeightOffset);

    const dataStart = svg.substring(0, viewBoxIndex);
    viewBoxIndex = svg.indexOf('style="');

    const dataEnd = svg.substring(viewBoxIndex);
    dataEnd.substring(viewBoxIndex);

    svg = dataStart + bounds + dataEnd;

    const insertIndex = svg.indexOf('<g class="viewport">') + 20;

    if (withTitle) {
      svg = [
        svg.slice(0, insertIndex),
        insertText,
        svg.slice(insertIndex),
      ].join('');
    }
    svg = this.URIHashtagFix(svg);

    return svg;
  }

  private createBounds(box: Box, extraHeight: number) {
    return (
      'width="' +
      this.width +
      '" height="' +
      this.height +
      '" viewBox=" ' +
      box.xLeft +
      ' ' +
      (box.yUp - extraHeight) +
      ' ' +
      this.width +
      ' ' +
      this.height +
      '" '
    );
  }

  /**
   * Calculate the Width and Height of the Bounding Box for the PNG so no Parts are cut off
   */
  private calculateWidthAndHeight(box: Box): [number, number] {
    if (box.xLeft < 0) {
      if (box.xRight < 0) {
        this.width = Math.abs(box.xLeft - box.xRight);
      } else {
        this.width = Math.abs(box.xLeft) + box.xRight;
      }
    } else {
      this.width = box.xRight - box.xLeft;
    }

    if (box.yUp < 0) {
      if (box.yDown < 0) {
        this.height = Math.abs(box.yUp - box.yDown);
      } else {
        this.height = Math.abs(box.yUp) + box.yDown;
      }
    } else {
      this.height = box.yDown - box.yUp;
    }

    // if the domain-Story is smaller than 300px in width or height, increase its dimensions
    if (this.height < 300) {
      this.height += 300;
      box.yUp -= 150;
      box.yDown += 150;
    }
    if (this.width < 300) {
      this.width += 300;
      box.xLeft -= 150;
      box.xRight += 150;
    }
    return [this.height, this.width];
  }

  extractSVG(viewport: any, outerSVGElement: any): string {
    const layerResizers = viewport.getElementsByClassName('layer-resizers');
    const layerOverlays = viewport.getElementsByClassName('layer-overlays');
    const transform = viewport.getAttribute('transform');
    const translate = viewport.getAttribute('translate');

    if (layerResizers[0]) {
      layerResizers[0].parentNode.removeChild(layerResizers[0]);
    }
    if (layerOverlays[0]) {
      layerOverlays[0].parentNode.removeChild(layerOverlays[0]);
    }

    // remove canvas scrolling and scaling before serializeToString of SVG
    if (transform) {
      viewport.removeAttribute('transform');
    }
    if (translate) {
      viewport.removeAttribute('translate');
    }

    const svg = new XMLSerializer().serializeToString(outerSVGElement);

    // re-add canvas scrolling and scaling
    if (transform) {
      viewport.setAttribute('transform', transform);
    }
    if (translate) {
      viewport.setAttribute('translate', translate);
    }
    return svg;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}
