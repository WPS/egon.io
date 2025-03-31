import { ExtensionContext } from "vscode";

let context: ExtensionContext | undefined;

export function setContext(newContext: ExtensionContext): ExtensionContext {
    context = newContext;
    return context;
}

export function getContext(): ExtensionContext {
    if (!context) {
        throw new Error("No context set.");
    }
    return context;
}
