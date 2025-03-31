import { container, Lifecycle } from "tsyringe";
import { DomainStoryEditorService } from "./application/service/DomainStoryEditorService";

export function config() {
    container.register("DomainStoryModelerViewType", {
        useValue: "egon.io",
    });

    container.register("DomainStoryEditorUseCase", DomainStoryEditorService, {
        lifecycle: Lifecycle.Singleton,
    });
}
