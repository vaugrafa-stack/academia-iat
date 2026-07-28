# Plano de evolução — Academia IAT Premium

Documento operacional para continuidade da execução. Os estados refletem o que
está comprovado em 27/07/2026, não o que foi apenas planejado.

Legenda: ⬜ pendente · 🟨 em execução ou aguardando prova · ✅ comprovado ·
⛔ bloqueado por validação externa.

## Estado de referência

### Fonte congelada

- POP: `POP ou Manual Hidreletricas IAT Julho de 2026 (Com APA, UCs, RTTA).docx`
- Origem local: fornecida fora do repositório e identificada exclusivamente pelo
  nome, tamanho e SHA-256 abaixo; nenhum caminho pessoal é versionado.
- SHA-256:
  `8ffa771546c244e194e6d7b41dd91d5ab3f56083e94c081e1e5c9a17f13f2c3c`
- Tamanho: `4.408.377 bytes`
- Versão operacional visível na capa: `1.7`
- Situação: minuta técnica pendente de validação humana e institucional.

O arquivo anterior, com outro tamanho e hash, não é fonte desta execução. A
comparação semântica registrou a retirada de duas ocorrências de glossário para
“IA — Inteligência Artificial”; o conteúdo substantivo sobre IA permanece onde
está presente no POP atual. Os 14 ativos visuais permaneceram idênticos.

### Medidas atuais do conteúdo

| Item | Medida atual | Situação |
|---|---:|---|
| Seções totais | 167 | 161 não navegacionais + 6 navegacionais |
| Tabelas | 66 | 46 quadros + 20 tabelas |
| Figuras do POP | 14 | Manifestadas e comparadas |
| Fluxogramas | 21 | Proposta, não material oficial |
| Ativos manifestados | 35 | POP + fluxogramas |
| Nós pesquisáveis do POP | 3.339 | Extração atual |
| Tópicos didáticos | 159 | Dois títulos não navegacionais são apenas cabeçalhos estruturais |
| Percursos recomendados | 4 | Essencial, Analista, PACUERA e Revisor; não bloqueiam conteúdo |
| Questões | 136 | 82/161 seções com cobertura direta; revisão psicométrica e editorial ainda necessária |
| Resumos em vídeo | 159 | Não devem ser chamados de videoaulas completas |
| Casos | 26 | Todos sintéticos; cinco incluem série histórica |
| Referências oficiais | 60 | 22 vínculos diretos + 38 índices oficiais + 0 sem mapeamento |

### Regra de honestidade do plano

Mudança implementada, mas ainda sem a bateria atual de build, testes e navegador,
fica 🟨. Nenhuma etapa recebe ✅ com base apenas em inspeção estática. Validação
humana e institucional não pode ser substituída por teste automatizado.

## Personas atendidas

1. iniciante;
2. servidor ou técnico em formação;
3. analista ambiental;
4. consultor;
5. empreendedor ou operador;
6. gestor ou instrutor;
7. especialista.

Cada etapa deve demonstrar valor para pelo menos uma persona e não prejudicar as
demais. Linguagem, profundidade e responsabilidade precisam permanecer
adequadas ao papel.

## Frentes de execução

### E0 — Auditoria e linha de base ✅

**Entregue**

- inspeção do repositório, produção e conceitos visuais;
- auditorias separadas de engenharia, UX/PWA e aprendizagem;
- identificação de riscos de certificação, validade de avaliação, mídia curta,
  laboratório superficial, acessibilidade, persistência e CI;
- prompt operacional e contrato do GOAL atualizados.

**Evidência exigida para manter ✅**

- relatórios versionados;
- lista de achados com severidade, estado e prova;
- nenhuma conclusão apresentada como validação institucional.

### E1 — Proveniência e integridade da fonte ✅

**Entregue**

- extração regenerada a partir do POP de hash `8ffa…2c3c`;
- nome, tamanho, data, hash, versão e contagens travados;
- 167/167 seções preservadas;
- 161/161 títulos não navegacionais rastreados;
- 159 tópicos com conteúdo próprio no percurso; os títulos 13.1 e 19.1 são cabeçalhos estruturais representados pelas subseções;
- seção 26.3 tratada como conteúdo substantivo;
- fidelidade textual normalizada sem divergência;
- 66 tabelas, 14 figuras e 21 fluxogramas controlados por manifesto.

