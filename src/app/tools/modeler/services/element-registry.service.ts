import { Injectable } from '@angular/core';

import { ElementTypes } from 'src/app/domain/entities/element-types';
import { CanvasObject } from 'src/app/domain/entities/canvas-object';
import { GroupCanvasObject } from 'src/app/domain/entities/group-canvas-object';
import { ActivityCanvasObject } from 'src/app/domain/entities/activity-canvas-object';
import { UsedIconList } from 'src/app/domain/entities/used-icon-list';
import {
  DiagramJsElementRegistry,
  ElementMap,
} from 'src/app/tools/modeler/diagram-js/type-interfaces/diagram-js-element-registry';
import { BusinessObject } from 'src/app/domain/entities/business-object';

@Injectable({
  providedIn: 'root',
})
export class ElementRegistryService {
  private registry: ElementMap | null = null;

  setElementRegistry(elementRegistry: DiagramJsElementRegistry): void {
    this.registry = elementRegistry._elements;
  }

  clear(): void {
    this.registry = null;
  }

  createObjectListForDSTDownload(): CanvasObject[] {
    if (this.registry) {
      const allObjectsFromCanvas = this.getAllCanvasObjects();
      const groups = this.getAllGroups();
      const objectList: CanvasObject[] = [];

      this.fillListOfCanvasObjects(allObjectsFromCanvas, objectList, groups);

      return objectList;
    }
    return [];
  }

  getAllBusinessObjectsFromCanvasNotIn(
    notIn: BusinessObject[],
  ): BusinessObject[] {
    const otherBusinessObjects: BusinessObject[] = [];
    const allObjects = this.getAllCanvasObjects().concat(this.getAllGroups());

    allObjects.forEach((element) => {
      if (!notIn.includes(element.businessObject)) {
        otherBusinessObjects.push(element.businessObject);
      }
    });
    return otherBusinessObjects;
  }

  private fillListOfCanvasObjects(
    allObjectsFromCanvas: CanvasObject[],
    objectList: CanvasObject[],
    groups: GroupCanvasObject[],
  ): void {
    allObjectsFromCanvas.forEach((canvasElement) => {
      if (canvasElement.type === ElementTypes.ACTIVITY) {
        objectList.push(canvasElement);
      }

      // ensure that Activities are always after Actors, WorkObjects and Groups in .dst files
      else {
        if (canvasElement.type === ElementTypes.TEXTANNOTATION) {
          canvasElement.businessObject.width = canvasElement.width;
          canvasElement.businessObject.height = canvasElement.height;
        }
        if (!objectList.includes(canvasElement)) {
          objectList.unshift(canvasElement);
        }
      }
    });

    groups.forEach((group) => {
      objectList.push(group);
    });
  }

  private getObjectsOfType<T extends CanvasObject>(type: ElementTypes): T[] {
    return this.getAllCanvasObjects().filter((o) =>
      o.type.includes(type),
    ) as T[];
  }

  getAllActivities(): ActivityCanvasObject[] {
    return this.getObjectsOfType<ActivityCanvasObject>(ElementTypes.ACTIVITY);
  }

  getAllConnections(): ActivityCanvasObject[] {
    return this.getObjectsOfType<ActivityCanvasObject>(ElementTypes.CONNECTION);
  }

  getAllActors(): CanvasObject[] {
    return this.getObjectsOfType<CanvasObject>(ElementTypes.ACTOR);
  }

  getAllWorkObjects(): CanvasObject[] {
    return this.getObjectsOfType<CanvasObject>(ElementTypes.WORKOBJECT);
  }

  getAllCanvasObjects(): CanvasObject[] {
    const allObjects: CanvasObject[] = [];
    const groupObjects: GroupCanvasObject[] = [];

    this.checkChildForGroup(groupObjects, allObjects);

    // for each memorized group, remove it from the group-array and check its children, whether they are groups or not
    // if a child is a group, memorize it in the group-array
    // other children should already be in the allObjects list
    while (groupObjects.length >= 1) {
      const currentGroup = groupObjects.pop();
      currentGroup?.children?.forEach((child: CanvasObject) => {
        const type = child.type;
        if (type.includes(ElementTypes.GROUP)) {
          groupObjects.push(child as GroupCanvasObject);
        }
      });
    }
    return allObjects;
  }

  // returns all groups on the canvas and inside other groups
  getAllGroups(): GroupCanvasObject[] {
    const groupObjects: GroupCanvasObject[] = [];
    const allObjects: CanvasObject[] = [];

    this.checkChildForGroup(groupObjects, allObjects);

    for (const group of groupObjects) {
      group.children?.forEach((child: CanvasObject) => {
        if (child.type.includes(ElementTypes.GROUP)) {
          groupObjects.push(child as GroupCanvasObject);
        }
      });
    }

    const seenIds = new Set<string>();

    return groupObjects.filter((groupObject) => {
      const isNewId = !seenIds.has(groupObject.id);
      if (isNewId) {
        seenIds.add(groupObject.id);
      }
      return isNewId;
    });
  }

  private checkChildForGroup(
    groupObjects: GroupCanvasObject[],
    allObjects: CanvasObject[],
  ): void {
    if (this.registry) {
      const registryElementNames = Object.keys(this.registry);
      for (const name of registryElementNames) {
        const entry = this.registry[name].element;
        if (entry.businessObject) {
          const type = entry.type;
          if (type && type.includes(ElementTypes.GROUP)) {
            // if it is a group, memorize this for later
            groupObjects.push(entry as GroupCanvasObject);
          } else if (type) {
            allObjects.push(entry);
          }
        }
      }
    }
  }

  // get a list of activities, that originate from an actor-type
  getActivitiesFromActors(): ActivityCanvasObject[] {
    const activitiesFromActors: ActivityCanvasObject[] = [];
    const activities = this.getAllActivities();

    activities.forEach((activity: ActivityCanvasObject) => {
      if (activity.source?.type.includes(ElementTypes.ACTOR)) {
        activitiesFromActors.push(activity);
      }
    });

    // sort by activityBusinessObject number
    activitiesFromActors.sort(
      (
        activityCanvasA: ActivityCanvasObject,
        activityCanvasB: ActivityCanvasObject,
      ) => {
        const activityNumberA = Number(activityCanvasA.businessObject.number);
        const activityNumberB = Number(activityCanvasB.businessObject.number);

        return activityNumberA - activityNumberB;
      },
    );

    return activitiesFromActors;
  }

  getUsedIcons(): UsedIconList {
    const actors = this.getAllActors();
    const workObjects = this.getAllWorkObjects();

    return {
      actors: actors.map((a) => a.type.replace(ElementTypes.ACTOR, '')),
      workObjects: workObjects.map((w) =>
        w.type.replace(ElementTypes.WORKOBJECT, ''),
      ),
    };
  }
}
