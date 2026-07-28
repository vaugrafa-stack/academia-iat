# Academia IAT — Licenciamento Hidrelétrico

Plataforma de aprendizagem, consulta técnica e prática aplicada baseada na minuta `POP-DLE-HID-001`, versão operacional 1.7, julho de 2026, e na proposta de fluxogramas vinculada ao projeto.

> **Status da fonte:** a versão 1.7 vem do texto visível da capa. O valor “1.2” que ainda aparece em propriedades internas do arquivo Word é metadado legado e não identifica a versão operacional. A minuta e os recursos desta plataforma permanecem sujeitos a validação humana, normativa e institucional.

## Fonte e rastreabilidade

- arquivo-fonte atual: `POP ou Manual Hidreletricas IAT Julho de 2026 (Com APA, UCs, RTTA).docx`;
- SHA-256: `8ffa771546c244e194e6d7b41dd91d5ab3f56083e94c081e1e5c9a17f13f2c3c`;
- versão operacional: 1.7, conforme a capa;
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
pnpm preview
```

O preview fica em `http://127.0.0.1:4173`.

## Estado atual da plataforma

- 17 módulos e 159 tópicos didáticos vinculados às seções com conteúdo próprio do POP;
- quatro percursos recomendados — Essencial, Analista, PACUERA e Revisor — que reorganizam prioridades sem esconder ou bloquear o catálogo;
- aulas com orientação, texto-fonte, quadros, tabelas, figuras, anotações e referências;
- cada aula oferece checagem comentada, recuperação ativa escrita e autoauditoria; para novas conclusões, a checagem deve estar correta, o registro deve ter ao menos 80 caracteres significativos e dois de três critérios devem ser conferidos;
- 159 resumos audiovisuais curtos, com 9,4 a 23,8 segundos, pôster, legenda WebVTT e transcrição;
- 17 vídeos de abertura de módulo e três animações SVG complementares;
- 7 fluxogramas interativos e 21 fluxogramas-fonte para comparação; cada atividade interativa explicita evidência, risco e fonte em seis etapas e termina em uma decisão ramificada comentada;
- 26 cenários de laboratório com documentos e dados exclusivamente sintéticos, incluindo cinco séries históricas;
- 136 questões comentadas, avaliações por módulo e diagnóstico em formas A e B;
- Redator de Informação Técnica organizado pelos 12 elementos do item 23.1, com a divergência em relação às 10 seções do Anexo B mantida visível;
- registro das 60 referências do POP: 22 vínculos diretos para fonte oficial, 38 vínculos para índice oficial e nenhuma referência sem portal oficial mapeado; vigência e aplicação continuam pendentes de revisão humana;
- busca sobre 3.339 nós textuais, 66 quadros/tabelas e 35 imagens extraídas das fontes;
- favoritos, caderno pessoal, progresso, resultados e retomada no navegador;
- PWA com 17 pacotes opcionais de mídia para estudo offline, totalizando aproximadamente 117,4 MiB;
- layout responsivo, navegação por teclado e suporte a `prefers-reduced-motion`.

Os números demonstram presença e rastreabilidade, não eficácia pedagógica nem competência profissional. Os vídeos curtos são resumos para orientação e revisão; não substituem a leitura, a consulta à fonte, a prática deliberada ou uma demonstração técnica aprofundada. Os pacotes offline atuais cobrem a mídia catalogada de cada módulo, mas ainda não equivalem a uma cópia integral de todos os recursos da plataforma.

As travas de conclusão das aulas comprovam apenas que uma resposta foi registrada, dois critérios foram autodeclarados e uma questão objetiva foi respondida corretamente. Comprimento de texto e autoauditoria não medem qualidade técnica. Quando uma seção ainda não possui item exclusivo, a checagem usa uma questão claramente rotulada do mesmo módulo. O banco cobre diretamente 82 das 161 seções didáticas; 83 das 136 respostas corretas ainda são estritamente mais longas que os distratores, embora nenhuma tenha o dobro do maior distrator. Revisão editorial, psicométrica e humana continua obrigatória.

Os laboratórios usam casos e documentos sintéticos marcados como exemplos didáticos sem validade administrativa. Nenhum processo real ou dado pessoal deve ser inserido na plataforma.

## Avaliação e registro pessoal

Resultados, rubricas e atividades permitem autoacompanhamento e sinalizam pontos para revisão. Eles não constituem certificação do IAT, habilitação profissional, prova institucional de competência ou autorização para decidir processos.

O registro de conclusão gerado pela plataforma é pessoal e não credencial. Uma futura certificação institucional exigiria governança própria, identidade verificada, instrumentos validados, critérios de aplicação, supervisão e decisão formal da instituição competente.

## Validação técnica

```powershell
pnpm test
pnpm build
pnpm audit:premium
```

A suíte cobre testes unitários, PWA/offline, proveniência, referências, rubricas, questões, mídia, auditoria das aulas e navegação funcional automatizada. O portão premium procura falhas de governança, privacidade e exposição acidental. Nenhum teste automatizado substitui revisão humana de conteúdo, acessibilidade, usabilidade, aprendizagem ou validação renderizada em navegador real.

## Arquivos principais

- `AGENTS.md`: contrato permanente, limites, prioridades e ciclo obrigatório do agente;
- `PLANO_EVOLUCAO.md`: diagnóstico, etapas, critérios de pronto e registro de execução;
- `LEARNING_DESIGN.md`: desenho pedagógico integral e critérios de qualidade;
- `src/main.jsx`: composição principal e telas ainda em processo de extração;
- `src/derivados.js`: dados derivados do POP com dependências explícitas;
- `src/courseData.js`: módulos, questões, cenários e fluxos;
- `src/data/pop-content.json`: conteúdo integral estruturado e sanitizado do POP;
- `src/data/flowcharts-content.json`: 21 fluxogramas estruturados e sanitizados;
- `src/data/extraction-validation.json`: identidade e fidelidade da extração;
- `src/data/offline-packages.json`: inventário determinístico dos pacotes offline;
- `public/source-assets`: imagens extraídas das fontes documentais;
- `public/media`: resumos audiovisuais, legendas, pôsteres, animações e ilustrações;
- `tools/smoke-test.mjs`: navegação funcional automatizada;
- `tools/audit-premium.mjs`: portão de governança, privacidade e exposição acidental.

## Privacidade e uso responsável

A plataforma é material de estudo e apoio à consulta. Não substitui norma vigente, Termo de Referência aplicável, análise do caso concreto, SGA, outorga, ato da ANEEL, manifestação de órgão interveniente, decisão administrativa nem validações jurídica, técnica e institucional.

Documentos reais só podem virar material didático após triagem de pertinência, anonimização, remoção de metadados e avaliação do risco de reidentificação. Originais sensíveis não devem ser publicados. Antes de usar qualquer orientação em processo real, confirme fonte oficial, vigência, fase, modalidade, contexto documental e competência do órgão ou profissional responsável.
