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
