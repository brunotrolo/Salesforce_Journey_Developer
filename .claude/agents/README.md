# Agentes de build/deploy — Salesforce Journey Developer (Service Cloud → FSC)

Sete subagentes do Claude Code, cada um consumindo um subconjunto das skills em `.claude/skills/` (ver `.claude/skills/README.md` para a origem de cada uma). Este repositório é a skill **irmã** de **Salesforce Journey Designer**: o Designer especifica, desenha e prototipa uma capacidade (`spec.md` → `plan.md` → protótipo → `tasks.md`/`architecture.md`); o Developer pega esse resultado já validado com o negócio e constrói/deploya o metadado real. Instale os dois no mesmo projeto — eles compartilham `specs/`, `docs/sdd/DOMAINS.md` e `docs/sdd/BACKLOG.md`.

| Agente | Papel |
|---|---|
| `fsc-build-orchestrator` | Ponto de entrada. Lê `tasks.md`/`architecture.md` de uma capacidade, sequencia os especialistas abaixo, nunca declara "construído" sem o `fsc-deploy-gate` passar. |
| `fsc-data-model-developer` | Objetos/campos/permission sets reais (`platform-custom-object-generate`, `platform-custom-field-generate`, `platform-permission-set-generate`). |
| `fsc-apex-developer` | Apex de produção + classe de teste (`platform-apex-generate` + `platform-apex-test-generate`). |
| `fsc-lwc-developer` | LWC de produção — a contraparte real do protótipo do Designer, com dados de verdade em vez de fixture. |
| `fsc-omnistudio-developer` | FlexCard/OmniScript reais (mesmo escopo do Designer: só estes dois artefatos). |
| `fsc-automation-developer` | Flow real — a lacuna que o Designer deixa explicitamente aberta. |
| `fsc-deploy-gate` | O portão de evidência: scan estático, deploy validado, testes com cobertura real, segurança/acessibilidade de LWC. Nada é "deployado" sem prova executável. |

## Como pedir

Peça pelo **domínio + capacidade**, exatamente como no Designer — a capacidade já precisa ter `tasks.md`/`architecture.md`:

> "Use o fsc-build-orchestrator para construir e deployar `support` 001"

O orquestrador roda, por capacidade:
1. Confere `docs/sdd/BACKLOG.md` — status precisa ser "pronto para build" (o Designer já terminou spec/design/protótipo/plano técnico).
2. Lê `tasks.md`/`architecture.md`, despacha os especialistas na ordem de dependência (modelo de dados → Apex → LWC → OmniStudio → Flow — a mesma ordem que `platform-metadata-deploy` usa para deploy, de propósito).
3. Roda `fsc-deploy-gate` — obrigatório, sem atalho.
4. Atualiza `docs/sdd/BACKLOG.md` e escreve `specs/<domínio>/<NNN>-<slug>/build-report.md` com a evidência.

## Pré-requisitos além dos do Designer

- **Salesforce CLI (`sf`) v2** instalado e uma **org autenticada** (sandbox, scratch org, ou dev org) — `sf --version` e `sf org display --target-org <alias>` devem funcionar antes de rodar `fsc-deploy-gate`. Sem isso, o gate para e reporta exatamente essa falta, nunca simula um deploy.
- `sfdx-project.json` na raiz do projeto (ver `README.md` raiz para o layout `force-app/domains/<domínio>/`).
- Node.js ≥20 já é pré-requisito do Designer (para o kit de protótipo) — `fsc-lwc-developer` reaproveita o mesmo Node para rodar Jest.
