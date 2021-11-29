import { Injectable, OnDestroy, EventEmitter } from '@angular/core';
import { DirtyFlagService } from 'src/app/Service/DirtyFlag/dirty-flag.service';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import {
  ICON_PREFIX,
  IconDictionaryService,
} from 'src/app/Service/Domain-Configuration/icon-dictionary.service';
import { Dictionary } from 'src/app/Domain/Common/dictionary/dictionary';
import { elementTypes } from 'src/app/Domain/Common/elementTypes';
import { TitleService } from 'src/app/Service/Title/title.service';
import { ImportRepairService } from 'src/app/Service/Import/import-repair.service';
import { Observable, Subscription } from 'rxjs';
import { RendererService } from 'src/app/Service/Renderer/renderer.service';
import { BusinessObject } from 'src/app/Domain/Common/businessObject';
import { DomainConfiguration } from 'src/app/Domain/Common/domainConfiguration';
import { DialogService } from '../Dialog/dialog.service';
import { InfoDialogComponent } from '../../Presentation/Dialog/info-dialog/info-dialog.component';
import { MatDialogConfig } from '@angular/material/dialog';
import { InfoDialogData } from '../../Presentation/Dialog/info-dialog/infoDialogData';
import { sanitizeIconName } from '../../Utils/sanitizer';
import { deepCopy } from '../../Utils/deepCopy';
import { TmplAstElement } from '@angular/compiler';

@Injectable({
  providedIn: 'root',
})
export class ImportDomainStoryService implements OnDestroy {
  titleSubscription: Subscription;
  descriptionSubscription: Subscription;

  private titleInputLast = '';
  private descriptionInputLast = '';

  public title = '';
  public description = '';
  private importedConfiguration: DomainConfiguration | null = null;

  private importedConfigurationEmitter =
    new EventEmitter<DomainConfiguration>();

