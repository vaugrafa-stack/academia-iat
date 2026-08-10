const CHECKED_AT = '2026-07-27';
const HYDRO_AXES_CHECKED_AT = '2026-08-10';

// Três trilhas públicas diferentes convivem no mesmo empreendimento. Os
// registros abaixo não tentam fundi-las em uma única "classificação oficial":
// cada eixo informa a autoridade, a finalidade e a fonte que sustenta o
// recorte. A data registra a conferência do conteúdo acessível, não uma opinião
// automática sobre a norma aplicável a qualquer processo concreto.
export const HYDRO_AUTHORITY_AXES = Object.freeze([
  {
    id: 'iat-ambiental',
    shortLabel: 'IAT',
    authority: 'Instituto Água e Terra',
    title: 'Licenciamento ambiental estadual',
    scope: 'Enquadramento ambiental e procedimentos de licenciamento de empreendimentos hidrelétricos no Paraná.',
    act: 'Instrução Normativa IAT nº 09/2025, art. 2º',
    officialUrl: 'https://www.iat.pr.gov.br/sites/agua-terra/arquivos_restritos/files/documento/2025-06/instrucao_normativa_09-2025-empreendimentos_hidreletricos-23743957-0_republicado.pdf',
    supportingUrl: 'https://www.iat.pr.gov.br/Pagina/Licenciamento-de-atividades-especificas',
    checkedAt: HYDRO_AXES_CHECKED_AT,
    temporalStatus: 'vigência-e-aplicação-a-confirmar',
    epistemicStatus: 'fonte primária localizada',
    humanReview: 'pendente',
    criteria: [
      'MCH: potência instalada igual ou inferior a 75 kW.',
      'MGH: potência superior a 75 kW e até 500 kW.',
      'CGH: potência superior a 500 kW e até 5 MW.',
      'PCH: potência superior a 5 MW e até 30 MW, com reservatório de até 3 km², ressalvada a exceção descrita na própria IN.',
      'UHE: potência superior a 30 MW, reservatório maior que 3 km² ou definição da ANEEL.',
    ],
    limitation: 'Este eixo serve ao licenciamento ambiental estadual. Não substitui registro ou outorga setorial nem a regularização do uso da água.',
  },
  {
    id: 'aneel-setorial',
    shortLabel: 'ANEEL',
    authority: 'Agência Nacional de Energia Elétrica',
    title: 'Regulação e outorga do setor elétrico',
    scope: 'Registro, autorização ou instrução de concessão para exploração do potencial hidráulico, conforme o regime setorial.',
    act: 'Resolução Normativa ANEEL nº 875/2020, art. 5º, com redação da REN ANEEL nº 1.070/2023',
    officialUrl: 'https://www2.aneel.gov.br/cedoc/ren2020875.pdf',
    amendingAct: 'Resolução Normativa ANEEL nº 1.070/2023',
    amendingUrl: 'https://www2.aneel.gov.br/cedoc/ren20231070.pdf',
    supportingUrl: 'https://www.gov.br/aneel/pt-br/centrais-de-conteudos/manuais-modelos-e-instrucoes/geracao/registro-autorizacao-e-concessao-de-empreendimentos-de-geracao/outorga-de-autorizacao-pch-e-uhe',
    divergentUrl: 'https://www.gov.br/aneel/pt-br/assuntos/geracao/outorgas',
    checkedAt: HYDRO_AXES_CHECKED_AT,
    temporalStatus: 'vigência-e-aplicação-a-confirmar',
    epistemicStatus: 'fonte primária localizada',
    humanReview: 'pendente',
    criteria: [
      'CGH setorial: capacidade instalada igual ou inferior a 5.000 kW.',
      'PCH setorial: potência superior a 5.000 kW e até 30.000 kW. A redação consolidada do art. 5º não adota limite de área do reservatório.',
      'UHE autorizada: potência superior a 30.000 kW e até 50.000 kW, conforme o regime setorial aplicável.',
      'UHE concedida: potência instalada superior a 50.000 kW.',
    ],
    sourceAlert: 'Divergência entre páginas oficiais: a página geral “Outorgas”, atualizada em 15/05/2025, ainda menciona reservatório de até 13 km²; a REN nº 875/2020 consolidada, alterada pela REN nº 1.070/2023, e a página operacional atualizada em 20/02/2026 enquadram PCH pela faixa superior a 5.000 kW e igual ou inferior a 30.000 kW. Não use a página geral isoladamente como critério decisório; confira o ato consolidado e sua aplicação temporal ao caso.',
    limitation: 'Este eixo não define modalidade ou suficiência do licenciamento ambiental e não substitui outorga ou DRDH de recursos hídricos.',
  },
  {
    id: 'gestao-hidrica',
    shortLabel: 'ANA / gestor estadual',
    authority: 'ANA ou órgão gestor de recursos hídricos competente',
    title: 'Disponibilidade e direito de uso da água',
    scope: 'DRDH, outorga preventiva e outorga de direito de uso, conforme o domínio do corpo hídrico e a competência do gestor.',
    act: 'Resolução ANA nº 286/2026 e regras do órgão gestor estadual competente',
    officialUrl: 'https://www.gov.br/ana/pt-br/legislacao/resolucoes/resolucoes-regulatorias/2026/286',
    supportingUrl: 'https://www.iat.pr.gov.br/Pagina/Outorga-eletronica-de-recursos-hidricos',
    checkedAt: HYDRO_AXES_CHECKED_AT,
    temporalStatus: 'vigência-e-aplicação-a-confirmar',
    epistemicStatus: 'fonte primária localizada',
    humanReview: 'pendente',
    criteria: [
      'Corpo hídrico de domínio da União: aplicar o fluxo da ANA e identificar quem apresenta o pedido em cada hipótese.',
      'Corpo hídrico de domínio estadual: consultar o órgão gestor estadual e o procedimento vigente.',
      'DRDH, outorga preventiva e outorga de direito de uso são atos distintos e devem ser compatíveis com o empreendimento.',
    ],
    limitation: 'Este eixo não substitui o ato da ANEEL nem a licença ambiental. O domínio do corpo hídrico e a fase do processo precisam ser confirmados.',
  },
]);

