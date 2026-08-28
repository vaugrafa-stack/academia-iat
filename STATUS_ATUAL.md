# Status atual da Academia IAT

Atualizado em 27/08/2026. Este é o único documento de situação corrente. Os
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

Fonte congelada: minuta `POP-DLE-HID-001`, arquivo
`POP_DLE_HID_001_v1.9_Sem_Empreendimento_Nomeado.docx`, versão operacional 1.9
indicada na capa, SHA-256
`ad33a4939ac5f73d5669fc4784c43319d1c1cae0193c7c3a0aa04bdfd669b353`.

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

### Candidato local de 27/08/2026 — atributos das camadas GeoPR

Os símbolos das camadas oficiais agora são identificados por consulta ao
`MapServer/identify`: hover mostra um resumo junto ao ponto; clique ou toque
fixa o resultado e abre detalhes no topo do painel. Nome, tipo, situação,
município, bacia, rio, potência, finalidade, fonte e horário aparecem quando o
serviço os declara. Enter consulta o centro visível e Escape fecha o resultado.

A consulta percorre todas as camadas ativas na mesma ordem em que são pintadas,
com concorrência limitada, prazo por serviço e preservação das respostas já
obtidas. Ela distingue ponto vazio, erro e resposta parcial. Protocolo,
portaria, códigos de usuário e ponto, coordenadas, CPF, CNPJ, contato,
responsável e demais identificadores continuam retidos pela política pública da
Academia; camadas arbitrárias do acervo usam uma lista conservadora de campos
semânticos.

As provas locais aprovadas são 67 arquivos e 616 testes no portão integral,
build em 38 chunks, auditoria premium, 59 cenários Playwright aprovados com seis
omissões previstas e o cenário PWA/offline aprovado. A inspeção com o serviço
oficial real passou em desktop e 390 px, sem erro de console ou overflow. O CSS
total foi preservado em 264,5/265 KiB ao manter o estado visual novo no chunk
sob demanda do mapa. O workflow público ainda precisa aprovar e publicar o
mesmo SHA antes de declarar este candidato em produção.

O acervo pesquisável contém mais de mil MapServers externos. Os serviços
pontuais curados foram conferidos, mas uma camada encontrada pela busca pode não
publicar subcamada consultável ou ficar temporariamente indisponível; nesses
casos a interface informa a limitação em vez de inventar atributos.

### Candidato local de 27/08/2026 — busca unificada e robustez do artefato

O mapa agora possui um único campo que reconhece coordenada decimal, grau/minuto/
segundo e UTM, além de empreendimento, município, bacia, APP, unidade de
conservação, PACUERA, plano, zoneamento e demais camadas do acervo GeoPR. A
seleção enquadra ou marca a feição quando o serviço fornece geometria, ativa a
camada correspondente e abre os atributos públicos disponíveis. Quando um tema
não representa um ponto único, a interface orienta a aproximar e consultar uma
feição, sem fabricar uma localização.

O texto digitado e as coordenadas não são enviados como termo de pesquisa. A
aplicação baixa índices públicos por consultas fixas, filtra-os no navegador e
recusa entradas com aparência de CPF, CNPJ, protocolo, contato ou CEP. A busca
local continua funcionando sem rede; uma indisponibilidade parcial do GeoPR é
declarada na própria lista. No celular, a lista mede o espaço visível e abre
acima ou abaixo do campo para não ficar encoberta pela navegação inferior.

Também foram reforçados os contratos de acessibilidade e recuperação: o download
de registro de módulo tem nome acessível; falha ao ler um backup é anunciada e
libera a seleção para nova tentativa; os pontos visuais do mapa não duplicam a
lista acessível. O Service Worker passou a consultar chaves de cache em conjunto
e a verificar centenas de URLs com concorrência limitada. No arranque, os quatro
JSON necessários, 1.414.558 bytes sem compressão, começam a ser buscados em
paralelo ao chunk principal e são reutilizados sem segunda requisição.

A tela inicial foi extraída de `main.jsx` para uma fronteira própria, reduzindo
o ponto de composição sem alterar rotas ou conteúdo. Um contrato automatizado
agora confere o nome e o SHA-256 da fonte POP corrente e recusa documentação
operacional obsoleta. Dependências diretas receberam atualizações compatíveis e
o workflow ganhou auditoria semanal, inclusive quando não há novo commit, e
preserva um SBOM CycloneDX identificado pelo SHA de cada candidato. O
cadastro remoto opcional também passou a exibir somente a resposta genérica do
backend, sem revelar se um endereço já possui conta.

