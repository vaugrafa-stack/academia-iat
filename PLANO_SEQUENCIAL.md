# Plano sequencial de melhorias

Análise completa de 04/08/2026 sobre o commit `34fd2e4`, por lente: funcional,
visual, didática, de quem programa, de quem usa, frontend, layout, estilo e
revisão de texto. Cada item nasce de uma medida, e a ordem é de execução, não
de importância isolada: o que destrava vem antes do que depende.

**Decisão de projeto assumida nesta rodada:** a plataforma passa a exigir
conexão. O modo offline deixa de ser restrição de peso, porque estava limitando
a qualidade do material. Nada é removido, mas nenhuma melhoria será recusada
por causa do tamanho do download.

---

## Onde a plataforma está hoje

Atualizado ao fim da sequência de rodadas de 04/08/2026.

| Lente | Medida | Situação |
|---|---|---|
| Funcional | 11 rotas renderizam, console limpo, **382 testes em 46 arquivos**, 21 portões | sólida |
| Frontend | JS 80,7% do teto, CSS **80,3%** | com folga |
| Código | `main.jsx` **79 kB, 51% do teto**, `licao.jsx` 1.568, `laboratorio.jsx` **1.388** | aula e regra do laboratório fora do orquestrador |
| Acessibilidade | 0 botão sem nome, 0 imagem sem alt, 0 rolagem lateral, foco 316/316, **0 salto de título** | limpa |
| Texto | 0 palavra sem acento em 7 arquivos de conteúdo | limpo |
| Mídia | 173 MB de videoaula, 27 MB de piloto | irrelevante agora |
| Didática | 159 aulas, **149 objetivos observáveis distintos**, 26 casos nos 5 degraus, revisão espaçada ativa | promessa específica por aula |
| Vídeo | 159 aulas com sincronia labial de fonema derivada da legenda; 6 pilotos com roteiro editorial, **agora declarados na tela** | dois padrões, e a diferença está dita |

**Fechados nesta sequência:** 1.1, 1.2, 2.2, 3.1, 3.2, 3.3, 4.1 e 4.2.
**Aberto:** só 2.1, que depende de arte nova e não de código.

---

## Fase 1. Destravar (antes de qualquer coisa nova)

### 1.1 Orçamento de CSS de volta à folga ✅

**Medida.** 37,8 de 40 KiB gzip, 94,6%. O teto subiu para 40 em 01/08 e já está
quase consumido de novo. A próxima melhoria visual barra no build.

**O que fazer.** Rodar `check-css-morto`, remover órfãs, e medir duplicação
entre as seis folhas. Se não houver gordura, subir o teto **com a conta
registrada no arquivo**, como da última vez. Não subir em silêncio.

**Pronto quando.** Abaixo de 85% do teto.

### 1.2 Salto de nível de título em Fluxogramas ✅

**Medida.** A rota `fluxos` é a única das 11 com salto na hierarquia de
títulos: um `h2` seguido direto de `h4`, ou equivalente. Quem navega por
cabeçalho perde a estrutura.

**O que fazer.** Corrigir a sequência. É mudança de tag, não de layout.

**Pronto quando.** As 11 rotas sem salto.

---

## Fase 2. O professor

### 2.1 Olhos sem expressão ⬜

**Medida.** O sprite `professor-visemes-v2` tem 12 quadros, todos de boca. Os
olhos são fixos. Numa figura que fala por 44 segundos em média, olho parado lê
como máscara, e é a queixa que sobrou depois de a boca ser corrigida.

**O que fazer.** É trabalho de **arte, não de código**. Duas linhas de quadros
novos resolvem: piscar (2 quadros) e leve variação de sobrancelha para ênfase
(2 quadros). O piscar entra em intervalo irregular, entre 3 e 6 segundos, porque
piscar regular parece relógio. A ênfase acompanha o visema de vogal aberta, que
já marca a sílaba tônica.

**Risco.** Sem os quadros novos, não fazer nada. Animar por deformação de
imagem produz o mesmo efeito artificial que a senoide produzia na boca.

### 2.2 Unificar os dois padrões de vídeo ✅

**Medida.** Existem seis aulas-piloto com roteiro editorial, atlas temático e
visemas de fonema, e 159 aulas com quadros gerados por PIL e visemas derivados
de legenda. São duas experiências diferentes na mesma plataforma.

**O que fazer.** Decidir explicitamente: ou o piloto vira o padrão e as 159
migram, ou o piloto fica declarado como amostra. Hoje a diferença não está
declarada em lugar nenhum, e quem abre a aula 18 e depois a 57 vê duas
plataformas.

**Com conexão obrigatória**, migrar as 159 para o padrão do piloto deixou de
ter impedimento de peso. O impedimento que resta é editorial: são 159 roteiros.

**Resolvido por DECLARAÇÃO, em 04/08/2026.** A legenda do vídeo agora distingue
os três padrões que convivem:

| O que a pessoa vê | Quando |
|---|---|
| Microaula piloto, roteiro editorial | as 6 aulas do piloto |
| Resumo em vídeo desta seção | as 159 com vídeo próprio |
| Resumo em vídeo do módulo | as poucas sem vídeo próprio |

O runtime já marcava `classification: "microaula-piloto"`; o dado só não chegava
à tela. Declarar é mais honesto que uniformizar por baixo: apagar a diferença
para "ficar tudo igual" esconderia o padrão mais alto em vez de persegui-lo.

A migração das 159 continua aberta, e agora é escolha editorial explícita, não
uma inconsistência silenciosa.

---

## Fase 3. Didática, onde está o buraco real

### 3.1 Os degraus vazios do Laboratório ✅

