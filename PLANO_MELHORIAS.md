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

### 5. Pistas de eliminação no banco de questões — MEDIDO E TRAVADO, conteúdo pendente

O projeto já travava a pista de COMPRIMENTO e parou ali. As outras duas
clássicas estavam livres, e juntas valem mais do que a primeira valia sozinha.

- Absoluto na alternativa: 84 alternativas usam sempre, nunca, todo, qualquer
  ou exclusivamente, e apenas 6 são a correta. São 7% contra 33% esperado,
  z de -5,1. Eliminar absolutos leva o chute de 33% para 50% numa questão de
  três alternativas.
- Eco do enunciado: em 89 questões uma alternativa repete mais palavras do
  enunciado, e é a correta em 47% delas contra 33% do acaso, z de 2,8.

Somadas, com desempate pela mais longa: quem não sabe NADA do POP acerta 107 de
224, 48% contra 33%. Quinze pontos de graça num banco usado para avaliação.

Não reescrevi os 78 distratores. Olhei um a um e na maioria o absoluto É o erro:
"Sempre como renovação", "qualquer plano com ART comprova a execução", "sem
qualquer material cartográfico". Tirar a palavra muda o valor de verdade e pode
transformar o distrator em alternativa correta. Parte do sinal é intrínseca ao
domínio: em direito administrativo a alternativa errada erra tipicamente POR
generalizar.

Isso explica o número e não o desculpa. A saída certa é de conteúdo, alternativa
por alternativa, com quem responde pela norma. Travado em 112 para não piorar, e
impresso em toda execução para a decisão ser tomada com o número à vista.

PARA QUEM CONTINUAR: o alvo é aproximar os 48% dos 33%. O caminho de menor risco
é acrescentar absolutos LEGÍTIMOS a alternativas corretas onde a norma de fato é
absoluta, como prazo não prorrogável, e não abrandar distratores, porque abrandar
troca uma pista medida por um erro não medido.

Medido e LIMPO no mesmo levantamento, para não virar trabalho inventado depois:
viés de posição da alternativa correta, [81, 70, 64] em três opções, qui-quadrado
2,07 contra crítico 5,99. Está dentro do acaso.

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

### 6. Contraste e piso de prosa sem régua — FEITO

Nenhum portão media contraste em varredura. O arquivo de teste de
acessibilidade media dois pontos escolhidos a dedo, o gradiente e o contorno de
foco, e nada passava por todo o texto renderizado.

Virou teste em `tests/e2e/accessibility.artifact.pw.js`, que o CI já executa,
reusando os helpers de cor que o arquivo tinha. E foi ao virar teste que o
buraco apareceu: meus scripts avulsos varriam as dez rotas do menu, e a lista
`ROUTES` do teste inclui as páginas de AULA. A tela mais lida da plataforma
estava fora de toda medição.

Três defeitos lá:

- botão de velocidade ativo em 1,48:1, fundo menta fixo com `color:var(--ink)`,
  que no tema escuro é quase branco
- bloco `.analysis-alert` em 2,28:1, com hex fixo `#635943` ignorando os tokens
  de âmbar por tema que o projeto já tem
- sete regras de prosa em 11 e 11,5px, incluindo a definição do glossário

Conferido antes de corrigir que os dois contrastes não eram falso positivo de
fundo pintado por vídeo, que é a armadilha clássica. Não eram.

### 7. Norma citada sem lastro — FEITO

Das restrições permanentes, a de maior consequência e a de menor verificação:
não inventar. Nada olhava para os números de lei escritos no texto das telas.

Medido: 34 normas citadas, 32 no POP e 2 com URL oficial. Nenhuma inventada.
Criado `tools/check-normas.mjs` com três armadilhas de autoteste, ligado à
bateria, conferido nos dois sentidos.

A régua errou duas vezes antes de acertar, e as duas ficam registradas dentro
dela: exigir número e ano adjacentes reprovava a fonte por escrever certo, e
codificar só o POP reprovava atos verificáveis, que a regra admite.

### 8. Registro local apresentado como certificado — MEDIDO, LIMPO

A regra permanente diz que marco local nunca é apresentado como certificado ou
credencial institucional. O código nomeia a lista como `certificates`, o que
levanta suspeita, mas nomeação interna não é apresentação.