// Fontes de maior risco operacional conferidas diretamente nos portais
// oficiais. O registro guarda a data da conferência do link, mas não finge que
// isso substitui revisão de vigência, transição ou aplicabilidade ao processo.
export const REVIEWED_SOURCES = [
  {
    pattern: /instru[cç][aã]o normativa iat n[ºo°]?\s*09\b/i,
    url: 'https://www.iat.pr.gov.br/sites/agua-terra/arquivos_restritos/files/documento/2025-06/instrucao_normativa_09-2025-empreendimentos_hidreletricos-23743957-0_republicado.pdf',
    portal: 'IAT',
    status: 'Íntegra oficial republicada localizada',
    transition: 'Confirmar compatibilização com a Lei Federal nº 15.190/2025 e a regra temporal do processo.',
  },
  {
    pattern: /termo de refer[eê]ncia.+pacuera|pacuera.+termo de refer[eê]ncia/i,
    url: 'https://www.iat.pr.gov.br/sites/agua-terra/arquivos_restritos/files/documento/2026-02/termodereferenciapacuera2026.pdf',
    portal: 'IAT',
    status: 'Íntegra oficial de 2026 localizada',
    validUntil: '01/02/2027, conforme declaração do próprio TR',
    transition: 'Estudo protocolado após a validade declarada deve seguir a versão então vigente.',
  },
  {
    pattern: /portaria iat n[ºo°]?\s*416\/2026/i,
    url: 'https://www.iat.pr.gov.br/Pagina/Planos-de-Manejo',
    portal: 'IAT',
    kind: 'index',
    status: 'Ato de aprovação identificado no repositório oficial de Planos de Manejo',
    transition: 'Abrir o ato e os anexos vigentes antes de aplicar restrição territorial.',
  },
  {
    pattern: /plano de manejo.+escarpa devoniana/i,
    url: 'https://www.iat.pr.gov.br/Pagina/Plano-de-Manejo-Area-de-Protecao-Ambiental-da-Escarpa-Devoniana',
    portal: 'IAT',
    status: 'Página oficial da versão 2026 localizada',
    transition: 'Conferir também a Portaria IAT nº 416/2026, o zoneamento e os anexos incidentes.',
  },
  {
    pattern: /lei\s+(?:estadual\s+)?n[ºo°]?\s*22\.?252\b/i,
    url: 'https://www.legislacao.pr.gov.br/legislacao/exibirAto.do?action=iniciarProcesso&codAto=347383&codItemAto=2204914',
    portal: 'Legislação do Paraná',
    status: 'Texto oficial compilado localizado',
    transition: 'Aplicar em conjunto com o Decreto Estadual nº 9.541/2025 e alterações posteriores.',
  },
  {
    pattern: /decreto\s+(?:estadual\s+)?n[ºo°]?\s*9\.?541\b/i,
    url: 'https://www.legislacao.pr.gov.br/legislacao/exibirAto.do?action=iniciarProcesso&codAto=357341',
    portal: 'Legislação do Paraná',
    status: 'Texto oficial compilado localizado',
    transition: 'A referência do POP inclui as alterações do Decreto Estadual nº 12.799/2026.',
  },
  {
    pattern: /decreto\s+(?:estadual\s+)?n[ºo°]?\s*12\.?799\b/i,
    url: 'https://www.legislacao.pr.gov.br/legislacao/listarAtosAno.do?action=exibirImpressao&codAto=386330',
    portal: 'Legislação do Paraná',
    status: 'Ato alterador oficial localizado',
    transition: 'Ler em conjunto com o texto compilado do Decreto Estadual nº 9.541/2025.',
  },
  {
    pattern: /decreto\s+(?:federal\s+)?n[ºo°]?\s*8\.?437\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/decreto/d8437.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
    transition: 'Confirmar alterações e competência aplicável à área e à tipologia do caso.',
  },
  {
    pattern: /lei\s+(?:federal\s+)?n[ºo°]?\s*15\.?190\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15190.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
    transition: 'Conferir a redação compilada e as regras temporais, inclusive alterações posteriores.',
  },
  {
    pattern: /lei\s+complementar\s+n[ºo°]?\s*140\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp140.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /lei\s+(?:federal\s+)?n[ºo°]?\s*6\.?938\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l6938.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /lei\s+(?:federal\s+)?n[ºo°]?\s*9\.?433\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l9433.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /lei\s+(?:federal\s+)?n[ºo°]?\s*12\.?651\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2012/lei/l12651.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /lei\s+(?:federal\s+)?n[ºo°]?\s*11\.?428\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2004-2006/2006/lei/l11428.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /lei\s+(?:federal\s+)?n[ºo°]?\s*9\.?985\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l9985.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /decreto\s+(?:federal\s+)?n[ºo°]?\s*4\.?340\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/decreto/2002/d4340.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /decreto\s+(?:federal\s+)?n[ºo°]?\s*6\.?848\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/decreto/d6848.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /lei\s+(?:federal\s+)?n[ºo°]?\s*9\.?605\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/leis/l9605.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /decreto\s+(?:federal\s+)?n[ºo°]?\s*6\.?514\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2008/decreto/d6514.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /lei\s+(?:federal\s+)?n[ºo°]?\s*12\.?334\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/lei/l12334.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /lei\s+(?:federal\s+)?n[ºo°]?\s*14\.?066\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2019-2022/2020/lei/l14066.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /lei\s+(?:federal\s+)?n[ºo°]?\s*13\.?360\b/i,
    url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2016/lei/l13360.htm',
    portal: 'Planalto',
    status: 'Texto oficial localizado',
  },
  {
    pattern: /(?:conama\.\s*)?resolu[cç][aã]o\s+(?:conama\s+)?n[ºo°]?\s*01\b/i,
    url: 'https://conama.mma.gov.br/?id=745&option=com_sisconama&task=arquivo.download',
    portal: 'CONAMA',
    status: 'Íntegra oficial localizada',
    transition: 'A página oficial registra alterações posteriores; conferir a redação aplicável.',
  },
  {
    pattern: /(?:conama\.\s*)?resolu[cç][aã]o\s+(?:conama\s+)?n[ºo°]?\s*237\b/i,
    url: 'https://conama.mma.gov.br/?id=237%3B&option=com_sisconama&task=arquivo.download',
    portal: 'CONAMA',
    status: 'Íntegra oficial localizada',
    transition: 'Conferir correlações, alterações e compatibilidade com legislação superveniente.',
  },
  {
    pattern: /(?:conama\.\s*)?resolu[cç][aã]o\s+(?:conama\s+)?n[ºo°]?\s*428\b/i,
    url: 'https://conama.mma.gov.br/index.php?id=1813&option=com_sisconama&view=processo',
    portal: 'CONAMA',
    status: 'Processo oficial e ato aprovado localizados',
    transition: 'Ler com a alteração da Resolução CONAMA nº 508/2025.',
  },
  {
    pattern: /(?:conama\.\s*)?resolu[cç][aã]o\s+(?:conama\s+)?n[ºo°]?\s*508\b/i,
    url: 'https://conama.mma.gov.br/index.php?id=767&option=com_sisconama&view=atonormativo',
    portal: 'CONAMA',
    status: 'Ato normativo oficial localizado',
    transition: 'Altera o art. 5º da Resolução CONAMA nº 428/2010.',
  },
  {
    pattern: /resolu[cç][aã]o normativa n[ºo°]?\s*875|resolu[cç][aã]o.+aneel.+875/i,
    url: 'https://www.gov.br/aneel/pt-br/assuntos/geracao/regulacao',
    portal: 'ANEEL',
    kind: 'index',
    status: 'Página temática oficial que identifica a Resolução Normativa nº 875/2020',
    transition: 'Localizar a redação compilada no acervo normativo da ANEEL e confirmar as alterações vigentes.',
  },
  {
    pattern: /resolu[cç][aã]o normativa n[ºo°]?\s*1\.?064|resolu[cç][aã]o.+aneel.+1\.?064/i,
    url: 'https://www.gov.br/aneel/pt-br/assuntos/geracao/seguranca-de-barragens',
    portal: 'ANEEL',
    kind: 'index',
    status: 'Página temática oficial que identifica e contextualiza a Resolução Normativa nº 1.064/2023',
    transition: 'Confirmar no acervo normativo a redação compilada e as alterações posteriores.',
  },
];

