import { inject, Injectable } from '@angular/core';
import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { TitleService } from 'src/app/tools/title/services/title.service';
import { ImportRepairService } from 'src/app/tools/import/services/import-repair.service';
import { Observable } from 'rxjs';
import { BusinessObject } from 'src/app/domain/entities/businessObject';
import { DialogService } from '../../../domain/services/dialog.service';
import { MatDialogConfig } from '@angular/material/dialog';
import {
  INITIAL_TITLE,
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
import { UnsavedChangesReminderComponent } from '../../unsavedChangesReminder/presentation/unsavedChangesReminder-dialog/unsaved-changes-reminder/unsaved-changes-reminder.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExternalResourcesWarningDialogComponent } from 'src/app/tools/import/presentation/external-resources-warning-dialog/external-resources-warning-dialog.component';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ImportDomainStoryService implements IconSetChangedService {
  private readonly iconDictionaryService = inject(IconDictionaryService);
  private readonly importRepairService = inject(ImportRepairService);
  private readonly titleService = inject(TitleService);
  private readonly dialogService = inject(DialogService);
  private readonly iconSetImportExportService = inject(
    IconSetImportExportService,
  );
  private readonly modelerService = inject(ModelerService);
  private readonly snackbar = inject(MatSnackBar);

  private readonly title = toSignal(this.titleService.title$, {
    initialValue: INITIAL_TITLE,
  });

  private readonly importedConfigurationEmitter = new Subject<IconSet>();
  private readonly automatedImportSuccessFullEmitter = new Subject<void>();

  automatedImportSuccessFull(): Observable<void> {
    return this.automatedImportSuccessFullEmitter.asObservable();
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

  import(input: Blob, filename: string, emitSuccess = false): void {
    const egnSvgPattern = /.*(.egn)(\s*\(\d+\)){0,1}\.svg/;
    const isSVG = filename.endsWith('.svg');

    const isEGN = isSVG
      ? filename.match(egnSvgPattern) != null
      : filename.endsWith('.egn');

    try {
      const fileReader = new FileReader();

      const titleText = this.restoreTitleFromFileName(filename, isSVG);
      // no need to put this on the commandStack
      this.titleService.updateTitleAndDescription(titleText, null, false);

      fileReader.onloadend = (e) => {
        if (e?.target) {
          try {
            this.processFileContent(e.target.result, isSVG, isEGN);
            this.importSuccessful(emitSuccess);
            this.modelerService.commandStackChanged();
          } catch (error) {
            this.importFailed();
          }
        } else {
          this.importFailed();
        }
      };
      fileReader.readAsText(input);
    } catch (error) {
      this.importFailed();
    }
  }

  private processFileContent(
    text: string | ArrayBuffer | null,
    isSvgFile: boolean,
    isEgnFormat: boolean,
  ): void {
    let contentAsJson;
    if (typeof text === 'string') {
      if (isSvgFile) {
        contentAsJson = this.extractJsonFromSvgComment(text);
      } else {
        contentAsJson = text;
      }

      const { iconSet, domainStoryElements, lastElement } =
        this.separateExportFileIntoIconSetAndStoryElements(
          isEgnFormat,
          contentAsJson,
        );

      if (
        !this.importRepairService.checkForUnreferencedElementsInActivitiesAndRepair(
          domainStoryElements,
        )
      ) {
        this.showBrokenImportDialog();
      }

      this.titleService.updateTitleAndDescription(
        this.title(),
        lastElement.info,
        false,
      );

      this.updateIconRegistries(iconSet);
      this.modelerService.importStory(domainStoryElements, iconSet);
    }
  }

  private separateExportFileIntoIconSetAndStoryElements(
    isEgnFormat: boolean,
    contentAsJson: string,
  ): {
    iconSet: IconSet;
    domainStoryElements: any[];
    lastElement: any;
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

    const extractedStoryAndConfiguration: {
      iconSet: IconSet;
      domainStoryElements: any[];
    } = storyAndIconSet.domain
      ? this.extractStoryAndConfigurationFromCurrentFileFormat(
          isEgnFormat,
          storyAndIconSet,
        )
      : this.extractStoryAndConfigurationFromLegacyFileFormat(
          storyAndIconSet,
          contentAsJson,
        );

    const iconSet: IconSet = extractedStoryAndConfiguration.iconSet;
    const domainStoryElements: any[] =
      extractedStoryAndConfiguration.domainStoryElements;

    this.importRepairService.removeWhitespacesFromIcons(domainStoryElements);
    this.importRepairService.removeUnnecessaryBpmnProperties(
      domainStoryElements,
    );

    const categorizedElements: {
      domainStoryElements: any[];
      lastElement: any;
    } = this.categorizeStoryElements(domainStoryElements);
    return {
      iconSet,
      domainStoryElements: categorizedElements.domainStoryElements,
      lastElement: categorizedElements.lastElement,
    };
  }

  private extractStoryAndConfigurationFromCurrentFileFormat(
    isEgnFormat: boolean,
    storyAndIconSet: any,
  ) {
    const iconSetFromFile: {
      name: string;
      actors: { [key: string]: any };
      workObjects: { [key: string]: any };
    } = isEgnFormat
      ? storyAndIconSet.domain
      : JSON.parse(storyAndIconSet.domain);

    return {
      iconSet:
        this.iconSetImportExportService.createIconSetConfiguration(
          iconSetFromFile,
        ),
      domainStoryElements: isEgnFormat
        ? storyAndIconSet.dst
        : JSON.parse(storyAndIconSet.dst),
    };
  }

  private extractStoryAndConfigurationFromLegacyFileFormat(
    storyAndIconSet: any,
    contentAsJson: any,
  ) {
    // legacy implementation
    let iconSet: IconSet;
    let domainStoryElements: any[];

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
      domainStoryElements = JSON.parse(storyAndIconSet.dst);
    } else {
      // even older legacy implementation (prior to configurable icon set):
      iconSet = this.iconDictionaryService.getDefaultIconSet();
      domainStoryElements = JSON.parse(contentAsJson);
    }

    return { iconSet, domainStoryElements };
  }

  private categorizeStoryElements(domainStoryElements: any[]) {
    let lastElement = domainStoryElements[domainStoryElements.length - 1];
    if (!lastElement.id) {
      lastElement = domainStoryElements.pop();
      let versionInfo = lastElement;

      // if the last element has the tag 'version',
      // then there exists another tag 'info' for the description
      let importVersionNumber: string;
      if (versionInfo.version) {
        lastElement = domainStoryElements.pop();
        importVersionNumber = versionInfo.version as string;
      } else {
        importVersionNumber = '?';
        this.snackbar.open(`The version number is unreadable.`, undefined, {
          duration: SNACKBAR_DURATION,
          panelClass: SNACKBAR_ERROR,
        });
      }
      domainStoryElements = this.handleVersionNumber(
        importVersionNumber,
        domainStoryElements,
      );
    }
    return { domainStoryElements, lastElement };
  }

  private importSuccessful(emitSuccessExternally: boolean) {
    this.snackbar.open('Import successful', undefined, {
      duration: SNACKBAR_DURATION,
      panelClass: SNACKBAR_SUCCESS,
    });
    if (emitSuccessExternally) {
      this.automatedImportSuccessFullEmitter.next();
    }
  }

  private importFailed() {
    this.snackbar.open('Import failed', undefined, {
      duration: SNACKBAR_DURATION,
      panelClass: SNACKBAR_ERROR,
    });
  }

  private handleVersionNumber(
    importVersionNumber: string,
    elements: BusinessObject[],
  ): BusinessObject[] {
    const versionPrefix = +importVersionNumber.substring(
      0,
      importVersionNumber.lastIndexOf('.'),
    );
    if (versionPrefix <= 0.5) {
      elements =
        this.importRepairService.updateCustomElementsPreviousV050(elements);
      this.showPreviousV050Dialog(versionPrefix);
    }
    return elements;
  }

  private extractJsonFromSvgComment(xmlText: string): string {
    xmlText = xmlText.substring(xmlText.indexOf('<DST>'));
    while (xmlText.includes('<!--') || xmlText.includes('-->')) {
      xmlText = xmlText.replace('<!--', '').replace('-->', '');
    }
    xmlText = xmlText.replace('<DST>', '');
    xmlText = xmlText.replace('</DST>', '');
    return xmlText;
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
}
