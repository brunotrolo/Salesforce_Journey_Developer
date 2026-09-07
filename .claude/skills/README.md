# Skills importadas

Todas as skills **importadas** vivem aqui, organizadas por origem. Nenhuma delas foi escrita do zero — são importações de repositórios open-source (licenças preservadas em cada subpasta).

> **Como elas são usadas.** O Claude Code descobre comando `/` em `.claude/skills/<nome>/SKILL.md` — um nível só. Estas ficam um nível mais fundo, sob uma pasta de categoria (`salesforce/`, `agent-skills/`…), então **não aparecem no menu `/`** e não são auto-invocadas: são documentos de referência que os agentes leem por caminho explícito, no momento em que precisam. É de propósito — 28 skills no menu poluiriam sem ajudar, e o agente que precisa de cada uma já sabe qual é. As únicas skills invocáveis deste repositório são as autorais `fsc-build/` e `fsc-gate/`, na raiz de `skills/`.

| Pasta | Origem | O que é |
|---|---|---|
| `salesforce/` | [forcedotcom/sf-skills](https://github.com/forcedotcom/sf-skills) (Apache-2.0) | 19 skills oficiais da Salesforce — as mesmas 6 fundamentais de Apex/LWC/OmniStudio/SLDS2 que a skill irmã **Salesforce Journey Designer** usa para prototipar, mais 13 novas, específicas de build/deploy real (teste, deploy, dados, segurança, automação, integração, montagem de página — ver lista abaixo). |
| `agent-skills/` | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT) | Subconjunto curado: 4 das 26 skills do repositório, cada uma citada por nome num agente específico — ver tabela abaixo. |
| `mattpocock/` | [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) | Subconjunto curado: `diagnosing-bugs` e `code-review`, ambas citadas por nome — ver tabela abaixo. |
| `unlazy/` | [Leonxlnx/unlazy](https://github.com/Leonxlnx/unlazy) (MIT) | Disciplina de conclusão baseada em evidência (gates com `CHECK:`/`EXPECT:`, nunca declarar "pronto" sem prova executável). Vendorizada como referência de método para `fsc-deploy-gate` — ver nota de uso abaixo, não é acionada por si só nas outras skills. |

## Skills Salesforce importadas (`salesforce/`)

**Reaproveitadas do Journey Designer** (mesma origem, mesmo conteúdo — o Developer usa as mesmas para construir de verdade o que o Designer prototipou): `design-systems-slds-apply`, `design-systems-slds-validate`, `platform-apex-generate`, `experience-lwc-generate`, `omnistudio-omniscript-generate`, `omnistudio-flexcard-generate`.

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
| `integration-connectivity-generate` | Named Credentials, External Credentials, callouts REST/SOAP e Platform Events — achado da engenharia reversa em jornadas reais do Designer: uma única capacidade (`busca-cliente/001`) tem 5 sistemas externos integrados, cada um com Named Credential próprio; nenhuma skill original cobria isso. Usada por `fsc-integration-developer`. |
| `platform-flexipage-generate` | Lightning Record Page / App Builder — montagem das FlexCards/LWCs já construídas nas regiões da página. Outro achado da engenharia reversa: capacidades reais têm tasks inteiras de "montagem de página" que nenhum dos 7 agentes originais tinha para onde despachar. Usada por `fsc-declarative-developer`. |

**Fora de escopo, por consistência com o Journey Designer**: `omnistudio-integration-procedure-generate`, `omnistudio-datamapper-generate`, `omnistudio-callable-apex-generate` — o projeto já decidiu (constituição do Designer) que OmniStudio aqui é só FlexCard + OmniScript; o Developer respeita a mesma fronteira, não a reabre.

## Skills `agent-skills/` importadas — 4 de 26

| Skill | Usada por | Para quê |
|---|---|---|
| `test-driven-development` | `fsc-apex-developer` | Escrever a intenção do teste (positivo, negativo, bulk, callout/async) antes ou junto da implementação, não depois só para bater cobertura. |
| `security-and-hardening` | `fsc-apex-developer` | Toda classe deste projeto toca dado coberto por compliance de serviços financeiros — ler antes de autorar qualquer coisa que receba input de usuário, faça callout ou armazene dado pessoal/financeiro. |
| `code-review-and-quality` | `fsc-deploy-gate` | Segunda lente na fase 1 (scan estático), além do que o linter consegue apontar: o metadado bate com o que `tasks.md`/`architecture.md` pediu, em todas as dimensões (correção, segurança, manutenibilidade). |
| `ci-cd-and-automation` | `fsc-deploy-gate` | Disciplina de desenho de pipeline por trás da ordem de fases do gate — este agente *é* o pipeline de CI/CD escopado a uma capacidade. |

O restante (`frontend-ui-engineering`, `performance-optimization`, `browser-testing-with-devtools`, `git-workflow-and-versioning`, `deprecation-and-migration`, etc.) não foi vendorizado: as duas primeiras são web genéricas com equivalente Salesforce já coberto por `experience-lwc-security-validate`/`experience-accessibility-validate`; as duas últimas não mapeiam para nenhuma tarefa concreta de nenhum dos 9 agentes (nenhum agente aqui commita/abre PR, e nenhum decide sunset de sistema legado — isso é trabalho do usuário/harness, não deste catálogo).

## Skills `mattpocock/` importadas — 2 de ~30

| Skill | Usada por | Para quê |
|---|---|---|
| `diagnosing-bugs` | `fsc-deploy-gate` | Loop estruturado (reproduzir → minimizar → hipótese → instrumentar → corrigir → teste de regressão) para dizer *por que* uma fase falhou no build-report, não só que falhou. |
| `code-review` | `fsc-apex-developer` | Segunda lente de revisão local antes do handoff, além do scan estático — Apex bate com o que foi pedido, não só "passou no linter". |

O resto (TDD/domain-modeling/wayfinder/etc.) já está coberto de forma mais específica pelas skills oficiais da Salesforce ou pelo `agent-skills` acima; duplicar a mesma disciplina em prosa genérica de TypeScript não ajuda.

## Sobre os 3 repositórios sugeridos — avaliação honesta

Nenhum dos três é específico de Salesforce/Apex/SFDX. Eles não ensinam nada sobre governor limits, bulkificação de SOQL, CRUD/FLS, Metadata API ou deploy via `sf` — quem cobre isso são as 19 skills oficiais acima. O que eles agregam é **disciplina de engenharia transferível**, por isso a curadoria seletiva em vez de importar tudo (ver as duas tabelas acima para o mapeamento exato skill → agente).
- **`unlazy`** — vendorizado por inteiro (é um pacote único, `gate-check.mjs` importa `lib/dispatch.mjs`/`lib/process-tree.mjs` internamente, então não dá para recortar só "a metade simples" sem editar a fonte de terceiro — e não editamos fonte vendorizada, mesma disciplina do resto deste README). Mas **nenhum agente aqui roda `node scripts/gate-check.mjs`, `install-hooks.mjs`, ou monta uma árvore de dispatch paralelo** — a mecânica pesada (aprovação de comando, hooks de sessão, dispatch multi-agente) é overkill para um gate sequencial de build→teste→deploy por capacidade. O que `fsc-deploy-gate` de fato usa é só o **princípio**, em prosa: nunca declarar "deployado" sem uma evidência executável (`CHECK:`/`EXPECT:`) e nunca abandonar um gate em silêncio (`ABANDON: <motivo>` obrigatório). Ver `unlazy/references/gates.md`. Os scripts ficam disponíveis caso alguém queira rodar o mecanismo de verdade, mas isso é opcional, não uma dependência de nenhum dos 9 agentes.

**Resposta direta à pergunta "isso vai ajudar de verdade":** sim, mas como camada de disciplina em cima das skills oficiais — não como substituto delas. Sem as 19 skills da Salesforce, nenhuma dessas três ensinaria o agente a entregar algo que realmente compila e deploya num org.
