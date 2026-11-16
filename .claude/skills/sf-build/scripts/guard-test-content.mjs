#!/usr/bin/env node
// PreToolUse(Write|Edit) guard for Apex test classes (Rec 25 — self-contained tests).
// Asks for confirmation when a *Test.cls / *_tst.cls is written with (a) a literal SOQL query on an
// org-configuration object filtered by Name/DeveloperName, or (b) a call to a static method of
// another *Test class. Those pass locally and break a deploy to an environment where the row
// or the other test's data does not exist. Exits 0 always; any failure stays silent.
const CONFIG_OBJECTS = 'RecordType|Profile|PermissionSet|PermissionSetGroup|Queue|Group|UserRole|BusinessHours|Organization';
const SOQL = new RegExp(`\\bFROM\\s+(?:${CONFIG_OBJECTS})\\b[^\\]]*\\b(?:Name|DeveloperName)\\s*=`, 'i');
const OTHER_TEST_CALL = /\b([A-Z]\w*(?:Test|_tst))\.[a-z]\w*\s*\(/;

/** Decisão pura (usada pelo hook original e pela política do Odin): null = segue; senão, pedir confirmação. */
export function decidirConteudoTeste(ti = {}) {
  const path = String(ti?.file_path || '');
  if (!/(Test|_tst)\.cls$/.test(path)) return null;
  const text = String(ti.content ?? ti.new_string ?? '');
  const self = path.split(/[\\/]/).pop().replace(/\.cls$/, '');
  const other = text.match(OTHER_TEST_CALL);
  if (SOQL.test(text)) {
    return { decisao: 'perguntar', motivo: 'Test class queries an org-configuration object by Name/DeveloperName: that row may not exist in the target environment. Use describe (e.g. Schema.SObjectType.<Object>.getRecordTypeInfosByDeveloperName()) or create your own data.' };
  }
  if (other && other[1] !== self && !/^(Assert|Test|System)$/.test(other[1])) {
    return { decisao: 'perguntar', motivo: `Test class calls a static method of another test class (${other[1]}): each test must create its own data (@TestSetup / dedicated factory).` };
  }
  return null;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (c) => (raw += c));
  process.stdin.on('end', () => {
    try {
      const d = decidirConteudoTeste(JSON.parse(raw).tool_input);
      if (d) process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: d.motivo } }));
    } catch { /* stay out of the way */ }
    process.exit(0);
  });
}
