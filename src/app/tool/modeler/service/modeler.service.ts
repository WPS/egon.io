import { Injectable } from '@angular/core';
import { assign } from 'min-dash';
import DomainStoryModeler from 'src/app/tool/modeler/bpmn';
import { IconSetConfiguration } from 'src/app/Domain/Icon-Set-Configuration/iconSetConfiguration';
import { InitializerService } from '../../../workbench/service/modeler/initializer.service';
import { ElementRegistryService } from '../../../Service/ElementRegistry/element-registry.service';
import { IconDictionaryService } from '../../icon-set-config/service/icon-dictionary.service';
import { IconSetConfigurationService } from '../../icon-set-config/service/icon-set-configuration.service';
import { BusinessObject } from '../../../Domain/Common/businessObject';
import { StorageService } from '../../../Service/BrowserStorage/storage.service';
import { ActivityBusinessObject } from '../../../Domain/Common/activityBusinessObject';
import { updateMultipleNumberRegistry } from '../bpmn/modeler/numbering/numbering';

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
  ) {}

  private modeler: any;
  private canvas: any;
  private elementRegistry: any;
  private commandStack: any;
  private selection: any;
  private eventBus: any;

  private encoded: string | undefined;

  postInit(): void {
    const storedIconSetConfiguration =
      this.storageService.getStoredIconSetConfiguration();
    if (storedIconSetConfiguration) {
      this.iconDictionaryService.setCustomConfiguration(
        storedIconSetConfiguration,
      );
      this.iconSetConfigurationService.loadConfiguration(
        storedIconSetConfiguration,
      );
    }
    this.initializerService.initializeDomainStoryModelerClasses();
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
      this.canvas = this.modeler.get('canvas');
      this.elementRegistry = this.modeler.get('elementRegistry');
      this.eventBus = this.modeler.get('eventBus');
      this.commandStack = this.modeler.get('commandStack');
      this.selection = this.modeler.get('selection');
    }

    this.initializerService.initializeDomainStoryModelerEventHandlers(
      this.commandStack,
      this.eventBus,
    );
    this.initializerService.propagateDomainStoryModelerClassesToServices(
      this.commandStack,
      this.elementRegistry,
      this.canvas,
      this.selection,
      this.modeler,
    );

    const exportArtifacts = this.debounce(this.saveSVG, 500);
    if (this.modeler.get) {
      this.modeler.on('commandStack.changed', exportArtifacts);
    }

    this.initializerService.initiateEventBusListeners(
      this.eventBus,
      this.commandStack,
    );

    this.modeler.createDiagram();
    // expose bpmnjs to window for debugging purposes
    assign(window, { bpmnjs: this.modeler });

    this.startDebounce();
  }

  restart(
    iconSetConfiguration?: IconSetConfiguration,
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
        this.storageService.getStoredIconSetConfiguration();
    }
    if (iconSetConfiguration) {
      this.storageService.setStoredIconSetConfiguration(iconSetConfiguration);
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
