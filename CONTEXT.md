# Project Overview

- **Purpose**: Procedural generation, editing, and visualization of fantasy maps for writers, game masters, and cartographers.
- **Main Technologies**: Vanilla JS/TS, SVG for rendering, Vite for bundling, Biome for linting/formatting.
- **Architecture**: Moving toward FMG 2.0. The system is divided into four major layers:
  1. **State**: The world data (`grid` and `pack` objects).
  2. **Generators**: Procedural simulation logic (Model).
  3. **Editors**: User-driven map mutations (Controllers).
  4. **Renderers**: Visualization into DOM/SVG (View).

# Repository Structure

- `src/generators/`: Generators containing simulation logic (e.g., `heightmap-generator.ts`, `cultures-generator.ts`).
- `src/controllers/`: The UI layer — editors and tools that mutate state, plus read-only overviews/dialogs that present it.
- `src/renderers/`: Code responsible for transforming world data into SVG overlays.
- `src/io/`: Serialization and persistence — save, load, export (legacy `public/modules/io/`).
- `src/services/`: App-shell & platform lifecycle, unrelated to map state (e.g., PWA installation, auto-update).
- `src/data/`: Static content / reference data (e.g., supporters list, heightmap templates).
- `src/types/`: Shared TypeScript interfaces and domain models.
- `src/utils/`: Generic helper functions.
- `public/`: Static assets and NON-MIGRATED JS Code in `public/modules`. `public/libs/` holds vendored third-party scripts for legacy code only — new `src/` code imports deps from npm (no `src/libs/`).
- `docs/`: Domain and architectural documentation. See `docs/architecture/architecture.md` "Project Structure" for the full layout and a "where does my file go?" guide.
- `src/index.html`: **CAUTION**: Currently a 9K-line monolith containing the entire UI structure, SVG `<defs>`, and CSS filters.
- `tests/e2e/`: Playwright end-to-end tests. Never automatically run Playwright tests when developing.

# FMG 2.0 Architecture Rules

- **Layering Constraint**: Generators MUST NOT directly manipulate SVG or DOM elements.
- **Data Flow**: Generators and Editors mutate the World Data (State). The Renderer reacts to State updates.
- **Idempotency**: Renderers SHOULD be stateless and idempotent.
- **Separation of Concerns**: UI logic and simulation logic MUST remain separate.
- **Serialization**: The entire world state must remain serializable into a single JSON object for `.map` saving and loading.

# Coding Conventions

- **Language**: TypeScript is mandatory for all new files.
- **Linting and formatting**: Enforced via Biome (`biome.json`).
- **Style**: Double quotes, no trailing commas, 120 line width, semicolons required.
- **Typing**: Use explicit TypeScript interfaces for all shared domain objects. `any` should be avoided.
- **Imports**: `@/*` aliases `src/*` (set in `vite.config.ts` + `tsconfig.json`). Prefer it over deep `../../` relative paths; keep sibling imports relative.

# Workflow Rules

- **Run Locally**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Unit Tests**: `npm run test` (Vitest)
- **E2E Tests**: `npm run test:e2e` (Playwright)
- **CI/CD**: GitHub Actions enforce linting, building, and playwright tests on PRs.

# AI Agent Instructions

- **Entry Points**: Start by inspecting `docs/architecture.md` and `docs/glossary.md` to align with the domain model.
- **Refactoring Constraints**: The project is in a gradual JS -> TS migration. Focus on incremental type safety and extracting logic.
- **File Limits**: `src/index.html` is excessively large. DO NOT try to perform large structural changes to it in a single pass.
- **Dependencies**: DO NOT introduce new production dependencies without explicit permission. Keep the bundle lightweight.

# Domain Knowledge

- **Grid**: The underlying Voronoi structure.
- **Pack**: The aggregate world state (contains `burgs`, `states`, `cultures`, etc.).
- **Cell**: The smallest indivisible unit of the map.
- **Burg**: A settlement. Grouped into `States`.
- **Vibe-game town export**: Burg town packages use a deterministic town-grid / cubic-grid schema. Town generation uses
  density-based road parcel placement rather than random road-tile spawning. Matrix exports include terrain, solid height,
  clearance, walkable, street-width, city-wall, building-interior, and voxel-town geometry data. Exterior doors must be
  exported only on ground-floor perimeter cells, and stair links must not remove adjacent walls.
