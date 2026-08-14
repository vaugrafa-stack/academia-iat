# Academia IAT — Licenciamento Hidrelétrico

Plataforma de aprendizagem, consulta técnica e prática aplicada baseada na minuta `POP-DLE-HID-001`, versão operacional 1.9, agosto de 2026, e na proposta de fluxogramas vinculada ao projeto.

> **Status da fonte:** a versão 1.9 vem do texto visível da capa, que continua sendo a única autoridade sobre a versão operacional. Na minuta v1.7 o metadado interno do arquivo Word trazia “1.2” e divergia da capa; na v1.9 ele coincide. O extrator registra por escrito qual dos três casos ocorreu, ausente, divergente ou coerente, e um metadado que divirja sem registro reprova. A minuta e os recursos desta plataforma permanecem sujeitos a validação humana, normativa e institucional.

O estado operacional corrente, a distinção entre produção e repositórios apenas
enviados e os riscos ainda abertos ficam em [`STATUS_ATUAL.md`](STATUS_ATUAL.md).
Os demais planos preservam snapshots históricos e não devem ser usados como
painel de situação.

## Fonte e rastreabilidade

- arquivo-fonte atual: `POP_DLE_HID_001_v1.9_Sem_Classificacao_de_Gravidade.docx`;
- SHA-256: `f7056462b84de383c8e2dbb1e22d3bb732d90fbd876a933e0596642caf5b4871`;
- versão operacional: 1.9, conforme a capa;
- extração: 167 seções, das quais 161 não navegacionais e 6 apenas navegacionais;
- percurso: 159 tópicos com conteúdo próprio; 2 dos 161 títulos não navegacionais são apenas cabeçalhos estruturais e permanecem representados pela hierarquia e pelas subseções;
- conteúdo pesquisável: 3.339 nós de parágrafo;
- elementos estruturados: 66 quadros/tabelas, 14 figuras do POP e 21 fluxogramas da proposta;
- fidelidade textual normalizada: nenhuma divergência detectada entre os 3.365 nós de parágrafo da fonte e da extração.

As evidências verificáveis ficam em `src/data/extraction-validation.json`, `src/data/content-catalog.json` e `public/source-assets/asset-manifest.json`. Os arquivos DOCX originais não integram o repositório público.

## Executar localmente

```powershell
cd "CAMINHO\PARA\academia-iat"
pnpm install
pnpm dev
```

Abra `http://127.0.0.1:5173`.

Para gerar e conferir o pacote de produção:

```powershell
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e:artifact
pnpm test:e2e:pwa:local
pnpm preview
```

O preview manual fica em `http://127.0.0.1:4173`. O teste E2E abre o artefato
final em Chromium nas larguras de 1440, 320, 360, 390 e 430 pixels, percorre
as rotas críticas e reprova diante de erro de console, resposta local com erro,
overlay de framework, tela vazia ou rolagem horizontal involuntária. O teste
PWA separado exercita em Chromium o Service Worker real, navegação sem rede,
registro e controle da página, atualização de uma versão para outra e o suporte
disponível offline.

## Qualidade e publicação

O workflow `Qualidade` compila uma única vez, executa todos os portões e o
Playwright sobre esse mesmo `dist`, e só então armazena o artefato com o nome
`academia-iat-<SHA>`. O job de publicação depende desse job, baixa o artefato
do mesmo run e o envia à branch `gh-pages` sem recompilar. Pull requests nunca
publicam, e falha ou cancelamento de qualquer portão impede o job de publicação.

O SHA completo é incorporado ao build e aparece de forma abreviada na área de
versão da plataforma; o valor completo fica disponível no atributo técnico e
nos registros gerados. Builds locais usam o SHA atual com o sufixo `-local`.

## Estado atual da plataforma

