# Status atual da Academia IAT

Atualizado em 14/08/2026. Este é o único documento de situação corrente. Os
planos detalhados do repositório preservam decisões e snapshots históricos.
Quando houver divergência, prevalecem os manifestos gerados, os testes do commit
identificado e este status.

## Identidade do produto

- Repositório público: `vaugrafa-stack/academia-iat`.
- Branch de código: `master`.
- Produção: <https://vaugrafa-stack.github.io/academia-iat/>.
- Commit efetivo de produção: exposto pela aplicação no atributo
  `data-build-sha` e confirmado pelo workflow de qualidade. Ele não é fixado
  neste arquivo para evitar que o próprio commit de atualização o torne
  obsoleto.
- Publicação: workflow único `.github/workflows/quality.yml`; o job de publicação
  usa exatamente o artefato aprovado pelo job de qualidade, sem recompilar.
- Natureza: treinamento e apoio à consulta, sem validade administrativa,
  certificação institucional ou decisão automática sobre processo.

Uma alteração local ou um push em repositório privado não é produção. A versão
de produção só muda quando o workflow público termina com sucesso e o artefato
publicado é verificado pelo SHA incorporado ao aplicativo.

## Fonte e medidas reproduzíveis

Fonte congelada: minuta `POP-DLE-HID-001`, versão operacional 1.9 indicada na
capa, SHA-256
`d66151bd6f171357ae1bd20f256d417abd1719151f115ac2325397c1962d83d4`.

| Medida | Valor | Fonte reproduzível |
|---|---:|---|
| Seções extraídas | 176 | `src/data/extraction-validation.json` |
| Títulos não navegacionais | 170 | `src/data/extraction-validation.json` |
| Tópicos didáticos com conteúdo | 168 | `src/data/extraction-validation.json` |
| Módulos | 17 | `src/courseData.js` e testes de contrato |
| Quadros e tabelas | 69 | `src/data/extraction-validation.json` |
| Figuras do POP | 14 | `src/data/extraction-validation.json` |
| Fluxogramas-fonte | 21 | `src/data/extraction-validation.json` |
| Ativos extraídos | 35 | `public/source-assets/asset-manifest.json` |
| Casos sintéticos | 26 | `src/data/lab-index.json` |
| Questões comentadas | 224 | `src/data/question-bank.json` |
| Referências registradas | 60 | dados de referência e `check-questoes` |

Essas contagens provam cobertura e integridade estrutural. Não provam vigência
normativa, validade pedagógica, competência profissional ou aprovação humana.

## Linha de base histórica e validação corrente

Na linha de base histórica `e298901511b984fea315f675cb0ba2c2736fb762`, a
validação local registrada em 09/08/2026 obteve:

- 50 arquivos de teste e 431 testes unitários aprovados;
- todos os portões encadeados de `pnpm test` aprovados;
- build de produção aprovado dentro dos orçamentos;
- 10 cenários Playwright do artefato aprovados em desktop e nas larguras 320,
  360, 390 e 430 pixels;
- navegação, busca e menu móvel inspecionados sem erro de console.

Esses resultados são a linha de base do SHA informado. Mudanças posteriores
precisam executar novamente `pnpm test`, `pnpm build`, `pnpm audit:premium`,
`pnpm test:e2e:artifact` e `pnpm test:e2e:pwa:local` antes de publicação local;
o workflow usa a variante de CI com a base do GitHub Pages.

A última versão integralmente validada localmente em 09/08/2026 obteve:

- 56 arquivos de teste e 468 testes aprovados;
- todos os portões encadeados de `pnpm test`, inclusive smoke, governança de
  mídia e auditoria fail-closed de workflows, aprovados;
- build do GitHub Pages aprovado, com 696,0 KiB de JavaScript bruto, 232,0 KiB
  compactado, 227,7 KiB de CSS bruto e 43,1 KiB compactado, em 32 chunks JavaScript;
- 19 cenários Playwright do artefato aprovados em desktop e nas larguras 320,
  360, 390 e 430 pixels, além de um cenário PWA aprovado;
- onze rotas inspecionadas em 1440 e 390 pixels sem overflow horizontal, erro
  de página ou erro de console;
- inspeção em navegador real da rastreabilidade normativa, Avaliações,
  Hidrelétricas, percursos de formação, navegação móvel, foco, teclado,
  contraste e alvos de toque.

### Candidato local de 10/08/2026 — validação integral concluída

O candidato desta rodada foi validado localmente, mas só se torna produção após
push, workflow público verde e conferência do mesmo SHA no GitHub Pages. Ele
incorpora:

- Formação extraída de `main.jsx` e carregada sob demanda, com fundação para
  iniciantes, atalho para experientes e testes próprios da rota;
- compositor principal em 68.969 bytes e 2.067 linhas após integrar as rotas
  lazy da conta opcional;
