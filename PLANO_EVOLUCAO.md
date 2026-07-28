# Plano de evolução — Academia IAT Premium

Documento operacional para continuidade da execução. Os estados refletem o que
está comprovado em 28/07/2026, não o que foi apenas planejado.

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
- Situação: minuta técnica pendente de validação técnica e institucional.

O arquivo anterior, com outro tamanho e hash, não é fonte desta execução. A
comparação semântica entre as fontes foi registrada sem alterar o documento
congelado. Por orientação editorial expressa do responsável, a apresentação
pública aplica uma camada derivada e auditável que omite um tema específico,
enquanto a extração fiel permanece separada para rastreabilidade. Os 14 ativos
visuais da fonte permaneceram idênticos.

### Medidas atuais do conteúdo

| Item | Medida atual | Situação |
|---|---:|---|
| Seções totais | 167 | 161 não navegacionais + 6 navegacionais |
| Tabelas | 66 | 46 quadros + 20 tabelas |
| Figuras do POP | 14 | Manifestadas e comparadas |
| Fluxogramas | 21 | Proposta, não material oficial |
| Ativos manifestados | 35 | POP + fluxogramas |
| Nós pesquisáveis da fonte | 3.339 | Extração fiel preservada para auditoria |
| Nós pesquisáveis públicos | 3.333 | Edição de treinamento derivada e auditável |
| Tópicos didáticos | 159 | Dois títulos não navegacionais são apenas cabeçalhos estruturais |
| Percursos recomendados | 4 | Essencial, Analista, PACUERA e Revisor; não bloqueiam conteúdo |
| Questões | 136 | 82/161 seções com cobertura direta; revisão psicométrica e editorial ainda necessária |
| Resumos em vídeo | 159 | Não devem ser chamados de videoaulas completas |
| Casos | 26 | Todos sintéticos; cinco incluem série histórica |
| Referências oficiais | 60 | 22 vínculos diretos + 38 índices oficiais + 0 sem mapeamento |

### Regra de honestidade do plano

Mudança implementada, mas ainda sem a bateria atual de build, testes e navegador,
fica 🟨. Nenhuma etapa recebe ✅ com base apenas em inspeção estática. Validação
técnica e institucional não pode ser substituída por teste automatizado.

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
- especialista exige caso aberto, fundamentação e rubrica técnica.

### E5 — Laboratório autêntico 🟨

**Implementado, aguardando validação**

- documentos sintéticos marcados sem validade;
- evidências mínimas, notas analíticas e fundamentação extensa;
- rubrica separa decisão, evidência e raciocínio;
- revisão textual da decisão;
- ligação direta aula → cenário;
- as 130 decisões dos 26 cenários possuem vínculos explícitos para trechos
  literais do POP e para as evidências sintéticas efetivamente usadas;
- dez decisões com dependência interpretativa permanecem identificadas para
  conferência técnica, sem apresentar inferência do caso como regra da fonte.

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

### E13 — Validação técnica e institucional ⛔

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

**Reprodutibilidade local revalidada em 28/07/2026**

- um worktree limpo do commit publicado falhou antes do Vite no Windows porque
  `sanitize-public-data.mjs --check` comparava os bytes dos JSONs com uma
  serialização LF, enquanto o checkout materializava CRLF;
- o gate passou a comparar o documento sanitizado semanticamente e continua
  falhando quando uma chave bloqueada ou redação pessoal seria removida;
- os dois artefatos de fonte ganharam `eol=lf` explícito e regressões cobrem
  independência de formatação, remoção de metadados e redação de nome/e-mail;
- essa correção remove uma diferença de plataforma do clone limpo; os demais
  gates ainda precisam ser reexecutados antes de promover o ciclo.

**Correções de aprendizagem e acessibilidade em 28/07/2026**

- o debriefing do laboratório deixou de converter a chave interna de trilha em
  rótulo de módulo; os 26 cenários agora resolvem código e título pelo registro
  canônico, incluindo as sete regressões entre M12 e M16;
- cada cenário oferece uma aula real do próprio módulo para retomada e explica
  que esse destino é uma remediação geral, não uma fonte específica para cada
  decisão;
