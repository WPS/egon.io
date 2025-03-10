import ModelingModule from "diagram-js/lib/features/modeling";

import DomainStoryRules from "../rules";
import { DomainStoryModeling } from "./DomainStoryModeling";

export default {
    __depends__: [DomainStoryRules, ModelingModule],
    modeling: ["type", DomainStoryModeling],
};
