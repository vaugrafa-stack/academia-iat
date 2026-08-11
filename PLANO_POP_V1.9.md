# Plano de incorporação do POP v1.9 na Academia

Levantamento de 11/08/2026, produzido com a ferramenta do próprio repositório
(`tools/audit_pop_candidate.py`), que é somente leitura e não altera nada.
Nenhuma alteração de conteúdo foi feita ainda.

Candidato: `POP_DLE_HID_001_v1.9_Diagnostico_Climatico_Auditado.docx`.

## 1. A ordem importa mais que o conteúdo

O pedido tem duas partes que se atropelam se forem executadas na ordem errada:
incorporar o v1.9, e remover a classificação de gravidade de todo o POP.

Remover a gravidade **altera o DOCX**, e portanto altera o SHA-256, o número de
seções, o número de quadros e a contagem de parágrafos. Se a identidade for
fixada antes da remoção, ela é fixada duas vezes, e a segunda vez invalida todo
o material derivado da primeira.

Sequência correta:

1. aplicar a remoção de gravidade sobre o v1.9 e gerar o DOCX final;
2. rodar `tools/audit_pop_candidate.py` sobre esse arquivo final;
3. só então fixar identidade e contagens e re-extrair.

## 2. Identidade: o que muda

| Campo | v1.7 publicado | v1.9 candidato |
|---|---|---|
| Arquivo | `POP ou Manual Hidreletricas IAT Julho de 2026 (Com APA, UCs, RTTA).docx` | `POP_DLE_HID_001_v1.9_Diagnostico_Climatico_Auditado.docx` |
| Bytes | 4.408.377 | 4.427.439 |
| SHA-256 | `8ffa7715…f13f2c3c` | `076ce49e…d11ae6bd0` |
| Versão operacional | 1.7 | 1.9 |
| Data da capa | julho de 2026 | agosto de 2026 |

Esses valores ainda vão mudar depois da remoção de gravidade. Não fixe agora.

## 3. Contagens: o que a proveniência vai acusar

| Medida | v1.7 | v1.9 | Delta |
|---|---:|---:|---:|
| `sectionCount` | 167 | 177 | +10 |
| `learningSectionCount` | 161 | 171 | +10 |
| `navigationSectionCount` | 6 | 6 | 0 |
| `tableCount` | 66 | 70 | +4 |
| `figureCount` | 14 | 14 | 0 |
| `imageAssetCount` | 14 | 14 | 0 |
| `bodyBlockCount` | 765 | 855 | +90 |
| `substantiveBlockCount` | 680 | 766 | +86 |
| `allDocumentParagraphNodes` | 3.339 | 3.560 | +221 |
| `tableParagraphCount` | 2.640 | 2.775 | +135 |

Nenhum dos 14 ativos de imagem mudou byte a byte. Isso poupa a re-extração de
figuras e mantém `totalAssets` em 35 (14 do POP mais 21 dos fluxogramas).

`teachableLessons`, hoje 159, não sai desse relatório. Ele só aparece depois da
re-extração. Não presuma 169: meça.

Onde fixar, quando chegar a hora:

- `tools/extract_pop.py`, dicionário `EXPECTED` na linha 54: `fileName`,
  `bytes`, `sha256`, `version`, `sections`, `learningSections`, `tables`,
  `quadros`, `tabelas`, `paragraphNodes`, `bodyBlocks`.
- `tools/check-provenance.mjs`, `EXPECTED` na linha 18: `bytes`, `sha256`,
  `sections`, `learningSections`, `teachableLessons`, `tables`.

`figures`, `popAssets` e `totalAssets` ficam como estão.

## 4. Conteúdo: 10 seções novas, nenhuma removida, 111 alteradas

Nada foi excluído do POP. O v1.9 acrescenta:

| Seção | Título |
|---|---|
| Anexo D | Modelos de condicionantes |
| Anexo E | Siglas e abreviações |
| Anexo F | Roteiro de controle de processos federais delegados e elaboração do RTAA |
| F.1 | Ficha de identificação e controle do ACT |
| F.2 | Controle anual das obrigações do ACT |
| F.3 | Preparação interna do RTAA e do formulário anual |
| F.4 | Rotina anual recomendada para reduzir retrabalho |
| F.5 | Documentos complementares, formulário e SEI/IBAMA |
| F.6 | Fechamento anual e rastreabilidade |
| (sem número) | Referências normativas e técnicas |

