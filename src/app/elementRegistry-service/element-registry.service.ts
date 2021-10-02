import { Injectable } from '@angular/core';

import { elementTypes } from 'src/app/common/domain/elementTypes';
import { BusinessObject } from 'src/app/common/domain/businessObject';
import { CanvasObject } from 'src/app/common/domain/canvasObject';
import { GroupCanvasObject } from '../common/domain/groupCanvasObject';
import { ActivityCanvasObject } from '../common/domain/activityCanvasObject';

@Injectable({
  providedIn: 'root',
})
export class ElementRegistryService {
  private registry: any;
  private fullyInitialized = false;

  constructor() {}

  public init(registry: any): void {
    this.registry = registry._elements;
  }

  public clear(): void {
    this.registry = null;
    this.fullyInitialized = false;
  }

  public createObjectListForDSTDownload(): BusinessObject[] {
    if (this.registry[0]) {
      const allObjectsFromCanvas = this.getAllCanvasObjects();
      const groups = this.getAllGroups();

      const objectList: BusinessObject[] = [];

      this.fillListOfCanvasObjects(allObjectsFromCanvas, objectList, groups);

      return objectList;
    }
    return [];
  }

  private fillListOfCanvasObjects(
    allObjectsFromCanvas: CanvasObject[],
    objectList: BusinessObject[],
    groups: GroupCanvasObject[]
  ): void {
    allObjectsFromCanvas.forEach((canvasElement) => {
      if (canvasElement.type === elementTypes.ACTIVITY) {
        objectList.push(canvasElement.businessObject);
      }

      // ensure that Activities are always after Actors, Workobjects and Groups in .dst files
      else {
        if (canvasElement.type === elementTypes.TEXTANNOTATION) {
          canvasElement.businessObject.width = canvasElement.width;
          canvasElement.businessObject.height = canvasElement.height;
        }
        objectList.unshift(canvasElement.businessObject);
      }
    });

    groups.forEach((group) => {
      objectList.push(group.businessObject);
    });
  }

  public correctInitialize(): void {
    if (!this.fullyInitialized) {
      if (this.registry.__implicitroot) {
        this.registry = this.registry.__implicitroot.element.children;
        this.fullyInitialized = true;
      }
    }
  }

  public getAllActivities(): ActivityCanvasObject[] {
    const activities: ActivityCanvasObject[] = [];

    this.getAllCanvasObjects().forEach((element) => {
      if (element.type.includes(elementTypes.ACTIVITY)) {
        activities.push(element as ActivityCanvasObject);
      }
    });
    return activities;
  }

  public getAllConnections(): ActivityCanvasObject[] {
    const connections: ActivityCanvasObject[] = [];
    this.getAllCanvasObjects().forEach((element) => {
      const type = element.type;
      if (type === elementTypes.CONNECTION) {
        connections.push(element as ActivityCanvasObject);
      }
    });
    return connections;
  }

  public getAllCanvasObjects(): CanvasObject[] {
    const allObjects: CanvasObject[] = [];
    const groupObjects: GroupCanvasObject[] = [];

    this.checkChildForGroup(groupObjects, allObjects);

    // for each memorized group, remove it from the group-array and check its children, wether they are groups or not
    // if a child is a group, memorize it in the group-array
    // else add the child to the return-array
    let i = groupObjects.length - 1;
    while (groupObjects.length >= 1) {
      const currentGroup = groupObjects.pop();
      // @ts-ignore
      currentGroup.children.forEach((child: CanvasObject) => {
        const type = child.type;
        if (type.includes(elementTypes.GROUP)) {
          groupObjects.push(child as GroupCanvasObject);
        } else {
          allObjects.push(child);
        }
      });
      i = groupObjects.length - 1;
    }
    return allObjects;
  }

  // returns all groups on the canvas and inside other groups
  public getAllGroups(): GroupCanvasObject[] {
    const groupObjects: GroupCanvasObject[] = [];
    const allObjects: CanvasObject[] = [];

    this.checkChildForGroup(groupObjects, allObjects);

    for (const group of groupObjects) {
      // @ts-ignore
      group.children.forEach((child: CanvasObject) => {
        if (child.type.includes(elementTypes.GROUP)) {
          groupObjects.push(child as GroupCanvasObject);
        }
      });
    }
    return groupObjects;
  }

  private checkChildForGroup(
    groupObjects: GroupCanvasObject[],
    allObjects: CanvasObject[]
  ): void {
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < this.registry.length; i++) {
      const entry = this.registry[i];
      const type = entry.type;
      if (type.includes(elementTypes.GROUP)) {
        // if it is a group, memorize this for later
        groupObjects.push(entry);
      } else {
        allObjects.push(entry);
      }
    }
  }

  // get a list of activities, that originate from an actor-type
  public getActivitiesFromActors(): ActivityCanvasObject[] {
    const activitiesFromActors: ActivityCanvasObject[] = [];
    const activities = this.getAllActivities();

    activities.forEach((activity: ActivityCanvasObject) => {
      // @ts-ignore
      if (activity.source.type.includes(elementTypes.ACTOR)) {
        activitiesFromActors.push(activity);
      }
    });
    return activitiesFromActors;
  }
}
