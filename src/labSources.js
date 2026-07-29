import { LAB_SOURCE_INDEX } from './labSourceIndex.js';

// Camada de proveniência da simulação.
//
// O documento de origem é uma minuta técnica: estes vínculos ajudam o aluno a
// revisar a decisão, mas não convertem o POP em norma nem em validação
// institucional. Títulos e números legíveis das aulas não são duplicados aqui;
// a interface deve resolvê-los pelo lessonMap usando `sec`.
export const LAB_SOURCE_POLICY = Object.freeze({
  schemaVersion: 1,
  sourceTitle: 'POP de Licenciamento Ambiental de Empreendimentos Hidrelétricos',
  sourceDocument: 'POP ou Manual Hidreletricas IAT Julho de 2026 (Com APA, UCs, RTTA).docx',
  sourceVersion: '1.7 — julho de 2026',
  sourceSha256: '8ffa771546c244e194e6d7b41dd91d5ab3f56083e94c081e1e5c9a17f13f2c3c',
  institutionalStatus: 'technical-draft',
  institutionalStatusLabel: 'Minuta técnica',
  supportModes: Object.freeze({
    direct: 'A minuta do POP contém regra diretamente relacionada à decisão.',
    mixed: 'A decisão combina a minuta do POP com fatos do caso, cálculo, interpretação ou norma que ainda requer conferência técnica.',
  }),
  reviewStatuses: Object.freeze({
    'mapped-draft': 'Mapeamento técnico preliminar; não equivale a aprovação institucional.',
    'needs-technical-review': 'Conferência por responsável técnico obrigatória antes de tratar o vínculo como orientação validada.',
  }),
});