O Anexo F é a novidade estruturante: um roteiro inteiro de processo federal
delegado e RTAA, com seis subseções. Isso não existe na trilha atual e não cabe
em módulo existente sem violência. Provavelmente pede módulo próprio.

O nome do arquivo anuncia diagnóstico climático, e de fato há a seção nova
`18.7.1 Diagnóstico Climático no EIA/RIMA`, que entra por alteração de 18.7 e
não como seção de topo.

As 111 seções alteradas concentram diferença em:

| Linhas de diff | Seção |
|---:|---|
| 110 | 3 Histórico |
| 86 | Quadros (índice) |
| 79 | Anexo C Matriz de análise por documento |
| 33 | Tabelas (índice) |
| 33 | 18.12.7 Estrutura recomendada da Informação Técnica de Apoio |
| 32 | 18.10.4 Responsabilidades e limites institucionais |
| 31 | 18.12.3 Tipos de programas e verificações mínimas |
| 29 | 18.12.4 Método de análise de relatórios sucessivos e séries históricas |
| 28 | 26.1 Regra de precedência e preservação do arquivo original |
| 27 | 22 Checklist documental e matriz de suficiência |

Índice de quadros, índice de tabelas e histórico de versões mudam por
consequência, não por decisão editorial. O que exige leitura humana é o bloco
18.10 a 18.12, o Anexo C e a seção 22, porque são exatamente os que a Academia
usa para ensinar checklist, suficiência e análise de programas.

## 5. Um efeito colateral da capa

No v1.7 o campo `nature` da capa trazia o texto completo: "minuta técnica de
procedimento operacional para apoio à análise administrativa, documental e
ambiental, sujeita à validação jurídica e institucional".

No v1.9 esse campo está **vazio**.

A Academia exibe esse texto. Se o v1.9 entrar como está, a página perde a frase
que declara a natureza do documento, e é justamente a frase que impede o
material de ser lido como norma. Convém restaurar a linha no DOCX antes de
extrair, em vez de contornar no código.

## 6. Remoção da classificação de gravidade

### No POP

35 ocorrências de "gravidade" em 34 blocos. Duas naturezas distintas:

- **Estrutura dedicada**: a seção `5.3 Classificação de gravidade` e o
  `Quadro 11 - Classificação de gravidade`. Remover a seção reduz `sectionCount`
  e `learningSectionCount` em uma unidade cada, e remover o quadro reduz
  `tableCount`. Isso desloca de novo todas as contagens da seção 3.
- **Coluna de tabela**: "Gravidade" aparece como cabeçalho em cerca de dez
  tabelas de análise (blocos 1284, 1425, 1473, 1518, 1558, 1603, 1648, 1688,
  1776, 1832 e seguintes). Aqui não basta apagar a palavra: a coluna sai, e as
  células correspondentes saem com ela, senão a tabela fica com cabeçalho a
  menos que o corpo.

Há ainda frases que dependem do conceito e precisam ser reescritas, não
apagadas. Exemplos literais do v1.9:

- "Criar matriz de análise com status, gravidade, consequência técnica e encaminhamento."
- "A conclusão deve decorrer da gravidade, da consequência técnica e da possibilidade de saneamento dos achados."
- "As tabelas de checklist e análise técnica devem manter colunas suficientes para distinguir documento apresentado, exigibilidade, status, gravidade, achado, consequência técnica e encaminhamento."
- "Documento de outro empreendimento ou outro corpo hídrico deve ser classificado como inconsistente, com gravidade geralmente crítica."

O substituto natural já está no próprio texto: consequência técnica,
possibilidade de saneamento e encaminhamento. O POP diz, em 5.3 e em 18.12.8,
que a conclusão decorre disso. Basta deixar de nomear a escala.

O script preservado em `_scratch_revise_pop_gravidade.ps1` (133 linhas, Word
COM, preserva layout) serve para as substituições literais. Ele não resolve
remoção de coluna de tabela nem reescrita de frase. Essas duas partes exigem
decisão humana caso a caso.

