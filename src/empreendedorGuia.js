// Conteudo do guia do empreendedor e da consultoria.
//
// Por que este guia existe, e por que ele e separado do resto.
//
// A plataforma inteira e escrita do lado de quem analisa: o POP e o
// procedimento interno do orgao, e as 17 trilhas ensinam a conferir. Quem
// desenvolve o empreendimento tem outra pergunta, e ela nao e respondida
// invertendo a primeira: o que eu apresento, a quem, em que ordem, e o que
// cada porta decide.
//
// A regra que governa cada linha daqui, e que vale para quem editar depois:
//
//   1. O POP NAO cria exigencia. Ele organiza o metodo do orgao. O fundamento
//      de qualquer documento pedido esta na norma, na Portaria IAT no 12/2024 e
//      seus Anexos, no Termo de Referencia da fase ou em condicionante
//      anterior. Onde este guia nao conseguiu identificar o fundamento, ele
//      diz isso na propria linha, em vez de listar documento como se a
//      obrigacao fosse dele.
//   2. Nenhum numero de norma entra aqui sem lastro. O portao
//      `check-normas.mjs` recusa citacao que nao esteja no POP nem no registro
//      de fontes oficiais com URL.
//   3. Este guia nao promete resultado. Ele nao diz que a licenca sai, nem que
//      a documentacao esta completa. Quem decide suficiencia e o orgao, no
//      caso concreto.
//   4. A fonte congelada e uma minuta pendente de validacao tecnica e
//      institucional, e os tres eixos de competencia estao com vigencia e
//      aplicacao a confirmar. O aviso de topo diz isso ao leitor, e nao so a
//      quem le o codigo.

// Data da ultima revisao normativa do conteudo desta pagina, feita por quem
// responde tecnicamente pelo assunto. Fica visivel no rodape porque ANEEL,
// recursos hidricos e o regime estadual mudam com frequencia: sem a data, o
// leitor nao tem como saber a que altura do tempo este texto foi conferido.
export const REVISAO_NORMATIVA = '04/09/2026';

export const EMPREENDEDOR_SECOES = Object.freeze([
  { id: 'emp-competencias', rotulo: 'Quem decide' },
  { id: 'emp-enquadramento', rotulo: 'Enquadramento' },
  { id: 'emp-ordem', rotulo: 'Ordem dos atos' },
  { id: 'emp-consulta', rotulo: 'Consulta Prévia' },
  { id: 'emp-modalidades', rotulo: 'Modalidades' },
  { id: 'emp-agua', rotulo: 'Água' },
  { id: 'emp-documentos', rotulo: 'Documentos' },
  { id: 'emp-intervenientes', rotulo: 'Intervenientes' },
  { id: 'emp-depois', rotulo: 'Depois da licença' },
  // Secao propria, e nao um bloco dentro de "Depois da licenca", porque o guia
  // estava concentrado em projeto novo. Quem chega com empreendimento em
  // operacao, irregular ou em mudanca societaria precisa achar isso pelo menu,
  // e nao rolando ate o meio de outra secao.
  { id: 'emp-renovacao', rotulo: 'Renovar e regularizar' },
  { id: 'emp-erros', rotulo: 'O que custa prazo' },
]);

// Os dois trilhos correm em paralelo. A ordem dentro de cada um importa; entre
// eles, o que importa e a compatibilidade, e nao quem termina primeiro.
export const TRILHO_SETORIAL = Object.freeze([
  {
    passo: 'Estudos e definição do aproveitamento',
    detalhe: 'Inventário do trecho, partição de quedas e definição de potência, queda, vazão e arranjo. É aqui que nasce o dado que todos os outros atos vão repetir.',
  },
  {
    passo: 'Registro na ANEEL',
    // O codigo unico do empreendimento existe e e usado no setor, mas nem o POP
    // nem o registro de fontes oficiais desta plataforma o sustentam. Citar a
    // sigla como etapa obrigatoria seria afirmar exigencia sem lastro, que e
    // exatamente o que este guia recusa nas outras linhas.
    detalhe: 'Registro do projeto conforme a Resolução Normativa ANEEL nº 875/2020, com a adequabilidade do sumário executivo. O código que identifica o empreendimento e as demais obrigações do registro devem ser confirmados na própria ANEEL.',
  },
  {
    passo: 'Outorga setorial conforme o porte, e ela não é a mesma para todos',
    detalhe: 'Central geradora de capacidade reduzida tem procedimento de registro próprio junto à ANEEL. PCH e UHE seguem outro caminho, com despacho de requisitos, adequabilidade do sumário executivo e o ato de outorga correspondente. O regime e o limite de potência precisam ser conferidos na norma vigente na data do pedido.',
  },
  {
    passo: 'Acesso e conexão à rede',
    detalhe: 'Parecer de acesso, projeto da linha e da subestação e os contratos de conexão e uso do sistema. A linha e a subestação precisam ser identificadas e ter o enquadramento ambiental definido: conforme configuração, interdependência, localização e norma aplicável, podem integrar o escopo do processo principal ou exigir processo próprio.',
  },
]);

