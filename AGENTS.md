# AGENTS.md — Salesforce Journey Developer

Instructions for any coding agent working **on this repository**. Vendor-neutral by design
(Claude Code, Cursor, Codex and friends). `CLAUDE.md` points here so there is a single
source of truth.

## What this repository is

This repository **is a skill**, not a Salesforce project. What ships is the content of
`.claude/` — 9 authored agents, 26 imported skills, 5 rules, hooks and settings — installed
into someone else's SFDX project, alongside its sister skill
[Salesforce Journey Designer](https://github.com/brunotrolo/Salesforce_Journey_Designer).

The practical consequence: you rarely write Apex or LWC here. You write **instructions that
another agent will execute against a real org**, where a mistake doesn't surface as an
exception — it surfaces as metadata deployed into production that someone maintains for
years.

`force-app/` in this repo is the **layout skeleton** the agents write into, not a real
project's code.

## Behavioral discipline

`.claude/rules/karpathy-guidelines.md` applies to work **on this repository** as much as to
the skill's execution:

1. **Think before coding** — if two readings of the request are defensible, ask; don't pick
   one silently.
2. **Simplicity first** — no agent, rule or section nobody asked for. The skill is already
   large.
3. **Surgical changes** — fixing one agent is not a licence to rewrite the section. Every
   changed line must trace to the request.
4. **Goal-driven execution** — define the success criterion before touching anything, then
   verify it.

## Non-negotiable rules

### 1. Authored vs. imported content
- **Authored** (`.claude/agents/`, `.claude/rules/`, `.claude/skills/fsc-build`,
  `.claude/skills/fsc-gate`): this is where the project's knowledge lives. Edit freely,
  within the rules below.
- **Imported** (`.claude/skills/salesforce`, `.claude/skills/agent-skills`,
  `.claude/skills/mattpocock`): third-party, each carrying its own LICENSE/NOTICE.
  Consulted by path, **never rewritten** without an explicit maintainer decision.

### 2. Agent frontmatter uses `tools:`, not `allowed-tools:`
Claude Code subagents (`.claude/agents/*.md`) take `name`, `description`, `tools`,
optionally `model` and `memory`. That is **different** from a skill's `SKILL.md`, which uses
`allowed-tools`. Don't "fix" one into the other — they are different mechanisms, and the
wrong field is ignored in silence.

Two agents declare `memory: project`, which auto-loads
`.claude/agent-memory/<agent-name>/MEMORY.md`. That exact path is the one the harness
reads; a `MEMORY.md` anywhere else is dead weight.

### 3. Rules auto-load — don't cross-reference them from agents
`journey-developer.md` and `karpathy-guidelines.md` have no `paths:` and load every session.
`apex.md`, `lwc.md`, `metadata.md` are scoped by `paths:` and load when a matching file
enters context. No agent references a rule by path, and that's deliberate: the mechanism
already delivers them. Don't add reference lines, and don't restate a rule's content inside
an agent.

### 4. Nothing is "built" without evidence
This is the project's spine, stated in `journey-developer.md`: `fsc-deploy-gate` is the only
authority on whether a capability is deployed, and evidence means the cited command, its
exit code, and the field from its JSON output. When you write instructions for any agent,
never introduce a phrasing that would let "the command didn't error" count as proof.

### 5. Real-mutation commands are human checkpoints
`sf project deploy start` without `--dry-run`, `sf data create record`, `sf org assign
permset` intentionally trigger a permission prompt. They are checkpoints on org mutation,
not friction to engineer around. `.claude/hooks/guard-deploy.mjs` enforces this — if you
change `settings.json` permissions or the hook, you are changing a safety boundary; say so
explicitly.

### 6. Language convention
Agent, rule and skill files default to **English**; `README.md` files are in **PT-BR**.
PT-BR is permitted inside agents/skills for field-validated operational procedures where the
team that proved them works in PT-BR — accuracy of a proven procedure outranks language
uniformity. Talk to the user in PT-BR.

### 7. No real names
No company, org, client, vendor, class, Custom Metadata Type, field or identifier taken from
a real org — in content, filenames, commit messages or git authorship metadata. Generic
placeholders everywhere.

This includes **org aliases and internal naming conventions**, which are the easy ones to
miss because they look like configuration rather than content. The deploy target is read
from the `FSC_TARGET_ORG` env var and no alias is hardcoded anywhere; the permission-set
convention in `.claude/skills/fsc-build/references/permissionamento-v2.md` carries the
formula and the checklist but no project's product vocabulary. Keep both that way.

## Repository map

```
.claude/
├── agents/              # 9 authored agents (orchestrator + 7 specialists + deploy gate)
├── agent-memory/        # auto-loaded MEMORY.md per agent declaring memory: project
├── rules/
│   ├── journey-developer.md    # always-on: structural project rules
│   ├── karpathy-guidelines.md  # always-on: behavioral discipline (MIT)
│   ├── apex.md / lwc.md / metadata.md   # path-scoped
├── skills/
│   ├── fsc-build, fsc-gate     # authored references
│   └── salesforce, agent-skills, mattpocock   # imported, third-party
├── hooks/guard-deploy.mjs      # deploy safety boundary
└── settings.json               # permissions
force-app/               # layout skeleton the agents write into
```

## Definition of done

- [ ] Change traces to an explicit request (nothing speculative)
- [ ] Existing style matched; no drive-by edits to adjacent content
- [ ] No imported/third-party skill rewritten
- [ ] No real names reintroduced
- [ ] README reflects structural changes (counts, rules table, phases)

## Third-party licenses

- `.claude/skills/salesforce/` — `forcedotcom/sf-skills`, Apache-2.0 (LICENSE + NOTICE included)
- `.claude/skills/agent-skills/` — LICENSE included
- `.claude/skills/mattpocock/` — LICENSE included
- `.claude/rules/karpathy-guidelines.md` — derived from
  [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills), MIT
