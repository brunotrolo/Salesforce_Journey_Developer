---
paths: force-app/**/classes/**, force-app/**/triggers/**
---

# Apex in this project

Full authoring guidance lives in `fsc-apex-developer` and the skills it names — this file
is only what must hold for any Apex file touched here, by any agent.

- **Every class ships with its test class.** Apex without a paired test is unfinished, not
  a deliverable. Cover the positive, negative/exception, bulk, and callout/async paths —
  not a coverage number reached by accident.
- 75% org-wide is Salesforce's deploy minimum, not the target. A class this capability adds
  is covered on its own merits, not by riding the org-wide average.
- `with sharing` by default; CRUD/FLS-aware for any DML or query over user-supplied context.
- Bulkified always — no SOQL or DML inside a loop.
- **Never hardcode an endpoint or secret.** Callouts go through the Named Credential
  `fsc-integration-developer` created. Test every callout path with
  `Test.setMock(HttpCalloutMock.class, ...)`; a live callout in a test context fails outright.
- Follow the Service–Selector–Domain layering and the trigger-handler pattern already
  present in this domain's `classes/`. Extend an existing selector/service before adding a
  near-duplicate.
- Run `dx-code-analyzer-run` over the files you touched before handing off. Fix every
  High/Critical finding or write down why it is a false positive — never silently suppress.
