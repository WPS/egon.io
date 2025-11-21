import { Injectable } from '@angular/core';

import { ElementTypes } from 'src/app/domain/entities/elementTypes';
import { CanvasObject } from 'src/app/domain/entities/canvasObject';
import { GroupCanvasObject } from '../entities/groupCanvasObject';
import { ActivityCanvasObject } from '../entities/activityCanvasObject';
import { UsedIconList } from 'src/app/domain/entities/UsedIconList';

@Injectable({
  providedIn: 'root',
})
export class ElementRegistryService {
  private registry: any;
  private fullyInitialized = false;

  /**
   * Initially the registry has only the root-Element.
   * Once the canvas has bees initialized, we adjust the reference to point to the elements on the canvas for convenience
   */
  correctInitialize(): void {
    if (!this.fullyInitialized) {
      if (this.registry.__implicitroot) {
        this.registry = this.registry.__implicitroot.element.children;
        this.fullyInitialized = true;
      }
    }
  }

  setElementRegistry(registry: any): void {
    this.registry = registry._elements;
  }

  clear(): void {
    this.registry = null;
    this.fullyInitialized = false;
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

  private fillListOfCanvasObjects(
    allObjectsFromCanvas: CanvasObject[],
    objectList: CanvasObject[],
    groups: GroupCanvasObject[],
  ): void {
    allObjectsFromCanvas.forEach((canvasElement) => {
      if (canvasElement.type === ElementTypes.ACTIVITY) {
        objectList.push(canvasElement);
      }

      // ensure that Activities are always after Actors, Workobjects and Groups in .dst files
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

  getAllActivities(): ActivityCanvasObject[] {
    const activities: ActivityCanvasObject[] = [];

    this.getAllCanvasObjects().forEach((element) => {
      if (element.type.includes(ElementTypes.ACTIVITY)) {
        activities.push(element as ActivityCanvasObject);
      }
    });
    return activities;
  }

  getAllConnections(): ActivityCanvasObject[] {
    const connections: ActivityCanvasObject[] = [];
    this.getAllCanvasObjects().forEach((element) => {
      const type = element.type;
      if (type === ElementTypes.CONNECTION) {
        connections.push(element as ActivityCanvasObject);
      }
    });
    return connections;
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
      // @ts-ignore
      currentGroup.children.forEach((child: CanvasObject) => {
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
    const registryElementNames = Object.keys(this.registry);
    for (let name of registryElementNames) {
      const entry = this.registry[name].element;
      if (entry.businessObject) {
        const type = entry.type;
        if (type && type.includes(ElementTypes.GROUP)) {
          // if it is a group, memorize this for later
          groupObjects.push(entry);
        } else if (type) {
          allObjects.push(entry);
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
    const workobjects = this.getAllWorkobjects();

    return {
      actors: actors.map((a) => a.type.replace(ElementTypes.ACTOR, '')),
      workobjects: workobjects.map((w) =>
        w.type.replace(ElementTypes.WORKOBJECT, ''),
      ),
    };
  }

  private getAllActors() {
    return this.getAllCanvasObjects().filter((co) =>
      co.type.includes(ElementTypes.ACTOR),
    );
  }

  getAllWorkobjects() {
    return this.getAllCanvasObjects().filter((co) =>
      co.type.includes(ElementTypes.WORKOBJECT),
    );
  }
}
