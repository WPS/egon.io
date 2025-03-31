export default {
    displayName: "egon-modeler-plugin",
    preset: "../../../jest.preset.js",
    setupFilesAfterEnv: ["<rootDir>/src/test-setup.ts"],
    transform: {
        "^.+\\.[tj]s$": "@swc/jest",
    },
    moduleFileExtensions: ["ts", "js", "html"],
    coverageDirectory: "../../../coverage/apps/vscode/egon-modeler-plugin",
};
