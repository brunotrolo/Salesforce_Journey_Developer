---
name: fsc-build
description: Build and deploy one already-designed FSC capability, end to end, through fsc-build-orchestrator and the mandatory deploy gate.
argument-hint: <domain> <capability>
arguments: [domain, capability]
disable-model-invocation: true
---

# Build a capability

Build and deploy the capability **`$capability`** in domain **`$domain`**.

Dispatch the `fsc-build-orchestrator` subagent for it. That agent owns the whole procedure —
do not re-derive it here, and do not build anything yourself in the main context.

Before dispatching, resolve what the user actually named:

- If `$domain` or `$capability` is missing or ambiguous, list the candidates from
  `docs/sdd/BACKLOG.md` and ask which one, rather than guessing.
- If the capability's status in `docs/sdd/BACKLOG.md` is not at least `pronto para build`,
  say so and stop — its design is not finished, so building it now only creates rework.
  Point the user at the Salesforce Journey Designer skill instead.

When the orchestrator reports back, relay to the user, in PT-BR: what was built, what was
deployed, the deploy gate's evidence (deploy job id, test run id, coverage %, scan result),
and anything still open. Never report the capability as built without that evidence.