- testes parametrizados conferem os 26 destinos, a existência da aula e sua
  pertença ao módulo, sem transformar o caso sintético em alegação normativa;
- o campo “Seu caderno” ganhou rótulo visível programaticamente associado, e um
  contrato automatizado impede a volta do `textarea` sem nome acessível;
- continuam pendentes os vínculos estruturados por decisão entre caso, aula e
  trecho do POP, além da validação com leitor de tela e usuários reais.

**Primeira redução arquitetural revalidada em 28/07/2026**

- o domínio de fluxogramas saiu de `main.jsx` para um módulo carregado sob
  demanda, recebendo `flowData` já validado pelo bootstrap sem novo fetch;
- `useMediaQuery` virou utilitário compartilhado, sem duplicar a lógica entre o
  shell e a tela extraída;
- `main.jsx` caiu de 170.492 para 149.412 bytes normalizados, e um contrato
  incremental de 155.000 bytes impede a regressão imediata;
- o build gerou chunk dedicado de 10.679 bytes (3.871 bytes gzip); smoke,
  referências e comportamento completo dos sete fluxos permaneceram verdes;
- a meta arquitetural final de um orquestrador abaixo de 25 kB permanece aberta
  e deve avançar por domínios independentes, sem reescrever a aplicação inteira.

**Orçamento de desempenho criado em 28/07/2026**

- o gate do artefato manteve as dez marcas funcionais e o piso contra corte de
  árvore, mas passou também a limitar entrada, maior chunk, JS total, CSS,
  maior ativo textual e o novo chunk de fluxogramas em bytes brutos e gzip;
- nomes com hash são descobertos a partir do HTML e do papel do arquivo, sem
  congelar identificadores gerados pelo Vite;
- cinco regressões autocontidas cobrem limites exatos, excesso de um byte,
  hashes arbitrários, soma de múltiplos arquivos, gzip determinístico, marcas,
  piso e isolamento do chunk de fluxos;
- o build atual permanece abaixo dos tetos, com alertas antecipados quando uma
  métrica ultrapassa 90% do orçamento;
- a medição do grafo inicial completo e os testes em rede/dispositivo de menor
  capacidade continuam como evolução posterior.

**Recuperação e persistência revalidadas em 28/07/2026**

- o bootstrap passou a ter contrato testável: sucesso monta o aplicativo dentro
  do limite de erro, e falha de importação substitui o splash por diagnóstico
  acessível e ação de nova tentativa;
- mensagens internas deixaram de ser despejadas no console ou na tela: os
  registros de inicialização e renderização expõem somente códigos públicos e a
  existência da pilha de componentes;
- a migração de perfil legado agora valida e preserva a origem; conteúdo
  inválido ou storage indisponível não cria silenciosamente um perfil vazio;
- o estado de progresso saiu de `main.jsx` para uma camada testável que bloqueia
  sobrescrita após corrupção, preserva o payload para download, classifica quota
  e indisponibilidade e só reinicia após confirmação explícita;
- essa segunda extração reduziu o orquestrador a 145.660 bytes normalizados,
  mantendo o teto incremental de 155.000 bytes;
- a falha ao resolver o perfil ativo não volta para uma chave global legada,
  evitando que sessões diferentes escrevam sobre o mesmo registro;
- 31 regressões focadas cobrem bootstrap, limite de erro, migração, JSON
  inválido, tipos incompatíveis, quota, chave indisponível e estado interno
  rejeitado; reinício real do navegador com armazenamento persistente ainda
  precisa ser comprovado.

**Menu móvel e isolamento modal revalidados em 28/07/2026**

- o drawer móvel ganhou ação de fechamento própria, visível, rotulada e com
  alvo mínimo de 44 × 44 px, sem depender do botão encoberto na barra superior;
- barra superior e conteúdo principal ficam inertes enquanto o drawer modal
  está aberto, mantendo o foco somente na superfície ativa;
- Escape, botão interno e cortina usam a mesma rotina de fechamento, e o foco
  retorna ao acionador após a atualização do React;
- seis contratos focados de acessibilidade, a suíte conjunta com bootstrap, o
  build e `git diff --check` passaram;
