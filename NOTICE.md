# Atribuição de terceiros

O Salesforce Journey Developer é distribuído sob licença MIT (ver `LICENSE`) e redistribui
material de terceiros sob as licenças originais.

O conteúdo **autoral** deste repositório são os 9 agentes em `.claude/agents/`, as rules em
`.claude/rules/` (exceto `karpathy-guidelines.md`, derivada — ver abaixo) e as skills
`fsc-build/` e `fsc-gate/`. Todo o resto sob `.claude/skills/` é importado.

## Skills importadas

Cada subpasta preserva a licença original do projeto de origem. A tabela completa —
quais skills foram importadas, de onde, e qual agente cita cada uma — está em
[`.claude/skills/README.md`](.claude/skills/README.md).

| Caminho | Origem | Licença |
|---|---|---|
| `.claude/skills/salesforce/` | [forcedotcom/sf-skills](https://github.com/forcedotcom/sf-skills) | Apache-2.0 (`LICENSE` + `NOTICE` inclusos) |
| `.claude/skills/agent-skills/` | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | MIT (`LICENSE` incluso) |
| `.claude/skills/mattpocock/` | [mattpocock/skills](https://github.com/mattpocock/skills) | MIT (`LICENSE` incluso) |
| `.claude/skills/apex-test-loop/` *(condicional)* | [brunotrolo/Salesforce-Apex-Cover-Loop](https://github.com/brunotrolo/Salesforce-Apex-Cover-Loop) | MIT (+ Apache-2.0 no que ela embute) |

`apex-test-loop/` **não vem num clone limpo** — o `fsc-deploy-gate` a clona sob demanda,
apenas quando um deploy falha por cobertura de Apex insuficiente.

## Karpathy Guidelines — MIT

**Caminho:** `.claude/rules/karpathy-guidelines.md`
**Origem:** [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)

As quatro diretrizes comportamentais (Think Before Coding, Simplicity First, Surgical
Changes, Goal-Driven Execution) são reproduzidas **na íntegra**. Os blocos marcados
`In this project` são contextualização própria deste repositório para build e deploy de
metadado real — acrescentam, não substituem nem relaxam a orientação original.

As diretrizes derivam de
[observações de Andrej Karpathy](https://x.com/karpathy/status/2015883857489522876)
sobre armadilhas de LLM em programação.
