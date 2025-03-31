import { Uri, Webview } from "vscode";

/**
 * The name of the directory where the necessary files for the webview are located after build.
 */
const WEBVIEW_PATH = "webview";

export function domainStoryEditorUi(webview: Webview, extensionUri: Uri): string {
    const baseUri = Uri.joinPath(extensionUri, WEBVIEW_PATH);
    const pluginStyleUri = webview.asWebviewUri(
        Uri.joinPath(extensionUri, "assets", "style.css"),
    );

    const scriptUri = webview.asWebviewUri(Uri.joinPath(baseUri, "index.js"));
    const webviewStyleUri = webview.asWebviewUri(Uri.joinPath(baseUri, "index.css"));

    const nonce = getNonce();

    return `
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <link href="${pluginStyleUri}" rel="stylesheet"/>
                <link href="${webviewStyleUri}" rel="stylesheet"/>
                <title>Egon: Domain Story Modeler</title>
            </head>
            <body>
                <div id="egon-io-container"></div>
                <script nonce="${nonce}" src="${scriptUri}" type="module"></script>
            </body>
        </html>
    `;
}

function getNonce(): string {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