- 17 módulos e 159 tópicos didáticos vinculados às seções com conteúdo próprio do POP;
- Formação em uma sequência única de 17 módulos, com pesquisa, expansão por módulo, acesso livre a qualquer aula e código carregado sob demanda;
- aulas com orientação, texto-fonte, quadros, tabelas, figuras, anotações e referências;
- cada aula oferece checagem comentada, recuperação ativa escrita e autoauditoria; para novas conclusões, a checagem deve estar correta, o registro deve ter ao menos 80 caracteres significativos e dois de três critérios devem ser conferidos;
- 159 resumos audiovisuais por seção, com 10,5 a 102,5 segundos, voz em português, pôster, texto aberto, legenda WebVTT opcional e transcrição;
- seis microaulas piloto usam professor fictício, voz, legenda, transcrição e cenários de barragem, território, campo e análise documental; a boca é exibida em cadência visual reduzida, com transições curtas, pausas neutras, cabeça estável e rosto integralmente enquadrado também em áreas estreitas, mas os tempos continuam estimados e não possuem comprovação formal de precisão de até 100 ms;
- 17 vídeos de abertura de módulo e três animações SVG complementares;
- 7 fluxogramas interativos e 21 fluxogramas-fonte para comparação; cada atividade interativa explicita evidência, risco e fonte em seis etapas e termina em uma decisão ramificada comentada;
- 26 cenários de laboratório com documentos e dados exclusivamente sintéticos, distribuídos em cinco níveis objetivos: 10 para Reconhecer, 5 para Aplicar, 2 para Decidir, 5 para Integrar e 4 para Fundamentar;
- cinco casos acrescentam classificação de evidências e quatro acrescentam tarefa aberta; contratos versionados de objetivo impedem que conclusões antigas ou incompletas sejam reaproveitadas como domínio do exercício atual;
- 26 folhas-resposta de consulta, cobrindo 130 decisões com justificativa específica, evidência relacionada, apoio literal do POP, conteúdo mínimo, desfecho, glossário, lacunas a confirmar e proveniência das classificações e tarefas abertas;
- 213 questões comentadas, com uma questão exclusiva para cada uma das 159 aulas, avaliações por módulo e diagnóstico em formas A e B; o candidato de 10/08/2026 acrescenta objetivo, nível cognitivo, dificuldade estrutural, prioridade de remediação e feedback por distrator, todos marcados para revisão humana;
- Redator de Informação Técnica organizado pelos 12 elementos do item 23.1, seleção pesquisável de caso e a divergência em relação às 10 seções do Anexo B mantida visível;
- registro das 60 referências do POP: 22 vínculos diretos para fonte oficial, 38 vínculos para índice oficial e nenhuma referência sem portal oficial mapeado; vigência e aplicação continuam pendentes de revisão humana;
- busca sobre 3.339 nós textuais, 66 quadros/tabelas e 35 imagens extraídas das fontes;
- favoritos, caderno pessoal, progresso, resultados e retomada no navegador;
- PWA com 17 pacotes opcionais de mídia para estudo offline, totalizando aproximadamente 194,0 MiB; a reprodução online usa streaming e só persiste mídia após comando explícito;
- quatro catálogos volumosos — mapa, índice do laboratório, mídia piloto e pacotes offline — são carregados como JSON externos validados, somente quando necessários;
- o menu lateral possui rolagem própria para manter o Suporte alcançável em telas baixas e oferece acesso externo ao portal GeoPR logo após o Mapa do Paraná;
- layout responsivo, navegação por teclado e suporte a `prefers-reduced-motion`.

Os números demonstram presença e rastreabilidade, não eficácia pedagógica nem competência profissional. Os vídeos são resumos para orientação e revisão; não substituem a leitura, a consulta à fonte, a prática deliberada ou uma demonstração técnica aprofundada. Os pacotes offline atuais cobrem a mídia catalogada de cada módulo e os recursos compartilhados do palco, mas não equivalem a uma cópia integral de todos os recursos da plataforma.

