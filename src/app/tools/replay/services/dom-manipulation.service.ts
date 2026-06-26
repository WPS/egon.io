import { inject, Injectable } from '@angular/core';
import { BusinessObject } from 'src/app/domain/entities/business-object';
import { ElementRegistryService } from 'src/app/tools/modeler/services/element-registry.service';
import { ElementTypes } from 'src/app/domain/entities/element-types';
import { StorySentence } from 'src/app/tools/replay/domain/storySentence';
import {
  CONNECTION_PATH_DOM_SELECTOR,
  DISPLAY_BLOCK,
  DISPLAY_NONE,
  HIGHLIGHT_LABEL_FONT_WEIGHT,
  HIGHLIGHT_NUMBER_BACKGROUND_COLOR,
  HIGHLIGHT_NUMBER_COLOR,
  HIGHLIGHT_STROKE_WIDTH,
  LABEL_FONT_WEIGHT,
  NUMBER_BACKGROUND_COLOR,
  NUMBER_COLOR,
  STROKE_WIDTH,
} from '../domain/replayConstants';
import {
  LABEL_CSS_CLASS,
  LABEL_NUMBER_CSS_CLASS,
} from 'src/app/tools/modeler/diagram-js/features/diagramJSConstants';

const MINIMAP_CSS_CLASS = 'djs-minimap';

const QUERY_SELECTOR_PREFIX = '[data-element-id=';
const QUERY_SELECTOR_POSTFIX = ']';

const DEFAULT_COLOR = 'black';

@Injectable({
  providedIn: 'root',
})
/**
 * Manipulates the DOM during replay to only show the elements of the current Sentence
 */
export class DomManipulationService {
  private readonly elementRegistryService = inject(ElementRegistryService);

  showAll(): void {
    this.removeHighlights();
    this.elementRegistryService
      .getAllCanvasObjects()
      .slice()
      .concat(this.elementRegistryService.getAllGroups().slice())
      .map((e) => e.businessObject)
      .forEach((element) => {
        const domObject = document.querySelector(
          QUERY_SELECTOR_PREFIX + element.id + QUERY_SELECTOR_POSTFIX,
        );
        // @ts-ignore
        domObject.style.display = DISPLAY_BLOCK;
      });
  }

  showSentence(replaySentence: StorySentence): void {
    this.removeHighlights();
    this.elementRegistryService
      .getAllBusinessObjectsFromCanvasNotIn(replaySentence.objects)
      .forEach((element) => {
        const domObject = document.querySelector(
          QUERY_SELECTOR_PREFIX + element.id + QUERY_SELECTOR_POSTFIX,
        );
        if (domObject) {
          // @ts-ignore
          domObject.style.display = DISPLAY_NONE;
        }
      });

    this.highlightSentence(
      replaySentence.objects.filter((o) =>
        replaySentence.highlightedObjects.includes(o.id),
      ),
    );

    replaySentence.objects.forEach((element) => {
      const domObject = document.querySelector(
        QUERY_SELECTOR_PREFIX + element.id + QUERY_SELECTOR_POSTFIX,
      );
      if (domObject) {
        // @ts-ignore
        domObject.style.display = DISPLAY_BLOCK;
      }
    });
  }

  getRenderedNumbers(): HTMLElement[] {
    const elementsByClassName = document.getElementsByClassName(
      LABEL_NUMBER_CSS_CLASS,
    );
    const renderedNumberRegistry: HTMLElement[] = [];
    for (let i = 0; i < elementsByClassName.length; i++) {
      if (!elementsByClassName[i].closest('.' + MINIMAP_CSS_CLASS)) {
        renderedNumberRegistry.push(elementsByClassName[i] as HTMLElement);
      }
    }
    return renderedNumberRegistry;
  }

  private getNumberDomForActivity(activity: SVGPathElement): {
    numberBackgroundDom: HTMLElement | undefined;
    numberTextDom: HTMLElement | undefined;
  } {
    const numberText = activity.parentElement?.getElementsByClassName(
      LABEL_NUMBER_CSS_CLASS,
    )[0] as HTMLElement;
    const circle = (numberText as HTMLElement)?.previousSibling as HTMLElement;
    return {
      numberBackgroundDom: circle,
      numberTextDom: numberText,
    };
  }

  private getLabelDomForActivity(
    activity: SVGPathElement,
  ): HTMLElement | undefined {
    return activity.parentElement?.getElementsByClassName(
      LABEL_CSS_CLASS,
    )[0] as HTMLElement;
  }

  private removeHighlights(): void {
    const allActivities = this.elementRegistryService.getAllActivities();
    const allConnections = this.elementRegistryService.getAllConnections();

    allActivities.forEach((activity) => {
      const querySelector = document.querySelector(
        QUERY_SELECTOR_PREFIX + activity.id + QUERY_SELECTOR_POSTFIX,
      );
      if (querySelector) {
        const activityDomObject = querySelector.getElementsByTagName(
          CONNECTION_PATH_DOM_SELECTOR,
        )[0];

        activityDomObject.style.stroke =
          activity.businessObject.pickedColor || DEFAULT_COLOR;
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
      const querySelector = document.querySelector(
        QUERY_SELECTOR_PREFIX + connection.id + QUERY_SELECTOR_POSTFIX,
      );
      if (querySelector) {
        const connectionDomObject = querySelector.getElementsByTagName(
          CONNECTION_PATH_DOM_SELECTOR,
        )[0];

        connectionDomObject.style.stroke =
          connection.businessObject.pickedColor || DEFAULT_COLOR;
        connectionDomObject.style.strokeWidth = STROKE_WIDTH;
      }
    });
  }

  private highlightSentence(sentenceObjects: BusinessObject[]): void {
    sentenceObjects
      .filter((e) => e.type === ElementTypes.ACTIVITY)
      .forEach((activity) => {
        const querySelector = document.querySelector(
          QUERY_SELECTOR_PREFIX + activity.id + QUERY_SELECTOR_POSTFIX,
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
}
