# Evals do `/sf-build`

`evals.json` descreve cenários comportamentais (preparação, prompt, o que deve acontecer). Como o
pipeline depende de uma org real, a execução é **manual**: rode cada `prompt` numa sessão limpa do
Claude Code no projeto com o Designer instalado e marque cada item de `expect`. Uma regressão num
item é motivo para ajustar o agente dono — nunca para relaxar o cenário.

Para a comparação "com skill vs. sem skill" (Claude Code puro), rode os mesmos prompts sem os
agentes instalados e compare os itens de `expect` atendidos.