export const TRILHO_AMBIENTAL = Object.freeze([
  {
    passo: 'Consulta Prévia de Viabilidade, para CGH a partir de 1 MW, PCH e UHE',
    detalhe: 'Antecede a formalização do requerimento de licença. Identifica pedido de licenciamento incidente no mesmo eixo e possíveis restrições, impeditivos e intervenientes. Não alcança toda MCH, MGH ou CGH: a obrigatoriedade começa na potência instalada igual ou superior a 1 MW.',
  },
  {
    passo: 'Enquadramento',
    detalhe: 'A modalidade e o estudo não são escolhidos pelo empreendedor. Avaliam-se primeiro a potência instalada e a área de alagamento, excluída a calha do rio, prevalecendo o enquadramento mais restritivo. Depois, quando aplicável, o Índice de Degradação Ambiental, que considera área alagada, supressão de vegetação nativa, sistema de adução, trecho de vazão reduzida, propriedades rurais inviabilizadas e potência instalada.',
  },
  {
    passo: 'Protocolo',
    detalhe: 'Formalização com a documentação da fase. O órgão confere suficiência antes do mérito: peça apresentada não é peça suficiente.',
  },
  {
    passo: 'Análise, diligência e decisão',
    detalhe: 'Lacuna vira diligência, com prazo. Responder por partes, em pedidos sucessivos, é o que mais alonga processo.',
  },
  {
    passo: 'Licença, condicionantes e acompanhamento',
    detalhe: 'A licença fixa condicionantes verificáveis. O cumprimento é comprovado por evidência, no prazo de cada uma, e alimenta a renovação.',
  },
]);

export const PAPEIS_EMPREENDIMENTO = Object.freeze([
  {
    papel: 'Empreendedor',
    faz: 'Decide investir, contrata os estudos, protocola nos dois trilhos, mantém titularidade coerente entre os atos, responde exigências e cumpre condicionantes.',
    naoFaz: 'Não define a própria modalidade nem declara a própria suficiência.',
  },
  {
    papel: 'Consultoria ambiental',
    faz: 'Elabora memorial e estudos conforme o Termo de Referência da fase, com as Anotações de Responsabilidade Técnica, responde complementações e acompanha vistorias.',
    naoFaz: 'Não substitui a responsabilidade do empreendedor nem antecipa a decisão do órgão.',
  },
  {
    papel: 'IAT',
    faz: 'Analisa, diligencia, licencia e fiscaliza o componente ambiental no Paraná, e confere a existência e a compatibilidade dos atos externos.',
    naoFaz: 'Não emite o ato setorial, não outorga o uso da água no que for de outra competência e não decide pelos intervenientes.',
  },
  {
    papel: 'ANEEL',
    faz: 'Registra e outorga o aproveitamento do potencial hidráulico e regula a operação comercial.',
    naoFaz: 'Não licencia o empreendimento e não define a modalidade ambiental.',
  },
  {
    papel: 'Órgãos intervenientes',
    faz: 'Manifestam-se dentro da própria competência e integram o processo.',
    naoFaz: 'A manifestação de um não transfere a competência do outro nem dispensa a do órgão licenciador.',
  },
]);

