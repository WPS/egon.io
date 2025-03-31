import { getVsCodeApi } from "./vscode/api";
import { debounce } from "lodash";
import {
    createDomainStoryModeler,
    exportStory,
    getDomainStoryModeler,
    importStory,
    NoModelerError,
    onCommandStackChanged,
} from "./modeler";
import {
    Command,
    DisplayDomainStoryCommand,
    InitializeWebviewCommand,
    SyncDocumentCommand,
} from "@egon/data-transfer-objects";

const vscode = getVsCodeApi();

/**
 * Debounce the update of the diagram content to avoid too many updates.
 * @param bpmn
 * @throws NoModelerError if the modeler is not available
 */
const updateStory = debounce(importStory, 100);

/**
 * The Main function that gets executed after the webview is fully loaded.
 * This way we can ensure that when the backend sends a message, it is caught.
 * There are two reasons why a webview gets build:
 * 1. A new .egn file was opened
 * 2. User switched to another tab and now switched back
 */
window.onload = function () {
    window.addEventListener("message", onReceiveMessage);

    let editorId: string;
    try {
        editorId = vscode.getState().editorId;
    } catch (error: unknown) {
        editorId = "";
    }

    vscode.postMessage(new InitializeWebviewCommand(editorId));

    console.debug("[DEBUG] Modeler is initialized...");
};

/**
 * Send the changed story to the backend to update the .bpmn file.
 */
function sendStoryChanges() {
    const egn = exportStory();
    vscode.postMessage(new SyncDocumentCommand(vscode.getState().editorId, egn));
}

/**
 * Listen to messages from the backend.
 */
function onReceiveMessage(message: MessageEvent<Command>) {
    const command = message.data;

    switch (true) {
        case command.TYPE === DisplayDomainStoryCommand.name: {
            const c = command as DisplayDomainStoryCommand;
            try {
                getDomainStoryModeler();
                updateStory(c.text);
            } catch (error: unknown) {
                if (error instanceof NoModelerError) {
                    initializeDomainStoryModeler(c.text);
                    vscode.setState({
                        editorId: c.editorId,
                    });
                }
            }
            break;
        }
    }
}

function initializeDomainStoryModeler(story: string) {
    createDomainStoryModeler();
    if (story) {
        importStory(story);
    }
    onCommandStackChanged(debounce(sendStoryChanges, 100));
}
