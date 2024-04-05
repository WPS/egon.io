import { Injectable } from '@angular/core';
import { BusinessObject } from 'src/app/Domain/Common/businessObject';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import { elementTypes } from 'src/app/Domain/Common/elementTypes';
import { StoryStep } from 'src/app/Domain/Replay/storyStep';
import {
  HIGHLIGHT_COLOR,
  HIGHLIGHT_NUMBER_BACKGROUNG_COLOR,
  HIGHLIGHT_NUMBER_COLOR,
  HIGHLIGHT_STROKE_WIDTH,
  NUMBER_BACKGROUND_COLOR,
  NUMBER_COLOR,
  STROKE_WIDTH,
} from '../../Domain/DomManipulation/replayConstants';

@Injectable({
  providedIn: 'root',
})
/**
 * Manipulates the DOM during replay to only show the elements of the current Step
 */
export class DomManipulationService {
  constructor(private elementRegistryService: ElementRegistryService) {}

  showAll(): void {
    this.removeHighlights();
    this.elementRegistryService
      .getAllCanvasObjects()
      .slice()
      .concat(this.elementRegistryService.getAllGroups().slice())
      .map((e) => e.businessObject)
      .forEach((element) => {
        const domObject = document.querySelector(
          '[data-element-id=' + element.id + ']',
        );
        // @ts-ignore
        domObject.style.display = 'block';
      });
  }

  showStep(replayStep: StoryStep, previousStep?: StoryStep): void {
    this.removeHighlights();
    const notShown = this.getAllNotShown(replayStep.objects);

    notShown.forEach((element) => {
      const domObject = document.querySelector(
        '[data-element-id=' + element.id + ']',
      );
      if (domObject) {
        // @ts-ignore
        domObject.style.display = 'none';
      }
    });

    this.hightlightStep(
      previousStep
        ? replayStep.objects.filter((o) => !previousStep.objects.includes(o))
        : replayStep.objects,
    );

    replayStep.objects.forEach((element) => {
      const domObject = document.querySelector(
        '[data-element-id=' + element.id + ']',
      );
      if (domObject) {
        // @ts-ignore
        domObject.style.display = 'block';
      }
    });
  }

  getNumberDomForActivity(activity: SVGPolylineElement): any {
    const numberDOMS = activity.parentElement?.getElementsByClassName(
      'djs-labelNumber',
    ) || ['', ''];
    return {
      numberBackgroundDom: numberDOMS[0],
      numberTextDom: numberDOMS[1],
    };
  }

  private removeHighlights(): void {
    const allActivities = this.elementRegistryService.getAllActivities();
    const allConnections = this.elementRegistryService.getAllConnections();

    allActivities.forEach((activity) => {
      const querySelector = document.querySelector(
        '[data-element-id=' + activity.id + ']',
      );
      if (querySelector) {
        const activityDomObject =
          querySelector.getElementsByTagName('polyline')[0];

        activityDomObject.style.stroke =
          activity.businessObject.pickedColor || 'black';
        activityDomObject.style.strokeWidth = STROKE_WIDTH;

        const { numberBackgroundDom, numberTextDom } =
          this.getNumberDomForActivity(activityDomObject);
        if (numberBackgroundDom && numberTextDom) {
          numberBackgroundDom.style.fill = NUMBER_BACKGROUND_COLOR;
          numberTextDom.style.fill = NUMBER_COLOR;
        }
      }
    });

    allConnections.forEach((connection) => {
      // @ts-ignore
      const connectionDomObject = document
        .querySelector('[data-element-id=' + connection.id + ']')
        .getElementsByTagName('polyline')[0];

      connectionDomObject.style.stroke =
        connection.businessObject.pickedColor || 'black';
      connectionDomObject.style.strokeWidth = '1.5';
    });
  }

  private hightlightStep(stepObjects: BusinessObject[]): void {
    stepObjects
      .filter((e) => e.type === elementTypes.ACTIVITY)
      .forEach((activity) => {
        const querySelector = document.querySelector(
          '[data-element-id=' + activity.id + ']',
        );
        if (querySelector) {
          const activityDomObject =
            querySelector.getElementsByTagName('polyline')[0];

          activityDomObject.style.stroke = HIGHLIGHT_COLOR;
          activityDomObject.style.strokeWidth = HIGHLIGHT_STROKE_WIDTH;

          const { numberBackgroundDom, numberTextDom } =
            this.getNumberDomForActivity(activityDomObject);
          if (numberTextDom && numberBackgroundDom) {
            numberBackgroundDom.style.fill = HIGHLIGHT_NUMBER_BACKGROUNG_COLOR;
            numberTextDom.style.fill = HIGHLIGHT_NUMBER_COLOR;
          }
        }
      });
  }

  private getAllNotShown(shownElements: BusinessObject[]): BusinessObject[] {
    const notShownElements: BusinessObject[] = [];
    const allObjects = this.elementRegistryService
      .getAllCanvasObjects()
      .concat(this.elementRegistryService.getAllGroups());

    allObjects.forEach((element) => {
      if (!shownElements.includes(element.businessObject)) {
        if (element.type.includes(elementTypes.CONNECTION)) {
          // @ts-ignore
          if (!element.source.type.includes(elementTypes.GROUP)) {
            notShownElements.push(element.businessObject);
          } else {
            // @ts-ignore
            shownElements.push(element.target);
          }
        } else {
          notShownElements.push(element.businessObject);
        }
      }
    });
    return notShownElements;
  }
}
