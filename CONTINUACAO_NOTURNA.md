# Continuação noturna — 4 para 5 de agosto de 2026

Checkpoint durável desta frente de trabalho. Quem retoma lê este arquivo, faz o
próximo passo e **atualiza este arquivo antes de começar o passo seguinte**.

## Frente ativa

Área Técnica Restrita da Academia IAT: autenticação real, backend próprio,
recebimento controlado de documento de processo e análise assistida com citação
por arquivo e página.

Decisão do usuário, já tomada e não reaberta: **provedor de identidade +
backend próprio**, sistema completo, feito do zero. A plataforma pode exigir
conexão. Peso de download deixou de ser critério de recusa.

## Estado em 4 de agosto, 23h

- Repositório `apps/iat_training`, branch `master`, sincronizado com origin em
  `16b55f0`. Árvore limpa.
- `src/areaRestrita.js` e `src/areaRestrita.test.js` existem no disco mas
  **nunca foram versionados**. O resumo da senha nunca chegou ao repositório
  público. Isso é bom: permite descartar a trava de navegador em vez de ter que
  limpar histórico.
- `apps/iat_area_tecnica/` iniciado: `package.json` e `src/config.js` escritos,
  `src/config.js` ainda sem teste.
- Workflow de desenho `wf_8bff1c83-3c9` rodando: cinco perspectivas
  independentes com crítico adversarial por perspectiva.

## Próximo passo

1. Rodar o crítico de segurança que faltou e a síntese da sequência executável.
2. Executar a sequência, bloco a bloco, atualizando este arquivo a cada bloco.

## Frente paralela: objetivo observável (Fase 3.2)

Medido: **167 seções, só 11 objetivos distintos**. Um texto se repete 41 vezes,
porque `src/learningDesign.js` gera o objetivo por perfil de palavra-chave.

Fontes de fundamentação já medidas no `pop-public-content.json`:

| Fonte | Seções | O que vira objetivo |
|---|---:|---|
| Quadro próprio | 66 | reconstruir as colunas a partir da primeira |
| Ação de análise (verbo de lista controlada após "deve") | ~60 | a própria ação |
| Frase de exigência citável | ~37 | citação literal + onde verificar |
| Sem texto próprio | ~4 | seção de navegação, não recebe objetivo |

Decisões de método já tomadas nessa frente:
- Citar o texto do POP entre aspas resolve concordância de gênero e número sem
  risco de inventar. Cabeçalho de coluna entra literal, entre aspas.
- Verbo em voz passiva ("deve ser feita") não é ação de quem aprende. Só entra
  verbo de lista controlada de ações de análise.
- O separador de frases não pode cortar em "nº 9.541": proteger ponto entre
  dígitos antes de dividir.

Arquivo a criar: `src/objetivoObservavel.js` + teste. Depois trocar o uso em
`main.jsx:1485` e `main.jsx:2080`.

## O que fica FORA do repositório público

