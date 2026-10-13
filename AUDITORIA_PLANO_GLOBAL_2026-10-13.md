# Auditoria do plano global recebido em 13/10/2026

Escopo: conferir as propostas do texto anexado pelo usuário contra o checkout da
Academia IAT e fontes oficiais. O texto recebido é uma lista de hipóteses, não
uma norma nem prova de auditoria integral. Esta revisão não altera a minuta
congelada do POP e não valida juridicamente processos concretos.

## Decisões por área

| Área e proposta | Resultado da conferência | Ação neste ciclo |
|---|---|---|
| Hidrelétricas: separar PCH ANEEL de PCH IAT | Procede, mas **já consta** de `src/hydro.jsx`, `src/hydroCases.jsx` e do guia. A redação de 2023 do art. 5º da REN ANEEL 875/2020 usa potência >5 até 30 MW, sem teto de área; a IN IAT 09/2025 usa também reservatório até 3 km², ressalvada exceção expressa. | Preservar; não duplicar cartões. |
| “Acima de 3 km² exige sempre EIA/RIMA” | **Incorreto.** O enquadramento ambiental pode mudar, mas o art. 10 da IN fala em situações *passíveis* de EIA/RIMA e outros critérios; não se pode derivar estudo automático apenas da área. | Rejeitar; conservar a distinção já exibida no site. |
| Consulta Prévia a partir de 1 MW e facultativa abaixo | O art. 36 exige CP para CGH com potência ≥1 MW, PCH e UHE. Não estabelece regra geral de facultatividade para todo empreendimento abaixo desse limite. O alcance obrigatório já aparece no guia e na página técnica. | Preservar obrigação; rejeitar a palavra “facultativa” como regra normativa. |
| Segurança de barragens, Lei 12.334/2010 alterada pela Lei 14.066/2020 | Já consta em `src/empreendedorGuia.js`, `src/empreendedor.jsx` e no módulo M07; aplicação depende da classificação e do órgão fiscalizador. | Sem repetição. |
| Q7,10 e TVR | Faltava explicação breve junto ao arranjo animado. Q7,10 é referência hidrológica, não um percentual universal de vazão remanescente; o art. 54 da IN admite ajuste motivado para usos múltiplos e demandas sanitárias/ecológicas. | Acrescentado painel contextual em `src/hydroCases.jsx`, sem inventar vazão fixa. |
| Scroll da navegação hidrelétrica | Já há sincronização de seção, foco e teste de regressão em `src/hydro.jsx`/`src/hydroNavigation.test.jsx`. A proposta não trouxe reprodução de falha atual. | Não alterar comportamento sem evidência reproduzível. |
| Alternativa quando GeoPR/satélite falha | O mapa informa dependência de rede, fornece tentativa novamente e o painel aponta o portal oficial. Nenhum link externo torna o mapa offline. | Preservar; não prometer disponibilidade externa. |
| Formação: substituir CEMA 107/2020 em todo conteúdo | **Não fazer globalmente.** A CEMA antiga é relevante para história e transição; o POP de origem está congelado. A plataforma já registra a lei estadual, o decreto e a IN vigente em partes do laboratório, da biblioteca e das questões. A regra temporal exige data de protocolo e vigência. | Preservar fontes históricas; explicitar lei, decreto e revogação/transição no guia; registrar necessidade de revisão editorial humana aula a aula se houver nova edição do POP. |
| Formação: contestação de condicionantes | O art. 38 do Decreto 9.541/2025 prevê contestação justificada em 30 dias da emissão, exclusivamente sobre condicionantes. A numeração do plano está trocada: o módulo de condicionantes é **M14** (`id m12`), não M15; M15 trata qualidade textual. | Incluído no guia com link oficial e ressalva sobre efeito da contestação. |
| Lei 15.190/2025 sobre certidão municipal/intervenientes | O dispositivo pertinente à independência do licenciamento em relação à certidão municipal e a atos de órgãos não integrantes do Sisnama é o **art. 17, não o art. 4º**. A IN IAT 09/2025 ainda contém modelo de certidão no Anexo I; a compatibilização precisa de validação institucional. M13 do site é licenciamento federal delegado, não o módulo geral de intervenientes (M11). | Corrigido o guia: art. 17, ressalva de cumprimento das leis próprias e de aparente conflito normativo; não removida certidão automaticamente. |
| RLO proporcional e nomenclatura dos estudos | O laboratório e o guia já distinguem renovação de novo licenciamento, Memorial/RAS/RDPA/PCA/PBA e suficiência. A frase “não pode exigir estudo novo” é rígida demais se houver fato novo ou necessidade motivada de informação complementar. | Não impor vedação universal nem repetir tabela existente. |
| Cartões “pontos de atenção” em cada módulo | Aulas, avaliações, laboratório e checklists já oferecem prática/erros. Cartões idênticos em todos os módulos aumentariam repetição visual. | Não adicionar blocos padronizados sem objetivos e evidência de lacuna por módulo. |
| Guia: sequência CP→DRDH→LP→outorga→LI→LO | **Não é linha obrigatória universal.** Domínio federal/estadual e modalidade alteram os atos, e os trilhos ambiental, hídrico e setorial têm dependências específicas. O guia já separa os eixos. | Rejeitar sequência única; preservar trilhos e verificação por fase. |
| Guia: ANEEL e intervenientes | Os atos setoriais variam por potência e o guia já separa registro e outorga; IPHAN, UC, município e segurança estão distribuídos no curso. Um quadro fechado sem gatilhos e fontes específicas poderia parecer checklist obrigatório. | Não criar matriz normativa universal; manter links à biblioteca e limites de competência. |
| Redator: 12 seções e quatro decisões prontas | As 12 seções e o validador já existem. Minutas de deferimento/indeferimento com condicionantes “padronizadas” poderiam simular decisão institucional em ambiente não oficial. As expressões sugeridas são exemplos de redação, não termos obrigatórios. | Não gerar decisão pré-preenchida nem validação por palavras mágicas. |
| Laboratório: quatro casos adicionais | Há 26 casos sintéticos com RLO, transferência, divergência setorial/ambiental e sensibilidade territorial. Potência ou área isolada não determina decisão. | Não inventar julgamento fechado para casos sem processo; registrar cenários como candidatos à futura revisão didática individual. |
| Avaliações: CEMA antiga e feedback | As questões autorais pesquisadas não tinham resposta baseada na CEMA 107/2020 como regime atual. O banco já tem 232 itens e feedback por alternativa, porém grande parte é genérica e marcada para revisão humana. | Revisadas manualmente as justificativas de alternativas em três questões normativas; mantida a indicação de revisão humana pendente do restante. |
| Fluxogramas: artigo em toda caixa | Muitas caixas representam método, prova ou ação operacional do POP, não hipótese com artigo único. Atribuir um artigo a todas criaria precisão falsa. | Não fazer anotação em massa. |
| GeoPR: guia de sobreposição | Havia aviso de limite, seleção de camadas, consulta de atributos e fonte; faltava sequência curta para o usuário. | Adicionado guia recolhível de três passos, deixando explícito que o mapa não calcula interseção nem conclui incidência legal. |

