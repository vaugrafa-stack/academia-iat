# Plano de evolução da Academia IAT

Documento de trabalho. Ele existe para que a execução sobreviva a interrupções:
cada etapa tem estado, critério de pronto e verificação. Quem retomar lê daqui.

**Estado em 2026-07-27** · POP v1.7 · 17 módulos · 161 aulas · 159 videoaulas ·
136 questões · 26 casos · 7 portões no `npm test`.

---

## Como este plano é executado

1. Uma etapa por vez, na ordem. Etapa só fecha com verificação registrada.
2. Nada entra sem passar `npm run build` (que inclui o guarda de artefato) e
   `npm test` (7 portões).
3. Cada etapa vira um commit próprio, com o porquê no corpo da mensagem.
4. O estado abaixo é atualizado no mesmo commit da entrega.

Legenda: ⬜ pendente · 🟨 em curso · ✅ pronto · ⛔ recusado (com motivo)

---

## Diagnóstico: o que está medido hoje

### Arquitetura
| Item | Medida | Problema |
|---|---|---|
| `src/main.jsx` | 81 kB | Em redução; telas restantes dependem do dado derivado |
| `src/labCases.js` | 70 kB | Conteúdo e código no mesmo arquivo |
| `src/courseData.js` | 67 kB, linhas de 1.192 caracteres | Idem |
| Testes de unidade | 26 (profile, offline, platform, derivados) | — |
| Portões automáticos | 7 + guarda de artefato | Cobrem regressão estrutural, não lógica |

### Conteúdo e didática
| Item | Medida | Problema |
|---|---|---|
| Questões por módulo | 8 em todos | Uniforme, mas sem análise de item |
| Casos por módulo | 1 na maioria; 3 em M05, M08, M14 | Profundidade desigual |
| Videoaulas | 159 de 161 | Duas seções organizacionais sem roteiro |
| Exemplo trabalhado | Presente na abertura de cada módulo | — |
| Medida de aprendizagem | 3 questões por módulo | — |

### Reconhecido e não resolvido
- Competência de especialista exige documento real, caso aberto e avaliação
  humana. Depende do IAT, não da plataforma.
- Sem camada de imagem de satélite: exigiria servidor externo, que a política
  de segurança bloqueia e que sumiria offline. Já dito na própria tela.

---

## Etapa 1 — Separar dado derivado de componente ✅

**Problema.** Todo componente de `main.jsx` lê `lessons`, `blockMap`, `INDICE`,
`GLOSSARIO`, `trackLessons` do escopo do módulo. É isso que torna qualquer
extração perigosa: já quebrou duas vezes, uma levando `Suporte` sem
`PageHeader`, outra cortando por contagem de chaves que tropeçou em chave
dentro de classe de caractere de expressão regular.

**Ação.**
1. `src/derivados.js` com `criarDerivados(popData, tracks)`, devolvendo
   `{sectionById, lessons, lessonMap, trackLessons, blockMap, tableMap,
   figureByBlock, GLOSSARIO, INDICE, sectionText}`. Funções puras, testáveis.
2. `main.jsx` passa a consumir o objeto, sem mudar nenhuma tela.
3. Testes de unidade sobre `criarDerivados`: contagem de aulas, roteamento de
   seção conhecida, índice cobrindo aula, quadro e sigla.

**Pronto quando.** `npm test` verde, guarda de artefato verde, as 11 áreas
renderizam no navegador, e `derivados.js` tem teste próprio.

**Risco.** Médio. Mitigação: a extração é de *dados*, não de JSX; o JSX não se
move nesta etapa.

---

## Etapa 2 — Extrair telas, uma por vez 🟨

**Problema.** Com o dado separado, cada tela vira extraível. Sem isso, não.

**Ação.** Nesta ordem, uma por commit, verificando entre cada:
`ui.jsx` (PageHeader, Empty) → `Suporte` → `ThemeToggle` → `ComparaDiagnostico`
→ `AutoAvaliacao` → `GlobalSearch` → `Flowcharts` → `KnowledgeLibrary` →
`Assessments` → `Laboratory` → `Profile` → `Lesson` → `Dashboard`.

**Método.** Sem regex de fronteira. A extração usa o próprio bundler: move-se o
componente para o arquivo novo, importa-se de volta, e o build acusa o que
faltou. `check-referencias` cobre identificador solto.

**Pronto quando.** `main.jsx` abaixo de 25 kB, cada arquivo com uma
responsabilidade, todos os portões verdes.

**Primeira leva entregue.** `ui.jsx` (PageHeader, Empty) e `painelAluno.jsx`
(ThemeToggle, Suporte, ComparaDiagnostico, AutoAvaliacao). main.jsx: 92 → 81 kB.
As telas restantes dependem do dado derivado e passarão a recebê-lo por
propriedade, uma por commit.

---

## Etapa 3 — Exemplo trabalhado na aula ✅

**Problema.** A aula apresenta o critério do POP. Ela não mostra ninguém
aplicando o critério a um caso. Quem nunca analisou um processo lê a regra e
não sabe o que fazer com ela.

**Ação.** Para os módulos com caso de laboratório, a aula ganha um bloco
"Como isso aparece num processo": trecho de evidência, a pergunta que o
analista se faz, e o encaminhamento, ligado ao caso correspondente.

**Pronto quando.** Cada módulo com caso tem exemplo trabalhado na aula de
abertura, e um teste garante que o vínculo aula↔caso não quebra.

---

## Etapa 4 — Profundidade de prática por módulo ⬜

**Problema.** Doze módulos têm um único caso. Um caso treina um achado.

