#!/usr/bin/env node
// pre-finalizacao-check.mjs — check de ~30s antes de pedir a finalização.
// Pega as 3 causas mais comuns de gate falhando de primeira, sem rodar nada pesado:
//   1) classe Apex sem *Test.cls (cobertura vai platinar no gate);
//   2) manifest vazio ou com wildcard <members>*</members> (deployaria além da capacidade);
//   3) capacidade ausente no BACKLOG ou sem status "pronto para build" (ou posterior).
//
// Uso:
//   node pre-finalizacao-check.mjs --root <metadata-root>
//     [--manifest manifest/package-<cap>.xml]
//     [--backlog docs/sdd/BACKLOG.md --domain <dominio> --slug <NNN-slug>]
//
// Sai com exit 1 se algum check FAIL; WARN não reprova. Só Node stdlib.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

function arg(name) {
  const i = process.argv.indexOf(name);
  return i > -1 && i + 1 < process.argv.length ? process.argv[i + 1] : null;
}

const root = arg('--root');
const manifest = arg('--manifest');
const backlog = arg('--backlog');
const slug = arg('--slug');
const domain = arg('--domain');

let fails = 0;
let warns = 0;
const pass = (msg) => console.log(`[PASS] ${msg}`);
const fail = (msg) => { fails++; console.log(`[FAIL] ${msg}`); };
const warn = (msg) => { warns++; console.log(`[WARN] ${msg}`); };

if (!root) {
  console.error('Uso: node pre-finalizacao-check.mjs --root <metadata-root> [--manifest <xml>] [--backlog <md> --slug <NNN-slug>]');
  process.exit(2);
}

// --- Check 1: teste nasce junto ---
const classesDir = join(root, 'classes');
if (!existsSync(classesDir) || !statSync(classesDir).isDirectory()) {
  fail(`pasta classes/ não encontrada em ${root} — nada de Apex para finalizar?`);
} else {
  const files = readdirSync(classesDir).filter((f) => f.endsWith('.cls'));
  const prod = files.filter((f) => !/(Test|_tst)\.cls$/.test(f));
  if (prod.length === 0) {
    pass('nenhuma classe de produção em classes/ — check de teste não se aplica.');
  } else {
    const missing = prod.filter((f) => {
      const base = f.replace(/\.cls$/, '');
      return !files.includes(`${base}Test.cls`) && !files.includes(`${base}_tst.cls`);
    });
    if (missing.length === 0) pass(`${prod.length} classe(s) de produção, todas com *Test.cls/*_tst.cls.`);
    else fail(`classe(s) sem teste: ${missing.join(', ')} — criar antes da finalização.`);
  }
}

// --- Check 2: manifest sem armadilhas ---
if (manifest) {
  if (!existsSync(manifest)) {
    fail(`manifest não encontrado: ${manifest}`);
  } else {
    const xml = readFileSync(manifest, 'utf8');
    // Membros fora de comentário: dependências ficam como header-comment, nunca em <members>.
    const body = xml.replace(/<!--[\s\S]*?-->/g, '');
    if (!/<types>/.test(body)) fail(`manifest ${manifest} sem nenhum <types> — vazio?`);
    else if (/<members>\s*\*\s*<\/members>/.test(body)) fail(`manifest ${manifest} usa wildcard <members>*</members> — listar só os artefatos da capacidade (nunca o domínio inteiro).`);
    else pass(`manifest ${manifest} escopado (sem wildcard).`);
  }
} else {
  warn('sem --manifest: pulando check de escopo do manifest.');
}

// --- Check 3: status da capacidade no BACKLOG ---
// Formato do BACKLOG do Designer: seção "## `<dominio>/`" e linhas "| NNN | ... | <status> |".
const READY = ['pronto para build', 'em build', 'concluído'];
if (backlog && slug) {
  if (!existsSync(backlog)) {
    fail(`BACKLOG não encontrado: ${backlog}`);
  } else {
    const id = (slug.match(/^(\d+)/) || [])[1];
    const md = readFileSync(backlog, 'utf8');
    let section = md;
    if (domain) {
      const m = md.split(/^## /m).find((sec) => sec.startsWith('`' + domain + '/`') || sec.startsWith(domain));
      if (!m) fail(`domínio "${domain}" não encontrado em ${backlog}.`);
      else section = m;
    }
    const row = id && section.split('\n').find((l) => new RegExp(`^\\|\\s*${id}\\s*\\|`).test(l));
    if (!row) fail(`capacidade "${slug}"${domain ? ` do domínio ${domain}` : ''} sem linha em ${backlog}.`);
    else {
      const status = row.split('|').map((c) => c.trim()).filter(Boolean).pop().toLowerCase();
      if (READY.includes(status)) pass(`capacidade ${domain || ''}/${slug}: status "${status}".`);
      else fail(`capacidade ${domain || ''}/${slug}: status "${status}" — esperado ao menos "pronto para build".`);
    }
    if (!domain) warn('sem --domain: a linha foi procurada no BACKLOG inteiro (IDs repetem entre domínios).');
  }
} else if (backlog || slug) {
  warn('informe --backlog e --slug juntos para o check de BACKLOG.');
} else {
  warn('sem --backlog/--slug: pulando check de BACKLOG.');
}

console.log(`\nResumo: ${fails} FAIL, ${warns} WARN.`);
process.exit(fails > 0 ? 1 : 0);
