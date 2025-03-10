import ElementRegistry from "diagram-js/lib/core/ElementRegistry";
import { CanvasObject } from "../entities/canvasObject";
import { ActivityCanvasObject } from "../entities/activityCanvasObject";
import { ElementTypes } from "../entities/elementTypes";
import { GroupCanvasObject } from "../entities/groupCanvasObject";
import { UsedIconList } from "../entities/UsedIconList";

export class ElementRegistryService {
    static $inject: string[] = [];

    private fullyInitialized = false;

    constructor(private registry: ElementRegistry) {}

    /**
     * Initially, the registry has only the root-Element.
     * Once the canvas has bees initialized, we adjust the reference to point to the elements on the canvas for convenience
     */
    correctInitialize(): void {
        if (!this.fullyInitialized) {
            const root = this.registry.find((element) => element.id.startsWith("root"));
            if (root) {
                // this.registry = this.registry.__implicitroot.element.children;
                this.fullyInitialized = true;
            }
        }
    }

    clear(): void {
        // this.registry = null;
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
        let i = groupObjects.length - 1;
        while (groupObjects.length >= 1) {
            const currentGroup = groupObjects.pop();
            currentGroup?.children?.forEach((child: CanvasObject) => {
                const type = child.type;
                if (type.includes(ElementTypes.GROUP)) {
                    groupObjects.push(child as GroupCanvasObject);
                }
            });
            i = groupObjects.length - 1;
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
            actors: actors.map((a) => a.type.replace(ElementTypes.ACTOR, "")),
            workobjects: workobjects.map((w) =>
                w.type.replace(ElementTypes.WORKOBJECT, ""),
            ),
        };
    }

    getAllWorkobjects() {
        return this.getAllCanvasObjects().filter((co) =>
            co.type.includes(ElementTypes.WORKOBJECT),
        );
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

    private checkChildForGroup(
        groupObjects: GroupCanvasObject[],
        allObjects: CanvasObject[],
    ): void {
        const registryElementNames = this.registry.getAll();
        for (const entry of registryElementNames) {
            if (entry.businessObject) {
                const type = entry["type"];
                if (type && type.includes(ElementTypes.GROUP)) {
                    // if it is a group, memorize this for later
                    groupObjects.push(<GroupCanvasObject>entry);
                } else if (type) {
                    allObjects.push(<CanvasObject>entry);
                }
            }
        }
    }

    private getAllActors() {
        return this.getAllCanvasObjects().filter((co) =>
            co.type.includes(ElementTypes.ACTOR),
        );
    }
}

ElementRegistryService.$inject = ["elementRegistry"];
