<!-- Copilot / AI agent instructions for contributors and automated agents -->
# Egon.io — AI Coding Assistant Instructions

Purpose: Help AI coding agents be immediately productive in this Angular (v20) codebase.

Key commands (run from repo root):
- Install deps: `npm ci`
- Dev server: `npm run start` (alias for `ng serve`) — open http://localhost:4200
- Run tests: `npm run test` (Karma + custom webpack)
- Build (dev): `npm run build` (`ng build`)
- Build (prod): `npm run build-prod` or `ng build --configuration production`
- Create zip deployable: `npm run zip` (uses `dist_build/` → `dist/`)
- Lint architecture rules: `npm run archlint`
- Format code: `npm run format` / check `npm run format:check`

Big picture / architecture notes:
- Single-page Angular application (Angular 20). Entry point: `src/main.ts`.
- `AppModule` (`src/app/app.module.ts`) uses `DoBootstrap` and a manual bootstrap pattern
  (creates `<app-root>` in `ngDoBootstrap`). Several feature modules are imported from
  `src/app/*` (e.g. `workbench`, `domain`, `tools/*`). Treat those as independent features.
- The project separates concerns into `domain/`, `tools/`, `workbench/` and `presentation/`
  subfolders. Use these folders as the primary navigation when locating functionality.
- The modeler functionality is built on `diagram-js` and initialized via plain functions
  that are called from `AppModule`'s initializer (look for `initialize*` imports in
  `src/app/app.module.ts`, e.g. `initializePalette`, `initializeRenderer`, `initializeLabelEditingProvider`).

Important patterns and conventions (project-specific):
- App-level initializers: `provideAppInitializer` is used to run setup functions that
  register diagram-js providers and palette/renderer hooks. When you add modeler
  features, follow the existing `initializeX` pattern.
- Forced side-effect constructor injection: `AppModule` ctor injects `AutosaveService`
  with a comment (in German) warning not to remove it — this intentionally triggers
  automatic initialization. Preserve such injections when refactoring.
- Service aliasing: services are sometimes aliased/proxied via DI (example:
  `provide: IconSetChangedService, useExisting: ImportDomainStoryService` in `AppModule`).
  Respect these aliases when changing service types or behavior.
- Absolute imports are used in many files (e.g. `src/app/...`). Prefer existing import
  style when adding files.
- Styling: global styles in `src/styles.scss`. Components use SCSS (schematics configured
  for `scss`). `MaterialModule` centralizes material imports.

Build & tooling quirks:
- Custom webpack: `angular.json` uses `@angular-builders/custom-webpack` with
  `polyfill-webpack.config.js`. If you change webpack config or add polyfills, update that file.
- CommonJS packages: `angular.json` lists `allowedCommonJsDependencies`. If you add a
  CommonJS-only dependency, add it there to avoid build warnings.
- Output paths: production/dev build writes to `dist_build/egon` and `npm run zip`
  creates the final `dist/` zip artifact. Do not assume `dist/` is the direct build
  output — use the scripts above.

Testing & debugging notes:
- Unit tests use Karma with custom webpack config (`karma.conf.js` + `polyfill-webpack.config.js`).
- `ng-mocks` is available in devDeps — many tests use shallow/mock patterns. Follow existing
  test patterns in `src/app/**/*.spec.ts` when adding tests.
- For local debugging of the modeler, run `npm run start` and open devtools. Modeler
  initialization sequences are visible in `AppModule` (search for `initialize*`).

Key files and directories to reference:
- `src/app/app.module.ts` — central bootstrap & initializer patterns
- `src/app/workbench/` — UI shell and top-level features
- `src/app/tools/` — tool modules (modeler, import/export, icon-set-config, autosave)
- `src/app/domain/` — domain model and services (entities, registries)
- `polyfill-webpack.config.js` and `angular.json` — custom webpack and build config
- `package.json` — scripts and dependency list
- `architecture.md` — higher-level design rationale

Integration points / external deps to be aware of:
- `diagram-js`, `bpmn-font` and related diagram/modeler libs — they are central to the
  modeler; modifications to DOM/rendering should respect the diagram-js lifecycle.
- `ngx-color-picker`, Angular Material, and CDK are used for UI elements.
- Some utilities are CommonJS; see `allowedCommonJsDependencies` in `angular.json`.

PR checklist (automated-agent friendly):
- Run `npm ci` then `npm run test` and ensure tests pass.
- Run `npm run format` (or `format:check`).
- Run `npm run archlint` to check architecture rules.
- Build production artifact: `npm run build-prod` and `npm run zip` to confirm packaging.

When editing code, prefer small, obvious changes. If you must modify app bootstrap
or DI wiring, note that `AppModule` contains several implicit initialization side effects
(autosave injection, provideAppInitializer, DI aliases) — keep those semantics intact.

If anything above is unclear or you want more detail about a specific feature (modeler,
icon-set handling, or import/export), tell me which area and I will expand examples.
