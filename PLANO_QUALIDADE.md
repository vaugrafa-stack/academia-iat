# Plano de qualidade da Academia IAT

Plano de execução por etapas para vídeo, animação, layout, conteúdo, aprendizagem
e ferramentas. Complementa `PLANO_EVOLUCAO.md`, que cuida de governança, proveniência
e alegações institucionais. Este aqui cuida da **experiência e da qualidade do
material**, e cada item nasce de um número medido, não de impressão.

Medições feitas em 31/07/2026 sobre o commit `cbf8c3f`.

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

### A1. Índice leve na frente, corpo pesado sob demanda ⬜

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

### B1. Reescrever o gerador de legenda ⬜

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

**Nota.** Regenerar a legenda não exige regerar o vídeo, se a legenda for um passo
separado. Se hoje ela sai acoplada à montagem, separar primeiro: economiza horas de
codificação em toda iteração futura.

### B2. Prosódia da narração ⬜

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

### C1. Esquemas SVG passam a seguir o tema ⬜

**Por quê.** `hydro.jsx` tem zero ocorrências de `currentColor` ou `var(--)`: toda cor
é literal (`fill="#0a4a38"`, `fill="#2fa07a"`, `fill="#7f918a"`). Os esquemas foram
escurecidos por script quando o tema escuro entrou, e hoje eles não acompanham a troca
de tema. No tema claro, o desenho continua com a paleta do escuro.

**O que fazer.** Trocar as cores literais por variáveis CSS com significado
(`--agua`, `--concreto`, `--rocha`, `--turbina`, `--terreno`), definidas nos dois
temas. Traço com `currentColor` onde couber. Conferir contraste de elemento gráfico
(mínimo 3:1) nos dois temas.

**Como verificar.** Abrir a área Hidrelétricas nos dois temas e comparar. Medir
contraste de traço contra fundo em cada esquema.

**Pronto quando.** Nenhuma cor literal nos SVG de conteúdo, e contraste conferido nos
dois temas.

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

### E1. Escada de níveis explícita nos casos ⬜

**Por quê.** Só 5 dos 26 casos declaram nível, e a escala é improvisada
(`Primeiro contato`, `Aplicação`, `Avançado`, `Especialista`). Sem escada, a pessoa
não sabe onde está nem o que vem depois.

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

### F3. Foco no reprodutor de vídeo ⬜

**Por quê.** `videoLearningStage.css` não tem nenhuma regra de `:focus` ou
`:focus-visible`, enquanto as outras quatro folhas têm. Pode ser herança de regra
global, pode ser lacuna.

**O que fazer.** Confirmar no navegador percorrendo os controles do reprodutor só com
Tab. Se o foco não estiver visível, criar a regra com contorno de 2 px e contraste
mínimo de 3:1. Não inferir por estilo computado: `getComputedStyle` não lê
`:focus-visible`.

---

## Frente G. Ferramentas de autoria

### G1. Regenerar uma peça só ⬜

**Por quê.** Hoje mexer no gerador implica reprocessar o acervo. Isso torna cada
melhoria de vídeo cara e desencoraja iteração.

**O que fazer.** Garantir que `build_lesson_videos.py` aceite alvo único e que legenda,
narração e montagem sejam passos separáveis, para regerar legenda sem recodificar vídeo.

**Pronto quando.** Trocar a legenda de uma seção leva segundos, não minutos.

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
