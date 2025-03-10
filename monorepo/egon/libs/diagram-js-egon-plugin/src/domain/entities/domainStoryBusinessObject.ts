import { ElementTypes } from "./elementTypes";

export interface DomainStoryBusinessObject {
    id: string;
    name: string;

    type: string;

    x: number;
    y: number;
    height: number | undefined;
    width: number | undefined;
    pickedColor: string | undefined;
}

export const testBusinessObject: DomainStoryBusinessObject = {
    id: "test",
    name: "test",

    type: ElementTypes.WORKOBJECT,

    x: 0,
    y: 0,
    height: 38,
    width: 38,
    pickedColor: undefined,
};
