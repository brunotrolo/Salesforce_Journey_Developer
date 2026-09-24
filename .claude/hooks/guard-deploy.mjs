#!/usr/bin/env node
// PreToolUse(Bash) guard: blocks Salesforce CLI commands that would defeat this project's
// evidence gate or its per-domain deploy boundary. Written in Node because Node >= 20 is
// already a hard prerequisite of this repo and behaves identically on Windows, macOS and
// Linux — a .sh hook would not.
//
// Contract (see https://code.claude.com/docs/en/hooks): reads the hook payload as JSON on
// stdin, prints a permissionDecision on stdout, exits 0 either way. Any unexpected failure
// exits 0 silently so a broken guard can never block legitimate work.

// Split a shell line into per-segment strings and drop `#` comments, so a flag
// in one segment (or in a comment) can never authorize a different segment.
// The approval env var only counts when it prefixes the same segment:
// `FSC_HEAVY_TESTS_APPROVED=1 sf ...` (allowed) vs `... && echo FSC_...` (blocked).
function sfSegments(command) {
  return String(command)
    .split(/&&|\|\||[|;&]/)
    .map((s) => s.replace(/#.*$/, '').trim())
    .filter((s) => /(^|\s)sf(\s|$)/i.test(s));
}

const ORG_FLAG = /(?:^|\s)(?:--target-org|-o)(=|\s)/;

// The one org alias this project may deploy to, configured per-project via the
// FSC_TARGET_ORG env var. No alias is hardcoded here on purpose: a clone of this repo
// must not inherit someone else's org, and an unset var stays fail-closed (every
// deploy/test is blocked until it is set).
const TARGET_ORG = String(process.env.FSC_TARGET_ORG || '').trim();
const escapeRe = (v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ORG_TARGET = TARGET_ORG
  ? new RegExp(
      `(?:^|\\s)(?:--target-org|-o)(=\\s*|\\s+)["']?${escapeRe(TARGET_ORG)}["']?`
    )
  : null;
const isTargetOrg = (s) => (ORG_TARGET ? ORG_TARGET.test(s) : false);

const UNSET_REASON =
  'FSC_TARGET_ORG nao esta definida, entao nenhuma org esta autorizada para deploy/teste. ' +
  'Defina-a com o alias da sandbox deste projeto (ex.: export FSC_TARGET_ORG=minha-sandbox) antes de deployar.';
const NO_TEST_RUN = /--test-level[= ]\s*["']?NoTestRun["']?/i;
const APPROVED = /FSC_HEAVY_TESTS_APPROVED=1/;
const DEPLOY_START = /\bproject\s+deploy\s+start\b/i;
const APEX_TEST = /\bapex\s+run\s+test\b/i;

const RULES = [
  {
    // Fail-closed na org: deploy/teste sem --target-org/-o explícito usa a org
    // default (desconhecida) — não passa.
    test: (c) =>
      sfSegments(c).some(
        (s) =>
          (DEPLOY_START.test(s) || APEX_TEST.test(s)) && !ORG_FLAG.test(s)
      ),
    reason: TARGET_ORG
      ? `Deploy/test run sem org explicita usa a org default (desconhecida). Especifique --target-org ${TARGET_ORG}.`
      : UNSET_REASON,
  },
  {
    test: (c) =>
      sfSegments(c).some(
        (s) =>
          (DEPLOY_START.test(s) || APEX_TEST.test(s)) &&
          ORG_FLAG.test(s) &&
          !isTargetOrg(s)
      ),
    reason: TARGET_ORG
      ? `Only the sandbox org alias "${TARGET_ORG}" (FSC_TARGET_ORG) is allowed for deploys/test runs; specify --target-org ${TARGET_ORG}.`
      : UNSET_REASON,
  },
  {
    test: (c) =>
      sfSegments(c).some(
        (s) => DEPLOY_START.test(s) && /--ignore-errors|--ignore-warnings/.test(s)
      ),
    reason:
      'Deploy parcial com --ignore-errors/--ignore-warnings esconde falhas e contradiz o portao de evidencia (fsc-deploy-gate). Rode o deploy sem essas flags e trate a falha real.',
  },
  {
    test: (c) =>
      sfSegments(c).some(
        (s) => DEPLOY_START.test(s) && !NO_TEST_RUN.test(s) && !APPROVED.test(s)
      ),
    reason:
      'Deploy with tests is heavy (including --dry-run validates); only run after explicit approval. Prefix the command with FSC_HEAVY_TESTS_APPROVED=1.',
  },
  {
    test: (c) =>
      sfSegments(c).some((s) => APEX_TEST.test(s) && !APPROVED.test(s)),
    reason:
      'Apex test run is heavy; only run after explicit approval. Prefix the command with FSC_HEAVY_TESTS_APPROVED=1.',
  },
  {
    test: (c) =>
      sfSegments(c).some(
        (s) => /\bcode-analyzer\b/i.test(s) && !/--help/.test(s) && !APPROVED.test(s)
      ),
    reason:
      'Static scan is heavy; only run after explicit approval. Prefix the command with FSC_HEAVY_TESTS_APPROVED=1.',
  },
  {
    test: (c) =>
      sfSegments(c).some(
        (s) =>
          DEPLOY_START.test(s) &&
          /--source-dir[= ]\s*["']?force-app["']?(\s|$)/.test(s)
      ),
    reason:
      'Deploy de force-app inteiro reacopla os dominios, que sao fronteiras de deploy independentes (ver force-app/README.md). Aponte --source-dir para force-app/domains/<dominio>/main/default.',
  },
  {
    // Ciclo rapido de sandbox (assinatura: --test-level NoTestRun) deploya
    // artefato por artefato via --metadata <Tipo>:<Nome> -- nunca --source-dir,
    // que aqui reintroduziria a imprecisao que --metadata existe para evitar.
    // O gate de finalizacao (--test-level RunLocalTests, ver regra acima que
    // exige FSC_HEAVY_TESTS_APPROVED=1 sem NoTestRun) continua livre para usar
    // --source-dir/--manifest: ali a closure de dependencias e proposital
    // (fsc-deploy-gate.md, Rec 4) -- um caso diferente deste.
    test: (c) =>
      sfSegments(c).some(
        (s) =>
          DEPLOY_START.test(s) &&
          NO_TEST_RUN.test(s) &&
          /--source-dir\b/.test(s)
      ),
    reason:
      'Deploy de ciclo rapido (--test-level NoTestRun) deve escopar por artefato exato: --metadata <Tipo>:<Nome> (multiplos artefatos: --metadata Tipo1:Nome1,Tipo2:Nome2), nunca --source-dir. Ex.: --metadata ApexClass:LogEntryEventBuilder.',
  },
  {
    test: (c) => /\bsf\b[^|;&]*\b(org\s+delete|data\s+delete)\b/.test(c),
    reason:
      'Comando destrutivo de org/dados nao passa por um agente de build. Se realmente for necessario, rode manualmente no seu terminal, fora do Claude Code.',
  },
];

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    })
  );
}

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (raw += chunk));
process.stdin.on('end', () => {
  try {
    const command = JSON.parse(raw)?.tool_input?.command;
    if (typeof command === 'string') {
      const hit = RULES.find((rule) => rule.test(command));
      if (hit) deny(hit.reason);
    }
  } catch {
    // Malformed payload: stay out of the way rather than blocking on a guard bug.
  }
  process.exit(0);
});
