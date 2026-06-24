import { Injectable } from '@angular/core';
import { createTitleAndDescriptionSVGElement } from 'src/app/tools/export/services/exportUtil';
import { BrowserSpecs } from 'src/app/tools/export/domain/export/browserSpecs';
import { Box } from 'src/app/tools/export/domain/export/box';

@Injectable({
  providedIn: 'root',
})
export class PngService {
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

  /** Needed for an SVG-Fix in Chrome where the # needs to be replaced by %23 **/
  private URIHashtagFix(svg: string): string {
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
      svg = svg.replaceAll('#', '%23');
    }
    return svg;
  }

  private findMostOuterElements(
    svg: HTMLElement,
    includeSpaceForDescription: boolean,
  ): Box {
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

    // we need to adjust yUp to have space for the description if necessary
    if (includeSpaceForDescription) {
      yUp -= 75;
    }

    return {
      xLeft,
      xRight,
      yUp,
      yDown,
    };
  }

  private prepareSVG(
    svg: string,
    layerBase: HTMLElement,
    description: string,
    title: string,
    withTitle: boolean,
  ): { svg: string; width: number; height: number } {
    const box = this.findMostOuterElements(
      layerBase,
      description === undefined,
    );
    let viewBoxIndex = svg.indexOf('width="');

    let { width, height } = this.calculateWidthAndHeight(box);

    const { insertText, dynamicHeightOffset } =
      createTitleAndDescriptionSVGElement(
        0,
        title,
        description,
        box.xLeft + 10,
        box.yUp + 20,
        width,
      );
    if (withTitle) {
      height += dynamicHeightOffset;
    }

    const bounds = this.createBounds(
      box,
      withTitle ? dynamicHeightOffset : 0,
      width,
      height,
    );

    const dataStart = svg.substring(0, viewBoxIndex);
    viewBoxIndex = svg.indexOf('tabindex="');

    const dataEnd = svg.substring(viewBoxIndex);

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

    return { svg, width, height };
  }

  private createBounds(
    box: Box,
    extraHeight: number,
    width: number,
    height: number,
  ) {
    return (
      'width="' +
      width +
      '" height="' +
      height +
      '" viewBox=" ' +
      box.xLeft +
      ' ' +
      (box.yUp - extraHeight) +
      ' ' +
      width +
      ' ' +
      height +
      '" '
    );
  }

  /**
   * Calculate the Width and Height of the Bounding Box for the PNG so no Parts are cut off
   */
  private calculateWidthAndHeight(box: Box): { width: number; height: number } {
    let width = 0;
    let height = 0;
    if (box.xLeft < 0) {
      if (box.xRight < 0) {
        width = Math.abs(box.xLeft - box.xRight);
      } else {
        width = Math.abs(box.xLeft) + box.xRight;
      }
    } else {
      width = box.xRight - box.xLeft;
    }

    if (box.yUp < 0) {
      if (box.yDown < 0) {
        height = Math.abs(box.yUp - box.yDown);
      } else {
        height = Math.abs(box.yUp) + box.yDown;
      }
    } else {
      height = box.yDown - box.yUp;
    }

    // if the domain-Story is smaller than 300px in width or height, increase its dimensions
    if (height < 300) {
      height += 300;
      box.yUp -= 150;
      box.yDown += 150;
    }
    if (width < 300) {
      width += 300;
      box.xLeft -= 150;
      box.xRight += 150;
    }
    return { width, height };
  }

  private extractSVG(
    viewport: HTMLElement,
    outerSVGElement: SVGSVGElement,
  ): string {
    const layerResizers = viewport.getElementsByClassName('layer-resizers');
    const layerOverlays = viewport.getElementsByClassName('layer-overlays');
    const transform = viewport.getAttribute('transform');
    const translate = viewport.getAttribute('translate');

    if (layerResizers[0]) {
      layerResizers[0].remove();
    }
    if (layerOverlays[0]) {
      layerOverlays[0].remove();
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

  createTempCanvas(width: number, height: number): HTMLCanvasElement {
    const tempCanvas = document.createElement('canvas');

    const padding = 10;
    tempCanvas.width = width + padding;
    tempCanvas.height = height + padding;
    return tempCanvas;
  }

  createSvgAndImage(
    canvas: HTMLElement,
    description: string,
    title: string,
    withTitle: boolean,
  ): { svg: string; image: HTMLImageElement; width: number; height: number } {
    const container = canvas.getElementsByClassName('djs-container');
    const svgElements = container[0].getElementsByTagName('svg');
    const outerSVGElement = svgElements[0] as SVGSVGElement;
    const viewport = outerSVGElement.getElementsByClassName(
      'viewport',
    )[0] as HTMLElement;
    const layerBase = viewport.querySelector(
      '[class^="layer-root-"]',
    ) as HTMLElement;

    const { svg, width, height } = this.prepareSVG(
      this.extractSVG(viewport, outerSVGElement), // removes unwanted black dots in image
      layerBase,
      description,
      title,
      withTitle,
    );

    return {
      svg,
      width,
      height,
      image: document.createElement('img'),
    };
  }
}
