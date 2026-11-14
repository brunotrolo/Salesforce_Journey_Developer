---
paths: force-app/**/objects/**, force-app/**/permissionsets/**, force-app/**/flexipages/**, force-app/**/flows/**, force-app/**/namedCredentials/**, force-app/**/externalCredentials/**, force-app/**/platformEvents/**, force-app/**/queues/**, force-app/**/assignmentRules/**, force-app/**/escalationRules/**, force-app/**/entitlementProcesses/**, force-app/**/applications/**, force-app/**/quickActions/**, force-app/**/layouts/**, force-app/**/settings/**
---

# Declarative and configuration metadata

Full authoring guidance lives in `sf-data-model-developer`, `sf-integration-developer`,
`sf-declarative-developer`, `sf-automation-developer` and `sf-service-config-developer` — this file is only what must
hold for any metadata file touched here.

- **SFDX source format shapes the path.** A custom field is its own file at
  `objects/<Object>/fields/<Field>.field-meta.xml`; there is no top-level `fields/` folder.
  Record Types live inside the object's own `-meta.xml`.
- **Access is part of the deliverable.** A screen that deploys but whose intended profile
  cannot open it is not done — this failure mode produces no error at deploy time. Every new
  field gets field-level security in the capability's permission set, named so its scope is
  obvious from the name.
- **Never hardcode an endpoint or secret** in metadata or Apex — that is what the Named
  Credential exists to prevent. Timeouts come from `architecture.md` per system, not one
  default copied across all of them.
- **A Platform Event field is a forever-compatibility commitment** once another domain
  subscribes. Author exactly the fields the cross-domain contract in `architecture.md`
  names, no more.
- **Flow deploys as Draft and is never activated blind.** Activate only after the gate
  validates it and, for anything record-triggered or scheduled, after the business confirms
  the behavior. Every element that can fail (DML, callout, get-records) needs a fault path.
- **One active Assignment Rule per object.** Deploying a second active rule silently
  replaces the first; confirm with the user before activating, and let the gate verify the
  final active state.
- **Entitlement Process versions are immutable once in use.** A change is a new version,
  not an edit, and activating it changes live SLA behavior — flag it for confirmation.
- **Queues must exist before anything references them** (assignment rules, routing
  configurations, Flow assignment) — author and deploy them first.