// Cada modalidade traz o que ela e e o que ela nao e. A confusao entre elas e
// a origem de boa parte do retrabalho, porque muda o estudo, o prazo e a peca.
// A Consulta Previa saiu desta lista: ela nao e modalidade de licenciamento, e
// tem secao propria. A DLAM continua aqui porque e o ato que mais se confunde
// com licenca, e o cartao existe justamente para dizer que ela nao e.
export const MODALIDADES = Object.freeze([
  {
    sigla: 'DLAM',
    nome: 'Declaração de Dispensa de Licenciamento Ambiental Estadual',
    serve: 'É ato administrativo de dispensa, para as hipóteses que a norma dispensa do licenciamento ambiental estadual.',
    limite: 'Não é licença ambiental nem modalidade de licenciamento. Tratar a dispensa como se fosse licença é erro de natureza do ato, e não de nome.',
  },
  {
    sigla: 'LAC',
    nome: 'Licença Ambiental por Adesão e Compromisso',
    serve: 'Rito de fase única, para as situações que a norma admite, com verificação documental proporcional.',
    limite: 'Simplificado não é automático. O enquadramento simplificado ainda precisa ser confrontado com unidades de conservação, APAs, atos de criação e Planos de Manejo incidentes.',
  },
  {
    sigla: 'LAS',
    nome: 'Licença Ambiental Simplificada',
    serve: 'Rito de fase única, com estudo proporcional ao porte e ao impacto, conforme o enquadramento.',
    limite: 'O rito segue a norma de enquadramento, e não a preferência do empreendedor pelo caminho mais curto.',
  },
  {
    sigla: 'LP, LI e LO',
    nome: 'Rito trifásico',
    serve: 'LP atesta a viabilidade e a concepção; LI autoriza instalar conforme o projeto; LO verifica o que foi instalado e fixa as condicionantes de operação.',
    limite: 'As fases não se sobrepõem nem se compensam. Obra iniciada sem a licença da fase é irregularidade, e não uma etapa adiantada.',
  },
  {
    sigla: 'AA',
    nome: 'Autorização Ambiental',
    serve: 'Usada apenas nas hipóteses previstas na norma e no fluxo institucional, com aplicação definida na Instrução Normativa IAT nº 09/2025.',
    limite: 'Não substitui a licença principal, a Autorização Florestal, a outorga nem a manifestação de quem tem competência própria.',
  },
  {
    sigla: 'LIR e LOR',
    nome: 'Regularização de instalação e de operação',
    serve: 'Rito próprio para o empreendimento que já está instalado ou operando sem o ato exigível, previsto entre as modalidades da Instrução Normativa IAT nº 09/2025.',
    limite: 'Regularizar não apaga a apuração da irregularidade nem antecipa o resultado: é o caminho para reingressar na legalidade, e não um atalho para quem escolhe começar antes.',
  },
  {
    sigla: 'Ampliação',
    nome: 'Licenciamento de ampliação ou alteração definitiva',
    serve: 'Aplica-se quando o empreendimento licenciado muda de forma definitiva, em porte, arranjo ou operação.',
    limite: 'Alteração definitiva não se resolve por comunicação no processo existente. Avalie o rito antes de executar a mudança.',
  },
  {
    sigla: 'RLO',
    nome: 'Renovação de Licença de Operação',
    serve: 'Requerimento próprio, com antecedência a observar, que examina condicionantes cumpridas, programas, outorga e documentação setorial vigente.',
    limite: 'Não é um novo licenciamento e não é automática. O acervo de evidências do período anterior é o que a sustenta.',
  },
]);

// Empreendimento que ja existe: renovar, regularizar, alterar e transferir.
//
// Cada um destes tem rito proprio, e o erro comum e trata-los como variacao do
// licenciamento novo. O que muda em cada caso e quem pede, quando e com base
// em que acervo.
export const CICLO_DE_VIDA = Object.freeze([
  {
    situacao: 'A licença de operação vence',
    caminho: 'Renovação de Licença de Operação',
    detalhe: 'Requerimento próprio, com antecedência a observar. Examina o cumprimento das condicionantes, os programas ambientais, a outorga e a documentação setorial vigente.',
    engano: 'Não é um novo licenciamento, e não é automática: é o acervo de evidências do período anterior que a sustenta.',
  },
  {
    situacao: 'O empreendimento mudou de forma definitiva',
    caminho: 'Licenciamento de ampliação ou alteração',
    detalhe: 'Mudança definitiva de porte, arranjo ou operação tem rito próprio, e ela precisa ser avaliada antes de ser executada.',
    engano: 'Não se resolve por comunicação dentro do processo existente nem por anotação em relatório.',
  },
  {
    situacao: 'Já está instalado ou operando sem o ato exigível',
    caminho: 'Regularização, com LIR ou LOR',
    detalhe: 'Existe caminho previsto para reingressar na legalidade, entre as modalidades da Instrução Normativa IAT nº 09/2025.',
    engano: 'Regularizar não apaga a apuração da irregularidade nem antecipa o resultado dela.',
  },
  {
    situacao: 'A empresa mudou de dono ou de controle',
    caminho: 'Transferência de titularidade em cada eixo',
    detalhe: 'Licença ambiental, outorga de recursos hídricos e ato setorial têm, cada um, o seu procedimento de transferência.',
    engano: 'Mudança societária não transfere automaticamente a titularidade. Enquanto os três não fecharem, a divergência aparece na primeira conferência.',
  },
]);