const OFFICIAL_INDEXES = [
  [/^BRASIL\b/i, {
    url: 'https://www4.planalto.gov.br/legislacao',
    portal: 'Planalto',
  }],
  [/\bCONAMA\b/i, {
    url: 'https://conama.mma.gov.br/atos-normativos-sistema',
    portal: 'CONAMA',
  }],
  [/^PARAN[ÁA](?:\.|\s)/i, {
    url: 'https://www.legislacao.pr.gov.br/legislacao/pesquisarAto.do?action=pesquisar',
    portal: 'Legislação do Paraná',
  }],
  [/^INSTITUTO [ÁA]GUA E TERRA\b|\bIAT\b/i, {
    url: 'https://www.iat.pr.gov.br/Pagina/Legislacao',
    portal: 'IAT',
  }],
  [/^AG[EÊ]NCIA NACIONAL\b|\bANEEL\b/i, {
    url: 'https://www.aneel.gov.br/cedoc',
    portal: 'ANEEL',
  }],
  [/^INSTITUTO DO PATRIM[ÔO]NIO\b|\bIPHAN\b/i, {
    url: 'https://www.gov.br/iphan/pt-br/acesso-a-informacao/legislacao',
    portal: 'IPHAN',
  }],
  [/\bIBAMA\b|^INSTITUTO BRASILEIRO DO MEIO AMBIENTE\b/i, {
    url: 'https://www.gov.br/ibama/pt-br/acesso-a-informacao/institucional/legislacao',
    portal: 'Ibama',
  }],
  [/\bABNT\b/i, {
    url: 'https://www.abntcatalogo.com.br/',
    portal: 'ABNT Catálogo',
  }],
];

