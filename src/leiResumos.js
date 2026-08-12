// Resumo breve de cada norma referenciada no POP, para a aba Legislacoes.
//
// Os padroes sao ancorados no TIPO do ato, nao apenas no numero. Uma referencia
// costuma citar a norma que ela regulamenta ("Decreto que regulamenta a Lei
// 22.252"), entao casar so pelo numero fazia a tela descrever o ato errado.
// A ordem tambem importa: o primeiro padrao que casar vence.
//
// Federais e CONAMA: sintese de conteudo consolidado. Normas estaduais, do IAT
// e do IBAMA: sintese fiel a ementa registrada no proprio POP, sem afirmar
// dispositivo que nao esteja la.
const RESUMOS = [
  // --- Federais: leis ---
  [/Lei Federal n[ºo°] 6\.938/, 'Institui a Política Nacional do Meio Ambiente: conceitos de degradação e poluidor, o SISNAMA e seus órgãos, e os instrumentos de gestão, entre eles o licenciamento ambiental e a avaliação de impactos. Base da responsabilidade objetiva por dano ambiental.'],
  [/Lei Complementar n[ºo°] 140/, 'Organiza a cooperação entre União, Estados e Municípios nas ações ambientais: define o ente licenciador único por empreendimento, as competências de cada esfera e a atuação supletiva e subsidiária.'],
  [/Lei Federal n[ºo°] 9\.433/, 'Institui a Política Nacional de Recursos Hídricos: a água como bem de domínio público, a outorga de direito de uso, os planos e comitês de bacia e a cobrança pelo uso. Fundamenta a exigência de outorga e DRDH nos aproveitamentos hidrelétricos.'],
  [/Lei Federal n[ºo°] 12\.651/, 'Lei de Proteção da Vegetação Nativa (Código Florestal): Áreas de Preservação Permanente, inclusive as faixas no entorno de reservatórios artificiais, Reserva Legal, CAR e regimes de supressão e regularização.'],
  [/Lei Federal n[ºo°] 11\.428/, 'Lei da Mata Atlântica: regimes de proteção e de supressão da vegetação do bioma conforme o estágio sucessional, com vedações, hipóteses de utilidade pública e compensações específicas.'],
  [/Lei Federal n[ºo°] 9\.985/, 'Institui o SNUC: categorias de unidades de conservação, zonas de amortecimento e a compensação ambiental do art. 36 para empreendimentos de significativo impacto.'],
  [/Lei Federal n[ºo°] 9\.605/, 'Lei de Crimes Ambientais: sanções penais e administrativas para condutas lesivas ao meio ambiente, inclusive construir ou operar sem licença.'],
  [/Lei Federal n[ºo°] 12\.334/, 'Institui a Política Nacional de Segurança de Barragens: classificação por risco e dano potencial associado, Plano de Segurança da Barragem, inspeções e o SNISB.'],
  [/Lei Federal n[ºo°] 14\.066/, 'Atualiza a PNSB após Brumadinho: reforça o PAE, veda alteamento a montante em rejeitos, endurece fiscalização e responsabilização.'],
  [/Lei Federal n[ºo°] 15\.190/, 'Lei federal de normas gerais do licenciamento ambiental (alterada pelas Leis nº 15.269/2025 e seguintes), a compatibilizar com a matriz estadual conforme registrado no POP.'],
  [/Lei Federal n[ºo°] 12\.187/, 'Institui a Política Nacional sobre Mudança do Clima: princípios, objetivos, diretrizes e instrumentos da ação climática federal. Entrou no POP na v1.9 como base do Diagnóstico Climático exigido nos processos sujeitos a EIA/RIMA.'],
  // --- Federais: decretos (antes dos padroes genericos) ---
  [/Decreto Federal n[ºo°] 8\.437/, 'Regulamenta a Lei Complementar nº 140/2011 e fixa as tipologias de empreendimentos e atividades cujo licenciamento ambiental é de competência da União. É a base para identificar quando o processo é federal, ponto de partida do licenciamento delegado ao IAT.'],
  [/Decreto Federal n[ºo°] 4\.340/, 'Regulamenta a Lei do SNUC, com as alterações do Decreto nº 6.848/2009: disciplina a criação e a gestão das unidades de conservação e fixa a metodologia do grau de impacto que define o valor da compensação ambiental do art. 36.'],
  [/Decreto Federal n[ºo°] 6\.514/, 'Regulamenta as infrações administrativas ambientais e o processo sancionador federal: autos de infração, multas, embargos e demais medidas.'],
  // --- CONAMA ---
  [/Resolução n[ºo°] 01, de 23 de janeiro de 1986/, 'Resolução CONAMA que define impacto ambiental e estabelece critérios e diretrizes do EIA/RIMA, listando atividades sujeitas ao estudo, entre elas usinas de geração acima de 10 MW.'],
  [/Resolução n[ºo°] 237/, 'Resolução CONAMA que detalha o licenciamento ambiental: etapas LP, LI e LO, prazos, competências e a possibilidade de procedimentos simplificados definidos pelo órgão.'],
  [/Resolução n[ºo°] 279/, 'Resolução CONAMA do licenciamento simplificado de empreendimentos elétricos de pequeno potencial de impacto, com o Relatório Ambiental Simplificado (RAS) e prazos reduzidos.'],
  [/Resolução n[ºo°] 428/, 'Resolução CONAMA que disciplina a interface do licenciamento com unidades de conservação: quando cabe ciência ou autorização do órgão gestor, o alcance da zona de amortecimento e as informações exigidas. Observar a redação vigente, alterada pela Resolução nº 508/2025.'],
  [/Resolução n[ºo°] 508/, 'Resolução CONAMA que altera o art. 5º da Resolução nº 428/2010: trata da ciência ao órgão gestor da unidade de conservação, das informações georreferenciadas e da observância das restrições do ato de criação e do Plano de Manejo.'],
  [/Resolução n[ºo°] 06, de 24 de janeiro de 1986/, 'Resolução CONAMA que institui os modelos de publicação dos pedidos e concessões de licença, garantindo publicidade ao processo.'],
  [/Resolução n[ºo°] 06, de 16 de setembro de 1987/, 'Resolução CONAMA específica do setor elétrico: regras de licenciamento para obras de geração de energia, articulando as fases do projeto com LP, LI e LO.'],
  [/Resolução n[ºo°] 09, de 3 de dezembro de 1987/, 'Resolução CONAMA das audiências públicas no licenciamento: quando cabem, quem pode requerer e como se realizam.'],
  [/Resolução n[ºo°] 357/, 'Resoluções CONAMA da qualidade das águas: classificação dos corpos hídricos por classes de uso (357/2005) e condições e padrões de lançamento de efluentes (430/2011).'],
  // --- Estaduais ---
  [/Lei Estadual n[ºo°] 22\.252/, 'Lei estadual que estabelece as normas gerais do licenciamento ambiental no Estado do Paraná, base do regramento aplicado pelo IAT.'],
  [/Decreto Estadual n[ºo°] 9\.541/, 'Decreto que regulamenta a Lei Estadual nº 22.252/2024 e detalha o licenciamento ambiental paranaense: modalidades, procedimentos e prazos. Alterado pelo Decreto Estadual nº 12.799/2026.'],
  [/Lei Estadual n[ºo°] 20\.929/, 'Torna obrigatória a compensação ambiental para empreendimentos que geram impacto ambiental negativo não mitigável no Paraná. É a base legal da compensação analisada no módulo de conclusão.'],
  [/Decreto Estadual n[ºo°] 7\.150/, 'Regulamenta a Lei Estadual nº 20.929/2021 e disciplina a compensação ambiental por impactos negativos não mitigáveis: procedimento, cálculo e fluxo administrativo aplicados pelo IAT.'],
  [/Lei Estadual n[ºo°] 11\.054/, 'Lei Florestal do Estado do Paraná, referência estadual para as questões florestais do licenciamento.'],
  [/Lei Estadual n[ºo°] 17\.133/, 'Institui a Política Estadual sobre Mudança do Clima no Paraná, contraparte estadual da Lei Federal nº 12.187/2009. Compõe a base do Diagnóstico Climático introduzido no POP na v1.9.'],
  [/Decreto Estadual n[ºo°] 9\.085/, 'Regulamenta a Lei Estadual nº 17.133/2012, que institui a Política Estadual sobre Mudança do Clima.'],
  // Conferido na fonte primária em 05/08/2026: o art. 50 da IN IAT nº 09/2025
  // manda a APP do entorno do reservatório seguir o cálculo desta Portaria, com
  // relatório de cálculo e shapefile para conferência do IAT na LP ou na LAS. A
  // ressalva de vigência é do próprio POP, que a aplica "apenas quando ainda
  // vigente e pertinente". O resumo anterior dizia só que ela era "referida no
  // art. 50", que é verdade e não ajuda ninguém.
  [/Portaria n[ºo°] 069\/2015/, 'Fixa o cálculo da APP a ser preservada no entorno do reservatório a ser formado. O art. 50 da IN IAT nº 09/2025 remete a ela e exige relatório de cálculo e arquivos shapefile para conferência do IAT na solicitação de LP ou LAS. Aplicar apenas quando ainda vigente e pertinente ao caso.'],
  // --- IAT: instrucoes normativas ---
  [/Instrução Normativa IAT n[ºo°] 09/, 'Norma central do tema: disciplina o licenciamento ambiental de unidades hidrelétricas no Paraná: enquadramento por potência, alagamento, IDA e sensibilidade; modalidades (DLAM, LAC, LAS, trifásico); Consulta Prévia; documentação por fase.'],
  [/Instrução Normativa IAT n[ºo°] 16\/2025/, 'IN do IAT sobre a compensação ambiental decorrente de supressão de vegetação nativa: forma de cálculo e cumprimento.'],
  [/Instrução Normativa IAT n[ºo°] 08\/2025/, 'IN do IAT sobre reposição florestal e consumo de matéria-prima florestal.'],
  [/Instrução Normativa IAT n[ºo°] 15\/2025/, 'IN do IAT sobre o Plano de Resgate da Flora vinculado às autorizações de supressão.'],
  [/Instrução Normativa IAT n[ºo°] 64\/2025/, 'IN do IAT sobre intervenções de baixo impacto em APP de reservatórios artificiais.'],
  [/Instrução Normativa IAT n[ºo°] 63\/2025/, 'IN do IAT sobre medição de vazões e volumes vinculados a outorgas de recursos hídricos.'],
  [/Instrução Normativa IAT n[ºo°] 04\/2026/, 'IN do IAT sobre o corte de árvore isolada.'],
  [/Instrução Normativa IAT n[ºo°] 05\/2026/, 'IN do IAT sobre a autorização de supressão de vegetação nativa.'],
  [/Instrução Normativa IAT n[ºo°] 10\/2026/, 'IN do IAT sobre o licenciamento de sistemas de transmissão e distribuição de energia, relevante para linhas e conexões associadas às usinas.'],
  [/Instrução Normativa IAT n[ºo°] 11\/2026/, 'IN do IAT sobre a classificação de atividades econômicas para fins de licenciamento.'],
  [/Instruções Normativas IAT n[ºo°] 01\/2023/, 'Instruções normativas do IAT já revogadas: valem apenas como contexto histórico de processos antigos, nunca como fundamento atual.'],
  // --- IAT: portarias e bases institucionais ---
  [/Portaria IAT n[ºo°] 012/, 'Portaria do IAT com os Anexos I a VIII sobre estudos de fauna no licenciamento: grupos amostrados, esforço, sazonalidade e apresentação de resultados.'],
  [/Portaria IAT n[ºo°] 416/, 'Aprova o Plano de Manejo da Área de Proteção Ambiental Estadual da Escarpa Devoniana, o caso aplicado estudado no módulo de unidades de conservação.'],
  [/Plano de Manejo da Área de Proteção Ambiental Estadual da Escarpa Devoniana/, 'Plano de Manejo da APA Estadual da Escarpa Devoniana, revisão 2026: zoneamento e regras de uso que condicionam a análise de empreendimentos dentro da APA.'],
  // Fiel à ementa registrada no POP, inclusive a ressalva de compatibilização.
  // O POP é explícito quanto ao alcance: a exigência decorre da exigibilidade
  // do EIA e não se estende automaticamente a DLAM, LAC, LAS, RAS, RDPA ou PCA.
  [/Portaria IAT n[ºo°] 42/, 'Estabelece a inclusão do Diagnóstico Climático nos Estudos de Impacto Ambiental, com inventário de gases de efeito estufa e avaliação de impactos sobre serviços ecossistêmicos associados ao clima. Incide onde o EIA é exigível, sem alcançar automaticamente os estudos simplificados. A remissão interna à Resolução CEMA nº 107/2020 deve ser compatibilizada com o marco estadual vigente.'],
  [/Portaria IAT n[ºo°] 347/, 'Estabelece a metodologia da matriz de valoração dos impactos negativos e não mitigáveis, aplicada no cálculo da compensação ambiental.'],
  [/Portaria IAT n[ºo°] 16, de 6 de janeiro de 2026/, 'Designa a Câmara Técnica de Compensação Ambiental na DILIO, responsável pelo cálculo e pela aplicação dos valores da compensação.'],
  [/Portaria IAT n[ºo°] 400/, 'Inclui servidores na composição da Câmara Técnica de Compensação Ambiental designada pela Portaria IAT nº 16/2026.'],
  [/Compensação Ambiental\. Página institucional/, 'Página institucional da Câmara de Compensação Ambiental vinculada ao SNUC, com legislação, atas e documentos públicos.'],
  [/Dados sobre Unidades de Conservação/, 'Base institucional do IAT com atos de criação, áreas, municípios, bacias, gestores e espacialização das unidades de conservação estaduais.'],
  [/Planos de Manejo\. Repositório/, 'Repositório institucional de Planos de Manejo, mapas, anexos, atos de aprovação e espacialização das unidades de conservação.'],
  [/GeoPR\. Usinas de Geração/, 'Camada pontual do GeoPR com as usinas de geração hidrelétrica, apoio à localização de empreendimentos e processos.'],
  [/GeoPR\s*[-–]?\s*GeoParaná/, 'Catálogo e visualizador oficial de dados geoespaciais do Paraná, base para a análise territorial e para a rastreabilidade da verificação espacial.'],
  // --- IBAMA e delegacao federal ---
  [/Instrução Normativa IBAMA n[ºo°] 08/, 'Estabelece os procedimentos administrativos para delegação do licenciamento ambiental de competência federal a órgão estadual ou municipal. É a norma que estrutura a atuação do IAT como delegatário.'],
  [/Acordos de Cooperação Técnica/, 'Acordos de Cooperação Técnica entre o IBAMA e o IAT para execução de licenciamentos federais delegados. Consulte sempre o ACT específico do empreendimento, sua publicação e os termos aditivos aplicáveis à fase analisada.'],
  [/Formulário eletrônico Relatório Técnico Anual/, 'Formulário eletrônico do Relatório Técnico Anual de Atividades (RTAA). Referência operacional observada nas entregas de 2026: confirme a versão e as orientações vigentes a cada exercício.'],
  [/Relatórios textuais, formulários eletrônicos e recibos SEI\/IBAMA/, 'Exemplos operacionais de entrega do RTAA em processos delegados (relatórios, formulários e recibos SEI/IBAMA). Material de apoio, sem natureza normativa.'],
  // --- ANEEL ---
  [/Resolução Normativa n[ºo°] 875/, 'REN da ANEEL sobre os requisitos e procedimentos setoriais dos aproveitamentos hidrelétricos: registro (DRI/DRS), outorga de autorização e adequabilidade técnica.'],
  [/Resolução Normativa n[ºo°] 1\.064/, 'REN da ANEEL sobre segurança de barragens de geração hidrelétrica fiscalizadas pela agência: classificação, plano de segurança, inspeções e obrigações do empreendedor.'],
  // --- Termos de referencia e tecnicas ---
  [/Termos de Referência para RAS\/RDPA/, 'Termos de Referência do IAT que fixam o conteúdo mínimo dos estudos ambientais de hidrelétricas (RAS/RDPA, PCA, EIA/PBA), orientando elaboração e análise de suficiência.'],
  [/Plano Ambiental de Conservação e Uso/, 'Termo de Referência do PACUERA: diagnóstico do entorno do reservatório, zoneamento por UTHs, participação social e regras de implementação e revisão.'],
  [/IPHAN n[ºo°] 06\/2025/, 'IN do IPHAN sobre a participação do órgão no licenciamento ambiental: avaliação do patrimônio arqueológico e cultural nas áreas de influência.'],
  [/GREENHOUSE GAS PROTOCOL/, 'Padrão internacional de referência para inventário de gases de efeito estufa, usado na quantificação por escopos. Não é norma brasileira e não cria exigência por si: entra como metodologia quando o Diagnóstico Climático a adota. Consultar a versão vigente na data de elaboração do estudo.'],
  [/ABNT/, 'Normas técnicas brasileiras de documentação aplicáveis aos relatórios: referências, citações, numeração progressiva, sumário e apresentação.'],
];

// A referencia segue o padrao "ORGAO. Ato nº X, de data. Ementa." e a ementa
// costuma citar a norma regulamentada, o que fazia o decreto ser descrito como
// a lei que ele regulamenta. Por isso o padrao e testado primeiro contra o ATO,
// isto e, a primeira sentenca depois do orgao.
function atoPrincipal(ref) {
  const semOrgao = String(ref || '').replace(/^[^.]+\.\s*/, '');
  return semOrgao.split(/\.\s+/)[0] || String(ref || '');
}

export function resumoDaNorma(ref) {
  const ato = atoPrincipal(ref);
  const noAto = RESUMOS.find(([re]) => re.test(ato));
  if (noAto) return noAto[1];
  const naRef = RESUMOS.find(([re]) => re.test(ref));
  return naRef ? naRef[1] : null;
}