**Critério de aceite contínuo**

- qualquer divergência de fonte ou contagem faz o gate falhar;
- regeneração idempotente;
- metadados exibidos ao usuário coincidem com o artefato;
- distinção visual entre fonte, interpretação e exemplo.

### E2 — Arquitetura e manutenção 🟨

**Já existe**

- dado derivado começou a ser separado;
- componentes auxiliares foram extraídos;
- laboratório e gerenciador offline ganharam módulos próprios.

**Ainda falta**

- retirar implementações legadas e não usadas;
- reduzir `main.jsx` a orquestração;
- separar conteúdo de lógica nos módulos grandes;
- lazy loading das áreas pesadas;
- eliminar arquivos e artefatos de desenvolvimento sem valor de runtime;
- documentar fronteiras e contratos de dados.

**Pronto quando**

- `main.jsx` abaixo de 25 kB ou justificativa arquitetural equivalente;
- cada domínio tem responsabilidade clara;
- não há componente legado duplicado;
- build mede e limita tamanho dos chunks;
- clone limpo reproduz build e testes.

### E3 — Confiança normativa e alegações institucionais 🟨

**Já existe**

- avisos de minuta técnica e conteúdo pendente de validação;
- registros pessoais de conclusão começaram a substituir linguagem de
  certificação.

**Ainda falta**

- inventário de todas as afirmações normativas sensíveis;
- URL direta, órgão, vigência, data de consulta e escopo por fonte;
- revisão de links genéricos ou frágeis;
- distinção entre norma vigente, histórica, revogada e transição;
- revisão humana registrada;
- política editorial para estatísticas e alegações.

**Pronto quando**

- matriz de alegação → fonte → situação → revisor completa;
- zero promessa institucional sem ato verificável;
- registro local nunca aparece como credencial.

### E4 — Formação do iniciante ao especialista 🟨

**Diagnóstico atual**

- cobertura do POP é forte;
- objetivos repetem poucos modelos;
- exemplos trabalhados estão concentrados nas aberturas de módulo;
- profundidade varia muito entre módulos;
- conclusão ainda não comprova competência.

**Ação**

- aplicar em cada aula: pré-requisito, objetivo observável, explicação, fonte,
  exemplo, erro frequente, prática, feedback e domínio;
- criar trilhas e pré-requisitos por nível e persona;
- adicionar revisão espaçada e retomada de erros;
- aumentar variações de caso nos módulos críticos;
- mapear objetivo → atividade → avaliação;
- testar compreensão com iniciantes e especialistas.

**Pronto quando**

- 159 tópicos didáticos passam pelo checklist editorial e didático;
- matriz de alinhamento está completa;
- piloto encontra e corrige lacunas;
- tempo é medido ou rotulado como estimativa;
- especialista exige caso aberto, fundamentação e rubrica humana.

### E5 — Laboratório autêntico 🟨

**Implementado, aguardando validação**

- documentos sintéticos marcados sem validade;
- evidências mínimas, notas analíticas e fundamentação extensa;
- rubrica separa decisão, evidência e raciocínio;
- revisão textual da decisão;
- ligação direta aula → cenário.

**Ainda falta**

- provar os fluxos no navegador e em mobile;
- revisar coerência técnica de todos os documentos sintéticos;
- ampliar conflito, ausência, divergência, suficiência e competência;
- evitar fatos repetidos ou entregues no enunciado;
- instituir revisão e versionamento de rubricas;
- validar casos com analistas do domínio.

**Pronto quando**

- todos os casos têm objetivo, evidências necessárias, distratores, rubrica,
  feedback e revisor;
- decisões incorretas explicam consequência e próximo passo;
- caso especialista é avaliado por pessoa competente.

### E6 — Avaliações e evidência de aprendizagem 🟨

**Implementado, aguardando validação**

- posição das respostas deixou de ser previsível;
- ordem pode ser embaralhada de modo determinístico;
- formulários A e B do diagnóstico usam conjuntos paralelos;
- progresso declara autoacompanhamento, não prova validada.

**Ainda falta**

- revisão editorial das 136 questões;
- retirar itens duplicados e distratores fracos;
- garantir cobertura equilibrada dos 159 tópicos com conteúdo próprio e rastrear os 2 cabeçalhos estruturais;
- testar diagnóstico completo no navegador;
- análise de item com amostra real;
- calibrar rubricas de respostas abertas;
- política de versão dos instrumentos.

