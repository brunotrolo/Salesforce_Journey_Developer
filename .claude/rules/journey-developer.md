# Salesforce Journey Developer — project rules

This project builds and deploys real Salesforce Financial Services Cloud metadata from
capability designs produced by the sister skill **Salesforce Journey Designer**. These
rules are always true here, whichever agent is running.

## The two-repo split

- **Designer** owns `spec.md` → `plan.md` → prototype → `tasks.md`/`architecture.md`. Its
  output is validated with the business before anything is built. It never deploys.
- **Developer** (this repo) turns that finished design into real metadata in an org.
- Both install into the same project and share `specs/`, `docs/sdd/DOMAINS.md` and
  `docs/sdd/BACKLOG.md`. Never fork a second copy of those.
- A design gap found while building goes **back to the Designer's agents**, never fixed
  silently here.

## Nothing is "built" without evidence

`fsc-deploy-gate` is the only authority on whether a capability is deployed. A capability
is done when the gate cites the command, its exit code, and the field from its JSON output
that proves the outcome — deploy job id, test run id, coverage %, scan severity counts.
"The code looks right" and "the deploy command didn't error" are not evidence. A gate that
genuinely cannot run is an explicit `ABANDON: <reason>` in the build report, never a
silently skipped phase.

## Where metadata lives

One folder per domain, each an independent deploy boundary:
`force-app/domains/<domain-slug>/main/default/<type>/` — see `force-app/README.md` for the
full layout. Never write a capability's metadata outside its own domain folder, and never
deploy `--source-dir force-app` wholesale for a single capability.

## Fixed project scope

- **OmniStudio is FlexCard + OmniScript only** — the boundary the Designer's constitution
  already fixed. No Integration Procedure, no DataMapper/DataRaptor. Both are sObject
  records (`OmniUiCard`, `OmniProcess`), not `-meta.xml` source files.
- **Standard-first.** Over-customization is why this migration exists. Rule out a standard
  object, field, or declarative feature before building a custom one.
- **No cross-domain coupling.** One domain reaches another only through the contract
  `architecture.md` declares — a record, a field, a Platform Event, or an exposed Apex
  method. Never by calling another domain's internal classes.

## Conventions

- Agent, rule and skill files are written in English; `README.md` files are in PT-BR.
- Talk to the user in PT-BR.
