export interface Command {
    /**
     * After parsing the command, TypeScript can't identify the type of the object
     * with **instanceof**.
     * Therefore, we use this as a workaround.
     */
    TYPE: string;
    editorId: string;
}

export class InitializeWebviewCommand implements Command {
    readonly TYPE = InitializeWebviewCommand.name;

    constructor(readonly editorId: string) {}
}

export class DisplayDomainStoryCommand implements Command {
    readonly TYPE = DisplayDomainStoryCommand.name;

    constructor(
        readonly editorId: string,
        readonly text: string,
    ) {}
}

export class SyncDocumentCommand implements Command {
    readonly TYPE = SyncDocumentCommand.name;

    constructor(
        readonly editorId: string,
        readonly text: string,
    ) {}
}

export class GetDomainStoryAsSvgCommand implements Command {
    readonly TYPE = GetDomainStoryAsSvgCommand.name;

    constructor(
        readonly editorId: string,
        readonly svg?: string,
    ) {}
}