**Medida.** `check-niveis` mostra 3 dos 5 degraus ocupados. Nenhum caso exige
**aplicar** (separar o que não serve da decisão) nem **fundamentar** (pergunta
aberta avaliada por rubrica).

**O que fazer.** Para `aplicar`, marcar em cada caso quais evidências são
distratores. Para `fundamentar`, converter os três casos do grupo "Decisão e
produto técnico" em pergunta aberta, sem as cinco de sim ou não.

**Cuidado.** Isso é autoria de conteúdo. Marcar uma evidência como distratora
é afirmar que ela não serve à decisão, e essa afirmação precisa vir do caso,
não de conveniência para preencher o degrau.

**Já estava feito quando fui medir, em 04/08/2026.** O item entrou neste plano
por erro meu: escrevi a análise a partir de uma medição anterior, sem
reconferir. `check-niveis` mostra os cinco degraus ocupados:

| Degrau | Casos |
|---|---:|
| Reconhecer | 10 |
| Aplicar | 5 |
| Decidir | 2 |
| Integrar | 5 |
| Fundamentar | 4 |

O portão também mudou de critério, e para melhor: em vez de contar casos por
degrau, ele registra o **piso por caso**. Contar por degrau produzia falso
positivo, porque promover um caso esvazia o degrau anterior e parece regressão.
Agora subir pode, voltar a uma tarefa mais simples não.

Fica a lição de método: **reconferir o estado antes de planejar em cima dele.**
Um plano que descreve o passado como se fosse o presente desperdiça a rodada de
quem o executa.

### 3.2 Os nove elementos nas 159 aulas 🟨

**Medida.** É o maior item em volume do plano anterior e continua aberto.
Pré-requisito, objetivo observável, explicação, fonte, exemplo trabalhado, erro
frequente, prática, feedback e domínio.

**O que fazer.** Começar pelo **erro frequente**, que é o que mais rende e o que
mais falta. O POP já traz erros recorrentes dentro dos quadros: o Quadro 8 tem
uma coluna inteira chamada "Erro recorrente a evitar". Ligar isso à aula é
reaproveitamento, não autoria.

**O erro frequente foi feito em 04/08/2026.** 35 erros colhidos de dois quadros,
ligados por menção explícita do termo: **81 das 159 aulas** recebem ao menos um,
com 177 vínculos.

**O objetivo observável foi feito em 05/08/2026.** Eram 11 objetivos distintos
para 167 seções, e um deles aparecia em 41 aulas. `objetivoObservavel.js` deriva
do próprio POP em três origens e produz **149 distintos, nenhum repetido**:

| Origem | Seções | O que vira objetivo |
|---|---:|---|
| Quadro próprio | 64 | reconstruir as colunas a partir da primeira |
| Ação de análise nomeada | 59 | a própria ação, em verbo de lista controlada |
| Exigência citada | 26 | a regra entre aspas, localizada nos autos |
| Sem base própria | 18 | segue com o perfil antigo |

Cada aula ganhou também o **como se vê**, que é a parte observável e não existia.

Restam sete elementos. Os que sobraram são os que exigem autoria, e não
reaproveitamento: **exemplo trabalhado** é o de maior retorno didático e o de
maior risco de invenção, porque são 159 exemplos. **Pré-requisito** foi medido e
descartado: as remissões do POP apontam para quadros, quase nunca para outras
seções, e o glossário de siglas por aula já cobre a terminologia.

### 3.3 Revisão espaçada com retomada de erro ✅

**Medida.** O estado guarda `doneAt` e `lastVisit`, mas nada traz de volta o que
a pessoa errou. Sem isso, a avaliação final mede memória recente.

---

## Fase 4. Código

### 4.1 Extrair `Lesson` de `main.jsx` ✅

**Medida.** 130 kB, 84% do teto contratado de 155 kB, e `Lesson` com seus
subcomponentes era a maior parte.

**Feito em 05/08/2026.** `src/licao.jsx` com 1.441 linhas movidas e
`src/sourceAssurance.jsx` com 60. `main.jsx` caiu para **79 kB, 51% do teto**.

A fronteira é o contrato `dados`, mesmo idioma de `biblioteca.jsx`. A medida que
tornou a extração barata: dos quinze componentes, **onze não precisavam de nada
além das próprias propriedades**. Só quatro recebem dado derivado.

Cinco contratos apontavam para dentro do bloco e foram repontados, não
afrouxados. Dois defeitos que só o smoke test e o navegador pegariam: eu medi o
que o bloco precisa de fora e esqueci do sentido contrário, e um ícone ficou
fora dos imports novos.

### 4.2 `laboratorio.jsx` com 1.775 linhas ✅

**Medida.** Segunda maior. Cresceu com o catálogo, a folha-resposta e a ajuda
progressiva.

**Feito em 05/08/2026.** `src/laboratorioLogica.js` com 411 linhas sem uma linha
de JSX nem um hook. O arquivo da tela caiu para **1.388 linhas**, de 66 kB para
53 kB.

O critério da divisão não foi tamanho, foi natureza: o que é regra sai, o que é
tela fica. A medida que mostrou o ganho: **trinta testes já exercitavam essas
funções** carregando React, ícones e folha de estilo para isso.

O contrato que impede a volta também não é de tamanho. É a ausência de React no
módulo de regra: se ele voltar a importar React ou a conter JSX, o portão
reprova.

---

## O que este plano deliberadamente não propõe

- **Remover o modo offline.** Ele funciona e não custa nada manter. O que muda
  é que ele deixa de ser critério de recusa.
- **Refazer o CI ou os portões.** Dezenove passos, todos com motivo registrado.
- **Trocar de stack.** O desenho estático é decisão, não limitação.
- **Certificação.** Registro local nunca é credencial, e nível de especialista
  exige pessoa avaliando.
