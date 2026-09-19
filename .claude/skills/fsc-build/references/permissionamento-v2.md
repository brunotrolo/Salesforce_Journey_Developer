# Permissionamento — padrão de nomenclatura (condensado operacional)

Toda permissão criada por `fsc-data-model-developer` segue este padrão. Se o projeto tiver
um guia de permissionamento próprio, **ele é a autoridade final** e o vocabulário de
produto abaixo deve ser substituído pelo dele; este arquivo é o mínimo acionável para
nomear sem erro.

## Regra de governança (inviolável)

- **Desenvolvimento** (Permission Sets, Custom Permissions, Classes, LWCs): **Label e API Name em inglês.**
- **Visível ao usuário** (Campos, Objetos, ListViews, Relatórios): API Name em inglês, **Label em português.**

## Fórmula base

```
[TipoArtefato]_[TipoProduto]_[Operação]_[Especificidade]_[NivelAcesso]
```

## Os 5 porquês (fluxo de decisão, nesta ordem)

1. **Que artefato?** `PS` (permissão unitária) · `PSG` (agrupamento de PS) · `CP` (chave para uso em código).
2. **Qual produto?** `Cross` para permissão que vale em múltiplos produtos; caso contrário,
   o token do produto **conforme o vocabulário do projeto**. Defina esse vocabulário uma vez
   (ex.: em `docs/sdd/DOMAINS.md`) e reutilize — um token por produto, em inglês, PascalCase,
   nunca inventado na hora. Se o vocabulário ainda não existe, **pare e pergunte ao usuário**:
   nome de produto errado num Permission Set é retrabalho em cascata.
3. **O que faz? (Operação, em EN)** — o verbo/substantivo da operação, em PascalCase:
   `InvoiceCancellation`, `BalanceQuery`, `IdentityValidation`, `CreditApproval`, `Purchase`.
4. **Especificidade? (opcional)** — subgrupo restrito dentro da função (um time ou papel
   específico, no vocabulário do projeto). Omitir quando a permissão vale para qualquer
   operador da função.
5. **Nível de acesso (só estes 3):** `Edit` (leitura+escrita) · `View` (só visualização) · `Admin` (administrativo completo).

## Exemplos canônicos (forma, não vocabulário)

`<Produto>` representa o token do produto do projeto — substitua pelo vocabulário real.

```
PS_<Produto>_InvoiceCancellation_Edit
PS_<Produto>_InvoiceCancellation_View
PS_<Produto>_Admin
PS_Cross_IdentityValidation_View
PS_Cross_CreditApproval_<Time>_Edit
PSG_<Produto>_Sales_FullAccess
CP_Cross_<Recurso>_View
CP_<Produto>_Admin
```

## Regras que mais geram retrabalho

- **Granularidade:** uma permissão por operação — nunca `AcessoTotal` genérico.
- **Custom Permission referencia um Permission Set específico** — declarar o vínculo no `build-report.md`.
- **Teste negativo obrigatório:** ao menos 1 teste com usuário **sem** o PS provando que a restrição funciona (ver `fsc-apex-developer`, Rec 11).
- **Menor privilégio:** conceder apenas o necessário; revisar/remover permissões não utilizadas.

## Checklist de criação (toda permissão, sem exceção)

- [ ] Artefato correto: PS, PSG ou CP?
- [ ] Produto identificado (`Cross` se multi-produto), no vocabulário do projeto?
- [ ] Operação em inglês, em PascalCase?
- [ ] Especificidade aplicável (ou omitida de propósito)?
- [ ] Nível de acesso = `Edit` | `View` | `Admin`?
- [ ] Label **e** API Name em inglês?
- [ ] Sem duplicidade com PS existente?
