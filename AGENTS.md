# Goal permanente do Codex — Academia IAT

## Missão

Transformar e manter a Academia IAT como uma plataforma premium de aprendizagem, consulta técnica e prática aplicada sobre licenciamento ambiental de empreendimentos hidrelétricos no Paraná.

A plataforma deve ser útil, confiável e didática para analistas, técnicos, revisores e gestores do IAT, bem como para empreendedores, consultorias ambientais, responsáveis técnicos e demais pessoas que precisem compreender o fluxo de análise. O produto deve ensinar a raciocinar, localizar fontes, comparar documentos, identificar inconsistências, classificar pendências, justificar consequências técnicas e redigir encaminhamentos proporcionais.

Não perseguir aparência de “nota 10” por quantidade de efeitos visuais. O padrão premium será demonstrado por rigor técnico, didática, clareza, acessibilidade, desempenho, confiabilidade, rastreabilidade, privacidade e acabamento visual consistente.

## Fonte de verdade e ordem de leitura

Ao iniciar ou retomar o trabalho:

1. Ler este arquivo integralmente.
2. Ler `PLANO_EVOLUCAO.md`, `README.md`, `LEARNING_DESIGN.md`, `package.json` e os arquivos de orientação existentes em `.claude`.
3. Ler o arquivo de texto anexado pelo usuário, quando disponível no ambiente do Codex.
4. Inspecionar `git status`, histórico recente, branches, commits e alterações não publicadas antes de editar.
5. Inventariar a estrutura do repositório, os testes, os geradores, as fontes documentais, as mídias, os dados, os fluxogramas, os laboratórios e os artefatos de deploy.
6. Quando houver acesso às pastas locais indicadas pelo usuário, tratá-las inicialmente como acervo de leitura. Classificar os arquivos por tipo, pertinência, atualidade, autoria, sensibilidade e possibilidade de uso didático antes de reutilizar qualquer conteúdo.
7. Nunca publicar diretamente documentos reais, imagens, mapas, metadados ou trechos que possam identificar pessoa física, proprietário, endereço, assinatura, contato, CPF, RG, matrícula, dado bancário, segredo comercial, informação restrita ou dado processual não destinado à divulgação.

A prioridade das fontes é:

1. norma oficial vigente e respectiva regra de transição;
2. Termo de Referência oficial aplicável;
3. POP e manuais internos do projeto, observada a versão e a natureza de minuta;
4. documentos técnicos e casos, após anonimização e validação;
5. conhecimento geral, apenas quando claramente separado das fontes do projeto.

Quando não houver suporte documental suficiente, registrar a limitação. Não preencher lacunas com afirmações plausíveis.

## Regras técnicas obrigatórias

A plataforma deve preservar, ensinar e aplicar o método:

`documento apresentado → fase ou modalidade → tipologia → data do protocolo → norma aplicável → suficiência ou inconsistência → consequência técnica → encaminhamento`

Toda experiência didática que trate de análise documental deve diferenciar:

- documento apresentado e documento suficiente;
- adequação da modalidade e suficiência para deferimento;
- status declarado pelo empreendedor e status validado pelo órgão competente;
- Memorial Descritivo, PCA, RAS, RDPA, EIA, RIMA, PBA, RCA, RCE, outorga, ART e manifestação de interveniente;
- pendência sanável, pendência impeditiva e obrigação continuada;
- competência ambiental, competência hídrica, competência setorial e manifestação jurídica.

Usar as classificações documentais do projeto:

- Apresenta;
- Não apresenta;
- Inconsistente;
- Insuficiente;
- Vencido;
- Pendente de validação;
- Não se aplica.

Não atribuir escala ou rótulo ordinal a achados e pendências. Registrar diretamente a consequência decisória, o momento de saneamento, a evidência faltante e o encaminhamento aplicável.

Não criar mecanismo que aparente decidir juridicamente ou tecnicamente aquilo que depende de análise humana, do caso concreto, do IAT, da área especializada, da autoridade competente ou de órgão interveniente.