function governanceNote(source) {
  const parts = [
    source.status,
    `link conferido em ${CHECKED_AT.split('-').reverse().join('/')}`,
  ];
  if (source.validUntil) parts.push(`validade declarada: ${source.validUntil}`);
  if (source.transition) parts.push(source.transition);
  parts.push('A vigência e a aplicação ao processo devem ser confirmadas por responsável técnico.');
  return `${parts.filter(Boolean).join('. ')}.`;
}

export function resolveOfficialSource(reference = '') {
  const reviewed = REVIEWED_SOURCES.find((source) => source.pattern.test(reference));
  if (reviewed) {
    return {
      kind: reviewed.kind || 'direct',
      url: reviewed.url,
      portal: reviewed.portal,
      label: reviewed.kind === 'index'
        ? `Abrir repositório oficial no ${reviewed.portal}`
        : `Abrir fonte oficial no ${reviewed.portal}`,
      status: reviewed.status,
      checkedAt: CHECKED_AT,
      validUntil: reviewed.validUntil || null,
      transition: reviewed.transition || null,
      humanReview: 'pendente',
      note: governanceNote(reviewed),
    };
  }

  const officialIndex = OFFICIAL_INDEXES.find(([pattern]) => pattern.test(reference))?.[1];
  if (!officialIndex) return null;
  return {
    kind: 'index',
    url: officialIndex.url,
    portal: officialIndex.portal,
    label: `Consultar índice oficial do ${officialIndex.portal}`,
    status: 'Órgão oficial identificado; ato exato ainda sem vínculo direto',
    checkedAt: CHECKED_AT,
    validUntil: null,
    transition: null,
    humanReview: 'pendente',
    note: `Este link abre o índice do órgão, não a íntegra do ato. Localize a referência exata e confirme vigência, alterações e aplicação ao caso. Índice conferido em ${CHECKED_AT.split('-').reverse().join('/')}.`,
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
    { direct: 0, index: 0, unmapped: 0 },
  );
}

