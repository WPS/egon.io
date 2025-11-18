import { Injectable } from '@angular/core';
import { BusinessObject } from 'src/app/domain/entities/businessObject';
import { ElementRegistryService } from 'src/app/domain/services/element-registry.service';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import { StorySentence } from 'src/app/tools/replay/domain/storySentence';
import {
  HIGHLIGHT_LABEL_FONT_WEIGHT,
  HIGHLIGHT_NUMBER_BACKGROUND_COLOR,
  HIGHLIGHT_NUMBER_COLOR,
  HIGHLIGHT_STROKE_WIDTH,
  LABEL_FONT_WEIGHT,
  NUMBER_BACKGROUND_COLOR,
  NUMBER_COLOR,
  STROKE_WIDTH,
  CONNECTION_PATH_DOM_SELECTOR,
} from '../domain/replayConstants';

@Injectable({
  providedIn: 'root',
})
/**
 * Manipulates the DOM during replay to only show the elements of the current Sentence
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

  showSentence(
    replaySentence: StorySentence,
    previousSentence?: StorySentence,
  ): void {
    this.removeHighlights();
    const notShown = this.getAllNotShown(replaySentence.objects);

    notShown.forEach((element) => {
      const domObject = document.querySelector(
        '[data-element-id=' + element.id + ']',
      );
      if (domObject) {
        // @ts-ignore
        domObject.style.display = 'none';
      }
    });

    this.highlightSentence(
      previousSentence
        ? replaySentence.objects.filter(
            (o) => !previousSentence.objects.includes(o),
          )
        : replaySentence.objects,
    );

    replaySentence.objects.forEach((element) => {
      const domObject = document.querySelector(
        '[data-element-id=' + element.id + ']',
      );
      if (domObject) {
        // @ts-ignore
        domObject.style.display = 'block';
      }
    });
  }

  private getNumberDomForActivity(activity: SVGPathElement): any {
    const numberText =
      activity.parentElement?.getElementsByClassName('djs-labelNumber')[0] ??
      '';
    const circle = (numberText as HTMLElement)?.previousSibling ?? '';
    return {
      numberBackgroundDom: circle,
      numberTextDom: numberText,
    };
  }

  private getLabelDomForActivity(activity: SVGPathElement): any {
    return activity.parentElement?.getElementsByClassName('djs-label')[0] ?? '';
  }

  private removeHighlights(): void {
    const allActivities = this.elementRegistryService.getAllActivities();
    const allConnections = this.elementRegistryService.getAllConnections();

    allActivities.forEach((activity) => {
      const querySelector = document.querySelector(
        '[data-element-id=' + activity.id + ']',
      );
      if (querySelector) {
        const activityDomObject = querySelector.getElementsByTagName(
          CONNECTION_PATH_DOM_SELECTOR,
        )[0];

        activityDomObject.style.stroke =
          activity.businessObject.pickedColor || 'black';
        activityDomObject.style.strokeWidth = STROKE_WIDTH;

        const activityLabelDom = this.getLabelDomForActivity(activityDomObject);
        if (activityLabelDom) {
          activityLabelDom.style.fontWeight = LABEL_FONT_WEIGHT;
        }

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
        .getElementsByTagName(CONNECTION_PATH_DOM_SELECTOR)[0];

      connectionDomObject.style.stroke =
        connection.businessObject.pickedColor || 'black';
      connectionDomObject.style.strokeWidth = '1.5';
    });
  }

  private highlightSentence(sentenceObjects: BusinessObject[]): void {
    sentenceObjects
      .filter((e) => e.type === ElementTypes.ACTIVITY)
      .forEach((activity) => {
        const querySelector = document.querySelector(
          '[data-element-id=' + activity.id + ']',
        );
        if (querySelector) {
          const activityDomObject = querySelector.getElementsByTagName(
            CONNECTION_PATH_DOM_SELECTOR,
          )[0];

          activityDomObject.style.strokeWidth = HIGHLIGHT_STROKE_WIDTH;

          const activityLabelDom =
            this.getLabelDomForActivity(activityDomObject);
          if (activityLabelDom) {
            activityLabelDom.style.fontWeight = HIGHLIGHT_LABEL_FONT_WEIGHT;
          }

          const { numberBackgroundDom, numberTextDom } =
            this.getNumberDomForActivity(activityDomObject);
          if (numberTextDom && numberBackgroundDom) {
            numberBackgroundDom.style.fill = HIGHLIGHT_NUMBER_BACKGROUND_COLOR;
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
        notShownElements.push(element.businessObject);
      }
    });
    return notShownElements;
  }
}
