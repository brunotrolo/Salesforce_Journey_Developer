#!/usr/bin/env node
// verify-skills.mjs — valida frontmatter de SKILL.md e de agentes, sem dependências externas.
// Uso: node scripts/verify-skills.mjs
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';

const fails = [];
const warns = [];
let skills = 0;
let agents = 0;

function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return null;
  const fm = {};
  let lastKey = null;
  for (const line of m[1].split('\n')) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const colon = line.indexOf(':');
    if (colon === -1 || /^\s/.test(line)) {
      if (lastKey) fm[lastKey] += ' ' + line.trim(); // continuação multilinha
      continue;
    }
    lastKey = line.slice(0, colon).trim();
    let val = line.slice(colon + 1).trim();
    if (/^(".*"|'.*')$/.test(val)) val = val.slice(1, -1);
    fm[lastKey] = val;
  }
  return fm;
}

function walk(dir, onSkill) {
  let ents;
  try { ents = readdirSync(dir); } catch { return; }
  for (const e of ents) {
    const p = join(dir, e);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) {
      if (['node_modules', '.git', 'dist', '.tmp'].includes(e)) continue;
      walk(p, onSkill);
    } else if (e === 'SKILL.md') onSkill(p);
  }
}

// --- skills: name e description obrigatórios; name == pasta; sem 'tools:' (skills usam allowed-tools) ---
walk('.claude/skills', (p) => {
  skills++;
  const raw = readFileSync(p, 'utf8');
  const fm = parseFrontmatter(raw);
  if (!fm) return fails.push(`${p}: sem frontmatter ---`);
  if (!fm.name) fails.push(`${p}: falta 'name'`);
  else if (fm.name !== basename(dirname(p))) fails.push(`${p}: name "${fm.name}" difere da pasta "${basename(dirname(p))}"`);
  if (!fm.description) fails.push(`${p}: falta 'description'`);
  else if (fm.description.length > 1024) fails.push(`${p}: description >1024 chars (${fm.description.length})`);
  if (/^tools:/m.test(raw.split(/\n---\s*\n/)[0])) fails.push(`${p}: 'tools:' é de subagente — use 'allowed-tools:' em skills`);
});

// --- agentes: name == arquivo; description presente e <=1024; tools presente; sem allowed-tools ---
const agentDir = '.claude/agents';
if (existsSync(agentDir)) {
  for (const f of readdirSync(agentDir)) {
    if (!f.endsWith('.md') || f === 'README.md') continue;
    agents++;
    const p = join(agentDir, f);
    const raw = readFileSync(p, 'utf8');
    const fm = parseFrontmatter(raw);
    if (!fm) { fails.push(`${p}: sem frontmatter ---`); continue; }
    if (fm.name !== basename(f, '.md')) fails.push(`${p}: name "${fm.name}" difere do arquivo`);
    if (!fm.description) fails.push(`${p}: falta 'description'`);
    else if (fm.description.length > 1024) fails.push(`${p}: description >1024 chars (${fm.description.length})`);
    if (!fm.tools) fails.push(`${p}: falta 'tools:'`);
    if ('allowed-tools' in fm) fails.push(`${p}: 'allowed-tools' é de skill — subagentes usam 'tools:'`);
    raw.split('\n').forEach((l, i) => {
      if (l.length > 1500) fails.push(`${p}:${i + 1}: linha com ${l.length} chars (>1500) — quebrar em itens`);
      else if (l.length > 800) warns.push(`${p}:${i + 1}: linha com ${l.length} chars (>800)`);
    });
  }
}

// badge de agentes do README deve bater com o número real (contagens digitadas derivam)
if (existsSync('README.md')) {
  const m = readFileSync('README.md', 'utf8').match(/badge\/agentes-(\d+)-/);
  if (m && Number(m[1]) !== agents) fails.push(`README.md: badge de agentes diz ${m[1]}, mas existem ${agents} em .claude/agents/`);
}

if (warns.length) console.warn(`⚠ ${warns.length} aviso(s):\n` + warns.map((w) => '  - ' + w).join('\n'));
if (fails.length) {
  console.error(`✗ ${fails.length} erro(s) em ${skills} skill(s) e ${agents} agente(s):\n` + fails.map((f) => '  - ' + f).join('\n'));
  process.exit(1);
}
console.log(`✓ ${skills} SKILL.md(s) e ${agents} agente(s) — frontmatter OK`);
