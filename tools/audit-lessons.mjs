// Auditoria estrutural das aulas contra o POP.
// Replica a logica de main.jsx (assignedTrack, lessons, materiais) e sinaliza
// aulas no modulo errado, sem conteudo, com materiais quebrados ou cobertura incompleta.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pop = JSON.parse(await readFile(resolve(root, 'src/data/pop-content.json'), 'utf8'));

// tracks espelhados de courseData.js (fonte da verdade do roteamento)
const courseSrc = await readFile(resolve(root, 'src/courseData.js'), 'utf8');
const tracks = (await import('../src/courseData.js')).tracks;

const blockMap = new Map(pop.blocks.map(b => [b.id, b]));
const tableMap = new Map(pop.tables.map(t => [t.id, t]));

function assignedTrack(section) {
  const n = section.number || '';
  if (/^18\.(10|11|12|13)/.test(n)) return 'm09';
  if (/^(Anexo|Referências)/.test(n)) return 'm14';
  const root = n.includes('.') ? n.split('.')[0] : n;
  for (const t of tracks) { if (t.id === 'm09' || t.id === 'm14') continue; if (t.sections.includes(root) || (!n && t.id === 'm00')) return t.id; }
  return 'm14';
}

const lessons = pop.sections
  .filter(s => s.title && !/sumário navegável|índice de fluxogramas|índice navegável/i.test(s.title))
  .map((s, i) => ({ ...s, trackId: assignedTrack(s), order: i }));

const findings = [];
const flag = (sev, id, number, msg) => findings.push({ sev, id, number: number || '(sem nº)', msg });

// 1. Cobertura: toda seção do POP vira aula ou é intencionalmente excluída (navegação)?
const excluded = pop.sections.filter(s => !(s.title && !/sumário navegável|índice de fluxogramas|índice navegável/i.test(s.title)));
console.log(`Seções no POP: ${pop.sections.length} · Aulas geradas: ${lessons.length} · Excluídas (navegação/sem título): ${excluded.length}`);

// 2. Fallback m14 indevido: caiu no catch-all sem ser Anexo/Referências
for (const l of lessons) {
  if (l.trackId === 'm14') {
    const n = l.number || '';
    if (!/^(Anexo|Referências)/.test(n)) flag('ALERTA', l.id, n, `roteada para M14 (catch-all) sem ser Anexo/Referências — possível módulo errado`);
  }
}

// 3. Coerência número→módulo: o root do número pertence às sections declaradas do módulo?
const trackById = new Map(tracks.map(t => [t.id, t]));
for (const l of lessons) {
  const n = l.number || '';
  if (!n) continue;
  if (/^18\.(10|11|12|13)/.test(n)) continue; // PACUERA tratado à parte
  if (/^(Anexo|Referências)/.test(n)) continue;
  const rootNum = n.includes('.') ? n.split('.')[0] : n;
  const t = trackById.get(l.trackId);
  if (t && !t.sections.includes(rootNum)) {
    flag('ALERTA', l.id, n, `atribuída a ${l.trackId} cujas seções são [${t.sections.join(',')}], mas o número raiz é "${rootNum}"`);
  }
}

// 4. Aulas sem nenhum bloco de conteúdo renderizável (nem texto nem tabela)
for (const l of lessons) {
  const blocks = (l.blockIds || []).map(id => blockMap.get(id)).filter(b => b && !b.navigationOnly);
  const hasText = blocks.some(b => b.type === 'paragraph' && b.paragraph?.text);
  const hasTable = blocks.some(b => b.type === 'table');
  if (!blocks.length) flag('INFO', l.id, l.number, `sem blocos de conteúdo (seção organizacional) — cai no estado vazio da aba fonte`);
  else if (!hasText && !hasTable) flag('ALERTA', l.id, l.number, `tem blocos mas nenhum texto/tabela renderizável`);
}

// 5. Materiais quebrados: bloco de tabela apontando para tableId inexistente
for (const l of lessons) {
  const blocks = (l.blockIds || []).map(id => blockMap.get(id)).filter(Boolean);
  for (const b of blocks) {
    if (b.type === 'table' && !tableMap.has(b.tableId)) flag('ERRO', l.id, l.number, `bloco de tabela referencia tableId inexistente: ${b.tableId}`);
  }
}

// 6. Figuras com caminho ausente
for (const f of pop.figures) {
  if (!f.publicPath) flag('ERRO', f.blockId || f.id, '', `figura sem publicPath: ${f.id}`);
}

// 7. Distribuição por módulo (para inspeção visual de plausibilidade)
const perTrack = {};
for (const l of lessons) perTrack[l.trackId] = (perTrack[l.trackId] || 0) + 1;
console.log('\nAulas por módulo:');
for (const t of tracks) console.log(`  ${t.code} ${t.title.slice(0, 42).padEnd(42)} ${perTrack[t.id] || 0}`);

// Relatório
const bySev = s => findings.filter(f => f.sev === s);
console.log(`\nAchados: ERRO=${bySev('ERRO').length} ALERTA=${bySev('ALERTA').length} INFO=${bySev('INFO').length}`);
for (const sev of ['ERRO', 'ALERTA', 'INFO']) {
  const items = bySev(sev);
  if (!items.length) continue;
  console.log(`\n== ${sev} ==`);
  for (const f of items) console.log(`  [${f.number}] ${f.id}: ${f.msg}`);
}

const critical = bySev('ERRO').length + bySev('ALERTA').length;
console.log(`\n${critical === 0 ? 'OK — nenhum erro estrutural ou de roteamento.' : `Revisar ${critical} item(ns) de ERRO/ALERTA.`}`);
process.exit(0);