// Cada valor é um trecho literal de uma aula derivada do POP v1.7. O teste de
// contrato confere a literalidade também em células de quadros e tabelas.
export const POP_LAB_QUOTES = Object.freeze({
  'pop-section-003': 'Este procedimento não cria exigência documental autônoma. A exigência deve decorrer da norma aplicável, do Termo de Referência pertinente, do SGA, de condicionante anterior, de fato novo, de inconsistência técnica ou de ausência que impeça a decisão segura. Quando não houver elemento suficiente para concluir, o técnico deve registrar a limitação de forma explícita e proporcional.',
  'pop-section-004': 'A unidade de licenciamento deve verificar a existência e a compatibilidade de outorgas, atos setoriais e manifestações externas, mas não pode substituir a decisão técnica ou administrativa do órgão competente.',
  'pop-section-005': 'A análise deve partir da norma vigente aplicável ao caso concreto e da data do protocolo. Para processos antigos, deve ser verificada a regra de transição, sem aplicação retroativa automática de exigências novas, salvo quando houver previsão normativa, fato novo, alteração do empreendimento, inconsistência crítica ou ausência que impeça a decisão segura.',
  'pop-section-006': 'Para essa análise, devem ser registrados a data do protocolo, a data de entrada em vigor considerada conforme o art. 67, o estágio processual existente nessa data, o regime jurídico aplicado e a justificativa.',
  'pop-section-007': 'Os arts. 6º e 7º fixam faixas de validade e preveem prorrogação automática quando a renovação for requerida com antecedência mínima de 120 dias.',
  'pop-section-008': 'Até a definição institucional, o técnico deve registrar a pendência como Pendente de validação, sem criar solução normativa própria.',
  'pop-section-016': 'Faltam documentos exigíveis ou há documento vencido, ilegível ou incompatível.',
  'pop-section-017': 'Primeiro identifica-se o objeto do requerimento, depois se confere o histórico e, somente então, avalia-se suficiência documental.',
  'pop-section-018': '4. Levantar licenças anteriores, autorizações, Consulta Prévia, condicionantes, prazos, CRL, prorrogações, outorga, ato ANEEL e processos vinculados.',
  'pop-section-019': 'Ponto isolado em mapa não delimita empreendimento hidrelétrico complexo. Exigir poligonais e arquivos geoespaciais quando a análise depender de delimitação espacial.',
  'pop-section-022': 'A matriz abaixo é roteiro de conferência do regime estadual e não substitui a leitura do art. 9º, do Quadro 1, dos Termos de Referência vigentes e das peculiaridades do processo.',
  'pop-section-024': 'A manifestação tem validade de 24 meses, não é prorrogável, não assegura prioridade, não confere domínio e não equivale à aprovação de viabilidade ambiental.',
  'pop-section-025': 'Conforme o art. 36 da IN IAT nº 09/2025, a entrada mínima compreende mapa da delimitação da ADA, mapa digital do arranjo em formato KML ou KMZ e Memorial Descritivo, sem prejuízo de complementações necessárias para orientar a análise.',
  'pop-section-027': 'O analista deve trabalhar com o arranjo integral do empreendimento, incluindo barramento, reservatório ou área potencialmente alagável, tomada d\'água, adução, TVR, casa de força, restituição, acessos, áreas de apoio, subestação e linha ou ramal de conexão.',
  'pop-section-028': 'A simplicidade procedimental não elimina a necessidade de enquadramento correto, compatibilidade documental, rastreabilidade técnica, outorga, ARTs, cartografia adequada, autorizações específicas e avaliação dos impactos pertinentes.',
  'pop-section-032': 'Potência, área alagada, IDA, supressão, APP e modalidade.',
  'pop-section-033': 'A LP avalia localização e concepção, a LI autoriza instalação conforme projetos e programas, e a LO autoriza operação após verificação da implantação, do atendimento das condicionantes e da regularidade atual.',
  'pop-section-034': 'A LP deve analisar viabilidade ambiental, alternativas locacionais e tecnológicas, áreas de influência, impactos, medidas mitigadoras e compatibilidade com ordenamento territorial, recursos hídricos, intervenientes e restrições ambientais.',
  'pop-section-036': 'Quando houver UC ou APA, confirmar que o projeto executivo, as áreas de apoio e os sistemas associados permanecem nas zonas avaliadas e respeitam as condições do Plano de Manejo aplicável.',
  'pop-section-037': 'Não emitir LI com condicionante crítica da LP sem atendimento ou justificativa.',
  'pop-section-038': 'A LO deve verificar se o empreendimento foi implantado conforme licença e projeto aprovado, se as condicionantes foram atendidas, se os programas foram executados e se a operação projetada é compatível com outorga, ANEEL, segurança ambiental, vazão remanescente e obrigações de monitoramento.',
  'pop-section-039': 'Status declarado e evidências de atendimento.',
  'pop-section-040': 'Nos processos sujeitos a EIA, deve ser realizada pelo menos uma audiência pública antes da decisão final sobre a LP.',
  'pop-section-041': 'Na IN IAT nº 09/2025, possui aplicação expressa para enchimento de reservatório e testes de comissionamento de CGH submetida a RAS, PCH e UHE',
  'pop-section-043': 'Em RLO, RLAS, LASR, LOR, LIR, LOC ou licença corretiva amparada pelo regime aplicável, a análise deve focar a regularidade atual, a situação fática e a continuidade da operação, sem rediscutir integralmente a viabilidade locacional já apreciada, salvo fato novo, alteração, irregularidade, dano, inconsistência crítica, vencimento, mudança de titularidade ou ausência que impeça a decisão.',
  'pop-section-045': 'Número, validade, objeto, condicionantes, tempestividade e CRL ou prorrogação quando aplicável.',
  'pop-section-048': 'Transferência de titularidade não se confunde com comunicação societária. Deve haver ato administrativo do órgão ambiental, comprovação de poderes de representação, anuência ou documentação equivalente do titular anterior quando aplicável, assunção de condicionantes e passivos, atualização cadastral, compatibilidade com outorga e documentação setorial da ANEEL.',
  'pop-section-050': 'Alterações em empreendimentos hidrelétricos devem ser avaliadas conforme natureza, escala, fase, impactos adicionais e relação com a licença vigente.',
  'pop-section-051': 'A decisão deve registrar o vínculo funcional, a área de intervenção, a titularidade, a competência, os impactos cumulativos e a justificativa para análise conjunta ou separada.',
  'pop-section-053': 'A análise ambiental deve verificar documentos, riscos, comunidades potencialmente afetadas, medidas de prevenção e compatibilidade com o licenciamento, sem substituir a competência do órgão fiscalizador nem concluir sobre estabilidade estrutural fora da atribuição técnica da unidade.',
  'pop-section-054': 'A incidência da PNSB não decorre apenas da classificação do empreendimento como PCH ou UHE, devendo ser verificada conforme características e critérios legais da estrutura. O licenciamento ambiental não substitui PSB, PAE, inspeções, revisões periódicas ou instrumentos exigidos pelo órgão fiscalizador.',
  'pop-section-056': 'A manifestação do licenciamento deve registrar a consequência ambiental e os limites da análise, sem declarar estabilidade, segurança estrutural ou atendimento definitivo de obrigação cuja validação pertença a outro órgão.',
  'pop-section-057': 'A conclusão deve indicar suficiência, inconsistência, consequência técnica e encaminhamento proporcional.',
  'pop-section-058': 'Confrontar texto, tabelas, mapas, anexos, memorial, outorga, SGA e documentação ANEEL.',
  'pop-section-059': 'Plano de trabalho ou cronograma futuro não comprova execução.',
  'pop-section-060': 'Estudo ambiental antigo não corrige memorial desatualizado, e memorial não substitui análise de impactos.',
  'pop-section-063': 'O RDPA deve transformar as propostas básicas do RAS em programas executáveis e verificáveis. Não basta reproduzir o diagnóstico ou copiar o texto do RAS.',
  'pop-section-064': 'Alternativa de não implantação e, nos TRs examinados, três alternativas de projeto, com comparação locacional, construtiva e ambiental.',
  'pop-section-067': 'Sua análise deve ir além da presença formal do arquivo e verificar diagnóstico integrado, zoneamento, diretrizes de uso, monitoramento, participação social e compatibilidade com o empreendimento.',
  'pop-section-068': 'Conforme o TR PACUERA 2026, o plano deve ser protocolado simultaneamente ao PBA ou ao RDPA, conforme a licença e o estudo aplicáveis, e revisto obrigatoriamente a cada 10 anos.',
  'pop-section-069': 'Verificar responsabilidades, indicadores, cronograma, forma de reporte e resposta a conflitos ou desvios.',
  'pop-section-070': 'O zoneamento deve ser estruturado por Unidades Territoriais Homogêneas resultantes da síntese das fragilidades e potencialidades naturais e antrópicas.',
  'pop-section-072': 'O setor responsável considera o estudo apto quando o conteúdo mínimo permite a submissão à Consulta ou Audiência Pública.',
  'pop-section-074': 'Relatório de execução deve demonstrar o que foi realizado, quando, onde, por quem, com qual metodologia, quais resultados e indicadores foram obtidos, quais evidências foram anexadas, quais desvios ocorreram e quais providências foram adotadas.',
  'pop-section-076': 'O material cartográfico deve conter título, legenda, escala, orientação, projeção, datum, data, responsável técnico e compatibilidade com arquivos vetoriais, conforme a fase e a complexidade do arranjo.',
  'pop-section-078': 'KML, KMZ, shapefile ou equivalente com geometrias completas.',
  'pop-section-082': 'Manifestações do IPHAN, do Município, de unidades de conservação e das demais autoridades devem corresponder ao mesmo empreendimento, fase, ADA, AID e arranjo.',
  'pop-section-083': 'Cadastrar o interessado e o empreendimento no Sistema de Avaliação de Impacto ao Patrimônio, SAIP, e preencher a Ficha de Caracterização da Atividade, FCA.',
  'pop-section-089': 'Ele não deve apenas indicar presença de arquivo. Deve avaliar compatibilidade com o empreendimento, titular, fase, modalidade, estudo, outorga, ANEEL, cartografia e condicionantes.',
  'pop-section-090': 'O checklist controla a instrução; a Informação Técnica interpreta o conjunto; o Parecer Técnico Conclusivo deve observar a competência institucional e apresentar conclusão motivada.',
  'pop-section-092': 'A diligência deve ser consolidada após análise integrada do processo e comunicada, em regra, de uma única vez, ressalvadas exigências decorrentes de fatos novos ou de fundamento superveniente devidamente registrado, conforme art. 48 da Lei Federal nº 15.190/2025.',
  'pop-section-094': 'Devem ser claras, mensuráveis, verificáveis, proporcionais e acompanhadas de prazo e forma de comprovação.',
  'pop-section-095': 'Condicionante que tenta sanar pendência crítica que deveria ser resolvida antes do deferimento.',
  'pop-section-096': 'Complementação de projetos, detalhamento de programas, obtenção de manifestações, estudos de campo, alternativas e medidas para próxima fase.',
  'pop-section-098': 'Inadequação de modalidade deve levar prioritariamente à reclassificação ou adequação do pedido quando juridicamente possível; manifestação não favorável exige motivação técnica suficiente e não deve ser utilizada como resposta automática a lacuna sanável.',
  'pop-section-099': 'Enquanto não houver elaboração, revisão e aprovação formalmente identificadas, o arquivo deve ser denominado minuta técnica e não pode declarar validação institucional concluída.',
  'pop-section-100': 'Editar o arquivo original ou cópia fiel, preservando cabeçalho, logotipos, rodapé, margens, orientação, fontes predominantes, numeração de páginas, tabelas de identificação, assinaturas, campos institucionais e quebras de seção.',
  'pop-section-103': 'Coordenadas devem indicar sistema, zona, datum e unidade.',
  'pop-section-105': '“Apresenta” não significa automaticamente “suficiente”.',
  'pop-section-106': 'Manter identificação do documento, número, ano, protocolo, empreendimento, versão, data, responsável pela elaboração, revisão e aprovação, conforme o fluxo institucional.',
  'pop-section-107': 'Antes da entrega, o arquivo deve ser renderizado para PDF ou imagens e todas as páginas devem ser inspecionadas.',
  'pop-section-108': 'A revisão deve eliminar referências a outro empreendimento, normas revogadas sem ressalva, datas incompatíveis, listas com numeração contínua indevida, condicionantes genéricas, dados sem fonte e conclusões não suportadas.',
  'pop-section-110': 'Este modelo deve ser copiado e adaptado ao processo concreto.',
  'pop-section-111': 'A estrutura abaixo deve ser adaptada ao caso concreto, mantendo linguagem objetiva e institucional.',
  'pop-section-123': 'Os modelos abaixo são exemplos e devem ser adaptados ao caso concreto. Não devem ser usados sem verificar impacto, fase, competência, prazo e forma de comprovação.',
  'pop-section-132': 'A análise de competência administrativa deve anteceder a conclusão sobre modalidade, suficiência documental ou mérito.',
  'pop-section-135': 'O art. 25 do SNUC prevê zona de amortecimento para as UCs, exceto APA e RPPN. Assim, não criar zona de amortecimento presumida para APA, nem utilizar automaticamente raios de 2 km, 10 km, 15 km ou 20 km como se fossem ZA.',
  'pop-section-136': 'A exceção federal do art. 22 da Lei nº 15.190/2025 para APA não torna a LAC estadual automaticamente cabível.',
  'pop-section-137': 'As camadas do GeoPR são instrumentos de apoio e não substituem a leitura do ato legal.',
  'pop-section-138': 'A APA integra o grupo de Uso Sustentável e pode abranger terras públicas e privadas. O licenciamento deve respeitar as normas e restrições estabelecidas para uso das propriedades, o ato de criação, o Plano de Manejo e o zoneamento.',
  'pop-section-139': 'A publicação ou revisão posterior de Plano de Manejo não autoriza, por si só, reabrir automaticamente a viabilidade locacional de RLO sem fato novo, mas pode estabelecer regras materiais de operação, manutenção, ampliação ou novas intervenções que precisem ser consideradas na fase atual.',
  'pop-section-145': 'O ACT delimita a execução delegada.',
  'pop-section-147': 'O art. 15 da Instrução Normativa IBAMA nº 08/2019 determina o encaminhamento do Relatório Técnico Anual de Atividades ao Ibama até 31 de março de cada ano.',
  'pop-section-151': 'Em pedido de RLO de UHE com capacidade instalada igual ou superior a 300 MW, a análise deve começar pela competência.',
  'pop-section-152': 'Por isso, em processo federal delegado, a compensação ambiental não deve ser direcionada automaticamente ao fluxo estadual sem leitura do ACT específico.',
  'pop-section-153': 'Não deve ser inserida automaticamente em razão da classificação do empreendimento como MCH, MGH, CGH, PCH ou UHE, de sua potência instalada ou da simples existência de impacto ambiental.',
  'pop-section-158': 'Com a publicação do Decreto Estadual nº 7.150/2024, não deve mais ser utilizada em novas manifestações, licenças ou modelos a redação “quando expedido o regulamento indicado no art. 5º da Lei nº 20.929/2021”, nem orientação genérica no sentido de “aguardar regulamentação para cobrança”.',
});

