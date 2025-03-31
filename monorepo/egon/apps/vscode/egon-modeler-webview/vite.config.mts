/// <reference types='vitest' />
import { defineConfig } from "vite";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";

export default defineConfig({
    root: __dirname,
    cacheDir: "../../../node_modules/.vite/apps/vscode/egon-modeler-webview",
    server: {
        port: 4200,
        host: "localhost",
    },
    preview: {
        port: 4300,
        host: "localhost",
    },

    plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(["*.md"])],

    esbuild: {
        minifyIdentifiers: false,
        keepNames: true,
    },

    build: {
        reportCompressedSize: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        rollupOptions: {
            output: {
                entryFileNames: `[name].js`,
                assetFileNames: `[name].[ext]`,
            },
        },
    },
});
