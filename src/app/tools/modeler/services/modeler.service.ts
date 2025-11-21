import { Injectable } from '@angular/core';
import { assign } from 'min-dash';
import DomainStoryModeler from 'src/app/tools/modeler/diagram-js';
import { InitializerService } from './initializer.service';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { IconDictionaryService } from '../../icon-set-config/services/icon-dictionary.service';
import { IconSetImportExportService } from '../../icon-set-config/services/icon-set-import-export.service';
import { BusinessObject } from '../../../domain/entities/businessObject';
import { ActivityBusinessObject } from '../../../domain/entities/activityBusinessObject';
import { updateMultipleNumberRegistry } from 'src/app/tools/modeler/diagram-js/features/numbering/numbering';
import { IconSet } from '../../../domain/entities/iconSet';
import { StorageService } from '../../../domain/services/storage.service';
import {
  SNACKBAR_DURATION_LONGER,
  SNACKBAR_INFO,
  VERSION_KEY,
} from '../../../domain/entities/constants';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DirtyFlagService } from 'src/app/domain/services/dirty-flag.service';

@Injectable({
  providedIn: 'root',
})
export class ModelerService {
  constructor(
    private initializerService: InitializerService,
    private elementRegistryService: ElementRegistryService,
    private iconDictionaryService: IconDictionaryService,
    private iconSetImportExportService: IconSetImportExportService,
    private dirtyFlagService: DirtyFlagService,
    private storageService: StorageService,
    private snackbar: MatSnackBar,
  ) {}

  private modeler: any;
  private elementRegistry: any;
  private commandStack: any;
  private eventBus: any;

  private encoded: string | undefined;
  postInit(): void {
    this.checkCurrentVersion();

    const storedIconSetConfiguration =
      this.iconSetImportExportService.getStoredIconSetConfiguration();
    if (storedIconSetConfiguration) {
      this.iconDictionaryService.setIconSet(storedIconSetConfiguration);
      this.iconSetImportExportService.loadConfiguration(
        storedIconSetConfiguration,
      );
    }
    this.modeler = new DomainStoryModeler({
      container: '#canvas',
      keyboard: {
        bind: true,
      },
      canvas: {
        autoFocus: true, // see https://github.com/bpmn-io/diagram-js/pull/956 (setting autoFocus to 'true' might cause problems with future integrations)
      },
    });

    if (this.modeler.get) {
      this.elementRegistry = this.modeler.get('elementRegistry');
      this.eventBus = this.modeler.get('eventBus');
      this.commandStack = this.modeler.get('commandStack');
    }

    this.initializerService.initializeDomainStoryModelerEventHandlers(
      this.commandStack,
      this.eventBus,
    );
    this.initializerService.propagateDomainStoryModelerClassesToServices(
      this.commandStack,
      this.elementRegistry,
    );

    const exportArtifacts = this.debounce(this.saveSVG, 500);
    if (this.modeler.get) {
      this.modeler.on('commandStack.changed', exportArtifacts);
    }

    this.initializerService.initiateEventBusListeners(
      this.eventBus,
      this.commandStack,
    );

    // expose modeler to window for debugging purposes
    assign(window, { egon: this.modeler });

    this.startDebounce();
  }

  private checkCurrentVersion() {
    const version = this.storageService.get(VERSION_KEY);
    if (version === null) {
      this.storageService.set(VERSION_KEY, environment.version);
    }

    if (version !== null && version !== environment.version) {
      this.snackbar
        .open(
          "Egon was updated. Clear your browser's local storage.",
          'More information',
          {
            duration: SNACKBAR_DURATION_LONGER,
            panelClass: SNACKBAR_INFO,
          },
        )
        .onAction()
        .subscribe(() => {
          window.open('https://egon.io/howto#launching-egon');
        });
    }
  }

  restart(
    iconSetConfiguration?: IconSet,
    domainStory?: BusinessObject[],
  ): void {
    const currentStory =
      domainStory != undefined
        ? domainStory
        : this.elementRegistryService
            .createObjectListForDSTDownload()
            .map((e) => e.businessObject);
    if (!iconSetConfiguration) {
      iconSetConfiguration =
        this.iconSetImportExportService.getStoredIconSetConfiguration();
    }
    if (iconSetConfiguration) {
      this.iconSetImportExportService.setStoredIconSetConfiguration(
        iconSetConfiguration,
      );
      this.iconDictionaryService.setIconSet(iconSetConfiguration);
      this.iconSetImportExportService.loadConfiguration(iconSetConfiguration);
    }

    this.elementRegistryService.clear();
    this.modeler?.destroy();
    this.postInit();
    updateMultipleNumberRegistry(
      currentStory
        .filter((bo) => bo.type === 'domainStory:activity')
        .map((bo) => <ActivityBusinessObject>bo)
        .filter((bo) => bo.number !== null),
    );
    if (currentStory && this.modeler.get) {
      this.renderStory(currentStory);
    }
  }

  private fitStoryToScreen() {
    this.modeler.fitStoryToScreen();
  }

  getModeler(): any {
    return this.modeler;
  }

  commandStackChanged(): void {
    // to update the title of the svg, we need to tell the command stack, that a value has changed
    this.eventBus.fire(
      'commandStack.changed',
      this.debounce(this.saveSVG, 500),
    );
  }

  startDebounce(): void {
    this.debounce(this.saveSVG, 500);
  }

  debounce(fn: any, timeout: number): any {
    return () => {
      let timer;
      timer = setTimeout(() => {
        // tslint:disable-next-line:no-unused-expression
        fn(this.modeler).then((svg: string) => {
          this.encoded = svg;
        }) as Promise<any>;
      }, timeout);
    };
  }

  getEncoded(): string {
    return this.encoded ? this.encoded : '';
  }

  async saveSVG(modeler: any): Promise<any> {
    try {
      const result = await modeler.saveSVG();
      return result.svg;
    } catch (err) {
      alert('There was an error saving the SVG.\n' + err);
    }
  }

  reset(): void {
    this.renderStory([]);
    this.dirtyFlagService.makeClean();
  }

  importStory(domainStory: BusinessObject[], config: IconSet): void {
    this.restart(config, domainStory);
    this.fitStoryToScreen();
    this.elementRegistryService.correctInitialize();
    this.commandStackChanged();
    this.startDebounce();
    this.dirtyFlagService.makeClean();
  }

  getStory(): BusinessObject[] {
    return this.elementRegistryService
      .createObjectListForDSTDownload()
      .map((c) => c.businessObject);
  }

  private renderStory(domainStory: BusinessObject[]): void {
    this.modeler.importBusinessObjects(domainStory);
  }
}