// Exceções em seções que tratam de mais de um alerta. Mantê-las explícitas
// evita que a decisão aponte para a aula correta, mas mostre o trecho errado.
const QUOTE_OVERRIDES = Object.freeze({
  'lab-cp-q2-pop-section-027': 'Na Consulta Prévia, a análise de unidades de conservação deve ocorrer antes de qualquer conclusão sobre intervenientes ou restrições locacionais.',
  'lab-transicao-q5-pop-section-005': 'Termos de Referência, condicionantes e orientações internas não prevalecem sobre lei ou regulamento, mas detalham a instrução técnica do caso concreto.',
  'lab-transicao-q3-pop-section-006': 'A motivação deve registrar separadamente a transição estadual e a transição federal.',
  'lab-transicao-q4-pop-section-006': 'A etapa em curso preserva as obrigações e os cronogramas já estabelecidos até sua conclusão, enquanto as etapas subsequentes devem observar a legislação federal vigente.',
  'lab-triagem-q2-pop-section-019': 'Documento de outro empreendimento ou outro corpo hídrico deve ser classificado como inconsistente, com gravidade geralmente crítica.',
  'lab-triagem-q3-pop-section-019': 'Estudo antigo pode ser aproveitado apenas se compatível com o projeto atual, a fase, a área de influência, a operação e a realidade ambiental atual.',
  'lab-triagem-q4-pop-section-019': 'Mudança de titularidade sem ato administrativo formal, anuência, assunção de condicionantes e compatibilidade com outorga e ANEEL deve ser tratada como pendência crítica.',
  'lab-triagem-q5-pop-section-017': 'O analista deve evitar concluir por deferimento ou indeferimento antes de confrontar SGA, e-Protocolo, memorial, estudo, outorga, ANEEL, cartografia e condicionantes anteriores.',
  'lab-barragem-q4-pop-section-051': 'Acessos, canteiros, bota-fora, jazidas, áreas de empréstimo, pátios, alojamentos e depósitos podem integrar o escopo da licença hidrelétrica ou exigir processo próprio.',
  'lab-intervenientes-q1-pop-section-082': 'Para CGH, não se deve exigir automaticamente autorização ou concessão própria de PCH, mas documentação setorial vigente e compatível com titular, potência e fase.',
  'lab-intervenientes-q5-pop-section-082': 'A atuação do IAT deve respeitar competências setoriais e as normas gerais federais de participação das autoridades envolvidas.',
  'lab-condicionantes-q1-pop-section-095': 'Condicionante sem prazo, sem indicador ou sem forma de comprovação.',
  'lab-integrador-q3-pop-section-095': 'Incompatibilidade material do empreendimento ou de estrutura associada com o ato de criação, a categoria, o zoneamento ou regra vinculante do Plano de Manejo não deve ser convertida artificialmente em condicionante para cumprimento posterior.',
  'lab-integrador-q3-pop-section-123': 'restrição material do ato de criação ou do Plano de Manejo que torne a localização, a estrutura ou a operação incompatível não deve ser transformada em condicionante.',
  'lab-rlo-q4-pop-section-096': 'Continuidade de programas, atualização de outorga e ANEEL, relatório consolidado, situação e revisão decenal do PACUERA, saneamento de pendências e manutenção de controles.',
  'lab-uc-apa-q3-pop-section-135': 'O técnico deve verificar a versão vigente e seu ato formal de aprovação, ler normas gerais e regras específicas da zona incidente e avaliar todo o arranjo.',
  'lab-uc-apa-q1-pop-section-138': 'A APA não possui zona de amortecimento obrigatória nos termos do art. 25 do SNUC.',
  'lab-uc-apa-q2-pop-section-138': 'Essas exceções federais são procedimentais e não autorizam automaticamente a LAC no Paraná, porque o art. 64, I, e, do Decreto Estadual nº 9.541/2025 mantém vedação estadual à LAC em Unidade de Conservação sem exceção expressa para APA.',
  'lab-rlo-q5-pop-section-074': 'O status declarado pelo empreendedor não equivale ao status validado pelo IAT.',
  'lab-rlo-vencida-q2-pop-section-074': 'O status declarado pelo empreendedor não equivale ao status validado pelo IAT.',
  'lab-delegado-q2-pop-section-132': 'A delegação não converte o processo em licenciamento estadual originário e deve ser exercida dentro do objeto, do prazo e das condições estabelecidas no ACT específico.',
  'lab-prog-semestral-q3-pop-section-074': 'O status declarado pelo empreendedor não equivale ao status validado pelo IAT.',
  'lab-prog-semestral-q4-pop-section-074': 'Confirmar continuidade da série e correspondência com a obrigação.',
  'lab-prog-residuos-q4-pop-section-074': 'Resultado deve ser verificável e não apenas declarado.',
  'lab-prog-compensacao-q4-pop-section-074': 'Confrontar com plano aprovado e justificar alterações.',
  'lab-condic-triagem-q1-pop-section-095': 'Condicionante sem prazo, sem indicador ou sem forma de comprovação.',
  'lab-condic-triagem-q3-pop-section-095': 'Condicionante que transfere ao empreendedor competência decisória do órgão ambiental.',
  'lab-condic-triagem-q5-pop-section-095': 'Condicionante que utilize a redação transitória “quando expedido o regulamento indicado no art. 5º da Lei nº 20.929/2021” ou determine genericamente “aguardar regulamentação para cobrança”.',
});

