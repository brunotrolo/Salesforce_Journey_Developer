# Template — `docs/passos-manuais-deploy.md` (seção por capacidade)

**Entrega da finalização (somente com `SF_FINALIZE_DOCS=1`)** para toda capacidade com
integração externa. O `sf-integration-developer` cria/atualiza a seção desta capacidade
somente nesse modo; o `sf-deploy-gate`, também somente nesse modo, **lê este arquivo
antes de declarar built** e falha o gate se a seção estiver ausente ou incompleta.
Copiar o esqueleto abaixo, uma seção por capacidade, preenchendo cada item — nada de
seção vazia ou "a definir". No desenvolvimento rápido em sandbox, não criar nem atualizar este arquivo.

```markdown
# Passos Manuais — <Nome da capacidade> (pré/pós-deploy CI/CD)

Capacidade `<dominio>/<NNN>-<slug>`. Instruções diretas para subir a
capacidade em **Produção** ou em **outra Sandbox** na esteira. Manifest:
`manifest/package-<slug>.xml`.

---

## 1. Pré-deploy (uma vez por ambiente — faz manual, não vai no manifest)

**1.1 Dependências de infra (confirmar existência):**
- [ ] Apex de infra: `<Classe1>, <Classe2>, ...`.
- [ ] Se o projeto usa Nebula Logger: pacote instalado (objetos `LogEntry__c`, ...).
- [ ] Campos/objetos existentes: `<Objeto.Campo>`, ... Record Type `<Nome>`.

**1.2 Credencial do parceiro (auth):**
- [ ] `NamedCredential` **<Base>** + `ExternalCredential` **EC_<Base>**.
- [ ] Em sandbox: usar o nome de credencial do ambiente, nunca um endpoint ou segredo no código.
- [ ] Allowlist de rede / firewall do parceiro para os hosts da integração.

**1.3 Configuração só-Setup (não implantável por Metadata API):**
- [ ] `<item de configuração feito manualmente em Setup, com o caminho do menu e os valores exatos>`
      (ex.: configuração de site Experience Cloud, ou um tipo de metadado que a API não implanta).
      Remover esta seção se a capacidade não tiver nenhum.

**1.4 Negócio (pendências fora do contrato provado):**
- [ ] `<item confirmado com o parceiro que ainda está fora do contrato HML>`.

---

## 2. Deploy (ordem)

Regra de ordem: **CustomPermission/PS → Apex → MessageChannel → LWC → demais**.

```bash
# Passo 1 — permissões + Apex (finalização: validar antes com --dry-run)
sf project deploy start --target-org <ORG> \
  --metadata PermissionSet:<Nome>,ApexClass:<Classe> \
  --test-level RunLocalTests

# Passo 2 — mensageria + LWC (ordem: canal antes dos LWCs que o importam)
sf project deploy start --target-org <ORG> \
  --metadata LightningMessageChannel:<Canal>,LightningComponentBundle:<Componente> \
  --test-level RunLocalTests
```

---

## 3. Pós-deploy (validação)

- [ ] Atribuir `<PS_..._Edit>` e `<PS_..._View>` aos operadores **<grupo>**.
- [ ] Não atribuir a **<grupo excluído>** (deve NÃO ver — `<critério de aceite>`).
- [ ] **1 chamada real HML — somente na finalização** com dado de teste + verificar:
      (a) resposta `<status + corpo>`, (b) DML resultante `<campo>`, (c) trilha `<campo>`,
      (d) se o projeto usa Nebula Logger, N entradas no `LogEntry__c`.
- [ ] Rodar suíte — somente na finalização com `SF_HEAVY_TESTS_APPROVED=1`: `sf apex run test --target-org <ORG> --class-names <T1,T2> --result-format human`.
- [ ] **Rollback:** `<comando ou procedimento de reversão, se aplicável>`.
```
