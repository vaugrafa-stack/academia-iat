const DIRECT_SOURCES = [
  {
    pattern: /decreto\s+(?:federal\s+)?n[ºo°]?\s*8\.?437\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/decreto/d8437.htm',
    portal: 'Planalto',
  },
  {
    pattern: /lei\s+(?:federal\s+)?n[ºo°]?\s*15\.?190\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15190.htm',
    portal: 'Planalto',
  },
  {
    pattern: /resolu[cç][aã]o\s+conama\s+n[ºo°]?\s*508\b/i,
    url: 'https://conama.mma.gov.br/index.php?id=838&option=com_sisconama&task=arquivo.download',
    portal: 'CONAMA',
  },
  {
    pattern: /decreto\s+(?:estadual\s+)?n[ºo°]?\s*12\.?799\b/i,
    url: 'https://www.legislacao.pr.gov.br/legislacao/exibirAto.do?action=iniciarProcesso&codAto=386330&codItemAto=2450179',
    portal: 'Legislação do Paraná',
  },
];

const PORTALS = [
  [/^BRASIL\b/i, { domain: 'planalto.gov.br', portal: 'Planalto' }],
  [/\bCONAMA\b/i, { domain: 'conama.mma.gov.br', portal: 'CONAMA' }],
  [/^PARAN[ÁA]\b/i, { domain: 'legislacao.pr.gov.br', portal: 'Legislação do Paraná' }],
  [/^INSTITUTO [ÁA]GUA E TERRA\b|\bIAT\b/i, { domain: 'iat.pr.gov.br', portal: 'IAT' }],
  [/^AG[EÊ]NCIA NACIONAL\b|\bANEEL\b/i, { domain: 'aneel.gov.br', portal: 'ANEEL' }],
  [/^INSTITUTO DO PATRIM[ÔO]NIO\b|\bIPHAN\b/i, { domain: 'gov.br/iphan', portal: 'IPHAN' }],
  [/\bIBAMA\b/i, { domain: 'gov.br/ibama', portal: 'Ibama' }],
  [/\bABNT\b/i, { domain: 'abntcatalogo.com.br', portal: 'ABNT Catálogo' }],
];

function compactQuery(reference) {
  const number = reference.match(/(?:n[ºo°]?\s*)?[\d.]+\/\d{4}/i)?.[0];
  const act = reference.match(/(?:lei|decreto|resolu[cç][aã]o|instru[cç][aã]o normativa|portaria)[^,.]{0,90}/i)?.[0];
  return (act || number || reference.slice(0, 110)).replace(/\s+/g, ' ').trim();
}

export function resolveOfficialSource(reference = '') {
  const direct = DIRECT_SOURCES.find((source) => source.pattern.test(reference));
  if (direct) {
    return {
      kind: 'direct',
      url: direct.url,
      portal: direct.portal,
      label: `Abrir ato no ${direct.portal}`,
      note: 'Link direto em portal oficial. Confirme vigência, alterações e regra de transição antes de aplicar.',
    };
  }

  const portal = PORTALS.find(([pattern]) => pattern.test(reference))?.[1];
  if (!portal) return null;
  const query = `"${compactQuery(reference)}" site:${portal.domain}`;
  return {
    kind: 'search',
    url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    portal: portal.portal,
    label: `Pesquisar no site do ${portal.portal}`,
    note: 'Atalho de pesquisa, não link para a íntegra. Confirme o ato correto e sua vigência no portal oficial.',
  };
}

export function sourceRegistryStats(references = []) {
  return references.reduce(
    (stats, reference) => {
      const source = resolveOfficialSource(reference);
      if (!source) stats.unmapped += 1;
      else stats[source.kind] += 1;
      return stats;
    },
    { direct: 0, search: 0, unmapped: 0 },
  );
}
