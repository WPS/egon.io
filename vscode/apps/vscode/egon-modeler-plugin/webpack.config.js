const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TsconfigPathsPlugin = require("tsconfig-paths-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const DIST = path.resolve(__dirname, "../../../dist/apps/vscode/egon-io");

module.exports = (env, argv) => {
    const isDevelopment = argv.mode === "development";

    return {
        target: "node",
        entry: path.resolve(__dirname, "src/main.ts"),
        output: {
            filename: "main.js",
            path: DIST,
            libraryTarget: "commonjs2",
            clean: false,
        },
        devtool: isDevelopment ? "source-map" : false,
        optimization: {
            minimize: !isDevelopment,
            minimizer: [
                new TerserPlugin({
                    extractComments: false,
                    terserOptions: {
                        keep_classnames: true,
                        keep_fnames: true,
                        format: {
                            comments: false,
                        },
                    },
                }),
            ],
        },
        externals: {
            vscode: "commonjs vscode",
        },
        resolve: {
            extensions: [".ts", ".js"],
            plugins: [
                new TsconfigPathsPlugin({
                    configFile: path.resolve(__dirname, "tsconfig.app.json"),
                }),
            ],
            alias: isDevelopment
                ? {
                      "@egon/diagram-js-egon-plugin": path.resolve(
                          __dirname,
                          "../../../dist/libs/diagram-js-egon-plugin",
                      ),
                      "@egon/vscode-domain-story": path.resolve(
                          __dirname,
                          "../../../dist/libs/vscode/domain-story",
                      ),
                      "@egon/vscode-data-transfer-objects": path.resolve(
                          __dirname,
                          "../../../dist/libs/vscode/data-transfer-objects",
                      ),
                  }
                : {},
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: "ts-loader",
                    exclude: /node_modules/,
                },
            ],
        },
        plugins: [
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "package.json"),
                        to: path.join(DIST, "package.json"),
                        transform(content) {
                            const pkg = JSON.parse(content.toString());
                            const keep = [
                                "displayName",
                                "description",
                                "version",
                                "publisher",
                                "engines",
                                "categories",
                                "keywords",
                                "icon",
                                "contributes",
                                "activationEvents",
                                "badges",
                                "repository",
                                "bugs",
                                "homepage",
                                "galleryBanner",
                                "preview",
                                "license",
                            ];
                            const out = {};
                            for (const k of keep) {
                                if (pkg[k] !== undefined) {
                                    out[k] = pkg[k];
                                }
                            }
                            out.name = pkg.publishName || pkg.name;
                            out.main = "main.js";
                            out.dependencies = {
                                "reflect-metadata": "0.2.2",
                                tsyringe: "4.8.0",
                            };
                            out.packageManager = "yarn@4.6.0";
                            return Buffer.from(JSON.stringify(out, null, 2));
                        },
                    },
                    {
                        from: "vscodeignore",
                        to: ".",
                    },
                    {
                        from: "miragon-logo.png",
                        to: "assets/miragon-logo.png",
                        context: path.resolve(__dirname, "../../../images"),
                    },
                    {
                        from: "style.css",
                        to: "assets/style.css",
                        context: path.resolve(__dirname, "src"),
                    },
                    {
                        from: "LICENSE",
                        to: "[name][ext]",
                        context: path.resolve(__dirname, "../../.."),
                    },
                    {
                        from: "README.md",
                        to: "[name][ext]",
                        context: path.resolve(__dirname, "../../.."),
                    },
                ],
            }),
        ],
    };
};
