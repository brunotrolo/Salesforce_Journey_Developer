---
paths: force-app/**/lwc/**, force-app/**/messageChannels/**
---

# LWC in this project

Full authoring guidance lives in `fsc-lwc-developer` and the skills it names — this file is
only what must hold for any LWC file touched here, by any agent.

- **The prototype is the design source of truth, not a draft to re-flatten.** Carry over its
  componentization: page component orchestrates, each distinct card/modal/list is its own
  component, `@api` props down, custom events up.
- **The prototype proved the screen, never the data.** Real `@wire`/imperative Apex calls,
  a real error branch, loading/skeleton states, and empty states driven by real query
  results — a happy path copied from fixture arrays is not done.
- **`@api` and custom events are parent↔child only.** Sibling components that don't own each
  other communicate through a Lightning Message Service channel
  (`messageChannels/<Channel>.messageChannel-meta.xml`, `isExposed=true`), with one named
  message per interaction, named for the business event (`PRODUCT_SELECTED`), not generically.
- Component hierarchy, in order: Lightning Base Component → verified SLDS blueprint →
  styling hooks → custom CSS. Never invent a hook, class, or icon name — verify it.
- Jest covers the wire success path, the wire error path, and user interaction. Mock
  `lightning/messageService` explicitly and assert the exact message published.
- Before handing off: SLDS linter, `experience-lwc-security-validate` (LWS),
  `experience-accessibility-validate` (WCAG), Jest green. The prototype's SLDS scorecard
  checks attribute presence only — it is not an accessibility result.
