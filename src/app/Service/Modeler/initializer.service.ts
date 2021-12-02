import {Injectable} from '@angular/core';

import {initializeContextPadProvider} from '../../Modeler/modeler/context-pad/domainStoryContextPadProvider';
import {
  getMultipleNumberRegistry,
  getNumberRegistry,
  initializeNumbering,
  setNumberIsMultiple,
  updateExistingNumbersAtEditing,
} from '../../Modeler/modeler/numbering/numbering';
import {initializePalette} from '../../Modeler/modeler/palette/domainStoryPalette';
import {initializeRenderer} from '../../Modeler/modeler/domainStoryRenderer';
import {
  initializeLabelEditingProvider,
  toggleStashUse,
} from '../../Modeler/modeler/labeling/dsLabelEditingProvider';
import {initializeReplaceOptions} from '../../Modeler/modeler/change-icon/replaceOptions';

import {DirtyFlagService} from '../DirtyFlag/dirty-flag.service';
import {IconDictionaryService} from '../DomainConfiguration/icon-dictionary.service';
import {ElementRegistryService} from '../ElementRegistry/element-registry.service';
import {DomainConfigurationService} from '../DomainConfiguration/domain-configuration.service';
import {LabelDictionaryService} from '../LabelDictionary/label-dictionary.service';
import {elementTypes} from '../../Domain/Common/elementTypes';
import {ReplayStateService} from '../Replay/replay-state.service';
import {MatDialogConfig} from '@angular/material/dialog';
import {ActivityDialogData} from '../../Domain/Dialog/activityDialogData';
import {ActivityDialogComponent} from '../../Presentation/Dialog/activity-dialog/activity-dialog.component';
import {DialogService} from '../Dialog/dialog.service';
import massRenameHandler from '../../Modeler/modeler/updateHandler/massRenameHandler';
import headlineAndDescriptionUpdateHandler
  from '../../Modeler/modeler/updateHandler/headlineAndDescriptionUpdateHandler';
import {TitleService} from '../Title/title.service';
import {MassNamingService} from '../LabelDictionary/mass-naming.service';
import {ActivityCanvasObject} from '../../Domain/Common/activityCanvasObject';
import {HtmlPresentationService} from '../Export/html-presentation.service';
import {positionsMatch} from '../../Utils/mathExtensions';
import activityUpdateHandler, {
  initializeActivityUpdateHandler,
} from '../../Modeler/modeler/updateHandler/activityUpdateHandlers';
import elementUpdateHandler from '../../Modeler/modeler/updateHandler/elementUpdateHandler';

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
  ) {
  }

  public initializeDomainStoryModelerClasses(): void {
    initializeContextPadProvider(
      this.dirtyFlagService,
      this.iconDictionaryService
    );
    /** The Palette and the Context Menu need the Icons present in the Domain,
     * so the IconDictionaryService and the DomainConfigurationService needs to be given to the Palette **/
    initializePalette(this.iconDictionaryService, this.configurationService);
    initializeRenderer(
      this.iconDictionaryService,
      this.elementRegistryService,
      this.dirtyFlagService
    );
    initializeLabelEditingProvider(this.labelDictionaryService);
    initializeReplaceOptions(this.iconDictionaryService);
    initializeNumbering(this.elementRegistryService);
    initializeActivityUpdateHandler(this.elementRegistryService);
  }

  public propagateDomainStoryModelerClassesToServices(
    commandStack: any,
    elementRegistry: any,
    canvas: any,
    selection: any,
    modeler: any
  ): void {
    this.titleService.setCommandStack(commandStack);
    this.massNamingService.setCommandStack(commandStack);
    this.elementRegistryService.setElementRegistry(elementRegistry);
    this.htmlPresentationService.setModelerClasses(canvas, selection, modeler);
  }

  public initializeDomainStoryModelerEventHandlers(
    commandStack: any,
    eventBus: any
  ): void {
    activityUpdateHandler(commandStack, eventBus);
    massRenameHandler(commandStack, eventBus);
    elementUpdateHandler(commandStack, eventBus);
    headlineAndDescriptionUpdateHandler(commandStack, this.titleService);
  }

  public initiateEventBusListeners(eventBus: any, commandStack: any): void {
    eventBus.on('element.dblclick', (e: any) => {
      if (!this.replayStateService.getReplayOn()) {
        const element = e.element;
        if (element.type === elementTypes.ACTIVITY) {
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
  }
}