### Na Academia

70 ocorrências de "gravidade" em conteúdo autoral, distribuídas assim:

| Arquivo | Ocorrências |
|---|---:|
| `src/data/question-bank.json` | 18 |
| `src/comoLerQuadro.js` | 10 |
| `src/questions.js` | 6 |
| `src/redatorIT.js` | 6 |
| `src/hydro.jsx` | 6 |
| `src/data/lab-corpos.json` | 4 |
| `src/labCases.js` | 4 |
| `src/questionsCoverage.js` | 4 |
| `src/licao.jsx` | 4 |
| `src/data/audiovisual-pilot-scripts.json` | 3 |
| `src/questionsExtra.js` | 3 |
| `src/labSources.js` | 2 |

Mais 60 ocorrências em `src/data/pop-content.json` e
`src/data/pop-public-content.json`, que **não** precisam de edição manual: elas
desaparecem sozinhas quando o POP sem gravidade for re-extraído.

Três consequências que valem antecipar:

1. `comoLerQuadro.js` tem dez menções e provavelmente ensina a ler o Quadro 11.
   Se o quadro sai do POP, o módulo perde o objeto. Não é edição de texto, é
   decisão sobre o que aquele trecho passa a ensinar.
2. As 18 menções no banco de questões podem incluir questões cuja resposta
   **é** a classificação de gravidade. Questão assim não se edita, se substitui,
   e isso mexe em `check-questoes` e em `check-rubricas`.
3. `redatorIT.js` monta a IT. Se ele emite coluna ou campo de gravidade, o
   produto entregue muda de formato, e é o produto que o técnico leva.

### O que não pode ser tocado por substituição automática

`src/data/offline-packages.json` tem 528 ocorrências de "crítico", "médio" ou
"baixo" e **zero** de "gravidade". São usos técnicos legítimos: vazão crítica,
período crítico, porte médio, baixa declividade. `flowcharts-content.json` tem
42 no mesmo caso, `audiovisual-pilot-media.json` tem 33, `courseData.js` tem 51.

Uma substituição cega de "crítico" destrói esse texto. O termo seguro para
buscar é "gravidade". Os adjetivos só saem quando estiverem qualificando a
escala, e isso se confere lendo.

## 7. Portões que vão reprovar, e é para reprovarem assim

Na ordem em que aparecem:

1. `check-provenance.mjs`: nome, bytes, SHA-256, versão e todas as contagens.
2. `extract_pop.py`: recusa a fonte na validação de identidade antes de extrair.
3. `check-public-editorial-policy.mjs`: o texto novo do v1.9 ainda não passou
   pela regra de travessão e termos removidos.
4. `check-questoes.mjs` e `check-rubricas.mjs`: se questões forem removidas ou
   reescritas, a cobertura muda.
5. `check-videoaulas.mjs`: as videoaulas citam conteúdo por seção. Dez seções
   novas e 111 alteradas provavelmente dessincronizam manifesto e legenda.
6. `check-bundle.mjs`: mais conteúdo, orçamento por chunk pode estourar.

Nenhum deles deve ser afrouxado para deixar o v1.9 passar. Cada um marca
trabalho que falta.

## 8. Sequência sugerida

1. Restaurar a linha de natureza na capa do v1.9.
2. Decidir o destino de cada uma das 35 menções de gravidade no POP: remover
   seção 5.3, remover Quadro 11, remover a coluna das tabelas de análise,
   reescrever as frases que dependiam do conceito.
3. Gerar o DOCX final e rodar `tools/audit_pop_candidate.py` sobre ele.
4. Fixar identidade e contagens em `extract_pop.py` e `check-provenance.mjs`
   com os números que saírem do passo 3, nunca com os deste documento.
5. `pnpm extract:pop` e conferir `teachableLessons` real.
6. Tratar o Anexo F: módulo novo na trilha, ou fora dela por decisão explícita.
7. Varrer os 12 arquivos autorais com "gravidade", um a um.
8. Rodar a bateria inteira e abrir o navegador antes de publicar.

Os passos 2, 6 e 7 são decisão de conteúdo e não devem ser automatizados.