- Escape e o botão interno foram reconferidos no artefato candidato em
  navegador móvel; a cortina foi validada pelo mesmo manipulador e por ativação
  de teclado, com retorno do foco ao acionador;
- o artefato permaneceu sem overflow horizontal a 380 px.

**Camada editorial da apresentação pública implementada em 28/07/2026**

- a extração fiel do POP permanece congelada e separada como evidência de
  auditoria; a aplicação deixou de carregar diretamente esse arquivo;
- `pop-public-content.json` passou a ser gerado deterministicamente a partir da
  fonte, com a exceção editorial expressamente solicitada e metadados que
  registram duas linhas omitidas e uma seção renomeada;
- aulas, busca, exercícios, laboratório, Redator, legendas, pacotes offline e
  gerador de vídeos consomem somente a apresentação pública;
- a capa e a abertura sonora da seção afetada foram substituídas; o áudio
  permanece silencioso até o início da primeira fala permitida e o MP4 foi
  decodificado integralmente após a alteração;
- um gate varre fonte, arquivos públicos, mapas, manifesto e artefato compilado,
  além de travar os hashes das mídias substituídas; ele impede a reintrodução
  das formulações removidas e a inclusão da extração bruta no `dist`;
- a varredura final cobriu 231 arquivos de origem, 456 arquivos no artefato,
  180 legendas, 180 vídeos e 225 imagens sem ocorrência pública proibida;
- esta é uma exceção editorial solicitada pelo responsável, não uma alteração
  retroativa do documento-fonte nem uma alegação de cobertura literal integral.

**Rastreabilidade e segurança didática do laboratório revalidadas em 28/07/2026**

- as 130 decisões dos 26 cenários possuem vínculo estruturado com 180 trechos
  literais da minuta POP v1.7 e com as aulas correspondentes;
- cada debriefing separa fundamento da fonte, fatos sintéticos e interpretação
  didática, exibindo o trecho citado e o destino exato para revisão;
- dez conclusões frágeis foram corrigidas para não presumir enquadramento,
  tempestividade, regularidade, continuidade, cumprimento ou suficiência sem os
  documentos e dados necessários;
- a rubrica passou a rejeitar respostas genéricas e mantém cobertura integral
  de seus próprios modelos nos 26 casos;
- uma corrida entre a restauração do progresso e a primeira resposta foi
  eliminada; o smoke test comprova avanço imediato da decisão;
- um caso completo foi executado a 380 px no artefato candidato, com cinco
  decisões, duas evidências anotadas, fundamentação, debriefing e citação do POP.

**Portões finais do lote revalidados em 28/07/2026**

- 28 arquivos de teste e 157 testes automatizados passaram neste lote
  publicável;
- 136/136 questões mantêm fonte literal verificada, e 159/159 aulas possuem
  mídia, legenda e manifesto consistentes;
- `pnpm test`, `pnpm build`, `pnpm audit:premium` e `git diff --check` passaram;
- o build preservou as dez áreas funcionais, 31 chunks JavaScript e todos os
  limites obrigatórios de bundle; os alertas acima de 90% permanecem como sinal
  antecipado de otimização, sem ultrapassar o orçamento;
- a publicação e a revalidação do GitHub Pages continuam sendo a prova restante
  deste lote.

## Registro resumido

| Etapa | Estado | Próxima prova |
|---|---|---|
| E0 Auditoria e baseline | ✅ | Manter achados e evidências atualizados |
| E1 Proveniência | ✅ | Reexecutar gate no release candidato |
| E2 Arquitetura | 🟨 | Build/test e remoção de legado |
| E3 Confiança normativa | 🟨 | Matriz de alegações e conferência técnica |
| E4 Formação | 🟨 | Checklist dos 159 tópicos e piloto |
| E5 Laboratório | 🟨 | Navegador, rubricas e revisão técnica |
| E6 Avaliações | 🟨 | Testes, revisão de banco e piloto |
| E7 Consulta operacional | 🟨 | Teste cronometrado com usuários e links bidirecionais restantes |
| E8 Mídia | 🟨 | Demonstrações aprofundadas e validação técnica das transcrições |
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