Medido na tela: o perfil mostra "Não é login seguro nem credencial institucional
do IAT" e "Eles não são certificado, credencial profissional nem documento do
IAT". Os botões "Baixar" são de pacote offline. Nenhum artefato é apresentado
como certificado.

Não criei portão aqui: a única regra escrevível confundiria o aviso, que contém
a palavra, com a infração. Portão que acusa quem cumpre a regra ensina a
desligar portão.

### 9. Identificador sensível e caractere de controle — FEITO

A restrição permanente nomeia os identificadores um a um, e a sanitização
cobria caminho de usuário, e-mail e metadado de DOCX, e nenhum dos brasileiros.
Cinco padrões acrescentados, medidos antes contra a base para não nascerem
reprovando por falso positivo, e provados de ponta a ponta com um CNPJ plantado
em campo que a sanitização preserva.

Ao escrever esses padrões por script eu gravei o byte 0x08 no lugar de `\b`,
porque em string Python não bruta `\b` é escape de backspace. Quatro padrões
exigindo backspace literal no meio do CNPJ: nunca casam. O portão passava e o
grep mostrava a regra como correta, porque 0x08 é invisível no terminal.

Portão inerte é pior que portão ausente. O `check-travessao` passou a guardar
também caractere de controle em src, tools e tests.

### 10. Foco em hidrelétrica — MEDIDO, LIMPO

Última restrição permanente sem verificação. Zero conteúdo de outra tipologia.
As duas suspeitas eram falso positivo meu: `ETE` sem diferenciar maiúscula casa
dentro de "delete", e a Agência Nacional de Mineração é interveniente legítimo
do licenciamento hidrelétrico, não licenciamento de mineração.

### 11. Qualidade do objetivo de aula — TRAVADO

A auditoria conferia estrutura e roteamento, e nada olhava para a promessa que
cada aula faz. Medido: 168 textos distintos para 168 aulas, 156 derivados do POP
e 156 com "como se vê". Estava bom e desguardado.

As 12 no perfil genérico ficam como estão: são seções em que o POP não oferece
quadro, ação nem exigência, e inventar objetivo ali é o que a regra proíbe.

## Situação do levantamento

As cinco restrições permanentes do manual estão cobertas: três ganharam régua
nesta rodada, duas foram medidas e estavam limpas. A veia que vinha rendendo,
procurar regra permanente sem verificação, está esgotada.

O que resta exige decisão que não é de quem escreve o código:

- a dívida de conteúdo do banco de questões, que precisa de quem responde pela
  norma
- a aprovação humana institucional da mídia
- os itens do repositório da Área Técnica

Continuar criando portão a partir daqui seria inventar trabalho.

## Fora de escopo, e por quê

- Limite global de login: FEITO, em `iat-area-tecnica`, commit `bd9f605`. Estava
  fora de escopo por engano meu: o que bloqueava era a abertura do PR, não o
  acesso ao código, e o repositório está nesta máquina.

- Chave HMAC derivada do segredo OIDC: NÃO É DEFEITO, e a anotação anterior
  estava empobrecida. Corrijo aqui porque achado errado registrado é pior do que
  achado nenhum.

  Lida com o contexto, a derivação existe para o piloto local no Windows, onde o
  operador tem um arquivo de segredos que contém apenas o `oidc_client_secret`.
  Ela usa separação de domínio em vez de reutilizar o segredo bruto, vale só no
  modo sintético, e vem acompanhada de verificação de ACL do arquivo, recusa de
  ponto de reparse e validação de tamanho. Fora desse caminho o serviço exige a
  variável própria e recusa iniciar.

  É decisão de projeto deliberada e testada, e não descuido. Minha anotação
  original descreveu o mecanismo sem o cenário, e nessa forma ela induziria
  alguém a quebrar um desenho cuidadoso.

  O que sobra como observação legítima, e é do dono decidir: os dois segredos
  irmãos seguem políticas opostas na mesma função. O de privacidade recusa
  iniciar sem variável própria, com a justificativa escrita de que "deve ser
  exclusiva da API e nunca compartilhada com o worker". Essa justificativa,
  se valer, vale para os dois.
- Aprovação humana institucional da mídia: decisão de pessoa, registrada como
  pendente em `reviewedBy`.
- Teto do `pop-public-content`, em 96,1%: cresce com o conteúdo do POP e não
  com este trabalho. Documentado em `tools/check-bundle.mjs` para quem for
  mexer no conteúdo.
