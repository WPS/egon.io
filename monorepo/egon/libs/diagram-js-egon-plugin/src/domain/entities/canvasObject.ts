import { BusinessObject, testBusinessObject } from "./businessObject";
import { RootObject, testRoot } from "./rootObject";
import { ActivityCanvasObject } from "./activityCanvasObject";
import { ElementTypes } from "./elementTypes";

export interface CanvasObject {
    attachers: any;
    host: any;

    parent: CanvasObject | RootObject;
    businessObject: BusinessObject;
    incoming: ActivityCanvasObject[] | undefined;
    outgoing: ActivityCanvasObject[] | undefined;

    id: string;
    type: string;
    height: number;
    width: number;
    x: number;
    y: number;
    name: string;
    text: string | undefined;

    pickedColor: string | undefined;
}

export const testCanvasObject: CanvasObject = {
    attachers: undefined,
    host: undefined,

    parent: testRoot,
    businessObject: testBusinessObject,
    incoming: [],
    outgoing: [],
    id: "test",
    type: ElementTypes.WORKOBJECT,
    height: 38,
    width: 38,
    x: 0,
    y: 0,
    name: "test",
    text: undefined,

    pickedColor: undefined,
};
