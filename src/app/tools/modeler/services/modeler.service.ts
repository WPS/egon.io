import { inject, Injectable } from '@angular/core';
import { assign } from 'min-dash';
import DomainStoryModeler from 'src/app/tools/modeler/diagram-js';
import { InitializerService } from './initializer.service';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { IconDictionaryService } from '../../icon-set-config/services/icon-dictionary.service';
import { IconSetImportExportService } from '../../icon-set-config/services/icon-set-import-export.service';
import { BusinessObject } from 'src/app/domain/entities/business-object';
import { ActivityBusinessObject } from 'src/app/domain/entities/activity-business-object';
import { updateMultipleNumberRegistry } from 'src/app/tools/modeler/diagram-js/features/numbering/numbering';
import { IconSet } from 'src/app/domain/entities/icon-set';
import { StorageService } from '../../../utils/services/storage.service';
import {
  SNACKBAR_DURATION_LONGER,
  SNACKBAR_INFO,
  VERSION_KEY,
} from '../../../domain/entities/constants';
import { environment } from '../../../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DirtyFlagService } from 'src/app/tools/modeler/services/dirty-flag.service';
import { DiagramJsElementRegistry } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-element-registry';
import { DiagramJsCommandStack } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-command-stack';
import { DiagramJsContextPad } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-context-pad';
import { DiagramJsPalette } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-palette';
import { DiagramJsEventBus } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-event-bus';
import { DiagramJsSelection } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-selection';
import { EVENT_COMMANDSTACK_CHANGED } from 'src/app/tools/modeler/diagram-js/features/diagramJSConstants';

@Injectable({
  providedIn: 'root',
})
export class ModelerService {
  private readonly DEBOUNCE_TIMEOUT = 500;

  private readonly initializerService = inject(InitializerService);
  private readonly elementRegistryService = inject(ElementRegistryService);
  private readonly iconDictionaryService = inject(IconDictionaryService);
  private readonly iconSetImportExportService = inject(
    IconSetImportExportService,
  );
  private readonly dirtyFlagService = inject(DirtyFlagService);
  private readonly storageService = inject(StorageService);
  private readonly snackbar = inject(MatSnackBar);

  private modeler: any;
  private elementRegistry: DiagramJsElementRegistry | undefined;
  private commandStack: DiagramJsCommandStack | undefined;
  private contextPad: DiagramJsContextPad | undefined;
  private palette: DiagramJsPalette | undefined;
  private eventBus: DiagramJsEventBus | undefined;
  private selection: DiagramJsSelection | undefined;

  private encoded: string | undefined;

  private timer: NodeJS.Timeout | undefined;

  postInit(): void {
    this.checkCurrentVersion();

    const lastUsedIconSet =
      this.iconSetImportExportService.getStoredIconSetConfiguration();
    if (lastUsedIconSet) {
      this.iconSetImportExportService.loadIconSet(lastUsedIconSet);
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
      this.contextPad = this.modeler.get('contextPad');
      this.palette = this.modeler.get('palette');
      this.selection = this.modeler.get('selection');
    }

    this.initializerService.initializeDomainStoryModelerEventHandlers(
      this.commandStack!,
      this.eventBus!,
    );
    this.initializerService.propagateDomainStoryModelerClassesToServices(
      this.commandStack!,
      this.elementRegistry!,
      this.contextPad!,
      this.palette!,
      this.selection!,
      this.eventBus!,
    );

    const exportArtifacts = this.saveSvgAfterDelay();
    if (this.modeler.get) {
      this.modeler.on('commandStack.changed', exportArtifacts);
    }

    this.initializerService.initiateEventBusListeners(this.eventBus!);

    // expose modeler to window for debugging purposes
    assign(window, { egon: this.modeler });
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
      this.iconSetImportExportService.loadIconSet(iconSetConfiguration);
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

  fitStoryToScreen() {
    this.modeler.fitStoryToScreen();
  }

  getModeler(): any {
    return this.modeler;
  }

  commandStackChanged(): void {
    // to update the title of the svg, we need to tell the command stack, that a value has changed
    this.eventBus!.fire(EVENT_COMMANDSTACK_CHANGED, this.saveSvgAfterDelay());
  }

  // executes the function after a set timeout. Used because the modeler is event-based => we need to wait for the command stack to finish
  saveSvgAfterDelay(): () => void {
    return () => {
      this.timer = setTimeout(() => {
        return this.saveSVG(this.modeler) as Promise<string>;
      }, this.DEBOUNCE_TIMEOUT);
    };
  }

  getEncoded(): string {
    return this.encoded ? this.encoded : '';
  }

  async saveSVG(modeler: any): Promise<any> {
    try {
      const result = await modeler.saveSVG();
      this.encoded = result.svg;
      return result.svg;
    } catch (err) {
      alert('There was an error saving the SVG.\n' + err);
    }
  }

  reset(): void {
    this.renderStory([]);
    this.dirtyFlagService.makeClean();
  }

  importStory(
    domainStory: BusinessObject[],
    config: IconSet,
    fitToScreen = true,
  ): void {
    this.restart(config, domainStory);
    if (fitToScreen) {
      this.fitStoryToScreen();
    }
    this.commandStackChanged();
    this.saveSvgAfterDelay();
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
