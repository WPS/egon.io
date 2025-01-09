import { Injectable } from '@angular/core';
import { assign } from 'min-dash';
import DomainStoryModeler from 'src/app/tools/modeler/bpmn';
import { InitializerService } from './initializer.service';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { IconDictionaryService } from '../../icon-set-config/services/icon-dictionary.service';
import { IconSetConfigurationService } from '../../icon-set-config/services/icon-set-configuration.service';
import { BusinessObject } from '../../../domain/entities/businessObject';
import { ActivityBusinessObject } from '../../../domain/entities/activityBusinessObject';
import { updateMultipleNumberRegistry } from '../bpmn/modeler/numbering/numbering';
import { IconSet } from '../../../domain/entities/iconSet';
import { StorageService } from '../../../domain/services/storage.service';
import {
  SNACKBAR_DURATION_LONGER,
  SNACKBAR_INFO,
  VERSION_KEY,
} from '../../../domain/entities/constants';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class ModelerService {
  constructor(
    private initializerService: InitializerService,
    private elementRegistryService: ElementRegistryService,
    private iconDictionaryService: IconDictionaryService,
    private iconSetConfigurationService: IconSetConfigurationService,
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
      this.iconSetConfigurationService.getStoredIconSetConfiguration();
    if (storedIconSetConfiguration) {
      this.iconDictionaryService.setCustomConfiguration(
        storedIconSetConfiguration,
      );
      this.iconSetConfigurationService.loadConfiguration(
        storedIconSetConfiguration,
      );
    }
    this.modeler = new DomainStoryModeler({
      container: '#canvas',
      keyboard: {
        bindTo: document,
      },

      // Disable BPMN-SearchModule and re-enable browser Search
      additionalModules: [
        {
          bpmnSearch: ['value', 'foo'],
        },
      ],
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

    // expose bpmnjs to window for debugging purposes
    assign(window, { bpmnjs: this.modeler });

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
        this.iconSetConfigurationService.getStoredIconSetConfiguration();
    }
    if (iconSetConfiguration) {
      this.iconSetConfigurationService.setStoredIconSetConfiguration(
        iconSetConfiguration,
      );
      this.iconDictionaryService.setCustomConfiguration(iconSetConfiguration);
      this.iconSetConfigurationService.loadConfiguration(iconSetConfiguration);
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
      this.modeler.importCustomElements(currentStory);
    }
  }

  /** Interactions with the Modeler **/
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
      if (timer) {
        clearTimeout(timer);
      }
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
}
