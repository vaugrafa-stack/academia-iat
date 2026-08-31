// Catalogo curado das camadas do GeoPR usadas na Academia.
//
// O acervo do GeoPR tem mais de mil servicos. Trazer todos para o mapa nao
// ajudaria ninguem: a maior parte responde a outras politicas do Estado, de
// saude a saneamento, e nada tem a ver com licenciamento de hidreletrica. O que
// esta aqui foi escolhido pelo que a analise do POP efetivamente consulta, e o
// acervo inteiro continua alcancavel pela busca ao vivo, sem sair da Academia.
//
// COMO ESTE ARQUIVO FOI PREENCHIDO, E POR QUE ISSO IMPORTA
//
// `caminho`, `camadas` e `fonte` NAO foram escritos de memoria. Cada um veio de
// uma consulta ao proprio servidor, e cada camada foi desenhada uma vez para
// confirmar que ela cobre o Parana de fato. Servico que existe no catalogo mas
// devolve imagem vazia, ou que nao publica WMS, ficou de fora: o catalogo
// listar uma camada que nao aparece na tela e pior do que nao listar.
//
// `fonte` reproduz o `copyrightText` que o servico declara. Quando o servico
// NAO declara nada, o campo fica nulo e a tela diz isso com todas as letras. A
// tentacao seria preencher com "IAT" por deducao, ja que o IAT e quem publica.
// Seria invencao: publicar nao e a mesma coisa que ser a origem do dado, e a
// secao 137 do POP manda registrar camada, FONTE e data da consulta. Uma camada
// oficial que nao declara a propria origem e exatamente o caso em que quem
// analisa precisa ir atras, e nao herdar uma atribuicao que ninguem afirmou.

// Os grupos seguem a categoria juridica, e nao uma ideia solta de "area
// protegida". Unidade de conservacao, APP, caverna, sitio arqueologico e
// territorio quilombola tem norma, orgao e momento de analise diferentes, e
// cada bloco abaixo corresponde a um modulo do curso. Antes disto, 13 das 23
// camadas moravam num balde unico de 653 px que ninguem varria inteiro.
export const GRUPOS = [
  { id: 'agua', rotulo: 'Água e bacias' },
  { id: 'energia', rotulo: 'Geração e outorga' },
  { id: 'ucs', rotulo: 'Unidades de conservação' },
  { id: 'conectividade', rotulo: 'Paisagem e conectividade' },
  { id: 'vegetacao', rotulo: 'Vegetação, APP e espeleologia' },
  { id: 'patrimonio', rotulo: 'Patrimônio e comunidades' },
  { id: 'base', rotulo: 'Base territorial' },
];