**Pronto quando**

- padrão de letra não permite aprovação;
- cada questão mapeia objetivo e fonte;
- formulários paralelos têm dificuldade comparável;
- relatório não sugere ganho causal;
- piloto e revisão especializada registrados.

### E7 — Modo de consulta operacional 🟨

**Objetivo**

Permitir uso rápido por analistas, técnicos, consultores e empreendedores sem
obrigar uma sequência de curso.

**Ação**

- busca por linguagem natural, sigla, fase, modalidade e documento;
- filtros por persona, fase e assunto;
- resposta resumida com aprofundamento progressivo;
- atalhos para fluxos, checklists, quadros, figuras e normas;
- ligações bidirecionais entre fonte, aula, caso e mídia;
- fonte, versão e status sempre visíveis;
- favoritos, histórico local e pacote de consulta offline;
- testes de tarefas reais com tempo e taxa de sucesso.

**Pronto quando**

- maioria das tarefas críticas é resolvida em até três interações nos testes;
- busca tolera sinônimos e termos leigos;
- nenhuma resposta aparece sem fonte ou marcador de validação;
- consulta funciona em desktop, celular e offline dentro do escopo declarado.

### E8 — Mídia, imagens, áudio e animação 🟨

**Diagnóstico atual**

- 159 clipes totalizam cerca de 54,7 minutos;
- média aproximada de 20,7 segundos e todos têm menos de 30 segundos;
- são resumos, não videoaulas completas;
- transcrição consultável ainda não está integrada à experiência.

**Ação**

- renomear clipes como “resumo em vídeo”;
- criar inventário com duração, tamanho, origem, licença e objetivo;
- oferecer legenda revisada e transcrição pesquisável/baixável;
- produzir demonstrações longas apenas onde vídeo acrescenta valor;
- usar animações para fluxos, estados e relações espaciais;
- fornecer alternativa estática e respeitar movimento reduzido;
- criar áudio opcional somente com roteiro revisado;
- registrar proveniência de imagens e licenças.

**Pronto quando**

- cada mídia tem objetivo, classificação, transcrição, alternativa e origem;
- nenhuma fala truncada;
- controles acessíveis;
- pacote offline sobrevive a reinício e atualização;
- teste de compreensão demonstra valor didático.

### E9 — PWA e uso offline 🟨

**Implementado, aguardando prova de navegador**

- correção contra envenenamento do shell por navegação;
- status offline para conjuntos de URLs;
- pacotes determinísticos por módulo;
- interface com tamanho, progresso, verificação, remoção, quota e persistência;
- testes automatizados adicionais para navegação e resposta sob falha de cache.

**Ainda falta**

- disponibilizar o gerenciador também antes da criação de perfil ou em rota
  própria;
- testar instalação limpa;
- testar rede desligada após fechar e reabrir;
- testar mídia com Range/HTTP 206;
- testar quota baixa e falha parcial;
- testar atualização N→N+1 preservando pacotes;
- confirmar que caches de outros projetos nunca são removidos.

**Pronto quando**

- o usuário sabe exatamente o que está disponível offline;
- download, uso, reinício, atualização e remoção são demonstrados em navegador
  real;
- falhas são visíveis e recuperáveis.

### E10 — UX, mobile e acessibilidade 🟨

**Implementado, aguardando regressão**

- foco principal após navegação;
- título do documento por rota;
- modal de busca com rótulo, fechamento, armadilha e retorno de foco;
- abas de aula com navegação por setas;
- menu móvel retirado da ordem de foco quando fechado;
- controles adicionais ganharam nomes e estados.

**Ainda falta**

- rotular todos os campos da biblioteca e demais controles remanescentes;
- auditar alvos mínimos de toque;
- testar zoom a 200%;
- testar 320, 360, 390 e 430 px;
- testar leitor de tela;
- revisar contraste, anúncios dinâmicos e movimento reduzido;
- comparar painel, aula e laboratório com o conceito aceito;
- revisão editorial de português brasileiro.

**Pronto quando**

- WCAG 2.2 AA no escopo declarado;
- nenhuma armadilha de foco ou controle sem nome;
- tarefas completas por teclado e leitor de tela;
- ledger visual e capturas aceitas.

