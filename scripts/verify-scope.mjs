#!/usr/bin/env node
// verify-scope.mjs — falha se conteúdo AUTORADO reintroduzir escopo fora de Service Cloud
// padrão ou identificadores reais. Ignora skills vendorizadas, LESSONS.md (log append-only),
// este script a seção "Atualizando" dos READMEs e linhas marcadas com `scope-allow` (nota de limpeza de nomes antigos).
// Uso: node scripts/verify-scope.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const FORBIDDEN = [
  /\bfsc\b/i, /financial services/i, /omni ?studio/i, /omniscript/i, /flexcard/i,
  /household/i, /person account/i, /financial account/i, /decisionmatrix/i,
  /calculationmatrix/i, /webserviceendpoint/i, /\bARC\b/, /life event/i, /vlocity/i,
  /resgate/i, /empresa_cross/i, /piloto/i, /ProtocolHumanAttendance/, /CaseDataFactory/,
  /TransactionId__c/, /\bFSC_/,
];
const VENDORED = ['.claude/skills/salesforce', '.claude/skills/agent-skills', '.claude/skills/mattpocock', '.claude/skills/salesforce-ux'];
const SKIP_FILES = ['.claude/skills/sf-build/evaluations/evals.json', '.claude/LESSONS.md', 'scripts/verify-scope.mjs', 'package-lock.json'];
const SKIP_DIRS = ['.git', 'node_modules', 'dist', '.tmp'];
const hits = [];

function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const rel = relative('.', p).split('\\').join('/');
    if (SKIP_DIRS.includes(e) || VENDORED.includes(rel) || SKIP_FILES.includes(rel)) continue;
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (/\.(md|mjs|js|json|yml|yaml|xml|txt)$/.test(e)) {
      let allow = false; // seção "Atualizando": cita os nomes antigos de propósito, para a limpeza
      readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
        if (/^#{1,6}\s/.test(line)) allow = /atualizando/i.test(line);
        if (allow || /scope-allow/.test(line)) return;
        const re = FORBIDDEN.find((r) => r.test(line));
        if (re) hits.push(`${rel}:${i + 1}: ${re} → ${line.trim().slice(0, 100)}`);
      });
    }
  }
}
walk('.');
if (hits.length) {
  console.error(`✗ ${hits.length} ocorrência(s) fora do escopo Service Cloud:\n` + hits.map((h) => '  - ' + h).join('\n'));
  process.exit(1);
}
console.log('✓ escopo Service Cloud: nenhuma ocorrência proibida no conteúdo autorado');
