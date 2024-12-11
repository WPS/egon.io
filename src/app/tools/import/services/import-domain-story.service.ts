import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { IconDictionaryService } from 'src/app/tools/icon-set-config/services/icon-dictionary.service';
import { Dictionary } from 'src/app/domain/entities/dictionary';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import { TitleService } from 'src/app/tools/title/services/title.service';
import { ImportRepairService } from 'src/app/tools/import/services/import-repair.service';
import { Observable, Subscription } from 'rxjs';
import { RendererService } from 'src/app/tools/modeler/services/renderer.service';
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
import { IconSetConfigurationService } from '../../icon-set-config/services/icon-set-configuration.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IconSet } from '../../../domain/entities/iconSet';
import { IconSetChangedService } from '../../icon-set-config/services/icon-set-customization.service';
import { ModelerService } from '../../modeler/services/modeler.service';
import { ImportDialogComponent } from '../presentation/import-dialog/import-dialog.component';

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
    private rendererService: RendererService,
    private dialogService: DialogService,
    private iconSetConfigurationService: IconSetConfigurationService,
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

  openImportFromUrlDialog(): void {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    config.data = (fileUrl: string) => this.importFromUrl(fileUrl);
    this.dialogService.openDialog(ImportDialogComponent, config);
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

      let elements: any[];
      let iconSetConfig: IconSet;
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
        iconSetConfig =
          this.iconSetConfigurationService.createIconSetConfiguration(
            iconSetFromFile,
          );
        elements = isEgnFormat
          ? storyAndIconSet.dst
          : JSON.parse(storyAndIconSet.dst);
      } else {
        // legacy implementation
        if (storyAndIconSet.config) {
          iconSetFromFile = JSON.parse(storyAndIconSet.config);
          iconSetConfig =
            this.iconSetConfigurationService.createIconSetConfiguration(
              iconSetFromFile,
            );
          elements = JSON.parse(storyAndIconSet.dst);
        } else {
          // even older legacy implementation (prior to configurable icon set):
          elements = JSON.parse(contentAsJson);
          iconSetConfig =
            this.iconSetConfigurationService.createMinimalConfigurationWithDefaultIcons();
        }
      }

      this.importRepairService.removeWhitespacesFromIcons(elements);

      const configChanged = this.checkConfigForChanges(iconSetConfig);

      let lastElement = elements[elements.length - 1];
      if (!lastElement.id) {
        lastElement = elements.pop();
        let importVersionNumber = lastElement;

        // if the last element has the tag 'version',
        // then there exists another tag 'info' for the description
        if (importVersionNumber.version) {
          lastElement = elements.pop();
          importVersionNumber = importVersionNumber.version as string;
        } else {
          importVersionNumber = '?';
          this.snackbar.open(`The version number is unreadable.`, undefined, {
            duration: SNACKBAR_DURATION,
            panelClass: SNACKBAR_ERROR,
          });
        }
        elements = this.handleVersionNumber(importVersionNumber, elements);
      }

      if (
        !this.importRepairService.checkForUnreferencedElementsInActivitiesAndRepair(
          elements,
        )
      ) {
        this.showBrokenImportDialog();
      }

      this.titleService.updateTitleAndDescription(
        this.title,
        lastElement.info,
        false,
      );

      this.updateIconRegistries(elements, iconSetConfig);
      this.rendererService.importStory(elements, configChanged, iconSetConfig);
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

  checkConfigForChanges(iconSetConfiguration: IconSet): boolean {
    const newActorKeys = iconSetConfiguration.actors.keysArray();
    const newWorkObjectKeys = iconSetConfiguration.workObjects.keysArray();

    const currentActorKeys =
      this.iconDictionaryService.getNamesOfIconsAssignedAs(ElementTypes.ACTOR);
    const currentWorkobjectKeys =
      this.iconDictionaryService.getNamesOfIconsAssignedAs(
        ElementTypes.WORKOBJECT,
      );

    let changed = false;

    if (
      newActorKeys.length !== currentActorKeys.length ||
      newWorkObjectKeys.length !== currentWorkobjectKeys.length
    ) {
      return true;
    }

    for (let i = 0; i < newActorKeys.length; i++) {
      changed =
        this.clearName(currentActorKeys[i]) !== this.clearName(newActorKeys[i]);
      if (changed) {
        i = newActorKeys.length;
      }
    }
    if (changed) {
      return changed;
    }
    for (let i = 0; i < newWorkObjectKeys.length; i++) {
      changed =
        this.clearName(currentWorkobjectKeys[i]) !==
        this.clearName(newWorkObjectKeys[i]);
      if (changed) {
        i = newWorkObjectKeys.length;
      }
    }
    return changed;
  }

  private clearName(name: string): string {
    return name
      .replace(ElementTypes.ACTOR, '')
      .replace(ElementTypes.WORKOBJECT, '');
  }

  private updateIconRegistries(
    elements: BusinessObject[],
    config: IconSet,
  ): void {
    const actorIcons = this.iconDictionaryService.getElementsOfType(
      elements,
      ElementTypes.ACTOR,
    );
    const workObjectIcons = this.iconDictionaryService.getElementsOfType(
      elements,
      ElementTypes.WORKOBJECT,
    );
    this.iconDictionaryService.updateIconRegistries(
      actorIcons,
      workObjectIcons,
      config,
    );

    this.setImportedConfigurationAndEmit(config);
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
