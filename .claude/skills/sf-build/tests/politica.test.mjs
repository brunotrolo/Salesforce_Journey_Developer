import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.SF_TARGET_ORG = 'sbx'; // lido na carga do guard: define antes do import
const { default: politica } = await import('../scripts/politicas/sf-journey-developer.mjs');
const bash = (command) => politica({ tool_name: 'Bash', tool_input: { command } });

test('política do Odin: deploy rápido escopado na org alvo passa', () => {
  assert.equal(bash('sf project deploy start --target-org sbx --metadata ApexClass:Foo --test-level NoTestRun'), null);
});
test('política do Odin: org errada, sem org, pasta inteira e flags que escondem falha são negados', () => {
  for (const c of ['sf project deploy start --target-org prod --metadata ApexClass:Foo --test-level NoTestRun', 'sf project deploy start --metadata ApexClass:Foo --test-level NoTestRun', 'sf project deploy start --target-org sbx --source-dir force-app --test-level NoTestRun', 'sf project deploy start --target-org sbx --metadata ApexClass:Foo --ignore-errors --test-level NoTestRun'])
    assert.equal(bash(c)?.decisao, 'negar', c);
});
test('política do Odin: teste pesado sem aprovação é negado e com SF_HEAVY_TESTS_APPROVED=1 passa', () => {
  assert.equal(bash('sf apex run test --target-org sbx')?.decisao, 'negar');
  assert.equal(bash('SF_HEAVY_TESTS_APPROVED=1 sf apex run test --target-org sbx'), null);
});
test('política do Odin: classe de teste que consulta RecordType por nome ou chama outro teste pede confirmação', () => {
  const a = politica({ tool_name: 'Write', tool_input: { file_path: 'force-app/classes/FooTest.cls', content: 'List<RecordType> r = [SELECT Id FROM RecordType WHERE DeveloperName = \'X\'];' } });
  assert.equal(a?.decisao, 'perguntar');
  const b = politica({ tool_name: 'Edit', tool_input: { file_path: 'C:\\proj\\classes\\FooTest.cls', new_string: 'BarTest.setup();' } });
  assert.equal(b?.decisao, 'perguntar');
  assert.equal(politica({ tool_name: 'Write', tool_input: { file_path: 'force-app/classes/Foo.cls', content: 'BarTest.x();' } }), null);
});
test('política do Odin: outras ferramentas e entrada vazia passam', () => { assert.equal(politica({ tool_name: 'Read', tool_input: {} }), null); assert.equal(politica(undefined), null); });
