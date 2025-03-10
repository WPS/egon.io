/// <reference types='vitest' />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import * as path from "path";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";

export default defineConfig({
    root: __dirname,
    cacheDir: "../../node_modules/.vite/libs/diagram-js-egon-plugin",
    plugins: [
        nxViteTsPaths(),
        nxCopyAssetsPlugin(["*.md"]),
        dts({
            entryRoot: "src",
            tsconfigPath: path.join(__dirname, "tsconfig.lib.json"),
        }),
    ],
    build: {
        outDir: "../../dist/libs/diagram-js-egon-plugin",
        emptyOutDir: true,
        reportCompressedSize: true,
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        lib: {
            // Could also be a dictionary or array of multiple entry points.
            entry: "src/index.ts",
            name: "diagram-js-egon-plugin",
            fileName: "index",
            // Change this to the formats you want to support.
            // Don't forget to update your package.json as well.
            formats: ["es"],
        },
        rollupOptions: {
            // External packages that should not be bundled into your library.
            external: [],
            input: {
                index: path.resolve(__dirname, "src/index.ts"),
                style: path.resolve(__dirname, "src/styles.scss"),
            },
            output: {
                // don't hash the name of the output file (index.js)
                entryFileNames: `[name].js`,
                assetFileNames: "[name].[ext]",
            },
        },
    },
});
