# Project memory — settled FSC declarative facts

Keep this file to **settled, verified facts only** — no speculation, no running log.
Source of record: verified configurations from real org builds.

## 1. Account Relationship Chart (ARC)

- No vendored skill covers ARC — configure from FSC platform knowledge.
- Grouping shape: household vs. business relationships shown as separate groups,
  expand/collapse, a Details Panel.
- Verify exact ARC configuration surface from the org before guessing at menu paths.

## 2. Financial Accounts Related Lists

- Related Lists need the Financial Accounts object model fields to exist before
  configuration. Cross-check with `fsc-data-model-developer`'s output.

## 3. Highlights Panel field order

- Business-ratified field order per capability — record in build-report.md.
- Never silently drift from what the prototype validated.

## 4. FlexCard placement on Lightning pages

- `runtime_omnistudio:flexcard` only resolves cards placed via **App Builder drag-drop**;
  a `FlexiPage` XML deploy fails with "No card named '…' found" — confirmed in
  `fsc-omnistudio-developer`'s settled facts. Position via App Builder, not metadata.