As travas de conclusão das aulas comprovam apenas que uma resposta foi registrada, dois critérios foram autodeclarados e uma questão objetiva foi respondida corretamente. Comprimento de texto e autoauditoria não medem qualidade técnica. As 159 aulas possuem questão exclusiva, dentro de um banco de 213 questões com fonte verificada. Em 41 delas, a alternativa correta ainda é a mais longa; o portão de qualidade mede essa pista para impedir regressão. Revisão editorial, psicométrica e especializada continua necessária.

Os laboratórios usam casos e documentos sintéticos marcados como exemplos didáticos sem validade administrativa. Nenhum processo real ou dado pessoal deve ser inserido na plataforma.

No candidato integralmente validado em 10/08/2026, o JavaScript soma 710,6 KiB
de um orçamento de 850 KiB em tamanho bruto e 237,4 KiB de 270 KiB compactado,
distribuído em 35 chunks. O CSS inicial mede 181,3 KiB bruto e 32,5 KiB
compactado; o total mede 236,5/43,0 KiB. Folhas exclusivas de rota e perfil
ficam fora da inicialização, sem elevar os limites existentes.

### Candidato integralmente validado — 10/08/2026

Esta rodada extraiu a Formação de `main.jsx`, reduziu o compositor principal
para 65.935 bytes e 2.039 linhas, criou chunks sob demanda e acrescentou uma
fundação didática para quem ainda não conhece hidrelétricas. Também revisou a
navegação e o conteúdo técnico do guia de hidrelétricas, levou as siglas das
aulas ao conteúdo móvel, reforçou contraste e transformou o feedback das 213
questões em dados pedagógicos inspecionáveis.

O portão Playwright percorre 13 rotas e verifica semântica, títulos, nomes
acessíveis, alvos de toque, tamanho de texto em campos móveis, imagens,
hierarquia de títulos, overflow e falhas de runtime. A bateria final aprovou 61
arquivos e 512 testes, 29 cenários Playwright nas cinco larguras previstas, um
cenário PWA/offline, 25 testes das ferramentas Python e a auditoria de
dependências sem vulnerabilidades conhecidas. A publicação ainda exige workflow
público verde e conferência do SHA incorporado ao aplicativo online.

Os detalhes, limites e pendências humanas estão em
[`AUDITORIA_NOTA_10_2026-08-10.md`](AUDITORIA_NOTA_10_2026-08-10.md).

### Conta opcional e Área Técnica separada — 11/08/2026

