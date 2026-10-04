# LESSONS.md — append-only log

Self-improvement log for this repository's agents and hooks. Append new entries at the
bottom; never edit or remove a past entry. Each entry: date, what happened, the rule that
resulted. Read this file before starting any deploy-related task.

---

## 2026-10-04 — Sandbox-cycle deploy guard tightened to require `--metadata` scoping

**What happened:** `guard-deploy.mjs` allowed the fast sandbox cycle
(`--test-level NoTestRun`) to deploy via `--source-dir`, the same flag used for
finalization's full dependency-closure deploys. That let an ad-hoc sandbox push target an
entire directory instead of a named artifact, reintroducing exactly the imprecision
`--metadata <Type>:<Name>` exists to avoid — a broad deploy silently picking up unrelated
changed files sitting in the same folder.

**Rule that resulted:** the sandbox cycle (`--test-level NoTestRun`) must scope every deploy
with `--metadata <Type>:<Name>` (comma-separated for multiple artifacts), never
`--source-dir`. `guard-deploy.mjs` now denies any `project deploy start` combining
`--test-level NoTestRun` with `--source-dir`. This does not change the finalization gate:
`fsc-deploy-gate`'s finalization phases keep using `--source-dir`/`--manifest` for full
dependency-closure deploys, which is a deliberately different concern (see
`.claude/rules/journey-developer.md`, "Deploying an artifact (sandbox cycle)").

---

## 2026-10-04 — Non-self-contained test class broke a real PROD deploy (propagated from apex-test-loop)

**What happened:** validated by the development team using the sister skill
`apex-test-loop`: a test class hit the coverage target locally, but the real deploy to
**PRODUCTION** failed because the test queried an org configuration artifact
(RecordType/Profile by literal Name) that didn't exist in that environment. The same
risk exists here — `fsc-apex-developer` authors real production test classes, and
nothing explicitly forbade a literal config-object query or a dependency on another
test class's setup/data.

**Rule that resulted:** `fsc-apex-developer.md` gained Rec 25 — a test class must be
self-contained: never a literal SOQL query against RecordType/Profile/PermissionSet/
PermissionSetGroup/Queue/Group/UserRole/BusinessHours/Organization filtered by Name/
DeveloperName (use describe instead, e.g.
`Schema.SObjectType.<Object>.getRecordTypeInfosByDeveloperName()`), and never a call
into another `*Test` class's static setup/data method. The 1-minute self-review
checklist (step 5) now has a 6th item checking exactly this before reporting a class
done. This is distinct from Rec 9 (creating your own business records via a data
factory, e.g. `CaseDataFactory`), which remains the correct pattern.
