# Academia IAT — Licenciamento Hidrelétrico

Plataforma de aprendizagem, consulta técnica e prática aplicada baseada no `POP-DLE-HID-001`, versão 1.7, julho de 2026, nos fluxogramas do projeto e nas fontes documentais vinculadas ao repositório.

A plataforma é voltada à formação de analistas, técnicos, revisores, gestores, empreendedores, consultorias ambientais e demais pessoas que precisem compreender o licenciamento ambiental de empreendimentos hidrelétricos no Paraná.

## Executar localmente

Na pasta principal, dê duplo clique em `Abrir Academia IAT.cmd`.

Ou execute manualmente:

```powershell
cd "CAMINHO\PARA\academia-iat"
pnpm install
pnpm dev
```

Abra `http://127.0.0.1:5173`.

Para criar o pacote de produção:

```powershell
pnpm build
```

## Estado atual

Conforme o plano de evolução vigente, a plataforma possui:

- 17 módulos;
- 161 aulas;
- 159 videoaulas;
- 136 questões;
- 26 casos práticos;
- mapa interativo do Paraná com dados públicos;
- redator orientado de Informação Técnica;
- diagnóstico de entrada e saída;
- fluxogramas interativos;
- biblioteca pesquisável;
- perfis locais, favoritos, anotações, progresso e certificados pessoais;
- funcionamento offline com Service Worker;
- suporte a teclado, foco visível, nomes acessíveis e `prefers-reduced-motion`.

Os quantitativos e estados de execução devem ser conferidos em `PLANO_EVOLUCAO.md`, que é a fonte operacional para continuidade do desenvolvimento.

## Validação

```powershell
pnpm test
pnpm build
pnpm audit:premium
```

Os portões automatizados verificam testes unitários, proveniência, referências, rubricas, questões, videoaulas, cobertura das aulas, fluxo funcional, artefato de produção, governança mínima, caminhos pessoais e indícios simples de segredos publicados.

A aprovação automática não substitui a validação renderizada em navegador, a inspeção responsiva, o teste de interação, a auditoria de acessibilidade nem a revisão técnica do conteúdo.

## Arquivos principais

- `AGENTS.md`: goal permanente, limites, prioridades e ciclo obrigatório do Codex;
- `PLANO_EVOLUCAO.md`: diagnóstico, etapas, critérios de pronto e registro de execução;
- `LEARNING_DESIGN.md`: desenho pedagógico integral;
- `src/main.jsx`: composição principal e telas ainda em processo de extração;
- `src/derivados.js`: dados derivados do POP com dependências explícitas;
- `src/courseData.js`: módulos, questões, cenários e fluxos;
- `src/data/pop-content.json`: conteúdo integral estruturado do POP;
- `src/data/flowcharts-content.json`: fluxogramas estruturados;
- `public/source-assets`: imagens extraídas das fontes documentais;
- `public/media`: vídeos, legendas, animações, pôsteres e ilustrações;
- `tools/smoke-test.mjs`: teste funcional das áreas principais;
- `tools/audit-premium.mjs`: portão de governança, privacidade e exposição acidental;
- `tools/build_training_videos.py`: geração reproduzível das mídias didáticas.

## Privacidade e uso responsável

A plataforma é material de capacitação e apoio operacional. Não substitui norma vigente, Termo de Referência aplicável, análise do caso concreto, decisão administrativa, manifestação jurídica, outorga, ato da ANEEL, manifestação de órgão interveniente ou validação institucional.

Documentos reais somente podem ser transformados em conteúdo didático após triagem de pertinência, anonimização, remoção de metadados e avaliação de risco de reidentificação. Originais sensíveis não devem ser publicados no repositório público.
