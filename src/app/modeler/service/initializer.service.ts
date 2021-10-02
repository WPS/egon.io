import { Injectable } from '@angular/core';

import { initializeContextPadProvider } from '../domain-story-modeler/modeler/context-pad/domainStoryContextPadProvider';
import {
  getMultipleNumberRegistry,
  getNumberRegistry,
  initializeNumbering,
  setNumberIsMultiple,
  updateExistingNumbersAtEditing,
} from '../domain-story-modeler/modeler/numbering/numbering';
import dsActivityHandlers, {
  initializeDSActivityHandler,
} from '../domain-story-modeler/modeler/updateHandler/dsActivityHandlers';
import { initializePalette } from '../domain-story-modeler/modeler/palette/domainStoryPalette';
import { initializeRenderer } from '../domain-story-modeler/modeler/domainStoryRenderer';
import {
  initializeLabelEditingProvider,
  toggleStashUse,
} from '../domain-story-modeler/modeler/labeling/dsLabelEditingProvider';
import { initializeReplaceOptions } from '../domain-story-modeler/modeler/change-icon/replaceOptions';

import { DirtyFlagService } from '../../dirtyFlag-service/dirty-flag.service';
import { IconDictionaryService } from '../../domain-configuration/service/icon-dictionary.service';
import { ElementRegistryService } from '../../elementRegistry-service/element-registry.service';
import { DomainConfigurationService } from '../../domain-configuration/service/domain-configuration.service';
import { LabelDictionaryService } from '../../label-dictionary/service/label-dictionary.service';
import { elementTypes } from '../../common/domain/elementTypes';
import { ReplayStateService } from '../../replay-service/replay-state.service';
import { MatDialogConfig } from '@angular/material/dialog';
import { ActivityDialogData } from '../component/activity-dialog/activityDialogData';
import { ActivityDialogComponent } from '../component/activity-dialog/activity-dialog.component';
import { DialogService } from '../../dialog/service/dialog.service';
import dsMassRenameHandlers from '../domain-story-modeler/modeler/updateHandler/dsMassRenameHandlers';
import dsElementHandler from '../domain-story-modeler/modeler/updateHandler/dsElementHandler';
import headlineAndDescriptionUpdateHandler from '../domain-story-modeler/modeler/updateHandler/headlineAndDescriptionUpdateHandler';
import { TitleService } from '../../titleAndDescription/service/title.service';
import { MassNamingService } from '../../label-dictionary/service/mass-naming.service';
import { ActivityCanvasObject } from '../../common/domain/activityCanvasObject';
import { HtmlPresentationService } from '../../export/service/html-presentation.service';
import { positionsMatch } from '../../common/util/mathExtensions';

@Injectable({
  providedIn: 'root',
})
export class InitializerService {
  constructor(
    private dirtyFlagService: DirtyFlagService,
    private iconDictionaryService: IconDictionaryService,
    private elementRegistryService: ElementRegistryService,
    private configurationService: DomainConfigurationService,
    private labelDictionaryService: LabelDictionaryService,
    private replayStateService: ReplayStateService,
    private dialogService: DialogService,
    private titleService: TitleService,
    private massNamingService: MassNamingService,
    private htmlPresentationService: HtmlPresentationService
  ) {}

  public initializeModelerClasses(): void {
    initializeContextPadProvider(
      this.dirtyFlagService,
      this.iconDictionaryService
    );
    initializeNumbering(this.elementRegistryService);
    initializeDSActivityHandler(this.elementRegistryService);
    initializePalette(this.iconDictionaryService, this.configurationService);
    initializeRenderer(
      this.iconDictionaryService,
      this.elementRegistryService,
      this.dirtyFlagService
    );
    initializeLabelEditingProvider(this.labelDictionaryService);
    initializeReplaceOptions(this.iconDictionaryService);
  }

  public initializeServices(
    commandStack: any,
    elementRegistry: any,
    canvas: any,
    selection: any,
    modeler: any
  ): void {
    this.titleService.setCommandStack(commandStack);
    this.massNamingService.setCommandStack(commandStack);
    this.elementRegistryService.init(elementRegistry);
    this.htmlPresentationService.initialize(canvas, selection, modeler);
  }

  public initializeHandlers(commandStack: any, eventBus: any): void {
    dsActivityHandlers(commandStack, eventBus);
    dsMassRenameHandlers(commandStack, eventBus);
    dsElementHandler(commandStack, eventBus);
    headlineAndDescriptionUpdateHandler(commandStack, this.titleService);
  }

  public initiateEventBusListeners(eventBus: any, commandStack: any): void {
    eventBus.on('element.dblclick', (e: any) => {
      if (!this.replayStateService.getReplayOn()) {
        const element = e.element;
        if (element.type === elementTypes.ACTIVITY) {
          this.activityDoubleClick(element, eventBus, commandStack);
        } else {
          const renderedNumberRegistry = getNumberRegistry();

          if (renderedNumberRegistry.length > 1) {
            const allActivities =
              this.elementRegistryService.getActivitiesFromActors();

            if (allActivities.length > 0) {
              const htmlCanvas = document.getElementById('canvas');
              const container =
                // @ts-ignore
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

                  const elementX = tx * zoomX + (transformX - 5 * zoomX);
                  const elementY = ty * zoomY + (transformY - 15 * zoomY);

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
                          clickY
                        )
                      ) {
                        this.activityDoubleClick(
                          activity,
                          eventBus,
                          commandStack
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
      }
    );
  }

  private activityDoubleClick(
    activity: ActivityCanvasObject,
    eventBus: any,
    commandStack: any
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
      source.type.includes(elementTypes.ACTOR)
    ) {
      config.data = new ActivityDialogData(
        activity,
        getMultipleNumberRegistry()[activity.businessObject.number],
        true,
        (data: any) => this.saveActivityInputLabel(data, eventBus, commandStack)
      );
    } else if (source && source.type.includes(elementTypes.WORKOBJECT)) {
      config.data = new ActivityDialogData(
        activity,
        false,
        false,
        (activityData: any) =>
          this.saveActivityInputLabel(activityData, eventBus, commandStack)
      );
    }
    this.dialogService.openDialog(ActivityDialogComponent, config);
  }

  private saveActivityInputLabel(
    activityData: any,
    eventBus: any,
    commandStack: any
  ): void {
    const label = activityData.activityLabel;
    const hasNumber = activityData.multipleNumbers !== undefined;
    const activityNumber = activityData.activityNumber;
    const multipleNumberAllowed = activityData.multipleNumbers;
    const element = activityData.activity;

    // this.labelDictionaryService.addLabelToDictionary(label);

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
          eventBus
        );
      }
    } else if (element.businessObject.multipleNumberAllowed === false) {
      updateExistingNumbersAtEditing(
        activitiesFromActors,
        activityNumber,
        eventBus
      );
    }
    this.labelDictionaryService.cleanDictionaries();
  }
}