// `ordem` decide onde a camada entra no empilhamento do mapa:
// `fundo` desenha antes das bacias locais, `topo` desenha depois. Poligono
// grande vai para o fundo, ponto e linha vao para o topo, senao a mancha cobre
// o que estava embaixo.
export const CAMADAS_GEOPR = [
  {
    id: 'bacias-50k',
    titulo: 'Grandes bacias hidrográficas',
    grupo: 'agua',
    ordem: 'fundo',
    caminho: '00_PUBLICACOES/grandes_bacias_50k',
    camadas: '0',
    fonte: 'Águas Paraná, 2017',
    modulo: 'M10',
    paraQue:
      'Confere a bacia declarada no estudo contra a divisão oficial. A bacia governa '
      + 'o comitê competente, a série de vazões aplicável e quem se manifesta.',
  },
  {
    id: 'comites-bacia',
    titulo: 'Comitês de bacia hidrográfica',
    grupo: 'agua',
    ordem: 'fundo',
    caminho: '00_PUBLICACOES/comites_bacias_hidrograficas',
    camadas: '0',
    fonte: null,
    modulo: 'M10',
    paraQue:
      'Mostra qual comitê responde pela área do empreendimento, que é quem estabelece '
      + 'o enquadramento dos cursos de água daquela bacia.',
  },
  {
    id: 'outorgas-sigarh',
    titulo: 'Outorgas de recursos hídricos',
    grupo: 'energia',
    ordem: 'topo',
    caminho: '00_PUBLICACOES/outorgas_sigarh',
    camadas: '0',
    fonte: null,
    modulo: 'M10',
    paraQue:
      'Situa a outorga do empreendimento entre as demais do trecho. Outorga e licença '
      + 'são atos distintos, de autoridades distintas, e uma não supre a outra.',
  },
  {
    id: 'captacoes',
    titulo: 'Captações de água',
    grupo: 'energia',
    ordem: 'topo',
    caminho: '00_PUBLICACOES/out_captacao_crh',
    camadas: '0',
    fonte: 'IAT',
    modulo: 'M10',
    paraQue:
      'Revela usos a jusante e a montante que a vazão remanescente precisa respeitar. '
      + 'Usos múltiplos aparecem no mapa antes de aparecerem no processo.',
  },
  {
    id: 'geradoras',
    titulo: 'Usinas de geração hidrelétrica',
    grupo: 'energia',
    ordem: 'topo',
    caminho: '00_PUBLICACOES/iap_gerad_energ_hidreletricas',
    camadas: '0',
    fonte: 'IAT, 2021',
    modulo: 'M11',
    paraQue:
      'Camada do próprio IAT com as geradoras em algum estágio de licenciamento. '
      + 'Compare com o ponto da ANEEL já plotado: divergência é pista de conferência.',
  },
  {
    id: 'aproveitamentos',
    titulo: 'Aproveitamentos hidrelétricos',
    grupo: 'energia',
    ordem: 'topo',
    caminho: '00_PUBLICACOES/out_aproveitamento_hidreletrico',
    camadas: '0',
    fonte: 'IAT',
    modulo: 'M03',
    paraQue:
      'Ajuda a ler partição de quedas: aproveitamentos vizinhos no mesmo rio afetam '
      + 'queda disponível, remanso e a análise de efeito cumulativo.',
  },
  {
    id: 'ucs-estaduais',
    titulo: 'Unidades de conservação estaduais',
    grupo: 'ucs',
    ordem: 'fundo',
    caminho: '00_PUBLICACOES/unidades_conservacao_estaduais',
    camadas: '0',
    fonte: 'IAT, 2025',
    modulo: 'M12',
    paraQue:
      'Levanta a suspeita de sobreposição com UC. Levanta, não decide: a poligonal '
      + 'aqui não substitui o ato de criação nem o zoneamento do Plano de Manejo.',
  },
  {
    id: 'nascentes',
    titulo: 'Nascentes mapeadas',
    grupo: 'agua',
    ordem: 'topo',
    caminho: '00_PUBLICACOES/fbds_nascentes',
    camadas: '0',
    fonte: 'FBDS, 2013',
    modulo: 'M10',
    paraQue:
      'Nascente puxa APP de raio próprio. Serve para conferir se o arranjo e o canteiro '
      + 'foram desenhados sabendo onde elas estão.',
  },
  {
    id: 'apps-hidricas-fbds',
    titulo: 'Áreas de Preservação Permanente hídricas',
    grupo: 'vegetacao',
    ordem: 'fundo',
    caminho: '00_PUBLICACOES/fbds_app',
    camadas: '0',
    fonte: 'FBDS, 2013',
    modulo: 'M10',
    paraQue:
      'Mostra a delimitação cartográfica de APPs hídricas publicada no GeoPR. É apoio '
      + 'à triagem espacial; a incidência e a largura aplicáveis precisam ser conferidas '
      + 'na base adequada, na legislação e na geometria do processo.',
  },
  {
    id: 'uso-apps-hidricas-fbds',
    titulo: 'Uso e cobertura do solo nas APPs hídricas',
    grupo: 'vegetacao',
    ordem: 'fundo',
    caminho: '00_PUBLICACOES/fbds_app_uso',
    camadas: '0',
    fonte: 'FBDS, 2013',
    modulo: 'M10',
    paraQue:
      'Apoia a leitura do uso e da cobertura existentes dentro das APPs hídricas '
      + 'mapeadas. Não substitui levantamento atual, vistoria, delimitação do processo '
      + 'nem análise sobre intervenção ou regularidade.',
  },
  {
    id: 'apps-rios-litoral',
    titulo: 'Áreas de Preservação Permanente de rios do litoral',
    grupo: 'vegetacao',
    ordem: 'fundo',
    caminho: '00_PUBLICACOES/zeelit_apps_rios',
    camadas: '0',
    fonte: 'ITCG, 2016',
    modulo: 'M10',
    paraQue:
      'Acrescenta a referência territorial do ZEE-PR para APPs de rios no litoral. '
      + 'A abrangência regional e a data da camada devem permanecer visíveis na '
      + 'conferência com a cartografia atual do caso.',
  },
  {
    id: 'linhas-transmissao',
    titulo: 'Linhas de transmissão',
    grupo: 'energia',
    ordem: 'topo',
    caminho: '00_PUBLICACOES/linhas_transmissao_copel',
    camadas: '0',
    fonte: null,
    modulo: 'M07',
    paraQue:
      'A conexão é sistema associado e entra no licenciamento. Ver a rede existente '
      + 'mostra se o traçado proposto acompanha faixa já implantada ou abre outra.',
  },
  {
    id: 'pacuera',
    titulo: 'PACUERA aprovados',
    grupo: 'energia',
    ordem: 'topo',
    // O serviço reúne os planos aprovados, cada um numa subcamada. Todas ligadas
    // de uma vez: quem consulta quer ver se existe PACUERA naquele reservatório,
    // e não escolher plano por plano numa lista.
    caminho: '00_PUBLICACOES/PACUERA_Plano_Ambiental_de_Conservacao_e_Uso_do_Entorno_do_Reservatorio',
    camadas: '0,1,2,3,4,5,6,7,8,9,10',
    fonte: null,
    modulo: 'M09',
    paraQue:
      'Zoneamento do entorno de reservatórios com plano aprovado. Referência concreta '
      + 'de como um PACUERA delimita zona e uso, ao lado do que o módulo trata em texto.',
  },
  {
    id: 'zoneamento-plano-manejo',
    titulo: 'Zoneamento de Planos de Manejo',
    grupo: 'ucs',
    ordem: 'topo',
    caminho: '00_PUBLICACOES/zoneamento_plano_manejo_uc_est_fed',
    camadas: '0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26'
      + ',27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45',
    fonte: null,
    modulo: 'M12',
    paraQue:
      'O zoneamento interno de cada unidade com plano vigente. É aqui que a pergunta '
      + 'sai de "há sobreposição" e vira "a zona atingida admite o uso pretendido".',
  },
  {
    id: 'ucs-federais',
    titulo: 'Unidades de conservação federais',
    grupo: 'ucs',
    ordem: 'fundo',
    caminho: '00_PUBLICACOES/uc_federal_cnuc_mma',
    camadas: '0',
    fonte: null,
    modulo: 'M12',
    paraQue:
      'UC federal muda quem licencia e quem se manifesta. A esfera da unidade é '
      + 'anterior à discussão de zona de amortecimento.',
  },
  {
    id: 'bioma-original',
    titulo: 'Bioma original',
    grupo: 'vegetacao',
    ordem: 'fundo',
    caminho: '00_PUBLICACOES/iap_uf_bioma_original',
    camadas: '0',
    fonte: 'IAT, 2021',
    modulo: 'M10',
    paraQue:
      'Estar em Mata Atlântica original aciona regime próprio de supressão. O bioma '
      + 'não se lê pela vegetação que existe hoje no terreno.',
  },
  {
    id: 'reserva-mata-atlantica',
    titulo: 'Grande Reserva Mata Atlântica',
    grupo: 'conectividade',
    ordem: 'fundo',
    caminho: '00_PUBLICACOES/grande_reserva_mata_atlantica',
    camadas: '0',
    fonte: null,
    modulo: 'M12',
    paraQue:
      'Mosaico contínuo no leste do Estado. Ajuda a ler conectividade e efeito '
      + 'cumulativo, que não aparecem olhando uma poligonal isolada.',
  },
  {
    id: 'cavernas',
    titulo: 'Cavernas cadastradas',
    grupo: 'vegetacao',
    ordem: 'topo',
    caminho: '00_PUBLICACOES/iap_cavernas',
    camadas: '0',
    fonte: 'Cecav/ICMBio',
    modulo: 'M10',
    paraQue:
      'Cavidade natural tem proteção própria e raio de influência. Ausência no cadastro '
      + 'não é prova de ausência em campo.',
  },
  {
    id: 'potencial-espeleo',
    titulo: 'Potencialidade espeleológica',
    grupo: 'vegetacao',
    ordem: 'fundo',
    caminho: '00_PUBLICACOES/iap_potencialidade_cavernas',
    camadas: '0',
    fonte: 'Cecav/ICMBio',
    modulo: 'M10',
    paraQue:
      'Grau de potencial por litologia. Área de alto potencial sem caverna cadastrada '
      + 'é justamente onde o estudo espeleológico costuma ser exigido.',
  },
  {
    id: 'sitios-arqueologicos',
    titulo: 'Sítios arqueológicos cadastrados',
    grupo: 'patrimonio',
    ordem: 'topo',
    caminho: '00_PUBLICACOES/iap_sitios_arqueologicos_cnsa',
    camadas: '0',
    fonte: 'IAT, 2021',
    modulo: 'M11',
    paraQue:
      'Apoia a interlocução com o IPHAN. O cadastro registra o que já foi encontrado, '
      + 'e não o que existe: a manifestação do órgão continua necessária.',
  },
  {
    id: 'patrimonio-iphan',
    titulo: 'Patrimônio cultural do IPHAN',
    grupo: 'patrimonio',
    ordem: 'topo',
    caminho: '00_PUBLICACOES/Patrimônio_Cultural_IPHAN',
    camadas: '0,1,2,3,4',
    fonte: null,
    modulo: 'M11',
    paraQue:
      'Bens materiais e imateriais, além dos sítios. Amplia a triagem para além do '
      + 'arqueológico, que é só uma parte do que o IPHAN protege.',
  },
  {
    id: 'quilombolas',
    titulo: 'Territórios quilombolas',
    grupo: 'patrimonio',
    ordem: 'topo',
    caminho: '00_PUBLICACOES/quilombolas_incra',
    camadas: '0',
    fonte: null,
    modulo: 'M11',
    paraQue:
      'Comunidade tradicional afetada aciona interveniente próprio e prazo próprio. '
      + 'A triagem tem de ser feita cedo, porque muda o rito.',
  },
  {
    id: 'municipios',
    titulo: 'Limites municipais',
    grupo: 'base',
    ordem: 'fundo',
    caminho: '00_PUBLICACOES/municipios_pr_Oficial',
    camadas: '0',
    fonte: null,
    modulo: 'M11',
    paraQue:
      'Base para conferir os municípios atingidos, que definem a quem pedir certidão '
      + 'de uso e ocupação do solo e quem é ouvido no processo.',
  },
];

const PORID = new Map(CAMADAS_GEOPR.map((c) => [c.id, c]));

export function camadaPorId(id) {
  return PORID.get(id) || null;
}

export function camadasDoGrupo(grupo) {
  return CAMADAS_GEOPR.filter((c) => c.grupo === grupo);
}

/**
 * Como a tela deve creditar a camada.
 *
 * Quando o servico nao declara origem, isto devolve a frase que diz isso, e nao
 * um palpite. Ver a lacuna e parte do exercicio.
 */
export function creditoDe(camada) {
  if (!camada) return '';
  return camada.fonte
    ? `Fonte declarada pelo serviço: ${camada.fonte}.`
    : 'O serviço não declara fonte. Publicado no GeoPR; confirme a origem antes de citar.';
}