const AUTHORITY_PROFILES = [
  {
    pattern: /^INSTITUTO ÁGUA E TERRA\b|^PARANÁ(?:\.|\s|$)/i,
    code: 'iat-pr',
    authority: 'Instituto Água e Terra / Estado do Paraná',
    axis: 'ambiental-estadual',
  },
  {
    pattern: /^AGÊNCIA NACIONAL DE ENERGIA ELÉTRICA\b|\bANEEL\b/i,
    code: 'aneel',
    authority: 'Agência Nacional de Energia Elétrica',
    axis: 'setorial-energetico',
  },
  {
    pattern: /^INSTITUTO BRASILEIRO DO MEIO AMBIENTE\b|\bIBAMA\b/i,
    code: 'ibama',
    authority: 'Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis',
    axis: 'ambiental-federal',
  },
  {
    pattern: /^INSTITUTO DO PATRIMÔNIO HISTÓRICO\b|\bIPHAN\b/i,
    code: 'iphan',
    authority: 'Instituto do Patrimônio Histórico e Artístico Nacional',
    axis: 'patrimonio-cultural',
  },
  {
    pattern: /^CONAMA\b/i,
    code: 'conama',
    authority: 'Conselho Nacional do Meio Ambiente',
    axis: 'ambiental-federal',
  },
  {
    pattern: /^BRASIL\b/i,
    code: 'uniao',
    authority: 'União',
    axis: 'marco-legal-federal',
  },
  {
    pattern: /^ABNT\b/i,
    code: 'abnt',
    authority: 'Associação Brasileira de Normas Técnicas',
    axis: 'normalizacao-tecnica',
  },
];

