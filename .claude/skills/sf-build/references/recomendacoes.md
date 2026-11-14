# Glossário das recomendações numeradas ("Rec N")

Os agentes citam recomendações por número. Esta tabela é a fonte: cada linha diz a regra e quem a
aplica. A regra completa fica no agente dono — aqui só o suficiente para entender a citação.

| Rec | Regra | Dono |
|---|---|---|
| 3 | Sandbox rápido usa `--metadata` + `NoTestRun`, sem gate; gate completo só na finalização | `sf-deploy-gate` |
| 4 | Sempre validar/deployar a closure de dependências, nunca um arquivo isolado | `sf-deploy-gate` |
| 5 | 1 `Test.setMock` por método de teste | `sf-apex-developer` |
| 6 | *(removida — específica de uma vertical fora do escopo)* | — |
| 7 | Logging log-then-save (`Logger.*` antes de `saveLog()`, `setRecordId` com Id válido) — só com Nebula Logger | `sf-integration-developer`, `sf-apex-developer` |
| 8 | E2E manual: setup (DML) e chamada em execuções separadas | `sf-apex-developer` |
| 9 | Setup de Case em teste exige o registro-pré-requisito da automação da org | `sf-apex-developer` |
| 10 | Clonar o registro da factory ao criar mais de um no mesmo método | `sf-apex-developer` |
| 11 | FLS em teste: admin + PS da capacidade, mais 1 teste negativo sem PS | `sf-apex-developer` |
| 12 | Re-ler por SOQL e asserir após update de status/campo | `sf-apex-developer` |
| 13 | Parse defensivo de response body; tratar `null` antes do Logger | `sf-apex-developer` |
| 14 | ≥1 chamada real em homologação por integração, com verificação tripla (finalização) | `sf-integration-developer`, `sf-deploy-gate` |
| 16 | Contrato primeiro: payload só com o que o curl real provou; asserir ausência de `Authorization`/`Cookie` manuais | `sf-integration-developer`, `sf-apex-developer` |
| 18 | Triagem de erro de integração: ler o body real; 4xx rápido = negócio, 5xx/timeout = infra | `sf-deploy-gate` |
| 19 | Ajuste de layout SLDS: F12 ao vivo primeiro, código depois | `sf-lwc-developer` |
| 21 | Trilha de auditoria append-only em campo `Text(500)` com truncagem | `sf-apex-developer` |
| 22 | Identificador do operador via `User.FederationIdentifier`, fallback `User.Id` | `sf-apex-developer` |
| 24 | Pré-requisito `docs/passos-manuais-deploy.md` completo antes de finalizar | `sf-deploy-gate` |
| 25 | Classe de teste autocontida: sem SOQL por nome a RecordType/Profile/PermissionSet/Queue/Group/UserRole/BusinessHours; sem depender de outra classe `*Test` (reforçada pelo hook `guard-test-content.mjs`) | `sf-apex-developer` |