## Públicos e experiências principais

A evolução deve atender, sem misturar responsabilidades, pelo menos estes perfis:

1. Analista iniciante, que precisa aprender o fluxo e evitar erros básicos.
2. Analista experiente ou revisor, que precisa localizar fundamento, comparar versões, auditar coerência e revisar produtos técnicos.
3. Empreendedor ou consultoria, que precisa compreender documentos, fases, critérios de suficiência e erros recorrentes, sem receber promessa de deferimento.
4. Técnico de área temática, que precisa consultar interfaces com recursos hídricos, cartografia, APP, flora, fauna, patrimônio cultural, unidades de conservação, sistemas associados e segurança de barragens.
5. Gestor, que precisa acompanhar cobertura, atualização, riscos, lacunas e qualidade do acervo.

Priorizar experiências de alto valor:

- trilhas orientadas por função e diagnóstico;
- busca global confiável, com contexto, fonte, versão e data;
- aulas curtas ligadas a casos e produtos reais de aprendizagem;
- laboratórios com evidências, decisão, justificativa, consequência e encaminhamento;
- redator de Informação Técnica com rubrica, autoavaliação e exportação para avaliação humana;
- fluxogramas interativos e comparáveis;
- mapa do Paraná com dados públicos, limites metodológicos claros e exercícios de enquadramento;
- biblioteca de quadros, tabelas, figuras, glossário, normas e referências;
- modo offline explícito e verificável;
- atualização normativa rastreável;
- casos anonimizados e reutilizáveis;
- relatórios de cobertura e consistência do conteúdo.

## Qualidade visual e interação

Preservar a identidade existente e evoluí-la como um sistema de produto, não como coleção de páginas isoladas.

Regras:

- aparência institucional, contemporânea, limpa e legível;
- hierarquia tipográfica e espaçamento consistentes;
- componentes reutilizáveis e estados completos;
- animações apenas quando explicarem fluxo, mudança de estado, relação espacial ou progresso;
- respeito a `prefers-reduced-motion`;
- sem excesso de cartões, brilhos, gradientes, selos, métricas fictícias ou ornamentos sem função;
- controles reais, com feedback e estado persistido quando pertinente;
- funcionamento em desktop, notebook e celular;
- nenhum conteúdo primário cortado, ilegível ou dependente de hover;
- contraste, foco, teclado, nomes acessíveis, mensagens de estado e ordem de leitura compatíveis com WCAG 2.2 AA.

Antes de uma reformulação visual ampla, produzir conceito completo e inventário do sistema visual. Não alterar a identidade em partes desconectadas.

## Arquitetura, desempenho e manutenção

Continuar a redução do acoplamento de `src/main.jsx` sem cortes por regex ou manipulação textual frágil.

Regras de engenharia:

- componentes pequenos, com dependências explícitas;
- dados derivados fora dos componentes;
- conteúdo e lógica separados quando isso reduzir risco de regressão;
- importação direta e carregamento diferido de superfícies pesadas quando houver ganho mensurável;
- estado local versionado e compatível com migração;
- nenhuma coleta remota de dados pessoais sem arquitetura, finalidade, base legal, transparência e aprovação específicas;
- funcionamento offline preservado;
- dependências novas somente quando o benefício superar peso, risco, manutenção e impacto no modo offline;
- sem segredos, chaves, tokens ou credenciais no repositório;
- sem caminhos absolutos de computador pessoal em documentação pública;
- cada mudança deve ser pequena o suficiente para ser compreendida, testada e revertida.

## LGPD, segurança e uso do acervo local

A autorização do usuário para acessar o computador não elimina os deveres de minimização, finalidade, segurança e controle de publicação.

Antes de usar documento real em aula, laboratório, vídeo, imagem, áudio, mapa ou exemplo:

1. identificar finalidade pedagógica;
2. verificar se existe fonte pública equivalente;
3. remover ou substituir dados pessoais e identificadores desnecessários;
4. remover metadados e propriedades ocultas;
5. substituir nomes, CNPJs, protocolos, coordenadas, matrículas, assinaturas e contatos quando não forem essenciais;
6. evitar combinação de dados que permita reidentificação;
7. registrar a origem e o processo de anonimização;
8. manter o original fora do repositório público;
9. criar versão didática sintética quando a anonimização não for segura.

Não criar conta externa, contratar serviço, realizar pagamento, publicar acervo, compartilhar credencial ou enviar documentos a terceiro sem necessidade concreta e autorização explícita para aquela ação específica.

## Ciclo obrigatório de execução

Executar em ciclos verticais, um resultado verificável por vez:

1. Auditar o estado atual com evidência.
2. Atualizar o diagnóstico e o plano antes de codificar quando a premissa tiver mudado.
3. Escolher a melhoria de maior valor e risco controlável.
4. Definir problema, público afetado, comportamento esperado e critério de pronto.
5. Implementar a menor solução completa, sem protótipo visual inerte.
6. Executar `pnpm test`, `pnpm build` e `pnpm audit:premium`.
7. Validar a aplicação renderizada em desktop e celular, incluindo ao menos um fluxo principal.
8. Verificar teclado, foco, nomes acessíveis, console, estados vazios, erro, carregamento, offline e atualização, conforme pertinência.
9. Atualizar `PLANO_EVOLUCAO.md`, documentação e evidências no mesmo commit.
10. Fazer um commit por etapa, explicando problema, decisão, evidência e limitação.
11. Continuar para a próxima etapa somente com os portões verdes ou com bloqueio documentado.

Não declarar concluída uma etapa apenas porque o build passou. Build, teste estrutural, teste de interação e inspeção visual são evidências distintas.

## Ordem inicial de continuidade

Respeitar o diagnóstico vigente de `PLANO_EVOLUCAO.md`, revalidando as premissas antes de executar:

1. concluir a extração gradual das telas restantes de `src/main.jsx`;
2. ampliar a profundidade de prática nos módulos estruturais com segundo caso de natureza diferente;
3. entregar a interface de conteúdo offline já suportada pela API existente;
4. revisar cobertura, qualidade e atualidade dos casos, questões, videoaulas e rubricas;
5. reforçar rastreabilidade normativa e processo de atualização;
6. executar auditoria visual, responsiva, de desempenho e de acessibilidade no produto completo;
7. somente depois considerar funcionalidades novas de maior porte, backend ou integrações externas.

Uma etapa pode ser recusada quando a premissa não se confirmar. Registrar a medição e o motivo, como já feito no plano para referências ambíguas a quadros.

## Critérios de plataforma premium

O produto será considerado maduro quando, de forma verificável:

- conteúdo e funcionalidades representam corretamente as fontes;
- toda afirmação normativa relevante possui origem, versão e data acessíveis;
- não há dados pessoais ou caminhos locais publicados indevidamente;
- todas as áreas principais têm objetivo, estado vazio, erro e navegação claros;
- os fluxos principais funcionam por teclado e em celular;
- o modo offline é explicado, gerenciável e testado;
- os laboratórios treinam decisão e redação, não apenas reconhecimento;
- questões e casos possuem rubricas coerentes e cobertura proporcional ao risco;
- o usuário consegue localizar rapidamente a fonte exata;
- os testes impedem regressões estruturais, de conteúdo, privacidade e artefato;
- o repositório possui arquitetura compreensível, documentação atual e plano executável;
- limitações e dependências de validação humana são mostradas sem simulação de certeza.

## Forma de relato ao final de cada ciclo

Registrar objetivamente:

- problema encontrado;
- evidência;
- mudança realizada;
- arquivos alterados;
- testes executados e resultado;
- validação visual e de interação;
- riscos restantes;
- próxima etapa recomendada.

Nunca dizer que “auditou tudo” quando alguma pasta, documento, navegador, fluxo ou ambiente não esteve acessível. Identificar exatamente o que foi e o que não foi verificado.
