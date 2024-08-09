import { Injectable } from '@angular/core';
import { ElementRegistryService } from '../../../domain/services/element-registry.service';
import { ElementTypes } from '../../../domain/entities/elementTypes';
import { MatDialogConfig } from '@angular/material/dialog';
import { ActivityDialogData } from '../domain/activityDialogData';
import { ActivityDialogComponent } from '../presentation/activity-dialog/activity-dialog.component';
import { DialogService } from '../../../domain/services/dialog.service';
import { TitleService } from '../../title/services/title.service';
import { ActivityCanvasObject } from '../../../domain/entities/activityCanvasObject';
import { positionsMatch } from '../../../utils/mathExtensions';
import { CommandStackService } from '../../../domain/services/command-stack.service';

import { toggleStashUse } from '../bpmn/modeler/labeling/dsLabelEditingProvider';
import {
  getMultipleNumberRegistry,
  getNumberRegistry,
  setNumberIsMultiple,
  updateExistingNumbersAtEditing,
} from '../bpmn/modeler/numbering/numbering';
import activityUpdateHandler from '../bpmn/modeler/updateHandler/activityUpdateHandlers';

import massRenameHandler from '../bpmn/modeler/updateHandler/massRenameHandler';
import elementUpdateHandler from '../bpmn/modeler/updateHandler/elementUpdateHandler';
import headlineAndDescriptionUpdateHandler from '../bpmn/modeler/updateHandler/headlineAndDescriptionUpdateHandler';
import { ReplayService } from '../../replay/services/replay.service';

@Injectable({
  providedIn: 'root',
})
export class InitializerService {
  constructor(
    private elementRegistryService: ElementRegistryService,
    private replayService: ReplayService,
    private dialogService: DialogService,
    private commandStackService: CommandStackService,
    private titleService: TitleService,
  ) {}

  propagateDomainStoryModelerClassesToServices(
    commandStack: any,
    elementRegistry: any,
    canvas: any,
    selection: any,
    modeler: any,
  ): void {
    this.commandStackService.setCommandStack(commandStack);
    this.elementRegistryService.setElementRegistry(elementRegistry);
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
      if (!this.replayService.getReplayOn()) {
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
        if (this.replayService.getReplayOn()) {
          event.stopPropagation();
          event.preventDefault();
        }
      },
    );

    let pasteColor: string | undefined;
    eventBus.on('copyPaste.pasteElement', 10000, (e: any) => {
      pasteColor = e.descriptor.oldBusinessObject.pickedColor;
    });

    eventBus.on('create.end', (e: any) => {
      if (!pasteColor) {
        return;
      }
      const element = e.elements[0];
      element.businessObject.pickedColor = pasteColor;
      pasteColor = undefined;
      eventBus.fire('element.changed', { element });
    });
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
