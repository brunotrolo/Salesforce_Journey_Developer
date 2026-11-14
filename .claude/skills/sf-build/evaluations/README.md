# Evals do `/sf-build`

`evals.json` descreve cenários comportamentais (preparação, prompt, o que deve acontecer). Como o
pipeline depende de uma org real, a execução é **manual**: rode cada `prompt` numa sessão limpa do
Claude Code no projeto com o Designer instalado e marque cada item de `expect`. Uma regressão num
item é motivo para ajustar o agente dono — nunca para relaxar o cenário.

Para a comparação "com skill vs. sem skill" (Claude Code puro), rode os mesmos prompts sem os
agentes instalados e compare os itens de `expect` atendidos.

## Comparação com/sem a skill (método usado)

1. Dois projetos de teste idênticos (`BACKLOG`, `specs/`, `sfdx-project.json`); o braço A recebe o `.claude/` deste repositório, o B não.
2. Cada cenário roda N vezes por braço com `claude -p "<prompt>" < /dev/null`, cada execução em cópia própria do projeto.
3. As respostas são anonimizadas (IDs aleatórios, sem o aviso de workspace) e pontuadas por juízes sem contexto contra uma rubrica binária **fixada antes** de rodar.
4. Só depois o gabarito é aberto. Limitações conhecidas: cegueira parcial (respostas do braço A citam nomes `sf-*`), hooks não carregam em workspace sem confiança, mesmo modelo nos dois lados.