- CSS exclusivo de rotas consolidado e carregado sob demanda, CSS de perfil
  retirado da inicialização e folha móvel solicitada apenas quando necessária;
- guia de hidrelétricas com navegação local estável, conteúdo técnico revisado e
  separação explícita entre os eixos ambiental e setorial;
- glossário contextual das aulas também disponível no conteúdo móvel;
- metadados pedagógicos nas 213 questões: objetivo, nível cognitivo,
  dificuldade estrutural, prioridade de remediação e feedback por distrator;
- contraste reforçado, alvos de toque de 44 × 44 px e auditoria Playwright
  permanente sobre 13 rotas.

No candidato integrado, a validação final obteve:

- 61 arquivos de teste e 512 testes aprovados, além de todos os portões
  encadeados de conteúdo, segurança, privacidade, mídia, fontes, CSS e smoke;
- build aprovado em 38 chunks JavaScript, com 721,8 KiB bruto e 241,1 KiB
  compactado; CSS inicial em 181,3/32,5 KiB e CSS total em 238,3/43,3 KiB;
- 29 cenários Playwright aprovados em desktop e nas larguras 320, 360, 390 e
  430 pixels; um cenário exclusivamente móvel foi corretamente ignorado no
  projeto desktop; o cenário PWA/offline também foi aprovado;
- 25 testes das ferramentas Python aprovados e auditoria de dependências de
  produção sem vulnerabilidades conhecidas;
- inspeção em navegador real que encontrou e corrigiu a rota incorreta do botão
  de fundamentos; um teste agora confirma clique, destino e recarga direta.

Esses resultados liberam o candidato para publicação, não para declarar
validade normativa, eficácia pedagógica ou aprovação institucional.

O relatório desta rodada está em
[`AUDITORIA_NOTA_10_2026-08-10.md`](AUDITORIA_NOTA_10_2026-08-10.md).

A promoção de qualquer versão continua condicionada à aprovação do workflow
público, à publicação do mesmo artefato no GitHub Pages e à conferência do SHA
exibido pela aplicação online. O SHA corrente deve ser obtido da própria
aplicação ou do artefato do workflow; este arquivo não tenta antecipar o hash
do commit que o contém.

### Candidato local de 21/08/2026 — animações hidrelétricas validadas

O guia de hidrelétricas foi refeito para que as demais representações tenham o
mesmo padrão didático do corte técnico principal. Anatomia, barragens, turbinas,
usina reversível e arranjos agora usam cenas ampliadas, seleção por equipamento
ou configuração, identificação textual externa ao desenho e movimento que
representa água, rotor ou sentido operacional. Todas possuem pausa, velocidade,
estado anunciado e respeito à preferência de movimento reduzido; fora da tela,
o movimento é suspenso.

Também foram corrigidos o deslocamento dos pontos da anatomia, a continuidade
dos traçados, a mecânica visual de Pelton, Kaplan e Bulbo, a sincronização entre
seletor e galeria de turbinas e o indicador da seção atual após navegação longa
no celular. O vertedouro só mostra descarga quando esse componente é
selecionado, evitando ensinar uma condição operacional permanente.

As provas locais desta rodada são:

- 66 arquivos de teste e 601 testes aprovados pelo portão integral;
- build aprovado em 38 chunks, com 838,4 KiB de JavaScript e 264,5 KiB de CSS;
- 54 cenários Playwright aprovados e seis omissões previstas, nas larguras
  320, 360, 390, 430 e 1440 pixels, usando os dois trabalhadores do CI;
- nova regressão de navegador cobrindo identificação, controles, toque,
  sincronização, overflow e leitura móvel de todas as animações;
- inspeção visual em desktop e 390 pixels, sem erro de console ou rolagem
  horizontal.

O CSS total ficou em 99,8% do teto bruto e 99,1% do teto compactado. O artefato
passa, mas a próxima ampliação visual deve recuperar margem ou permanecer
estritamente carregada sob demanda. As animações são representações didáticas e
continuam sujeitas à revisão técnica e ao teste com usuários.

## Serviços separados

| Serviço | Repositório | Estado comprovado | Não confundir com |
|---|---|---|---|
| Conta opcional de estudo | repositório privado separado | fonte validada e versionada no SHA `a89a81c130f4d784578ff02162b22b7511d95599`; 136 testes locais, wheel reproduzível, ciclo de e-mail/senha e sincronização exercitados; matriz Windows/Ubuntu e imagem Docker aprovadas no workflow `31509742433` | serviço implantado, conta obrigatória ou armazenamento de processos |
| Área Técnica restrita | repositório privado separado | fonte limpa e sincronizada no SHA `2cf5a0d4d6245f02f5d70f2f5d0ee705120d3d03`; a última suíte integral registrada, no SHA pai `86e36f68f32b02e83e1496305fa6d2d4eb4f70f2`, teve 641 testes; OIDC, autorização, upload, conversa, fila, resultados, backup e retenção foram exercitados com dados sintéticos | processador automático conectado, ambiente institucional ou tratamento autorizado de processo real |