  constructor(
    private elementRegistryService: ElementRegistryService,
    private iconDictionaryService: IconDictionaryService,
    private dirtyFlagService: DirtyFlagService,
    private importRepairService: ImportRepairService,
    private titleService: TitleService,
    private rendererService: RendererService,
    private dialogService: DialogService
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

  get importedConfigurationEvent(): Observable<DomainConfiguration> {
    return this.importedConfigurationEmitter.asObservable();
  }

  public getImportedConfiguration(): DomainConfiguration {
    const config = deepCopy(this.importedConfiguration);
    this.importedConfiguration = null;
    return config;
  }

  public restoreTitleFromFileName(filename: string, isSVG: boolean): string {
    let title;

    const dstRegex = /_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?.dst/;
    const svgRegex = /_\d+-\d+-\d+( ?_?-?\(\d+\))?(-?\d)?.dst.svg/;

    const dstSuffix = '.dst';
    const svgSuffix = '.svg';

    let filenameWithoutDateSuffix = filename.replace(
      isSVG ? svgRegex : dstRegex,
      ''
    );
    if (filenameWithoutDateSuffix.includes(isSVG ? svgSuffix : dstSuffix)) {
      filenameWithoutDateSuffix = filenameWithoutDateSuffix.replace(
        isSVG ? svgSuffix : dstSuffix,
        ''
      );
    }
    title = filenameWithoutDateSuffix;
    return title;
  }

  public importDST(input: Blob, filename: string, isSVG: boolean): void {
    this.titleInputLast = '';
    this.descriptionInputLast = '';

    const reader = new FileReader();
    const titleText = this.restoreTitleFromFileName(filename, isSVG);

    // no need to put this on the commandStack
    this.titleService.updateTitleAndDescription(titleText, null, false);

    reader.onloadend = (e) => {
      if (e && e.target) {
        this.readerFunction(e.target.result, isSVG);
      }
    };

    reader.readAsText(input);
  }

  private readerFunction(
    text: string | ArrayBuffer | null,
    isSVG: boolean
  ): void {
    let dstText;
    if (typeof text === 'string') {
      if (isSVG) {
        dstText = this.removeXMLComments(text);
      } else {
        dstText = text;
      }

      let elements;
      let config;
      let configChanged = false;

      let dstAndConfig;
      try {
        dstAndConfig = JSON.parse(dstText);
      } catch (e) {
        this.showBrokenImportDialog(isSVG ? 'SVG' : 'DST');
      }

      if (dstAndConfig == null) {
        return;
      }

      if (dstAndConfig.domain) {
        config = JSON.parse(dstAndConfig.domain);
        configChanged = this.configHasChanged(config);
        elements = JSON.parse(dstAndConfig.dst);
      } else {
        if (dstAndConfig.config) {
          config = JSON.parse(dstAndConfig.config);
          configChanged = this.configHasChanged(config);
          elements = JSON.parse(dstAndConfig.dst);
        } else {
          elements = JSON.parse(dstText);
        }
      }

      let lastElement = elements[elements.length - 1];
      if (!lastElement.id) {
        lastElement = elements.pop();
        let importVersionNumber = lastElement;

        if (lastElement.version) {
          lastElement = elements.pop();
        }

        if (importVersionNumber.version) {
          importVersionNumber = importVersionNumber.version as string;
        } else {
          importVersionNumber = '?';
        }
        const versionPrefix = +importVersionNumber.substring(
          0,
          importVersionNumber.lastIndexOf('.')
        );
        if (versionPrefix <= 0.5) {
          elements =
            this.importRepairService.updateCustomElementsPreviousV050(elements);
          this.showPreviousV050Dialog(versionPrefix);
        }
      }

      const allReferences =
        this.importRepairService.checkElementReferencesAndRepair(elements);
      if (!allReferences) {
        this.showBrokenImportDialog(isSVG ? 'SVG' : 'DST');
      }

      this.titleService.updateTitleAndDescription(
        null,
        lastElement.info,
        false
      );

      this.importRepairService.adjustPositions(elements);

      this.updateIconRegistries(elements, config);
      this.rendererService.importStory(elements, configChanged, config);
    }
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

  public configHasChanged(domainConfiguration: DomainConfiguration): boolean {
    const newActorsDict = new Dictionary();
    const newWorkObjectsDict = new Dictionary();

    newActorsDict.addEach(domainConfiguration.actors);
    newWorkObjectsDict.addEach(domainConfiguration.workObjects);

    const newActorKeys = newActorsDict.keysArray();
    const newWorkObjectKeys = newWorkObjectsDict.keysArray();
    const currentActorKeys = this.iconDictionaryService.getTypeDictionaryKeys(
      elementTypes.ACTOR
    );
    const currentWorkobjectKeys =
      this.iconDictionaryService.getTypeDictionaryKeys(elementTypes.WORKOBJECT);

    let changed = false;

    for (let i = 0; i < newActorKeys.length; i++) {
      if (
        currentActorKeys[i] !== newActorKeys[i] &&
        currentActorKeys[i] !== elementTypes.ACTOR + newActorKeys[i]
      ) {
        changed = true;
        i = newActorKeys.length;
      }
    }
    if (!changed) {
      for (let i = 0; i < newWorkObjectKeys.length; i++) {
        if (
          currentWorkobjectKeys[i] !== newWorkObjectKeys[i] &&
          currentWorkobjectKeys[i] !==
            elementTypes.WORKOBJECT + newWorkObjectKeys[i]
        ) {
          changed = true;
          i = newWorkObjectKeys.length;
        }
      }
    }
    return changed;
  }

  private updateIconRegistries(
    elements: BusinessObject[],
    config: DomainConfiguration
  ): void {
    const actorIcons = this.getElementsOfType(elements, 'actor');
    const workObjectIcons = this.getElementsOfType(elements, 'workObject');

    const customIcons: { name: string; src: string }[] = [];

    const actors = new Dictionary();
    const workobjects = new Dictionary();
    actors.addEach(config.actors);
    workobjects.addEach(config.workObjects);

    actors.keysArray().forEach((name) => {
      const sanitizedName = sanitizeIconName(name);
      if (!this.iconDictionaryService.getFullDictionary().has(sanitizedName)) {
        customIcons.push({
          name: sanitizedName,
          src: actors.get(name),
        });
      }
    });

    workobjects.keysArray().forEach((name) => {
      const sanitizedName = sanitizeIconName(name);
      if (!this.iconDictionaryService.getFullDictionary().has(sanitizedName)) {
        customIcons.push({
          name: sanitizedName,
          src: workobjects.get(name),
        });
      }
    });

    elements.forEach((element) => {
      const name = sanitizeIconName(
        element.type
          .replace(elementTypes.ACTOR, '')
          .replace(elementTypes.WORKOBJECT, '')
      );
      if (
        (element.type.includes(elementTypes.ACTOR) ||
          element.type.includes(elementTypes.WORKOBJECT)) &&
        !this.iconDictionaryService.getFullDictionary().has(name)
      ) {
        this.iconDictionaryService.registerIcon(
          ICON_PREFIX + name.toLowerCase(),
          element.type
        );
      }
    });

    this.iconDictionaryService.addNewIconsToDictionary(customIcons);

    this.iconDictionaryService.addIconsToTypeDictionary(
      actorIcons,
      workObjectIcons
    );

    this.setImportedConfigurationAndEmit(config);
  }

  private getElementsOfType(
    elements: BusinessObject[],
    type: string
  ): BusinessObject[] {
    const elementOfType: any = [];
    elements.forEach((element) => {
      if (element.type.includes(elementTypes.DOMAINSTORY + type)) {
        elementOfType.push(element);
      }
    });
    return elementOfType;
  }

  private showPreviousV050Dialog(version: number): void {
    const title = 'Compatability-Warning';
    const text =
      'The uploaded Domain-Story is from version ' +
      version +
      '. There may be problems with the default workobjects contained in the story.';

    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;

    config.data = new InfoDialogData(title, text, true);

    this.dialogService.openDialog(InfoDialogComponent, config);
  }

  private setImportedConfigurationAndEmit(config: DomainConfiguration) {
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
      false
    );

    this.dialogService.openDialog(InfoDialogComponent, config);
  }
}
