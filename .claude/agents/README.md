# Agentes de build/deploy — Salesforce Journey Developer (Service Cloud)

Subagentes do Claude Code, cada um consumindo um subconjunto das skills em `.claude/skills/` (ver `.claude/skills/README.md` para a origem de cada uma). Este repositório é a skill **irmã** de **Salesforce Journey Designer**: o Designer especifica, desenha e prototipa uma capacidade (`spec.md` → `plan.md` → protótipo → `tasks.md`/`architecture.md`); o Developer pega esse resultado já validado com o negócio e constrói/deploya o metadado real. Instale os dois no mesmo projeto — eles compartilham `specs/`, `docs/sdd/DOMAINS.md` e `docs/sdd/BACKLOG.md`.

| Agente | Papel |
|---|---|
| `sf-build-orchestrator` | Ponto de entrada. Lê **100% da pasta** `specs/<domínio>/<NNN>-<slug>/` de uma capacidade, sequencia os especialistas abaixo; iterações de dev validam com deploy `NoTestRun` sem gate, e "construído" só é declarado com o `sf-deploy-gate` passando na finalização pedida pelo usuário. |
| `sf-data-model-developer` | Objetos/campos/RecordTypes/permission sets reais (`platform-custom-object-generate`, `platform-custom-field-generate`, `platform-permission-set-generate`). |
| `sf-integration-developer` | Named Credentials/External Credentials/Platform Events (`integration-connectivity-generate`) — a plumbing que todo callout/evento cross-domain depende de existir antes. |
| `sf-apex-developer` | Apex de produção + classe de teste (`platform-apex-generate` + `platform-apex-test-generate`), incluindo callouts via `HttpCalloutMock`. |
| `sf-lwc-developer` | LWC de produção — a contraparte real do protótipo do Designer, com dados de verdade e Lightning Message Service onde o protótipo desacopla componentes irmãos. |
| `sf-service-config-developer` | Configuração Service Cloud sem dono nos demais: filas, Assignment/Escalation Rules, Entitlement/Milestones, Omni-Channel, Knowledge, Macros/Quick Text. Verifica cada tipo na documentação oficial antes de escrever. |
| `sf-declarative-developer` | Dynamic Forms/Highlights/Compact Layout/Related Lists/quick actions + montagem da Lightning Record Page e do Service Console com utility bar (`platform-flexipage-generate`) — a fatia declarativa de toda capacidade. |
| `sf-automation-developer` | Flow real (Screen Flow via Flow for Service, autolaunched, record-triggered, scheduled) — a lacuna que o Designer deixa explicitamente aberta. |
| `sf-deploy-gate` | O portão de evidência da finalização: scan estático, deploy validado, testes com cobertura real, segurança/acessibilidade de LWC. Iteração dev valida com deploy `NoTestRun` — nada é "construído" sem prova executável. |

## Como pedir

Peça pelo **domínio + capacidade**, exatamente como no Designer — a capacidade já precisa ter `tasks.md`/`architecture.md`:

> `/sf-build atendimento 001`  (a orquestração roda na conversa principal; subagentes não chamam outros subagentes)

O orquestrador roda, por capacidade:
1. Confere `docs/sdd/BACKLOG.md` — status precisa ser "pronto para build" (o Designer já terminou spec/design/protótipo/plano técnico).
2. Lê 100% da pasta da capacidade (`spec.md`, `plan.md`, `tasks.md`, `architecture.md`, `prototype/` e qualquer outro arquivo presente), roteia cada passo pelo veredito e abordagem do `plan.md` e despacha na ordem de dependência: (A) modelo de dados + integração → (B) Apex + configuração Service Cloud → (C) LWC + Flow → (D) declarativo (monta o que os anteriores construíram) — a mesma lógica que `platform-metadata-deploy` usa para deploy, de propósito. Envelope e tabela de propriedade em `.claude/skills/sf-build/references/dispatch-protocol.md`.
3. Na finalização pedida pelo usuário, roda `sf-deploy-gate` — obrigatório, sem atalho (no dev rápido, valida só com deploy `NoTestRun`).
4. Atualiza `docs/sdd/BACKLOG.md` e escreve `specs/<domínio>/<NNN>-<slug>/build-report.md` com a evidência.

## Pré-requisitos além dos do Designer

- **Salesforce CLI (`sf`) v2** instalado e uma **org autenticada** (sandbox, scratch org, ou dev org) — `sf --version` e `sf org display --target-org <alias>` devem funcionar antes de rodar `sf-deploy-gate`. Sem isso, o gate para e reporta exatamente essa falta, nunca simula um deploy.
- `sfdx-project.json` na raiz do projeto (ver `README.md` raiz para o layout `force-app/domains/<domínio>/`).
- Node.js ≥20 já é pré-requisito do Designer (para o kit de protótipo) — `sf-lwc-developer` reaproveita o mesmo Node para rodar Jest.
