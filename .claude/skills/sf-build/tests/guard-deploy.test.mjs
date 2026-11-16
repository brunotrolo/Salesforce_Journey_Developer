// Testes do guard-deploy.mjs — rode: node --test .claude/skills/sf-build/tests/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const hook = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'guard-deploy.mjs');

function run(command, env = { SF_TARGET_ORG: 'sbx' }) {
  const r = spawnSync('node', [hook], {
    input: JSON.stringify({ tool_input: { command } }),
    env: { PATH: process.env.PATH, ...env },
    encoding: 'utf8',
  });
  assert.equal(r.status, 0, 'o hook sempre sai 0');
  return r.stdout ? JSON.parse(r.stdout).hookSpecificOutput.permissionDecision : 'allow';
}

const FAST = 'sf project deploy start --target-org sbx --metadata ApexClass:Foo --test-level NoTestRun';

test('fast deploy com --metadata e a org correta passa', () => assert.equal(run(FAST), 'allow'));
test('SF_TARGET_ORG ausente bloqueia (fail-closed)', () => assert.equal(run(FAST, {}), 'deny'));
test('org diferente da configurada bloqueia', () =>
  assert.equal(run(FAST.replace('sbx', 'prod')), 'deny'));
test('deploy sem --target-org bloqueia', () =>
  assert.equal(run('sf project deploy start --metadata ApexClass:Foo --test-level NoTestRun'), 'deny'));
test('--ignore-errors bloqueia', () =>
  assert.equal(run(FAST + ' --ignore-errors'), 'deny'));
test('--source-dir com NoTestRun bloqueia', () =>
  assert.equal(run('sf project deploy start --target-org sbx --source-dir force-app/domains/x --test-level NoTestRun'), 'deny'));
test('--source-dir force-app inteiro bloqueia', () =>
  assert.equal(
    run('SF_HEAVY_TESTS_APPROVED=1 sf project deploy start --target-org sbx --source-dir force-app --test-level RunLocalTests'),
    'deny'
  ));
test('deploy com testes sem aprovação bloqueia', () =>
  assert.equal(run('sf project deploy start --target-org sbx --source-dir force-app/domains/x --test-level RunLocalTests'), 'deny'));
test('finalização aprovada no mesmo segmento passa', () =>
  assert.equal(
    run('SF_HEAVY_TESTS_APPROVED=1 sf project deploy start --target-org sbx --source-dir force-app/domains/x --test-level RunLocalTests'),
    'allow'
  ));
test('aprovação em outro segmento não vale', () =>
  assert.equal(
    run('echo SF_HEAVY_TESTS_APPROVED=1 && sf project deploy start --target-org sbx --source-dir force-app/domains/x --test-level RunLocalTests'),
    'deny'
  ));
test('apex run test sem aprovação bloqueia; com aprovação passa', () => {
  assert.equal(run('sf apex run test --target-org sbx'), 'deny');
  assert.equal(run('SF_HEAVY_TESTS_APPROVED=1 sf apex run test --target-org sbx'), 'allow');
});
test('org delete e data delete bloqueiam', () => {
  assert.equal(run('sf org delete scratch --target-org sbx'), 'deny');
  assert.equal(run('sf data delete record --target-org sbx'), 'deny');
});
test('comando não-sf passa; payload inválido não quebra', () => {
  assert.equal(run('ls -la'), 'allow');
  const r = spawnSync('node', [hook], { input: 'not json', encoding: 'utf8' });
  assert.equal(r.status, 0);
});
