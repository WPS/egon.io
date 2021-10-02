import { Injectable } from '@angular/core';
import { assign } from 'min-dash';
import { ElementRegistryService } from 'src/app/elementRegistry-service/element-registry.service';
import { elementTypes } from 'src/app/common/domain/elementTypes';
import { BusinessObject } from 'src/app/common/domain/businessObject';
import { Waypoint } from 'src/app/common/domain/waypoint';
import { ActivityBusinessObject } from '../common/domain/activityBusinessObject';

@Injectable({
  providedIn: 'root',
})
export class ImportRepairService {
  constructor(private elementRegistryService: ElementRegistryService) {}

  public checkElementReferencesAndRepair(elements: BusinessObject[]): boolean {
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
      if (!objectIDs.includes(source.id) || !objectIDs.includes(target.id)) {
        complete = false;
        const activityIndex = elements.indexOf(activity);
        elements = elements.splice(activityIndex, 1);
      }
    });
    return complete;
  }

  // when importing a domain-story, the elements that are visually inside a group are not yet associated with it.
  // to ensure they are correctly associated, we add them to the group
  public correctGroupChildren(): void {
    const allObjects = this.elementRegistryService.getAllCanvasObjects();
    const groups = this.elementRegistryService.getAllGroups();

    groups.forEach((group) => {
      const parent = group.parent;
      // @ts-ignore
      parent.children.slice().forEach((innerShape) => {
        if (innerShape.id !== group.id) {
          if (
            innerShape.x >= group.x &&
            innerShape.x <= group.x + group.width
          ) {
            if (
              innerShape.y >= group.y &&
              innerShape.y <= group.y + group.height
            ) {
              innerShape.parent = group;
              // @ts-ignore
              if (!group.children.includes(innerShape)) {
                // @ts-ignore
                group.children.push(innerShape);
              }
            }
          }
        }
      });
    });
    allObjects.forEach((shape) => {
      const businessObject = shape.businessObject;
      if (
        shape &&
        'type' in shape.parent &&
        shape.parent.type === elementTypes.GROUP
      ) {
        assign(businessObject, {
          parent: shape.parent.id,
        });
      }
    });
  }

  /**
   * Ensure backwards compatibility.
   * Previously Document had no special name and was just addressed as workObject
   * Bubble was renamed to Conversation
   */

  public updateCustomElementsPreviousV050(
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

  public adjustPositions(elements: BusinessObject[]): void {
    let xLeft = 0;
    let yUp = 0;
    let isFirst = true;

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

    if (xLeft < 75 || xLeft > 150 || yUp < 0 || yUp > 50) {
      // add Padding for the Palette and the top
      xLeft -= 75;
      yUp -= 50;

      elements.forEach((element) => {
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
      });
    }
  }
}
