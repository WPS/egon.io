import { Injectable, OnDestroy } from '@angular/core';
import { DomainConfigurationService } from 'src/app/Service/DomainConfiguration/domain-configuration.service';
import { sanitizeForDesktop } from 'src/app/Utils/sanitizer';
import { TitleService } from 'src/app/Service/Title/title.service';
import { ConfigAndDST } from 'src/app/Domain/Export/configAndDst';
import { DirtyFlagService } from 'src/app/Service/DirtyFlag/dirty-flag.service';
import { PngService } from 'src/app/Service/Export/png.service';
import { SvgService } from 'src/app/Service/Export/svg.service';
import { Subscription } from 'rxjs';
import { RendererService } from '../Renderer/renderer.service';
import { HtmlPresentationService } from './html-presentation.service';
import { VERSION } from '../../Domain/Common/constants';

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

  public isDomainStoryExportable(): boolean {
    return this.rendererService.getStory().length >= 1;
  }

  public createConfigAndDST(DomainStory: any): ConfigAndDST {
    return new ConfigAndDST(
      this.configurationService.getCurrentConfigurationForExport(),
      DomainStory
    );
  }

  public downloadDST(): void {
    const dst = this.getStoryForDownload();
    const configAndDST = this.createConfigAndDST(dst);
    const json = JSON.stringify(configAndDST, null, 2);

    const filename = sanitizeForDesktop(
      this.title + '_' + new Date().toString().slice(0, 10)
    );

    this.downloadFile(
      json,
      'data:text/plain;charset=utf-8,',
      filename,
      '.egn',
      true
    );
  }

  private downloadFile(
    data: string,
    datatype: string,
    filename: string,
    fileEnding: string,
    makeClean: boolean
  ) {
    const element = document.createElement('a');
    element.setAttribute('href', datatype + encodeURIComponent(data));
    element.setAttribute('download', filename + fileEnding);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    if (makeClean) {
      this.dirtyFlagService.makeClean();
    }

    document.body.removeChild(element);
  }

  public downloadSVG(withTitle: boolean): void {
    const story = this.getStoryForDownload();
    const dst = this.createConfigAndDST(story);

    const svgData = this.svgService.createSVGData(
      this.title,
      this.description,
      dst,
      withTitle
    );

    this.downloadFile(
      svgData,
      'data:application/bpmn20-xml;charset=UTF-8,',
      sanitizeForDesktop(this.title),
      '.egn.svg',
      true
    );
  }

  public downloadPNG(withTitle: boolean): void {
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
        this.title,
        withTitle
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
      };
      image.onchange = image.onload;

      image.width = this.pngService.getWidth();
      image.height = this.pngService.getHeight();

      image.src = 'data:image/svg+xml,' + svg;
    }
  }

  public downloadHTMLPresentation(): void {
    const filename = sanitizeForDesktop(
      this.title + '_' + new Date().toString().slice(0, 10)
    );
    this.htmlPresentationService.downloadHTMLPresentation(filename).then();
  }

  private getStoryForDownload(): unknown[] {
    const story = this.rendererService.getStory() as unknown[];
    story.push({ info: this.titleService.getDescription() });
    story.push({ version: VERSION });
    return story;
  }
}