const CASE_EVIDENCE_ORDINALS = Object.freeze({
  cp: [[2, 3], [4], [], [], []],
  las: [[1, 3], [2], [2, 3], [2, 3], [2, 3, 4]],
  lp: [[1, 2], [2], [1, 4], [], []],
  li: [[1, 2], [2, 3], [2, 3], [2, 3, 4], []],
  lo: [[1], [2], [4], [2, 4], [2, 3, 4]],
  rlo: [[1], [3], [2, 4], [3, 4], [2, 4]],
  pacuera: [[1, 2], [1, 2], [1, 4], [3], [1, 4]],
  'rlo-vencida': [[1], [2], [2], [2, 3], [1, 2, 3, 4]],
  'geo-insuficiente': [[2], [2, 3], [3, 4], [2, 3], [2, 3, 4]],
  'cp-antiga': [[1], [1, 2, 3], [3, 4], [1, 4], [1, 3, 4]],
  escopo: [[1, 2], [1, 2], [4], [3], [2, 4]],
  transicao: [[1], [1, 2], [3, 4], [2, 3, 4], [3, 4]],
  triagem: [[1, 4], [3], [2], [1, 4], [1, 2, 3, 4]],
  barragem: [[1, 2], [3], [3, 4], [1], [3, 4]],
  estudos: [[2, 3], [1, 2], [3, 4], [2], [1, 2, 3, 4]],
  intervenientes: [[1], [2, 4], [2, 3], [2], [1, 2, 3, 4]],
  condicionantes: [[1, 3], [2, 3], [2], [4], [2, 3]],
  revisao: [[1], [1, 2], [1, 2], [1, 4], [2, 3, 4]],
  integrador: [[1], [4], [3], [1, 2], [1]],
  'uc-apa': [[1, 2], [1, 2, 4], [1, 2], [1, 3], [2, 3]],
  delegado: [[1, 3], [2, 3], [1, 2], [2, 4], [2, 4]],
  'prog-semestral': [[1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3], [1, 2, 3]],
  'prog-residuos': [[1, 2], [1, 2], [3], [2, 3], [1, 2, 4]],
  'prog-compensacao': [[1, 3], [2, 3], [2, 3], [1, 3], [1, 2, 4]],
  'prog-app': [[2], [1, 2], [3, 4], [3, 4], [1, 2, 3, 4]],
  'condic-triagem': [[1, 2], [1], [2], [4], [2, 3, 4]],
});

