# `force-app/` — layout por domínio

Nenhum domínio existe aqui ainda neste template — as pastas abaixo nascem sob demanda, a primeira vez que `fsc-build-orchestrator` constrói uma capacidade daquele domínio (mesma disciplina "criar app entry na primeira vez, reusar depois" da skill irmã Designer).

```
force-app/
  domains/
    <domain-slug>/           # ex.: busca-cliente, atendimento — mesmo slug de specs/<domain>/ e docs/sdd/DOMAINS.md
      main/default/
        classes/             # fsc-apex-developer
        triggers/             # fsc-apex-developer
        lwc/                  # fsc-lwc-developer
        flexCards/            # fsc-omnistudio-developer
        omniScripts/          # fsc-omnistudio-developer
        flows/                # fsc-automation-developer
        objects/              # fsc-data-model-developer
        permissionsets/       # fsc-data-model-developer, fsc-apex-developer
```

**Por que por domínio, e não um `force-app/main/default/` único**: cada domínio é uma fronteira de deploy independente (o mesmo princípio de micro-frontend que a skill Designer já aplica ao UI) — isso é o padrão "modular architecture" que a própria Salesforce recomenda para orgs grandes, e evita a mesma super-customização acoplada que motivou esta migração. `sf project deploy start --source-dir force-app/domains/<domain>/main/default` deploya só o domínio que mudou; nunca use `--source-dir force-app` inteiro para o deploy normal de uma capacidade — isso reacoplaria os domínios no processo de deploy, mesmo eles sendo independentes no código.

`_fundacao/` (modelo de dados/segurança compartilhado, sem UI) não é um domínio de produto — seu metadado (objetos, campos, permission sets base) fica em `force-app/domains/_fundacao/main/default/`, e é o único domínio que os outros legitimamente dependem de deploy.
