// Casos do laboratorio: cenarios que faltavam e a rubrica da fundamentacao.
//
// Por que este arquivo existe. Ate aqui 11 dos 17 modulos nao tinham nenhum
// artefato de pratica, o que fazia o sinal de pratica do certificado ser
// dispensado em dois tercos do curso. E a fundamentacao escrita, que e a
// competencia central do analista, era so uma trava de 30 caracteres: nunca
// era salva nem conferida.
//
// RUBRICAS traz, por cenario, os elementos que uma fundamentacao defensavel
// precisa tocar e um texto modelo. A conferencia e por termo, nao por juizo:
// a interface diz isso com todas as letras, para ninguem confundir presenca de
// palavra com qualidade de argumento.
//
// O conteúdo abaixo combina regras diretamente tratadas no POP com fatos
// sintéticos de treinamento. Cada conclusão deve ficar limitada ao que os
// fatos e as evidências do cenário permitem demonstrar.

export const NOVOS_CENARIOS = [
  {
    id: 'escopo', track: 'm00', label: 'Escopo do POP', type: 'CGH',
    title: 'Exigência fundamentada apenas no POP',
    facts: [
      'CGH em análise inicial, sem Termo de Referência específico juntado',
      'Sugere-se exigir estudo adicional citando apenas o POP como fundamento',
      'Não há outorga nem manifestação da ANEEL no processo',
      'Um dos temas depende de interpretação normativa ainda não firmada',
    ],
    evidence: [
      'POP de licenciamento hidrelétrico',
      'IN IAT nº 09/2025 e Termo de Referência aplicável',
      'Histórico do processo no SGA',
      'Consulta de atos setoriais (outorga e ANEEL)',
    ],
    steps: ['Fundamento', 'Exigência', 'Limites', 'Pendência', 'Registro'],
    questions: [
      ['O POP pode ser citado como fundamento autônomo de uma exigência documental?', 'nao'],
      ['A exigência deve decorrer de norma, TR, SGA, condicionante, fato novo ou inconsistência?', 'sim'],
      ['A ausência de outorga e de ato da ANEEL pode ser suprida pelo próprio licenciamento?', 'nao'],
      ['Sem elemento suficiente para concluir, cabe registrar a limitação de forma explícita?', 'sim'],
      ['Dúvida sobre alcance normativo deve ser resolvida criando solução própria na manifestação?', 'nao'],
    ],
    outcome: 'Reescrever a exigência com o fundamento aplicável (norma, TR, condicionante ou fato novo), registrar como Pendente de validação o ponto que depende de manifestação jurídica e anotar de forma explícita o que não pôde ser concluído. O POP organiza o método; ele não cria exigência nem substitui ato de outro órgão.',
  },
  {
    id: 'transicao', track: 'm01', label: 'Transição normativa', type: 'PCH',
    title: 'Processo antigo sob regra de transição',
    facts: [
      'Protocolo anterior à Lei Estadual nº 22.252/2024',
      'O pedido atual é de fase seguinte, já sob a norma nova',
      'Não há registro da data de entrada em vigor considerada',
      'Parte da instrução seguiu norma hoje alterada',
    ],
    evidence: [
      'Capa do protocolo com data',
      'Histórico dos atos já praticados',
      'Decreto Estadual nº 9.541/2025, art. 173',
      'Lei Federal nº 15.190/2025, arts. 60 e 67',
    ],
    steps: ['Data', 'Estágio', 'Regime', 'Motivação', 'Encaminhamento'],
    questions: [
      ['A análise deve partir da norma vigente aplicável e da data do protocolo?', 'sim'],
      ['Exigência nova se aplica retroativamente de forma automática ao processo antigo?', 'nao'],
      ['A motivação deve registrar separadamente a transição estadual e a federal?', 'sim'],
      ['A etapa em curso preserva as obrigações e os cronogramas já estabelecidos até concluir?', 'sim'],
      ['Termo de Referência e orientação interna prevalecem sobre lei e regulamento?', 'nao'],
    ],
    outcome: 'Registrar data do protocolo, data de entrada em vigor considerada, estágio processual naquela data, regime aplicado e justificativa, separando a transição estadual (art. 173 do Decreto nº 9.541/2025) da federal (art. 60 da Lei nº 15.190/2025). A etapa em curso conclui sob as obrigações já firmadas; as seguintes observam a legislação vigente.',
  },
  {
    id: 'triagem', track: 'm02', label: 'Triagem', type: 'PCH',
    title: 'Triagem com documento de outro empreendimento',
    facts: [
      'Processo novo protocolado, com estudo de 2016 reaproveitado',
      'Um anexo traz o nome de outro empreendimento e outro corpo hídrico',
      'O titular do requerimento difere do titular da licença anterior',
      'Não há ato formal de transferência no processo',
    ],
    evidence: [
      'Requerimento e capa do protocolo',
      'Estudo ambiental de 2016',
      'Anexo com identificação divergente',
      'Consulta ao SGA e ao e-Protocolo',
    ],
    steps: ['Objeto', 'Histórico', 'Inconsistência', 'Titularidade', 'Saída'],
    questions: [
      ['A leitura deve começar pelo objeto do requerimento e pelo histórico, antes da suficiência?', 'sim'],
      ['Documento de outro empreendimento ou outro corpo hídrico é inconsistência geralmente crítica?', 'sim'],
      ['Estudo antigo só é aproveitável se compatível com projeto, fase, área de influência e realidade atual?', 'sim'],
      ['Mudança de titularidade sem ato formal pode ser tratada como simples observação?', 'nao'],
      ['Cabe concluir por deferimento antes de confrontar SGA, memorial, outorga, ANEEL e cartografia?', 'nao'],
    ],
    outcome: 'Classificar o anexo divergente como inconsistência crítica, tratar a titularidade sem ato formal como pendência crítica e diligenciar antes do mérito. O estudo de 2016 só serve se demonstrada a compatibilidade com o projeto e com a realidade ambiental atuais.',
  },
  {
    id: 'barragem', track: 'm07', label: 'Segurança e sistemas', type: 'PCH',
    title: 'Sistemas associados e incidência da PNSB',
    facts: [
      'PCH com linha de transmissão de 8 km e subestação própria',
      'Canteiro, jazida e bota-fora fora da poligonal do arranjo principal',
      'Barramento com características que atraem a PNSB',
      'PSB e PAE não constam do processo',
    ],
    evidence: [
      'Memorial do arranjo e dos sistemas associados',
      'Titularidade da linha e da subestação',
      'Classificação por categoria de risco e dano potencial',
      'IN IAT nº 10/2026 e Resolução Normativa ANEEL nº 1.064/2023',
    ],
    steps: ['Vínculo', 'Titularidade', 'PNSB', 'Documentos', 'Encaminhamento'],
    questions: [
      ['A decisão deve registrar vínculo funcional, área, titularidade, competência e impactos cumulativos?', 'sim'],
      ['A incidência da PNSB decorre automaticamente da classificação como PCH ou UHE?', 'nao'],
      ['O licenciamento ambiental substitui PSB, PAE, inspeções e revisões periódicas?', 'nao'],
      ['Canteiro, jazida e bota-fora podem exigir processo próprio conforme localização e impacto?', 'sim'],
      ['A manifestação ambiental pode declarar a estabilidade estrutural da barragem?', 'nao'],
    ],
    outcome: 'Registrar o vínculo funcional e a titularidade de cada sistema associado, verificar a incidência da PNSB pelas características da estrutura e não pela sigla do empreendimento, e encaminhar ao órgão fiscalizador competente o que estiver fora da atribuição da unidade. A manifestação registra a consequência ambiental e os limites da análise, nunca a estabilidade estrutural.',
  },
  {
    id: 'estudos', track: 'm08', label: 'Memorial e estudos', type: 'PCH',
    title: 'RDPA que apenas repete o RAS',
    facts: [
      'O RDPA reproduz o diagnóstico do RAS, sem programas executáveis',
      'O Memorial descreve arranjo anterior ao projeto atual',
      'Cartografia sem projeção, datum e responsável técnico',
      'Relatório de programas traz cronograma futuro, sem execução',
    ],
    evidence: [
      'Memorial Descritivo',
      'RAS e RDPA apresentados',
      'Termo de Referência aplicável e sua versão',
      'Peças cartográficas e arquivos digitais',
    ],
    steps: ['Versão do TR', 'Memorial', 'RDPA', 'Cartografia', 'Conclusão'],
    questions: [
      ['O RDPA deve transformar as propostas do RAS em programas executáveis e verificáveis?', 'sim'],
      ['Estudo ambiental atualizado corrige memorial desatualizado?', 'nao'],
      ['A cartografia deve trazer projeção, datum, data e responsável técnico conforme o TR?', 'sim'],
      ['Plano de trabalho ou cronograma futuro substitui relatório de execução?', 'nao'],
      ['A conclusão deve indicar suficiência, inconsistência, consequência técnica e encaminhamento?', 'sim'],
    ],
    outcome: 'Registrar a versão do TR aplicável, exigir memorial compatível com o projeto atual, RDPA com programas verificáveis e cartografia no padrão do TR. Cronograma futuro não comprova execução, e o status declarado pelo empreendedor não equivale ao status validado pelo IAT.',
  },
  {
    id: 'intervenientes', track: 'm11', label: 'Intervenientes', type: 'CGH',
    title: 'Exigência setorial trocada e manifestação de outra fase',
    facts: [
      'CGH de 2,1 MW; o despacho anterior exigiu autorização própria de PCH',
      'A manifestação do IPHAN refere fase e ADA diferentes das atuais',
      'Não há registro da FCA no SAIP',
      'O município emitiu anuência genérica, sem referência ao arranjo',
    ],
    evidence: [
      'Documentação setorial vigente da ANEEL',
      'Manifestação do IPHAN e processo no SEI',
      'IN IPHAN nº 06/2025 e fluxo do SAIP',
      'Anuência municipal',
    ],
    steps: ['Ato setorial', 'Correspondência', 'IPHAN', 'Município', 'Encaminhamento'],
    questions: [
      ['Para CGH deve-se exigir automaticamente autorização ou concessão própria de PCH?', 'nao'],
      ['As manifestações dos intervenientes devem corresponder ao mesmo empreendimento, fase e ADA?', 'sim'],
      ['A FCA deve ser preenchida no SAIP e o processo acompanhado no SEI?', 'sim'],
      ['Manifestação relativa a outra fase e outra ADA pode ser aproveitada sem ressalva?', 'nao'],
      ['O IAT pode substituir a decisão técnica do órgão setorial competente?', 'nao'],
    ],
    outcome: 'Corrigir a exigência setorial para o que é vigente e compatível com titular, potência e fase da CGH, e diligenciar manifestações do IPHAN e do município correspondentes ao empreendimento, à fase e à ADA atuais. O IAT verifica existência e compatibilidade; não decide no lugar do órgão competente.',
  },
  {
    id: 'condicionantes', track: 'm12', label: 'Condicionantes', type: 'PCH',
    title: 'Minuta com condicionante genérica e pendência crítica convertida',
    facts: [
      'Uma condicionante repete obrigação legal, sem prazo nem indicador',
      'Uma pendência crítica foi convertida em condicionante',
      'As diligências vêm sendo comunicadas em parcelas sucessivas',
      'O estudo descreve impacto residual como não mitigável',
    ],
    evidence: [
      'Minuta de Informação Técnica',
      'Checklist e matriz de suficiência',
      'Quadro de condicionantes propostas',
      'Capítulo de impactos do estudo',
    ],
    steps: ['Suficiência', 'Condicionante', 'Diligência', 'Compensação', 'Conclusão'],
    questions: [
      ['Condicionante sem prazo, indicador ou forma de comprovação atende ao padrão de qualidade?', 'nao'],
      ['Pendência crítica que impede decisão segura pode ser convertida em condicionante?', 'nao'],
      ['A diligência deve ser consolidada e comunicada, em regra, de uma única vez?', 'sim'],
      ['A compensação por impacto não mitigável se aplica automaticamente pela potência ou pela tipologia?', 'nao'],
      ['Manifestação não favorável é resposta adequada para lacuna sanável por diligência?', 'nao'],
    ],
    outcome: 'Reescrever a condicionante com prazo, indicador e forma de comprovação, devolver a pendência crítica para diligência em vez de condicionante e consolidar as exigências em comunicação única, conforme o art. 48 da Lei Federal nº 15.190/2025. A compensação só entra se o estudo demonstrar impacto residual não mitigável, com o regime jurídico identificado.',
  },
  {
    id: 'revisao', track: 'm13', label: 'Revisão final', type: 'UHE',
    title: 'Minuta com resíduo de outro processo antes da assinatura',
    facts: [
      'Um parágrafo cita empreendimento de outro processo',
      'Coordenadas apresentadas sem sistema, zona e datum',
      'Arquivo entregue como DOCX simplificado, sem cabeçalho e rodapé do modelo',
      'Campos de elaboração, revisão e aprovação em branco',
    ],
    evidence: [
      'Minuta técnica em DOCX',
      'Modelo institucional vigente',
      'Renderização em PDF para conferência visual',
      'Quadro de estrutura mínima por produto técnico',
    ],
    steps: ['Resíduo', 'Unidades', 'Layout', 'Assinaturas', 'Entrega'],
    questions: [
      ['Referência a outro empreendimento deve ser eliminada na revisão antes da assinatura?', 'sim'],
      ['Coordenadas podem ser apresentadas sem indicar sistema, zona e datum?', 'nao'],
      ['Documento formatado pode ser substituído por arquivo simplificado?', 'nao'],
      ['Sem elaboração, revisão e aprovação identificadas, o arquivo permanece como minuta técnica?', 'sim'],
      ['A conferência do texto extraído dispensa inspecionar o arquivo renderizado?', 'nao'],
    ],
    outcome: 'Eliminar o resíduo de outro processo, completar sistema, zona e datum das coordenadas, restaurar o modelo institucional preservando o arquivo original e renderizar em PDF para inspecionar todas as páginas. Enquanto não houver elaboração, revisão e aprovação identificadas, o arquivo é minuta técnica e não declara validação concluída.',
  },
  {
    id: 'integrador', track: 'm14', label: 'Caso integrador', type: 'PCH',
    title: 'LI com checklist todo marcado e modelo aplicado sem ajuste',
    facts: [
      'PCH de 18 MW pede LI; a ADA incide em zona definida por Plano de Manejo',
      'O checklist marca todos os documentos como apresentados',
      'Duas condicionantes da LP estão sem evidência anexada',
      'Modelo de condicionante do anexo foi aplicado sem ajuste ao caso',
    ],
    evidence: [
      'Modelo de checklist consolidado (Anexo A)',
      'Estrutura de Informação Técnica (Anexo B)',
      'Matriz de análise por documento (Anexo C)',
      'Modelos de condicionantes (Anexo D)',
    ],
    steps: ['Checklist', 'Matriz', 'Restrição territorial', 'Condicionantes', 'Informação Técnica'],
    questions: [
      ['Marcar o documento como apresentado equivale a classificá-lo como suficiente?', 'nao'],
      ['Os modelos dos anexos devem ser adaptados ao caso concreto antes de utilizados?', 'sim'],
      ['Restrição material do Plano de Manejo que torne a localização incompatível pode virar condicionante?', 'nao'],
      ['A Informação Técnica deve reproduzir integralmente o checklist?', 'nao'],
      ['Condicionante da LP sem evidência pode ser dada por cumprida na LI?', 'nao'],
    ],
    outcome: 'Reabrir o checklist para separar apresentado de suficiente, adaptar os modelos dos anexos ao caso concreto, tratar a restrição do Plano de Manejo como questão de compatibilidade locacional em vez de condicionante e exigir evidência das condicionantes da LP. O checklist controla a instrução; a Informação Técnica interpreta o conjunto.',
  },
  {
    id: 'uc-apa', track: 'm15', label: 'UC e APA', type: 'PCH',
    title: 'Pedido de LAC com ADA em APA estadual',
    facts: [
      'A ADA incide em APA estadual, em zona definida pelo Plano de Manejo',
      'O requerimento pede LAC alegando a exceção federal para APA',
      'O estudo aplicou raio de 10 km como se fosse zona de amortecimento',
      'O Plano de Manejo vigente veda o uso pretendido naquela zona',
    ],
    evidence: [
      'Ato de criação da APA',
      'Plano de Manejo vigente e zoneamento',
      'Camadas do GeoPR e página de Planos de Manejo do IAT',
      'Decreto Estadual nº 9.541/2025, art. 64, I, e',
    ],
    steps: ['Categoria', 'Zona', 'Modalidade', 'Amortecimento', 'Encaminhamento'],
    questions: [
      ['A APA possui zona de amortecimento obrigatória nos termos do art. 25 do SNUC?', 'nao'],
      ['A exceção federal do art. 22 da Lei nº 15.190/2025 torna a LAC estadual automaticamente cabível em APA?', 'nao'],
      ['O zoneamento do Plano de Manejo vigente deve ser lido antes de concluir sobre a modalidade?', 'sim'],
      ['Raio de 10 km pode ser tratado como zona de amortecimento presumida?', 'nao'],
      ['As camadas do GeoPR substituem a leitura do ato legal e do Plano de Manejo?', 'nao'],
    ],
    outcome: 'Afastar a LAC pelo filtro territorial estadual do art. 64, I, e, do Decreto nº 9.541/2025, corrigir o uso do raio de 10 km como se fosse zona de amortecimento e ler o zoneamento do Plano de Manejo antes de concluir. A restrição material da zona é questão de compatibilidade locacional, com registro da camada, da fonte e da data de consulta.',
  },
  {
    id: 'delegado', track: 'm16', label: 'ACT e RTAA', type: 'UHE',
    title: 'RLO de UHE de 320 MW com execução delegada',
    facts: [
      'Pedido de RLO de UHE com 320 MW de capacidade instalada',
      'Processo iniciado antes do Decreto Federal nº 8.437/2015',
      'Há ACT entre Ibama e IAT, com vigência a confirmar',
      'A compensação foi encaminhada ao fluxo estadual sem leitura do ACT',
    ],
    evidence: [
      'Ficha de controle do processo delegado',
      'ACT e termos aditivos',
      'Decreto Federal nº 8.437/2015, art. 4º',
      'IN IBAMA nº 08/2019, arts. 15 e 26',
    ],
    steps: ['Competência', 'Delegação', 'Objeto e vigência', 'Compensação', 'RTAA'],
    questions: [
      ['A análise de competência deve anteceder a conclusão sobre modalidade e suficiência?', 'sim'],
      ['A delegação por ACT converte o processo em licenciamento estadual originário?', 'nao'],
      ['A execução delegada deve observar objeto, prazo e condições do ACT específico?', 'sim'],
      ['Em processo federal delegado, a compensação segue automaticamente o fluxo estadual?', 'nao'],
      ['O RTAA deve ser encaminhado ao Ibama até 31 de março de cada ano enquanto aplicável o ACT?', 'sim'],
    ],
    outcome: 'Verificar a competência e a regra de transição do art. 4º do Decreto nº 8.437/2015, confirmar objeto, vigência e fases do ACT antes de qualquer ato, e não direcionar a compensação ao fluxo estadual sem ler o instrumento, conforme o art. 26 da IN IBAMA nº 08/2019. Registrar como Pendente de validação o que não puder ser confirmado e manter a base contínua que alimenta o RTAA de 31 de março.',
  },
  {
    // Caso longitudinal: tres relatorios semestrais do MESMO empreendimento.
    // Os demais cenarios examinam uma peca; este exige comparar a serie ao
    // longo do tempo, que e o que a analise de programas realmente cobra.
    // Construido sobre o padrao de um processo real de acompanhamento, sem
    // identificar empreendimento, pessoas, protocolo ou licenca.
    id: 'prog-semestral', track: 'm08', label: 'Programas semestrais', type: 'PCH',
    title: 'Três relatórios semestrais de programas ambientais que não se conciliam',
    facts: [
      'PCH em operação desde 01/07/2024, com quatro programas em acompanhamento',
      'Três relatórios semestrais protocolados, um por semestre de operação',
      'Cada relatório declara os registros de inspeção ambiental do seu período',
      'O terceiro relatório declara também um total acumulado desde o início da operação',
    ],
    evidence: [
      '1º relatório semestral (jul a dez/2024)',
      '2º relatório semestral (jan a jun/2025)',
      '3º relatório semestral (jul a dez/2025)',
      'Projeto de compensação aprovado e cronograma do PBA',
    ],
    // A serie e o coracao do caso: so somando os tres periodos se descobre que
    // o acumulado declarado nao fecha.
    serie: {
      titulo: 'Registros de inspeção ambiental (RIA) declarados pelo empreendedor',
      colunas: ['Relatório', 'Período', 'Declarado no período', 'Acumulado declarado'],
      linhas: [
        ['1º', 'jul a dez/2024', '71', 'não informado'],
        ['2º', 'jan a jun/2025', '68', 'não informado'],
        ['3º', 'jul a dez/2025', '76', '262'],
      ],
      nota: 'Some a coluna do período antes de responder.',
    },
    steps: ['Série', 'Conferência', 'Natureza', 'Consequência', 'Encaminhamento'],
    questions: [
      ['A soma dos três períodos declarados (71, 68 e 76) confere com os 262 acumulados do terceiro relatório?', 'nao'],
      ['A diferença aritmética, por si só, demonstra abandono ou continuidade dos programas?', 'nao'],
      ['O status declarado pelo empreendedor equivale ao status validado pelo IAT?', 'nao'],
      ['Cabe exigir série histórica única e conciliada, separando o valor de cada período do acumulado?', 'sim'],
      ['As solicitações dos três relatórios devem ser comunicadas de forma consolidada, em regra de uma única vez?', 'sim'],
    ],
    outcome: 'A soma dos períodos é 215 e o acumulado declarado é 262: há 47 registros sem origem demonstrada na série apresentada. A divergência comprova inconsistência quantitativa, mas não demonstra, por si só, abandono nem continuidade dos programas. O encaminhamento é diligência consolidada para conciliar a série por semestre e acumulada e apresentar evidências da execução efetiva, sem reapresentação integral do que já estiver comprovado.',
  },
  {
    // Residuos: o acumulado FECHA e mesmo assim nao e rastreavel. Consistencia
    // interna nao e demonstracao de metodo, e este e o engano mais fino da
    // analise de programas.
    id: 'prog-residuos', track: 'm08', label: 'Resíduos e unidades', type: 'PCH',
    title: 'Consolidação em toneladas sem metodologia de conversão',
    facts: [
      'As tabelas primárias discriminam resíduos em quilogramas, litros e unidades',
      'A consolidação por tipologia apresenta um valor único por semestre',
      'As considerações finais expressam o acumulado em toneladas',
      'A seção de indicadores do 3º relatório repete os dados do 2º semestre',
    ],
    evidence: [
      'Tabelas primárias por tipo de resíduo e unidade de medida',
      'Consolidação por tipologia de cada semestre',
      'Série de inspeções relacionadas ao programa',
      'Ato autorizativo de coleta e transporte de óleo lubrificante usado',
    ],
    serie: {
      titulo: 'Duas séries do mesmo programa, lado a lado',
      colunas: ['Relatório', 'Consolidado do período', 'Acumulado declarado', 'Inspeções do período'],
      linhas: [
        ['1º', '5.406,5', 'não informado', '16'],
        ['2º', '297,0', '5.703,5', '19'],
        ['3º', '194,5', '5.898,0', 'repete "19 do 2º semestre"'],
      ],
      nota: 'Confira as duas séries separadamente: uma fecha, a outra não.',
    },
    steps: ['Unidades', 'Consolidação', 'Inspeções', 'Indicadores', 'Encaminhamento'],
    questions: [
      ['O acumulado de resíduos (5.703,5 e depois 5.898,0) corresponde à soma dos consolidados anteriores?', 'sim'],
      ['Essa consistência aritmética demonstra, por si só, o método de conversão de litros para massa?', 'nao'],
      ['A série de inspeções fecha, somando 16 e 19 contra o acumulado de 46 informado?', 'nao'],
      ['Uma seção de indicadores que repete o período anterior demonstra os indicadores do período atual?', 'nao'],
      ['Separar os resultados por unidade, sem demonstrar a adequação ao programa aprovado e aos indicadores, resolve a lacuna metodológica?', 'nao'],
    ],
    outcome: 'O acumulado de resíduos fecha (5.406,5 mais 297,0 dá 5.703,5, e mais 194,5 dá 5.898,0), mas fechar não é ser rastreável: dados primários em litros, quilogramas e unidades viram um número único e depois toneladas, sem critério de conversão declarado. Já a série de inspeções não fecha: 16 mais 19 são 35, contra 46 acumulados. E a seção de indicadores do terceiro relatório reproduz o período anterior. Exigir metodologia rastreável; eventual apresentação separada por unidade precisa demonstrar compatibilidade com o programa aprovado e com seus indicadores, e não deve ser aceita automaticamente.',
  },
  {
    // Compensacao florestal: a acao existiu, mas foi lancada no semestre
    // errado. E o unico cenario em que a resposta certa para uma das fases e
    // "nao ha o que exigir", calibragem que a plataforma nunca treinou.
    id: 'prog-compensacao', track: 'm08', label: 'Cronologia e comprovação', type: 'PCH',
    title: 'Ação física real, atribuída ao período errado',
    facts: [
      'No 1º semestre o programa estava em formalização, sem execução física prevista',
      'O 2º relatório cobre 01/01/2025 a 30/06/2025',
      'O 2º relatório informa retirada de povoamento de pinus ocorrida no início de julho de 2025',
      'A previsão de início da restauração muda a cada relatório',
    ],
    evidence: [
      'Projeto de compensação aprovado e seu cronograma',
      'Registros fotográficos datados das áreas',
      'Período de abrangência declarado em cada relatório',
      'Indicadores de cobertura, regeneração e diversidade',
    ],
    serie: {
      titulo: 'Previsão de início da restauração, relatório a relatório',
      colunas: ['Relatório', 'Período coberto', 'Início previsto da restauração'],
      linhas: [
        ['1º', 'jul a dez/2024', '2025'],
        ['2º', 'jan a jun/2025', '2025'],
        ['3º', 'jul a dez/2025', '1º semestre de 2026'],
      ],
      nota: 'A reprogramação só aparece comparando os três relatórios.',
    },
    steps: ['Fase', 'Cronologia', 'Reprogramação', 'Exigível', 'Encaminhamento'],
    questions: [
      ['No 1º semestre, a ausência de restauração física caracteriza inconsistência a ser exigida?', 'nao'],
      ['Uma ação de julho de 2025 pode ser contabilizada como executada em relatório que cobre até 30/06/2025?', 'nao'],
      ['O registro da retirada do povoamento, sem confronto com o projeto, o cronograma e as evidências, basta para validá-la como execução do programa?', 'nao'],
      ['A postergação sucessiva do início exige justificativa e cronograma atualizado?', 'sim'],
      ['Preparar a área equivale a demonstrar a restauração e seus indicadores?', 'nao'],
    ],
    outcome: 'No primeiro semestre, a ausência de restauração física é compatível com a etapa preparatória descrita e com o cronograma apresentado no cenário. A retirada do povoamento foi relatada em julho de 2025 e não pode ser contabilizada no relatório encerrado em 30/06; tampouco deve ser validada como execução do programa sem confronto com o projeto aprovado, o cronograma e as evidências datadas. A postergação do início da restauração exige justificativa e cronograma atualizado. Preparar a área não demonstra restauração nem seus indicadores.',
  },
  {
    // Recomposicao de APP: o total nao fecha com as parcelas nem com a
    // cartografia, e o texto se contradiz sobre o plantio. Ensina o cruzamento
    // mais dificil, numero declarado contra base espacial.
    id: 'prog-app', track: 'm08', label: 'Programa de APP e cartografia', type: 'PCH',
    title: 'Total de APP que não fecha com as parcelas nem com a cartografia',
    facts: [
      'O texto informa redução total de 1,92 ha de APP',
      'Discrimina 0,88 ha na margem direita e 1,39 ha na margem esquerda',
      'A seção de indicadores registra que o plantio de mudas não foi realizado',
      'As considerações finais afirmam que houve plantio, monitoramento e manutenção',
    ],
    evidence: [
      'Cartografia do projeto técnico aprovado',
      'Quadro de redução e realocação de APP por margem',
      'Seção de indicadores do programa',
      'Considerações finais do relatório',
    ],
    serie: {
      titulo: 'Redução de APP: total declarado contra as parcelas',
      colunas: ['Item', 'Valor declarado'],
      linhas: [
        ['Margem direita', '0,88 ha'],
        ['Margem esquerda', '1,39 ha'],
        ['Total informado no texto', '1,92 ha'],
      ],
      nota: 'Some as margens e compare com o total informado.',
    },
    steps: ['Parcelas', 'Total', 'Cartografia', 'Contradição', 'Encaminhamento'],
    questions: [
      ['A soma das parcelas por margem (0,88 e 1,39) confere com o total informado de 1,92 ha?', 'nao'],
      ['A divergência deve ser compatibilizada também com a cartografia do projeto aprovado?', 'sim'],
      ['Indicadores e considerações finais podem afirmar coisas opostas sobre o plantio?', 'nao'],
      ['Sem confrontar projeto, cronograma, licença e evidências, é possível concluir se a ausência de plantio caracteriza descumprimento?', 'nao'],
      ['A avaliação do semestre deve ficar vinculada às ações efetivamente comprovadas?', 'sim'],
    ],
    outcome: 'As parcelas somam 2,27 ha e o texto declara 1,92 ha: divergência de 0,35 ha que precisa ser corrigida e compatibilizada com a cartografia do projeto. O relatório também se contradiz: os indicadores registram que o plantio não ocorreu e as considerações finais afirmam que ocorreu. Sem confrontar projeto aprovado, cronograma, licença e evidências, não é possível classificar a ausência de plantio como cumprimento ou descumprimento. A avaliação do semestre deve ficar vinculada às ações efetivamente comprovadas.',
  },
  {
    // Triagem de condicionantes. O POP define seis elementos de qualidade
    // (Quadro 40) e sete defeitos a evitar (item 24.1), mas a plataforma nunca
    // pedia para JULGAR uma condicionante escrita. As seis abaixo foram
    // redigidas para exibir um defeito cada, exceto uma que atende ao padrao.
    id: 'condic-triagem', track: 'm12', label: 'Triagem de condicionantes', type: 'PCH',
    title: 'Seis condicionantes na mesa: quais sobrevivem ao padrão de qualidade',
    facts: [
      'Minuta de licença com seis condicionantes propostas pela equipe',
      'O Quadro 40 do POP define verbo de ação, objeto, prazo, indicador, responsabilidade e forma de comprovação',
      'O item 24.1 lista as condicionantes que devem ser evitadas',
      'Uma das pendências do processo é crítica e impede a decisão segura',
    ],
    evidence: [
      'Quadro 40 do POP, padrão de qualidade das condicionantes',
      'Item 24.1, condicionantes que devem ser evitadas',
      'Quadro 41, foco de condicionantes por fase',
      'Checklist com a classificação de gravidade das pendências',
    ],
    serie: {
      titulo: 'Condicionantes propostas, como foram escritas',
      colunas: ['Nº', 'Texto proposto'],
      linhas: [
        ['1', 'Cumprir a legislação ambiental vigente.'],
        ['2', 'Apresentar, a cada 6 meses contados da emissão desta licença, relatório de execução do programa de monitoramento da qualidade da água, com ART e laudos laboratoriais dos parâmetros previstos.'],
        ['3', 'O empreendedor deverá definir se a supressão adicional identificada é ou não passível de autorização.'],
        ['4', 'Apresentar as poligonais da ADA e da casa de força, ausentes no processo, necessárias para analisar APP e supressão.'],
        ['5', 'Manter o monitoramento de fauna.'],
        ['6', 'Comprovar a compensação quando expedido o regulamento indicado no art. 5º da Lei nº 20.929/2021.'],
      ],
      nota: 'Julgue cada uma pelos seis elementos do Quadro 40 antes de responder.',
    },
    steps: ['Padrão', 'Genérica', 'Competência', 'Pendência', 'Redação'],
    questions: [
      ['A condicionante 1 atende ao padrão de qualidade, com prazo, indicador e forma de comprovação?', 'nao'],
      ['A condicionante 2 reúne verbo de ação, objeto definido, prazo, indicador e forma de comprovação?', 'sim'],
      ['A condicionante 3 é admissível, mandando o empreendedor decidir se cabe autorização?', 'nao'],
      ['A condicionante 4 pode substituir a diligência de uma pendência crítica que impede a decisão?', 'nao'],
      ['A condicionante 6 pode manter a redação transitória depois do Decreto Estadual nº 7.150/2024?', 'nao'],
    ],
    outcome: 'Só a condicionante 2 sobrevive: ela tem verbo de ação, objeto definido, prazo, indicador e forma de comprovação. A 1 repete obrigação legal sem relação direta com o empreendimento e sem nada verificável. A 3 transfere ao empreendedor competência decisória do órgão. A 4 tenta resolver por condicionante uma pendência crítica que precisa ser sanada antes do deferimento, e por isso volta para diligência. A 5 não tem prazo, indicador nem forma de comprovação. A 6 mantém redação transitória que não deve mais ser utilizada depois da publicação do Decreto Estadual nº 7.150/2024.',
  },
];

