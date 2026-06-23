import { inject, Injectable } from '@angular/core';
import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { PropertiesService } from 'src/app/tools/properties/services/properties.service';
import { ImportRepairService } from 'src/app/tools/import/services/import-repair.service';
import { BusinessObject } from 'src/app/domain/entities/businessObject';
import { DialogService } from '../../../domain/services/dialog.service';
import { MatDialogConfig } from '@angular/material/dialog';
import {
  SNACKBAR_DURATION,
  SNACKBAR_DURATION_LONG,
  SNACKBAR_DURATION_LONGER,
  SNACKBAR_ERROR,
  SNACKBAR_INFO,
  SNACKBAR_SUCCESS,
} from '../../../domain/entities/constants';
import { IconSetImportExportService } from '../../icon-set-config/services/icon-set-import-export.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IconSet } from '../../../domain/entities/iconSet';
import { IconSetChangedService } from '../../icon-set-config/services/icon-set-customization.service';
import { ModelerService } from '../../modeler/services/modeler.service';
import { ImportDialogComponent } from '../presentation/import-dialog/import-dialog.component';
import { DomainStory } from '../../../domain/entities/domainStory';
import { isPresent } from '../../../utils/isPresent';
import { UnsavedChangesReminderComponent } from '../../unsavedChangesReminder/presentation/unsavedChangesReminder-dialog/unsaved-changes-reminder/unsaved-changes-reminder.component';
import { ExternalResourcesWarningDialogComponent } from 'src/app/tools/import/presentation/external-resources-warning-dialog/external-resources-warning-dialog.component';
import { unsanitizeTextFromSvgExport } from 'src/app/utils/sanitizer';
import { Subject } from 'rxjs/internal/Subject';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root',
})
export class ImportDomainStoryService implements IconSetChangedService {
  private readonly iconDictionaryService = inject(IconDictionaryService);
  private readonly importRepairService = inject(ImportRepairService);
  private readonly propertiesService = inject(PropertiesService);
  private readonly dialogService = inject(DialogService);
  private readonly iconSetImportExportService = inject(
    IconSetImportExportService,
  );
  private readonly modelerService = inject(ModelerService);
  private readonly snackbar = inject(MatSnackBar);

  private readonly importedConfigurationEmitter = new Subject<IconSet>();
  private readonly automatedImportSuccessFullEmitterSubject =
    new Subject<void>();

  automatedImportSuccessFull$(): Observable<void> {
    return this.automatedImportSuccessFullEmitterSubject.asObservable();
  }

  iconConfigurationChanged(): Observable<IconSet> {
    return this.importedConfigurationEmitter.asObservable();
  }

  performImport(): void {
    const inputElement = document.getElementById('import');
    if (
      inputElement &&
      inputElement instanceof HTMLInputElement &&
      inputElement.files &&
      inputElement.files.length > 0
    ) {
      const file = inputElement.files[0];
      this.import(file, file.name);
    } else {
      this.snackbar.open(
        'No file selected or invalid input element.',
        undefined,
        {
          duration: SNACKBAR_DURATION_LONG,
          panelClass: SNACKBAR_ERROR,
        },
      );
    }
  }

  performDropImport(file: File): void {
    if (this.isSupportedFileEnding(file.name)) {
      this.import(file, file.name);
    } else {
      this.snackbar.open('File type not supported', undefined, {
        duration: SNACKBAR_DURATION_LONG,
        panelClass: SNACKBAR_ERROR,
      });
    }
  }

  importNotDirtyFromUrl(fileUrl: string, isDirty: boolean) {
    if (isDirty) {
      this.openUnsavedChangesReminderDialog(() => this.importFromUrl(fileUrl));
    } else {
      this.importFromUrl(fileUrl);
    }
  }

  importFromUrl(fileUrl: string, emitSuccess = false): void {
    if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
      this.snackbar.open('Url not valid', undefined, {
        duration: SNACKBAR_DURATION_LONG,
        panelClass: SNACKBAR_ERROR,
      });
      return;
    }

    fileUrl = this.convertToDownloadableUrl(fileUrl);

