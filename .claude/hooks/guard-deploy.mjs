#!/usr/bin/env node
// PreToolUse(Bash) guard: blocks Salesforce CLI commands that would defeat this project's
// evidence gate or its per-domain deploy boundary. Written in Node because Node >= 20 is
// already a hard prerequisite of this repo and behaves identically on Windows, macOS and
// Linux — a .sh hook would not.
//
// Contract (see https://code.claude.com/docs/en/hooks): reads the hook payload as JSON on
// stdin, prints a permissionDecision on stdout, exits 0 either way. Any unexpected failure
// exits 0 silently so a broken guard can never block legitimate work.

const RULES = [
  {
    test: (c) => /\bsf\b[^|;&]*\bproject\s+deploy\b/.test(c) && /--ignore-errors|--ignore-warnings/.test(c),
    reason:
      'Deploy parcial com --ignore-errors/--ignore-warnings esconde falhas e contradiz o portao de evidencia (fsc-deploy-gate). Rode o deploy sem essas flags e trate a falha real.',
  },
  {
    test: (c) =>
      /\bsf\b[^|;&]*\bproject\s+deploy\s+start\b/.test(c) &&
      /--test-level[= ]\s*NoTestRun/i.test(c) &&
      !/--dry-run/.test(c),
    reason:
      'Deploy real com --test-level NoTestRun pula os testes que o fsc-deploy-gate exige como evidencia. Use RunLocalTests (ou RunSpecifiedTests com justificativa no build-report.md).',
  },
  {
    test: (c) =>
      /\bsf\b[^|;&]*\bproject\s+deploy\b/.test(c) &&
      /--source-dir[= ]\s*["']?force-app["']?(\s|$)/.test(c),
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