// Documentos que o processo pede, e que sao confundidos entre si com custo
// alto: entregar um no lugar do outro reabre a analise inteira. O que cada um
// deve conter esta no Termo de Referencia aplicavel, e nao aqui.
export const NAO_CONFUNDA = Object.freeze([
  {
    documento: 'Memorial Descritivo',
    serve: 'Caracterização de engenharia: arranjo, estruturas, potência, vazões, reservatório, trecho de vazão reduzida, acessos e intervenções.',
  },
  {
    documento: 'RAS',
    serve: 'Diagnóstico ambiental simplificado, com impactos e medidas.',
  },
  {
    documento: 'RDPA',
    serve: 'Detalhamento dos programas ambientais propostos no RAS, com objetivos, metodologia, resultados esperados, indicadores e cronograma.',
  },
  {
    documento: 'PCA',
    serve: 'Estudo ambiental com o conjunto de medidas e programas de controle, gestão e monitoramento, conforme o Termo de Referência aplicável.',
  },
  {
    documento: 'EIA e RIMA',
    serve: 'Avaliação da viabilidade ambiental e dos impactos significativos, com o RIMA em linguagem acessível.',
  },
  {
    documento: 'PBA',
    serve: 'Detalhamento dos programas ambientais decorrentes do EIA e do RIMA.',
  },
  {
    documento: 'Outorga',
    serve: 'Regulariza o uso ou a interferência em recursos hídricos. Não substitui a licença ambiental.',
  },
  {
    documento: 'ART',
    serve: 'Comprova responsabilidade técnica compatível entre profissional, objeto, documento e empreendimento.',
  },
]);

// O documento nao e pedido pelo POP. Esta lista aponta ONDE a exigencia mora,
// e diz explicitamente quando o fundamento nao foi identificado. Ela e um mapa
// de onde procurar, e nao a lista fechada do seu caso.
export const ONDE_ESTA_A_EXIGENCIA = Object.freeze([
  {
    grupo: 'Enquadramento e Consulta Prévia',
    fonte: 'Instrução Normativa IAT nº 09/2025',
    conteudo: 'Define o enquadramento ambiental por tipologia e as condições da Consulta Prévia, inclusive as peças de caracterização do arranjo e da área.',
  },
  {
    // Correcao de erro material, apontado na revisao tecnica de 04/09/2026.
    //
    // A versao anterior apontava a Portaria IAT no 12/2024 como fonte das
    // listas documentais. Ela nao e: disciplina estudos de fauna. O numero
    // tinha lastro no POP, entao o portao de normas aprovou, e isso mostra o
    // limite do portao: ele confere que a norma existe, e nao que ela foi
    // aplicada ao assunto certo. Erro de aplicacao so a revisao humana pega.
    grupo: 'Listas documentais por ato e por fase',
    fonte: 'Instrução Normativa IAT nº 09/2025 e Decreto Estadual nº 9.541/2025',
    conteudo: 'A Instrução Normativa estabelece a documentação dos diferentes atos, modalidades e fases, com listas próprias para DLAM, LAC, LAS, LP, LI, LO, RLO e Autorização Ambiental, além dos documentos complementares conforme tipologia e potência. O Decreto Estadual fixa os requisitos gerais do procedimento, observadas as alterações posteriores e a regra de transição.',
    atencao: 'A Portaria IAT nº 12/2024 não é a fonte das listas documentais do licenciamento hidrelétrico. Ela disciplina estudos de fauna e deve ser consultada apenas quanto a esse tema.',
  },
  {
    grupo: 'Conteúdo dos estudos ambientais',
    fonte: 'Termo de Referência do estudo aplicável',
    conteudo: 'Os Termos de Referência definem o conteúdo dos estudos ambientais e são o parâmetro de suficiência técnica, e não a preferência de quem elabora. O Memorial Descritivo tem regime próprio: a Instrução Normativa o exige em diversos procedimentos e fixa o nível de detalhe conforme a fase.',
  },
  {
    grupo: 'Uso da água',
    fonte: 'Lei Federal nº 9.433/1997 e as regras do gestor competente',
    conteudo: 'A dispensa, a outorga preventiva e a outorga de direito de uso são atos distintos, e a competência depende do domínio do corpo hídrico.',
  },
  {
    grupo: 'Vegetação e área protegida',
    fonte: 'Lei Federal nº 12.651/2012 e Lei Federal nº 11.428/2006',
    conteudo: 'Área de Preservação Permanente, Reserva Legal e Bioma Mata Atlântica têm regime próprio, com reflexo em supressão e compensação.',
  },
  {
    grupo: 'Unidade de conservação afetada',
    fonte: 'Lei Federal nº 9.985/2000, Decreto Federal nº 4.340/2002 e Resolução CONAMA nº 428/2010, alterada pela Resolução CONAMA nº 508/2025',
    conteudo: 'A incidência sobre unidade de conservação ou sua zona de amortecimento é analisada considerando a categoria da unidade, o ato de criação e o Plano de Manejo. A providência perante o órgão gestor varia com o regime aplicável: autorização nos empreendimentos de significativo impacto sujeitos a EIA/RIMA, e ciência nos processos não sujeitos a EIA/RIMA.',
  },
  {
    grupo: 'Regra de transição',
    fonte: 'Decreto Estadual nº 9.541/2025, art. 173',
    conteudo: 'Procedimentos protocolados até a entrada em vigor do novo regime seguem as normas vigentes na data do protocolo, sem aplicação retroativa das demais disposições. Isso não impede complementação técnica no processo em curso. É a primeira coisa a confirmar quando o processo é antigo.',
  },
  {
    grupo: 'Base geral do licenciamento',
    fonte: 'Lei Federal nº 15.190/2025',
    conteudo: 'Integra a base normativa geral do licenciamento ambiental. A incidência sobre o caso deve ser avaliada em conjunto com o regime estadual e com a norma específica de empreendimentos hidrelétricos.',
  },
  {
    grupo: 'Segurança de barragem',
    fonte: 'Lei Federal nº 12.334/2010, alterada pela Lei Federal nº 14.066/2020',
    conteudo: 'Classificação, plano de segurança e plano de ação de emergência seguem a política nacional e o órgão fiscalizador competente.',
  },
  {
    grupo: 'Competência federal ou delegada',
    fonte: 'Lei Complementar nº 140/2011, Decreto Federal nº 8.437/2015 e Instrução Normativa Ibama nº 08/2019',
    conteudo: 'Definem quando o licenciamento é federal e quando há delegação. Errar a instância custa o processo inteiro.',
  },
]);