### E11 — Persistência, erros e CI 🟨

**Ação**

- schema, validação e migração do armazenamento local;
- recuperação de dado corrompido;
- tratamento de quota e indicação ao usuário;
- escrita resiliente e, quando adequado, desacoplada;
- Error Boundary e telas recuperáveis;
- dependências fixadas, `engines` e gerenciador declarados;
- CI com instalação congelada, proveniência, testes, build, acessibilidade, E2E
  e artefato;
- orçamento de performance e identificação do commit;
- política compatível de segurança para GitHub Pages.

**Pronto quando**

- perfil/progresso antigo migra sem perda silenciosa;
- falhas relevantes têm teste;
- pipeline limpa reproduz o release;
- nenhuma dependência crítica/alta conhecida.

### E12 — Casos reais, LGPD e governança de acervo 🟨

**Incidente confirmado em 28/07/2026**

- o artefato publicado anteriormente continha caminho local, metadados de
  autoria e contato pessoal em JSON/JavaScript;
- a nova árvore pública remove esses dados da interface, dos artefatos
  estruturados e da documentação;
- a extração agora deriva nomes dos metadados privados apenas em memória,
  substitui suas ocorrências por marcador neutro e publica a contagem de
  redações;
- `sanitize-public-data.mjs` impede a volta de `fullPath`, autoria, e-mail ou
  caminho de perfil nos dois JSONs servidos ao navegador;
- `audit:premium` verifica caminhos escapados, metadados pessoais, e-mails não
  genéricos, arquivos de ambiente e indícios de segredo sem reproduzir o valor
  sensível no log;
- o workflow executa o portão premium. A produção e o histórico público ainda
  precisam de remediação comprovada antes de esta etapa ficar verde.

**Ação**

- inventariar materiais autorizados sem copiá-los automaticamente;
- classificar finalidade, titularidade, sigilo e licença;
- criar versões sintéticas ou higienizadas;
- remover identificadores, contatos, assinaturas, metadados e combinações
  reidentificáveis;
- revisão dupla antes de publicação;
- manter original fora do repositório e do site;
- registrar transformação, data, responsável e retirada.

**Pronto quando**

- nenhum dado pessoal, segredo ou documento bruto aparece no Git ou deploy;
- cada exemplo tem origem e classificação;
- conteúdo “anonimizado” passou por revisão de reidentificação;
- exemplos sintéticos estão claramente marcados;
- procedimento de correção e retirada está documentado.

### E13 — Validação humana e institucional ⛔

Depende de participação externa e não pode ser fabricada pelo código.

**Necessário**

- revisão técnica por especialistas indicados;
- revisão jurídica/normativa;
- revisão editorial;
- piloto com representantes de todas as personas;
- teste com tecnologia assistiva;
- aprovação institucional de marca, linguagem e eventual certificação;
- aceite do protocolo LGPD e do acervo.

**Desbloqueia quando**

- responsáveis, datas, versão revisada, achados e decisões estiverem
  registrados.

### E14 — Release e produção 🟨

**Sequência**

1. congelar commit candidato;
2. executar todos os gates em clone limpo;
3. validar desktop, mobile, teclado, leitor de tela e offline;
4. comparar visualmente com o conceito;
5. revisar inventários e rastreabilidade;
6. aprovar ou registrar exceções;
7. publicar exatamente o artefato aprovado;
8. revalidar o URL público;
9. testar atualização e rollback.

**Pronto quando**

- relatório liga cada gate à sua prova;
- commit, artefato e produção são o mesmo release;
- console está limpo;
- offline funciona dentro do escopo prometido;
- pendências remanescentes estão explícitas;
- nenhuma linguagem apresenta a plataforma como oficial sem aprovação.

## Ciclo técnico mais recente

Esta seção atualiza os diagnósticos históricos acima. O que permanece pendente
não foi convertido em alegação de competência ou aprovação institucional.

**Aprendizagem e prática**

- quatro percursos recomendados organizam prioridade por persona sem ocultar o catálogo;
- todas as 159 aulas possuem checagem comentada, recuperação ativa escrita e autoauditoria;
- novas conclusões exigem questão correta, 80 caracteres significativos e dois critérios conferidos;
- o sistema declara que essas travas registram atividade, não qualidade, mérito ou competência;
- objetivos e critérios foram diversificados por nove perfis de domínio;
- os 7 fluxos agora têm orientação específica por etapa e decisão final ramificada;
- o Redator segue os 12 elementos do item 23.1 e mostra a consolidação diferente em 10 seções do Anexo B.

