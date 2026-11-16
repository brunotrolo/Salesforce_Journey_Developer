import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const hook = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'guard-test-content.mjs');
const decide = (file_path, content) => {
  const r = spawnSync('node', [hook], { input: JSON.stringify({ tool_input: { file_path, content } }), encoding: 'utf8' });
  assert.equal(r.status, 0);
  return r.stdout ? JSON.parse(r.stdout).hookSpecificOutput.permissionDecision : 'allow';
};

test('SOQL por nome em RecordType pede confirmação', () =>
  assert.equal(decide('x/FooTest.cls', "Id r = [SELECT Id FROM RecordType WHERE DeveloperName = 'X' LIMIT 1].Id;"), 'ask'));
test('SOQL por nome em Queue pede confirmação', () =>
  assert.equal(decide('x/Foo_tst.cls', "Group g = [SELECT Id FROM Group WHERE Name = 'Q' AND Type='Queue'];"), 'ask'));
test('chamada a método estático de outra classe de teste pede confirmação', () =>
  assert.equal(decide('x/FooTest.cls', 'BarTest.createData();'), 'ask'));
test('describe e factory próprias passam', () =>
  assert.equal(decide('x/FooTest.cls', 'Id r = Schema.SObjectType.Case.getRecordTypeInfosByDeveloperName().get(\'X\').getRecordTypeId(); insert new Account(Name=\'a\');'), 'allow'));
test('arquivo que não é classe de teste é ignorado', () =>
  assert.equal(decide('x/Foo.cls', "[SELECT Id FROM RecordType WHERE DeveloperName = 'X']"), 'allow'));