**Ação.** Segundo caso para os módulos de maior peso operacional: M03
(enquadramento), M06 (renovação e transferência), M09 (PACUERA), M12 (UC e
APA), M13 (federal delegado). Cada um com natureza de achado distinta do
primeiro, como já foi feito no bloco de programas ambientais.

**Pronto quando.** Nenhum módulo estrutural com menos de dois casos;
`check-rubricas` verde.

---

## Etapa 5 — Avaliação que mede magnitude ✅

**Problema.** O diagnóstico usa uma questão por módulo: mede direção, não
magnitude. Já dito na tela, mas é limitação real.

**Ação.**
1. Diagnóstico passa a sortear três questões por módulo, mantendo o mesmo
   conjunto entre entrada e saída (semente guardada com o registro).
2. Análise de item: registrar acerto por questão ao longo do tempo para
   identificar questão ambígua ou distrator inútil.
3. Relatório por módulo com acerto proporcional, não binário.

**Pronto quando.** Comparação entrada/saída reporta percentual por módulo, e a
semente garante que o par compara o mesmo instrumento.

**Decisão tomada.** Não houve semente aleatória: a seleção é determinística
(as três primeiras questões de cada módulo, na ordem do banco). Semente seria
complexidade sem ganho, já que o que importa é entrada e saída usarem o mesmo
instrumento. O custo subiu de 17 para 51 questões e a tela passou a declarar
isso: promessa de 15 min faria a pessoa abandonar no meio e perder a medida.

**Análise de item ficou fora.** Exige série histórica de várias pessoas, e o
progresso é local por navegador. Sem backend, não há amostra.

---

## Etapa 6 — Tela de conteúdo offline ⬜

**Problema.** `offline.js` já expõe API de download explícito, prova de guarda,
estimativa de quota e remoção. Nada disso tem interface. O usuário não sabe o
que funciona sem rede.

**Ação.** Área em Meu perfil: o que está guardado, quanto ocupa, botão para
baixar o pacote de um módulo, e remoção consciente. Sem promessa vaga de
"funciona offline".

**Pronto quando.** A tela informa tamanho real e o download de um módulo é
verificável com a rede desligada.

---

## Etapa 7 — Acessibilidade auditada por teclado e leitor ✅

**Problema.** Contraste foi medido e corrigido. Ordem de foco, rótulo acessível
e navegação por teclado nas telas novas (redator, mapa com zoom, autoavaliação)
não foram auditados.

**Ação.** Percorrer as 11 áreas só com teclado; verificar foco visível, ordem
lógica, rótulo em todo controle, e anúncio de mudança de estado. Corrigir o que
aparecer.

**Pronto quando.** Todas as áreas navegáveis por teclado, sem armadilha de foco,
com registro do percurso testado.

**Auditado.** Zero controles sem nome acessível nas 11 áreas. Zero `tabindex`
positivo. Zero imagem sem alternativa. Um defeito real corrigido:
`.mp-busca input` tinha `outline:none` sem substituto, deixando quem navega
por teclado sem saber onde estava; o anel passou para o grupo.

**Cuidado registrado.** `getComputedStyle` não lê `:focus-visible`, então a
primeira varredura acusou 25 falsos positivos. Verificação de foco se faz na
folha de estilo, não pelo estilo computado do elemento.

---

## Etapa 8 — Conteúdo: quadros e glossário dentro da aula ⛔ recusada

**A premissa era falsa e construir teria enganado.** Medi antes de escrever: de
161 aulas, apenas 3 citam quadro que não está nelas, e as três citam "Quadro 1".

Esse "Quadro 1" é o da **IN IAT nº 09/2025**, norma externa, não o "Quadro 1 -
Informações de controle documental" do POP. O trecho é explícito: "não substitui
a leitura do art. 9º, do Quadro 1, dos Termos de Referência vigentes".

Uma resolução automática por número teria aberto o quadro errado no lugar certo,
com aparência de fonte. Melhor não ter o recurso do que tê-lo mentindo.

**O que fica registrado.** Quem for mexer nisso precisa distinguir citação a
quadro do POP de citação a quadro de norma externa. Sem essa distinção, qualquer
resolução automática de "Quadro N" é insegura.

---

## Registro de execução

| Etapa | Estado | Commit | Verificação |
|---|---|---|---|
| 1 Dado derivado | ✅ | `src/derivados.js` | 26 testes de unidade (eram 12); 11 áreas renderizam; build e 7 portões verdes |
| 2 Extrair telas | 🟨 | `src/ui.jsx`, `src/painelAluno.jsx` | 6 módulos sem referência solta; 11 áreas renderizam; main.jsx 92 → 81 kB |
| 3 Exemplo trabalhado | ✅ | `ExemploNoProcesso` | Aparece só na aula de abertura; 28 testes de unidade; desfecho fica no laboratório |
| 4 Profundidade de prática | ⬜ | | |
| 5 Avaliação com magnitude | ✅ | `DIAG_POR_MODULO=3` | 51 questões, 3 por módulo, seleção determinística; comparação reporta `M01 0→3 de 3` |
| 6 Tela de offline | ⬜ | | |
| 7 Acessibilidade | ✅ | `.mp-busca:focus-within`, `#mp-ajuda-teclado` | 0 controles sem nome nas 11 áreas; 1 anel de foco restaurado; mapa descreve as teclas e anuncia o zoom |
| 8 Quadros na aula | ⛔ | — | Premissa falsa: 3 de 161 aulas citam quadro externo; resolver por número abriria o quadro errado |
