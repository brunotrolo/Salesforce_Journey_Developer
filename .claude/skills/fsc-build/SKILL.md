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

## Dois modos: desenvolvimento rápido vs finalização

- **Desenvolvimento em sandbox (padrão, máxima performance):** ajustes e validação via
  deploy rápido `sf project deploy start --target-org CoreEvol --source-dir <path>
  --test-level NoTestRun` — sem testes, sem cobertura, sem scans e **sem** atualizar
  documentações de referência. Este modo **não** invoca `fsc-deploy-gate`.
- **Finalização/homologação (somente sob pedido explícito do usuário):** com
  `FSC_FINALIZE_DOCS=1` para documentações de referência e
  `FSC_HEAVY_TESTS_APPROVED=1` para testes/cobertura/scans, aí sim roda o
  `fsc-build-orchestrator` + `fsc-deploy-gate` completos.

Before dispatching, resolve what the user actually named:

- If `$domain` or `$capability` is missing or ambiguous, list the candidates from
  `docs/sdd/BACKLOG.md` and ask which one, rather than guessing.
  - If exactly one arg is provided, assume it's the domain and list capabilities under
    that domain from BACKLOG.md, asking for the second arg.
  - If zero args, list all domains from BACKLOG.md first.
- If `docs/sdd/BACKLOG.md` doesn't exist at all, the Designer skill isn't installed (or
  you are outside the project folder) — say so and stop: there is no designed capability
  to build. Point the user at installing Salesforce Journey Designer first.
- If the capability's status in `docs/sdd/BACKLOG.md` is not at least `pronto para build`,
  say so and stop — its design is not finished, so building it now only creates rework.
  Point the user at the Salesforce Journey Designer skill instead.

When the orchestrator reports back, relay to the user, in PT-BR: what was built, what was
deployed, and anything still open. No modo de desenvolvimento rápido, basta o
`status: Succeeded` do deploy `NoTestRun`. A evidência completa do gate
(deploy job id, test run id, coverage %, scan result) só é exigida na finalização,
quando o usuário pediu explicitamente o gate completo.

## References (this skill's own, read by its agents — not imports)

- `references/nebula-logger-boas-praticas.md` — mandatory logging discipline for every
  capability with integration (runbook, severity levels, log-then-save + `RecordId__c` pattern,
  definition of done). Read by `fsc-integration-developer` and `fsc-apex-developer`.
- `references/permissionamento-odin-v2.md` — ODIN naming pattern for every permission set /
  custom permission (`[TipoArtefato]_[TipoProduto]_[Operação]_[Especificidade]_[NivelAcesso]`,
  EN labels, creation checklist). Read by `fsc-data-model-developer`.
- `references/passos-manuais-deploy-template.md` — skeleton for the mandatory deliverable below.

## Deliverable `docs/passos-manuais-deploy.md` (somente na finalização)

Somente quando o usuário pedir explicitamente a finalização (`FSC_FINALIZE_DOCS=1`),
toda capacidade com integração externa shipa uma seção em
`docs/passos-manuais-deploy.md` (one section per capability, from the template above):
pre-deploy manual steps (infra, credentials, Lookup Table/Decision Matrix rows, business
pendencies), deploy order, and post-deploy validation. `fsc-integration-developer` writes it;
nesse modo, `fsc-deploy-gate` reads it before declaring built and fails the gate if the
section is missing or incomplete. Durante o desenvolvimento rápido em sandbox, este
arquivo **não** é criado nem atualizado — foco total nos artefatos da org.