const NEEDS_TECHNICAL_REVIEW = new Set([
  'lab-cp-q1',
  'lab-cp-q3',
  'lab-las-q1',
  'lab-rlo-q1',
  'lab-rlo-vencida-q1',
  'lab-rlo-vencida-q5',
  'lab-prog-semestral-q2',
  'lab-prog-residuos-q5',
  'lab-prog-compensacao-q3',
  'lab-prog-app-q4',
]);

const TECHNICAL_REVIEW_REASONS = Object.freeze({
  'lab-cp-q1': 'A suficiência depende da conferência do conteúdo real do Memorial e da cartografia, não apenas da lista de evidências simuladas.',
  'lab-cp-q3': 'O efeito da Consulta Prévia sobre prioridade e disponibilidade hídrica deve ser confirmado no regime vigente e separado da outorga.',
  'lab-las-q1': 'A potência isolada não fecha o enquadramento: faltam alagamento, IDA, supressão e demais filtros territoriais.',
  'lab-rlo-q1': 'A prorrogação por tempestividade depende da norma temporalmente aplicável e da situação concreta do protocolo.',
  'lab-rlo-vencida-q1': 'A prorrogação por tempestividade depende da norma temporalmente aplicável e da situação concreta do protocolo.',
  'lab-rlo-vencida-q5': 'A regularidade da operação durante a renovação exige confirmar tempestividade, validade e eventuais impedimentos do caso.',
  'lab-prog-semestral-q2': 'A divergência aritmética prova inconsistência, mas não demonstra sozinha abandono dos programas.',
  'lab-prog-residuos-q5': 'Aceitar unidades separadas depende da finalidade do indicador e da metodologia técnica aplicável.',
  'lab-prog-compensacao-q3': 'Classificar a retirada como evolução física depende do projeto aprovado, do cronograma e da definição do indicador.',
  'lab-prog-app-q4': 'A ausência de plantio só caracteriza descumprimento depois de confrontada com prazo, cronograma, obrigação e evidências.',
});

