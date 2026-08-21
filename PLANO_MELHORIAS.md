# Plano de melhorias em curso

Documento de ESTADO, não de intenção. Cada bloco é marcado como concluído
somente depois de medido e publicado. Quem retomar o trabalho começa pelo
primeiro bloco aberto e não precisa de mais contexto do que está aqui.

Atualizado em 20/08/2026.

## Como este plano foi levantado

Nada aqui saiu de suposição. A base é uma varredura das dez rotas em três
larguras (360, 768 e 1440), medindo o que RENDERIZA e não o que o código
declara: transbordo horizontal, tamanho de fonte efetivo, alvo de toque, imagem
sem alt, id duplicado, salto de nível de título e erro de runtime.

O que a varredura devolveu limpo, e que portanto NÃO está neste plano:

- transbordo horizontal: zero em 30 combinações de rota e largura
- id duplicado: zero
- salto de nível de título: zero
- imagem sem alt: zero
- erro de runtime: zero

Duas anotações antigas foram verificadas e descartadas por estarem
desatualizadas: o módulo do licenciamento federal delegado EXISTE (`m16`,
cobrindo `20.6` e `Anexo F`), e a cobertura de questões vai de 8 a 27 por
módulo, sem módulo descoberto.

## Blocos

### 0. Travessão em texto de tela, sem régua nenhuma — FEITO

Encontrado durante o levantamento do bloco 3, e maior do que ele.

A restrição é permanente e está no manual do projeto: sem travessão em texto
autoral, inclusive legenda de vídeo. Existiam 17 trechos com U+2014 em texto de
tela, em oito arquivos, e NENHUMA regra em `public-editorial-rules.mjs` para
impedi-los. O portão editorial passava limpo em 487 arquivos porque não
procurava por isso.

Havia travessão no título da folha-resposta, na marca d'água do documento de
exemplo, no cabeçalho do diagnóstico exportado e na instrução do corte
hidrelétrico.

Corrigidos os 17, com ponto medio para separador e dois-pontos ou vírgula
dentro de frase. Criado `tools/check-travessao.mjs`, com autoteste e ligado à
bateria. Conferido nos dois sentidos: reprova ao reintroduzir, aponta arquivo e
linha, e passa depois de remover.

### 1. Conteúdo didático escondido de leitor de tela — FEITO

A camada anotada das fotos de turbina (`.fa-camada`) é `aria-hidden="true"`.
Ela carrega ensino, não decoração: "entrada sob pressão", "caixa espiral: a
seção diminui", "distribuidor (palhetas móveis)", "o jato bate na aresta
divisora". O `alt` da foto diz apenas "Foto real de turbina Francis".

Ou seja, quem usa leitor de tela recebe a fotografia e perde as chamadas, que
são justamente o que transforma a foto em material didático.

É regressão introduzida em 264b6fe, no mesmo commit que trouxe as anotações.

Correção: manter o SVG `aria-hidden`, porque a geometria é mesmo decorativa, e
publicar as chamadas como texto na figura, com a classe `.sr-only` que já
existe em `nota10.css`.

### 2. Alvo de toque abaixo do mínimo — DESCARTADO, era falso positivo

Dois links de crédito ficam com 122x17 e 127x19 na rota `hidreletricas`.

Verificado e descartado. São links em linha dentro da frase de uma legenda, e a
WCAG 2.2 tem exceção explícita para alvo cujo tamanho é limitado pela entrelinha
do texto ao redor. O `experience.css` já registra a mesma decisão por escrito:
links corridos dentro de parágrafos continuam compactos para preservar a
leitura. Consertar contrariaria a norma e uma decisão do projeto.

O achado era falso positivo da minha régua, e a régua foi anotada.

### 3. Piso tipográfico usado fora do contexto que o justifica — FEITO

51 elementos renderizam em 11px. O piso de 11px está correto, e o comentário de
`tools/check-tipografia.mjs` explica por quê: "rótulo em caixa alta, que é lido
por reconhecimento e não por leitura corrida".

O problema não é o piso, é o uso. Entre os 51 há `p`, `small`, `dt`, `b` e
`span` com prosa corrida, que é exatamente o caso que o comentário exclui. E o
mesmo arquivo descreve o público: servidor de carreira, no computador do
escritório, o dia inteiro, boa parte passando dos cinquenta.

É o padrão que se repete neste repositório: critério correto num contexto,
reaproveitado como se valesse em outro.

Correção aplicada: 15 seletores de prosa subiram para 12,5px, medidos um a um
pela regra CSS que de fato os atingia, e não por busca cega em `font-size:11px`,
que pegaria trinta rótulos legítimos junto. Prosa em 11px caiu de nove
seletores para um caso isolado, cujo tamanho não vem de regra de folha e não
foi rastreado.

Rótulo em caixa alta segue em 11px, que é o uso que o piso justifica.

### 4. Densidade dos cartões de tipo de barragem — FEITO

Medido antes: no amplo eram três colunas, o texto ficava com 131px e quebrava
tanto que o cartão subia para 176px de altura ao lado de um desenho de 62px.
Sobravam 114px de folga vazia, e o desenho ocupava 14% da área do cartão. Depois
da requalificação os desenhos carregam a assinatura de material de cada tipo,
camada de lançamento, núcleo impermeável, face de concreto, e em 104px isso não
se lê.

Passou a duas colunas, com desenho de 180px. Medido depois: cartão de 132px em
vez de 176, desenho de 180x106 em vez de 104x62, ocupando 27% em vez de 14%. No
estreito o cartão vira vertical e o desenho vai a 57% da área.

No caminho eu criei e corrigi um defeito:  força o mínimo
mesmo sem espaço, e o cartão saía com 380px dentro de uma grade de 316, ou seja,
transbordo horizontal onde a varredura tinha zero. Trocado por
 e reconferido: zero transbordo nas 30 combinações.

Corrigido também o desenho do arco: o banho de água cobria a largura inteira em
planta, então o vale a jusante lia como água parada e a barragem parecia
represar dos dois lados.

## Fora de escopo, e por quê

- Chave HMAC derivada do segredo OIDC e limite global de login: estão em
  `iat-area-tecnica`, repositório separado.
- Aprovação humana institucional da mídia: decisão de pessoa, registrada como
  pendente em `reviewedBy`.
- Teto do `pop-public-content`, em 96,1%: cresce com o conteúdo do POP e não
  com este trabalho. Documentado em `tools/check-bundle.mjs` para quem for
  mexer no conteúdo.
