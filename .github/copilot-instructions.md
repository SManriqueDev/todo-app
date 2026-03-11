# Copilot Instructions for ToDoApp

## Build, test, and lint commands

- Install deps: `npm install`
- Start dev server: `npm run start`
- Alternative Ionic dev server: `npx ionic serve`
- Start with local Firebase environment: `ng serve --configuration local`
- Build (default production): `npm run build`
- Build local config: `ng build --configuration local`
- Build Android (Cordova): `npx ionic cordova build android`
- Run Android with livereload: `npx ionic cordova run android --livereload`
- Lint: `npm run lint`
- Run all tests once (headless): `npm run test -- --watch=false --browsers=ChromeHeadless`
- Run CI test configuration: `npm run test -- --configuration ci --browsers=ChromeHeadless`
- Run a single spec: `npm run test -- --watch=false --browsers=ChromeHeadless --include=src/app/app.component.spec.ts`
- Formatting used in repo:
  - check: `npm run format:check`
  - write: `npm run format`

## High-level architecture

- This is an Ionic + Angular 20 standalone app (`type: angular-standalone`), bootstrapped in `src/main.ts` via `bootstrapApplication`.
- Routing is in `src/app/app.routes.ts` with lazy-loaded standalone pages:
  - `/` → `DashboardPage`
  - `/categories` → `ManageCategoriesPage`
- `main.ts` registers `provideAppInitializer(...)` to run `FirebaseConfigService.init()` before app startup, loading Firebase Remote Config-driven gamification settings.
- App state is service-driven and signal-based:
  - `TaskService`, `CategoryService`, `GamificationService` hold state in Angular signals.
  - Persistence is through `StorageService` (`@ionic/storage-angular`) using keys like `gamified_tasks`, `gamified_categories`, `gamified_user_stats`.
  - Services seed default data and include migration logic for legacy English content to current Spanish content.
- Gamification flow:
  - `TaskService.toggle()` updates completion and delegates XP updates to `GamificationService`.
  - XP rules (per-task XP, max XP per level, penalty on uncheck, feature flag) are read from `FirebaseConfigService`.
  - `GamificationHeaderComponent` reads stats and triggers confetti on level-up when gamification is enabled.
- UI composition:
  - Feature pages under `src/app/features/*`.
  - Reusable UI in `src/app/shared/components/*`.
  - Dashboard task list uses `cdk-virtual-scroll-viewport` for large datasets.
- Emoji rendering is centralized in `EmojiRenderService`, which maps emoji to local Twemoji assets under `assets/twemoji/64` (copied from `emoji-datasource-twitter` via `angular.json` assets config).

## Key conventions in this repository

- Use standalone components/pages only; no NgModule-based wiring.
- Prefer Angular signals (`signal`, `computed`, `effect`) and signal inputs/outputs (`input()`, `output()`) over RxJS subjects for local app state and component communication.
- Components/pages use `ChangeDetectionStrategy.OnPush`.
- Templates use Angular control-flow syntax (`@if`, `@for`) consistently.
- Import domain types/services from barrel files when available:
  - `src/app/core/models/index.ts`
  - `src/app/core/services/index.ts`
- Entity IDs are generated with `Date.now().toString()` for user-created tasks/categories.
- Category deletion is expected to cascade to tasks (`ManageCategoriesPage` calls `TaskService.deleteByCategory()` before `CategoryService.delete()`).
- Keep user-facing copy in Spanish unless the related migration maps need to be updated too.
- Environment handling:
  - `environment.local.ts` is used via Angular `local` configuration.
  - default build uses production replacements from `angular.json`.
- Respect existing lint/format settings:
  - Angular ESLint selector conventions (`app-` element selectors, `app` directive prefix).
  - Prettier settings: single quotes, trailing commas, semicolons, width 100.
