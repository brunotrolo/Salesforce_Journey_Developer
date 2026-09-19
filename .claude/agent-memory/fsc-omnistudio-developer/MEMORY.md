# Project memory — settled OmniStudio facts (verified in real builds)

Keep this file to **settled, verified facts only** — no speculation, no running log.
Source of record: `.claude/agents/fsc-omnistudio-developer.md` ("Confirmed Apex Remote data source").

## 1. Apex Remote contract — CONFIRMED (2026-09-08)

- The Apex class **must implement `System.Callable`** and write its result into
  `args['output']` (`args` arrives as `{input, output, options}`). Returning the
  map from `call()` is **not enough** — OmniStudio ignores the return and only
  surfaces `output`.
- Success is signalled by `error = 'OK'` inside the returned map.
- Return a **flat map of String values only** (no `null`, no `List`).
- Full code + `DataSourceConfig` + merge-field syntax are in the agent file
  linked above. Do not re-derive; do not use `VlocityOpenInterface2`.

## 2. FlexCard layout patterns that actually worked

| Pattern | That worked | That did NOT work |
|---|---|---|
| 3-column summary header | one `Block` per column (`size.default = "4"`), each holding `Text` (`element: "outputField"`, `type: "text"`) children | Card List / auto table of every field |

- Text value binding = `property.mergeField` is **URL-encoded HTML** containing
  `{key}` tokens (single braces). `{{key}}` → renders a literal `}` and empty value.
- A display card's full `PropertySetConfig` top-level keys:
  `states, dataSource, title, enableLwc, isFlex, theme, selectableMode,
  xmlObject, xmlJson, events, globalCSS, osSupport, listenToWidthResize`.

## 3. Record lifecycle (settled, verified)

- Create `OmniUiCard` via **Execute Anonymous DML**, not `sf data create record`
  (Windows argument-length limit) and not metadata deploy/retrieve (local cards
  are not retrievable as `OmniUiCard` metadata).
- Deactivate (`IsActive=false`) in its own transaction before any edit/delete;
  a deactivate+edit+activate in one transaction rolls back.
- A Designer Save/Activate creates a new `OmniUiCard` version row per save —
  `Name` is not unique across versions; clean up all rows when restarting.
- `runtime_omnistudio:flexcard` only resolves cards placed via **App Builder
  drag-drop**; a `FlexiPage` XML deploy fails with "No card named '…' found".
- Use `IsActive` (there is no `Status` column on `OmniUiCard`).

## 4. Styling inside `mergeField` — CONFIRMED via DOM inspection (2026-09-09)

- **`lightning-formatted-rich-text` (the runtime for a `Text`/`outputField` element)
  strips every `style="..."` attribute from the HTML it renders.** The `mergeField`
  HTML arrives intact and the tags/structure render (so `<div>` line breaks show up),
  but any inline `style` is silently removed — the visible symptom is unstyled plain
  text with correct structure, not a broken layout. **Never author `mergeField` HTML
  with inline `style=`.** Confirmed by inspecting the rendered DOM, not inferred.
- `globalCSS` on `OmniUiCard` did not visibly apply in this org either (untested
  *why* — could be genuinely unsupported here, could be a shadow-DOM scoping issue
  between the card's own stylesheet and `lightning-formatted-rich-text`'s render
  boundary). Don't rely on it until someone confirms via DOM inspection that its
  `<style>` tag is actually present and in scope.
- **What to use instead:**
  - **Real, verified SLDS utility classes** (`slds-text-title`, `slds-text-heading_small`,
    `slds-text-color_weak`, `slds-text-color_success`, `slds-text-bold`,
    `slds-p-top_x-small`, etc.) inside `mergeField`'s `class="..."` — these come from
    the platform's own already-loaded stylesheet, so they don't depend on `globalCSS`
    or the sanitizer letting anything custom through. **Verify every class name
    against `design-systems-slds-apply`'s search scripts before using it** — a
    plausible-looking class that doesn't exist just renders unstyled, the same
    silent-failure shape as this whole bug.
  - **Custom colors/values SLDS doesn't cover** (e.g. a brand gold `#f5a623`): put
    the `<style>` block in the state's own `styleObject`, not inside a `mergeField`
    — this is card configuration processed separately from the merge-field HTML
    payload, so it isn't run through the same content sanitizer. Confirm this by
    DOM inspection too before trusting it as settled.
