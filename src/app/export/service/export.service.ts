import { Injectable, OnDestroy } from '@angular/core';
import { DomainConfigurationService } from 'src/app/domain-configuration/service/domain-configuration.service';
import { sanitizeForDesktop } from 'src/app/common/util/sanitizer';
import { TitleService } from 'src/app/titleAndDescription/service/title.service';
import { ConfigAndDST } from 'src/app/export/domain/configAndDst';
import { DirtyFlagService } from 'src/app/dirtyFlag-service/dirty-flag.service';
import { PngService } from 'src/app/export/service/png.service';
import { SvgService } from 'src/app/export/service/svg.service';
import { Subscription } from 'rxjs';
import { RendererService } from '../../renderer-service/renderer.service';
import { HtmlPresentationService } from './html-presentation.service';

@Injectable({
  providedIn: 'root',
})
export class ExportService implements OnDestroy {
  titleSubscription: Subscription;
  descriptionSubscription: Subscription;

  public title = '';
  public description = '';

  constructor(
    private configurationService: DomainConfigurationService,
    private titleService: TitleService,
    private dirtyFlagService: DirtyFlagService,
    private pngService: PngService,
    private svgService: SvgService,
    private htmlPresentationService: HtmlPresentationService,
    private rendererService: RendererService
  ) {
    this.titleSubscription = this.titleService
      .getTitleObservable()
      .subscribe((title: string) => {
        this.title = title;
      });
    this.descriptionSubscription = this.titleService
      .getDescriptionObservable()
      .subscribe((description: string) => {
        this.description = description;
      });
  }

  ngOnDestroy(): void {
    this.titleSubscription.unsubscribe();
    this.descriptionSubscription.unsubscribe();
  }

  public downloadHTMLPresentation(): void {
    const filename = sanitizeForDesktop(
      this.title + '_' + new Date().toString().slice(0, 10)
    );
    this.htmlPresentationService.downloadHTMLPresentation(filename).then();
  }

  public downloadDST(): void {
    const dst = JSON.stringify(this.rendererService.getStory());
    const configAndDST = this.createConfigAndDST(dst);
    const json = JSON.stringify(configAndDST);
    const element = document.createElement('a');

    const filename = sanitizeForDesktop(
      this.title + '_' + new Date().toString().slice(0, 10)
    );
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(json)
    );
    element.setAttribute('download', filename + '.dst');

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    this.dirtyFlagService.makeClean();

    document.body.removeChild(element);
  }

  public downloadSVG(): void {
    const objects = this.rendererService.getStory();
    const dst = this.createConfigAndDST(JSON.stringify(objects));

    const svgData = this.svgService.createSVGData(
      this.title,
      this.description,
      dst
    );

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:application/bpmn20-xml;charset=UTF-8,' + svgData
    );
    element.setAttribute(
      'download',
      sanitizeForDesktop(this.title) + '.dst.svg'
    );

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  public isDomainStoryExportable(): boolean {
    return this.rendererService.getStory().length >= 1;
  }

  public downloadPNG(): void {
    const canvas = document.getElementById('canvas');
    if (canvas) {
      const container = canvas.getElementsByClassName('djs-container');
      const svgElements = container[0].getElementsByTagName('svg');
      const outerSVGElement = svgElements[0];
      const viewport = outerSVGElement.getElementsByClassName('viewport')[0];
      const layerBase = viewport.getElementsByClassName('layer-base')[0];

      const image = document.createElement('img');

      let onLoadTriggered = false;

      // removes unwanted black dots in image
      let svg = this.pngService.extractSVG(viewport, outerSVGElement);

      svg = this.pngService.prepareSVG(
        svg,
        layerBase,
        this.description,
        this.title
      );

      image.onload = () => {
        onLoadTriggered = true;
        const tempCanvas = document.createElement('canvas');

        // add a 10px buffer to the right and lower boundary
        tempCanvas.width = this.pngService.getWidth() + 10;
        tempCanvas.height = this.pngService.getHeight() + 10;

        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          // fill with white background
          ctx.rect(0, 0, tempCanvas.width, tempCanvas.height);
          ctx.fillStyle = 'white';
          ctx.fill();

          ctx.drawImage(image, 0, 0);
        }

        this.startPNGDownload(tempCanvas, image);
      };
      image.onchange = image.onload;

      image.width = this.pngService.getWidth();
      image.height = this.pngService.getHeight();

      image.src = 'data:image/svg+xml,' + svg;

      if (image.complete && !onLoadTriggered) {
        onLoadTriggered = true;
        const tempCanvas = document.createElement('canvas');

        // add a 10px buffer to the right and lower boundary
        tempCanvas.width = this.pngService.getWidth() + 10;
        tempCanvas.height = this.pngService.getHeight() + 10;

        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0);
        }

        this.startPNGDownload(tempCanvas, image);
      }
    }
  }

  private startPNGDownload(
    tempCanvas: HTMLCanvasElement,
    image: HTMLImageElement
  ): void {
    const png64 = tempCanvas.toDataURL('image/png');
    const ele = document.createElement('a');
    ele.setAttribute(
      'download',
      sanitizeForDesktop(this.title) +
        '_' +
        new Date().toISOString().slice(0, 10) +
        '.png'
    );
    ele.setAttribute('href', png64);
    document.body.appendChild(ele);
    ele.click();
    document.body.removeChild(ele);

    // image source has to be removed to circumvent browser caching
    image.src = '';
  }

  public createConfigAndDST(DomainStory: string): ConfigAndDST {
    return new ConfigAndDST(
      JSON.stringify(this.configurationService.getCurrentConfiguration()),
      DomainStory
    );
  }
}
