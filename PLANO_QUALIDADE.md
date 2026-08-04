# Plano de qualidade da Academia IAT

Plano de execução por etapas para vídeo, animação, layout, conteúdo, aprendizagem
e ferramentas. Complementa `PLANO_EVOLUCAO.md`, que cuida de governança, proveniência
e alegações institucionais. Este aqui cuida da **experiência e da qualidade do
material**, e cada item nasce de um número medido, não de impressão.

Medições iniciais em 31/07/2026 sobre o commit `cbf8c3f`.
**Estado atualizado em 04/08/2026**, ao fim de uma sequência de rodadas de execução.

## Onde o plano está

| Etapa | Estado | Medida |
|---|---|---|
| A1 orçamento de JS | ✅ | 99,6% → 89,3% do teto |
| A2 extrair telas de `main.jsx` | 🟨 | 3.993 → 3.447 linhas; `Profile` e `Biblioteca` fora; falta `Lesson` |
| B1 legenda legível | ⛔ | revertida: o cartão é desenhado no MP4 e os dois divergiriam. `frame()` já usa a mesma segmentação; falta regerar o acervo |
| B2 prosódia | 🟨 | normalização feita e testada; vale na próxima regeração. Pausa variável em aberto |
| C1 tema nos SVG | ✅ | |
| C2 animar processo | ✅ | canal de fuga escoa; descrição acessível conta o processo |
| D3 fonte vs interpretação | ✅ | régua e rótulo no texto do POP; convenção de cor registrada |
| E1 escada de níveis | 🟨 | instrumento criado; 3 degraus de 5 ocupados. `aplicar` e `fundamentar` vazios |
| E3 questões | ✅ | pista de comprimento 63% → 30,1%, abaixo do acaso de 32,8% |
| F1 menu agrupado | ✅ | 11 itens → 4 grupos |
| F2 medida de linha | ✅ | 85 → 72 caracteres |
| F3 foco no vídeo | ✅ | verificado, sem defeito |
| G1 regerar peça só | ✅ | `refazer_legendas.py` |
| CSS destravado | ✅ | 96,9% → 89,8% do teto |

**O que fica em aberto, em ordem de valor:**

1. **Regerar o acervo de vídeo.** É o que faz B1 e B2 chegarem à tela. Exige Piper
   e horas de recodificação. `frame()` e o `.vtt` já saem da mesma segmentação, então
   a regeração entrega legenda legível nos dois lugares de uma vez.
2. **D1**, os nove elementos em cada uma das 159 aulas. O maior em volume.
3. **E1**, ocupar os degraus `aplicar` e `fundamentar`. Exige autoria de conteúdo:
   marcar evidência que não serve à decisão, e escrever pergunta aberta com rubrica.
4. **A2**, extrair `Lesson` de `main.jsx`, que é a maior tela restante.
5. **E2**, revisão espaçada com retomada de erro.

Legenda de estado: ⬜ não começou · 🟨 em execução · ✅ concluído e verificado.

---

## Como usar este plano

Cada etapa é **autocontida**: dá para executar uma por sessão, sem depender de
contexto das outras, exceto onde estiver escrito o contrário. Toda etapa tem:

- **Por quê**, com a evidência medida;
- **O que fazer**, concreto o bastante para outra pessoa executar;
- **Como verificar**, para não depender de opinião;
- **Pronto quando**, o critério de encerramento.

Ao terminar uma etapa, marque ✅ aqui e registre o número medido depois. Nenhuma
etapa recebe ✅ com base em inspeção estática: precisa de build, teste e navegador.

## Restrições que valem para tudo

1. Nenhum dado sensível ou privado. Números técnicos ficam quando a conta é a lição.
2. Não inventar. Afirmação normativa sai do POP ou de ato verificável.
3. Sem travessão em texto autoral, inclusive legenda. Há portão automático.
4. Só hidrelétrica.
5. Registro local nunca é certificado nem credencial. O POP organiza o método e não
   cria exigência.
6. Sem backend. Deploy estático.
7. O acervo de mídia já pesa 159 MB só de videoaula. Proposta que aumente isso precisa
   dizer quanto e por quê.

---

## Estado medido hoje

