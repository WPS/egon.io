import { inject, Injectable, signal } from '@angular/core';
import { IconSetImportExportService } from 'src/app/tools/icon-set-config/services/icon-set-import-export.service';
import { sanitizeForDesktop } from 'src/app/utils/sanitizer';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { ConfigAndDST } from 'src/app/tools/export/domain/export/configAndDst';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';
import { PngService } from 'src/app/tools/export/services/png.service';
import { SvgService } from 'src/app/tools/export/services/svg.service';
import { HtmlPresentationService } from './html-presentation.service';
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
import { DialogService } from 'src/app/tools/dialog/services/dialog.service';
import { BusinessObject } from 'src/app/domain/entities/business-object';
import { downloadFile } from 'src/app/utils/downloadFile';
import { DomainStory } from 'src/app/domain/entities/domain-story';
import { isPresent } from '../../../utils/isPresent';
import { EsdmService } from 'src/app/tools/export/services/esdm.service';
import { EventSourceDomainYaml } from 'src/app/tools/export/domain/esdm/event-source-domain-model';

import * as yaml from 'js-yaml';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  private readonly importExportService = inject(IconSetImportExportService);
  private readonly propertiesService = inject(PropertiesService);
  private readonly dirtyFlagService = inject(DirtyFlagService);
  private readonly pngService = inject(PngService);
  private readonly svgService = inject(SvgService);
  private readonly esdmService = inject(EsdmService);
  private readonly htmlPresentationService = inject(HtmlPresentationService);
  private readonly modelerService = inject(ModelerService);
  private readonly dialogService = inject(DialogService);
  private readonly snackbar = inject(MatSnackBar);

  private readonly fileNameSignal = signal('');

  isDomainStoryExportable(): boolean {
    return this.modelerService.getStory().length >= 1;
  }

  createConfigAndDST(domainStory: DomainStory): ConfigAndDST {
    return new ConfigAndDST(
      this.importExportService.getCurrentConfigurationForExport(),
      domainStory,
    );
  }

  downloadEsdm(
    asIs: boolean,
    finegrained: boolean,
    digitalized: boolean,
  ): void {
    const currentConfigurationForExport =
      this.importExportService.getCurrentConfigurationForExport();

    const esdm = this.esdmService.createEventSourceDomainModel(
      this.title(), // TODO Check if domain-story-title is correct
      this.description(),
      currentConfigurationForExport ? currentConfigurationForExport.name : '',
      asIs,
      finegrained,
      digitalized,
    );

    const esdmYamlFormat: EventSourceDomainYaml = {
      apiVersion: 'schema.esdm.io/domain-storytelling/v1',
      kind: 'domain-story',
      ...esdm,
    };

    downloadFile(
      yaml.dump(esdmYamlFormat, {
        indent: 2,
        lineWidth: 120,
      }),
      'data:text/yaml;charset=utf-8,',
      this.createFileName(),
      '.esdm.yaml',
    );
  }

  downloadEGN(filename: string): void {
    this.fileNameSignal.set(filename);

    const dst = this.getStoryForDownload();
    const configAndDST = this.createConfigAndDST(dst);
    const json = JSON.stringify(configAndDST, null, 2);

    downloadFile(json, 'data:text/plain;charset=utf-8,', filename, '.egn');
    this.dirtyFlagService.makeClean();
  }

  downloadSVG(
    filename: string,
    withTitle: boolean,
    useWhiteBackground: boolean,
    animationSpeed: number | undefined,
  ): void {
    const story: DomainStory = this.getStoryForDownload();
    const dst: ConfigAndDST = this.createConfigAndDST(story);

    const svgData: string = this.svgService.createSVGData(
      this.propertiesService.title(),
      this.propertiesService.description(),
      dst,
      withTitle,
      useWhiteBackground,
      animationSpeed,
    );

    downloadFile(
      svgData,
      'data:application/bpmn20-xml;charset=UTF-8,',
      filename,
      '.egn.svg',
    );
    this.dirtyFlagService.makeClean();
  }

  downloadPNG(filename: string, withTitle: boolean): void {
    this.fileNameSignal.set(filename);

    const canvas = document.getElementById('canvas');
    if (canvas) {
      const { svg, image, width, height } = this.pngService.createSvgAndImage(
        canvas,
        this.propertiesService.description(),
        this.propertiesService.title(),
        withTitle,
      );

      image.onload = () => {
        const tempCanvas = this.pngService.createTempCanvas(width, height);
        const ctx = tempCanvas.getContext('2d');
        if (ctx) {
          // fill with white background
          ctx.rect(0, 0, tempCanvas.width, tempCanvas.height);
          ctx.fillStyle = 'white';
          ctx.fill();

          ctx.drawImage(image, 0, 0);
        }

        const png64 = tempCanvas.toDataURL('image/png');

        downloadFile(png64, '', filename, '.png', false);

        // image source has to be removed to circumvent browser caching
        image.src = '';
      };
      image.onchange = image.onload;

      image.width = width;
      image.height = height;

      image.src = 'data:image/svg+xml,' + svg;
    }
  }

  openDownloadDialog() {
    if (this.isDomainStoryExportable()) {
      const SVGDownloadOption = new ExportOption(
        'SVG',
        'Download an SVG-Image with the Domain-Story embedded. Can be used to save and share your Domain-Story.',
        (
          filename: string,
          withTitle: boolean,
          useWhiteBackground: boolean,
          animationSpeed: number | undefined,
        ) =>
          this.downloadSVG(
            filename,
            withTitle,
            useWhiteBackground,
            animationSpeed,
          ),
      );
      const EGNDownloadOption = new ExportOption(
        'EGN',
        'Download an EGN-File with the Domain-Story. Can be used to save and share your Domain-Story.',
        (filename: string) => this.downloadEGN(filename),
      );
      const PNGDownloadOption = new ExportOption(
        'PNG',
        'Download a PNG-Image of the Domain-Story. This does not include the Domain-Story!',
        (filename: string, withTitle: boolean) =>
          this.downloadPNG(filename, withTitle),
      );
      const HTMLDownloadOption = new ExportOption(
        'HTML-Presentation',
        'Download an HTML-Presentation. This does not include the Domain-Story!',
        (filename: string) => this.downloadHTMLPresentation(filename),
      );

      const config = new MatDialogConfig();
      config.disableClose = false;
      config.autoFocus = true;
      config.data = new ExportDialogData('Export', this.getFilename(), [
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

  downloadHTMLPresentation(filename: string): void {
    this.fileNameSignal.set(filename);
    this.htmlPresentationService.downloadHTMLPresentation(filename).then();
  }

  private getStoryForDownload(): DomainStory {
    let story: BusinessObject[] = this.modelerService
      .getStory()
      .sort((objA: BusinessObject, objB: BusinessObject) => {
        if (isPresent(objA.id) && isPresent(objB.id)) {
          return objA.id.localeCompare(objB.id);
        } else {
          return 0;
        }
      });

    return {
      businessObjects: story,
      title: this.propertiesService.getTitle(),
      description: this.propertiesService.getDescription(),
      version: environment.version,
      scope: this.propertiesService.getScope(),
    };
  }

  private createFileName() {
    return sanitizeForDesktop(this.propertiesService.title());
  }

  getFilename() {
    return this.fileNameSignal()
      ? this.fileNameSignal()
      : this.createFileName();
  }
}
