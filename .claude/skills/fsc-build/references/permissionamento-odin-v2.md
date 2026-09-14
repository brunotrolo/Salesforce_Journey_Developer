# Permissionamento — Padrão ODIN (Guia v2, condensado operacional)

Toda permissão criada por `fsc-data-model-developer` segue este padrão. Origem: **Guia de
Permissionamento - Projeto ODIN - v2** (Salesforce PortoBank). O guia completo é a autoridade
final; abaixo está o mínimo acionável para nomear sem erro.

## Regra de governança (inviolável)

- **Desenvolvimento** (Permission Sets, Custom Permissions, Classes, LWCs): **Label e API Name em inglês.**
- **Visível ao usuário** (Campos, Objetos, ListViews, Relatórios): API Name em inglês, **Label em português.**

## Fórmula base

```
[TipoArtefato]_[TipoProduto]_[Operação]_[Especificidade]_[NivelAcesso]
```

## Os 5 porquês (fluxo de decisão, nesta ordem)

1. **Que artefato?** `PS` (permissão unitária) · `PSG` (agrupamento de PS) · `CP` (chave para uso em código).
2. **Qual produto?** `Cross` (múltiplos) · `PFDigitalAccount` · `PJDigitalAccount` · `PFCard` · `PJCard` · `Consortium` · `InvestBank`.
3. **O que faz? (Operação, em EN)** — ex.: `InvoiceCancellation`, `CardCancellation`, `Purchase`, `CPFQuery`, `CreditApproval`, `IdentityValidation`, `BalanceQuery`, `CardReactivation`.
4. **Especificidade? (opcional)** — subgrupo restrito: `BackofficeTeam`, `SupervisionGroup`, `ComplianceTeam`. Omitir quando a permissão vale para qualquer operador da função.
5. **Nível de acesso (só estes 3):** `Edit` (leitura+escrita) · `View` (só visualização) · `Admin` (administrativo completo).

## Exemplos canônicos

```
PS_PFCard_InvoiceCancellation_Edit
PS_PFCard_InvoiceCancellation_View
PS_PFCard_Admin
PS_Cross_CPFQuery_View
PS_Cross_CreditApproval_BackofficeTeam_Edit
PS_Cross_IdentityValidation_Edit
PSG_PFCard_Sales_FullAccess
CP_Cross_AlertContainer1_View
CP_PFCard_Admin
```

## Regras que mais geram retrabalho

- **Granularidade:** uma permissão por operação — nunca `AcessoTotal` genérico.
- **Custom Permission referencia um Permission Set específico** — declarar o vínculo no `build-report.md`.
- **Teste negativo obrigatório:** ao menos 1 teste com usuário **sem** o PS provando que a restrição funciona (ver `fsc-apex-developer`, Rec 11).
- **Menor privilégio:** conceder apenas o necessário; revisar/remover permissões não utilizadas.

## Checklist de criação (toda permissão, sem exceção)

- [ ] Artefato correto: PS, PSG ou CP?
- [ ] Produto identificado (`Cross` se multi-produto)?
- [ ] Operação em inglês, no vocabulário acima?
- [ ] Especificidade aplicável (ou omitida de propósito)?
- [ ] Nível de acesso = `Edit` | `View` | `Admin`?
- [ ] Label **e** API Name em inglês?
- [ ] Sem duplicidade com PS existente?