A validação corrente deste candidato obteve:

- 70 arquivos de teste e 637 testes aprovados;
- 65 cenários Playwright aprovados sobre o artefato, com 30 omissões esperadas
  pela matriz de projeto, largura e capacidade aplicável;
- um cenário PWA local aprovado em Chromium contra o Service Worker real;
- `pnpm build` e auditoria premium aprovados;
- 38 chunks JavaScript, 879,2/900,0 KiB brutos e 286,3/300,0 KiB compactados;
- CSS inicial em 178,7/205,0 KiB bruto e 32,5/38,0 KiB compactado; CSS total em
  258,5/265,0 KiB bruto e 48,6/50,0 KiB compactado;
- maior ativo compressível, o conteúdo público do POP, em 918,7/960,0 KiB bruto
  e 144,2/150,0 KiB compactado.

Todos os limites automatizados foram respeitados. A remoção de estilos sem
emissores recuperou cerca de 6 KiB no CSS; o conteúdo público do POP permanece
próximo do teto e novas ampliações devem continuar sob demanda.

## Serviços separados

| Serviço | Repositório | Estado comprovado | Não confundir com |
|---|---|---|---|
| Conta opcional de estudo | repositório separado | SHA `b037c95b49949980bc97dee05baf4fde52e31bd8`; 155 testes, matriz Windows/Ubuntu, auditoria de dependências, imagem sem CVE alta/crítica corrigível e SBOM aprovados no [workflow 33136151766](https://github.com/vaugrafa-stack/iat-contas/actions/runs/33136151766); confirmação vinculada à senha e ao nome da tentativa | serviço implantado, conta obrigatória ou armazenamento de processos |
| Área Técnica restrita | repositório separado | SHA `6017f498b24d9effccfc48eb2a599fd83184964e`; 868 testes aprovados e quatro omissões opcionais; matriz Windows/Ubuntu, auditoria de dependências, imagem sem CVE alta/crítica corrigível e SBOM aprovados no [workflow 33136154274](https://github.com/vaugrafa-stack/iat-area-tecnica/actions/runs/33136154274); fluxo exercitado somente com dados sintéticos | Projeto IAT do ChatGPT, implantação pública, processamento automático habilitado ou tratamento autorizado de processo real |

Os dois serviços privados não possuem implantação de produção comprovada. A
Academia pública continua utilizável sem conta remota e seu build atual não
configura uma URL pública para a Área Técnica; por isso o ponto de entrada
restrito não é exibido aos usuários do GitHub Pages. Nenhum documento real pode
entrar na Área Técnica antes dos portões formais de governança, infraestrutura e
autorização.

A Área Técnica possui o corredor para receber arquivos, gerar derivados
textuais sanitizados, enfileirar o pedido, validar uma resposta estruturada,
renderizar entregáveis e reconciliar um resultado assinado. O processador é um
serviço independente que pode chamar diretamente a API Responses com
`store: false`, `tools: []` e saída estruturada. Ele não usa upload de arquivos
da API, busca web ou file search e **não está conectado ao Projeto IAT do
ChatGPT**; método, contrato de produtos e representação do POP são locais e
versionados no próprio backend.

O catálogo contém 11 produtos: inventário documental, checklist documental,
linha do tempo processual, matriz de divergências, análise de suficiência
técnica, análise de condicionantes, programas ambientais e séries históricas,
minuta de diligência, minuta de Informação Técnica, síntese executiva e relação
de anexos com quadro de evidências. São minutas e análises auxiliares sujeitas à
conferência do técnico; a existência do catálogo não prova que uma análise
automática esteja disponível.

O estado seguro padrão mantém o provedor `desabilitado`. Sem selecionar
explicitamente `openai_responses` e injetar uma chave fora do repositório, a
prontidão publica `analise_automatica_disponivel: false` e nenhuma chamada de
modelo ocorre. O piloto permanece limitado a dados sintéticos. PDF e DOCX com
texto podem produzir derivados no gateway. A barreira antimalware por `clamd`
é opcional, falha fechada quando habilitada e continua desligada no perfil
padrão; não há OCR nem quarentena institucional. Imagens, digitalizações sem
camada textual, ZIP, KMZ e documentos reais continuam fora do uso autorizado
até existirem isolamento, governança institucional e autorização formal.

Os dois candidatos separados incluem dependências travadas por hash, auditoria
de vulnerabilidades, construção determinística de wheel, imagem auditada e
SBOM. As execuções remotas correntes estão ligadas na tabela aos respectivos
SHAs; essas provas técnicas não autorizam, isoladamente, implantar os serviços.

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