const CASE_APPLIED_DECISIONS = new Set([
  'lab-prog-semestral-q1',
  'lab-prog-semestral-q4',
  'lab-prog-residuos-q1',
  'lab-prog-residuos-q2',
  'lab-prog-residuos-q3',
  'lab-prog-residuos-q4',
  'lab-prog-compensacao-q1',
  'lab-prog-compensacao-q2',
  'lab-prog-compensacao-q4',
  'lab-prog-compensacao-q5',
  'lab-prog-app-q1',
  'lab-prog-app-q2',
  'lab-prog-app-q3',
  'lab-prog-app-q5',
]);

function freezeDecision(scenarioId, questionIndex, sourceLessonIds, evidenceOrdinals) {
  const id = `lab-${scenarioId}-q${questionIndex + 1}`;
  const popSources = sourceLessonIds.map((sec) => {
    const sourceId = `${id}-${sec}`;
    const quote = QUOTE_OVERRIDES[sourceId] || POP_LAB_QUOTES[sec];
    if (!quote) throw new Error(`Trecho do POP ausente para ${sourceId}.`);
    return Object.freeze({ id: sourceId, sec, quote });
  });
  const needsTechnicalReview = NEEDS_TECHNICAL_REVIEW.has(id);
  const usesCaseApplication = CASE_APPLIED_DECISIONS.has(id);
  return Object.freeze({
    id,
    questionIndex: questionIndex + 1,
    answerReasonId: id,
    popSources: Object.freeze(popSources),
    caseEvidenceRefs: Object.freeze(
      evidenceOrdinals.map((ordinal) => `lab-${scenarioId}-e${ordinal}`),
    ),
    supportMode: needsTechnicalReview || usesCaseApplication ? 'mixed' : 'direct',
    reviewStatus: needsTechnicalReview ? 'needs-technical-review' : 'mapped-draft',
    reviewReason: needsTechnicalReview ? TECHNICAL_REVIEW_REASONS[id] : null,
  });
}

export const LAB_SOURCES = Object.freeze(
  Object.entries(LAB_SOURCE_INDEX).map(([scenarioId, index]) => {
    const evidenceOrdinals = CASE_EVIDENCE_ORDINALS[scenarioId];
    if (!evidenceOrdinals) throw new Error(`Referências de evidência ausentes para ${scenarioId}.`);
    return Object.freeze({
      id: `lab-${scenarioId}-sources`,
      scenarioId,
      primaryLessonId: index.primaryLessonId,
      caseEvidenceIds: Object.freeze([1, 2, 3, 4].map((ordinal) => `lab-${scenarioId}-e${ordinal}`)),
      decisions: Object.freeze(
        index.decisionSourceLessonIds.map((ids, questionIndex) => (
          freezeDecision(scenarioId, questionIndex, ids, evidenceOrdinals[questionIndex])
        )),
      ),
    });
  }),
);

export const LAB_SOURCES_BY_SCENARIO = Object.freeze(
  Object.fromEntries(LAB_SOURCES.map((record) => [record.scenarioId, record])),
);

export function getLabSources(scenarioId) {
  return LAB_SOURCES_BY_SCENARIO[scenarioId] || null;
}
