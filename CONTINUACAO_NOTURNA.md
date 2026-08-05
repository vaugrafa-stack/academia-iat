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

- `npm test` verde antes de qualquer commit. São 19 portões.
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