| Dimensão | Medida | Situação |
|---|---|---|
| Videoaulas | 159 arquivos, mediana 44 s, mín 8 s, máx 100 s, 121 minutos, 159 MB | mais longas do que se supunha |
| Legendas | 905 blocos; **88% com linha acima de 42 caracteres**, maior com 220; **64% dos blocos acima de 6 s**, mediana 7,4 s, máx 21,9 s; nenhum bloco com mais de uma linha | defeito sistemático |
| Esquemas SVG | `hydro.jsx` com **zero** ocorrências de `currentColor` ou `var(--)`, só `fill="#..."` literal | não seguem o tema |
| Movimento | `prefers-reduced-motion` coberto globalmente em `styles.css:23` e em mais 5 pontos | já resolvido, não mexer |
| Foco | `:focus-visible` presente em 4 das 5 folhas; `videoLearningStage.css` não tem nenhuma regra de foco | lacuna a confirmar |
| Bundle | JS total **99,6% do teto** (270 KiB gzip); chunk `ui` de 50 KiB gzip carrega sempre `courseData` + `questionsExtra` + `labCases` | trava o próximo commit |
| `main.jsx` | 3.801 linhas, 23 componentes de topo | `Lesson` e `Profile` ainda dentro |
| Casos | 26 com rubrica completa; **apenas 5 declaram nível**, em escala improvisada | progressão não é explícita |
| Testes | 33 arquivos, 193 testes, 12 portões | saudável |

---

## Frente A. Destravar o orçamento

### A1. Índice leve na frente, corpo pesado sob demanda ✅

**Por quê.** O JS total está em 99,6% de 270 KiB gzip. O próximo commit trava o build.
Dividir chunk não resolve: o orçamento é do total, e chunk adiado continua contando.
O que resolve é tirar do pacote o que não precisa estar lá.

O chunk `ui` tem 50 KiB gzip e carrega sempre `courseData` + `questionsExtra` +
`labCases`. Ele é carregado sempre porque `main.jsx` e `laboratorio.jsx` importam os
mesmos dados, e o empacotador promove o dado compartilhado para um pedaço comum.

**O que fazer.**

1. Separar `labCases.js` em duas partes:
   - `labIndex.js`: por caso, apenas `id`, `track`, `label`, `title`, `type`, `nivel`.
     É o que a Formação, a prontidão e o roteamento precisam. Poucos kB.
   - `src/data/lab-corpos.json`: `facts`, `evidence`, `docs`, `serie`, `questions`,
     `steps`, `outcome`, `elementos`, `modelo`. Servido como arquivo buscado em
     tempo de execução (`?url` + `fetch`), não como módulo.
2. O Laboratório e o Redator buscam o corpo do caso quando o caso abre, não antes.
3. Mesmo tratamento para `questionsExtra.js`: a Formação só precisa saber **se** o
   módulo tem questão, não o enunciado de todas.
4. Registrar no `check-bundle` o percentual usado, para o número aparecer no build.

**Como verificar.** `npm run build` e comparar: JS total gzip antes e depois; tempo
até a primeira tela útil. Abrir o Laboratório e um caso, confirmar que o corpo chega.
Testar com rede lenta simulada, para o estado de carregamento aparecer.

**Pronto quando.** JS total abaixo de 85% do teto, com folga declarada para as
próximas etapas, e nenhuma tela dependendo de dado que ela não busca.

**Risco.** O Laboratório passa a ter estado de carregamento onde não tinha. Precisa
de estado vazio decente e de tratamento de falha de rede, senão a área fica em branco
sem explicação.

**Concluído em 01/08/2026, em duas passadas: casos e banco de questões.**

| | Antes | Casos | Casos e questões |
|---|---:|---:|---:|
| JS total (gzip) | 269,0 KiB (99,6%) | 257,0 KiB (95,2%) | **235,5 KiB (87,2%)** |
| JS total (bruto) | 847,6 KiB (99,7%) | 798,9 KiB (94,0%) | **721,9 KiB (84,9%)** |
| Chunk `ui`, sempre carregado | 50,3 KiB gzip | 30,8 KiB gzip | **deixou de existir** |

O aviso do orçamento desapareceu: as duas medidas voltaram para a faixa OK.

A causa exata: `courseData.js` importava `labCases.js` na primeira linha, e como
`main.jsx` importa `tracks`, `questionBank` e `trackGroups` de `courseData`, os 70 kB
de casos entravam no caminho crítico de quem só queria abrir uma aula.

O que foi feito:

- a montagem dos cenários saiu para `src/scenarios.js`, que continua sendo a fonte de
  autoria lida pelos testes e pelo `check-rubricas`;
- `tools/build-lab-data.mjs` deriva dela dois artefatos, com modo `--check` no
  `npm test` e no `npm run build` para nunca divergirem:
  `src/data/lab-index.json` (20,5 kB, entra no pacote) e `src/data/lab-corpos.json`
  (68,3 kB, buscado), ou seja **77% do peso sai do orçamento de JS**;
- o índice usa os **mesmos nomes de campo** do caso completo, inclusive `questions`
  em formato de tupla, então as telas que só precisam de título, fatos e enunciado
  não mudaram uma linha;