    fetch(fileUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        const string = fileUrl.split('/');
        const filename = string[string.length - 1]
          .replace(/%20/g, ' ')
          .replace(/(\.egn\.svg|\.dst\.svg).*/, '$1');

        if (!filename) {
          throw new Error('Unable to extract filename from URL');
        }

        if (this.isSupportedFileEnding(filename)) {
          this.import(blob, filename, emitSuccess);
        } else {
          this.snackbar.open('File type not supported', undefined, {
            duration: SNACKBAR_DURATION_LONG,
            panelClass: SNACKBAR_ERROR,
          });
        }
      })
      .catch(() => {
        this.snackbar.open(
          'Request blocked by server (CORS error) or Network error',
          undefined,
          {
            duration: SNACKBAR_DURATION_LONGER,
            panelClass: SNACKBAR_ERROR,
          },
        );
      });
  }

  private convertToDownloadableUrl(fileUrl: string): string {
    // Convert GitHub URLs to raw content
    const githubPattern = /https:\/\/github\.com\/(.+)\/(blob|blame)\/(.+)/;
    if (githubPattern.test(fileUrl)) {
      fileUrl = fileUrl.replace(
        githubPattern,
        'https://raw.githubusercontent.com/$1/$3',
      );
    }

    //Convert Dropbox URLs to dl content
    const dropboxPattern = /https:\/\/www\.dropbox\.com\/(.+)/;
    if (dropboxPattern.test(fileUrl)) {
      fileUrl = fileUrl.replace(dropboxPattern, 'https://dl.dropbox.com/$1');
    }

    return fileUrl;
  }

  private isSupportedFileEnding(filename: string): boolean {
    const supportedSvgPattern = /.*\.(dst|egn)(\s*\(\d+\))?\.svg$/;

    return (
      !!filename &&
      (filename.endsWith('.dst') ||
        filename.endsWith('.egn') ||
        supportedSvgPattern.test(filename))
    );
  }

  openImportFromUrlDialog(isDirty: boolean): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    config.data = (fileUrl: string) =>
      this.importNotDirtyFromUrl(fileUrl, isDirty);
    this.dialogService.openDialog(ImportDialogComponent, config);
  }

  openUnsavedChangesReminderDialog(fn: () => void): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    config.data = fn;
    this.dialogService.openDialog(UnsavedChangesReminderComponent, config);
  }

  openExternalResourcesWarningDialog(fn: () => void): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    config.data = fn;
    this.dialogService.openDialog(
      ExternalResourcesWarningDialogComponent,
      config,
    );
  }

  import(
    input: Blob,
    filename: string,
    emitSuccess = false,
  ): DomainStory | null {
    // return value is currently only used for tests
    const egnSvgPattern = /.*(.egn)(\s*\(\d+\)){0,1}\.svg/;
    const isSVG = filename.endsWith('.svg');

    const isEGN = isSVG
      ? filename.match(egnSvgPattern) != null
      : filename.endsWith('.egn');

    try {
      const fileReader = new FileReader();

      let domainStory: DomainStory | null = null;
      fileReader.onloadend = (e) => {
        if (e?.target) {
          try {
            this.processDomainStoryImport(
              e.target.result,
              filename,
              isSVG,
              isEGN,
              emitSuccess,
            );
          } catch (error) {
            this.importFailed();
          }
        } else {
          this.importFailed();
        }
      };
      fileReader.readAsText(input);
      return domainStory;
    } catch (error) {
      this.importFailed();
      return null;
    }
  }

  processDomainStoryImport(
    text: string | ArrayBuffer | null,
    filename: string,
    isSVG: boolean,
    isEGN: boolean,
    emitSuccess: boolean,
  ): DomainStory {
    if (typeof text !== 'string') {
      throw new Error('Failed to parse domain story from file');
    }

    const contentAsJson = isSVG ? this.extractJsonFromSvgComment(text) : text;
    const sanitizedFileName = this.restoreTitleFromFileName(filename, isSVG);

    const { iconSet, domainStory } =
      this.separateExportFileIntoIconSetAndStoryElements(
        isEGN,
        contentAsJson,
        sanitizedFileName,
      );

    this.handleLegacyVersion(domainStory);

    if (
      !this.importRepairService.checkForUnreferencedElementsInActivitiesAndRepair(
        domainStory.businessObjects,
      )
    ) {
      this.showBrokenImportDialog();
    }

    this.updateIconRegistries(iconSet);
    this.modelerService.importStory(domainStory.businessObjects, iconSet);

    this.importSuccessful(emitSuccess);
    this.modelerService.commandStackChanged();

    // no need to put this on the commandStack
    this.propertiesService.updateTitleAndDescriptionAndScope(
      domainStory.title,
      domainStory.description,
      domainStory.scope,
      false,
    );
    return domainStory;
  }

  private handleLegacyVersion(domainStory: DomainStory) {
    const versionPrefix = +domainStory.version.substring(
      0,
      domainStory.version.lastIndexOf('.'),
    );

    if (versionPrefix <= 0.5) {
      domainStory.businessObjects =
        this.importRepairService.updateCustomElementsPreviousV050(
          domainStory.businessObjects,
        );
      this.showPreviousV050Dialog(versionPrefix);
    }
  }

  private separateExportFileIntoIconSetAndStoryElements(
    isEgnFormat: boolean,
    contentAsJson: string,
    filename: string,
  ): {
    iconSet: IconSet;
    domainStory: DomainStory;
  } {
    let storyAndIconSet = null;
    try {
      storyAndIconSet = JSON.parse(contentAsJson);
    } catch (e) {
      this.showBrokenImportDialog();
    }

    if (storyAndIconSet == null) {
      throw new Error('Invalid import file');
    }

    const domainStory = this.exportToDomainStory(storyAndIconSet, filename);
    const iconSet = this.extractIconSet(storyAndIconSet, isEgnFormat);

    this.importRepairService.removeWhitespacesFromIcons(
      domainStory.businessObjects,
    );
    this.importRepairService.removeUnnecessaryBpmnProperties(
      domainStory.businessObjects,
    );

    return {
      iconSet,
      domainStory,
    };
  }

  private extractIconSet(storyAndIconSet: any, isEgnFormat: boolean) {
    const iconSetContent = storyAndIconSet.iconSet
      ? storyAndIconSet.iconSet
      : storyAndIconSet.domain;
    return iconSetContent
      ? this.extractStoryAndConfigurationFromCurrentFileFormat(
          isEgnFormat,
          iconSetContent,
        )
      : this.extractStoryAndConfigurationFromLegacyFileFormat(storyAndIconSet);
  }

  private extractStoryAndConfigurationFromCurrentFileFormat(
    isEgnFormat: boolean,
    storyAndIconSet: any,
  ) {
    const iconSetFromFile: {
      name: string;
      actors: { [key: string]: any };
      workObjects: { [key: string]: any };
    } = isEgnFormat ? storyAndIconSet : JSON.parse(storyAndIconSet);

    return this.iconSetImportExportService.createIconSetConfiguration(
      iconSetFromFile,
    );
  }

  private extractStoryAndConfigurationFromLegacyFileFormat(
    storyAndIconSet: any,
  ) {
    // legacy implementation
    let iconSet: IconSet;

    if (storyAndIconSet.config) {
      const iconSetFromFile: {
        name: string;
        actors: { [key: string]: any };
        workObjects: { [key: string]: any };
      } = JSON.parse(storyAndIconSet.config);
      iconSet =
        this.iconSetImportExportService.createIconSetConfiguration(
          iconSetFromFile,
        );
    } else {
      // even older legacy implementation (prior to configurable icon set):
      iconSet = this.iconDictionaryService.getDefaultIconSet();
    }

    return iconSet;
  }

  private importSuccessful(emitSuccessExternally: boolean) {
    this.snackbar.open('Import successful', undefined, {
      duration: SNACKBAR_DURATION,
      panelClass: SNACKBAR_SUCCESS,
    });
    if (emitSuccessExternally) {
      this.automatedImportSuccessFullEmitterSubject.next();
    }
  }

  private importFailed(message?: string) {
    const errorMessage: string = isPresent(message)
      ? 'Import failed due to: ' + message
      : 'Import failed';
    this.snackbar.open(errorMessage, undefined, {
      duration: SNACKBAR_DURATION_LONGER,
      panelClass: SNACKBAR_ERROR,
    });
  }

  private extractJsonFromSvgComment(xmlText: string): string {
    const unsanitizedXml = unsanitizeTextFromSvgExport(xmlText);

    let domainStory = unsanitizedXml
      .substring(0, unsanitizedXml.indexOf('</DST>'))
      .substring(unsanitizedXml.indexOf('<DST>'));

    domainStory = domainStory.replace('<DST>', '');
    domainStory = domainStory.replace('</DST>', '');

    // legacy implementation where the SVG was embedded as a comment in the svg.
    // Generally preferred method, however external Tools sometimes strip SVG Comments removing the DomainStory.
    while (domainStory.includes('<!--') || domainStory.includes('-->')) {
      domainStory = domainStory.replace('<!--', '').replace('-->', '');
    }
    return domainStory;
  }

  private updateIconRegistries(iconSet: IconSet): void {
    this.iconDictionaryService.updateIconRegistries(iconSet);
    this.importedConfigurationEmitter.next(iconSet);
  }

  private showPreviousV050Dialog(version: number): void {
    const message = `Your domain story was created with Egon version ${version}. The file format has since changed.
    Your Domain Story was converted to the new format. Please check if it is complete.`;

    this.snackbar.open(message, undefined, {
      duration: SNACKBAR_DURATION_LONGER,
      panelClass: SNACKBAR_INFO,
    });
  }

  private showBrokenImportDialog() {
    const message = `Error during import: The imported domain story is not complete. Please check if there are elements missing from the canvas.`;

    this.snackbar.open(message, undefined, {
      duration: SNACKBAR_DURATION_LONGER,
      panelClass: SNACKBAR_ERROR,
    });
  }

  private restoreTitleFromFileName(filename: string, isSVG: boolean): string {
    let title;

    const domainStoryRegex = /_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?(\.dst|\.egn)/;
    const svgRegex = /_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?(\.dst|\.egn)\.svg/;

    const egnSuffix = '.egn';
    const dstSuffix = '.dst';
    const svgSuffix = '.svg';

    let filenameWithoutDateSuffix = filename.replace(
      isSVG ? svgRegex : domainStoryRegex,
      '',
    );
    filenameWithoutDateSuffix = filenameWithoutDateSuffix
      .replace(svgSuffix, '')
      .replace(dstSuffix, '')
      .replace(egnSuffix, '');
    title = filenameWithoutDateSuffix;
    return title;
  }

  autoImportFromUrl(urlToLoad: string, startReplay: boolean) {
    this.openExternalResourcesWarningDialog(() =>
      this.importFromUrl(urlToLoad, startReplay),
    );
  }

  exportToDomainStory(parsedJson: any, filename: string): DomainStory {
    const domainStory: DomainStory = {
      businessObjects: [],
      version: '?',
      description: '',
      title: filename,
    };

    if (!isPresent(parsedJson.dst) && !isPresent(parsedJson.domainStory)) {
      return this.handleLegacyFormat(parsedJson, filename);
    }

    let domainStoryContent = parsedJson.domainStory
      ? parsedJson.domainStory
      : parsedJson.dst;

    if (isPresent(domainStoryContent.businessObjects)) {
      domainStory.businessObjects = domainStoryContent.businessObjects;
      if (isPresent(domainStoryContent.version)) {
        domainStory.version = domainStoryContent.version;
      }

      if (isPresent(domainStoryContent.description)) {
        domainStory.description = domainStoryContent.description;
      }

      if (isPresent(domainStoryContent.title)) {
        domainStory.title = domainStoryContent.title;
      }
      if (isPresent(domainStoryContent.scope)) {
        domainStory.scope = domainStoryContent.scope;
      }
      return domainStory;
    } else if (!Array.isArray(domainStoryContent)) {
      // for older versions where the dst.dst is a string
      domainStoryContent = JSON.parse(domainStoryContent);
    }

    if (Array.isArray(domainStoryContent)) {
      domainStoryContent.forEach((it: any) => {
        const hasOwnProperty: boolean = it.hasOwnProperty('type');
        if (it.type !== undefined || hasOwnProperty) {
          const businessObject: BusinessObject = Object.assign(
            {} as BusinessObject,
            it,
          );
          domainStory.businessObjects.push(businessObject);
        }
        if (it.info !== undefined || it.hasOwnProperty('info')) {
          domainStory.description = it.info;
        }
        if (it.version !== undefined || it.hasOwnProperty('version')) {
          domainStory.version = it.version;
        }
      });
    }
    return domainStory;
  }

  private handleLegacyFormat(oldFormat: any[], filename: string) {
    const domainStory: DomainStory = {
      businessObjects: [],
      version: '?',
      description: '',
      title: filename,
    };

    oldFormat.forEach((entry) => {
      if (entry.type) {
        domainStory.businessObjects.push(entry);
      } else if (entry.version) {
        domainStory.version = entry.version;
      } else if (entry.info) {
        domainStory.description = entry.info;
      }
    });
    return domainStory;
  }
}
