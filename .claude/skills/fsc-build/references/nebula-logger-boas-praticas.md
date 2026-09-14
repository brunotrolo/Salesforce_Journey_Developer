# Nebula Logger — Boas práticas e requisitos obrigatórios

Referência de logging para **todas as capacidades com integração**. Origem: aprendizados
provados na jornada `resgate-smiles` (chamadas reais HML, queries em `LogEntry__c`, testes e
deploys). Tudo abaixo é **obrigatório** em novo desenvolvimento, salvo exceção registrada no
`build-report.md`.

> **Verificar na org-alvo antes de assumir:** namespace do pacote (na org de origem era
> **sem namespace**: objetos `Log__c` / `LogEntry__c` / `LogEntryEvent__e`, Nebula v4.19.2).
> Confirmar via `sf data query` na primeira capacidade do projeto e registrar no `build-report.md`.

## 1. Onde ver os logs (runbook)

- Mensagens ficam em **`LogEntry__c`** (filhos); `Log__c` é só o cabeçalho da transação.
- Filtro padrão: `HttpRequestEndpoint__c` **contém** o path (ex.: `miles-program`) + `ORDER BY CreatedDate DESC`.
- Colunas úteis: `CreatedDate`, `LoggingLevel__c`, `Message__c`, `HttpRequestEndpoint__c`,
  `HttpRequestMethod__c`, `HttpResponseBody__c`, `RecordId__c`.
- Atenção: no mesmo horário há ruído de **outras integrações** — sempre filtrar pelo endpoint
  e, quando houver vínculo, por `RecordId__c`.

## 2. Níveis (severidade)

| Situação | Level | Quem gera |
|---|---|---|
| Chamada HTTP 2xx concluída | `INFO` | classe base de integração (`doRequest()`-equivalente) |
| Entrada de negócio (ex.: accrual enviado, resgate concluído) | `INFO` | código da capacidade |
| Falha HTTP 4xx/5xx, timeout, `CalloutException` | `ERROR` | classe base via `logError()` |
| Falha auxiliar que não quebra o sucesso (ex.: caso de evidência) | `INFO` com prefixo `ATENÇÃO:` | código da capacidade |

## 3. Padrão obrigatório de código

### 3.1 HTTP automático da base (não reinventar)

A classe base de integração (ex.: `AbstractAPIConnector.doRequest()`) já loga
request/response e faz `saveLog()` no `finally` — inclusive em exceção. Classes de integração
**não** devem logar HTTP manualmente.

### 3.2 Entrada de negócio: log-then-save IMEDIATO + `RecordId__c` obrigatório (bugs reais)

Bug 1 — entrada perdida: criada **depois** do `saveLog()` da base e sem novo `saveLog()`,
só o log HTTP persistia. Toda entrada de negócio exige `saveLog()` próprio.

Bug 2 — `RecordId__c` em branco nos erros: o log de erro da base **não tem vínculo** — é
genérico. Por isso a capacidade **duplica o erro com vínculo** no controller, antes de
re-lançar para o toast:

```apex
String responseBody;
try {
    responseBody = new ExampleWebService()
        .postAccrual(cpfToSend, points, comments, protocolNumber);
} catch (AuraHandledException e) {
    Logger.error('Falha no resgate. Protocolo ' + protocolNumber
            + ' | Caso ' + caseId + ': ' + e.getMessage(), e)
        .setRecordId(caseId)
        .addTag('PortoPlus').addTag('<Sistema>').addTag('Backoffice');
    Logger.saveLog();
    throw e;
}
// Sucesso (com vínculo):
Logger.info('Resgate concluído. Protocolo ' + protocolNumber + ' | ID ' + requestId + ' ...')
    .setRecordId(caseId).addTag(...); Logger.saveLog();
```

Resultado: filtrando `LogEntry__c` por `RecordId__c = Id do caso`, você vê **tanto o sucesso
(INFO) quanto a falha (ERROR com `RecordId__c` preenchido)**.

```apex
// Documento mascarado (LGPD) — padrão, reutilizar:
private static String maskDocument(String document) {
    if (String.isBlank(document) || document.length() <= 4) {
        return '****';
    }
    return '*******' + document.right(4);
}
```

### 3.3 `RecordId__c` (related record): SÓ ID Salesforce válido

- `LogEntry__c.RecordId__c` é `Text(18)` e o builder **valida formato de ID**:
  `setRecordId('<CaseNumber de 14 dígitos>')` estoura `StringException: Invalid id`
  (provado em teste — quebra a transação se não tratado).
- **Regra:** passar sempre o **Id do registro** (ex.: `caseId`). O número de
  protocolo/ticket vai **no texto da mensagem** (pesquisável) + tags.

### 3.4 Segredos e artefatos de navegador: NUNCA no código nem no log manual

- `Authorization`/`Cookie` manuais são **proibidos**: auth é 100% plataforma
  (Named/External Credential OAuth). Teste de contrato deve asserir ausência:
  `System.assertEquals(null, sent.getHeader('Authorization'))` e `...('Cookie')`.
- A base pode logar `HttpRequestBody__c` **completo e em texto puro** (inclui CPF) —
  ver item 5 (máscara declarativa, pendente).

### 3.5 Falha auxiliar nunca quebra sucesso principal

Padrão: `try/catch` em volta, `Logger.info('ATENÇÃO: ...')` + `saveLog()`, e o fluxo de
sucesso continua. Erro de negócio/infra da chamada principal segue via
`AuraHandledException` amigável (toast) + log `ERROR` da base.

## 4. Verificação obrigatória (definição de pronto do log)

1. Chamada real em HML (dados de teste) por integração nova/alterada.
2. Tríplice conferência: **(a)** resposta da API, **(b)** DML resultante, **(c)** query em
   `LogEntry__c` mostrando as entradas esperadas (negócio + HTTP) com level correto.
3. Teste automatizado cobre o caminho feliz do log (mock 200 executa as linhas de
   `Logger.*` sem exceção).

## 5. Recomendações pendentes (não implementadas — decidir por capacidade)

1. **Mascarar CPF no body logado pela base** via `LogEntryDataMaskRule__mdt`
   (corpo hoje em texto puro — exposição LGPD).
2. **Extrair `user_message`/`request_id` das respostas de erro** para toast e log
   (ex.: 422 `CPF não cadastrado`), em vez de mensagem genérica.
3. **Cenário de tags:** avaliar `setScenario()` por capacidade para agrupamento
   (hoje só tags livres).

## 6. Troubleshooting rápido (sintomas vistos no piloto)

| Sintoma | Causa provável | Onde confirmar |
|---|---|---|
| Sem logs da minha chamada | falha **antes** do `doRequest` (lookup/constructor) ou filtro errado | `LogEntry__c` por endpoint + janela de tempo |
| Entrada de negócio sumida | criada após `saveLog()` sem novo `saveLog` | item 3.2 |
| `StringException: Invalid id` | `setRecordId` com número de protocolo/ticket em vez de ID | item 3.3 |
| 401 | token/EC; plataforma refresca sozinha — se persistir, checar principal/secret | corpo da resposta no log |
| 422 rápido (~700ms) | **regra de negócio do parceiro** (ex.: CPF não cadastrado), não bug | `HttpResponseBody__c` → mensagem de negócio |
| 503 HTML / 504 / timeout 120s | gateway/infra HML instável ou fora do ar | demais fluxos com mesmo sintoma confirmam causa externa |
| `LimitException` em Apex anônimo | `AuraHandledException` fora de contexto Aura | testar via UI/LWC ou blocos try/catch com debug |
