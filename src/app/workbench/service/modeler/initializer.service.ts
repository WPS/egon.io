import { Injectable } from '@angular/core';
import { DirtyFlagService } from '../../../_domain/service/dirty-flag.service';
import { IconDictionaryService } from '../../../tool/icon-set-config/service/icon-dictionary.service';
import { ElementRegistryService } from '../../../_domain/service/element-registry.service';
import { IconSetConfigurationService } from '../../../tool/icon-set-config/service/icon-set-configuration.service';
import { LabelDictionaryService } from '../../../tool/label-dictionary/service/label-dictionary.service';
import { ElementTypes } from '../../../_domain/entity/common/elementTypes';
import { ReplayStateService } from '../../../tool/replay/service/replay-state.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { ActivityDialogData } from '../../../tool/modeler/domain/activityDialogData';
import { ActivityDialogComponent } from '../../../tool/modeler/presentation/activity-dialog/activity-dialog.component';
import { DialogService } from '../../../_domain/service/dialog.service';
import { TitleService } from '../../../tool/header/service/title.service';
import { ActivityCanvasObject } from '../../../_domain/entity/common/activityCanvasObject';
import { HtmlPresentationService } from '../../../tool/export/service/html-presentation.service';
import { positionsMatch } from '../../../Utils/mathExtensions';
import { CommandStackService } from '../../../tool/modeler/service/command-stack.service';

import { initializeRenderer } from '../../../tool/modeler/bpmn/modeler/domainStoryRenderer';

import { initializeContextPadProvider } from '../../../tool/modeler/bpmn/modeler/context-pad/domainStoryContextPadProvider';
import { initializePalette } from '../../../tool/modeler/bpmn/modeler/palette/domainStoryPalette';
import {
  initializeLabelEditingProvider,
  toggleStashUse,
} from '../../../tool/modeler/bpmn/modeler/labeling/dsLabelEditingProvider';
import { initializeReplaceOptions } from '../../../tool/modeler/bpmn/modeler/change-icon/replaceOptions';
import {
  getMultipleNumberRegistry,
  getNumberRegistry,
  initializeNumbering,
  setNumberIsMultiple,
  updateExistingNumbersAtEditing,
} from '../../../tool/modeler/bpmn/modeler/numbering/numbering';
import activityUpdateHandler, {
  initializeActivityUpdateHandler,
} from '../../../tool/modeler/bpmn/modeler/updateHandler/activityUpdateHandlers';

import massRenameHandler from '../../../tool/modeler/bpmn/modeler/updateHandler/massRenameHandler';
import elementUpdateHandler from '../../../tool/modeler/bpmn/modeler/updateHandler/elementUpdateHandler';
import headlineAndDescriptionUpdateHandler from '../../../tool/modeler/bpmn/modeler/updateHandler/headlineAndDescriptionUpdateHandler';

@Injectable({
  providedIn: 'root',
})
export class InitializerService {
  constructor(
    private dirtyFlagService: DirtyFlagService,
    private iconDictionaryService: IconDictionaryService,
    private elementRegistryService: ElementRegistryService,
    private configurationService: IconSetConfigurationService,
    private labelDictionaryService: LabelDictionaryService,
    private replayStateService: ReplayStateService,
    private dialogService: DialogService,
    private commandStackService: CommandStackService,
    private titleService: TitleService,
    private htmlPresentationService: HtmlPresentationService,
  ) {}

  initializeDomainStoryModelerClasses(): void {
    initializeContextPadProvider(
      this.dirtyFlagService,
      this.iconDictionaryService,
    );
    /** The Palette and the Context Menu need the Icons present in the Domain,
     * so the IconDictionaryService and the IconSetConfigurationService needs to be given to the Palette **/
    initializePalette(this.iconDictionaryService, this.configurationService);
    initializeRenderer(
      this.iconDictionaryService,
      this.elementRegistryService,
      this.dirtyFlagService,
    );
    initializeLabelEditingProvider(this.labelDictionaryService);
    initializeReplaceOptions(this.iconDictionaryService);
    initializeNumbering(this.elementRegistryService);
    initializeActivityUpdateHandler(this.elementRegistryService);
  }

  propagateDomainStoryModelerClassesToServices(
    commandStack: any,
    elementRegistry: any,
    canvas: any,
    selection: any,
    modeler: any,
  ): void {
    this.commandStackService.setCommandStack(commandStack);
    this.elementRegistryService.setElementRegistry(elementRegistry);
    this.htmlPresentationService.setModelerClasses(canvas, selection, modeler);
  }

  initializeDomainStoryModelerEventHandlers(
    commandStack: any,
    eventBus: any,
  ): void {
    activityUpdateHandler(commandStack, eventBus);
    massRenameHandler(commandStack, eventBus);
    elementUpdateHandler(commandStack, eventBus);
    headlineAndDescriptionUpdateHandler(commandStack, this.titleService);
  }