- **Treasury & Taxes**: States hold `state.treasury` accumulated by `States.collectTaxes()` from per-deal `deal.tax` (sales tax) plus `state.pollTax × (rural + urban)`. Rates are seeded from `state.form` and jittered per state. Neutrals collect nothing. Details in `docs/domain/taxes.md`.
- **Invariants**: Saving a `.map` file MUST preserve the exact world state so it can be reloaded identically.

# Known Sharp Edges

- **Legacy Globals**: The codebase heavily relies on implicit global state (`pack` and `grid` on the `window`). Be extremely cautious when refactoring these to explicit parameters.
- **`index.html`**: A massive monolith serving as the primary UI template. It can easily break if structural tags are accidentally nested incorrectly.

# Important Files

- `docs/glossary.md`: Domain vocabulary definitions.
- `docs/architecture.md`: The guiding blueprint for FMG 2.0.

# Code Style Rules

- Use concise and descriptive variable names, don't use unusual abbreviations.
- Prefer laconic but clear code.
- Save space, I like my code to be compact.
- Avoid over-engineering, keep it simple and vertically readable.

---

# PLAN — Exporter Congruence & Update-In-Place (2026-07-03, plan only, not yet implemented)

Scope: THIS repo only. FMG's contract ends at the exported package: town matrices geometrically congruent with the vector map, every generation option exposed through working controls, "New Map" replaced with update-in-place, and exports rich enough that any downstream consumer (game engine, 3D renderer, other tools) can build immersive towns, economies, and cultures from the package alone. What consumers do with the package is their project's concern. No generated-map JSON is ever inspected by hand — all fixes are formulas over the schemas.

## A. Bug ledger (root causes found, with exact locations)

### Town matrix congruence (`src/io/vibe-game-town-generator.ts`)
1. **Fixed matrix size** — `WIDTH = 80`, `HEIGHT = 60` (`:454–455`), used as defaults in `createVibeGameTownMatrixFromMfcgVector` (`:2273–2274`). Every town, hamlet or capital, is squeezed/stretched into 80×60: big towns crush buildings into unusable slivers, small towns stretch with dead space — the exported matrix is not congruent with the vector town either way.
2. **Anisotropic mapping** — `vectorPointToMatrix` (`:2830–2842`) scales X by `(width−1)/dx` and Y by `(height−1)/dy` independently → aspect distortion; the 3D town is not congruent to the vector map by construction.
3. **Building-only ×3 inflation** — `BUILDING_VECTOR_SCALE = 3` (`:456`) via `getScaledBuildingRings` / `scaleRingAroundCenter` (`:2730–2745`) inflates each building ring around its own center while roads/walls stay unscaled → the export manufactures overlaps between neighbors and roads that do not exist in the vector map. Overlapping footprints in the package are an exporter defect regardless of consumer.
4. **Roads overwrite building floors** — in `createVibeGameTownMatrixFromMfcgVector`, building floors are filled at `:2304–2308`, then roads at `:2310–2319` set `terrain = ROAD_MAIN`, `walkable = 1` on top of footprint cells → corrupted footprints, holes in interiors.

