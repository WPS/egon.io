import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import { TitleService } from 'src/app/tools/title/services/title.service';
import { ImportRepairService } from 'src/app/tools/import/services/import-repair.service';
import { Observable, Subscription } from 'rxjs';
import { BusinessObject } from 'src/app/domain/entities/businessObject';
import { DialogService } from '../../../domain/services/dialog.service';
import { MatDialogConfig } from '@angular/material/dialog';
import {
  INITIAL_DESCRIPTION,
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

@Injectable({
  providedIn: 'root',
})
export class ImportDomainStoryService
  implements OnDestroy, IconSetChangedService
{
  titleSubscription: Subscription;
  descriptionSubscription: Subscription;

  title = INITIAL_TITLE;
  description = INITIAL_DESCRIPTION;
  private importedConfiguration: IconSet | null = null;

  private importedConfigurationEmitter = new EventEmitter<IconSet>();

  constructor(
    private iconDictionaryService: IconDictionaryService,
    private importRepairService: ImportRepairService,
    private titleService: TitleService,
    private dialogService: DialogService,
    private iconSetImportExportService: IconSetImportExportService,
    private modelerService: ModelerService,
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

  iconConfigrationChanged(): Observable<IconSet> {
    return this.importedConfigurationEmitter.asObservable();
  }

  getConfiguration(): IconSet {
    const config: IconSet = {
      name: this.importedConfiguration?.name || '',
      actors: this.importedConfiguration?.actors || new Dictionary(),
      workObjects: this.importedConfiguration?.workObjects || new Dictionary(),
    };
    this.importedConfiguration = null;
    return config;
  }

  performImport(): void {
    // @ts-ignore
    const file = document.getElementById('import').files[0];
    this.import(file, file.name);
    this.modelerService.commandStackChanged();
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
    this.modelerService.commandStackChanged();
  }

  importNotDirtyFromUrl(fileUrl: string, isDirty: boolean) {
    if (isDirty) {
      this.openUnsavedChangesReminderDialog(() => this.importFromUrl(fileUrl));
    } else {
      this.importFromUrl(fileUrl);
    }
  }

  importFromUrl(fileUrl: string): void {
    if (!fileUrl.startsWith('http')) {
      this.snackbar.open('Url not valid', undefined, {
        duration: SNACKBAR_DURATION_LONG,
        panelClass: SNACKBAR_ERROR,
      });
      return;
    }

    fileUrl = this.convertToDownloadableUrl(fileUrl);

    fetch(fileUrl)
      .then((response) => {
        return response.blob();
      })
      .then((blob) => {
        const string = fileUrl.split('/');
        const filename = string[string.length - 1]
          .replace(/%20/g, ' ')
          .replace(/(\.egn\.svg).*/, '$1');

        if (!filename) {
          throw new Error('Unable to extract filename from URL');
        }

        if (this.isSupportedFileEnding(filename)) {
          this.import(blob, filename);
        } else {
          this.snackbar.open('File type not supported', undefined, {
            duration: SNACKBAR_DURATION_LONG,
            panelClass: SNACKBAR_ERROR,
          });
        }
        this.modelerService.commandStackChanged();
      })
      .catch(() =>
        this.snackbar.open(
          'Request blocked by server (CORS error)',
          undefined,
          {
            duration: SNACKBAR_DURATION_LONG,
            panelClass: SNACKBAR_ERROR,
          },
        ),
      );
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

  private isSupportedFileEnding(filename: string) {
    let isSupported = false;

    const dstSvgPattern = /.*(.dst)(\s*\(\d+\)){0,1}\.svg/;
    const egnSvgPattern = /.*(.egn)(\s*\(\d+\)){0,1}\.svg/;

    if (filename != null) {
      isSupported =
        filename.endsWith('.dst') ||
        filename.endsWith('.egn') ||
        filename.match(dstSvgPattern) != null ||
        filename.match(egnSvgPattern) != null;
    }

    return isSupported;
  }

  openImportFromUrlDialog(isDirty: boolean): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    config.data = (fileUrl: string) =>
      this.importNotDirtyFromUrl(fileUrl, isDirty);
    this.dialogService.openDialog(ImportDialogComponent, config);
  }

  openUnsavedChangesReminderDialog(fn: Function): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    config.data = fn;
    this.dialogService.openDialog(UnsavedChangesReminderComponent, config);
  }

  import(input: Blob, filename: string): void {
    const egnSvgPattern = /.*(.egn)(\s*\(\d+\)){0,1}\.svg/;
    const isSVG = filename.endsWith('.svg');
    let isEGN = filename.endsWith('.egn');

    if (isSVG) {
      isEGN = filename.match(egnSvgPattern) != null;
    }

    try {
      const fileReader = new FileReader();

      const titleText = this.restoreTitleFromFileName(filename, isSVG);
      // no need to put this on the commandStack
      this.titleService.updateTitleAndDescription(titleText, null, false);

      fileReader.onloadend = (e) => {
        if (e && e.target) {
          this.fileReaderFunction(e.target.result, isSVG, isEGN);
        }
      };
      fileReader.readAsText(input);
      this.importSuccessful();
    } catch (error) {
      this.importFailed();
    }
  }

  private fileReaderFunction(
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

      let domainStoryElements: any[];
      let iconSet: IconSet;
      let iconSetFromFile: {
        name: string;
        actors: { [key: string]: any };
        workObjects: { [key: string]: any };
      };

      let storyAndIconSet = this.extractStoryAndIconSet(contentAsJson);
      if (storyAndIconSet == null) {
        return;
      }

      // current implementation
      if (storyAndIconSet.domain) {
        iconSetFromFile = isEgnFormat
          ? storyAndIconSet.domain
          : JSON.parse(storyAndIconSet.domain);
        iconSet =
          this.iconSetImportExportService.createIconSetConfiguration(
            iconSetFromFile,
          );
        domainStoryElements = isEgnFormat
          ? storyAndIconSet.dst
          : JSON.parse(storyAndIconSet.dst);
      } else {
        // legacy implementation
        if (storyAndIconSet.config) {
          iconSetFromFile = JSON.parse(storyAndIconSet.config);
          iconSet =
            this.iconSetImportExportService.createIconSetConfiguration(
              iconSetFromFile,
            );
          domainStoryElements = JSON.parse(storyAndIconSet.dst);
        } else {
          // even older legacy implementation (prior to configurable icon set):
          domainStoryElements = JSON.parse(contentAsJson);
          iconSet =
            this.iconSetImportExportService.createMinimalConfigurationWithDefaultIcons();
        }
      }

      this.importRepairService.removeWhitespacesFromIcons(domainStoryElements);
      this.importRepairService.removeUnnecessaryBpmnProperties(
        domainStoryElements,
      );

      let lastElement = domainStoryElements[domainStoryElements.length - 1];
      if (!lastElement.id) {
        lastElement = domainStoryElements.pop();
        let importVersionNumber = lastElement;

        // if the last element has the tag 'version',
        // then there exists another tag 'info' for the description
        if (importVersionNumber.version) {
          lastElement = domainStoryElements.pop();
          importVersionNumber = importVersionNumber.version as string;
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

      if (
        !this.importRepairService.checkForUnreferencedElementsInActivitiesAndRepair(
          domainStoryElements,
        )
      ) {
        this.showBrokenImportDialog();
      }

      this.titleService.updateTitleAndDescription(
        this.title,
        lastElement.info,
        false,
      );

      this.updateIconRegistries(domainStoryElements, iconSet);
      this.modelerService.importStory(domainStoryElements, iconSet);
    }
  }

  private importSuccessful() {
    this.snackbar.open('Import successful', undefined, {
      duration: SNACKBAR_DURATION,
      panelClass: SNACKBAR_SUCCESS,
    });
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

  private extractStoryAndIconSet(dstText: string) {
    let dstAndConfig = null;
    try {
      dstAndConfig = JSON.parse(dstText);
    } catch (e) {
      this.showBrokenImportDialog();
    }
    return dstAndConfig;
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

  private updateIconRegistries(
    domainStoryElements: BusinessObject[],
    iconSet: IconSet,
  ): void {
    const actorIcons = this.getElementsOfType(
      domainStoryElements,
      ElementTypes.ACTOR,
    );
    const workObjectIcons = this.getElementsOfType(
      domainStoryElements,
      ElementTypes.WORKOBJECT,
    );
    this.iconDictionaryService.updateIconRegistries(
      actorIcons,
      workObjectIcons,
      iconSet,
    );

    this.setImportedConfigurationAndEmit(iconSet);
  }

  private getElementsOfType(
    elements: BusinessObject[],
    type: ElementTypes,
  ): BusinessObject[] {
    const elementOfType: any = [];
    elements.forEach((element) => {
      if (element.type.includes(type)) {
        elementOfType.push(element);
      }
    });
    return elementOfType;
  }

  private showPreviousV050Dialog(version: number): void {
    const message = `Your domain story was created with Egon version ${version}. The file format has since changed.
    Your Domain Story was converted to the new format. Please check if it is complete.`;

    this.snackbar.open(message, undefined, {
      duration: SNACKBAR_DURATION_LONGER,
      panelClass: SNACKBAR_INFO,
    });
  }

  private setImportedConfigurationAndEmit(config: IconSet) {
    this.importedConfiguration = config;
    this.importedConfigurationEmitter.emit(config);
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

    const domainStoryRegex = /_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?(.dst|.egn)/;
    const svgRegex = /_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?(.dst|.egn).svg/;

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
}