function authorityProfile(reference) {
  return AUTHORITY_PROFILES.find(({ pattern }) => pattern.test(reference)) || {
    code: 'nao-identificada',
    authority: 'Autoridade não identificada',
    axis: 'a-confirmar',
  };
}

function actFromReference(reference) {
  const withoutAuthority = String(reference || '').replace(/^[^.]+\.\s*/, '');
  return withoutAuthority.split(/\.\s+/)[0]?.trim() || 'Ato não identificado';
}

function scopeFromReference(reference, profile) {
  if (profile.axis === 'setorial-energetico') {
    return 'regulação e outorga do setor elétrico';
  }
  if (/outorga|recursos hídricos|vazões|corpos? de água|DRDH/i.test(reference)) {
    return 'gestão de recursos hídricos';
  }
  if (/inventário hidrelétrico|\bDRI\b|\bDRS\b/i.test(reference)) {
    return 'regulação e outorga do setor elétrico';
  }
  if (/IPHAN|patrimônio/i.test(reference)) return 'patrimônio cultural';
  if (/ABNT|amostragem|laboratórios/i.test(reference)) return 'normalização técnica';
  if (/segurança de barragens/i.test(reference)) return 'segurança de barragens';
  if (/florest|vegetação|Mata Atlântica|fauna|Unidades? de Conservação|Plano de Manejo/i.test(reference)) {
    return 'biodiversidade, vegetação e áreas protegidas';
  }
  if (/compensação ambiental/i.test(reference)) return 'compensação ambiental';
  if (/GeoPR|geoespacial|espacialização/i.test(reference)) return 'informação geoespacial de apoio';
  if (/RTAA|SEI\/IBAMA|Cooperação Técnica|delegação/i.test(reference)) {
    return 'licenciamento ambiental federal delegado e prestação de informações';
  }
  if (profile.axis === 'ambiental-estadual') return 'licenciamento e gestão ambiental estadual';
  if (profile.axis === 'ambiental-federal' || profile.axis === 'marco-legal-federal') {
    return 'marco ambiental federal';
  }
  return 'escopo técnico a confirmar na fonte';
}

function temporalStatus(reference, source) {
  if (/\brevogad[oa]s?\b/i.test(reference)) return 'histórica';
  if (/regra de transição|transição/i.test(reference)) return 'transição';
  if (source?.kind === 'direct') return 'vigência-a-confirmar-no-caso';
  return 'vigência-e-ato-exato-a-confirmar';
}

/**
 * Converte uma referência textual do POP em registro auditável. Para links de
 * índice, `epistemicStatus` registra que o índice oficial foi localizado, mas
 * o ato exato ainda precisa ser localizado e revisado.
 */
export function buildNormativeLedgerEntry(reference = '', index = 0) {
  const source = resolveOfficialSource(reference);
  const profile = authorityProfile(reference);
  return {
    id: `fonte-${String(index + 1).padStart(3, '0')}`,
    reference,
    authorityCode: profile.code,
    authority: profile.authority,
    axis: profile.axis,
    act: actFromReference(reference),
    scope: scopeFromReference(reference, profile),
    officialUrl: source?.url || null,
    directOfficialUrl: source?.kind === 'direct' ? source.url : null,
    officialIndexUrl: source?.kind === 'index' ? source.url : null,
    linkKind: source?.kind || 'unmapped',
    consultedAt: source?.checkedAt || null,
    temporalStatus: temporalStatus(reference, source),
    // Um link direto demonstra que a fonte primária foi localizada, não que a
    // interpretação, a vigência ou a aplicação ao caso foram aprovadas. O
    // rótulo anterior, "evidência", apagava essa diferença justamente nos
    // registros que continuam com análise institucional pendente.
    epistemicStatus: source?.kind === 'direct'
      ? 'fonte primária localizada'
      : 'índice oficial localizado',
    humanReview: source?.humanReview || 'pendente',
    transition: source?.transition || null,
    sourceStatus: source?.status || 'Fonte oficial ainda não mapeada',
  };
}

export function buildNormativeLedger(references = []) {
  return references.map(buildNormativeLedgerEntry);
}