- `useCasosSobDemanda` busca o corpo só quando o Laboratório ou o Redator abrem, com
  estado de carregamento e uma tela de erro explícita, porque arquivo buscado falha e
  em subcaminho um 404 deixaria a área em branco sem aviso.

Verificado no navegador: depois de navegar pela Formação, o corpo dos casos tem
**zero downloads**; ao abrir o Laboratório, um download e os 26 casos completos; o
Redator mostra as evidências, que só existem no corpo.

Segunda passada, o banco de questões. Mesma separação, com uma diferença de projeto:
o banco entra na **busca de arranque**, não sob demanda, porque a tela de aula usa uma
questão comentada em cada tópico. Adiar só trocaria o custo de lugar. Ele viaja no
mesmo `Promise.all` que já busca o POP, então não acrescenta uma ida à rede em série.

- `src/questions.js` passou a ser a fonte de autoria, lida pelos testes e pelo
  `check-questoes`;
- `tools/build-question-data.mjs` deriva `src/data/question-bank.json` (84,9 kB), com
  `--check` na bateria;
- `loadAppData` ganhou `questionBankUrl` e valida que a resposta veio como lista.

Verificado no navegador: uma busca do banco no arranque, zero busca do corpo dos casos
enquanto o Laboratório não abre, checagem comentada com alternativas na aula e
Avaliações renderizando, console limpo.

**Detalhe que vale registrar.** O portão de segurança reprovou um comentário meu que
dizia "saiu do JavaScript: vem por busca": a sequência casa com o padrão de URL
`javascript:`. O portão estava certo em ser literal. Ao escrever comentário perto de
`href`, `src` ou `url`, evite a palavra seguida de dois-pontos.

### A2. Extrair `Lesson` e `Profile` de `main.jsx` ⬜

**Por quê.** `main.jsx` tem 3.801 linhas e 23 componentes. `Lesson` (linhas 2064 a 2569
e subcomponentes até 3243) é a tela mais usada da plataforma e a mais difícil de mexer.
`Profile` (771 a 1340) carrega junto a geração de certificado, que só serve nela.

**O que fazer.** Seguir o procedimento da skill `refatorar-tela-react`. Extrair
`Profile` primeiro, porque a fronteira é mais limpa: separar `profile.js` em núcleo
(usado no arranque: `loadProfile`, `hasAccount`, `saveProfile`) e pesado
(`certificateSvg`, `downloadSvg`, backup), levando o pesado junto com a tela.
Depois `Lesson`, com contrato de dados explícito como o `DADOS_BIBLIOTECA`.

**Como verificar.** `npm run check:referencias`, `npm run check:bundle`, e as 11 rotas
abertas no navegador com o console limpo.

**Pronto quando.** `main.jsx` abaixo de 2.000 linhas e cada tela grande com módulo
e contrato próprios.

---

## Frente B. Legenda e narração

### B1. Reescrever o gerador de legenda ✅

**Por quê.** É o defeito mais generalizado da plataforma, e é medido:
88% dos blocos têm linha acima de 42 caracteres, a maior com 220; 64% ficam acima de
6 segundos na tela, com mediana de 7,4 s e máximo de 21,9 s; e nenhum bloco tem mais
de uma linha, o que significa que **cada frase inteira vira uma linha só**.

Numa peça de 960 px de largura, uma linha de 220 caracteres ou transborda ou encolhe
até deixar de ser legível. Quem depende de legenda não consegue acompanhar.

**O que fazer.** Em `tools/build_lesson_videos.py`, na função que escreve o VTT:

1. Quebrar a fala em blocos de no máximo 2 linhas e 42 caracteres por linha.
2. Quebrar por unidade sintática, nunca por largura: não separar artigo de
   substantivo, preposição de complemento, número de unidade (`2,27` de `ha`),
   sigla de expansão.
3. Bloco entre 1,0 s e 6,0 s. Frase longa vira dois ou três blocos, com o tempo
   repartido proporcionalmente ao número de caracteres de cada pedaço.
4. Intervalo mínimo de 0,08 s entre blocos.
5. Manter a origem do tempo única: o bloco sai da mesma linha do tempo que gerou os
   quadros e a trilha, nunca de um cálculo paralelo.

**Como verificar.** Rodar o medidor deste plano de novo. Alvos: zero linha acima de
42 caracteres, zero bloco acima de 6 s, zero bloco acima de 17 caracteres por segundo.
Assistir três peças inteiras com o som desligado.

**Pronto quando.** Os três alvos zerados e `check-videoaulas` verde.

**Feito em 31/07/2026.** Medição final sobre os mesmos 159 arquivos:

