import { WebviewApi } from "vscode-webview";
import {
    Command,
    DisplayDomainStoryCommand,
    InitializeWebviewCommand,
    SyncDocumentCommand,
} from "@egon/data-transfer-objects";

declare const process: { env: { NODE_ENV: string } };

type StateType = {
    editorId: string;
};

export function getVsCodeApi(): VsCodeApi<StateType, Command> {
    if (process.env.NODE_ENV === "development") {
        return new VsCodeMock<StateType, Command>();
    } else {
        return new VsCodeImpl<StateType, Command>();
    }
}

export interface VsCodeApi<T, M> {
    /**
     * Get the current state of the webview.
     * @throws MissingStateError if the state is missing
     */
    getState(): T;

    setState(state: T): void;

    updateState(state: Partial<T>): void;

    postMessage(message: M): void;
}

export class VsCodeImpl<T, M extends Command> implements VsCodeApi<T, M> {
    private vscode: WebviewApi<T>;

    constructor() {
        this.vscode = acquireVsCodeApi();
    }

    getState(): T {
        const state = this.vscode.getState();
        if (!state) throw new MissingStateError();
        return state;
    }

    setState(state: T) {
        this.vscode.setState({
            ...state,
        });
    }

    updateState(state: Partial<T>) {
        this.setState({
            ...this.getState(),
            ...state,
        });
    }

    postMessage(message: M) {
        this.vscode.postMessage(message);
    }
}

export class MissingStateError extends Error {
    constructor() {
        super("State is missing.");
    }
}

export class VsCodeMock<T, M extends Command> implements VsCodeApi<T, M> {
    protected state: T | undefined;

    getState(): T {
        if (!this.state) throw new MissingStateError();
        return this.state;
    }

    setState(state: T) {
        this.state = state;
    }

    updateState(): void {
        throw new Error("Method not implemented.");
    }

    postMessage(command: Command): void {
        switch (true) {
            case command.TYPE === InitializeWebviewCommand.name: {
                // The initial message that gets sent if the webview is fully
                // loaded.
                dispatchEvent(new DisplayDomainStoryCommand("123456", mockStory));
                break;
            }
            case command.TYPE === SyncDocumentCommand.name: {
                const c = command as SyncDocumentCommand;
                dispatchEvent(new SyncDocumentCommand("123456", c.text));
                break;
            }
            default: {
                throw new Error(`Unknown message type: ${command.TYPE}`);
            }
        }

        function dispatchEvent(event: Command) {
            window.dispatchEvent(
                new MessageEvent("message", {
                    data: event,
                }),
            );
        }
    }
}

const mockStory = JSON.stringify({
    domain: {},
    dst: [],
});
