import { IconDictionaryService } from "../../icon-set-config/service/IconDictionaryService";
import { ElementTypes } from "../../domain/entities/elementTypes";
import { Shape } from "diagram-js/lib/model/Types";

export type ReplaceOption = {
    label: string;
    actionName: string;
    className: string;
    target: Partial<Shape>;
};

export class DomainStoryReplaceOption {
    static $inject: string[] = [];

    constructor(private readonly iconDictionaryService: IconDictionaryService) {}

    actorReplaceOptions(name: string) {
        const actors = this.iconDictionaryService.getIconsAssignedAs(ElementTypes.ACTOR);

        const replaceOption: ReplaceOption[] = [];

        actors.keysArray().forEach((actorType, index) => {
            if (!name.includes(actorType)) {
                const typeName = actorType;
                replaceOption[index] = {
                    label: "Change to " + typeName,
                    actionName: "replace-with-actor-" + typeName.toLowerCase(),
                    className: this.iconDictionaryService.getCSSClassOfIcon(actorType),
                    target: {
                        type: `${ElementTypes.ACTOR}${actorType}`,
                    },
                };
            }
        });
        return replaceOption;
    }

    workObjectReplaceOptions(name: string) {
        const workObjects = this.iconDictionaryService.getIconsAssignedAs(
            ElementTypes.WORKOBJECT,
        );

        const replaceOption: ReplaceOption[] = [];

        workObjects.keysArray().forEach((workObjectType, index) => {
            if (!name.includes(workObjectType)) {
                const typeName = workObjectType;
                replaceOption[index] = {
                    label: "Change to " + typeName,
                    actionName: "replace-with-actor-" + typeName,
                    className:
                        this.iconDictionaryService.getCSSClassOfIcon(workObjectType),
                    target: {
                        type: `${ElementTypes.WORKOBJECT}${workObjectType}`,
                    },
                };
            }
        });
        return replaceOption;
    }
}

DomainStoryReplaceOption.$inject = ["domainStoryIconDictionaryService"];
