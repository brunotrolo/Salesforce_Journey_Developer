# Salesforce Journey Developer

<p align="center">
  <img src="https://img.shields.io/github/stars/brunotrolo/Salesforce_Journey_Developer?style=flat-square&color=00A1E0&label=stars" alt="Stars">
  <img src="https://img.shields.io/badge/agentes-7-04E1CB?style=flat-square" alt="7 agentes">
  <img src="https://img.shields.io/badge/skills-26-032D60?style=flat-square" alt="26 skills">
  <img src="https://img.shields.io/badge/works%20with-Claude%20Code-032D60?style=flat-square" alt="Works with Claude Code">
</p>

Constrói e deploya de verdade o que a skill irmã **[Salesforce Journey Designer](https://github.com/brunotrolo/Salesforce_Journey_Designer)** especifica, desenha e prototipa. O Designer leva uma capacidade de ideia a `tasks.md` + `architecture.md`, validados com o negócio via protótipo LWC real; este repositório pega esse resultado e produz metadado Salesforce real — Apex, LWC de produção, FlexCard/OmniScript, Flow, modelo de dados — deployado e verificado num org de verdade, nunca só "parece pronto no código-fonte".

**Instale no mesmo projeto que o Designer** — os dois compartilham `specs/`, `docs/sdd/DOMAINS.md` e `docs/sdd/BACKLOG.md`. O Designer nunca deploya nada real (seu protótipo roda com dados fictícios, localmente); este repositório é onde isso vira metadado de verdade.

## Os 7 agentes

| Agente | Papel |
|---|---|
| `fsc-build-orchestrator` | Ponto de entrada — lê `tasks.md`/`architecture.md`, sequencia os especialistas, nunca declara "construído" sem o gate passar. |
| `fsc-data-model-developer` | Objetos/campos/permission sets reais. |
| `fsc-apex-developer` | Apex de produção + teste — nunca um sem o outro. |
| `fsc-lwc-developer` | LWC de produção com dados reais (a contraparte do protótipo do Designer). |
| `fsc-omnistudio-developer` | FlexCard/OmniScript reais (mesmo escopo do Designer: só estes dois). |
| `fsc-automation-developer` | Flow real — a lacuna que o Designer deixa aberta de propósito. |
| `fsc-deploy-gate` | Portão de evidência: scan estático, deploy validado, testes com cobertura real, segurança/acessibilidade de LWC. Nada é "deployado" sem prova executável — ver `.claude/skills/unlazy/references/gates.md`. |

Detalhes de cada um em [`.claude/agents/README.md`](.claude/agents/README.md). Origem e justificativa de cada skill importada em [`.claude/skills/README.md`](.claude/skills/README.md).

## Pré-requisitos

- **Salesforce CLI (`sf`) v2** instalado, e uma **org autenticada** (sandbox, scratch org, ou dev org) — `sf --version` e `sf org display --target-org <alias>` precisam funcionar antes de rodar `fsc-deploy-gate`. Sem isso, o gate para e diz exatamente isso — nunca simula um deploy.
- **Node.js ≥ 20** — para os testes Jest do `fsc-lwc-developer` (o mesmo Node que o Designer já exige para seu kit de protótipo).
- O projeto já ter o **Salesforce Journey Designer** instalado, com pelo menos uma capacidade em status "pronto para build" em `docs/sdd/BACKLOG.md` (spec + design + protótipo + plano técnico já validados).
- Opcional: `jq`, `python3` ≥3.10 (usados por algumas das skills oficiais para parsing de saída JSON do `sf`).

## Como começar

Rode **de dentro da pasta do projeto onde o Designer já está instalado**:

**Mac / Linux / Git Bash:**
```bash
git clone --depth 1 https://github.com/brunotrolo/Salesforce_Journey_Developer.git .jd-tmp && cp -r .jd-tmp/.claude/. .claude/ && cp -rn .jd-tmp/force-app/. force-app/ 2>/dev/null; cp -n .jd-tmp/sfdx-project.json . 2>/dev/null; cp -n .jd-tmp/.forceignore . 2>/dev/null; rm -rf .jd-tmp
```

**Windows (PowerShell):**
```powershell
git clone --depth 1 https://github.com/brunotrolo/Salesforce_Journey_Developer.git .jd-tmp; Copy-Item -Recurse -Force .jd-tmp\.claude\* .claude\; if (-not (Test-Path force-app)) { Copy-Item -Recurse .jd-tmp\force-app . }; if (-not (Test-Path sfdx-project.json)) { Copy-Item .jd-tmp\sfdx-project.json . }; if (-not (Test-Path .forceignore)) { Copy-Item .jd-tmp\.forceignore . }; Remove-Item -Recurse -Force .jd-tmp
```

`-Force`/`cp -r` em `.claude/` é intencional: as skills daqui (`salesforce/`, `agent-skills/`, `mattpocock/`) são um superconjunto das do Designer — sobrescrever é um no-op para o que já existe e adiciona o resto. `force-app/`, `sfdx-project.json` e `.forceignore` só são copiados se ainda não existirem no projeto (não sobrescreve um projeto SFDX que você já tenha).

Depois, abra o Claude Code na pasta do projeto — os 7 agentes carregam automaticamente junto com os do Designer.

## Ciclo por capacidade

```
tasks.md + architecture.md          (produzidos pelo Designer, já validados com o negócio)
        ↓
modelo de dados → Apex → LWC → OmniStudio → Flow      (fsc-build-orchestrator sequencia)
        ↓
fsc-deploy-gate: scan → validar → deploy → testar → verificar acesso
        ↓
docs/sdd/BACKLOG.md atualizado + specs/<domínio>/<NNN>-<slug>/build-report.md
```

Uma capacidade só é dada como "construída" quando `fsc-deploy-gate` reporta cada fase com evidência executável (job id do deploy, id da execução de teste, cobertura real, contagem de findings de scan) — nunca por um agente declarar "deveria funcionar" sem rodar o comando que prova isso.

## Sobre as 26 skills importadas — resumo

17 vêm de [`forcedotcom/sf-skills`](https://github.com/forcedotcom/sf-skills) (oficiais da Salesforce, Apache-2.0) — as 6 que o Designer já usa para prototipar, mais 11 novas específicas de build/deploy real (teste Apex, deploy via `sf`, scan estático, permission set, Flow, SOQL, modelo de dados, segurança/acessibilidade de LWC). As outras 9 (6 + 2 + 1) são disciplina de engenharia curada seletivamente de três repositórios que também inspiraram este projeto — [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills), [`mattpocock/skills`](https://github.com/mattpocock/skills) e [`Leonxlnx/unlazy`](https://github.com/Leonxlnx/unlazy) — nenhum deles é específico de Salesforce, então nenhum foi importado por inteiro; a análise completa, skill por skill, está em [`.claude/skills/README.md`](.claude/skills/README.md).

---

<p align="center">
  ⭐ <b><a href="https://github.com/brunotrolo/Salesforce_Journey_Developer/stargazers">Dê uma star no repo</a></b> para ser avisado quando novas skills e melhorias saírem.
</p>
