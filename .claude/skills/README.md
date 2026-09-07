# Skills importadas

Todas as skills usadas neste repositório vivem aqui, organizadas por origem. Nenhuma foi escrita do zero — são importações de repositórios open-source (licenças preservadas em cada subpasta).

| Pasta | Origem | O que é |
|---|---|---|
| `salesforce/` | [forcedotcom/sf-skills](https://github.com/forcedotcom/sf-skills) (Apache-2.0) | 17 skills oficiais da Salesforce — as mesmas 6 fundamentais de Apex/LWC/OmniStudio/SLDS2 que a skill irmã **Salesforce Journey Designer** usa para prototipar, mais 11 novas, específicas de build/deploy real (teste, deploy, dados, segurança, automação — ver lista abaixo). |
| `agent-skills/` | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) (MIT) | Subconjunto curado: disciplina de TDD, segurança, code review, CI/CD, git e migração/depreciação — só as 6 skills que fazem sentido para quem entrega código real, não o conjunto inteiro (as de frontend/performance web genéricas ficaram de fora, ver justificativa abaixo). |
| `mattpocock/` | [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) | Subconjunto curado: `diagnosing-bugs` (loop estruturado de debug) e `code-review` (segunda lente de revisão), para quando um deploy ou teste falha e precisa de causa raiz real, não achismo. |
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

**Fora de escopo, por consistência com o Journey Designer**: `omnistudio-integration-procedure-generate`, `omnistudio-datamapper-generate`, `omnistudio-callable-apex-generate` — o projeto já decidiu (constituição do Designer) que OmniStudio aqui é só FlexCard + OmniScript; o Developer respeita a mesma fronteira, não a reabre.

## Sobre os 3 repositórios sugeridos — avaliação honesta

Nenhum dos três é específico de Salesforce/Apex/SFDX. Eles não ensinam nada sobre governor limits, bulkificação de SOQL, CRUD/FLS, Metadata API ou deploy via `sf` — quem cobre isso são as 17 skills oficiais acima. O que eles agregam é **disciplina de engenharia transferível**, por isso a curadoria seletiva em vez de importar tudo:

- **`agent-skills`** (25 skills no total) — importamos só as 6 que reforçam o que falta num pipeline de deploy real: `test-driven-development`, `security-and-hardening`, `code-review-and-quality`, `ci-cd-and-automation`, `git-workflow-and-versioning`, `deprecation-and-migration` (este último é uma coincidência feliz — a migração Service Cloud → FSC *é* literalmente um projeto de depreciação/migração). Deixamos de fora `frontend-ui-engineering`, `performance-optimization` (Core Web Vitals), `browser-testing-with-devtools` — são web genéricas, o equivalente Salesforce já vem de `experience-lwc-security-validate`/`experience-accessibility-validate`.
- **`mattpocock/skills`** (~20 skills) — importamos só `diagnosing-bugs` e `code-review`. O resto (TDD/domain-modeling/wayfinder/etc.) já está coberto de forma mais específica pelas skills oficiais da Salesforce ou pelo `agent-skills` acima; duplicar a mesma disciplina em prosa genérica de TypeScript não ajuda.
- **`unlazy`** — a mecânica pesada (árvore de dispatch paralelo, sandbox de aprovação, hooks) é overkill para um gate sequencial de build→teste→deploy por capacidade; não vendorizamos os scripts de orquestração. O que vale — e o que `fsc-deploy-gate` usa — é o princípio: nunca declarar "deployado" sem uma evidência executável (`CHECK:`/`EXPECT:`) e nunca abandonar um gate em silêncio (`ABANDON: <motivo>` obrigatório). Ver `unlazy/references/gates.md`.

**Resposta direta à pergunta "isso vai ajudar de verdade":** sim, mas como camada de disciplina em cima das skills oficiais — não como substituto delas. Sem as 17 skills da Salesforce, nenhuma dessas três ensinaria o agente a entregar algo que realmente compila e deploya num org.
