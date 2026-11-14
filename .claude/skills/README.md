# Skills importadas

Todas as skills **importadas** vivem aqui, organizadas por origem. Nenhuma delas foi escrita do zero — são importações de repositórios open-source (licenças preservadas em cada subpasta).

> **Como elas são usadas.** O Claude Code descobre comando `/` em `.claude/skills/<nome>/SKILL.md` — um nível só. Estas ficam um nível mais fundo, sob uma pasta de categoria (`salesforce/`, `agent-skills/`…), então **não aparecem no menu `/`** e não são auto-invocadas: são documentos de referência que os agentes leem por caminho explícito, no momento em que precisam. É de propósito — todas no menu poluiriam sem ajudar, e o agente que precisa de cada uma já sabe qual é. As únicas skills invocáveis deste repositório são as autorais `sf-build/` e `sf-gate/`, na raiz de `skills/`.

| Pasta | Origem | O que é |
|---|---|---|
| `salesforce/` | [forcedotcom/sf-skills](https://github.com/forcedotcom/sf-skills) (Apache-2.0) | Skills oficiais da Salesforce — as fundamentais de Apex/LWC/SLDS2 que a skill irmã **Salesforce Journey Designer** usa para prototipar, mais as novas, específicas de build/deploy real (teste, deploy, dados, segurança, automação, integração, montagem de página — ver lista abaixo). |
| `agent-skills/` | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT) | Subconjunto curado: 3 das 26 skills do repositório, cada uma citada por nome num agente específico — ver tabela abaixo. |
| `mattpocock/` | [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) | Subconjunto curado: `diagnosing-bugs` e `code-review`, ambas citadas por nome — ver tabela abaixo. |
| `apex-test-loop/` *(condicional)* | [brunotrolo/Salesforce-Apex-Cover-Loop](https://github.com/brunotrolo/Salesforce-Apex-Cover-Loop) (MIT + Apache-2.0 nas skills que ela mesma embute) | **Não vem num clone limpo deste repositório.** `sf-deploy-gate` clona sob demanda, só quando um deploy falha por cobertura de Apex insuficiente (comum em org Enterprise, que exige ≥75% no deploy) — ver a seção de remediação de cobertura no próprio agente. Diferente de tudo mais nesta pasta, fica um nível raso (`.claude/skills/apex-test-loop/SKILL.md`), então o Claude Code a descobre como um comando `/apex-test-loop` de verdade. |

## Skills Salesforce importadas (`salesforce/`)

**Reaproveitadas do Journey Designer** (mesma origem, mesmo conteúdo — o Developer usa as mesmas para construir de verdade o que o Designer prototipou): `design-systems-slds-apply`, `design-systems-slds-validate`, `platform-apex-generate`, `experience-lwc-generate`. (`design-systems-slds-validate` é usada só pelo Designer, para o scorecard do protótipo; o Developer não a invoca.)

**Novas, específicas de build/deploy** (o Designer nunca compila nem faz deploy real, então nunca precisou destas):

| Skill | Por quê |
|---|---|
| `platform-apex-test-generate` | Gera classes de teste Apex reais (TestDataFactory, bulk, mocks) — `platform-apex-generate` já lista esta como `relatedSkills`; sem ela, Apex é gerado sem teste. |
| `platform-apex-test-run` | Executa `sf apex run test`, analisa cobertura e falhas — a evidência de que o Apex gerado realmente funciona. |
| `platform-metadata-deploy` | O deploy de verdade (`sf project deploy validate/start/report`) — ordem de fases, test level, troubleshooting. |
| `dx-code-analyzer-run` | Scanner estático (PMD, ESLint, CPD, SFGE, ApexGuru) — o portão de qualidade/segurança antes do deploy. |
| `platform-permission-set-generate` | Sem permission set, a tela construída existe mas ninguém no org consegue abrir. |
| `automation-flow-generate` | Flow declarativo — gap que o Designer sinalizava explicitamente ("automação declarativa não tem skill própria"), porque só o Developer efetivamente constrói. |
| `platform-soql-query` | Mesmo motivo — gap sinalizado pelo Designer, autoria/otimização de SOQL real. |
| `platform-custom-object-generate`, `platform-custom-field-generate` | Metadado de modelo de dados real para capacidades `_fundacao/`. |
| `experience-lwc-security-validate` | Revisão de Lightning Web Security (LWS) de verdade — não é o mesmo escopo estreito de acessibilidade do `design-systems-slds-validate`. |
| `experience-accessibility-validate` | Resolve a lacuna que o Designer documentou repetidamente: `slds-validate` só checa presença de atributo, nunca contraste/teclado/leitor de tela — esta skill faz a checagem WCAG 2.2 de verdade. |
| `integration-connectivity-generate` | Named Credentials, External Credentials, callouts REST/SOAP e Platform Events — achado da engenharia reversa em jornadas reais do Designer: uma única capacidade (`busca-cliente/001`) tem 5 sistemas externos integrados, cada um com Named Credential próprio; nenhuma skill original cobria isso. Usada por `sf-integration-developer`. |
| `platform-flexipage-generate` | Lightning Record Page / App Builder — montagem dos LWCs e Screen Flows já construídos nas regiões da página. Outro achado da engenharia reversa: capacidades reais têm tasks inteiras de "montagem de página" que precisam de um dono. Usada por `sf-declarative-developer`. |

**Fora de escopo**: ferramentas de verticais da plataforma (clouds por indústria) não fazem parte de uma org Service Cloud padrão; nenhuma skill delas é vendorizada aqui.

## Skills `agent-skills/` importadas — subconjunto curado

| Skill | Usada por | Para quê |
|---|---|---|
| `test-driven-development` | `sf-apex-developer` | Escrever a intenção do teste (positivo, negativo, bulk, callout/async) antes ou junto da implementação, não depois só para bater cobertura. |
| `security-and-hardening` | `sf-apex-developer` | Toda classe deste projeto toca dado pessoal de cliente (LGPD) e credenciais de integração — ler antes de autorar qualquer coisa que receba input de usuário, faça callout ou armazene dado pessoal/financeiro. |
| `code-review-and-quality` | `sf-deploy-gate` | Segunda lente na fase 1 (scan estático), além do que o linter consegue apontar: o metadado bate com o que `tasks.md`/`architecture.md` pediu, em todas as dimensões (correção, segurança, manutenibilidade). |

O restante (`frontend-ui-engineering`, `performance-optimization`, `browser-testing-with-devtools`, `git-workflow-and-versioning`, `deprecation-and-migration`, etc.) não foi vendorizado: as duas primeiras são web genéricas com equivalente Salesforce já coberto por `experience-lwc-security-validate`/`experience-accessibility-validate`; as duas últimas não mapeiam para nenhuma tarefa concreta de nenhum dos agentes (nenhum agente aqui commita/abre PR, e nenhum decide sunset de sistema legado — isso é trabalho do usuário/harness, não deste catálogo).

## Skills `mattpocock/` importadas — subconjunto curado

| Skill | Usada por | Para quê |
|---|---|---|
| `diagnosing-bugs` | `sf-deploy-gate` | Loop estruturado (reproduzir → minimizar → hipótese → instrumentar → corrigir → teste de regressão) para dizer *por que* uma fase falhou no build-report, não só que falhou. |
| `code-review` | `sf-apex-developer` | Segunda lente de revisão local antes do handoff, além do scan estático — Apex bate com o que foi pedido, não só "passou no linter". |

O resto (TDD/domain-modeling/wayfinder/etc.) já está coberto de forma mais específica pelas skills oficiais da Salesforce ou pelo `agent-skills` acima; duplicar a mesma disciplina em prosa genérica de TypeScript não ajuda.

## Skills autorais (`sf-build/`, `sf-gate/`)

As únicas invocáveis (`/sf-build`, `/sf-gate`). A `sf-build/` carrega ainda
referências próprias em `sf-build/references/` — não são imports, são documentos deste
projeto, destilados de builds reais:

| Referência | Lida por | Para quê |
|---|---|---|
| `dispatch-protocol.md` | `sf-build-orchestrator` | Envelope de despacho, tabela de propriedade de metadado, ordem dos grupos, contrato de report |
| `recomendacoes.md` | todos | Glossário das recomendações numeradas ("Rec N") |
| `nebula-logger-boas-praticas.md` | `sf-integration-developer`, `sf-apex-developer`, `sf-deploy-gate` | Logging para projetos que usam Nebula Logger (framework de terceiros, fora de uma org padrão) (runbook `LogEntry__c`, log-then-save + `RecordId__c`, definição de pronto) |
| `permissionamento-v2.md` | `sf-data-model-developer` | Padrão de nomenclatura de PS/PSG/CP + checklist de criação |
| `passos-manuais-deploy-template.md` | `sf-integration-developer` (escreve), `sf-deploy-gate` (cobra) | Esqueleto da entrega obrigatória `docs/passos-manuais-deploy.md` para capacidades com integração |

## Sobre os 2 repositórios de disciplina — avaliação honesta

Nenhum dos dois é específico de Salesforce/Apex/SFDX. Eles não ensinam nada sobre governor limits, bulkificação de SOQL, CRUD/FLS, Metadata API ou deploy via `sf` — quem cobre isso são as skills oficiais acima. O que eles agregam é **disciplina de engenharia transferível**, por isso a curadoria seletiva em vez de importar tudo (ver as duas tabelas acima para o mapeamento exato skill → agente).

**Resposta direta à pergunta "isso vai ajudar de verdade":** sim, mas como camada de disciplina em cima das skills oficiais — não como substituto delas. Sem as 19 skills da Salesforce, nenhuma dessas três ensinaria o agente a entregar algo que realmente compila e deploya num org.
