import { Injectable } from '@angular/core';
import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import { BusinessObject } from 'src/app/domain/entities/businessObject';
import { ActivityBusinessObject } from '../../../domain/entities/activityBusinessObject';

/**
 * Repairs broken Domain Stories so that it can be rendered onto the canvas
 * by removing activities and connections that reference elements that don't exists
 */
@Injectable({
  providedIn: 'root',
})
export class ImportRepairService {
  checkForUnreferencedElementsInActivitiesAndRepair(
    elements: BusinessObject[],
  ): boolean {
    const activities: ActivityBusinessObject[] = [];
    const objectIDs: string[] = [];

    let complete = true;

    elements.forEach((element) => {
      const type = element.type;
      if (type === ElementTypes.ACTIVITY || type === ElementTypes.CONNECTION) {
        activities.push(element as ActivityBusinessObject);
      } else {
        objectIDs.push(element.id);
      }
    });

    activities.forEach((activity) => {
      const source = activity.source;
      const target = activity.target;
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
    elements: BusinessObject[],
  ): BusinessObject[] {
    for (const element of elements) {
      if (element.type === ElementTypes.WORKOBJECT) {
        element.type = ElementTypes.WORKOBJECT + 'Document';
      } else if (element.type === ElementTypes.WORKOBJECT + 'Bubble') {
        element.type = ElementTypes.WORKOBJECT + 'Conversation';
      }
    }
    return elements;
  }

  // Early versions of Egon allowed Whitespaces in Icon names which are now not supported anymore.
  // To find the right icon in the dictionary, they need to be replaced.
  removeWhitespacesFromIcons(elements: BusinessObject[]) {
    elements.forEach((bo) => {
      if (bo.type) {
        bo.type = bo.type.replace(/ /g, '-');
      }
    });
  }
}
