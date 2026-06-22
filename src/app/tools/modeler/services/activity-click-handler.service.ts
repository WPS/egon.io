import { inject, Injectable } from '@angular/core';
import { ActivityCanvasObject } from 'src/app/domain/entities/activityCanvasObject';
import { toggleStashUse } from 'src/app/tools/modeler/diagram-js/features/labeling/dsLabelEditingProvider';
import { MatDialogConfig } from '@angular/material/dialog';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import { ActivityDialogData } from 'src/app/tools/modeler/domain/activityDialogData';
import {
  isNumberMultiple,
  setNumberIsMultiple,
  updateExistingNumbersAtEditing,
} from 'src/app/tools/modeler/diagram-js/features/numbering/numbering';
import { ActivityDialogComponent } from 'src/app/tools/modeler/presentation/activity-dialog/activity-dialog.component';
import { DialogService } from 'src/app/domain/services/dialog.service';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { positionsMatch } from 'src/app/utils/mathExtensions';
import { CommandStackService } from 'src/app/domain/services/command-stack.service';
import { DiagramJsEventBus } from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-event-bus';
import { BusinessObject } from 'src/app/domain/entities/businessObject';
import { CanvasObject } from 'src/app/domain/entities/canvasObject';
import { DomManipulationService } from 'src/app/tools/replay/services/dom-manipulation.service';

@Injectable({
  providedIn: 'root',
})
export class ActivityClickHandlerService {
  private readonly dialogService = inject(DialogService);
  private readonly elementRegistryService = inject(ElementRegistryService);
  private readonly commandStackService = inject(CommandStackService);
  private readonly domManipulationService = inject(DomManipulationService);

  private eventBus: DiagramJsEventBus | undefined;

  setModelerContext(eventBus: DiagramJsEventBus) {
    this.eventBus = eventBus;
  }

  /** Overrides for Canvas Functions **/
  public activityDoubleClick(activity: ActivityCanvasObject): void {
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
        isNumberMultiple(activity.businessObject.number),
        true,
        (data: any) => this.saveActivityInputLabel(data),
      );
    } else if (source && source.type.includes(ElementTypes.WORKOBJECT)) {
      config.data = new ActivityDialogData(
        activity,
        false,
        false,
        (activityData: any) => this.saveActivityInputLabel(activityData),
      );
    }
    this.dialogService.openDialog(ActivityDialogComponent, config);
  }

  private saveActivityInputLabel(activityData: any): void {
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

    let options: {
      businessObject: BusinessObject;
      newLabel: string;
      newNumber?: number;
      element: CanvasObject;
    };
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

    this.commandStackService.execute('activity.changed', options);
    if (element.businessObject.multipleNumberAllowed !== false) {
      if (!isNumberMultiple(activityNumber)) {
        updateExistingNumbersAtEditing(
          activitiesFromActors,
          activityNumber,
          this.eventBus,
        );
      }
    } else if (element.businessObject.multipleNumberAllowed === false) {
      updateExistingNumbersAtEditing(
        activitiesFromActors,
        activityNumber,
        this.eventBus,
      );
    }
  }

  public activityNumberDoubleClick(event: any) {
    const renderedNumberRegistry =
      this.domManipulationService.getRenderedNumbers();
    const allActivities = this.elementRegistryService.getActivitiesFromActors();
    const htmlCanvas = document.getElementById('canvas');

    if (
      renderedNumberRegistry.length > 0 &&
      allActivities.length > 0 &&
      htmlCanvas
    ) {
      const { transformX, transformY, zoomX, zoomY, width, height } =
        this.getGeometricValuesFromViewport(htmlCanvas);

      const clickX = event.originalEvent.offsetX;
      const clickY = event.originalEvent.offsetY;

      for (let i = 1; i < renderedNumberRegistry.length; i++) {
        const currentNum: any = renderedNumberRegistry[i];
        if (currentNum) {
          const { tNumber, elementX, elementY } =
            this.getCurrentNumberPositionAndValue(
              currentNum,
              zoomX,
              transformX,
              zoomY,
              transformY,
            );

          allActivities.forEach((activity: ActivityCanvasObject) => {
            const activityNumber = activity.businessObject.number;
            if (
              activityNumber === tNumber &&
              positionsMatch(
                width,
                height,
                elementX,
                elementY,
                clickX,
                clickY,
              ) &&
              currentNum.parentElement.parentElement.dataset.elementId ===
                activity.id
            ) {
              this.activityDoubleClick(activity);
            }
          });
        }
      }
    }
  }

  private getCurrentNumberPositionAndValue(
    currentNum: any,
    zoomX: number,
    transformX: number,
    zoomY: number,
    transformY: number,
  ) {
    const tspan = currentNum.getElementsByTagName('tspan')[0];
    const tx = tspan.getAttribute('x');
    const ty = tspan.getAttribute('y');
    const tNumber = parseInt(tspan.innerHTML, undefined);

    const elementX = Math.floor(tx * zoomX + (transformX - 11 * zoomX));
    const elementY = Math.floor(ty * zoomY + (transformY - 15 * zoomY));
    return { tNumber, elementX, elementY };
  }

  private getGeometricValuesFromViewport(htmlCanvas: HTMLElement) {
    const viewport = this.getViewport(htmlCanvas);
    const transform = viewport.getAttribute('transform');

    let transformX = 0;
    let transformY = 0;
    let zoomX = 1;
    let zoomY = 1;

    // adjust for zoom and panning
    if (transform) {
      const nums = transform.replace('matrix(', '').replace(')', '').split(',');
      zoomX = parseFloat(nums[0]);
      zoomY = parseFloat(nums[3]);
      transformX = parseInt(nums[4], undefined);
      transformY = parseInt(nums[5], undefined);
    }

    const width = 25 * zoomX;
    const height = 22 * zoomY;

    return { transformX, transformY, zoomX, zoomY, width, height };
  }

  private getViewport(htmlCanvas: HTMLElement): Element {
    const container = htmlCanvas.getElementsByClassName('djs-container');
    const svgElements = container[0].getElementsByTagName('svg');
    const outerSVGElement = svgElements[0];
    return outerSVGElement.getElementsByClassName('viewport')[0];
  }
}
