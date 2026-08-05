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
