// Roteamento das secoes do POP para os modulos, em um lugar so.
//
// Por que este arquivo existe. A regra vivia dentro de main.jsx e a auditoria
// mantinha uma copia propria que envelheceu: ela nao conhecia m15 nem m16 e
// passou a acusar doze alertas que nao existiam na aplicacao. Ferramenta que
// mente treina a pessoa a ignorar a ferramenta, entao a regra agora e unica e
// as duas pontas importam daqui.

// Defesa adicional ao marcador navigationOnly. A expressão é ancorada para
// não transformar em navegação uma seção substantiva como a 26.3
// ("Títulos, numeração, sumário e navegação").
const TITULO_EXCLUSIVAMENTE_NAVEGACIONAL =
  /^(?:sumário navegável|índice de fluxogramas|índice navegável de quadros e tabelas|índice de anexos|quadros|tabelas)$/i;

export function isLessonSection(section) {
  return Boolean(
    section?.title
      && !section.navigationOnly
      // Alguns títulos do Word são apenas contêineres de subseções. Exibi-los
      // como aula cria uma tela sem conteúdo e promete mídia que não existe.
      && Array.isArray(section.blockIds)
      && section.blockIds.length > 0
      && !TITULO_EXCLUSIVAMENTE_NAVEGACIONAL.test(section.title.trim()),
  );
}

// Qual modulo recebe a secao. `byId` permite subir pelo parentId quando a
// secao nao tem numero proprio (checklists e roteiros dentro de um capitulo).
export function assignedTrack(section, byId, tracks) {
  const n = (section.number || '').trim();
  if (/^(Anexo\s+F|F\.\d)/i.test(n)) return 'm16';
  if (/^(Anexo|Referências)/i.test(n) || /^refer[eê]ncias/i.test(section.title || '')) return 'm14';
  // Subsecao de anexo herda o anexo: o Anexo B numera seus itens de 1 a 10 e,
  // sem esta regra, eles colidiriam com os capitulos 1 a 10 do POP.
  if (byId) {
    let p = section.parentId ? byId.get(section.parentId) : null;
    let g = 0;
    while (p && g++ < 8) {
      const pn = (p.number || '').trim();
      if (/^Anexo\s+F/i.test(pn)) return 'm16';
      if (/^Anexo/i.test(pn)) return 'm14';
      p = p.parentId ? byId.get(p.parentId) : null;
    }
  }
  // Prefixo MAIS ESPECIFICO vence: 20.2.1 fica em m15 (secao "20.2") e nao em
  // m11 (secao "20").
  if (n) {
    let melhor = '';
    let escolhido = null;
    for (const t of tracks) {
      for (const sec of t.sections || []) {
        if ((n === sec || n.startsWith(sec + '.')) && sec.length > melhor.length) { melhor = sec; escolhido = t.id; }
      }
    }
    if (escolhido) return escolhido;
  }
  // Sem numero proprio: herda a trilha da secao-mae.
  let p = section.parentId && byId ? byId.get(section.parentId) : null;
  let guard = 0;
  while (p && guard++ < 8) {
    const t = assignedTrack(p, byId, tracks);
    if (t !== 'm00') return t;
    p = p.parentId && byId ? byId.get(p.parentId) : null;
  }
  return 'm00';
}

// Deriva as aulas a partir do POP ja carregado. A duracao estimada acompanha o
// numero de blocos da secao, limitada entre 4 e 28 minutos.
export function derivarAulas(popData, tracks) {
  const sectionById = new Map(popData.sections.map((s) => [s.id, s]));
  const lessons = popData.sections
    .filter(isLessonSection)
    .map((s, i) => ({
      ...s,
      trackId: assignedTrack(s, sectionById, tracks),
      order: i,
      minutes: Math.max(4, Math.min(28, Math.round((s.blockIds?.length || 1) * 1.8) + 4)),
    }));
  const lessonMap = new Map(lessons.map((l) => [l.id, l]));
  const trackLessons = new Map(tracks.map((t) => [t.id, lessons.filter((l) => l.trackId === t.id)]));
  return { sectionById, lessons, lessonMap, trackLessons };
}