Os dois serviços privados não possuem implantação ou pipeline de produção
comprovados. A Academia pública continua utilizável sem conta remota. Nenhum
documento real pode entrar na Área Técnica antes dos portões formais de
governança, infraestrutura e autorização.

A Área Técnica possui o corredor seguro para receber arquivos, gerar uma cópia
sanitizada, enfileirar o pedido e reconciliar um resultado assinado. Ela ainda
não contém cliente de modelo nem serviço que leia a Codex Inbox e produza o
resultado. O worker atual apenas aguarda um processador externo. Portanto, o
upload e a fila existem, mas checklist documental, minuta de IT, análise de
programas e demais produtos ainda não são gerados automaticamente pela
plataforma e o Projeto IAT do ChatGPT não está conectado a esse fluxo.

A prontidão atual confirma aplicação, Banco, diretórios e worker, mas não prova
que esse processador externo exista. O piloto permanece restrito a dados
sintéticos e arquivos textuais UTF-8; PDF, DOCX, imagens, digitalizações, ZIP,
KMZ e documentos reais continuam bloqueados até existirem extração isolada,
antivírus, quarentena, governança institucional e autorização formal.

Os dois candidatos privados incluem dependências travadas por hash, auditoria
de vulnerabilidades, construção determinística de wheel e workflow de
qualidade. A execução remota desses workflows deve ser conferida depois do
envio; nenhuma dessas provas locais, isoladamente, autoriza implantar os
serviços.

O workflow externo de auditoria que antecedeu o primeiro push desses serviços
não é evidência válida: cinco de cinco agentes falharam e o agregador registrou
uma liberação falsa. O incidente foi convertido em regressão automática; o novo
validador reprova erro oculto, resultado vazio, cobertura incompleta, lentes
duplicadas e totais agregados incompatíveis. Isso corrige o portão, mas não
transforma o relatório histórico em evidência válida.

O candidato atual recebeu uma nova revisão independente do diff. Foram
reexecutados 12 cenários adversariais nas contas e 11 na Área Técnica, além das
suítes completas, sem bloqueador de segurança conhecido para commit e push.
Essa liberação não equivale a autorização para implantar os serviços privados
nem para receber documentos reais.

## Riscos e portões ainda abertos

1. **Conteúdo normativo.** As 60 referências possuem rota oficial mapeada, mas
   vigência, transição, escopo e aplicação ao caso continuam sujeitos a revisão
   humana registrada.
2. **Validade pedagógica.** Questões, casos, rubricas e vídeos precisam de revisão
   editorial, psicométrica, técnica e teste com usuários dos perfis atendidos.
3. **Acessibilidade.** Automação não substitui leitor de tela, zoom a 200%,
   dispositivos reais, baixa conectividade e validação assistiva humana.
4. **Arquitetura.** Formação já foi extraída e o CSS inicial ganhou orçamento
   próprio, mas o compositor e o CSS compartilhado permanecem grandes. A
   decomposição deve preservar contratos, modo offline e orçamentos.
5. **Mídia e repositório.** O acervo é volumoso e requer política de crescimento,
   origem, licença, retenção e distribuição. Não reescrever o histórico para
   migrar mídia sem plano de rollback.
6. **Serviços privados.** Conta remota e Área Técnica ainda dependem de decisões
   institucionais, observabilidade, backup, resposta a incidente e implantação.

## Governança de auditoria automatizada

Resultados agregados de agentes são auxiliares, não prova autônoma. Um workflow
com status `completed` pode conter agentes em erro. Antes de usar um relatório
como liberação de push, publicação ou conclusão de auditoria, o projeto exige
validação fail-closed do arquivo persistido: falha de agente, resultado vazio,
cobertura incompleta ou ausência de evidência bloqueiam.

O validador e sua política são versionados neste repositório em
`tools/validate_claude_workflow.py` e `tools/claude_workflow_policy.json`; as
regressões integram `tools/test_tooling.py`. O incidente histórico que motivou a
regra permanece preservado e não deve ser reescrito.

## Regra para atualizar este arquivo

Atualize o status no mesmo ciclo que muda código ou dados:

1. derive contagens de manifesto ou comando, nunca de memória;
2. identifique o SHA exato validado e o SHA efetivamente publicado;
3. separe implementado, testado localmente, enviado e publicado;
4. registre limitações humanas ou institucionais sem convertê-las em sucesso;
5. não marque produção antes de conferir o artefato online pelo SHA;
6. mantenha planos antigos como evidência histórica, sem reutilizar seus números
   como estado atual.