**Conteúdo, fontes e avaliação**

- 60/60 referências do POP apontam para fonte ou índice oficial: 22 diretas e 38 por índice;
- todos os 136 itens preservam citação literal verificada;
- a cobertura direta do banco é 82/161 seções, por isso a interface identifica perguntas de recuperação do módulo;
- a pista extrema de comprimento caiu de 19 para zero; 83/136 respostas corretas ainda são estritamente mais longas;
- os 26 casos têm rubrica explícita e cinco séries históricas, mas continuam pendentes de revisão especializada.

**Engenharia, resiliência e experiência**

- persistência versionada possui validação, exportação e recuperação de corrupção;
- 17 pacotes offline catalogam 159 tópicos e 528 arquivos de mídia (117,4 MiB);
- build, Service Worker, Range 206, upgrades, quota e isolamento de cache têm gates automatizados;
- o shell e o mapa foram recarregados com a rede efetivamente desligada em navegador real;
- desktop, modo claro/escuro e celular de 390 px foram percorridos sem overflow horizontal;
- práticas de aula, laboratório, fluxo, Redator, mapa, biblioteca e perfil foram exercitadas;
- link de salto, busca modal, abas, histórico e menu móvel têm retorno/contenção de foco;
- `prefers-reduced-motion` foi verificado em contexto de navegador dedicado;
- as dez áreas principais foram verificadas em 320, 360, 390 e 430 px, totalizando 40 combinações sem overflow documental ou erro de página;
- os únicos avisos de console observados localmente vieram de injeção do Kaspersky, não do código da aplicação.

**Limites remanescentes**

- não houve piloto com usuários, leitor de tela real, revisão psicométrica ou banca humana;
- os 159 clipes continuam sendo resumos curtos, não demonstrações completas;
- não existe validação jurídica, normativa ou institucional registrada;
- a cobertura direta de questões e a profundidade de casos ainda são desiguais;
- zoom de 200%, leitor de tela humano e quota baixa real permanecem pendentes;
- a arquitetura ainda concentra responsabilidade excessiva em `main.jsx`.

## Registro resumido

| Etapa | Estado | Próxima prova |
|---|---|---|
| E0 Auditoria e baseline | ✅ | Manter achados e evidências atualizados |
| E1 Proveniência | ✅ | Reexecutar gate no release candidato |
| E2 Arquitetura | 🟨 | Build/test e remoção de legado |
| E3 Confiança normativa | 🟨 | Matriz de alegações e revisão humana |
| E4 Formação | 🟨 | Checklist dos 159 tópicos e piloto |
| E5 Laboratório | 🟨 | Navegador, rubricas e revisão técnica |
| E6 Avaliações | 🟨 | Testes, revisão de banco e piloto |
| E7 Consulta operacional | 🟨 | Teste cronometrado com usuários e links bidirecionais restantes |
| E8 Mídia | 🟨 | Demonstrações aprofundadas e validação humana das transcrições |
| E9 PWA/offline | 🟨 | Reinício, quota, Range e atualização real |
| E10 UX/acessibilidade | 🟨 | Mobile, zoom, leitor e ledger visual |
| E11 Persistência/CI | 🟨 | Execução do pipeline em clone limpo e orçamento de performance |
| E12 LGPD/acervo | 🟨 | Revalidar o artefato público e formalizar protocolo de retirada |
| E13 Validação externa | ⛔ | Pessoas e aprovações responsáveis |
| E14 Release | 🟨 | Publicar o commit candidato e revalidar o GitHub Pages |

## Comandos mínimos do release candidato

Os scripts existentes podem ampliar esta lista, mas nunca reduzi-la:

```powershell
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

Depois dos comandos, são obrigatórios os testes em navegador real, offline,
atualização, acessibilidade e produção. “Build verde” não encerra o plano.

## Regra de encerramento

O projeto só pode ser chamado de Premium 10/10 quando todas as etapas técnicas
tiverem prova, as validações humanas obrigatórias estiverem registradas e a
produção tiver sido revalidada. Até lá, usar a formulação “em evolução para a
meta Premium 10/10”.
