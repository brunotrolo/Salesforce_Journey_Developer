# `force-app/` — layout por domínio

Nenhum domínio existe aqui ainda neste template — as pastas abaixo nascem sob demanda, a primeira vez que `sf-build-orchestrator` constrói uma capacidade daquele domínio (mesma disciplina "criar app entry na primeira vez, reusar depois" da skill irmã Designer).

```
force-app/
  domains/
    <domain-slug>/           # ex.: busca-cliente, atendimento — mesmo slug de specs/<domain>/ e docs/sdd/DOMAINS.md
      main/default/
        classes/             # sf-apex-developer
        triggers/             # sf-apex-developer
        lwc/                  # sf-lwc-developer
        messageChannels/      # sf-lwc-developer — Lightning Message Service, quando componentes irmaos (nao pai-filho) precisam se desacoplar
        flexipages/           # sf-declarative-developer — montagem da Lightning Record Page (App Builder)
        flows/                # sf-automation-developer
        objects/              # sf-data-model-developer — inclui recordTypes dentro do proprio .object-meta.xml
        namedCredentials/      # sf-integration-developer
        externalCredentials/   # sf-integration-developer
        platformEvents/        # sf-integration-developer — eventos __e para consumo cross-domain
        queues/               # sf-service-config-developer
        assignmentRules/      # sf-service-config-developer
        escalationRules/      # sf-service-config-developer
        entitlementProcesses/ # sf-service-config-developer — quando a Metadata API do projeto o implanta; senão, passo manual
        applications/         # sf-declarative-developer — Service Console app + utility bar
        permissionsets/       # sf-data-model-developer — único autor de PS/PSG/CP (padrão de nomenclatura); demais especialistas consomem, não criam
```

**Por que por domínio, e não um `force-app/main/default/` único**: cada domínio é uma fronteira de deploy independente (o mesmo princípio de micro-frontend que a skill Designer já aplica ao UI) — isso é o padrão "modular architecture" que a própria Salesforce recomenda para orgs grandes, e evita a super-customização acoplada. `sf project deploy start --source-dir force-app/domains/<domain>/main/default` deploya só o domínio que mudou; nunca use `--source-dir force-app` inteiro para o deploy normal de uma capacidade — isso reacoplaria os domínios no processo de deploy, mesmo eles sendo independentes no código.

**Exceção org-existente:** quando `sf-build-orchestrator` registra modo org-existente para o projeto (layout flat existente, ex.: `force-app/main/default/`), cada especialista escreve sob esse layout existente em vez de `force-app/domains/<domain>/` — a regra de fronteira por domínio continua válida logicamente (nunca tocar artefatos de outro domínio), só a raiz física muda. O orquestrador declara a raiz efetiva no dispatch; em dúvida, perguntar a ele — nunca inventar um terceiro layout.

**Tipos sem implantação por Metadata API:** nem toda configuração de Service Cloud é implantável. Quando `sf-service-config-developer` não consegue confirmar na documentação oficial que um tipo é implantável, a configuração vira passo manual em `docs/passos-manuais-deploy.md` e o `sf-deploy-gate` verifica o estado final por query.

`_fundacao/` (modelo de dados/segurança compartilhado, sem UI) não é um domínio de produto — seu metadado (objetos, campos, permission sets base) fica em `force-app/domains/_fundacao/main/default/`, e é o único domínio que os outros legitimamente dependem de deploy.
