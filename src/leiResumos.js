// Resumo breve de cada norma referenciada no POP, para a aba Legislacoes.
// Federais e CONAMA: sintese de conteudo consolidado e notorio. Normas
// estaduais/IAT recentes: sintese fiel a ementa registrada no proprio POP,
// sem afirmar dispositivo que nao esteja la.
const RESUMOS = [
  [/6\.938/, 'Institui a Política Nacional do Meio Ambiente: conceitos de degradação e poluidor, o SISNAMA e seus órgãos, e os instrumentos de gestão — entre eles o licenciamento ambiental e a avaliação de impactos. Base da responsabilidade objetiva por dano ambiental.'],
  [/Complementar n[ºo°] 140/, 'Organiza a cooperação entre União, Estados e Municípios nas ações ambientais: define o ente licenciador único por empreendimento, as competências de cada esfera e a atuação supletiva e subsidiária.'],
  [/9\.433/, 'Institui a Política Nacional de Recursos Hídricos: a água como bem de domínio público, a outorga de direito de uso, os planos e comitês de bacia e a cobrança pelo uso. Fundamenta a exigência de outorga e DRDH nos aproveitamentos hidrelétricos.'],
  [/12\.651/, 'Lei de Proteção da Vegetação Nativa (Código Florestal): Áreas de Preservação Permanente — inclusive faixas de reservatórios artificiais —, Reserva Legal, CAR e regimes de supressão e regularização.'],
  [/11\.428/, 'Lei da Mata Atlântica: regimes de proteção e de supressão da vegetação do bioma conforme o estágio sucessional, com vedações, hipóteses de utilidade pública e compensações específicas.'],
  [/Resolução n[ºo°] 01, de 23 de janeiro de 1986/, 'Resolução CONAMA que define impacto ambiental e estabelece critérios e diretrizes do EIA/RIMA, listando atividades sujeitas ao estudo — entre elas usinas de geração acima de 10 MW.'],
  [/Resolução n[ºo°] 237/, 'Resolução CONAMA que detalha o licenciamento ambiental: etapas LP, LI e LO, prazos, competências e a possibilidade de procedimentos simplificados definidos pelo órgão.'],
  [/Resolução n[ºo°] 279/, 'Resolução CONAMA do licenciamento simplificado de empreendimentos elétricos de pequeno potencial de impacto, com o Relatório Ambiental Simplificado (RAS) e prazos reduzidos.'],
  [/22\.252/, 'Lei estadual que estabelece as normas gerais do licenciamento ambiental no Estado do Paraná, base do regramento aplicado pelo IAT.'],
  [/9\.541/, 'Decreto estadual que regulamenta o licenciamento ambiental paranaense (alterado pelo Decreto nº 12.799/2026), detalhando modalidades, procedimentos e prazos.'],
  [/Instrução Normativa IAT n[ºo°] 09/, 'Norma central do tema: disciplina o licenciamento ambiental de unidades hidrelétricas no Paraná — enquadramento por potência, alagamento, IDA e sensibilidade; modalidades (DLAM, LAC, LAS, trifásico); Consulta Prévia; documentação por fase.'],
  [/Termos de Referência para RAS\/RDPA/, 'Termos de Referência do IAT que fixam o conteúdo mínimo dos estudos ambientais de hidrelétricas (RAS/RDPA, PCA, EIA/PBA), orientando elaboração e análise de suficiência.'],
  [/9\.985/, 'Institui o SNUC: categorias de unidades de conservação, zonas de amortecimento e a compensação ambiental do art. 36 para empreendimentos de significativo impacto.'],
  [/9\.605/, 'Lei de Crimes Ambientais: sanções penais e administrativas para condutas lesivas ao meio ambiente, inclusive construir ou operar sem licença.'],
  [/6\.514/, 'Decreto que regulamenta as infrações administrativas ambientais e o processo sancionador federal: autos de infração, multas, embargos e demais medidas.'],
  [/12\.334/, 'Institui a Política Nacional de Segurança de Barragens: classificação por risco e dano potencial associado, Plano de Segurança da Barragem, inspeções e o SNISB.'],
  [/14\.066/, 'Atualiza a PNSB após Brumadinho: reforça o PAE, veda alteamento a montante em rejeitos, endurece fiscalização e responsabilização.'],
  [/15\.190/, 'Lei federal de normas gerais do licenciamento ambiental (alterada pelas Leis nº 15.269/2025 e seguintes), a compatibilizar com a matriz estadual conforme registrado no POP.'],
  [/Resolução n[ºo°] 06, de 24 de janeiro de 1986/, 'Resolução CONAMA que institui os modelos de publicação dos pedidos e concessões de licença, garantindo publicidade ao processo.'],
  [/Resolução n[ºo°] 06, de 16 de setembro de 1987/, 'Resolução CONAMA específica do setor elétrico: regras de licenciamento para obras de geração de energia, articulando as fases do projeto com LP, LI e LO.'],
  [/Resolução n[ºo°] 09, de 3 de dezembro de 1987/, 'Resolução CONAMA das audiências públicas no licenciamento: quando cabem, quem pode requerer e como se realizam.'],
  [/Resolução n[ºo°] 357/, 'Resoluções CONAMA da qualidade das águas: classificação dos corpos hídricos por classes de uso (357/2005) e condições e padrões de lançamento de efluentes (430/2011).'],
  [/Portaria n[ºo°] 069\/2015/, 'Portaria estadual referida no art. 50 da IN IAT nº 09/2025, aplicável conforme sua identificação oficial e vigência.'],
  [/Portaria IAT n[ºo°] 012/, 'Portaria do IAT com os Anexos I a VIII sobre estudos de fauna no licenciamento: grupos amostrados, esforço, sazonalidade e apresentação de resultados.'],
  [/Instrução Normativa IAT n[ºo°] 16\/2025/, 'IN do IAT sobre a compensação ambiental decorrente de supressão de vegetação nativa: forma de cálculo e cumprimento.'],
  [/Instrução Normativa IAT n[ºo°] 08\/2025/, 'IN do IAT sobre reposição florestal e consumo de matéria-prima florestal.'],
  [/Instrução Normativa IAT n[ºo°] 15\/2025/, 'IN do IAT sobre o Plano de Resgate da Flora vinculado às autorizações de supressão.'],
  [/Instrução Normativa IAT n[ºo°] 64\/2025/, 'IN do IAT sobre intervenções de baixo impacto em APP de reservatórios artificiais.'],
  [/Plano Ambiental de Conservação e Uso/, 'Termo de Referência do PACUERA: diagnóstico do entorno do reservatório, zoneamento por UTHs, participação social e regras de implementação e revisão.'],
  [/Instrução Normativa IAT n[ºo°] 63\/2025/, 'IN do IAT sobre medição de vazões e volumes vinculados a outorgas de recursos hídricos.'],
  [/Instrução Normativa IAT n[ºo°] 04\/2026/, 'IN do IAT sobre o corte de árvore isolada.'],
  [/Instrução Normativa IAT n[ºo°] 05\/2026/, 'IN do IAT sobre a autorização de supressão de vegetação nativa.'],
  [/Instrução Normativa IAT n[ºo°] 10\/2026/, 'IN do IAT sobre o licenciamento de sistemas de transmissão e distribuição de energia — relevante para linhas e conexões associadas às usinas.'],
  [/Instrução Normativa IAT n[ºo°] 11\/2026/, 'IN do IAT sobre a classificação de atividades econômicas para fins de licenciamento.'],
  [/IPHAN n[ºo°] 06\/2025/, 'IN do IPHAN sobre a participação do órgão no licenciamento ambiental: avaliação do patrimônio arqueológico e cultural nas áreas de influência.'],
  [/Resolução Normativa n[ºo°] 875/, 'REN da ANEEL sobre os requisitos e procedimentos setoriais dos aproveitamentos hidrelétricos: registro (DRI/DRS), outorga de autorização e adequabilidade técnica.'],
  [/Resolução Normativa n[ºo°] 1\.064/, 'REN da ANEEL com regras setoriais complementares aplicáveis às centrais geradoras, conforme suas alterações vigentes.'],
  [/01\/2023 e n[ºo°] 02\/2023/, 'Instruções normativas do IAT já revogadas: valem apenas como contexto histórico de processos antigos, nunca como fundamento atual.'],
  [/ABNT/, 'Normas técnicas brasileiras de documentação aplicáveis aos relatórios: referências, citações, numeração progressiva, sumário e apresentação.'],
];

export function resumoDaNorma(ref) {
  const hit = RESUMOS.find(([re]) => re.test(ref));
  return hit ? hit[1] : null;
}
