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
    passo: 'Registro na ANEEL e obtenção do CEG',
    detalhe: 'Registro do projeto conforme a Resolução Normativa ANEEL nº 875/2020, com a adequabilidade do sumário executivo, e o código único do empreendimento.',
  },
  {
    passo: 'Outorga setorial conforme o porte',
    detalhe: 'Registro, autorização ou concessão, conforme o regime aplicável ao aproveitamento. O ato setorial e o limite de potência de cada regime precisam ser conferidos na norma vigente na data do pedido.',
  },
  {
    passo: 'Acesso e conexão à rede',
    detalhe: 'Parecer de acesso, projeto da linha e da subestação e os contratos de conexão e uso do sistema. A linha e a subestação são sistemas associados e entram também no licenciamento ambiental.',
  },
]);

export const TRILHO_AMBIENTAL = Object.freeze([
  {
    passo: 'Consulta Prévia',
    detalhe: 'Antes de formalizar o pedido de licença. Orienta modalidade e estudo prováveis, e não aprova viabilidade nem assegura prioridade.',
  },
  {
    passo: 'Enquadramento',
    detalhe: 'Potência, área de alagamento, supressão de vegetação e sensibilidade do local orientam a modalidade e o estudo. Nenhum desses dados, isolado, define a modalidade.',
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
export const MODALIDADES = Object.freeze([
  {
    sigla: 'Consulta Prévia',
    nome: 'Manifestação orientativa anterior ao pedido',
    serve: 'Orientar modalidade, estudo provável e restrições de sensibilidade antes de contratar o estudo completo.',
    limite: 'Tem prazo de validade próprio, não é prorrogável, não assegura prioridade, não confere domínio e não equivale à aprovação de viabilidade ambiental.',
  },
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
    grupo: 'Listas documentais por fase',
    fonte: 'Portaria IAT nº 12/2024, seus Anexos e os checklists vigentes',
    conteudo: 'É onde a exigência documental por fase é estabelecida. Confirme a versão vigente na data do protocolo e a regra de transição aplicável ao seu processo.',
  },
  {
    grupo: 'Conteúdo dos estudos',
    fonte: 'Termo de Referência da fase e da tipologia',
    conteudo: 'O Termo de Referência define o conteúdo do memorial e dos estudos. Ele é o parâmetro de suficiência técnica, e não a preferência de quem elabora.',
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
    fonte: 'Lei Federal nº 9.985/2000, Decreto Federal nº 4.340/2002 e Resolução CONAMA nº 428/2010',
    conteudo: 'A afetação de unidade de conservação e de sua zona de amortecimento exige manifestação do órgão gestor.',
  },
  {
    grupo: 'Segurança de barragem',
    fonte: 'Lei Federal nº 12.334/2010, alterada pela Lei Federal nº 14.066/2020',
    conteudo: 'Classificação, plano de segurança e plano de ação de emergência seguem a política nacional e o órgão fiscalizador competente.',
  },
  {
    grupo: 'Competência federal ou delegada',
    fonte: 'Lei Complementar nº 140/2011, Decreto Federal nº 8.437/2015 e Instrução Normativa nº 08/2019',
    conteudo: 'Definem quando o licenciamento é federal e quando há delegação. Errar a instância custa o processo inteiro.',
  },
]);

// Erros que aparecem no POP como armadilha do analista, reescritos do lado de
// quem entrega. Nenhum deles e opiniao sobre o mercado: sao os pontos em que a
// analise trava e o processo volta.
export const CUSTA_PRAZO = Object.freeze([
  {
    erro: 'Titularidade incompatível entre os atos',
    efeito: 'O nome no ato setorial, na outorga e no pedido de licença precisa fechar. Divergência vira diligência antes de qualquer análise de mérito.',
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
    efeito: 'Não antecipa o cronograma: converte o pedido em apuração de irregularidade, com reflexo na própria licença pretendida.',
  },
  {
    erro: 'Deixar o interveniente para o fim',
    efeito: 'Manifestação de órgão interveniente tem prazo próprio, fora do controle do empreendedor. Acionar tarde é somar os prazos em série, em vez de em paralelo.',
  },
]);
