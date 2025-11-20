import { Injectable, OnDestroy } from '@angular/core';
import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';
import { sanitizeForDesktop } from 'src/app/utils/sanitizer';
import { TitleService } from 'src/app/tools/title/services/title.service';
import { ConfigAndDST } from 'src/app/tools/export/domain/export/configAndDst';
import { DirtyFlagService } from 'src/app/domain/services/dirty-flag.service';
import { PngService } from 'src/app/tools/export/services/png.service';
import { SvgService } from 'src/app/tools/export/services/svg.service';
import { Subscription } from 'rxjs';
import { HtmlPresentationService } from './html-presentation.service';
import { formatDate } from '@angular/common';
import { environment } from '../../../../environments/environment';
import {
  ExportDialogData,
  ExportOption,
} from '../domain/dialog/exportDialogData';
import { MatDialogConfig } from '@angular/material/dialog';
import { ExportDialogComponent } from '../presentation/export-dialog/export-dialog.component';
import {
  SNACKBAR_DURATION,
  SNACKBAR_INFO,
} from '../../../domain/entities/constants';
import { ModelerService } from '../../modeler/services/modeler.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogService } from '../../../domain/services/dialog.service';
import { BusinessObject } from '../../../domain/entities/businessObject';

@Injectable({
  providedIn: 'root',
})
export class ExportService implements OnDestroy {
  titleSubscription: Subscription;
  descriptionSubscription: Subscription;

  title = '';
  description = '';

  constructor(
    private importExportService: IconSetImportExportService,
    private titleService: TitleService,
    private dirtyFlagService: DirtyFlagService,
    private pngService: PngService,
    private svgService: SvgService,
    private htmlPresentationService: HtmlPresentationService,
    private modelerService: ModelerService,
    private dialogService: DialogService,
    private snackbar: MatSnackBar,
  ) {
    this.titleSubscription = this.titleService.title$.subscribe(
      (title: string) => {
        this.title = title;
      },
    );
    this.descriptionSubscription = this.titleService.description$.subscribe(
      (description: string) => {
        this.description = description;
      },
    );
  }

  ngOnDestroy(): void {
    this.titleSubscription.unsubscribe();
    this.descriptionSubscription.unsubscribe();
  }

  isDomainStoryExportable(): boolean {
    return this.modelerService.getStory().length >= 1;
  }

  createConfigAndDST(DomainStory: any): ConfigAndDST {
    return new ConfigAndDST(
      this.importExportService.getCurrentConfigurationForExport(),
      DomainStory,
    );
  }

  downloadDST(): void {
    const dst = this.getStoryForDownload();
    const configAndDST = this.createConfigAndDST(dst);
    const json = JSON.stringify(configAndDST, null, 2);

    const filename = sanitizeForDesktop(
      this.title + '_' + this.getCurrentDateString(),
    );

    this.downloadFile(
      json,
      'data:text/plain;charset=utf-8,',
      filename,
      '.egn',
      true,
    );
  }

  private downloadFile(
    data: string,
    datatype: string,
    filename: string,
    fileEnding: string,
    makeClean: boolean,
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

  downloadSVG(
    withTitle: boolean,
    useWhiteBackground: boolean,
    animationSpeed: number | undefined,
  ): void {
    const story = this.getStoryForDownload();
    const dst = this.createConfigAndDST(story);

    const svgData = this.svgService.createSVGData(
      this.title,
      this.description,
      dst,
      withTitle,
      useWhiteBackground,
      animationSpeed,
    );

    this.downloadFile(
      svgData,
      'data:application/bpmn20-xml;charset=UTF-8,',
      sanitizeForDesktop(this.title + '_' + this.getCurrentDateString()),
      '.egn.svg',
      true,
    );
  }

  downloadPNG(withTitle: boolean): void {
    const canvas = document.getElementById('canvas');
    if (canvas) {
      const container = canvas.getElementsByClassName('djs-container');
      const svgElements = container[0].getElementsByTagName('svg');
      const outerSVGElement = svgElements[0];
      const viewport = outerSVGElement.getElementsByClassName('viewport')[0];
      const layerBase = viewport.querySelector('[class^="layer-root-"]');

      const image = document.createElement('img');

      // removes unwanted black dots in image
      let svg = this.pngService.extractSVG(viewport, outerSVGElement);

      svg = this.pngService.prepareSVG(
        svg,
        layerBase,
        this.description,
        this.title,
        withTitle,
      );

      image.onload = () => {
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
            this.getCurrentDateString() +
            '.png',
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

  downloadHTMLPresentation(modeler: any): void {
    const filename = sanitizeForDesktop(
      this.title + '_' + this.getCurrentDateString(),
    );
    this.htmlPresentationService
      .downloadHTMLPresentation(filename, modeler)
      .then();
  }

  private getStoryForDownload(): unknown[] {
    let story = this.modelerService
      .getStory()
      .sort((objA: BusinessObject, objB: BusinessObject) => {
        if (objA.id !== undefined && objB.id !== undefined) {
          return objA.id.localeCompare(objB.id);
        } else {
          return 0;
        }
      }) as unknown[];
    story.push({ info: this.titleService.getDescription() });
    story.push({ version: environment.version });
    return story;
  }

  private getCurrentDateString(): string {
    return formatDate(new Date(), 'yyyy-MM-dd', 'en-GB');
  }

  openDownloadDialog() {
    if (this.isDomainStoryExportable()) {
      const SVGDownloadOption = new ExportOption(
        'SVG',
        'Download an SVG-Image with the Domain-Story embedded. Can be used to save and share your Domain-Story.',
        (
          withTitle: boolean,
          useWhiteBackground: boolean,
          animationSpeed: number | undefined,
        ) => this.downloadSVG(withTitle, useWhiteBackground, animationSpeed),
      );
      const EGNDownloadOption = new ExportOption(
        'EGN',
        'Download an EGN-File with the Domain-Story. Can be used to save and share your Domain-Story.',
        () => this.downloadDST(),
      );
      const PNGDownloadOption = new ExportOption(
        'PNG',
        'Download a PNG-Image of the Domain-Story. This does not include the Domain-Story!',
        (withTitle: boolean) => this.downloadPNG(withTitle),
      );
      const HTMLDownloadOption = new ExportOption(
        'HTML-Presentation',
        'Download an HTML-Presentation. This does not include the Domain-Story!',
        () => this.downloadHTMLPresentation(this.modelerService.getModeler()),
      );

      const config = new MatDialogConfig();
      config.disableClose = false;
      config.autoFocus = true;
      config.data = new ExportDialogData('Export', [
        SVGDownloadOption,
        EGNDownloadOption,
        PNGDownloadOption,
        HTMLDownloadOption,
      ]);

      this.dialogService.openDialog(ExportDialogComponent, config);
    } else {
      this.snackbar.open('No Domain Story to be exported', undefined, {
        duration: SNACKBAR_DURATION,
        panelClass: SNACKBAR_INFO,
      });
    }
  }
}