// Agrupamento dos casos por NATUREZA DO TRABALHO, não por módulo.
//
// Com 26 casos numa fita única de abas, achar o caso certo virou impossível e a
// progressão ficou invisível: nada dizia que comparar três relatórios ao longo
// do tempo é trabalho de outra ordem que enquadrar uma fase. Os grupos abaixo
// ordenam do primeiro contato ao julgamento que exige experiência.
//
// O nível descreve a EXIGÊNCIA do caso, não o tempo de casa de quem resolve.
export const GRUPOS_LAB = [
  {
    id: 'fundamentos',
    titulo: 'Fundamentos e método',
    nivel: 'Primeiro contato',
    resumo: 'O que fundamenta uma exigência, que norma se aplica e como ler o processo antes de julgar.',
    ids: ['escopo', 'transicao', 'triagem'],
  },
  {
    id: 'fases',
    titulo: 'Enquadramento e fases',
    nivel: 'Aplicação',
    resumo: 'Qual é o objeto de cada fase e o que se decide em cada uma, sem transportar exigência de uma para a outra.',
    ids: ['cp', 'cp-antiga', 'las', 'lp', 'li', 'lo', 'rlo', 'rlo-vencida'],
  },
  {
    id: 'territorio',
    titulo: 'Estudos, território e interfaces',
    nivel: 'Aplicação',
    resumo: 'Suficiência do estudo, base espacial, unidades de conservação e os limites de competência de cada órgão.',
    ids: ['estudos', 'pacuera', 'uc-apa', 'geo-insuficiente', 'barragem', 'intervenientes', 'delegado'],
  },
  {
    id: 'decisao',
    titulo: 'Decisão e produto técnico',
    nivel: 'Avançado',
    resumo: 'Transformar achado em encaminhamento proporcional e escrever o que sustenta a decisão.',
    ids: ['condicionantes', 'condic-triagem', 'revisao', 'integrador'],
  },
  {
    id: 'programas',
    titulo: 'Acompanhamento de programas',
    nivel: 'Especialista',
    resumo: 'Comparar relatórios ao longo do tempo e distinguir a natureza do achado: execução, rastreabilidade, cronologia ou base espacial.',
    ids: ['prog-semestral', 'prog-residuos', 'prog-compensacao', 'prog-app'],
  },
];