Movido para `OneDrive\Documentos\New project\area_tecnica_privado\`:

- `PLANO_AREA_TECNICA.md`. É o desenho de segurança de um sistema que ainda não
  existe. Não tem chave nem senha, mas entrega o mapa inteiro, e o próprio
  desenho decidiu que o repositório público não chega perto do que toca dado
  real. Publicá-lo contrariaria a decisão que ele mesmo tomou.
- `areaRestrita.js` e `areaRestrita.test.js`. Trava de navegador, escrita antes
  de o usuário escolher o backend próprio. Está superada: conferir credencial
  no navegador de quem acessa não é controle de acesso. Guardada, não apagada,
  porque a tela de entrada aproveita.

## Regras que não mudam

- `npm test` verde antes de qualquer commit. São **21 portões**.
- **Depois de publicar, conferir `gh run list`.** Passar no `npm test` não é a
  mesma coisa que passar no CI, e publicar sem olhar é publicar no escuro.
- Publicar com `git push origin HEAD:master`. `git push origin master` empurra
  o branch errado quando o checkout está num `codex/*`.
- Nada de dado pessoal, sensível ou identificável no material público.
- Nada inventado. Toda afirmação normativa precisa de fonte verificável.
- Sem travessão em texto autoral.
- O foco é hidrelétricas.

## Registro dos blocos fechados

### Bloco 1. Desenho da Área Técnica, com crítica adversarial

`PLANO_AREA_TECNICA.md`, 205 kB. Cinco dimensões, 40 decisões, cada uma julgada
por um crítico instruído a derrubá-la.

| Veredicto | Decisões |
|---|---:|
| risco não tratado | 15 |
| custo subestimado | 8 |
| complexidade desnecessária | 5 |
| sólida | 4 |

O crítico de segurança morreu no limite de sessão e ficou faltando; foi
relançado junto com a síntese executável.

A decisão estruturante que saiu do desenho: a área restrita **não** pode morar
no mesmo pacote do GitHub Pages. Vira segundo build, servido pelo próprio
backend em origem própria, com sessão em cookie opaco. Isso torna impossível,
por regra de navegador e não por disciplina de código, que o service worker da
PWA pública alcance documento real.

### Bloco 2. Objetivo observável nas 159 aulas ✅

`src/objetivoObservavel.js` + 24 testes. **11 objetivos distintos viraram 149**,
nenhum repetido, derivados do próprio POP em três origens: 64 seções pelo
quadro, 59 pela ação de análise nomeada, 26 pela exigência citada. As 18
restantes, quase todas de navegação, seguem com o perfil antigo.

Cada aula ganhou também o **como se vê**, que é a parte observável e não
existia: para o quadro, reconstruir as colunas a partir da primeira; para as
demais, localizar nos autos onde a regra foi atendida e onde não foi.

Três defeitos encontrados e corrigidos no caminho, todos registrados em
comentário no arquivo:
1. o separador de frases quebrava em "O art. 13", produzindo citação que começa
   no meio e remete a artigo nenhum;
2. a captura da ação parava no teto de 150 caracteres e deixava cauda solta
   ("e se a", "sem substituir a competência do");
3. o verificador de cauda acusava 8 objetivos perfeitos, porque `\b` em
   JavaScript trata "ã" como não-letra e `/\bo\.$/` casa dentro de "transição.".

Estado: 333 testes em 43 arquivos, 19 portões verdes, zero classe CSS órfã.
Publicado em `148ed50`.

### Bloco 3. Crítica de segurança e sequência executável ✅

`area_tecnica_privado/SEQUENCIA_AREA_TECNICA.md`. O crítico de segurança que
faltava rodou e derrubou coisa séria:

- **Erro de correção, não de opinião.** `response_mode=form_post` faz o provedor
  devolver o código por POST entre sites, e cookie `SameSite=Lax` não é enviado
  em POST entre sites. O cookie de `state` e `nonce` nunca chegaria ao callback:
  o login falharia em 100% das tentativas, ou alguém "resolveria" afrouxando o
  `state`. As duas metades da decisão eram incompatíveis como escritas.
- **Contradição interna.** Uma decisão guardava refresh token cifrado; outra não
  pedia `offline_access`, sem o qual o provedor não emite refresh token nenhum.
  A coluna guardaria algo que não existe.
- **Três bancos diferentes em três dimensões.** Postgres na segurança, SQLite na
  arquitetura, e um terceiro na trilha.
- **Segredo de cliente vence em 24 meses** e quem reemite é a TI central. Todo
  mundo perde o login de uma vez, sem aviso, e a resposta demora semanas.

Resultado: 12 blocos em ordem, 6 executáveis em modo econômico, 8 decisões
derrubadas com o que fica no lugar, e 5 perguntas que dependem do usuário.

Marcos separados de propósito: o bloco 10 fecha **sistema construído**, com
corpus ainda sintético; o bloco 11 é o portão de governança que destrava o
**primeiro documento real**, restrito a processos já concluídos.

### Bloco 4. `Lesson` sai de `main.jsx` (Fase 4.1) ✅

`src/licao.jsx`, 1.568 linhas, e `src/sourceAssurance.jsx`, 60. `main.jsx` cai
de 130 kB para 79 kB, de 84% para **51%** do teto contratado.

Fronteira pelo contrato `dados`, mesmo idioma de `biblioteca.jsx` e
`perfil.jsx`. Dos quinze componentes movidos, onze não precisavam de nada além
das próprias propriedades; só quatro recebem dado derivado, cada um só o que usa.

Dois defeitos que só o smoke test e o navegador pegariam:
1. Medi o que o bloco precisa de fora, mas não o que fora precisa do bloco:
   `Dashboard` usava `VideoDataLoading`, que foi junto. Agora é exportado, e não
   duplicado, porque as duas telas devem esperar com a mesma cara.
2. `ShieldCheck` ficou fora dos imports novos. Um verificador que compara tags
   usadas contra símbolos importados achou os dois em uma passada.

Cinco contratos apontavam para dentro do bloco e foram **repontados, não
afrouxados**. Um deles ganhou guarda: `indexOf` que não acha devolve -1, e
`slice(-1, ...)` ainda produz string, então a ordem passaria a ser conferida em
texto errado e o contrato viraria decoração.

Estado: 326 testes em 42 arquivos, 19 portões verdes, zero classe CSS órfã.
Publicado em `7cc5749`.

### Bloco 5. Portão contra credencial e documento no repo público ✅

`tools/check-segredos.mjs`, vigésimo portão do `npm test`. Este repositório já
falhou nas duas coisas que ele agora barra: `caebefb` removeu um CSV com
contatos de 700 empreendimentos e `83bb215` removeu uma senha escrita no código.
Remover depois não desfaz.

Tem autoteste em toda execução: cinco armadilhas que precisa acusar e quatro
textos parecidos que não pode acusar, entre eles a frase didática que fala em
senha e o SHA-256 de proveniência do POP. Portão que nunca reprovou é
indistinguível de portão quebrado.

Verificado plantando de verdade: com um `.pdf` e um arquivo de senha no índice
sai com código 1 apontando arquivo e linha; removidos, volta a passar.

Publicado em `2ff9705`.

### Bloco 6. Demolição e chamado de provisionamento ✅

O esqueleto Node de `apps/iat_area_tecnica` saiu do disco, para
`area_tecnica_privado/descartado/` com um `LEIA.md` explicando por quê: o
`config.js` implementava o modelo cross-origin com token no navegador que o
desenho rejeitou, e `PAPEL_EXIGIDO` com padrão vazio significa "basta o token
ser válido", ou seja, qualquer conta do tenant estadual lendo processo. O perigo
não era o arquivo parado, era alguém escrever um `servidor.js` em cima dele.

`area_tecnica_privado/CHAMADO_PROVISIONAMENTO.md` está pronto para protocolo.
Sete itens que tramitam em paralelo, com as justificativas que a TI costuma
pedir já escritas. É o caminho crítico: o registro de aplicativo leva de duas a
oito semanas e não acelera com esforço próprio.

### Bloco 7. Auditoria do que eu mesmo publiquei ✅

Publiquei o objetivo observável tendo lido só uma das três origens. Lendo as
159 uma por uma apareceram quatro defeitos, todos visíveis na tela:

1. **Palavra cortada ao meio** em onze aulas. "condicionantes anteri",
   "análise conjunta ou separad", "bases ge". Causa: teto de 150 caracteres
   dentro da expressão de captura, que parava onde quer que o caractere caísse.
2. **Erro a evitar apresentado como exigência.** A seção 24.1 dizia "Aplicar o
   que o POP fixa aqui: condicionante que tenta sanar pendência crítica que
   deveria ser resolvida antes do deferimento". Isso é item de lista de
   armadilhas: a plataforma mandava fazer o que o POP manda evitar. Casou porque
   "deveria" contém "deve".
3. **Concordância de gênero**, em vinte aulas: "do Tabela 1 sem consultá-lo".
4. **Promessa que ninguém cumpre:** "percorrer as 102 linhas do Quadro 46 sem
   consultá-lo", que é o glossário de siglas.

Causa comum do 2 com dois erros meus anteriores: **`\b` não separa palavra em
português**. Está registrado em memória, com o que usar no lugar.

Publicado em `24c92c8` e `24a6933`. 332 testes, 20 portões.

**Lição de método:** auditar uma amostra de um tier e publicar os três. A leitura
completa custou pouco e achou quatro defeitos, um deles com efeito sobre decisão
administrativa.

### Bloco 8. Erro recorrente: termo repetido gastava vaga ✅

Auditando o outro conteúdo derivado, com o mesmo método do bloco 7. Seis termos
aparecem nos dois quadros de erro do POP (Memorial Descritivo, PCA, RAS, RDPA,
PBA e PACUERA), dizendo a mesma coisa por dois ângulos. Em **21 das 82 aulas**
os dois entravam como verbetes separados e gastavam duas das três vagas.

Agora dividem o mesmo verbete, o erro no corpo e o limite como complemento.
Nenhum texto se perde e sobra vaga para outro termo. 180 vínculos viraram 168.

A escolha de qual é o erro e qual é o limite vem do **rótulo da coluna**, não da
ordem de leitura das tabelas. Um teste inverte a entrada para provar.

O módulo **não tinha teste nenhum** e ligava conteúdo a 82 aulas. São 17 agora,
com quatro contratos sobre o POP real.

Publicado em `c6204ef`. 349 testes em 43 arquivos, 20 portões.

### Bloco 9. "Como ler este quadro": dez colunas sem explicação ✅

Dos 25 quadros com leitura guiada, dez colunas chegavam à tela só com o nome:
"Componente", "Bloco", "Grupo" e "Fonte ou evidência". A tela já degradava com
honestidade, então não era defeito visível, mas era lacuna barata. O módulo
também não tinha teste: são 12 agora. Publicado em `b597a4d`.

### Bloco 10. Resumos de norma auditados contra a fonte ✅

As 60 referências normativas têm resumo, nenhuma em branco, e as citações de
artigo que conferi têm lastro no POP. Uma melhora conferida na **fonte
primária**: o resumo da Portaria nº 069/2015 dizia só que ela era "referida no
art. 50 da IN IAT nº 09/2025". Abrindo o PDF oficial, o art. 50 manda a APP do
entorno do reservatório seguir o **cálculo** dessa Portaria, com relatório e
shapefile na LP ou LAS. O resumo agora diz isso.

Teste novo, o que mais importa neste domínio: **nenhum número de artigo afirmado
sem lastro no POP**. A primeira versão dele era inútil e eu quase publiquei,
porque passava só por existir "art. N" em qualquer lugar. Publicado em `0cb910b`.

### Bloco 11. Dois objetivos diferentes na mesma tela ✅

Regressão minha, de ontem. O parágrafo de abertura de `LessonOverview` sempre
repetiu `design.objective`. Enquanto o cabeçalho mostrava o mesmo texto, era
duplicação inofensiva; quando o cabeçalho passou a usar o objetivo derivado do
POP, virou **contradição em 149 aulas**.

O parágrafo não volta a mostrar objetivo. Sobram os dois casos em que ele diz
algo que o cabeçalho não diz. Contrato novo impede a volta: `design.objective`
não pode aparecer em `licao.jsx` fora da função de reserva.

Publicado em `04ec28e`. 368 testes em 45 arquivos, 20 portões.

### Bloco 12. O CI estava vermelho e eu não vi ✅

Fui conferir a publicação e o CI reprovava em **todos** os commits da noite, e
também no commit anterior a eu começar. Duas causas.

1. **Marcador de build sumiu de todas as telas.** `data-build-sha` migrou para o
   painel do Suporte em 04/08 e deixou de existir em qualquer rota que não passe
   por lá. O teste de artefato procura em cada página e não achava em nenhuma.
   Falha anterior a esta noite. O marcador voltou para a **casca** da aplicação:
   requisito de rastreabilidade que só vale numa tela não é requisito.
2. **As armadilhas do meu próprio portão pareciam segredo.** O autoteste do
   `check-segredos.mjs` precisa de exemplos acusáveis, e eu os escrevi por
   extenso. O `audit:premium` marcou o arquivo. Agora são montadas em pedaços em
   tempo de execução.

**A causa de eu não ter visto:** `npm test` não era todos os portões.
`audit:premium` só rodava no CI. Disse "20 portões verdes" a noite inteira
confiando num comando que não cobria o conjunto. Agora ele está no `npm test`,
que passa a ter **21**.

CI verde em `5b2ba3d`, artefato publicado, e conferido no site: build no ar,
objetivos novos, `como se vê` presente, `lead` removido.

**Regra nova, e vale para toda sessão:** depois de publicar, conferir
`gh run list`. Passar no `npm test` não é a mesma coisa que passar no CI, e
publicar sem olhar é publicar no escuro.

### Bloco 13. Explicações das folhas-resposta: conteúdo íntegro, proteção ausente ✅

Auditadas as 130 explicações dos 26 casos do Laboratório. **Nenhum defeito de
conteúdo**: 130 distintas, nenhuma repetida, nenhuma curta demais, e as 130
concordam com o gabarito da pergunta correspondente. Foi o primeiro dos módulos
auditados que já estava certo.

O que faltava era proteção. O validador de runtime só conferia contagem e
formato; **nada conferia o alinhamento com o gabarito**. Uma explicação que
começa em "Sim." numa pergunta cujo gabarito é "nao" devolveria à pessoa a
decisão certa e a justificativa da decisão contrária, no mesmo lugar da tela.

10 testes novos, incluindo essa invariante, provada acusando: invertendo uma
explicação de propósito, o teste aponta `cp#0`.

Registro de método: meu primeiro heurístico acusou 12 contradições, e as 12
eram falsas. "Sim, porque não..." é português normal. Ler o achado antes de
tratá-lo como defeito evitou reescrever texto correto.

379 testes em 46 arquivos, 21 portões.

### Bloco 14. Bug latente que apagaria a resposta certa ✅

`assessmentDesign.js` espalha a posição da resposta certa dentro de cada módulo,
para a pessoa não aprender a marcar por posição. A contagem por posição era um
`[0, 0, 0, 0]` **fixo**, o que amarrava a correção do exercício a um número
mágico.

Numa questão com cinco alternativas: `counts[4]` é `undefined`, o mínimo vira
`NaN`, nenhuma posição empata com ele, e a troca acontece contra `undefined`. O
efeito não é erro visível. A alternativa **correta é apagada da lista**, vira
`null`, e `answer` fica `undefined`. A pessoa receberia uma questão sem resposta
certa possível e erraria fizesse o que fizesse.

Reproduzido antes de corrigir. Hoje nenhuma das 213 questões passa de quatro
alternativas, então o defeito nasceria calado da primeira que passasse.

A contagem passou a ser esparsa. Conferido de 2 a 8 alternativas, sem corrupção,
e a distribuição no banco real segue equilibrada: 68 / 68 / 72 / 5, sendo a
última posição só das 9 questões que têm quatro alternativas.

381 testes em 46 arquivos, 21 portões.

### Bloco 15. Regra do Laboratório sai da tela (Fase 4.2) ✅

`src/laboratorioLogica.js`, 411 linhas sem uma linha de JSX nem um hook:
catálogo, filtro, rascunho, conferência de elementos, indicadores, ajuda
progressiva e proveniência da decisão. `laboratorio.jsx` cai de **1.775 para
1.388 linhas**, de 66 kB para 53 kB.

O ganho não é estético. **Trinta testes já exercitavam essas funções** e, para
isso, carregavam a tela inteira, com React, ícones e folha de estilo. Agora
carregam um módulo que só depende de `tracks`, `nivelDoCaso` e `getLabSources`.

O contrato que impede a volta não é o tamanho, é a **ausência de React** no
módulo de regra.

Um erro de método que se repetiu: montei a lista de símbolos a importar na mão e
esqueci um. O que resolveu foi derivar a lista do arquivo, e não da memória.

Conferido no navegador: catálogo com os 26 casos, filtros, caso abre, pergunta
responde, ajuda progressiva presente, console limpo.

382 testes em 46 arquivos, 21 portões.

### Bloco 16. Extratores colhidos do `iat_doc_analyzer` ✅

Parte do bloco 1 da sequência da Área Técnica que **não depende de você**. O
`find_candidates` do app Streamlit tem 19 padrões que funcionam e são a lista do
que um analista procura ao abrir um processo. O app não sobrevive; os padrões
sim.

Colhidos **com auditoria, não por cópia**. Três defeitos do original corrigidos:

1. Nome de empreendimento engolia a frase: "A CGH Santa Clara fica no rio"
   virava o nome inteiro, e "A PCH tem 18 ha" virava um empreendimento chamado
   "tem 18 ha".
2. "A LO vencida" virava licença de número "vencida", porque a classe do número
   aceitava letra.
3. Um `IGNORECASE` único para os 19, sendo que alguns dependem de caixa. Com
   ele, "art. 50", que é remissão a dispositivo, virava ART de responsável.

Corrigindo o primeiro eu quebrei um quarto caso, e o teste pegou: "Rio das
Antas" sumia, porque o conectivo abre o nome.

Onde ficou: `apps/iat_area_tecnica/`, **repositório local sem remoto**. Descobri
no caminho que aquele diretório não estava sob controle de versão nenhum, e o
`.git` da pasta pai não é repositório válido. O código que toca dado real vai
para repositório privado quando ele existir; até lá o histórico fica no disco.

27 testes em pytest, sobre exemplos sintéticos. Nenhum vem de processo real: são
frases montadas com a **forma** dos dados, não com os dados.

### Bloco 17. A máscara da boca cortava o queixo (Fase 2.1, parte dela) ✅

Investigando os olhos parados do professor, achei outro defeito, esse com
consequência maior e corrigível sem arte nova.

Medindo a diferença entre o quadro de boca aberta e o de repouso, na coluna
central do rosto, aparecem **dois picos** de movimento:

| Faixa da altura do quadro | O que se mexe | Pico no E_OPEN |
|---|---|---:|
| 54% a 62% | lábios | 60,2 |
| 64% a 72% | **mandíbula descendo** | **69,2** |

A máscara do CSS ia de 46,5% a 63,5%: pegava o primeiro pico e **cortava o
segundo inteiro**, sendo que o segundo é o mais forte. Na tela, a boca abria
dentro de um queixo parado, herdado do quadro de repouso. É isso que lê como
boca colada, e casa com a queixa registrada: "a boca mexendo de maneira mal
feita".

A elipse passou de `19% 8.5% at 50% 55%` para `19% 13% at 50% 60%`, cobrindo de
47% a 73%, que é onde o movimento real acaba. Na horizontal 19% já bastava: a
diferença cai à linha de base antes de 71%, medido.

Uma linha de CSS. Sem ativo novo, sem manifesto, sem risco.

**Duas coisas que eu errei no caminho e valem registro.**

1. Medi que 68% a 85% da diferença entre os doze quadros do sprite acontece
   fora da boca, concluí que o rosto tremia e gerei um sprite estabilizado, com
   gerador, manifesto e tudo. **Era redundante:** o componente já compõe apenas
   a boca sobre uma base fixa, então o tremor nunca chegava à tela. Medi o
   artefato em vez de medir o que a pessoa vê. Revertido inteiro.
2. O que sobrou dessa investida foi útil: perguntar se a máscara era grande o
   bastante levou ao defeito de verdade.

**Observação que não é defeito, mas você deve saber.** O professor renderiza
entre 88 e 210 pixels, conforme a largura do palco, porque o trilho é limitado a
188px. Nesse tamanho, a mandíbula percorre de 6 a 15 pixels. O aparato de
sincronia labial (12 quadros, 88.739 entradas de visema em 159 aulas) governa um
rosto do tamanho de uma miniatura. Se o professor importa, ele provavelmente
precisa aparecer maior; se não, o esforço de fidelidade labial está
desproporcional ao que se vê. É decisão sua, e não mexi nisso.

**Os olhos continuam parados.** Não há quadro de olho fechado, e desenhar
pálpebra sobre fotografia produz exatamente o artifício que se quer evitar.
Piscar continua dependendo de arte nova.

## Estado final da noite, verificado

Conferido no `gh-pages`, direto no artefato publicado e sem cache no meio. O
deploy é `b648dd3`, o último commit, e o pacote contém tudo o que a noite
produziu: `objetivo-como-se-ve`, `data-build-sha`, os objetivos de quadro, o
"Limite do documento" do erro recorrente e o objetivo das tabelas grandes.

CI verde nas quatro últimas execuções. Nada novo do Codex no origin.

**O cron horário foi desligado aqui.** Não porque o trabalho acabou por
cansaço, mas porque acabou o que não depende do usuário: o `PLANO_SEQUENCIAL.md`
está fechado exceto a 2.1, que precisa de arte, e a Área Técnica está parada em
cinco perguntas. Continuar disparando de hora em hora empurraria para inventar
mudança numa plataforma verde e publicada, e isso é pior do que parar. Basta o
usuário pedir para religar.

## Frente de design, 07/08

### Bloco 17. Paleta, valor codificado e carimbo ✅ `f7aeac2`

Estava `#151f1b` com `#2fd39a`: preto-quase com verde-ácido, o segundo
lugar-comum da geração atual. A direção nova vem dos instrumentos do domínio,
não de referência de painel.

- **Paleta de carta hidrográfica.** 56 substituições, com as onze relações de
  contraste medidas nos dois temas antes de aplicar. Zero reprovação.
- **O número é o argumento.** Algarismo tabular e face técnica para potência,
  vazão, coordenada, artigo, protocolo e hash. Mono do sistema, zero byte.
- **O bloco de fonte virou carimbo de prancha.** Canto vivo, régua entre
  células, campo longo ocupando a linha inteira.

### Bloco 18. Dois comentários de CSS abertos ✅ mesmo commit

Achado ao medir por que o carimbo renderizava em 16px. **72 linhas mortas**: o
piso de 12px de texto (os textos que ele protege estavam em 10 e 11) e a trava
de rolagem do menu móvel. Um segundo, na linha 1, com origem em mim: ao remover
o selo da barra lateral em 04/08, o corte atravessou a fronteira do comentário.

O que mais importa: **`check-css-morto` aprovava por causa disso.** Classe
comentada por acidente não conta como declarada, então o portão que existe para
achar CSS morto premiou escondê-lo num comentário.

Virou o portão 22, `check-css-comentario`. A primeira versão dele **não pegou o
defeito quando plantei de propósito**, porque eu olhava tamanho do comentário,
que é acaso. O sinal certo é regra dentro de comentário.

### Bloco 19. Objetivo cresce e afina ✅ `fdcca79`

Medido: 106 usos de peso 800 contra 2 de peso 200. A plataforma mora na ponta
pesada, então nada se destaca. O objetivo passou a 15px peso 350, contraste
11,25:1, em vez de 13px cinza.

#### Bloco 20. Piso de leitura ✅ `aea98b6`

Medido: **130 regras em 11px ou menos**, 13 em 9px e 40 em 10px. Não eram só
rótulos: estavam em 10px a revisão de resposta do laboratório, o texto da
transcrição, a lista de evidências e a citação da fonte.

A causa foi método, não descuido. A plataforma tinha **uma só ferramenta para
fazer texto recuar**: encolher e acinzentar. Das 228 declarações de peso, 3
estavam na faixa leve, então a metade clara de uma variável de 200 a 800 nunca
entrou, e sobrava diminuir.

57 regras elevadas. Junto saiu um defeito antigo: **a marca não cabia na própria
caixa**, 168px numa coluna de 163px, achado ao medir transbordo. Agora a caixa
manda no tamanho, por consulta de container. Errei o fator duas vezes porque
`cqi` conta a caixa de conteúdo, 163px, e não os 197px externos.

Portão 23, `check-tipografia`. Ele achou o que minha medição não viu: quatro
regras em 10,5px, que meu regex de inteiros deixou passar.

### Bloco 21. O Início abre com o trabalho, não com slogan ✅ `9058c66`

O topo era "Aprenda o procedimento. Pratique a decisão." em 39px, mais um
parágrafo de apresentação: 151px que empurravam o cartão de continuidade para
335px do topo. Numa tela de escritório a primeira dobra acaba por volta de
600px, então a pessoa via uma frase e o topo de um cartão.

Manchete de marketing é medida emprestada de outro tipo de site. O título agora
diz o que a tela faz, em 27px. **86px devolvidos à primeira dobra**, e a página
encolheu de 1286px para 1197px.

## Frente de conta, 09/08

### Bloco 22. A conta opcional vira tela que funciona ✅ `dd77539` + `3265f64`

O modulo cliente existia e ninguem usava. Agora a Academia tem, de ponta a
ponta: entrar, criar conta, recuperar acesso, sincronizar, resolver conflito e
gravar sozinha ao fechar um bloco de estudo.

Onde mora: `src/contaRemota.js` (conversa e decisao), `src/sincroniaLocal.js`
(carimbo da revisao, por conta), `src/sincroniaAutomatica.js` (gravacao no alto
da aplicacao) e `src/ContaRemotaCard.jsx` (a tela, dentro do "Meu progresso").

**A gravacao automatica NAO mora no cartao.** O cartao so existe na tela do
perfil, e estudar acontece nas outras. Se morasse la, nunca veria o momento em
que a pessoa termina alguma coisa.

**A conta e decisao de BUILD.** `IAT_CONTA_REMOTA=1` no `vite`. Sem isso nem a
sondagem acontece. Descoberto pelo portao de e2e, que reprovou com `4 erros de
runtime`: sondar `/api/saude` na versao estatica e um 404 por carga.

**Provado rodando, sem Docker.** `uvicorn` servindo o `dist` em
`http://localhost:8080`: conta criada e local subiu; armazenamento limpo e o
guardado desceu; os dois lados divergentes e a tela perguntou; favorito marcado
na tela da aula subiu sozinho. O script esta no bloco de notas da sessao.

### Bloco 23. Dois portoes vermelhos publicados sem eu ver ✅ `05df57d`

`audit:premium` acusava e-mail de teste, `check-segredos` acusava a senha
atribuida a literal. **As duas acusacoes estavam certas.** A politica de e-mail
passou a aceitar os dominios que a RFC 2606 RESERVA, por igualdade e nao por
sufixo (`example.com.br` existe de verdade), e ganhou teste proprio, provado por
mutacao. A senha do teste virou constante montada em tempo de execucao.

**Regra nova, que custou a publicacao errada:** nunca passar `npm test` por um
`grep`. O `grep` engole o codigo de saida, e eu li "401 testes passaram" num
comando que tinha saido com 1.

### Bloco 24. CI vermelho por ruido de dependencia ✅ mesmo commit

`pnpm audit` reprovava por nanoid < 3.3.17, via vite > postcss, e os testes nem
chegavam a rodar. Override em `pnpm-workspace.yaml`, preso na linha 3: pedir so
`>=3.3.17` resolveu para 6.0.1, que e outra API e so ESM. Mesmo erro que o
undici ja tinha ensinado, e que estava escrito no arquivo ao lado.

**Regra nova:** rodar o e2e local exige `PAGES_REPO=academia-iat` TAMBEM no
`vite preview`. Sem isso o preview serve na base `/` e o e2e acusa a aplicacao
por culpa do harness. Perdi uma rodada nisso.

### Bloco 25. A conta ganhou remoto privado, e a varredura que veio antes ✅

`vaugrafa-stack/iat-contas` e `vaugrafa-stack/iat-area-tecnica`, os dois
PRIVADOS, conferidos com 404 para quem nao esta logado. Antes disso, varredura da
arvore E do historico completo nos dois: 19 ocorrencias brutas, 18 descartadas na
leitura do contexto, 1 corrigida (fixture de IP em faixa alocada de verdade, hoje
na faixa reservada da RFC 5737).

**Um workflow multiagente disparado para isso voltou com `liberadoParaEmpurrar:
true` e zero achados, e era MENTIRA:** os cinco agentes morreram no limite de uso
e nenhum abriu um arquivo. Resultado vazio por falha e indistinguivel de
resultado vazio por limpeza, se voce olhar so o numero. Refiz com script
deterministico, que para procurar segredo serve melhor de qualquer jeito.

### Bloco 26. Login da Area Tecnica provado em navegador, sem Docker ✅

`desenvolvimento/provedor_local.py`: provedor OIDC falso que CONFERE segredo,
`redirect_uri` por igualdade exata e PKCE S256. So sobe com variavel explicita,
escuta so em 127.0.0.1, chave RSA em memoria.

Provado: state, nonce, S256, troca do codigo, `oid`/`tid` virando identidade,
cookie invisivel para script, entrar NAO habilita ninguem, callback forjado nao
derruba quem esta dentro, e nenhum token no banco (conferido nos BYTES).

Promocao e revogacao tambem: o papel e lido a cada pedido, e nao carimbado no
cookie. Promover liberou na mesma sessao; rebaixar bloqueou no pedido seguinte.

**Removidas as colunas `ip_truncado` e `agente`.** Tinham truncamento, teste
proprio, e nasciam SEMPRE nulas: o `app.py` nunca passava os valores. Ninguem
lia, nada mostrava, nao havia prazo de descarte. No lugar, dois testes que provam
a AUSENCIA, para que a volta seja decisao e nao reflexo.

### Bloco 27. O pior defeito da frente de conta, achado rodando ✅ `0435ac2`

Gravacao RECUSADA pelo servico (revisao menor ou igual) fazia o navegador
carimbar a revisao devolvida e se declarar em dia com algo que nunca baixou. A
sincronizacao seguinte via as revisoes iguais e SUBIA por cima, apagando o estudo
do outro computador sem perguntar. O ramo PERGUNTAR deixava de ser alcancavel.

`interpretarGravacao` so carimba quando a revisao volta IGUAL a pedida. Os tres
lugares que gravavam tinham a mesma armadilha.

Antes disso, no mesmo dia, o defeito irmao: o que vinha do servidor voltava para
ele, porque ao mover a gravacao automatica para o gancho eu deixei para tras a
marca de "isto veio de fora".

**Licao de metodo:** os dois defeitos passaram por 400+ testes e so apareceram
com o servico de pe e um cenario adversarial montado a mao. Teste de unidade
prova a peca; so a execucao prova a montagem.

**Licao de ferramenta:** nao usar `git checkout` para desfazer uma mutacao em
arquivo nao commitado. Ele levou junto a correcao que eu ainda nao tinha
gravado. Copia antes, restaura depois.

### Bloco 28. Auditoria do que o Codex entregou, e cinco portoes que diziam sim ✅

Verificado de fato, e nao pelo relato: o site no ar e exatamente o commit
publicado (carimbo conferido na propria pagina), nove rotas sem erro de console
nem 404, CI verde nos seis commits, e as mudancas em `check-segredos` e
`check-bundle` sao REFORCO. A fila de sincronizacao que o Codex criou por cima do
meu trabalho e melhor que a minha: confere a identidade da conta imediatamente
antes do envio, e o servico confirma pelo cookie.

**Cinco defeitos, todos da mesma familia: aprovar sem ter olhado.**

1. `validate_claude_workflow.py` era fail-OPEN pelo NOME. Relatorio bem formado
   declarando liberacao com ZERO lentes auditadas: bloqueado com o nome exato,
   APROVADO com exit 0 trocando uma maiuscula ou pondo um acento. O campo que
   decide o rigor e escrito pelo relatorio que o validador deveria desconfiar.
2. `change.reason?.trim().length < 8`: sem o campo, `undefined < 8` e FALSE. So
   pegava quem escreveu justificativa curta.
3. Contrato de arquitetura com `
` cru contra arquivo CRLF: verde no CI, vermelho
   na maquina de quem desenvolve.
4. Teto de midias "por ciclo" que era vitalicio: o baseline e imutavel e o ledger
   nao pode encolher, entao travaria o CI por volta do octogesimo ativo, e a
   unica saida seria afrouxar para todo mundo.
5. Extensao desconhecida entrava calada: `.webm`, `.jpeg`, `.mp3` passariam sem
   proveniencia, sem direitos, sem teto e sem checagem de duplicata. Corrigido
   com DUAS listas explicitas, e nada fora delas.

**E um sexto, que fui eu.** O `git add -A` do meu primeiro commit varreu uma
alteracao alheia: `.mobile-bottom-nav button` de `min-height:54px` para
`28px;max-height:28px`. Metade do alvo de toque no controle mais usado do
celular. Atravessou build, 494 testes, 29 cenarios de Playwright e CI, porque
nenhum contrato media aquele alvo. Desfeito, e agora ha contrato que mede
`min-height` E `max-height`, provado por mutacao.

**Duas licoes de metodo:**

- `git add -A` em repositorio onde outro agente tambem trabalha e um jeito de
  assinar mudanca alheia. Usar caminhos explicitos;
- nao usar `git checkout` para desfazer mutacao em arquivo nao commitado: ele
  leva junto a correcao que ainda nao foi gravada. Copia antes, restaura depois.

**Tentei medir contraste na mao e falhei duas vezes:** o medidor nao enxerga
gradiente nem a notacao `color(srgb ...)`, e acusou 18 falhas falsas. Os dois
casos que fui conferir a mao estavam corretos. Para contraste, usar a skill de
auditoria e o e2e, e nao script improvisado no console.

## O que falta no layout

1. A hierarquia da barra lateral e do topo
2. O carimbo de procedência está recolhido no rodapé do Início, sendo que a
   procedência é a promessa central da plataforma

## Bloqueado por credencial: ações do CI no Node 20

**Tentei aplicar em 07/08 e o push foi recusado:**

    refusing to allow an OAuth App to create or update workflow
    .github/workflows/quality.yml without `workflow` scope

O token desta sessão não tem escopo `workflow`, então nenhuma alteração em
`.github/workflows/` sai daqui. Desfiz o commit para não travar o branch.

Para aplicar você mesmo, basta trocar três linhas em
`.github/workflows/quality.yml`. São só as de PREPARO; `upload-artifact` e
`download-artifact` ficam onde estão, porque mudaram semântica a partir da v4,
são o par que o job de publicação usa, e precisam subir juntas.

```
actions/checkout@fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09 # v5.1.0
pnpm/action-setup@41ff72655975bd51cab0327fa583b6e92b6d3061 # v4.2.0
actions/setup-node@a0853c24544627f65ddf259abe73b1d18a591444 # v5.0.0
```

O risco é menor do que parece: `publicar` tem `needs: build-and-test`, então
build vermelho significa "não publica versão nova", e não "site quebra". O site
continua servindo o último artefato aprovado. Mantenha a fixação por SHA, e não
por tag: tag pode ser movida.

## Levantamento das demais ações

Toda execução do CI avisa que `actions/checkout`, `setup-node`,
`upload-artifact` e `pnpm/action-setup` alvejam Node 20, obsoleto, e estão sendo
forçadas a rodar no Node 24. **É aviso, não falha**, e o CI está verde.

Não apliquei porque são saltos de várias versões maiores numa pipeline que
publica o site, e o modo de falha é o site parar de ser publicado. Mudança para
fazer com alguém olhando, não às sete da manhã.

O trabalho de levantamento está feito. Os SHAs da próxima major de cada uma, já
resolvidos, para trocar em `.github/workflows/quality.yml`:

```
actions/checkout@fbc6f3992d24b796d5a048ff273f7fcc4a7b6c09 # v5.1.0
actions/setup-node@a0853c24544627f65ddf259abe73b1d18a591444 # v5.0.0
actions/upload-artifact@330a01c490aca151604b8cf639adc76d48f6c5d4 # v5.0.0
actions/download-artifact@634f93cb2916e3fdff6788551b99b062d0335ce0 # v5.0.0
pnpm/action-setup@41ff72655975bd51cab0327fa583b6e92b6d3061 # v4.2.0
```

Existem majors mais novas ainda (checkout v7, upload-artifact v7,
download-artifact v8). Subir uma de cada vez, conferindo o CI entre elas, é mais
barato do que descobrir qual das cinco quebrou. O `upload-artifact` é o de maior
risco: mudou semântica de artefato a partir da v4.

A fixação por SHA, e não por tag, deve ser mantida: tag pode ser movida.

## Próximo, quando houver capacidade

**O plano `PLANO_SEQUENCIAL.md` está fechado.** Resta só a Fase 2.1, os olhos do
professor, que depende de quatro quadros de arte novos e não de código.

Da Área Técnica, tudo que não depende do usuário já foi feito: demolição,
portão, chamado de provisionamento e extratores. Os blocos 2 e 3 dependem do
registro de aplicativo, que leva de 2 a 8 semanas.

**O que a auditoria dos quatro módulos ensinou.** Ler o conteúdo gerado um por
um achou defeito em todos os quatro, incluindo dois que eu mesmo tinha criado
na véspera e um com efeito sobre decisão administrativa. Nenhum deles apareceria
em teste de unidade: eram texto plausível, bem formado, e errado. Auditar
amostra e publicar o conjunto foi o erro de método da noite.

## Aguardando o usuário

Cinco perguntas travam os blocos 2, 3, 6, 11 e 12 da sequência. Estão inteiras
em `SEQUENCIA_AREA_TECNICA.md`, resumidas:

1. Existe tenant Microsoft 365 do IAT ou do Estado, e quem protocola o registro
   de aplicativo? Nome de **duas** pessoas, porque uma só é ponto único de falha
   sobre o login inteiro.
2. Onde o piloto roda, e a infraestrutura aceita declarar por escrito os dois
   volumes com políticas opostas?
3. Quem é a segunda pessoa? O desenho precisa de coordenador que concede acesso,
   de dono do destino da trilha e de destinatário do resumo diário que não seja
   quem opera a máquina.
4. A chefia se compromete com 60 a 100 horas de analista para o gabarito cego,
   mais 40 a 60 de curadoria normativa?
5. Qual o veículo de pagamento viável para API de modelo de linguagem?

Enquanto não respondem: o desenvolvimento roda contra Keycloak local em
contêiner e **nenhum documento real entra**.