### UI / generation options
5. **Update never preserves the grid** — `shouldRegenerateGrid(grid, precreatedSeed)` is called with 2 args in `public/main.js:668`, but the signature is `(grid, expectedSeed, graphWidth, graphHeight)` (`src/utils/graphUtils.ts:108`). `graphWidth/graphHeight` arrive `undefined` → `newSpacing = NaN` → the spacing comparisons always return `true` → the grid is regenerated on every run, so "Update Map" can never update values on the current geography.
6. **Hardcoded option ints** — `defaultGenerationOptions = {points: 4, states: 30, provincesRatio: 50, totalBurgs: 60}` (`public/modules/ui/options.js:351–357`); `randomizeOptions()` (`:637`) silently overwrites every *unlocked* slider with these on each New Map — this is why slider values appear to be "non-changeable hardcoded integers".
7. **slider-input init bug** — `public/components/slider-input.js:31–35` assigns `value` *before* `min/max/step`. Components without a `value` attribute (`sizeVariety`, `growthRate`, `religionsNumber` in `src/index.html`) initialize to 50 — far outside their real ranges (max 10, max 2, max 10). The inner number input is never clamped, and generators read it directly via `valueAsNumber` (`src/generators/states-generator.ts:80`, `religions-generator.ts:909`, `cultures-generator.ts:1145`, `burgs-generator.ts:154–156`) → garbage multipliers until the first randomize pass overwrites them.
8. **Update flows through the "new map" path** — `public/modules/ui/options.js:764` routes `updateMapButton` into `regeneratePrompt` (`:772`), which warns "generate a new map / changes will be lost" and calls the full `regenerateMap` teardown (`public/main.js:1310`: `undraw()` + full `generate()`), instead of a staged update.
9. **Recursive build artifact** — `public/fmg/fmg/fmg/…` is nested ~12 levels deep: the build output is being copied into `public/`, which is itself copied into the next build. Delete the tree, add `public/fmg` to `.gitignore`, and fix the copy step in the build config (check `vite.config.ts`/`netlify.toml` output paths).
10. **Dead file** — root `main.js` is empty (0 bytes); the real entry is `public/main.js`. Remove or document.

## B. Congruence formulas (the exporter's package contract)

Replace fixed dims + anisotropic mapping + ring inflation with one uniform transform per town:

```
S      = sqrt(MIN_BUILDING_CELLS / medianBuildingRingArea)   // MIN_BUILDING_CELLS = 9 → median building ≥ 3×3 cells
S      = min(S, MAX_TOWN_DIM / max(dx, dy))                  // MAX_TOWN_DIM ≈ 256 guard
width  = ceil(dx · S) + 2·MARGIN;  height = ceil(dy · S) + 2·MARGIN;  MARGIN = 4
p_matrix = (round((p.x − minX)·S) + MARGIN, round((p.y − minY)·S) + MARGIN)   // SAME S on both axes
```

Rasterization layer priority: terrain < fields < water < roads < building floors < walls. Buildings are rasterized at true scale (delete `BUILDING_VECTOR_SCALE`); roads skip cells already owned by a footprint and mark the adjacent shoulder instead. `block.width/height` in the matrix schema already carry per-town dims, so this is not a schema change — consumers that read `block` correctly keep working unmodified.

## C. Function stubs (exporter, `src/io/vibe-game-town-generator.ts`)

```ts
// computeUniformTownScale — §B formula; replaces WIDTH/HEIGHT constants as sizing source.
// Called by createVibeGameTownMatrixFromMfcgVector before any rasterization.
function computeUniformTownScale(bounds: Bounds, buildingRings: Ring[]): number {
  // TODO: median ring area via shoelace; S = sqrt(9 / medianArea); clamp by MAX_TOWN_DIM
}

// deriveMatrixDimensions — width/height/margin from bounds and S; feeds block{}.
function deriveMatrixDimensions(bounds: Bounds, scale: number): { width: number; height: number; margin: number } {}

// vectorPointToMatrixUniform — REPLACES vectorPointToMatrix (:2830). Same S both axes + margin offset.
function vectorPointToMatrixUniform(p: Point, bounds: Bounds, scale: number, margin: number): Point {}

// rasterizeLayersInPriorityOrder — moves the layer loops (:2286–2331) behind an explicit priority list;
// roads consult an ownership mask so they never overwrite building cells (route via shoulder).
function rasterizeLayersInPriorityOrder(layers: MfcgLayers, transform: Transform, matrix: TownMatrix): void {}

// resolveBuildingOverlaps — true-scale rings should rarely touch; when they do, erode 1 cell on the contact
// line from the larger footprint or emit both as connected buildings (getConnectedBuildingRefs pattern, :2099).
function resolveBuildingOverlaps(interiors: BuildingInterior[], matrix: TownMatrix): void {}

// auditTownCongruence — export-time invariant: every vector building has a footprint; log IoU stats.
function auditTownCongruence(vector: MfcgVectorData, matrix: TownMatrix): CongruenceReport {}
```