## Fontes oficiais conferidas

- [IN IAT nº 09/2025, republicada](https://www.iat.pr.gov.br/sites/agua-terra/arquivos_restritos/files/documento/2025-06/instrucao_normativa_09-2025-empreendimentos_hidreletricos-23743957-0_republicado.pdf): arts. 2º, 9º, 10, 36, 54 e Anexo I.
- [REN ANEEL nº 875/2020 com histórico de redações](https://www2.aneel.gov.br/cedoc/ren2020875.pdf), art. 5º com alteração da [REN nº 1.070/2023](https://www2.aneel.gov.br/cedoc/pubren20231070.pdf).
- [Decreto Estadual nº 9.541/2025, texto compilado](https://www.legislacao.pr.gov.br/legislacao/listarAtosAno.do?action=exibirImpressao&codAto=357341): arts. 38, 173 e 175; conferir alterações posteriores.
- [Lei Federal nº 15.190/2025, texto compilado](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15190.htm): arts. 17 e 18; conferir redações e vigência na data do protocolo.
- [ANEEL, página operacional de outorga para PCH/UHE](https://www.gov.br/aneel/pt-br/centrais-de-conteudos/manuais-modelos-e-instrucoes/geracao/registro-autorizacao-e-concessao-de-empreendimentos-de-geracao/outorga-de-autorizacao-pch-e-uhe): confirma faixa de potência setorial; páginas gerais/dados abertos ainda podem reproduzir definição antiga de 13 km².
- [ANA, manual de DRDH](https://www.gov.br/ana/pt-br/todos-os-documentos-do-portal/documentos-sre/coreg/manualdedrdh2013diretrizesparaestudoprognosticodequalidadedaagua.pdf/@@download/file): definição hidrológica de Q7,10, sem convertê-la em mínimo universal do TVR.
- [Lei Estadual nº 22.252/2024, texto compilado](https://www.legislacao.pr.gov.br/legislacao/pesquisarAto.do?action=exibir&codAto=347383&codTipoAto=1&tipoVisualizacao=compilado): base geral do regime estadual.

## Limites e seguimento

Esta é uma auditoria do **plano recebido e dos pontos de código correspondentes**, não
uma leitura jurídico-editorial integral das 168 aulas, 232 questões ou dos 26
casos. A revisão humana de cada peça, especialmente onde há transição de lei
e conflitos aparentes entre normas, permanece necessária antes de declarar
conteúdo institucionalmente validado. A produção continua sendo treinamento
independente; alterações locais só são públicas após workflow e conferência do
SHA publicado.
