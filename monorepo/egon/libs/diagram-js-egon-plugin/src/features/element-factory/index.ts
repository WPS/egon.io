import { DomainStoryElementFactory } from "./DomainStoryElementFactory";
import DomainStoryIdFactory from "../id-factory";

export default {
    __depends__: [DomainStoryIdFactory],
    elementFactory: ["type", DomainStoryElementFactory],
};
