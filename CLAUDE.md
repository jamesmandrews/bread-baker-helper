# CLAUDE.md

Guidance for Claude Code (claude.ai/code) working in this repository.

## Project Overview

**Bread Helper** is an Angular application with three baking calculators, each
a tab in a single page:

1. **Baker's Percentage** — ingredient percentages ↔ weights, presets, hydration
   and salt warnings
2. **Pizza Doughball** — dough weight from circular pan area (g/in²)
3. **Pan Volume** — dough weight from rectangular pan volume (g/cm³)

Tabs are switched by the `activeTab` signal in `app.component.ts`, not by the
router. See [Router](#router) below.

## Commands

The Angular app is at the **repository root** — there is no subdirectory, so no
`cd` is needed.

```bash
npm start          # dev server on http://localhost:4200
npm run build      # production build -> dist/bread-helper/
npm test           # unit tests (Vitest, headless, exits when done)
npm run e2e        # end-to-end tests (Playwright, Chromium)
```

There is no lint setup — `ng lint` will fail. Don't document or invoke it
without adding `angular-eslint` first.

## Environment gotchas

Both of these look like project breakage but are environment-level:

- **Clean `npm install` fails** on npm 10.8.2 with `Cannot read properties of
  null (reading 'edgesOut')` while resolving Vitest's peer set. Current npm
  resolves it fine, so the fix is `npx npm@latest install`, not
  `--legacy-peer-deps`.

  **Do not regenerate the lockfile with `--legacy-peer-deps`.** It produces a
  lockfile missing optional platform packages (`@emnapi/*` and other
  Linux/wasm variants that a macOS install never touches). Everything works
  locally and then `npm ci` fails in CI with `npm error Missing: @emnapi/...
  from lock file`. If that happens, rebuild the lockfile with
  `npx npm@latest install --package-lock-only` and verify with
  `npx npm@latest ci` before pushing.
- **`ng update --name <schematic>` refuses to run.** Node 24.13.0 is below the
  Angular CLI minimum (v22.22.3 / v24.15.0 / v26), and `ng update` fetches the
  newest CLI before running. The pinned CLI itself works. Apply optional
  migrations by hand.

Upgrading npm and Node clears both.

## Technology Stack

- **Angular 21.2** — standalone components (the default; no `standalone: true`
  flag), signals, block control flow
- **Zoneless change detection** — `provideZonelessChangeDetection()`; zone.js is
  not a dependency
- **Vitest** for unit tests, **Playwright** for e2e
- **TypeScript 5.9**, strict mode, `strictTemplates`
- **SCSS**

## Architecture

```
src/app/
├── components/
│   ├── calculator/               # Baker's percentage (smart)
│   ├── ingredient-row/           # One ingredient input (presentational)
│   ├── doughball-calculator/     # Pizza pan area (smart)
│   └── pan-volume-calculator/    # Loaf pan volume (smart)
├── models/                       # ingredient, doughball, pan-volume
├── services/                     # calculation, recipe-preset, doughball, pan-volume
├── app.component.*               # Shell + tab navigation
├── app.config.ts
└── app.routes.ts                 # empty; see Router
e2e/                              # Playwright specs
```

Services are `providedIn: 'root'` and hold the arithmetic and the preset data.
Components hold signal state and delegate every calculation to a service.

### Conventions

- **`inject()`**, not constructor parameter injection
- **`input()` / `output()`** signal APIs, not `@Input()` / `@Output()`
  decorators — see `ingredient-row.component.ts` for the reference shape
- **`@if` / `@for`** with a direct `track` expression (`track pan.id`), never a
  `trackBy` method
- **`computed()`** for anything derived. Do not store derived values in signal
  state and hand-resync them; the pan calculators still do this (see [Known
  issues](#known-issues)) and are not the pattern to copy
- Weights and percentages round to 1 decimal place

### Signal writes

**Never write to a signal from inside another signal's `update()` callback.**
`update()` evaluates its callback and *then* sets, so a nested write lands
first and is immediately overwritten by the outer update — silently, using
stale data. This caused a real bug where editing the flour weight left every
other ingredient unchanged. Branch and read first, then write once.

## Baker's percentage model

Flour is the 100% base; every other ingredient is a percentage of total flour
weight. 70% hydration means 700 g water per 1000 g flour.

`CalculatorComponent` supports three directions of edit:

- percentage changes → weight recalculates
- weight changes → percentage recalculates
- total flour weight changes → all weights recalculate

Editing a **flour** row's weight is special: it rescales the whole recipe.
`calculateFlourWeightFromPart()` solves for the base the edited row implies
(`weight / (percentage / 100)`) rather than assuming the row *is* the base, so
recipes with more than one flour stay in proportion.

There is also a **dough ball mode** that inverts the calculation: you give a
target total dough weight and the flour weight is solved backwards from the sum
of all percentages.

## Router

`app.routes.ts` is empty, but `provideRouter()`, `RouterOutlet` and
`<router-outlet />` are all still wired up. This is **deliberate scaffolding**
— the tabs are intended to become real routes later. Leave it in place.

Until then: there is no URL per tab, no deep linking, and a refresh always
lands on Baker's Percentage.

## Testing

Unit tests are Vitest but use the Jasmine-compatible API (`describe`, `it`,
`expect().toBe()`), so specs read the same as before the runner swap.

Because the app is zoneless, a broken handler renders a **stale value** rather
than throwing. `should create` smoke tests cannot catch that. Tests that matter
here drive real DOM events and assert on rendered output:

- `calculator.component.spec.ts` — child DOM event → `output()` → parent signal
  → `computed()` → sibling re-render
- `e2e/zoneless.spec.ts` — the same paths in a real browser, across all three
  calculators, asserting no console errors

Await `fixture.whenStable()` after dispatching an event; there is no zone to
flush.

## Known issues

Raised in review and deliberately deferred — don't treat these as settled:

- **Pan volume densities are likely wrong.** The 0.55–0.70 g/cm³ presets look
  like raw dough density rather than a pan-fill ratio; loaf-pan practice is
  nearer 0.35–0.45. The default pan reports ~1800 g where ~1100–1300 g is
  expected. Needs checking against a real pan — this is a domain judgement, not
  a code bug.
- **Levain contributes nothing to hydration.** It is flagged as neither flour
  nor water, so the shipped Sourdough preset understates true hydration.
- **`calculateHydration` uses `find`**, so a recipe split across two "Water"
  rows (autolyse + bassinage) only counts the first. All flours *are* summed.
- **The pan calculators duplicate each other** (~90%) and store derived
  `volume` / `doughWeight` inside signal state, resyncing by hand.
- **No input validation.** `parseFloat(v) || 0` accepts negatives throughout.
- **IDs use `Date.now().toString()`**, which collides on rapid adds.
- **Nothing persists.** A reload loses the recipe.

## Not built yet

Sourdough starter tracker, baking schedule/timer, dough temperature calculator,
unit conversion (metric ↔ imperial), saved recipes, print/export.