// Rubrica da fundamentacao. `termos` sao os sinais procurados no texto escrito,
// comparados sem acento e sem caixa. E conferencia de termo, nao avaliacao do
// raciocinio, e a interface diz isso ao mostrar o resultado.
export const RUBRICAS = {
  'condic-triagem': {
    elementos: [
      { rot: 'Os seis elementos do padrão', termos: ['prazo', 'indicador', 'comprova', 'verbo', 'objeto', 'responsab'] },
      { rot: 'Obrigação legal genérica não é condicionante', termos: ['generic', 'genéric', 'obrigacao legal', 'obrigação legal', 'repete', 'relacao direta', 'relação direta'] },
      { rot: 'Competência decisória não se transfere', termos: ['competenc', 'competênc', 'transfer', 'decisor', 'decisór', 'orgao', 'órgão'] },
      { rot: 'Pendência crítica volta para diligência', termos: ['critic', 'crític', 'diligencia', 'diligência', 'antes do deferimento', 'impede'] },
    ],
    modelo: 'Análise: das seis condicionantes propostas, apenas a segunda reúne os elementos do Quadro 40, porque traz verbo de ação, objeto definido, prazo de seis meses, indicador na forma de laudos laboratoriais e forma de comprovação com ART. A primeira repete obrigação legal genérica, sem relação direta com o empreendimento e sem nada verificável; a quinta não tem prazo, indicador nem forma de comprovação. Comentário: a terceira transfere ao empreendedor competência decisória do órgão ambiental, o que o item 24.1 veda expressamente. A quarta tenta resolver por condicionante uma pendência crítica que impede a decisão segura e que, por isso, deve ser sanada antes do deferimento. A sexta mantém redação transitória que não deve mais ser utilizada depois da publicação do Decreto Estadual nº 7.150/2024. Solicitações: manter apenas a segunda condicionante; reescrever a primeira e a quinta com prazo, indicador e forma de comprovação, ou suprimi-las; devolver a quarta para diligência; e retirar a terceira e a sexta da minuta.',
  },
  'prog-residuos': {
    elementos: [
      { rot: 'Unidades primárias distintas', termos: ['litro', 'quilograma', 'unidade', 'convers', 'massa', 'tonelada'] },
      { rot: 'Fechar não é ser rastreável', termos: ['rastreav', 'rastreáv', 'metodolog', 'criterio', 'critério'] },
      { rot: 'Série de inspeções não concilia', termos: ['16', '19', '46', '35', 'inspec', 'inspeç'] },
      { rot: 'Indicadores do período repetidos', termos: ['repet', 'reproduz', 'periodo anterior', 'período anterior'] },
    ],
    modelo: 'Análise: os dados primários discriminam resíduos em quilogramas, litros e unidades, e a consolidação por tipologia apresenta valor único por semestre, depois expresso em toneladas. O acumulado declarado corresponde à soma dos consolidados anteriores. Já a série de inspeções não concilia: 16 no primeiro período e 19 no segundo somam 35, contra 46 informados como acumulado. Comentário: a consistência aritmética do acumulado não substitui a demonstração da metodologia de conversão dos volumes em massa, de modo que a consolidação não é rastreável na forma apresentada. A seção de indicadores do terceiro relatório reproduz os dados do período anterior, e por isso os indicadores do semestre não ficam demonstrados. Solicitações: apresentar metodologia e critérios rastreáveis; se forem propostos resultados separados por unidade, demonstrar a compatibilidade dessa forma de reporte com o programa aprovado e com seus indicadores; conciliar a série de inspeções; e refazer a seção de indicadores com os registros específicos do período.',
  },
  'prog-compensacao': {
    elementos: [
      { rot: 'Etapa preparatória não gera exigência', termos: ['preparat', 'formaliza', 'administrativ', 'nao ha', 'não há'] },
      { rot: 'Ação no semestre em que ocorreu', termos: ['julho', 'periodo', 'período', '30/06', 'cronolog'] },
      { rot: 'Ação relatada requer comprovação', termos: ['projeto aprovado', 'cronograma', 'evidencia', 'evidência', 'comprova', 'valid'] },
      { rot: 'Preparar não é restaurar', termos: ['restaura', 'indicador', 'cobertura', 'regenera', 'diversidade'] },
    ],
    modelo: 'Análise: no primeiro semestre o programa estava em formalização e preparação, etapa em que a ausência de restauração física é compatível com o cronograma apresentado no cenário. O segundo relatório cobre até 30/06/2025 e informa retirada do povoamento ocorrida no início de julho, ação que pertence ao período seguinte. Comparando os três, a previsão de início da restauração passou de 2025 para o primeiro semestre de 2026. Comentário: a retirada é uma ação relatada; só pode ser validada como execução do programa depois do confronto com o projeto aprovado, o cronograma e as evidências datadas. Preparar a área não equivale a restaurar. Solicitações: vincular cada ação ao semestre em que ocorreu, comprovar sua correspondência com o programa aprovado, justificar a reprogramação e apresentar cronograma atualizado e indicadores da restauração.',
  },
  'prog-app': {
    elementos: [
      { rot: 'Total contra as parcelas', termos: ['0,88', '1,39', '2,27', '1,92', '0,35', 'margem'] },
      { rot: 'Compatibilização com a cartografia', termos: ['cartograf', 'projeto aprovado', 'base espacial', 'espacial'] },
      { rot: 'Contradição interna sobre o plantio', termos: ['plantio', 'contradi', 'indicador', 'considera'] },
      { rot: 'Cumprimento depende do confronto documental', termos: ['descumprimento', 'cronograma', 'licenca', 'licença', 'projeto', 'evidencia', 'evidência'] },
    ],
    modelo: 'Análise: o relatório informa redução total de 1,92 ha de APP e discrimina 0,88 ha na margem direita e 1,39 ha na margem esquerda, cuja soma é 2,27 ha, restando divergência de 0,35 ha. A seção de indicadores registra que o plantio de mudas não foi realizado, enquanto as considerações finais afirmam que houve plantio, monitoramento e manutenção. Comentário: a divergência quantitativa precisa ser corrigida e compatibilizada com a cartografia do projeto aprovado. A contradição interna compromete a leitura do que foi efetivamente executado. Sem confrontar projeto, cronograma, licença e evidências, não é possível classificar a ausência de plantio como cumprimento ou descumprimento. Solicitações: corrigir o quantitativo compatibilizando total, parcelas e cartografia; esclarecer o que foi efetivamente realizado; e manter a avaliação vinculada às ações comprovadas.',
  },
  'prog-semestral': {
    elementos: [
      { rot: 'Conferência aritmética da série', termos: ['215', '262', '47', '71', 'soma', 'acumulad', 'concilia'] },
      { rot: 'Declarado não é validado', termos: ['declarad', 'validad', 'evidencia', 'evidência', 'comprova'] },
      { rot: 'Não concluir abandono nem continuidade', termos: ['abandono', 'continuidade', 'nao demonstra', 'não demonstra', 'evidencia', 'evidência'] },
      { rot: 'Encaminhamento consolidado', termos: ['consolidad', 'uma unica vez', 'uma única vez', 'diligencia', 'diligência'] },
    ],
    modelo: 'Análise: os três relatórios declaram 71, 68 e 76 registros de inspeção nos respectivos períodos, e o terceiro informa 262 acumulados desde o início da operação. A soma dos períodos é 215, de modo que 47 registros do acumulado não têm origem demonstrada na série apresentada. Comentário: a divergência comprova inconsistência quantitativa, mas não demonstra, por si só, abandono nem continuidade dos programas. O status declarado pelo empreendedor não equivale ao status validado pelo IAT. Solicitações: apresentar série histórica única e conciliada desde o primeiro semestre, esclarecer a origem da diferença de 47 registros e relacionar a série às evidências de execução. Encaminho as solicitações de forma consolidada, sem exigir reapresentação integral do que já estiver comprovado.',
  },
  cp: {
    elementos: [
      { rot: 'Entrada mínima conferida', termos: ['conteudo', 'conteúdo', 'memorial', 'arranjo', 'ada', 'kmz', 'kml'] },
      { rot: 'Sensibilidade ambiental do entorno', termos: ['unidade de conserva', 'uc', 'sensibilidade', '600'] },
      { rot: 'Alcance e validade da manifestação', termos: ['24 meses', 'prioridade', 'dominio', 'domínio', 'orientativ', 'nao prorrog', 'não prorrog'] },
      { rot: 'Limites da Consulta Prévia', termos: ['nao substitui', 'não substitui', 'viabilidade', 'prioridade', 'reserva'] },
    ],
    modelo: 'A presença nominal das peças não basta para concluir suficiência. É preciso conferir se o Memorial, o mapa da ADA e o arquivo KML ou KMZ caracterizam o arranjo integral e a localização. A proximidade de cerca de 600 m de unidade de conservação deve integrar a análise de sensibilidade e orientar os estudos futuros. Se a entrada mínima estiver demonstrada, a Consulta Prévia pode orientar modalidade e estudo prováveis. A manifestação vale 24 meses, não é prorrogável, não assegura prioridade, não confere domínio e não substitui o licenciamento nem o juízo de viabilidade ambiental.',
  },
  las: {
    elementos: [
      { rot: 'Potência isolada não fecha o enquadramento', termos: ['3 mw', 'potencia', 'potência', 'alagamento', 'ida', 'supress', 'territorial'] },
      { rot: 'Insuficiência da base cartográfica', termos: ['ponto', 'poligonal', 'kmz', 'cartograf', 'geoespacial'] },
      { rot: 'Consequência técnica da lacuna', termos: ['app', 'supress', 'ada', 'impede', 'delimit'] },
      { rot: 'Encaminhamento proporcional', termos: ['diligencia', 'diligência', 'complementa', 'exigir'] },
    ],
    modelo: 'A potência de 3 MW, isoladamente, não permite concluir pelo enquadramento em LAS. É necessário conferir também área de alagamento, IDA, supressão, sensibilidade e filtros territoriais. Além disso, o KMZ apresenta apenas o ponto da barragem, e ponto isolado não delimita empreendimento hidrelétrico complexo. Sem as poligonais da ADA, do reservatório e da casa de força não é possível analisar APP, supressão de vegetação e interferências. Proponho diligência para completar a base geoespacial e a memória de enquadramento, mantendo separadas a definição da modalidade e a suficiência documental.',
  },
  lp: {
    elementos: [
      { rot: 'Fase e objeto da decisão', termos: ['lp', 'previa', 'prévia', 'viabilidade', 'concep', 'localiza'] },
      { rot: 'Alternativas locacionais do EIA', termos: ['alternativ', 'eia', 'locacional'] },
      { rot: 'Participação pública', termos: ['audiencia', 'audiência', 'publica', 'pública', 'rima'] },
      { rot: 'Limite da LP e condicionantes', termos: ['nao autoriza', 'não autoriza', 'instala', 'li', 'condicionante'] },
    ],
    modelo: 'A Licença Prévia decide sobre a viabilidade ambiental e a concepção do empreendimento, não sobre a obra. A análise considera o EIA e as alternativas locacionais avaliadas, que não podem ser ignoradas na motivação. A audiência pública, exigível nos processos sujeitos a EIA, integra a instrução e suas contribuições devem ser registradas e analisadas. A conclusão pela viabilidade não autoriza instalar: a instalação depende de LI, e as condicionantes desta fase preparam a fase seguinte.',
  },
  li: {
    elementos: [
      { rot: 'Correspondência entre projeto e LP', termos: ['lp', 'projeto executivo', 'corresponde', 'divergen'] },
      { rot: 'Caracterização da alteração', termos: ['eixo', 'cota', 'ada', '40 m', '1,5', 'amplia'] },
      { rot: 'Consequência: reanálise proporcional', termos: ['reanalise', 'reanálise', 'proporcional', 'reabre', 'nova analise', 'nova análise'] },
      { rot: 'Registro e limite da fase', termos: ['registr', 'nao autoriza', 'não autoriza', 'operar', 'lo'] },
    ],
    modelo: 'A LI deve verificar se o projeto executivo corresponde à concepção aprovada na LP. O deslocamento do eixo em cerca de 40 m, a elevação de 1,5 m na cota e a consequente ampliação da ADA são alterações relevantes do arranjo. Alteração relevante reabre análise proporcional antes da instalação, com registro expresso da divergência e de sua consequência ambiental. A existência da LP não convalida a divergência, e a LI não autoriza operar: a operação depende da LO.',
  },
  lo: {
    elementos: [
      { rot: 'Correspondência as built e LI', termos: ['as built', 'as-built', 'corresponde', 'instalado', 'licenciado'] },
      { rot: 'Comprovação das condicionantes', termos: ['condicionante', 'evidencia', 'evidência', 'comprova'] },
      { rot: 'Autorização de enchimento', termos: ['enchimento', 'autoriza'] },
      { rot: 'Encaminhamento antes do ato', termos: ['diligencia', 'diligência', 'antes', 'exigir', 'pendente'] },
    ],
    modelo: 'A LO verifica se o instalado corresponde ao licenciado, confrontando o as built com o projeto aprovado na LI, e a divergência identificada deve ser registrada e avaliada. Duas condicionantes da LI estão sem comprovação anexada, e o status declarado pelo empreendedor não equivale ao status validado pelo IAT. O enchimento do reservatório depende de autorização específica, ainda pendente. Proponho exigir a comprovação das condicionantes e a autorização de enchimento antes da emissão da LO.',
  },
  rlo: {
    elementos: [
      { rot: 'Tempestividade e efeitos conferidos', termos: ['tempestiv', '130 dias', 'vencimento', 'regime temporalmente', 'efeitos do protocolo'] },
      { rot: 'Fato novo identificado', termos: ['unidade de conserva', 'uc', 'fato novo', 'decreto'] },
      { rot: 'Reanálise e condicionantes', termos: ['reavalia', 'reanalis', 'reanális', 'condicionante', 'nova'] },
      { rot: 'Validação do declarado', termos: ['declarad', 'validad', 'evidencia', 'evidência', 'automonitor'] },
    ],
    modelo: 'A informação de protocolo 130 dias antes do vencimento precisa ser conferida na licença, no comprovante e no regime temporalmente aplicável antes de qualquer conclusão sobre tempestividade e seus efeitos. A criação de unidade de conservação no entorno é fato novo relevante e deve ser considerada na análise desta fase. O fato novo pode gerar reavaliação e condicionantes proporcionais ao impacto e à fase. O automonitoramento em dia não torna a renovação automática: o status declarado pelo empreendedor precisa ser validado por evidência.',
  },
  pacuera: {
    elementos: [
      { rot: 'Diagnóstico integrado do entorno', termos: ['diagnostic', 'diagnóstic', 'entorno', 'fragilidade'] },
      { rot: 'Zoneamento por UTHs', termos: ['uth', 'zoneamento', 'unidade territorial', 'zona'] },
      { rot: 'Participação social', termos: ['participa', 'social', 'sociedade'] },
      { rot: 'Implementação, indicadores e revisão', termos: ['implementa', 'indicador', 'revis', 'monitor'] },
    ],
    modelo: 'A minuta de PACUERA não apresenta diagnóstico integrado suficiente do entorno, base necessária para o zoneamento. O zoneamento deve ser estruturado por Unidades Territoriais Homogêneas, com delimitação, fundamento técnico, capacidade de suporte e diretrizes de uso por zona, o que não ocorre. A participação social é etapa exigível e não há registro dela no processo. Os usos já consolidados no entorno não dispensam o zoneamento, e a aprovação deve prever implementação, indicadores e revisão periódica.',
  },
  'rlo-vencida': {
    elementos: [
      { rot: 'Tempestividade e efeitos conferidos', termos: ['tempestiv', '130 dias', 'vencimento', 'regime aplicavel', 'regime aplicável', 'prorrogacao', 'prorrogação'] },
      { rot: 'Declarado não é validado', termos: ['declarad', 'validad', '100', 'status'] },
      { rot: 'Evidência por condicionante', termos: ['evidencia', 'evidência', 'condicionante', 'anexo', 'comprova'] },
      { rot: 'Regularidade não presumida', termos: ['regularidade operacional', 'historico de notific', 'histórico de notific', 'eventuais impedimentos'] },
    ],
    modelo: 'O relatório afirma que a renovação foi protocolada 130 dias antes do vencimento, mas essa informação precisa ser conferida na licença, no comprovante e no regime aplicável antes de concluir sobre tempestividade, prorrogação ou regularidade operacional. O relatório declara 100% das condicionantes cumpridas sem anexar evidências, e status declarado não equivale a status validado pelo IAT. A conclusão exige evidência condicionante a condicionante, sendo insuficiente o automonitoramento em dia para suprir as demais obrigações. O histórico de notificações e eventuais impedimentos deve ser confrontado com o declarado.',
  },
  'geo-insuficiente': {
    elementos: [
      { rot: 'Insuficiência do ponto isolado', termos: ['ponto', 'nao delimita', 'não delimita', 'insuficien'] },
      { rot: 'Estruturas sem poligonal', termos: ['casa de forca', 'casa de força', 'aducao', 'adução', 'reservatorio', 'reservatório', 'tvr'] },
      { rot: 'Consequência para o mérito', termos: ['app', 'supress', 'interferenc', 'interferênc', 'locacional', 'impede'] },
      { rot: 'Encaminhamento', termos: ['diligencia', 'diligência', 'poligonal', 'geoespacial', 'exigir'] },
    ],
    modelo: 'O KMZ apresenta apenas o ponto da barragem, e ponto isolado não delimita empreendimento hidrelétrico complexo. Casa de força, adução, reservatório e o trecho de vazão reduzida de 3,1 km não têm poligonal, estando descritos apenas em texto. Sem a base espacial completa não é possível analisar APP, supressão e interferências, nem concluir sobre o mérito locacional. Proponho diligência documental para apresentação dos arquivos geoespaciais de todo o arranjo, com retomada da análise após o saneamento.',
  },
  'cp-antiga': {
    elementos: [
      { rot: 'Validade da manifestação anterior', termos: ['24 meses', 'venc', 'validade', 'nao prorrog', 'não prorrog', '4 anos'] },
      { rot: 'Norma vigente na data do protocolo', termos: ['vigente', 'data do protocolo', 'norma'] },
      { rot: 'Enquadramento refeito', termos: ['enquadr', 'matriz', 'modalidade'] },
      { rot: 'Registro da transição', termos: ['transic', 'transiç', 'justificativa', 'registr', 'data'] },
    ],
    modelo: 'A manifestação de Consulta Prévia citada tem quatro anos e a validade é de 24 meses, não prorrogável, de modo que não vincula o enquadramento atual. O enquadramento deve ser refeito pela matriz vigente na data do protocolo da LP, considerando a alteração normativa ocorrida após a Consulta Prévia. A manifestação antiga pode ser citada como contexto histórico do processo, nunca como aprovação de viabilidade. Registro a data do protocolo, a norma aplicada e a justificativa da regra de transição.',
  },
  escopo: {
    elementos: [
      { rot: 'Fundamento real da exigência', termos: ['norma', 'termo de referencia', 'termo de referência', ' tr ', 'condicionante', 'fato novo'] },
      { rot: 'Limite do POP', termos: ['pop', 'nao cria', 'não cria', 'metodo', 'método', 'nao substitui', 'não substitui'] },
      { rot: 'Competência de outro órgão', termos: ['outorga', 'aneel', 'iphan', 'setorial', 'juridic', 'jurídic'] },
      { rot: 'Registro da limitação', termos: ['limitac', 'limitaç', 'pendente de validacao', 'pendente de validação', 'registr', 'explicit'] },
    ],
    modelo: 'A exigência não pode ter o POP como fundamento autônomo, porque o procedimento organiza o método e não cria exigência documental própria. O fundamento deve ser identificado na norma aplicável, no Termo de Referência pertinente, no SGA, em condicionante anterior, em fato novo ou em inconsistência técnica, e assim deve ser reescrito. A ausência de outorga e de ato da ANEEL é matéria de competência setorial e não pode ser suprida por decisão do licenciamento. O ponto que depende de interpretação normativa fica registrado como Pendente de validação, com a limitação anotada de forma explícita, sem criar solução normativa própria.',
  },
  transicao: {
    elementos: [
      { rot: 'Data do protocolo e vigência', termos: ['data', 'protocolo', 'vigor', 'vigente'] },
      { rot: 'Estágio processual e regime aplicado', termos: ['estagio', 'estágio', 'regime', 'fase', 'etapa'] },
      { rot: 'Transição estadual e federal separadas', termos: ['173', '9.541', 'estadual', '15.190', 'federal', '60'] },
      { rot: 'Ausência de retroatividade automática', termos: ['retroativ', 'automat', 'automát', 'nao se aplica', 'não se aplica'] },
    ],
    modelo: 'Registro a data do protocolo, a data de entrada em vigor considerada nos termos do art. 67 e o estágio processual existente nessa data. O regime jurídico aplicado é indicado com a respectiva justificativa, sem aplicação retroativa automática de exigência nova ao processo antigo. A motivação separa a transição estadual, com atenção ao art. 173 do Decreto Estadual nº 9.541/2025, da transição federal do art. 60 da Lei Federal nº 15.190/2025. A etapa em curso preserva as obrigações e os cronogramas já estabelecidos até sua conclusão, e as etapas subsequentes observam a legislação vigente.',
  },
  triagem: {
    elementos: [
      { rot: 'Objeto e histórico antes da suficiência', termos: ['objeto', 'historico', 'histórico', 'cronolog', 'requerimento'] },
      { rot: 'Documento de outro empreendimento', termos: ['outro empreendimento', 'corpo hidrico', 'corpo hídrico', 'inconsisten', 'critic', 'crític'] },
      { rot: 'Titularidade sem ato formal', termos: ['titular', 'transferenc', 'transferênc', 'anuenc', 'anuênc'] },
      { rot: 'Aproveitamento do estudo antigo', termos: ['2016', 'estudo antigo', 'compativ', 'compatív', 'atual'] },
    ],
    modelo: 'A leitura partiu do objeto do requerimento e do histórico do processo, antes de qualquer juízo de suficiência. O anexo que identifica outro empreendimento e outro corpo hídrico é inconsistência de gravidade crítica, por afetar a própria identificação do objeto analisado. A divergência de titularidade sem ato administrativo formal de transferência, anuência e assunção de condicionantes constitui pendência crítica. O estudo de 2016 só é aproveitável mediante demonstração de compatibilidade com o projeto atual, a fase, a área de influência e a realidade ambiental atuais, razão pela qual proponho diligência antes do mérito.',
  },
  barragem: {
    elementos: [
      { rot: 'Vínculo funcional e titularidade', termos: ['vinculo', 'vínculo', 'titular', 'linha', 'subestac', 'subestaç'] },
      { rot: 'Incidência da PNSB pelas características', termos: ['pnsb', '12.334', '14.066', 'caracteristic', 'característic', 'risco', 'dano potencial'] },
      { rot: 'Documentos do órgão fiscalizador', termos: ['psb', 'pae', 'fiscalizador', 'aneel', 'inspec', 'inspeç'] },
      { rot: 'Limite da manifestação ambiental', termos: ['nao substitui', 'não substitui', 'estabilidade', 'limite', 'atribuic', 'atribuiç'] },
    ],
    modelo: 'A linha de transmissão, a subestação, o canteiro, a jazida e o bota-fora são tratados conforme vínculo funcional, localização, titularidade e potencial de impacto, com justificativa expressa para análise conjunta ou separada. A incidência da Política Nacional de Segurança de Barragens é verificada pelas características e critérios legais da estrutura, e não pela classificação do empreendimento como PCH. Ausentes o PSB e o PAE, o processo deve ser diligenciado e o tema encaminhado ao órgão fiscalizador competente. A manifestação registra a consequência ambiental e os limites da análise, sem declarar estabilidade ou segurança estrutural, que estão fora da atribuição desta unidade.',
  },
  estudos: {
    elementos: [
      { rot: 'Versão do TR aplicável', termos: ['termo de referencia', 'termo de referência', ' tr ', 'versao', 'versão', 'vigente'] },
      { rot: 'Memorial compatível com o projeto', termos: ['memorial', 'desatualiz', 'projeto atual', 'arranjo'] },
      { rot: 'RDPA com programas verificáveis', termos: ['rdpa', 'programa', 'executav', 'executáv', 'verificav', 'verificáv', 'ras'] },
      { rot: 'Padrão cartográfico', termos: ['datum', 'projec', 'projeç', 'responsavel tecnic', 'responsável técnic', 'cartograf'] },
    ],
    modelo: 'Registro a versão do Termo de Referência aplicável, confirmada no processo e na fonte oficial, sem combinação automática de requisitos. O Memorial Descritivo descreve arranjo anterior ao projeto atual e precisa ser atualizado, porque estudo ambiental não corrige memorial desatualizado. O RDPA reproduz o diagnóstico do RAS e não transforma as propostas em programas executáveis e verificáveis, o que caracteriza insuficiência de conteúdo. A cartografia deve observar o padrão do TR, com projeção, datum, data e responsável técnico, e o cronograma futuro apresentado não substitui relatório de execução. Concluo por diligência, indicando a consequência técnica de cada lacuna e o encaminhamento proporcional à fase.',
  },
  intervenientes: {
    elementos: [
      { rot: 'Ato setorial compatível com a tipologia', termos: ['cgh', 'pch', 'aneel', 'setorial', 'potenc', 'potênc'] },
      { rot: 'Correspondência de fase e ADA', termos: ['fase', 'ada', 'corresponde', 'mesmo empreendimento'] },
      { rot: 'Fluxo do IPHAN', termos: ['iphan', 'saip', 'fca', 'sei'] },
      { rot: 'Limite de competência do IAT', termos: ['nao substitui', 'não substitui', 'competenc', 'competênc', 'compatibilidade'] },
    ],
    modelo: 'Para CGH não se exige automaticamente autorização ou concessão própria de PCH, e sim a documentação setorial vigente e compatível com titular, potência e fase, razão pela qual a exigência anterior deve ser corrigida. As manifestações dos intervenientes precisam corresponder ao mesmo empreendimento, à mesma fase e à mesma ADA, o que não ocorre com a manifestação do IPHAN juntada. O fluxo exige cadastro no SAIP com preenchimento da Ficha de Caracterização da Atividade e acompanhamento do processo no SEI, sem registro no processo atual. A anuência municipal genérica não permite verificar correspondência com o arranjo. O IAT verifica existência e compatibilidade dos atos setoriais e não substitui a decisão técnica do órgão competente.',
  },
  condicionantes: {
    elementos: [
      { rot: 'Qualidade da condicionante', termos: ['prazo', 'indicador', 'comprovac', 'comprovaç', 'mensurav', 'mensuráv', 'verificav', 'verificáv'] },
      { rot: 'Pendência crítica não vira condicionante', termos: ['critic', 'crític', 'impede', 'diligencia', 'diligência', 'antes do deferimento'] },
      { rot: 'Diligência de uma única vez', termos: ['unica vez', 'única vez', 'consolidad', '48', 'integrada'] },
      { rot: 'Compensação só com impacto não mitigável', termos: ['nao mitigav', 'não mitigáv', 'residual', 'compensac', 'compensaç'] },
    ],
    modelo: 'A condicionante que apenas repete obrigação legal, sem prazo, indicador ou forma de comprovação, não atende ao padrão de qualidade e deve ser reescrita ou suprimida. A pendência crítica convertida em condicionante impede decisão segura e precisa retornar à diligência, porque condicionante não sana o que deveria ser resolvido antes do deferimento. As exigências devem ser consolidadas após análise integrada e comunicadas, em regra, de uma única vez, conforme o art. 48 da Lei Federal nº 15.190/2025. A compensação por impacto não mitigável só é analisada se os estudos demonstrarem o impacto residual e o fundamento de sua caracterização, não decorrendo automaticamente da potência ou da tipologia. Concluo por diligência, uma vez que a lacuna é sanável e a manifestação não favorável não é resposta automática.',
  },
  revisao: {
    elementos: [
      { rot: 'Resíduo de outro processo', termos: ['outro empreendimento', 'outro processo', 'residuo', 'resíduo', 'eliminar'] },
      { rot: 'Coordenadas e unidades', termos: ['datum', 'zona', 'sistema', 'coordenada', 'unidade'] },
      { rot: 'Preservação do modelo institucional', termos: ['cabecalho', 'cabeçalho', 'rodape', 'rodapé', 'modelo', 'original', 'layout'] },
      { rot: 'Assinaturas e status de minuta', termos: ['minuta', 'assinatur', 'elaborac', 'elaboraç', 'aprovac', 'aprovaç', 'revisao', 'revisão'] },
    ],
    modelo: 'A revisão final elimina a referência a empreendimento de outro processo, que compromete a rastreabilidade e a segurança jurídica da manifestação. As coordenadas precisam indicar sistema, zona, datum e unidade, e o texto deve seguir o padrão institucional de siglas, números e citações normativas. O arquivo simplificado deve ser substituído pelo original ou cópia fiel, preservando cabeçalho, logotipos, rodapé, margens, numeração e campos institucionais. Enquanto elaboração, revisão e aprovação não estiverem formalmente identificadas, o arquivo permanece como minuta técnica e não declara validação concluída. Antes da entrega, o documento é renderizado em PDF e todas as páginas são inspecionadas, porque a conferência do texto extraído não substitui o controle visual.',
  },
  integrador: {
    elementos: [
      // "apresentad" sozinho casava com qualquer texto ("apresentado pelo
      // interessado"), entao o sinal aqui e o vocabulario da matriz.
      { rot: 'Apresentado não é suficiente', termos: ['suficien', 'checklist', 'exigibilidade', 'gravidade'] },
      { rot: 'Modelos adaptados ao caso', termos: ['modelo', 'anexo', 'adaptad', 'caso concreto'] },
      { rot: 'Restrição territorial do Plano de Manejo', termos: ['plano de manejo', 'zona', 'locacional', 'compatib', 'restric', 'restriç'] },
      { rot: 'Evidência das condicionantes da LP', termos: ['condicionante', 'lp', 'evidencia', 'evidência', 'comprova'] },
    ],
    modelo: 'O checklist marca todos os documentos como apresentados, mas apresentar não é sinônimo de suficiente: a matriz deve distinguir exigibilidade, status, gravidade, achado, consequência técnica e encaminhamento. Os modelos dos anexos foram aplicados sem ajuste e precisam ser adaptados ao caso concreto, verificando impacto, fase, competência, prazo e forma de comprovação. A incidência da ADA em zona definida pelo Plano de Manejo é questão de compatibilidade locacional; restrição material que torne a localização incompatível não deve ser convertida em condicionante. As duas condicionantes da LP sem evidência anexada não podem ser dadas por cumpridas nesta fase. A Informação Técnica interpreta o conjunto e explica a consequência das pendências, sem reproduzir integralmente o checklist.',
  },
  'uc-apa': {
    elementos: [
      { rot: 'Categoria e regime da UC', termos: ['apa', 'uso sustentav', 'uso sustentáv', 'categoria', 'ato de criac', 'ato de criaç'] },
      { rot: 'Filtro territorial da modalidade', termos: ['lac', '64', '9.541', 'afasta', 'modalidade'] },
      { rot: 'Zona de amortecimento não presumida', termos: ['amortecimento', ' za ', '25', 'snuc', '10 km', 'presum'] },
      { rot: 'Plano de Manejo e rastreabilidade', termos: ['plano de manejo', 'zoneamento', 'geopr', 'camada', 'fonte', 'data'] },
    ],
    modelo: 'A APA integra o grupo de Uso Sustentável e a existência de propriedade privada não elimina as restrições estabelecidas pelo Poder Público, devendo ser observados o ato de criação, o Plano de Manejo e o zoneamento. O art. 64, I, e, do Decreto Estadual nº 9.541/2025 afasta a LAC em Unidade de Conservação, inclusive APA, e a exceção federal do art. 22 da Lei nº 15.190/2025 não torna a LAC estadual automaticamente cabível. O raio de 10 km aplicado no estudo não pode ser tratado como zona de amortecimento, pois o art. 25 do SNUC exclui a APA da exigência de zona de amortecimento e valores de raio não a substituem. O zoneamento do Plano de Manejo vigente veda o uso pretendido naquela zona, o que é questão de compatibilidade locacional e não de condicionante. As camadas do GeoPR apoiam a conferência, mas não substituem a leitura do ato legal, e registro camada, fonte e data da consulta.',
  },
  delegado: {
    elementos: [
      { rot: 'Competência antes do mérito', termos: ['competenc', 'competênc', '300', '8.437', 'federal', 'transic', 'transiç'] },
      { rot: 'Delegação não converte o processo', termos: ['act', 'delegac', 'delegaç', 'nao converte', 'não converte', 'originar', 'origináv', 'originár'] },
      { rot: 'Objeto, vigência e fases do ACT', termos: ['vigenc', 'vigênc', 'objeto', 'fase', 'aditivo', 'pendente de validacao', 'pendente de validação'] },
      { rot: 'Compensação e RTAA', termos: ['compensac', 'compensaç', '26', 'rtaa', '31 de marco', '31 de março', 'ibama'] },
    ],
    modelo: 'A análise começa pela competência: a capacidade instalada de 320 MW atrai o Decreto Federal nº 8.437/2015, e o processo iniciado antes de sua publicação exige verificação da regra de transição do art. 4º, especialmente em pedido de renovação da Licença de Operação. Confirmada a competência federal, o IAT só conduz a execução se houver fundamento de delegação válido e compatível com a fase, sendo que a delegação por ACT não converte o processo em licenciamento estadual originário. Objeto, vigência, fases abrangidas, sistemas associados e termos aditivos do ACT devem ser confirmados antes de qualquer ato, e o que não puder ser confirmado fica registrado como Pendente de validação. A compensação ambiental não deve ser direcionada automaticamente ao fluxo estadual, pois o art. 26 da IN IBAMA nº 08/2019 a mantém sob responsabilidade do Ibama salvo previsão expressa em contrário no instrumento. Mantenho o registro contínuo dos atos do exercício, base do Relatório Técnico Anual de Atividades a ser encaminhado até 31 de março.',
  },
};
