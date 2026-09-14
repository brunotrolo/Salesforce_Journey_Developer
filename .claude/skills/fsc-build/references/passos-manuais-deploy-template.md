# Template — `docs/passos-manuais-deploy.md` (seção por capacidade)

**Entrega obrigatória** para toda capacidade com integração externa. O `fsc-integration-developer`
cria/atualiza a seção desta capacidade; o `fsc-deploy-gate` **lê este arquivo antes de declarar
built** e falha o gate se a seção estiver ausente ou incompleta. Copiar o esqueleto abaixo,
uma seção por capacidade, preenchendo cada item — nada de seção vazia ou "a definir".

```markdown
# Passos Manuais — <Nome da capacidade> (pré/pós-deploy CI/CD)

Capacidade `<dominio>/<NNN>-<slug>`. Instruções diretas para subir a
capacidade em **Produção** ou em **outra Sandbox** na esteira. Manifest:
`manifest/package-<slug>.xml`.

---

## 1. Pré-deploy (uma vez por ambiente — faz manual, não vai no manifest)

**1.1 Dependências de infra (confirmar existência):**
- [ ] Apex de infra: `<Classe1>, <Classe2>, ...`.
- [ ] Pacote **Nebula Logger** instalado (objetos `LogEntry__c`, ...).
- [ ] Campos/objetos existentes: `<Objeto.Campo>`, ... Record Type `<Nome>`.

**1.2 Credencial do parceiro (auth):**
- [ ] `NamedCredential` **<Base>** + `ExternalCredential` **EC_<Base>**.
- [ ] Em sandbox: variantes `<Base>_Dev` / `EC_<Base>_Dev` (o conector sufixa `_Dev`).
      ⚠️ Não guardar `_Dev` no nome-base da lookup — vira `_Dev_Dev`.

**1.3 Rotas do parceiro (Lookup Table / Decision Matrix `<Nome>`):**
- [ ] Versão **ATIVA** com as N linhas (criar via toggle disable→insert→enable — a matriz habilitada é
      imutável; o toggle exige autorização explícita registrada no `build-report.md`):
  | DeveloperName (chave) | EndPoint | Method | Timeout |
  |---|---|---|---|
  | `<Chave>` | `<path>` | POST | 120000 |

  ⚠️ **Não deployar** `DecisionMatrixDefinition/<Nome>` a partir do source — o source
  local NÃO contém as linhas (dado de org); incluir no manifest apagaria a matriz.

**1.4 Negócio (pendências fora do contrato provado):**
- [ ] `<item confirmado com o parceiro que ainda está fora do contrato HML>`.

---

## 2. Deploy (ordem)

Regra de ordem: **CustomPermission/PS → Apex → MessageChannel → LWC → demais**.

```bash
# Passo 1 — permissões + Apex
sf project deploy start --target-org <ORG> \
  --source-dir force-app/... \
  --test-level RunSpecifiedTests --tests <Teste1> --tests <Teste2>

# Passo 2 — mensageria + LWC (ordem: canal antes dos LWCs que o importam)
sf project deploy start --target-org <ORG> \
  --source-dir force-app/... \
  --source-dir force-app/...
```

---

## 3. Pós-deploy (validação)

- [ ] Atribuir `<PS_..._Edit>` e `<PS_..._View>` aos operadores **<grupo>**.
- [ ] Não atribuir a **<grupo excluído>** (deve NÃO ver — `<critério de aceite>`).
- [ ] **1 chamada real HML** com dado de teste + verificar:
      (a) resposta `<status + corpo>`, (b) DML resultante `<campo>`, (c) trilha `<campo>`,
      (d) N entradas no `LogEntry__c` (Nebula).
- [ ] Rodar suíte: `sf apex run test --target-org <ORG> --class-names <T1,T2> --result-format human`.
- [ ] **Rollback:** `<comando ou procedimento de reversão, se aplicável>`.
```
