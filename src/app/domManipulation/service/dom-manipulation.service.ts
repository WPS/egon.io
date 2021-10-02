import { Injectable } from '@angular/core';
import { BusinessObject } from 'src/app/common/domain/businessObject';
import { ElementRegistryService } from 'src/app/elementRegistry-service/element-registry.service';
import { elementTypes } from 'src/app/common/domain/elementTypes';
import { StoryStep } from 'src/app/storyCreator-service/domain/storyStep';
import {
  highlightColour,
  highlightNumberBackgroudColour,
  highlightNumberColour,
  highlightStrokeWidth,
  numberBackgroudColour,
  numberColour,
  strokeWidth,
} from '../domain/replayConstants';

@Injectable({
  providedIn: 'root',
})
export class DomManipulationService {
  constructor(private elementRegistryService: ElementRegistryService) {}

  public showAll(): void {
    this.removeHighlights();
    this.elementRegistryService
      .getAllCanvasObjects()
      .slice()
      .concat(this.elementRegistryService.getAllGroups().slice())
      .map((e) => e.businessObject)
      .forEach((element) => {
        const domObject = document.querySelector(
          '[data-element-id=' + element.id + ']'
        );
        // @ts-ignore
        domObject.style.display = 'block';
      });
  }

  public showStep(replayStep: StoryStep, previousStep?: StoryStep): void {
    this.removeHighlights();
    const notShown = this.getAllNotShown(replayStep.objects);

    notShown.forEach((element) => {
      const domObject = document.querySelector(
        '[data-element-id=' + element.id + ']'
      );
      if (domObject) {
        // @ts-ignore
        domObject.style.display = 'none';
      }
    });

    this.hightlightStep(
      previousStep
        ? replayStep.objects.filter((o) => !previousStep.objects.includes(o))
        : replayStep.objects
    );

    replayStep.objects.forEach((element) => {
      const domObject = document.querySelector(
        '[data-element-id=' + element.id + ']'
      );
      if (domObject) {
        // @ts-ignore
        domObject.style.display = 'block';
      }
    });
  }

  /**
   * untestable DOM-Manipulations
   */
  public getNumberDomForActivity(activity: SVGPolylineElement): any {
    const numberDOMS =
      // @ts-ignore
      activity.parentElement.getElementsByClassName('djs-labelNumber');
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
        '[data-element-id=' + activity.id + ']'
      );
      if (querySelector) {
        const activityDomObject =
          querySelector.getElementsByTagName('polyline')[0];

        activityDomObject.style.stroke =
          activity.businessObject.pickedColor || 'black';
        activityDomObject.style.strokeWidth = strokeWidth;

        const { numberBackgroundDom, numberTextDom } =
          this.getNumberDomForActivity(activityDomObject);
        if (numberBackgroundDom && numberTextDom) {
          numberBackgroundDom.style.fill = numberBackgroudColour;
          numberTextDom.style.fill = numberColour;
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
          '[data-element-id=' + activity.id + ']'
        );
        if (querySelector) {
          const activityDomObject =
            querySelector.getElementsByTagName('polyline')[0];

          activityDomObject.style.stroke = highlightColour;
          activityDomObject.style.strokeWidth = highlightStrokeWidth;

          const { numberBackgroundDom, numberTextDom } =
            this.getNumberDomForActivity(activityDomObject);
          if (numberTextDom && numberBackgroundDom) {
            numberBackgroundDom.style.fill = highlightNumberBackgroudColour;
            numberTextDom.style.fill = highlightNumberColour;
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
