---
name: fsc-gate
description: Re-run the evidence gate against an already-built capability and report whether it is really deployed, tested and passing.
argument-hint: <domain> <capability>
arguments: [domain, capability]
disable-model-invocation: true
---

# Re-check a capability's gate

Run the evidence gate against the capability **`$capability`** in domain **`$domain`**,
standalone — no building, no fixing.

Dispatch the `fsc-deploy-gate` subagent for it. That agent owns the phases and their exact
commands. Its own scope note applies: FlexCard/OmniScript are verified as `OmniUiCard`/
`OmniProcess` records with `IsActive = true` via `sf data query`, not by a deploy job id.

If the gate cannot run at all — no `sf` CLI, no authenticated org, code analyzer or Java
missing — report exactly that. Never simulate a deploy or judge the metadata by reading it.

Report to the user, in PT-BR: each phase, its result, and the evidence field that proves it.
A phase that could not run is an explicit `ABANDON: <reason>`, never a quiet omission. If a
phase fails, name the specialist agent that owns the failing artifact — do not fix it here.