  initiateEventBusListeners(eventBus: any, commandStack: any): void {
    eventBus.on('element.dblclick', (e: any) => {
      if (!this.replayStateService.getReplayOn()) {
        const element = e.element;
        if (element.type === ElementTypes.ACTIVITY) {
          // override the doubleClickListener on activities
          this.activityDoubleClick(element, eventBus, commandStack);
        } else {
          const renderedNumberRegistry = getNumberRegistry();

          // add a DoubleClickListener to the number on activities
          if (renderedNumberRegistry.length > 1) {
            const allActivities =
              this.elementRegistryService.getActivitiesFromActors();

            if (allActivities.length > 0) {
              const htmlCanvas = document.getElementById('canvas');
              if (htmlCanvas) {
                const container =
                  htmlCanvas.getElementsByClassName('djs-container');
                const svgElements = container[0].getElementsByTagName('svg');
                const outerSVGElement = svgElements[0];
                const viewport =
                  outerSVGElement.getElementsByClassName('viewport')[0];
                let transform = viewport.getAttribute('transform');

                let transformX = 0;
                let transformY = 0;
                let zoomX = 1;
                let zoomY = 1;
                let nums;

                const clickX = e.originalEvent.offsetX;
                const clickY = e.originalEvent.offsetY;

                // adjust for zoom and panning
                if (transform) {
                  transform = transform.replace('matrix(', '');
                  transform.replace(')', '');
                  nums = transform.split(',');
                  zoomX = parseFloat(nums[0]);
                  zoomY = parseFloat(nums[3]);
                  transformX = parseInt(nums[4], undefined);
                  transformY = parseInt(nums[5], undefined);
                }

                const width = 25 * zoomX;
                const height = 22 * zoomY;

                for (let i = 1; i < renderedNumberRegistry.length; i++) {
                  const currentNum = renderedNumberRegistry[i];
                  if (currentNum) {
                    const tspan = currentNum.getElementsByTagName('tspan')[0];
                    const tx = tspan.getAttribute('x');
                    const ty = tspan.getAttribute('y');
                    const tNumber = parseInt(tspan.innerHTML, undefined);

                    const elementX = Math.floor(
                      tx * zoomX + (transformX - 11 * zoomX),
                    );
                    const elementY = Math.floor(
                      ty * zoomY + (transformY - 15 * zoomY),
                    );

                    allActivities.forEach((activity: ActivityCanvasObject) => {
                      const activityNumber = activity.businessObject.number;
                      if (activityNumber === tNumber) {
                        if (
                          positionsMatch(
                            width,
                            height,
                            elementX,
                            elementY,
                            clickX,
                            clickY,
                          )
                        ) {
                          this.activityDoubleClick(
                            activity,
                            eventBus,
                            commandStack,
                          );
                        }
                      }
                    });
                  }
                }
              }
            }
          }
        }
      }
    });

    // when in replay, do not allow any interaction on the canvas
    eventBus.on(
      [
        'element.click',
        'element.dblclick',
        'element.mousedown',
        'drag.init',
        'canvas.viewbox.changing',
        'autoPlace',
        'popupMenu.open',
      ],
      10000000000,
      (event: any) => {
        if (this.replayStateService.getReplayOn()) {
          event.stopPropagation();
          event.preventDefault();
        }
      },
    );
  }

  /** Overrrides for Canvas Functions **/
  private activityDoubleClick(
    activity: ActivityCanvasObject,
    eventBus: any,
    commandStack: any,
  ): void {
    const source = activity.source;

    // ensure the right number when changing the direction of an activity
    toggleStashUse(false);

    const config = new MatDialogConfig();
    config.disableClose = false;
    config.autoFocus = true;

    if (
      activity.businessObject.number &&
      source &&
      source.type.includes(ElementTypes.ACTOR)
    ) {
      config.data = new ActivityDialogData(
        activity,
        getMultipleNumberRegistry()[activity.businessObject.number],
        true,
        (data: any) =>
          this.saveActivityInputLabel(data, eventBus, commandStack),
      );
    } else if (source && source.type.includes(ElementTypes.WORKOBJECT)) {
      config.data = new ActivityDialogData(
        activity,
        false,
        false,
        (activityData: any) =>
          this.saveActivityInputLabel(activityData, eventBus, commandStack),
      );
    }
    this.dialogService.openDialog(ActivityDialogComponent, config);
  }

  private saveActivityInputLabel(
    activityData: any,
    eventBus: any,
    commandStack: any,
  ): void {
    const label = activityData.activityLabel;
    const hasNumber = activityData.activityNumber ?? false;
    const activityNumber = activityData.activityNumber;
    const multipleNumberAllowed = activityData.multipleNumbers ?? false;
    const element = activityData.activity;

    const activitiesFromActors =
      this.elementRegistryService.getActivitiesFromActors();
    const index = activitiesFromActors.indexOf(element);

    activitiesFromActors.splice(index, 1);
    if (hasNumber) {
      setNumberIsMultiple(activityNumber, multipleNumberAllowed);
    }
    element.businessObject.multipleNumberAllowed = multipleNumberAllowed;

    let options: any;
    if (hasNumber) {
      options = {
        businessObject: element.businessObject,
        newLabel: label,
        newNumber: activityNumber,
        element,
      };
    } else {
      options = {
        businessObject: element.businessObject,
        newLabel: label,
        element,
      };
    }

    commandStack.execute('activity.changed', options);
    if (element.businessObject.multipleNumberAllowed !== false) {
      if (getMultipleNumberRegistry()[activityNumber] === false) {
        updateExistingNumbersAtEditing(
          activitiesFromActors,
          activityNumber,
          eventBus,
        );
      }
    } else if (element.businessObject.multipleNumberAllowed === false) {
      updateExistingNumbersAtEditing(
        activitiesFromActors,
        activityNumber,
        eventBus,
      );
    }
  }
}