// Erros que aparecem no POP como armadilha do analista, reescritos do lado de
// quem entrega. Nenhum deles e opiniao sobre o mercado: sao os pontos em que a
// analise trava e o processo volta.
export const CUSTA_PRAZO = Object.freeze([
  {
    erro: 'Titularidade incompatível entre os atos',
    efeito: 'O nome no ato setorial, na outorga e no pedido de licença precisa fechar, ou a divergência precisa estar formalizada. Transferência, sucessão, assunção e alteração de titularidade regularmente processadas não são irregularidade; divergência sem formalização vira diligência antes de qualquer análise de mérito.',
  },
  {
    erro: 'Arranjo e potência que mudam entre as peças',
    efeito: 'Memorial, arquivo geoespacial e ato setorial descrevendo arranjos diferentes impedem a conferência. O dado precisa ser o mesmo em todas as peças.',
  },
  {
    erro: 'Arquivo geoespacial sem datum, fuso ou fora do Paraná',
    efeito: 'Coordenada em datum antigo, sem transformação, ou polígono deslocado inviabiliza a leitura territorial e a conferência de sobreposições.',
  },
  {
    erro: 'Tratar peça apresentada como peça suficiente',
    efeito: 'A conferência é de conteúdo. Juntar o documento não encerra a exigência se ele não caracteriza o que precisa caracterizar.',
  },
  {
    erro: 'Estudo escolhido por preferência, e não pelo Termo de Referência',
    efeito: 'O estudo é definido pelo enquadramento e pelo Termo de Referência vigente. Entregar o mais simples porque foi o contratado gera retrabalho integral.',
  },
  {
    erro: 'Responder diligência por partes',
    efeito: 'Complementação fracionada em envios sucessivos reabre a conferência a cada vez e alonga o processo mais do que a lacuna original.',
  },
  {
    erro: 'Iniciar obra ou supressão antes da licença da fase',
    efeito: 'Não antecipa o cronograma. A intervenção sem o ato exigível pode caracterizar irregularidade e demandar apuração e regularização, conforme o caso, com reflexo possível na própria licença pretendida.',
  },
  {
    erro: 'Deixar o interveniente para o fim',
    efeito: 'Manifestação de órgão interveniente tem prazo próprio, fora do controle do empreendedor. Acionar tarde é somar os prazos em série, em vez de em paralelo.',
  },
]);
