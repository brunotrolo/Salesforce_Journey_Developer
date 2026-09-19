# CLAUDE.md

**This repository's rules live in [`AGENTS.md`](AGENTS.md). Read it before making any
change.** Single, vendor-neutral source — this file doesn't duplicate them, so they can't
drift apart.

The essentials, in three lines:

1. This repository **is a skill**, not a Salesforce project. You write instructions another
   agent executes against a real org; `force-app/` here is a layout skeleton, not real code.
2. Nothing is "built" without evidence — the cited command, its exit code, and the JSON
   field that proves the outcome. "The deploy didn't error" is not evidence.
3. No real names (company, org, vendor, class, field) anywhere — content, filenames or
   commits.

## Claude Code specifics

- **Subagents** (`.claude/agents/*.md`) use `name`, `description`, `tools`, optionally
  `model` and `memory`. This is **not** the skill frontmatter: a `SKILL.md` uses
  `allowed-tools`. Swapping one for the other is silently ignored.
- **Agent memory:** `fsc-declarative-developer` and `fsc-omnistudio-developer` declare
  `memory: project`, which auto-loads `.claude/agent-memory/<agent-name>/MEMORY.md`. That
  exact path is what the harness reads — a `MEMORY.md` anywhere else is never loaded.
- **Rules auto-load.** `journey-developer.md` and `karpathy-guidelines.md` are
  unconditional; `apex.md`, `lwc.md`, `metadata.md` are scoped by `paths:`. Agents
  deliberately don't cross-reference them — the mechanism already delivers them.
- **Imported skills** (`skills/salesforce`, `skills/agent-skills`, `skills/mattpocock`) are
  third-party, consulted by path. Don't rewrite them.
- **Deploy safety:** `.claude/hooks/guard-deploy.mjs` plus `settings.json` permissions make
  real-mutation `sf` commands prompt on purpose. Changing either changes a safety boundary.