| | Antes | Depois |
|---|---:|---:|
| Blocos | 905 | 1.855 |
| Linhas acima de 42 caracteres | 794 (88%) | **6** |
| Blocos acima de 6 s | 582 (64%) | **10** |
| Maior linha | 220 | 46 |

Os 10 blocos longos restantes são todos a cue de título, que não pode ser dividida
porque o portão compara o texto dela com o título da aula. As 6 linhas restantes
ficam entre 43 e 46 caracteres, em trechos onde nenhuma fronteira de palavra divide
o bloco dentro do teto.

A segmentação virou `tools/legendas.py`, compartilhada pelo gerador e pelo
refazedor. Duas passadas: primeiro por comprimento, depois por duração, e uma
terceira que redistribui o tempo para nenhum bloco passar de 17 caracteres por
segundo. Essa terceira passada apareceu na execução: dividir revela picos locais de
velocidade que a média da cena escondia.

O portão `check-videoaulas` deixou de exigir `cues === cenas + 1`, que era o que
impedia legenda legível, e passou a cobrar comprimento de linha, número de linhas e
tempo na tela, para o ganho não regredir.

**Efeito colateral tratado.** O painel de transcrição lê o mesmo arquivo, e com o
dobro de blocos virou lista de meias frases. Ele agora reagrupa por frase. A regra
olha o **início** do bloco seguinte, não o fim do anterior: as falas saem do POP sem
ponto final, e testar pontuação no anterior colapsava a transcrição inteira num item
só. Resíduo conhecido: um bloco que começa com sigla maiúscula abre item novo.

### B2. Prosódia da narração 🟨

**Por quê.** Piper não tem SSML: toda a prosódia vem de como o texto é segmentado e
pontuado antes de chegar nele. Hoje a leitura é corrida, com pausa uniforme entre
falas, o que achata a diferença entre uma definição e um critério de decisão.

**O que fazer.** Ver a skill `video-narracao-prosodia`. Em resumo:

1. Pausa variável por situação: 0,25 s entre frases da mesma ideia, 0,6 s entre
   ideias, 0,45 s antes de número ou critério decisivo, 0,7 s depois de pergunta.
2. Normalizar antes de sintetizar: `5º` vira `quinto`, `art. 5º` vira `artigo quinto`,
   `Q7,10` vira `Q sete dez`, `m³/s` vira `metros cúbicos por segundo`, `§ 2º` vira
   `parágrafo segundo`. Manter o texto original na legenda: são duas saídas do mesmo
   roteiro, não a mesma string.
3. Conferir que o segmentador de frase cobre `art.`, `arts.`, `inc.`, `nº`, `p. ex.`,
   com o ponto dentro da exceção do lookbehind. Este erro já custou 32 vídeos.

**Como verificar.** Ouvir uma peça com citação de artigo, uma com número decimal e
uma com sigla.

**Pronto quando.** Nenhuma frase começa com minúscula por corte de abreviação, e a
duração da trilha bate exatamente com a do vídeo.

**Normalização feita em 01/08/2026. A pausa variável continua aberta.**

Boa parte já existia: `art.`, `inc.`, `nº`, `km²`, `km`, `MW`, `ha`, `%`, siglas
soletradas e travessão virando vírgula. Em vez de supor o que faltava, varri o acervo
de 159 legendas e contei:

| Padrão | Ocorrências | Estava tratado? |
|---|---:|---|
| Número de ato com milhar (`15.190/2025`) | 54 | não |
| Ordinal (`5º`, `1ª`) | 25 | não |
| Sigla com barra (`SEI/IBAMA`) | 13 | só `EIA/RIMA` |
| Parágrafo (`§`) | 4 | não |
| Inciso em romano | 1 | não |
| `m³/s`, `Q7,10`, data `30/06` | **0** | a suposição do plano estava errada |

O que entrou, com sete testes em `tools/test_tooling.py`:

- `15.190/2025` vira `15190, de 2025`. Escrito como estava, o sintetizador decidia
  sozinho o que fazer com o ponto de milhar e com a barra, e nenhuma das leituras
  possíveis é a certa.
- Ordinal jurídico pela convenção brasileira: **ordinal até o nono** (`art. 5º` vira
  "artigo quinto"), **cardinal do décimo em diante** (`artigo 12º` vira "artigo 12",
  não "artigo décimo segundo").
- `§` vira "parágrafo", `§§` vira "parágrafos", `inciso III` vira "inciso terceiro".
- Sigla com barra ganha conjunção, generalizando a escolha que já valia para
  `EIA/RIMA`.

**Limite honesto.** `texto_falado` só alimenta o sintetizador, não a legenda. O ganho
aparece na **próxima regeneração** do acervo, porque mudar a duração do áudio muda a
linha do tempo das cenas e exige recodificar o vídeo. Os 159 arquivos atuais mantêm o
áudio antigo.

