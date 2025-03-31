import "reflect-metadata";
import { ExtensionContext } from "vscode";
import { setContext } from "./adapter/helper/vscode";
import { container } from "tsyringe";
import { WebviewController } from "./adapter/in/WebviewController";
import { config } from "./main.config";

export function activate(context: ExtensionContext) {
    // 1. Set the global application context
    setContext(context);

    // 2. Configure the application
    config();

    // 4. Start the application
    container.resolve(WebviewController);
}
