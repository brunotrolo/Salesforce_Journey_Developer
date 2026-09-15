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
const ORG_COREEVOL = /(?:^|\s)(?:--target-org|-o)(=\s*|\s+)["']?CoreEvol["']?/;
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
    reason:
      'Deploy/test run sem org explícita usa a org default (desconhecida). Especifique --target-org CoreEvol.',
  },
  {
    test: (c) =>
      sfSegments(c).some(
        (s) =>
          (DEPLOY_START.test(s) || APEX_TEST.test(s)) &&
          ORG_FLAG.test(s) &&
          !ORG_COREEVOL.test(s)
      ),
    reason:
      'Only the sandbox org alias "CoreEvol" is allowed for deploys/test runs; specify --target-org CoreEvol.',
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
