# POP v1.9 na Academia: o que foi feito

Registro da migração concluída em 11/08/2026. Este documento nasceu como plano
e virou relato: o que está aqui aconteceu e está verificado pelos portões do
repositório.

Fonte publicada: `POP_DLE_HID_001_v1.9_Sem_Classificacao_de_Gravidade.docx`,
4.196.608 bytes, SHA-256 `f7056462…caf5b4871`, versão operacional 1.9.

## 1. A classificação de gravidade saiu

A escala não é usada nos relatórios do dia a dia, e por isso saiu do POP e da
plataforma. O substituto já estava no próprio texto: o encaminhamento decorre da
consequência técnica e da possibilidade de saneamento, não de um rótulo.

No documento:

- a seção 5.3 e o Quadro 11, que existiam só para definir a escala;
- a coluna "Gravidade" de 15 tabelas de checklist e análise;
- a tabela de "Gravidade típica" virou "Consequência técnica", com as células
  reescritas, porque ali a coluna carregava condição técnica real e apagá-la
  perderia conteúdo;
- 15 frases reescritas, das quais a mais estrutural é a do item 26.6;
- os quadros 12 a 46 renumerados para 11 a 45, com as 78 referências cruzadas.

Resultado conferido: zero ocorrências de "gravidade" e zero da escala crítico,
médio e baixo. O arquivo de entrada não foi alterado.

Na plataforma, 70 ocorrências em 12 arquivos de conteúdo autoral, mais 60 no
conteúdo derivado, que sumiram sozinhas na re-extração. `src/hydro.jsx` não foi
tocado: ali "gravidade" é física, a barragem a gravidade e o `g` da fórmula da
potência.

## 2. O conteúdo do v1.9 entrou

| Medida | v1.7 | v1.9 sem gravidade |
|---|---:|---:|
| Seções | 167 | 176 |
| Títulos substantivos | 161 | 170 |
| Tópicos didáticos | 159 | 168 |
| Tabelas | 66 | 69 |
| Figuras e ativos do POP | 14 | 14 |
| Referências normativas | 60 | 66 |
| Questões do banco | 213 | 224 |

Dez aulas novas, todas no módulo M08: a 18.7.1, sobre o Diagnóstico Climático no
EIA/RIMA, e o bloco 18.12.1 a 18.12.9, sobre análise de programas ambientais.
Cada uma recebeu vídeo, legenda, capa, visema e questão exclusiva.

Seis referências novas, todas do bloco climático: a Política Nacional sobre
Mudança do Clima, a política estadual e seu decreto, a Portaria IAT nº 42/2022 e
o Greenhouse Gas Protocol. As duas últimas ficaram fiéis à ementa que o próprio
POP registra, inclusive a ressalva de que a remissão à Resolução CEMA nº 107/2020
precisa ser compatibilizada com o marco estadual vigente.

## 3. Duas mudanças da fonte, deliberadas

A v1.9 retirou do POP dois trechos que a política editorial da plataforma já
mantinha fora da apresentação pública: duas linhas de uma tabela e uma parte do
título da 18.10.5, que passou a se chamar "Participação social e
complementações".

Os portões acusaram as duas na hora, porque um deles esperava omitir exatamente
duas linhas e encontrou zero, e o outro compara o título narrado no vídeo com o
título da seção. A remoção foi confirmada como deliberada por quem edita o POP.

Efeito prático: a reescrita editorial que existia para aquela seção virou
operação nula nesta versão. A trava de hash sobre a mídia dela continua, e o
filtro da apresentação pública continua ativo, porque a fonte pode voltar a
trazer o termo e nesse caso ele não pode chegar à tela.

## 4. O que os portões pegaram, e que não era a migração

**Uma aula ficava sem vídeo, em silêncio.** A 18.12.9 é feita só de marcadores de
lista. O divisor de frases quebrava apenas antes de maiúscula ou dígito, e o
marcador não é nem um nem outro, então os dez itens viravam uma string única,
estouravam o teto de 900 caracteres e eram descartados. Sem frase não há roteiro,
e sem roteiro a aula cai no vídeo do módulo. O portão que deveria pegar isso
tolerava até 4 aulas sem vídeo próprio, e com os dois cabeçalhos estruturais mais
essa dava 3: o teto tinha exatamente o tamanho do defeito. Virou critério, e o
divisor ganhou cinco regressões que não existiam.

**A governança esperava para reprovar quem rodasse o build.** O
`GENERATOR_VERSION` foi para 3 e o acervo commitado ficou em 2, porque ninguém
rodou o build completo desde a subida. A regra exigia igualdade exata em 2.
Virou piso, igual ao que o `check-videoaulas` já usava.

**Build parcial deixava o manifesto mentindo.** Ele gravava vídeo, legenda e capa
no destino e não tocava no manifesto, para não publicar manifesto parcial. O
efeito era pior: a mídia nova ficava descrita pelos metadados da antiga, e os
portões conferiam contra uma ficha desatualizada. Agora ele mescla.

**Duas seções tinham o mesmo objetivo, palavra por palavra.** O POP reparte um
quadro em partes com letra, "Quadro 33: A" e "Quadro 33: B", e a extração
guardava só o número. Com 12 linhas cada, as duas produziam texto idêntico.

## 5. O que ficou para depois, e por quê

**O Anexo F não tem lugar próprio na trilha.** São seis subseções sobre processo
federal delegado e elaboração do RTAA. O conteúdo entrou e é pesquisável, mas
está distribuído em vez de formar um módulo. É decisão de desenho instrucional,
não de extração.

**A aprovação humana da mídia continua pendente.** O registro de proveniência das
76 mudanças diz isso por escrito, no campo `reviewedBy`: os portões técnicos
rodaram e passaram, a aprovação institucional não aconteceu. Quem publicar
assume essa parte.