**Falta** a pausa variável por situação. Hoje ela é uniforme: 0,62 s de cauda por cena
mais 0,16 s de intervalo mínimo na trilha. Variar exige o gerador saber o papel de cada
cena (definição, critério, número decisivo), o que ele ainda não sabe.

### B3. Composição: de slide narrado para videoaula ⬜

**Por quê.** As peças têm mediana de 44 s e chegam a 100 s. Nesse tempo, quadro
estático com texto trocando é desperdício: dá para ensinar de verdade.

**O que fazer.** Ver a skill `video-aula-composicao`. Estrutura mínima em quatro
momentos: gancho (a pergunta concreta que a aula resolve), desenvolvimento (uma
ideia por cena), ancoragem (o caso, o número, o quadro) e fecho (o critério de
decisão em uma frase).

Regras que mudam a percepção sem custo de peso:

- Nada aparece na tela antes de ser dito. Texto adiantado faz a pessoa ler em vez
  de ouvir, e ela perde as duas coisas.
- Revelação progressiva em lista: o item entra quando é narrado, os anteriores ficam
  esmaecidos em vez de sumir.
- Transição com sentido: corte seco para continuação, fade de 0,25 s para mudança de
  tema, escala com easing para detalhe. Nunca transição diferente a cada corte.
- Easing cúbico (`3t² - 2t³`) em posição, escala e opacidade. Entrada 0,35 s,
  saída 0,2 s.

**Como verificar.** A peça faz sentido sem som, e a narração faz sentido sem imagem.

**Pronto quando.** Uma amostra de 5 peças reescrita e comparada lado a lado com a
versão atual, antes de regenerar as 159.

**Ordem.** Fazer B1 e B2 antes. Não faz sentido recompor 159 peças e depois descobrir
que a legenda precisa mudar de novo.

---

## Frente C. Ilustração técnica e identidade visual

### C1. Esquemas SVG legíveis nos dois temas ✅

**A premissa original estava parcialmente errada, e a execução corrigiu o rumo.**

O plano dizia: `hydro.jsx` tem zero `currentColor` ou `var(--)`, logo os esquemas não
seguem o tema, logo trocar 167 cores literais por variáveis semânticas. Isso foi
inferido de um `grep`, não observado.

Ao abrir no navegador, o quadro real apareceu. O esquema principal (`.hydro-gif`) já
declarava tela própria (`background:#04231c`) e por isso sempre funcionou nos dois
temas. **Cor literal ali não é defeito: é desenho técnico sobre tela escura, uma
decisão de projeto.** O defeito estava em outro lugar: dos 7 esquemas grandes, **5
não declaravam tela** e, no tema claro, caíam sobre branco.

Medido no tema claro, antes: **16 cores abaixo de 3:1** de contraste, a pior em
**1,29:1** (`#dce5e0`), a água em 1,34:1 e o acento principal em 1,69:1. Elemento
gráfico exige 3:1.

**O que foi feito.** Aplicar aos cinco a mesma tela que o sexto já tinha, em vez de
retematizar 167 cores. Uma regra de CSS no lugar de um mutirão, e com um ganho a
mais: os esquemas ficaram coerentes entre si, o que não eram.

Depois: **zero esquema sobre fundo claro**, e os dois temas passaram a medir
exatamente igual. As 9 cores que continuam abaixo de 3:1 contra a tela são
preenchimentos internos escuros do próprio desenho, não marcas de leitura.

**Lição registrada.** `grep` mostra o que o código escreve, não o que a tela mostra.
A proposta certa só apareceu depois de medir o fundo efetivo de cada esquema
renderizado.

### C2. Animar o que é processo ⬜

**Por quê.** Esquema técnico animado ensina o que texto não alcança: ordem, direção e
proporção. Hoje os esquemas hidráulicos são estáticos, e a informação que falta é
justamente o movimento.

**O que fazer.** Ver a skill `video-animacao-svg`. Prioridade, nesta ordem:

1. **Fluxo de água** no arranjo (tomada, conduto forçado, casa de força, canal de
   fuga, trecho de vazão reduzida): `stroke-dasharray` com `stroke-dashoffset`
   animado. Direção fica óbvia sem partícula nem gradiente. Período igual em todos os
   trechos do mesmo circuito.
2. **Enchimento de reservatório**: `y` e `height` de um retângulo com `clip-path` no
   formato do vale. Nunca escalar o grupo, senão os taludes esticam junto.
3. **Giro do rotor**: rotação em torno do eixo real, não do centro da caixa
   delimitadora, e sem easing, porque máquina em regime não acelera.
4. **Corte explodido** das estruturas, com rótulo entrando 0,15 s depois que a peça para.

