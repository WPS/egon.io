import { Injectable } from '@angular/core';
import { ElementRegistryService } from 'src/app/Service/ElementRegistry/element-registry.service';
import { elementTypes } from 'src/app/Domain/Common/elementTypes';
import { BusinessObject } from 'src/app/Domain/Common/businessObject';
import { Waypoint } from 'src/app/Domain/Common/waypoint';
import { ActivityBusinessObject } from '../../Domain/Common/activityBusinessObject';

/**
 * Repairs broken Domain Stories so that it can be rendered onto the canvas
 * by removing activities and connections that reference elements that don't exists
 */
@Injectable({
  providedIn: 'root',
})
export class ImportRepairService {
  constructor(private elementRegistryService: ElementRegistryService) {}

  checkForUnreferencedElementsInActivitiesAndRepair(
    elements: BusinessObject[]
  ): boolean {
    const activities: ActivityBusinessObject[] = [];
    const objectIDs: string[] = [];

    let complete = true;

    elements.forEach((element) => {
      const type = element.type;
      if (type === elementTypes.ACTIVITY || type === elementTypes.CONNECTION) {
        activities.push(element as ActivityBusinessObject);
      } else {
        objectIDs.push(element.id);
      }
    });

    activities.forEach((activity) => {
      const source = activity.source;
      const target = activity.target;
      // @ts-ignore
      if (!objectIDs.includes(source) || !objectIDs.includes(target)) {
        complete = false;
        const activityIndex = elements.indexOf(activity);
        elements = elements.splice(activityIndex, 1);
      }
    });
    return complete;
  }

  /**
   * Ensure backwards compatibility.
   * Previously Document had no special name and was just addressed as workObject
   * Bubble was renamed to Conversation
   */
  updateCustomElementsPreviousV050(
    elements: BusinessObject[]
  ): BusinessObject[] {
    for (const element of elements) {
      if (element.type === elementTypes.WORKOBJECT) {
        element.type = elementTypes.WORKOBJECT + 'Document';
      } else if (element.type === elementTypes.WORKOBJECT + 'Bubble') {
        element.type = elementTypes.WORKOBJECT + 'Conversation';
      }
    }
    return elements;
  }

  /**
   * Adjusts Positions of Elements to ensure the Domain Story starts in the visible parts of the canvas
   */
  adjustPositions(elements: BusinessObject[]): void {
    let xLeft = 0;
    let yUp = 0;
    let isFirst = true;

    this.findFirstElement(elements, isFirst, xLeft, yUp);

    if (xLeft < 75 || xLeft > 150 || yUp < 0 || yUp > 50) {
      // add Padding for the Palette and the top
      xLeft -= 75;
      yUp -= 50;

      elements.forEach((element) =>
        this.adjustElementPosition(element, xLeft, yUp)
      );
    }
  }

  private adjustElementPosition(
    element: BusinessObject,
    xLeft: number,
    yUp: number
  ): void {
    if (
      element.type === elementTypes.ACTIVITY ||
      element.type === elementTypes.CONNECTION
    ) {
      const waypoints = (element as ActivityBusinessObject).waypoints;
      // @ts-ignore
      waypoints.forEach((point: Waypoint) => {
        point.x -= xLeft;
        point.y -= yUp;

        if (point.original) {
          point.original.x = point.x;
          point.original.y = point.y;
        }
      });
    } else {
      element.x -= xLeft;
      element.y -= yUp;
    }
  }

  private findFirstElement(
    elements: BusinessObject[],
    isFirst: boolean,
    xLeft: number,
    yUp: number
  ) {
    elements.forEach((element) => {
      let elXLeft;
      let elYUp;
      if (
        element.type !== elementTypes.ACTIVITY &&
        element.type !== elementTypes.CONNECTION
      ) {
        if (isFirst) {
          // @ts-ignore
          xLeft = parseFloat(element.x);
          // @ts-ignore
          yUp = parseFloat(element.y);
          isFirst = false;
        }
        // @ts-ignore
        elXLeft = parseFloat(element.x);
        // @ts-ignore
        elYUp = parseFloat(element.y);
        if (elXLeft < xLeft) {
          xLeft = elXLeft;
        }
        if (elYUp < yUp) {
          yUp = elYUp;
        }
      }
    });
  }
}
