import { EventEmitter, Injectable, OnDestroy } from '@angular/core';
import { IconDictionaryService } from 'src/app/Service/IconSetConfiguration/icon-dictionary.service';
import { Dictionary } from 'src/app/Domain/Common/dictionary/dictionary';
import { elementTypes } from 'src/app/Domain/Common/elementTypes';
import { TitleService } from 'src/app/Service/Title/title.service';
import { ImportRepairService } from 'src/app/Service/Import/import-repair.service';
import { Observable, Subscription } from 'rxjs';
import { RendererService } from 'src/app/Service/Renderer/renderer.service';
import { BusinessObject } from 'src/app/Domain/Common/businessObject';
import {
  IconSetConfiguration,
  fromConfigurationFromFile,
} from 'src/app/Domain/Common/iconSetConfiguration';
import { DialogService } from '../Dialog/dialog.service';
import { InfoDialogComponent } from '../../Presentation/Dialog/info-dialog/info-dialog.component';
import { MatDialogConfig } from '@angular/material/dialog';
import { InfoDialogData } from '../../Domain/Dialog/infoDialogData';
import { restoreTitleFromFileName } from '../../Utils/sanitizer';
import {
  INITIAL_DESCRIPTION,
  INITIAL_TITLE,
  SNACKBAR_DURATION,
  SNACKBAR_ERROR,
  SNACKBAR_INFO,
} from '../../Domain/Common/constants';
import { IconSetConfigurationService } from '../IconSetConfiguration/icon-set-configuration.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ImportDomainStoryService implements OnDestroy {
  titleSubscription: Subscription;
  descriptionSubscription: Subscription;

  title = INITIAL_TITLE;
  description = INITIAL_DESCRIPTION;
  private importedConfiguration: IconSetConfiguration | null = null;

  private importedConfigurationEmitter =
    new EventEmitter<IconSetConfiguration>();

  constructor(
    private iconDictionaryService: IconDictionaryService,
    private importRepairService: ImportRepairService,
    private titleService: TitleService,
    private rendererService: RendererService,
    private dialogService: DialogService,
    private iconSetConfigurationService: IconSetConfigurationService,
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

  get importedConfigurationEvent(): Observable<IconSetConfiguration> {
    return this.importedConfigurationEmitter.asObservable();
  }

  getImportedConfiguration(): IconSetConfiguration {
    const config: IconSetConfiguration = {
      name: this.importedConfiguration?.name || '',
      actors: this.importedConfiguration?.actors || new Dictionary(),
      workObjects: this.importedConfiguration?.workObjects || new Dictionary(),
    };
    this.importedConfiguration = null;
    return config;
  }

  importDST(input: Blob, filename: string, isSVG: boolean): void {
    const fileReader = new FileReader();
    const titleText = restoreTitleFromFileName(filename, isSVG);

    // no need to put this on the commandStack
    this.titleService.updateTitleAndDescription(titleText, null, false);

    fileReader.onloadend = (e) => {
      if (e && e.target) {
        this.fileReaderFunction(e.target.result, isSVG, false);
      }
    };

    fileReader.readAsText(input);
  }

  importEGN(input: Blob, filename: string, isSVG: boolean): void {
    const fileReader = new FileReader();
    const titleText = restoreTitleFromFileName(filename, isSVG);

    // no need to put this on the commandStack
    this.titleService.updateTitleAndDescription(titleText, null, false);

    fileReader.onloadend = (e) => {
      if (e && e.target) {
        this.fileReaderFunction(e.target.result, isSVG, true);
      }
    };

    fileReader.readAsText(input);
  }

  private fileReaderFunction(
    text: string | ArrayBuffer | null,
    isSVG: boolean,
    isEGN: boolean,
  ): void {
    let dstText;
    if (typeof text === 'string') {
      if (isSVG) {
        dstText = this.removeXMLComments(text);
      } else {
        dstText = text;
      }

      let elements: any[];
      let config: IconSetConfiguration;
      let configFromFile: {
        name: string;
        actors: { [key: string]: any };
        workObjects: { [key: string]: any };
      };

      let dstAndConfig = this.extractDstAndConfig(dstText, isSVG);
      if (dstAndConfig == null) {
        return;
      }

      // current implementation
      if (dstAndConfig.domain) {
        configFromFile = isEGN
          ? dstAndConfig.domain
          : JSON.parse(dstAndConfig.domain);
        config = fromConfigurationFromFile(configFromFile);
        elements = isEGN ? dstAndConfig.dst : JSON.parse(dstAndConfig.dst);
      } else {
        // legacy implementation
        if (dstAndConfig.config) {
          configFromFile = JSON.parse(dstAndConfig.config);
          config = fromConfigurationFromFile(configFromFile);
          elements = JSON.parse(dstAndConfig.dst);
        } else {
          // implementation prior to configuration
          elements = JSON.parse(dstText);
          config =
            this.iconSetConfigurationService.createMinimalConfigurationWithDefaultIcons();
        }
      }

      const configChanged = this.checkConfigForChanges(config);

      let lastElement = elements[elements.length - 1];
      if (!lastElement.id) {
        lastElement = elements.pop();
        let importVersionNumber = lastElement;

        // if the last element has the importedVersionNumber has the tag version,
        // then there exists another meta tag 'info' for the description
        if (importVersionNumber.version) {
          lastElement = elements.pop();
        }

        if (importVersionNumber.version) {
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
        this.showBrokenImportDialog(isSVG ? 'SVG' : 'DST');
      }

      this.titleService.updateTitleAndDescription(
        this.title,
        lastElement.info,
        false,
      );

      this.importRepairService.adjustPositions(elements);

      this.updateIconRegistries(elements, config);
      this.rendererService.importStory(elements, configChanged, config);
    }
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

  private extractDstAndConfig(dstText: string, isSVG: boolean) {
    let dstAndConfig = null;
    try {
      dstAndConfig = JSON.parse(dstText);
    } catch (e) {
      this.showBrokenImportDialog(isSVG ? 'SVG' : 'DST');
    }
    return dstAndConfig;
  }

  private removeXMLComments(xmlText: string): string {
    xmlText = xmlText.substring(xmlText.indexOf('<DST>'));
    while (xmlText.includes('<!--') || xmlText.includes('-->')) {
      xmlText = xmlText.replace('<!--', '').replace('-->', '');
    }
    xmlText = xmlText.replace('<DST>', '');
    xmlText = xmlText.replace('</DST>', '');
    return xmlText;
  }

  checkConfigForChanges(iconSetConfiguration: IconSetConfiguration): boolean {
    const newActorKeys = iconSetConfiguration.actors.keysArray();
    const newWorkObjectKeys = iconSetConfiguration.workObjects.keysArray();

    const currentActorKeys = this.iconDictionaryService.getTypeDictionaryKeys(
      elementTypes.ACTOR,
    );
    const currentWorkobjectKeys =
      this.iconDictionaryService.getTypeDictionaryKeys(elementTypes.WORKOBJECT);

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
      .replace(elementTypes.ACTOR, '')
      .replace(elementTypes.WORKOBJECT, '');
  }

  private updateIconRegistries(
    elements: BusinessObject[],
    config: IconSetConfiguration,
  ): void {
    const actorIcons = this.iconDictionaryService.getElementsOfType(
      elements,
      elementTypes.ACTOR,
    );
    const workObjectIcons = this.iconDictionaryService.getElementsOfType(
      elements,
      elementTypes.WORKOBJECT,
    );
    this.iconDictionaryService.updateIconRegistries(
      actorIcons,
      workObjectIcons,
      config,
    );

    this.setImportedConfigurationAndEmit(config);
  }

  private showPreviousV050Dialog(version: number): void {
    const title = 'Compatability-Warning';
    const text =
      'The uploaded Domain-Story is from version ' +
      version +
      '. There may be problems with the default actors or workobjects contained in the story.';

    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;

    config.data = new InfoDialogData(title, text, true);

    this.dialogService.openDialog(InfoDialogComponent, config);
  }

  private setImportedConfigurationAndEmit(config: IconSetConfiguration) {
    this.importedConfiguration = config;
    this.importedConfigurationEmitter.emit(config);
  }

  private showBrokenImportDialog(type: string) {
    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;
    config.data = new InfoDialogData(
      'Error during import',
      'The uploaded ' +
        type +
        ' is not complete, there could be elements missing from the canvas.',
      true,
      false,
    );

    this.dialogService.openDialog(InfoDialogComponent, config);
  }
}
