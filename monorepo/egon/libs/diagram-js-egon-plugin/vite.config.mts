/// <reference types='vitest' />
import { defineConfig } from "vite";
import * as path from "path";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";

export default defineConfig({
    root: __dirname,
    cacheDir: "../../node_modules/.vite/libs/diagram-js-egon-plugin",
    plugins: [nxViteTsPaths(), nxCopyAssetsPlugin(["*.md"])],
    build: {
        reportCompressedSize: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        lib: {
            entry: "src/index.ts",
            name: "diagram-js-egon-plugin",
            fileName: "index",
            formats: ["es"],
        },
        rollupOptions: {
            external: [],
            input: {
                index: path.resolve(__dirname, "src/index.ts"),
                style: path.resolve(__dirname, "src/styles.scss"),
            },
            output: {
                entryFileNames: `[name].js`,
                assetFileNames: "[name].[ext]",
            },
        },
    },
});
