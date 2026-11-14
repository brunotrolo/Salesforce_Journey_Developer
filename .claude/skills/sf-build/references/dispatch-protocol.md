# Dispatch protocol — sf-build-orchestrator

Detail the orchestrator agent points to. One definition lives here; README and agent docs only link to it.

## Dispatch envelope (single version)

Every specialist receives, in the prompt of the `Task` call:

```
{ capability-path, metadata-root, relevant-tasks: [...], relevant-objects: [...],
  change-class: CREATE | MODIFY-EXISTING }
```

State the effective metadata root (greenfield: `force-app/domains/<domain>/main/default/`; existing org: the repo's own layout). Specialists never guess the root or the deploy mechanism.

## Metadata ownership (one owner per type)

| Owner | Metadata |
|---|---|
| `sf-data-model-developer` | custom objects, fields, Record Types, `BusinessProcess` (Case support process), `Knowledge__kav` article fields, field-level permission sets |
| `sf-integration-developer` | Named/External Credentials, callout wiring, Platform Events, `passos-manuais-deploy` section |
| `sf-apex-developer` | classes, triggers, `@InvocableMethod` actions, Apex tests |
| `sf-service-config-developer` | Queues, Assignment/Escalation/Auto-response Rules, Entitlement Processes, Milestone Types, Entitlement Templates, Business Hours, Omni-Channel (Service Channel, routing config, presence config, skills), Knowledge settings and Data Categories, Macros/Quick Text, Case Team, Email-to-Case |
| `sf-lwc-developer` | production LWC bundles and Jest tests |
| `sf-automation-developer` | Flows (Screen via Flow for Service, autolaunched, record-triggered, scheduled) |
| `sf-declarative-developer` | FlexiPages, page layouts, Compact Layouts, quick actions, apps (incl. Service Console + utility bar), list views |
| `sf-deploy-gate` | validation, deploy, tests, scans, evidence — writes no metadata |

Experience Cloud site configuration has no owner: record it as a manual step in `docs/passos-manuais-deploy.md`. LWC targeting `lightningCommunity__Page` still belongs to `sf-lwc-developer`.

## Group order

(A) data-model + integration → (B) apex + service-config → (C) lwc + automation → (D) declarative.
Parallel inside a group; never start a group before the previous one reported. The order mirrors `platform-metadata-deploy`'s default (objects/fields → permission sets → Apex → Flow as Draft → Flow activation), so build order and deploy order don't fight.

## CREATE vs MODIFY-EXISTING

CREATE is free. MODIFY-EXISTING requires a where-used search (repo grep plus dependents: Flows, permission sets, referencing classes) and an explicit, reasoned user authorization via `AskUserQuestion`, recorded in `build-report.md`. Back up the prior content before editing (retrieve or commit the slice).

## Search before create

Before creating an object, field, class or component, prove no equivalent exists (grep scoped to the domain folder and metadata type, plus a describe/query of the specific object in the org) and cite the search in the report. Never duplicate.

## Report contract and gates between groups

Each specialist returns `## Files Touched`, `## Gaps Found`, `## Decisions Made`, and `## Evidence` when a smoke check ran. Before the next group the orchestrator requires: a 1-minute self-review done and a structured report. A smoke check whose formal call stayed pending is recorded as `ABANDON: <reason>`.

- **Blocking gap**: pause at the blocking point, ask the user via `AskUserQuestion`, resume after resolution. Non-blocking gaps are recorded and the pipeline continues.
- **Iteration cap**: the same specialist failing the gate 3 times for the same artifact stops the run with the build report for manual intervention.
- **Integration smoke**: in development, one manual smoke call per new integration against the test environment (HTTP status + body only); the formal triple check (HTTP response + resulting DML + log) happens at finalization.
- **Tests**: an Apex test class with asserts is written in the same iteration as its class; execution waits for finalization.

## Manifest per journey

Generate `manifest/package-<capability>.xml` with (a) the artifacts the capability **creates** (Apex + tests, LWC, CustomPermission, PermissionSet, Flow, queues/rules/config) plus (b) existing artifacts it **modifies**. List **dependencies** (infra Apex, logging framework, Named/External Credentials, existing fields) as a header comment and **outside** `<members>` — retrieve doesn't carry their content and including them could overwrite active org configuration.

## Fast-mode deploy

`sf project deploy start --target-org "$SF_TARGET_ORG" --metadata <Type>:<Name> --test-level NoTestRun`, only the delta, never the whole domain; `--wait` 10 (small delta) / 30 (default) / 60 (large manifest). `--source-dir` with `NoTestRun` is denied by the guard hook.
