import { Editor } from "../domain/DomainStoryEditor";

export interface DomainStoryEditorUseCase {
    /**
     * Creates and set the active editor.
     * @param id
     * @param uri
     * @param content
     * @return editorId
     */
    create(id: string, uri: string, content: string): string;

    /**
     * Get the active editor.
     * @return editor
     */
    getActiveEditor(): Editor;

    /**
     * Get the editor with given id.
     * @param id
     * @return editor
     */
    getEditor(id: string): Editor;

    /**
     * Synchronize the file content with the webview.
     * @param id
     * @param content
     * @return the new file content
     */
    sync(id: string, content: string): string;

    /**
     * If the user changes the tab to a different DomainStoryEditor the active
     * editor has to change too.
     * @param id
     * @return the id of the new active editor
     */
    setActiveEditor(id: string): string;
}
