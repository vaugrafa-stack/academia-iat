# Academia IAT - Licenciamento Hidrelétrico

Plataforma completa de aprendizagem baseada no `POP-DLE-HID-001`, versão 1.2, julho de 2026, e no documento de proposta de fluxogramas.

## Executar

Na pasta principal, dê duplo clique em `Abrir Academia IAT.cmd`.

Ou execute manualmente:

```powershell
cd "C:\Users\rafae\OneDrive\Documentos\New project\apps\iat_training"
pnpm install
pnpm dev
```

Abra `http://127.0.0.1:5173`.

Para criar o pacote de produção:

```powershell
pnpm build
```

## O que funciona

- 15 módulos vinculados às 125 seções e subtópicos estruturados do POP;
- aulas com resumo guiado, texto-fonte integral, tabelas, figuras e anotações;
- 3 microvídeos MP4 reais, com pôster e legendas WebVTT;
- 3 animações SVG complementares;
- 7 fluxogramas interativos e 21 fluxogramas-fonte comparáveis;
- 7 cenários de laboratório: CP, LAS, LP, LI, LO, RLO e PACUERA;
- avaliações comentadas gerais e por módulo;
- biblioteca pesquisável com 2.690 parágrafos, 61 quadros/tabelas e 33 figuras/fluxos;
- favoritos, caderno pessoal, progresso, resultados e retomada persistidos em `localStorage`;
- layout responsivo e suporte a `prefers-reduced-motion`.

## Validação

```powershell
pnpm test
pnpm build
```

O teste funcional renderiza a aplicação em DOM e percorre painel, formação, aula, vídeo, fluxogramas, laboratório, avaliações e biblioteca.

A extração documental foi validada em 16 verificações: 61 tabelas, 2.690 parágrafos, 12 figuras do POP, 21 fluxogramas e zero divergências textuais normalizadas.

## Arquivos principais

- `src/main.jsx`: aplicação e experiências interativas;
- `src/courseData.js`: módulos, questões, cenários e fluxos;
- `src/data/pop-content.json`: conteúdo integral estruturado do POP;
- `src/data/flowcharts-content.json`: 21 fluxogramas estruturados;
- `public/source-assets`: 33 imagens extraídas dos documentos;
- `public/media`: vídeos, legendas, animações, pôsteres e ilustração;
- `LEARNING_DESIGN.md`: desenho pedagógico de referência;
- `tools/smoke-test.mjs`: teste funcional;
- `tools/build_training_videos.py`: gerador reproduzível dos microvídeos.

## Uso responsável

A plataforma é material de capacitação e apoio operacional. Não substitui a norma vigente, o Termo de Referência aplicável, a análise do caso concreto, a decisão administrativa nem validações jurídica e institucional.
