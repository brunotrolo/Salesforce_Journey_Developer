#!/usr/bin/env node
// PreToolUse(Write|Edit) guard for Apex test classes (Rec 25 — self-contained tests).
// Asks for confirmation when a *Test.cls / *_tst.cls is written with (a) a literal SOQL query on an
// org-configuration object filtered by Name/DeveloperName, or (b) a call to a static method of
// another *Test class. Those pass locally and break a deploy to an environment where the row
// or the other test's data does not exist. Exits 0 always; any failure stays silent.
const CONFIG_OBJECTS = 'RecordType|Profile|PermissionSet|PermissionSetGroup|Queue|Group|UserRole|BusinessHours|Organization';
const SOQL = new RegExp(`\\bFROM\\s+(?:${CONFIG_OBJECTS})\\b[^\\]]*\\b(?:Name|DeveloperName)\\s*=`, 'i');
const OTHER_TEST_CALL = /\b([A-Z]\w*(?:Test|_tst))\.[a-z]\w*\s*\(/;

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  try {
    const { tool_input: ti } = JSON.parse(raw);
    const path = String(ti?.file_path || '');
    if (!/(Test|_tst)\.cls$/.test(path)) return process.exit(0);
    const text = String(ti.content ?? ti.new_string ?? '');
    const self = path.split(/[\\/]/).pop().replace(/\.cls$/, '');
    const other = text.match(OTHER_TEST_CALL);
    let reason = null;
    if (SOQL.test(text)) {
      reason = 'Test class queries an org-configuration object by Name/DeveloperName: that row may not exist in the target environment. Use describe (e.g. Schema.SObjectType.<Object>.getRecordTypeInfosByDeveloperName()) or create your own data.';
    } else if (other && other[1] !== self && !/^(Assert|Test|System)$/.test(other[1])) {
      reason = `Test class calls a static method of another test class (${other[1]}): each test must create its own data (@TestSetup / dedicated factory).`;
    }
    if (reason) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: reason },
      }));
    }
  } catch { /* stay out of the way */ }
  process.exit(0);
});
