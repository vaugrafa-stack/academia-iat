# Auditoria integrada de experiência, aprendizagem e arquitetura

Data: 09/08/2026
Produto: Academia IAT de Licenciamento Hidrelétrico
Baseline auditado: `c9dd645e91302940e19dcb5cbeebfe85fcc21d81`

## Objetivo

Avaliar e melhorar, sem remover o acervo existente, navegação, legibilidade,
beleza visual, didática, exercícios, acessibilidade, rastreabilidade técnica,
desempenho, PWA e qualidade de publicação.

## Diagnóstico consolidado

### Experiência e arquitetura da informação

- O primeiro acesso usava linguagem de continuidade antes de qualquer atividade.
- A página Hidrelétricas reunia dez temas em até 19 mil pixels no celular,
  sem acesso direto aos capítulos.
- O filtro da formação mantinha cabeçalhos vazios quando não havia resultado.
- O catálogo do mapa colocava 147 usinas no fluxo de Tab.
- Parte dos controles tinha área útil inferior ao piso interno de 44 por 44 px.
- A navegação inferior agrupava destinos, mas abria uma tela fixa sem mostrar
  as alternativas da categoria.

### Aprendizagem

- Quantidade de conteúdo e conclusão de leitura não equivalem a demonstração
  de competência.
- A formação precisava de portas de entrada por tarefa para quem ainda não
  entende a rotina do setor.
- O diagnóstico fixo de três itens por módulo era longo para orientação inicial.
- A autoavaliação registrava acerto e erro, mas não distinguia dúvida de
  convicção equivocada.
- O banco de questões ainda precisa de evolução editorial posterior com
  dificuldade, nível cognitivo, objetivo, erro que invalida a resposta, motivo dos distratores,
  versão e responsável pela análise.

### Conteúdo técnico e normativo

- Um link oficial localizado não demonstra, sozinho, vigência, interpretação
  nem aplicação ao caso.
- Os três eixos decisivos devem permanecer separados: licenciamento ambiental
  IAT, regulação setorial ANEEL e recursos hídricos ANA ou gestor estadual.
- A REN ANEEL 875/2020 consolidada, com redação da REN 1.070/2023, enquadra
  PCH pela faixa de potência. A página geral Outorgas ainda menciona 13 km²;
  essa divergência editorial deve permanecer visível e não pode prevalecer
  sobre a conferência do ato consolidado e de sua aplicação ao caso.
- Materiais de treinamento e documentos de projeto não substituem atos oficiais,
  documentos do processo nem análise institucional aplicável.

### Arquitetura e desempenho

- O build produzia 57 pedaços JavaScript e 43 requisições JS na primeira tela.
- A rota da aula era importada de forma síncrona, apesar de ser uma das maiores
  superfícies do produto.
- Três camadas de animação de entrada faziam rotas lazy parecerem vazias.
- O carregamento inicial ainda aguarda o POP e bancos auxiliares; a divisão por
  índices leves continua como evolução futura de maior porte.

## Melhorias implementadas neste ciclo

1. Estado inicial condicional: `Comece por aqui` e `Iniciar orientação` antes
   da primeira atividade; continuidade somente depois de progresso real.
2. Quatro percursos por tarefa na formação: primeira semana, análise de
   processo, território e fiscalização, e elaboração ou revisão de estudos.
3. Estado de busca sem resultado, contador filtrado e ação para limpar filtro.
4. Navegação local da página Hidrelétricas com onze destinos, progresso de
   leitura, teclado, foco, responsividade e impressão preservada.
5. Catálogo do mapa com roving tabindex e navegação por setas, Home, End,
   Page Up e Page Down; apenas uma usina por vez permanece no fluxo de Tab.
6. Alvos de toque recorrentes com piso de 44 px e formulários móveis com 16 px.
7. Diagnóstico rápido ou completo, com tamanho travado na reaplicação.
8. Confiança baixa, média ou alta antes de confirmar respostas; erros com alta
   confiança recebem prioridade explícita de revisão.
