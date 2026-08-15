// Auditoria estrutural das aulas contra o POP.
// Usa o mesmo roteamento da aplicacao (src/lessons.js) e sinaliza
// aulas no modulo errado, sem conteudo, com materiais quebrados ou cobertura incompleta.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pop = JSON.parse(await readFile(resolve(root, 'src/data/pop-content.json'), 'utf8'));

// tracks espelhados de courseData.js (fonte da verdade do roteamento)
const courseSrc = await readFile(resolve(root, 'src/courseData.js'), 'utf8');
const { tracks, trackGroups } = await import('../src/courseData.js');
const { derivarAulas } = await import('../src/lessons.js');

const blockMap = new Map(pop.blocks.map(b => [b.id, b]));
const tableMap = new Map(pop.tables.map(t => [t.id, t]));

// Roteamento e derivacao vem de src/lessons.js: a copia local aqui envelheceu
// e passou a acusar doze alertas inexistentes sobre m15 e m16.
const { lessons } = derivarAulas(pop, tracks);

const findings = [];
const flag = (sev, id, number, msg) => findings.push({ sev, id, number: number || '(sem nº)', msg });

// 1. Cobertura: toda seção do POP vira aula ou é intencionalmente excluída (navegação)?
const lessonIds = new Set(lessons.map((lesson) => lesson.id));
const excluded = pop.sections.filter((section) => !lessonIds.has(section.id));
console.log(`Seções no POP: ${pop.sections.length} · Aulas geradas: ${lessons.length} · Excluídas (navegação/sem título): ${excluded.length}`);

// 2 e 3. Coerencia do roteamento. A checagem antiga exigia que o numero RAIZ
// pertencesse as secoes declaradas do modulo, regra que deixou de valer quando
// o roteamento passou a usar o prefixo mais especifico: 20.6.4.1 vai para m16
// (secao "20.6") e o raiz "20" e de M11. Agora a pergunta e outra: a atribuicao
// e explicavel por alguma regra declarada, ou caiu no catch-all sem explicacao?
const trackById = new Map(tracks.map(t => [t.id, t]));
const secById = new Map(pop.sections.map(s => [s.id, s]));
const dentroDeAnexo = (sec) => {
  let p = sec.parentId ? secById.get(sec.parentId) : null, g = 0;
  while (p && g++ < 8) {
    if (/^(Anexo|Referências)/i.test((p.number || '').trim())) return true;
    p = p.parentId ? secById.get(p.parentId) : null;
  }
  return false;
};
for (const l of lessons) {
  const n = (l.number || '').trim();
  const t = trackById.get(l.trackId);
  if (!t) { flag('ERRO', l.id, n, `trilha inexistente: ${l.trackId}`); continue; }
  if (/^(Anexo|Referências|F.d)/i.test(n) || dentroDeAnexo(l)) continue;   // anexo e seus filhos
  if (!n) continue;                                                          // sem numero: herdou da mae
  const casa = (t.sections || []).some(sec => n === sec || n.startsWith(sec + '.'));
  if (!casa) flag('ALERTA', l.id, n, `atribuida a ${l.trackId} [${(t.sections||[]).join(',')}] sem prefixo que explique o numero`);
}

// 3b. Nenhum modulo pode ficar sem aula: m15 e m16 ja ficaram vazios sem que
// ninguem percebesse, porque a auditoria olhava so o roteamento antigo.
for (const t of tracks) {
  if (!lessons.some(l => l.trackId === t.id)) flag('ERRO', t.id, '', `modulo ${t.code} sem nenhuma aula`);
}

// 3c. O rotulo do modulo tem de acompanhar a ORDEM do percurso. O numero existe
// para dizer em que ponto o modulo esta; quando ele contradiz a sequencia, a
// tela mostra M11, M15, M16, M12, e quem le acha que a plataforma se perdeu.
const ordemGrupos = trackGroups.flatMap((g) => g.ids);
if (JSON.stringify(tracks.map((t) => t.id)) !== JSON.stringify(ordemGrupos)) {
  flag('ERRO', 'tracks', '', 'a ordem do array tracks difere da ordem de trackGroups');
}
tracks.forEach((t, i) => {
  const esperado = 'M' + String(i).padStart(2, '0');
  if (t.code !== esperado) flag('ERRO', t.id, '', `rotulo ${t.code} na posicao ${i} do percurso, deveria ser ${esperado}`);
});

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

const blockingCount = bySev('ERRO').length + bySev('ALERTA').length;
console.log(`\n${blockingCount === 0 ? 'OK — nenhum erro estrutural ou de roteamento.' : `Revisar ${blockingCount} item(ns) de ERRO/ALERTA.`}`);
process.exit(blockingCount === 0 ? 0 : 1);