## D. Update-in-place plan (remove New Map)

Goal: one **Update Map** action that keeps the current seed/geography and re-runs only the pipeline stages affected by changed options. The `generate()` sequence (`public/main.js:655–745`) is already a linear stage list — reuse it as a DAG.

```js
// public/main.js — planned
// STAGES, in generate() order, each with the option ids that invalidate it:
//   graph:    [pointsInput, mapWidthInput, mapHeightInput, latitude, longitude, template, seed]
//   climate:  [temperatureEquator, temperatureNorthPole, temperatureSouthPole, prec]
//   rivers:   [] (derived: rerun if climate ran)
//   cultures: [culturesInput, culturesSet, sizeVariety, growthRate]
//   burgs:    [manorsInput, statesNumber]           // Burgs.generate + States.generate onward
//   provinces:[provincesRatio]
//   religions:[religionsNumber]
//   economy:  [] (derived: Markets/Production/Taxes rerun if burgs or states ran)
async function updateMap(changedOptionIds) {
  // TODO: earliest dirty stage → run that stage and everything after it, reusing grid/pack above it.
  // Grid is reused when shouldRegenerateGrid(grid, seed, graphWidth, graphHeight) is false (fix arity, bug A5).
}
// Wiring: options.js tracks changed ids since last run (Set filled by the existing optionsContent listeners);
// updateMapButton → updateMap(changedIds); newMapButton + its regeneratePrompt confirm dialog are REMOVED
// (index.html "sticked" menu, options.js:762–770). randomizeOptions() (:637) runs ONLY on explicit
// "Randomize" action or very first load — never as a side effect, so user slider values stick (bug A6).
```

Slider fixes: in `slider-input.js` set `min/max/step` **before** `value`, clamp the number input on init and on input, and give `sizeVariety`/`growthRate`/`religionsNumber` explicit `value` attributes in `src/index.html` (bug A7).

## E. Export enrichment plan (immersion data carried in the package)

All from existing `pack` state — no new generation needed, only serialization in `src/io/export.ts` + `vibe-game-town-generator.ts`. Purpose: the exported package alone must carry enough world detail that any consumer can render immersive, regionally distinct settlements without querying FMG again.

- **Per burg**: economy profile (market goods, production, prices from `Markets`/`Production`/`Goods`), culture id+name+namebase, religion, state, province, port/capital/citadel/temple/shanty flags, elevation, temperature, biome — enough to derive building mixes, interior richness, and decoration density downstream.
- **Per state/province**: form, culture mix, neighbors, treasury/tax profile — so provinces and cultures read as distinct regions from package data alone.
- **Routes**: class (road/trail/sea), width hint, endpoints — so inter-town connections can be differentiated without guessing.
- **Landscape**: `heightSamples` exists; add moisture + temperature samples per cell for biome-blended terrain between towns.
- **Per building (matrix `interiors[]`)**: `economy_tags` (shop/tavern/temple/manor derived from burg economy + building type) and optional `furniture_hints`. Room types are already exported (`getRoomTypes`, `:1927`) — they are part of the public schema now; keep them stable.
- **Determinism invariant** (already in rules.md): same seed + burg id → byte-identical town export, so a package re-export is always reproducible.

## F. Acceptance checks (all runnable inside this repo)
- Export a small test map; `auditTownCongruence` reports 0 missing buildings, median IoU ≥ 0.85.
- Round-trip unit test in `vibe-game-town-generator.test.ts`: rasterize a synthetic vector town → assert every source polygon has a footprint and matrix dims follow §B from the bounds.
- Change `statesNumber`/`growthRate`/`sizeVariety` sliders → Update Map → values visibly affect the result without regenerating the heightmap.
- New Map button gone; Update Map never shows the "changes will be lost" dialog when only options changed.