A Academia ganhou o ciclo visual completo da conta opcional: criação,
verificação de e-mail, entrada, recuperação, troca de senha, encerramento de
sessões e exclusão. A integração permanece desligada no build público comum e
só é ativada com `IAT_CONTA_REMOTA=1`, sempre em mesma origem com o backend de
contas. O backend correspondente foi validado e versionado no commit
`a89a81c130f4d784578ff02162b22b7511d95599` do repositório privado
`iat-contas`, com 136 testes aprovados e a matriz de qualidade mais a imagem
Docker aprovadas no [workflow 31509742433](https://github.com/vaugrafa-stack/iat-contas/actions/runs/31509742433).

Com essa superfície opcional, o artefato atual possui 38 chunks JavaScript,
721,8 KiB brutos e 241,1 KiB compactados. O CSS inicial permanece em
181,3/32,5 KiB e o total em 238,3/43,3 KiB, ainda dentro dos orçamentos; a
margem de CSS total ficou estreita e deve ser preservada nos próximos ciclos.

A Área Técnica restrita é outro produto e outra fronteira de segurança. O
commit `b64591ad3a266024840be2f0f1518cdb52a033ec` do repositório privado
`iat-area-tecnica` entrega, para piloto local exclusivamente sintético, OIDC,
papéis, concessão nominal por processo, upload, conversa, fila, resultados,
histórico, backup, retenção e trilha. A execução local registrou `337 passed`
e `3 skipped`; Windows e Ubuntu em Python 3.12/3.13 e a imagem Docker foram
aprovados no [workflow 31520073659](https://github.com/vaugrafa-stack/iat-area-tecnica/actions/runs/31520073659).
Os casos ignorados exigem privilégio de symlink no Windows. Isso não constitui
implantação institucional, não autoriza documento real e não transforma o
worker em um serviço autônomo de IA: a análise ainda depende de processador
externo aprovado ou de revisão humana.

## Avaliação e registro pessoal

Resultados, rubricas e atividades permitem autoacompanhamento e sinalizam pontos para revisão. Eles não constituem certificação do IAT, habilitação profissional, prova institucional de competência ou autorização para decidir processos.

O registro de conclusão gerado pela plataforma é pessoal e não credencial. Uma futura certificação institucional exigiria governança própria, identidade verificada, instrumentos validados, critérios de aplicação, supervisão e decisão formal da instituição competente.

## Validação técnica

```powershell
pnpm test
pnpm build
pnpm audit:premium
pnpm test:e2e:artifact
pnpm test:e2e:pwa:local
```

A suíte cobre testes unitários, PWA/offline, proveniência, referências, rubricas, questões, mídia e auditoria das aulas. O Playwright valida o artefato renderizado em navegador real nas cinco larguras previstas; o candidato de 10/08/2026 acrescenta uma auditoria permanente de semântica, operação por toque e legibilidade em 13 rotas. Em um portão próprio, o Playwright também comprova respostas offline do Service Worker e a atualização controlada do aplicativo. O workflow exige os dois portões antes de armazenar o artefato publicável. O portão premium procura falhas de governança, privacidade e exposição acidental. Nenhum teste automatizado substitui revisão especializada de conteúdo, acessibilidade, usabilidade ou aprendizagem.

## Arquivos principais

- `AGENTS.md`: contrato permanente, limites, prioridades e ciclo obrigatório do agente;
- `STATUS_ATUAL.md`: única fonte corrente para versão, provas, limites e próximos portões;
- `PLANO_EVOLUCAO.md`: snapshot histórico do ciclo encerrado em 04/08/2026, com adendos de evolução posteriores;
- `AUDITORIA_NOTA_10_2026-08-10.md`: evidências, limites e portões do candidato de 10/08/2026;
- `LEARNING_DESIGN.md`: desenho pedagógico integral e critérios de qualidade;
- `src/main.jsx`: composição principal e telas ainda em processo de extração;
- `src/formacao.jsx`: rota de Formação carregada sob demanda;
- `src/derivados.js`: dados derivados do POP com dependências explícitas;
- `src/courseData.js`: módulos, questões, cenários e fluxos;
- `src/data/pop-content.json`: conteúdo integral estruturado e sanitizado do POP;
- `src/data/flowcharts-content.json`: 21 fluxogramas estruturados e sanitizados;
- `src/data/extraction-validation.json`: identidade e fidelidade da extração;
- `src/data/offline-packages.json`: inventário determinístico dos pacotes offline;
- `public/source-assets`: imagens extraídas das fontes documentais;
- `public/media`: resumos audiovisuais, legendas, pôsteres, animações e ilustrações;
- `tools/smoke-test.mjs`: navegação funcional automatizada;
- `tools/audit-premium.mjs`: portão de governança, privacidade e exposição acidental;
- `tests/e2e/accessibility.artifact.pw.js`: portão de acessibilidade e UX em 13 rotas do artefato;
- `tools/validate_claude_workflow.py`: trava fail-closed para relatórios agregados de agentes.

## Privacidade e uso responsável

A plataforma é material de estudo e apoio à consulta. Não substitui norma vigente, Termo de Referência aplicável, análise do caso concreto, SGA, outorga, ato da ANEEL, manifestação de órgão interveniente, decisão administrativa nem validações jurídica, técnica e institucional.

Documentos reais só podem virar material didático após triagem de pertinência, anonimização, remoção de metadados e avaliação do risco de reidentificação. Originais sensíveis não devem ser publicados. Antes de usar qualquer orientação em processo real, confirme fonte oficial, vigência, fase, modalidade, contexto documental e competência do órgão ou profissional responsável.