9. Estado normativo renomeado para distinguir fonte primária localizada de
   conteúdo, vigência e aplicação ainda pendentes de análise institucional.
10. Tela de aula carregada sob demanda, objetivo e estado de vídeo extraídos
    para módulos pequenos compartilhados.
11. React e ícones agrupados em chunks estáveis; build reduzido para 32 pedaços
    JavaScript, dentro do novo contrato arquitetural.
12. Uma única transição curta de rota, sem esconder todos os blocos filhos.
13. Cobertura de rotas ampliada no E2E e correção do contrato de SHA publicado.
14. Navegação inferior móvel por categorias: Aprender, Praticar e Consultar
    agora exibem todos os destinos antes de mudar de tela, com foco inicial,
    Escape, restauração de foco e fechamento por clique externo.
15. Contraste das escolhas diagnósticas no tema escuro corrigido e ações em
    vídeo, laboratório, fluxogramas, suporte e fontes ajustadas ao alvo de 44 px.
16. Atalhos de Hidrelétricas recalculados pelo cabeçalho fixo, sem salto de
    layout, com regressão Playwright em desktop e quatro larguras móveis.
17. Critério setorial de PCH corrigido pela redação consolidada da ANEEL, com
    a divergência da página-resumo registrada em vez de ocultada.

## Evidências finais desta rodada

- 56 arquivos de teste e 468 testes aprovados, além de todos os portões
  editoriais, técnicos, de segurança, mídia, proveniência, referências, PWA,
  tipografia, rubricas e smoke test.
- Build do GitHub Pages aprovado em 32 pedaços JavaScript: 696,0 KiB brutos e
  232,0 KiB gzip; CSS com 227,7 KiB brutos e 43,1 KiB gzip, ainda dentro do orçamento.
- 19 cenários Playwright do artefato aprovados em desktop e larguras 320, 360,
  390 e 430 px; um cenário móvel foi corretamente ignorado no desktop.
- Um cenário PWA aprovado, incluindo instalação do service worker, suporte
  offline e atualização com consentimento.
- Onze rotas principais inspecionadas em 1440 e 390 px: nenhum overflow
  horizontal, erro de página ou erro de console. Links corridos em legendas e
  parágrafos permanecem compactos; controles recorrentes respeitam 44 px.
- Revisão visual de Início, Hidrelétricas, Formação, Avaliações e navegação
  móvel, com contraste final conferido no tema escuro.

## Critérios de aceite

- Todos os testes unitários, gates editoriais, segurança, proveniência, mídia,
  referências, CSS, tipografia, PWA, smoke test e build devem passar.
- Rotas principais e aulas devem abrir em desktop e larguras móveis sem erro de
  console, overlay, resposta HTTP local 4xx ou 5xx e overflow horizontal.
- Todo controle recorrente, exceto link inline em texto, deve possuir área útil
  de pelo menos 44 por 44 px.
- A página Hidrelétricas deve permitir chegar a qualquer capítulo em uma ação.
- O primeiro acesso não pode usar linguagem de retomada.
- A reaplicação diagnóstica deve conservar os itens-âncora e o tamanho da
  primeira amostra.
- A publicação deve reutilizar exatamente o artefato aprovado pela qualidade,
  e o site deve expor o SHA integral do commit publicado.

## Evoluções posteriores, sem promessa indevida

- Enriquecer os 213 itens com metadados cognitivos e feedback por distrator.
- Criar mais decisões autênticas e produtos integradores, com rubricas
  analíticas vinculadas aos objetivos.
- Dividir dados iniciais em índice leve e corpos carregados por rota.
- Modularizar as folhas de estilo para reduzir o CSS inicial.
- Executar ciclos formais de análise técnica, editorial e psicométrica sobre as
  referências e atividades antes de qualquer uso institucional decisório.
