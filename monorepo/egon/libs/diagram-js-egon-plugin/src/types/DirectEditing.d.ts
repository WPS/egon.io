declare module "diagram-js-direct-editing/lib" {
    import { Element } from "diagram-js/lib/model/Types";

    export class DirectEditing {
        registerProvider(provider: any): void;

        isActive(element?: Element): boolean;

        cancel(): void;

        close(): void;

        complete(): void;

        getValue(): string;

        activate(element: Element): boolean;
    }

    export default DirectEditingModule;
}