Cada esquema ganha `role="img"`, `title` e `desc` descrevendo o **processo**, não a
aparência. Informação nunca só em cor: fluxo diferente ganha traço diferente.

`prefers-reduced-motion` já está coberto globalmente por `styles.css:23`, mas o estado
parado precisa continuar informativo. Se o desenho parado não explica nada, o desenho
está errado.

**Como verificar.** Parar o movimento e ver se ainda ensina. Conferir eixo de rotação.

**Pronto quando.** Os quatro esquemas animados, legíveis parados, com descrição de
processo, e reaproveitáveis como quadro de vídeo.

**Ganho duplo.** O mesmo SVG serve à interface e ao vídeo: renderize o próprio SVG por
quadro em vez de redesenhar em bitmap, e os dois destinos nunca divergem.

---

## Frente D. Conteúdo didático

### D1. Os nove elementos em cada aula ⬜

**Por quê.** Cobertura do POP é forte, mas cobertura não é aprendizado. Hoje o exemplo
trabalhado e o erro frequente concentram-se nas aberturas de módulo.

**O que fazer.** Aplicar em cada uma das 159 aulas: pré-requisito, objetivo observável,
explicação, fonte, exemplo trabalhado, erro frequente, prática, feedback e domínio.
Ver a skill `design-instrucional`.

Objetivo observável significa verbo de ação: "distinguir modalidade adequada de
documentação suficiente", não "entender modalidades".

O item que mais falta e mais rende é o **erro frequente**. Ele vale mais que outro
exemplo certo, e sai de graça do material real: cada achado recorrente de análise é
um erro frequente pronto.

**Como verificar.** Portão novo (`check-aulas.mjs`) contando aula por aula quais dos
nove elementos existem, e falhando abaixo de um piso declarado. Começar com piso
baixo e subir a cada rodada.

**Pronto quando.** Nenhuma aula com menos de sete dos nove elementos.

### D2. Matriz objetivo, atividade e avaliação ⬜

**Por quê.** É onde os buracos aparecem sozinhos: objetivo sem atividade, avaliação
cobrando o que nenhuma aula ensinou, atividade que não serve a objetivo nenhum.

**O que fazer.** Gerar a matriz a partir do dado que já existe (`learningDesign.js`,
`questionBank`, `scenarios`) e publicá-la como página interna de conferência, não como
tela de aluno. Ela é ferramenta de autor.

**Pronto quando.** Zero objetivo sem atividade e zero item de avaliação sem objetivo.

### D3. Fonte, interpretação e exemplo visualmente distintos ⬜

**Por quê.** É o defeito mais grave possível neste domínio: misturar os três transforma
opinião em norma aos olhos de quem está aprendendo.

**O que fazer.** Auditar cada tela e garantir três tratamentos visuais inconfundíveis,
com rótulo textual e não só cor. Verificar especialmente o resumo da aula, o
laboratório e o redator de IT.

**Pronto quando.** Auditoria concluída e cada bloco de conteúdo classificado.

---

## Frente E. Aprendizagem e prática

### E1. Escada de níveis explícita nos casos 🟨

**Correção do diagnóstico.** Eu havia escrito que 5 dos 26 casos declaravam nível.
Errado: **nenhum caso declara nível.** As cinco ocorrências eram dos **grupos**, e o
rótulo é herdado por todos os casos do grupo.

**O que a medição de 01/08/2026 encontrou, e é pior do que parecia.** Os 26 casos têm
exatamente a mesma forma:

| | Todos os 26 casos |
|---|---|
| Fatos | 4 |
| Evidências | 4 |
| Perguntas | 5, **todas de sim ou não** |
| Elementos de rubrica | 4 |
| Passos | 5 |
| Série histórica | só em 5 casos |

Quem resolve o caso 26 faz o mesmo tipo de raciocínio do caso 1. O catálogo exibe
"Primeiro contato", "Aplicação", "Avançado" e "Especialista", mas isso é assunto, não
dificuldade. **O rótulo promete uma progressão que o material não entrega.**

**Feito: o instrumento que mede, antes de qualquer rótulo novo.**

`src/niveisLab.js` define os cinco degraus pela natureza da tarefa, e cada um exige uma
marca verificável no dado do caso:

| Degrau | Tarefa | Marca exigida |
|---|---|---|
| Reconhecer | identificar o que a norma pede | nenhuma, é a partida |
| Aplicar | usar o critério | evidência com `distrator: true` |
| Decidir | julgar com informação incompleta | evidência com `ausente: true` |
| Integrar | conciliar fontes que não fecham | `serie`, ou evidência com `conflito: true` |
| Fundamentar | sustentar por escrito | pergunta cuja resposta não é sim nem não |

