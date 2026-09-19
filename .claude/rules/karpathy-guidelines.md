# Karpathy Guidelines — applied to building and deploying real metadata

Behavioral guidelines to reduce common LLM coding mistakes, derived from
[Andrej Karpathy's observations](https://x.com/karpathy/status/2015883857489522876) on LLM
coding pitfalls.

Source: [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)
(MIT). The four sections below are reproduced **in full**; each one is followed by an
`In this project` block that contextualises it for building and deploying real Salesforce
metadata. The contextualisation adds — it never replaces or relaxes the original guidance.

These guidelines are always true here, whichever agent is running. They are behavioral and
cut across every specialist; `journey-developer.md` remains the authority on this project's
structural rules (domain boundaries, evidence gate, report contract).

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

> **In this project.** This is the behavioral half of the rule that
> `journey-developer.md` already states structurally: *a design gap found while building
> goes back to the Designer's agents, never fixed silently here*. When `tasks.md` or
> `architecture.md` is ambiguous — a field whose type isn't stated, a step classified
> `misto` without saying which half is standard, a cross-domain contract that names a
> record but not its fields — that ambiguity goes in `## Gaps Found` and, if it blocks
> downstream specialists, to the user. Never resolve it by building the most plausible
> reading. A wrong guess here doesn't fail loudly: it deploys, passes the gate, and
> becomes the thing someone maintains for five years.

---

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

> **In this project.** Over-customization is the reason this migration exists — the
> `Standard-first` rule is this guideline wearing a Salesforce hat. Rule out a standard
> object, a standard field, a Compact Layout or a Record-Triggered Flow before building a
> custom one. Concretely: no custom object when a standard one plus a field works; no Apex
> when a Flow does the job; no service/selector layering invented for a single capability;
> no `@AuraEnabled` method "for future use"; no Custom Metadata Type to configure something
> that has exactly one value. Every custom artifact you create is one more thing the next
> migration has to justify.

---

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

> **In this project.** This carries the highest stakes of the four, because here the blast
> radius is a real org, not a working copy. Three concrete applications:
> **(a) Domain boundaries** — never write outside this capability's domain folder, and
> never `sf project deploy start --source-dir force-app` wholesale for a single capability.
> A too-wide deploy is the deployment-shaped version of a drive-by refactor.
> **(b) Org-existente mode** — when the orchestrator registers an existing flat layout, you
> match it. You do not introduce `force-app/domains/` alongside it because you'd prefer it.
> Matching existing style is a rule, not a preference.
> **(c) Pre-existing debt** — a capability you're building will sit next to Apex that
> violates every pattern in `apex.md`. Report it in `## Gaps Found`. Do not fix it, do not
> reformat it, do not delete the dead method you found. It isn't yours, and a deploy that
> touches it is a deploy nobody reviewed for that change.

---

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require
constant clarification.

> **In this project.** `fsc-deploy-gate` is this guideline implemented as an agent, and
> the `CHECK:`/`EXPECT:`/`ABANDON:` markers are the plan format above. The rule that
> matters most is the one about **weak criteria**: *"the deploy command didn't error"* and
> *"the code looks right"* are precisely the weak criteria Karpathy warns about — they feel
> like verification and prove nothing. The strong criterion is the one
> `journey-developer.md` fixes: the cited command, its exit code, and the field from its
> JSON output that proves the outcome — deploy job id, test run id, coverage %, scan
> severity counts. A gate that genuinely cannot run is an explicit
> `ABANDON: <reason>`, never a silently skipped phase. Silence is not a passing check.

---

*Guidelines derived from Andrej Karpathy's observations, via
[multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills),
MIT license. The `In this project` blocks are this project's own contextualisation.*
