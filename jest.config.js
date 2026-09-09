// @ts-check
const { createCjsPreset } = require('jest-preset-angular/presets');

const presetConfig = createCjsPreset();

/** @type {import('jest').Config} */
module.exports = {
  ...presetConfig,
  snapshotSerializers: [],
  setupFilesAfterEnv: ['<rootDir>/src/setup-jest.ts'],
  testEnvironment: 'jsdom',
  // Resolve dual-published packages to their CommonJS builds. We deliberately do
  // NOT add an `import` condition here: doing so flips every dual package (incl.
  // ones loaded by Jest's own internals, e.g. synckit/dedent) to its ESM build,
  // which Jest then fails to parse as CJS. The one package that genuinely needs
  // its ESM entry (@bpmn-io/diagram-js-ui, exports-only `import`) is pinned via
  // moduleNameMapper below instead.
  testEnvironmentOptions: {
    customExportConditions: ['browser', 'require', 'node'],
  },
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    ...presetConfig.moduleNameMapper,
    '^src/(.*)$': '<rootDir>/src/$1', // mirrors baseUrl
    // @bpmn-io/diagram-js-ui exposes only an `import` export condition, so it
    // won't resolve without one. Pin it to its ESM entry directly; it gets
    // down-leveled by the @bpmn-io transformIgnorePatterns allowance below.
    '^@bpmn-io/diagram-js-ui$':
      '<rootDir>/node_modules/@bpmn-io/diagram-js-ui/lib/index.js',
    // diagram-js-minimap's CommonJS `main` uses plain `require()` for diagram-js's
    // default exports (e.g. `new IdGenerator()`), which breaks once Jest transpiles
    // diagram-js's ESM `export default` onto `.default`. Its ESM build imports
    // those defaults through interop, so point Jest at it (module field, ignored
    // by Jest's default `main`-first resolution).
    '^diagram-js-minimap$':
      '<rootDir>/node_modules/diagram-js-minimap/dist/index.esm.js',
  },
  // diagram-js and its dependencies ship ESM as plain `.js` (resolved via their
  // `module` field), which Jest's default node_modules-ignore skips. Allow the
  // transformer to process these so `import` statements are down-leveled.
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      [
        '.*\\.mjs$',
        '@angular/common/locales/.*\\.js$',
        'diagram-js',
        'diagram-js-direct-editing',
        'diagram-js-minimap',
        'min-dash',
        'min-dom',
        'domify',
        'tiny-svg',
        'path-intersection',
        'object-refs',
        'didi',
        'ids',
        'inherits-browser',
        '@bpmn-io',
        'preact',
        'htm',
      ].join('|') +
      '))',
  ],
  collectCoverageFrom: ['src/app/**/*.ts', '!src/app/**/*.spec.ts'],
  coverageDirectory: '<rootDir>/coverage/egon',
};