`tools/check-niveis.mjs` entrou na bateria e mede a distribuição real:

```
1. Reconhecer   21  #####################
2. Aplicar       0
3. Decidir       0
4. Integrar      5  #####
5. Fundamentar   0
```

O portão falha se um degrau perder casos, se a escada ficar com menos de dois degraus
ocupados, ou se um grupo anunciar "Avançado" ou "Especialista" sem nenhum caso acima da
partida. Ele não exige a escada pronta: exige que ela não regrida nem passe a prometer
mais do que entrega.

**Falta a mudança de conteúdo, e ela precisa da sua conferência.** Seis casos **já
narram** evidência ausente nos fatos ("PSB e PAE não constam do processo", "duas
condicionantes da LP estão sem evidência anexada", "sem comprovação conferida"), mas
nada no dado distingue documento presente de documento faltante. Marcar isso seria fiel
ao caso, não invenção. O que segura: a lista `evidence` é hoje um vetor de textos
renderizado direto, e mexer nela toca seis portões e a tela do Laboratório. É trabalho
de conteúdo, com raio de alcance maior do que aparenta, e merece ser visto antes de
chegar a quem estuda.

**O que fazer.** Adotar cinco níveis, definidos pela **natureza da tarefa**, não pelo
tamanho:

| Nível | Tarefa | O que a pessoa recebe |
|---|---|---|
| Reconhecer | identificar | caso fechado, uma resposta certa |
| Aplicar | usar o critério | caso com distratores |
| Decidir | julgar | **caso com evidência faltando** |
| Integrar | conciliar | caso com fontes em conflito |
| Fundamentar | sustentar | caso aberto, avaliado por pessoa |

Classificar os 26 casos existentes e medir a distribuição. O salto que quase todo
material erra é de "aplicar" para "decidir", e ele exige **tirar** informação do
enunciado, não acrescentar.

**Pronto quando.** Os 26 classificados, nenhum nível vazio, e pelo menos três casos
no nível "decidir" com evidência deliberadamente ausente.

### E2. Revisão espaçada com retomada de erro ⬜

**Por quê.** Conteúdo estudado uma vez e nunca revisto se perde. Sem isso, a avaliação
final mede memória recente.

**O que fazer.** Trazer de volta o que a pessoa **errou**, com intervalo crescente,
priorizando erro sobre acerto. O estado já guarda `doneAt` e `lastVisit`; falta a fila
de retomada e a superfície que a mostra.

**Pronto quando.** O plano do dia traz item errado antes de item novo, e o intervalo
cresce a cada acerto sucessivo.

### E3. Questões que medem competência ⬜

**O que fazer.** Auditar o banco e corrigir: distrator plausível vindo de erro real e
não de absurdo; alternativas de comprimento parecido; sem pista gramatical; sem "todas
as anteriores"; feedback explicando por que **cada** distrator está errado.

Questão que só cobra memória de número de artigo mede memória de número de artigo.
Marcar essas e converter em questão de aplicação.

**Como verificar.** Estender `check-questoes.mjs` com as regras mecânicas
(comprimento das alternativas, pista gramatical, alternativas proibidas).

---

## Frente F. Layout e primeira experiência

### F1. Caminho de quem chega ⬜

**Por quê.** São 11 áreas irmãs no menu. Quem chega pela primeira vez precisa decidir
sozinho por onde começar, e a decisão errada custa a sessão inteira.

**O que fazer.** Um caminho declarado para o primeiro acesso, que leve da tela inicial
à primeira aula em no máximo dois cliques, com uma frase dizendo o que a pessoa vai
saber fazer ao final. Agrupar o menu por natureza (aprender, praticar, consultar,
conta) em vez de listar onze itens no mesmo nível.

**Pronto quando.** Dois cliques até a primeira aula, e o menu com no máximo quatro
grupos.

### F2. Ritmo tipográfico do texto técnico ⬜

**O que fazer.** Medir e ajustar medida de linha (entre 60 e 75 caracteres para prosa),
entrelinha e escala tipográfica. Texto normativo longo em linha larga demais cansa e a
pessoa perde a linha ao voltar.

### F3. Foco no reprodutor de vídeo ✅

**Por quê.** `videoLearningStage.css` não tem nenhuma regra de `:focus` ou
`:focus-visible`, enquanto as outras quatro folhas têm. Pode ser herança de regra
global, pode ser lacuna.

**O que fazer.** Confirmar no navegador percorrendo os controles do reprodutor só com
Tab. Se o foco não estiver visível, criar a regra com contorno de 2 px e contraste
mínimo de 3:1. Não inferir por estilo computado: `getComputedStyle` não lê
`:focus-visible`.

**Verificado em 04/08/2026. Não havia defeito, e nenhuma linha foi alterada.**

A suspeita era razoável, mas a regra global `button:focus-visible` de `styles.css`
cobre os controles do reprodutor. Medido percorrendo com Tab de verdade:

- contorno renderizado, `solid 2,67 px`, cor `#3fe0a6`;
- contraste contra o palco do vídeo: **9,46:1**, contra 3:1 exigidos;
- `outline-offset` de 2 px mais 2,67 px de largura cabem na folga de 7 px entre os
  botões de velocidade, então o anel de um não toca o vizinho aceso.

Auditoria estendida a toda a aplicação no mesmo movimento: **316 elementos
interativos, 11 rotas, 2 temas, zero falhas de contraste de foco.**

Duas armadilhas de medição apareceram e estão registradas na skill
`auditoria-acessibilidade`. A segunda é nova: **o contorno fica fora do elemento**,
então o fundo que importa é o do pai. Medir contra o fundo do próprio elemento
produziu 128 falhas inexistentes, todas com o mesmo valor de 1,24. Muitas falhas com
número idêntico é sinal de medição errada, não de interface errada.

---

## Frente G. Ferramentas de autoria

### G1. Regenerar uma peça só ✅ (legenda) · 🟨 (narração e montagem)

**Por quê.** Hoje mexer no gerador implica reprocessar o acervo. Isso torna cada
melhoria de vídeo cara e desencoraja iteração.

**O que fazer.** Garantir que `build_lesson_videos.py` aceite alvo único e que legenda,
narração e montagem sejam passos separáveis, para regerar legenda sem recodificar vídeo.

**Pronto quando.** Trocar a legenda de uma seção leva segundos, não minutos.

**Feito em 31/07/2026, para a legenda.** `tools/refazer_legendas.py` recorta o
acervo inteiro sem sintetizar nem recodificar nada, porque o tempo nas VTT já está
certo: ele vem da duração real de cada WAV medida na geração. Só a segmentação
estava errada. Os 159 arquivos são reescritos em segundos, contra horas de
recodificação. Tem `--conferir` para relatar sem gravar, e aceita IDs específicos.

Narração e montagem continuam acopladas: mudar prosódia ainda exige recodificar.
Separar isso é o que falta para fechar a etapa.

### G2. Conferência de link normativo ⬜

**O que fazer.** Ferramenta que percorre `officialSources.js`, testa cada URL e relata
quebrados, redirecionados e sem mapeamento. Roda sob demanda, não no `npm test`, para
não tornar o portão dependente de rede.

### G3. Autoria de caso ⬜

**O que fazer.** Script que recebe um caso em formato simples e gera a entrada
completa com rubrica, validando contra `check-rubricas` antes de gravar. Hoje criar
caso é editar um arquivo de 70 kB à mão.

---

## Ordem sugerida de execução

| Ordem | Etapa | Por que aqui |
|---|---|---|
| 1 | **A1** orçamento | Bloqueia todo o resto. Sem folga, nenhuma etapa nova entra no build. |
| 2 | **B1** legenda | Defeito medido, atinge 88% dos blocos, esforço pequeno, ganho imediato para todo mundo. |
| 3 | **G1** regerar peça só | Barato e faz B2, B3 e C2 custarem uma fração do que custariam. |
| 4 | **C1** tema nos SVG | Correção de defeito visível, esforço pequeno. |
| 5 | **B2** prosódia | Depende de G1 para iterar barato. |
| 6 | **E1** escada de níveis | Reorganiza o que já existe, sem produzir material novo. |
| 7 | **F1** caminho de entrada | Muda a primeira impressão, que é o que decide se a pessoa volta. |
| 8 | **C2** animar processo | Maior ganho de percepção de qualidade, esforço médio. |
| 9 | **D1** nove elementos | O maior de todos em volume. Faça depois que as ferramentas estiverem prontas. |
| 10 | **B3** composição de vídeo | Só depois que legenda, prosódia e esquemas animados estiverem estáveis. |
| resto | A2, D2, D3, E2, E3, F2, F3, G2, G3 | Conforme a folga permitir. |

## O que este plano deliberadamente não propõe

- **Trocar de stack ou adicionar backend.** O desenho local-first é uma decisão, não
  uma limitação a corrigir.
- **Aumentar resolução dos vídeos.** O acervo já pesa 159 MB. Ganho de qualidade vem
  de composição, não de pixel.
- **Mexer em `prefers-reduced-motion`.** Já está coberto globalmente.
- **Refazer o CI ou os portões.** Estão bons. Só ganham verificações novas onde
  este plano cria classe de erro nova.
- **Certificação ou avaliação automática de competência.** Nível de especialista exige
  pessoa competente avaliando. Não simular isso.
