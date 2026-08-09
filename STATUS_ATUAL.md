# Status atual da Academia IAT

Atualizado em 09/08/2026. Este é o único documento de situação corrente. Os
planos detalhados do repositório preservam decisões e snapshots históricos.
Quando houver divergência, prevalecem os manifestos gerados, os testes do commit
identificado e este status.

## Identidade do produto

- Repositório público: `vaugrafa-stack/academia-iat`.
- Branch de código: `master`.
- Produção: <https://vaugrafa-stack.github.io/academia-iat/>.
- Último commit de produção verificado nesta linha de base:
  `e298901511b984fea315f675cb0ba2c2736fb762`.
- Publicação: workflow único `.github/workflows/quality.yml`; o job de publicação
  usa exatamente o artefato aprovado pelo job de qualidade, sem recompilar.
- Natureza: treinamento e apoio à consulta, sem validade administrativa,
  certificação institucional ou decisão automática sobre processo.

Uma alteração local ou um push em repositório privado não é produção. A versão
de produção só muda quando o workflow público termina com sucesso e o artefato
publicado é verificado pelo SHA incorporado ao aplicativo.

## Fonte e medidas reproduzíveis

Fonte congelada: minuta `POP-DLE-HID-001`, versão operacional 1.7 indicada na
capa, SHA-256
`8ffa771546c244e194e6d7b41dd91d5ab3f56083e94c081e1e5c9a17f13f2c3c`.

| Medida | Valor | Fonte reproduzível |
|---|---:|---|
| Seções extraídas | 167 | `src/data/extraction-validation.json` |
| Títulos não navegacionais | 161 | `src/data/extraction-validation.json` |
| Tópicos didáticos com conteúdo | 159 | `src/data/extraction-validation.json` |
| Módulos | 17 | `src/courseData.js` e testes de contrato |
| Quadros e tabelas | 66 | `src/data/extraction-validation.json` |
| Figuras do POP | 14 | `src/data/extraction-validation.json` |
| Fluxogramas-fonte | 21 | `src/data/extraction-validation.json` |
| Ativos extraídos | 35 | `public/source-assets/asset-manifest.json` |
| Casos sintéticos | 26 | `src/data/lab-index.json` |
| Questões comentadas | 213 | `src/data/question-bank.json` |
| Referências registradas | 60 | dados de referência e `check-questoes` |

Essas contagens provam cobertura e integridade estrutural. Não provam vigência
normativa, validade pedagógica, competência profissional ou aprovação humana.

## Linha de base de produção e candidato atual

No commit de produção acima, a validação local registrada em 09/08/2026 obteve:

- 50 arquivos de teste e 431 testes unitários aprovados;
- todos os portões encadeados de `pnpm test` aprovados;
- build de produção aprovado dentro dos orçamentos;
- 10 cenários Playwright do artefato aprovados em desktop e nas larguras 320,
  360, 390 e 430 pixels;
- navegação, busca e menu móvel inspecionados sem erro de console.

Esses resultados são a linha de base do SHA informado. Mudanças posteriores
precisam executar novamente `pnpm test`, `pnpm build`, `pnpm audit:premium`,
`pnpm test:e2e:artifact` e `pnpm test:e2e:pwa` antes de publicação.

O candidato preparado em 09/08/2026 foi validado localmente com:

- 53 arquivos de teste e 451 testes aprovados;
- todos os portões encadeados de `pnpm test`, inclusive smoke, governança de
  mídia e auditoria fail-closed de workflows, aprovados;
- build aprovado, com 683,0 KiB de JavaScript bruto, 231,5 KiB compactado,
  214,3 KiB de CSS bruto e 39,3 KiB compactado;
- 10 cenários Playwright do artefato e um cenário PWA aprovados;
- inspeção em navegador real da nova rastreabilidade normativa, da rota
  Avaliações e dos comportamentos de foco e teclado.

Esse candidato só passa a produção quando o workflow público aprovar o commit,
o GitHub Pages publicar o mesmo artefato e o SHA exibido pela aplicação online
for conferido. O SHA corrente da produção deve ser obtido da própria aplicação
ou do artefato do workflow; este arquivo não tenta antecipar o hash do commit
que o contém.

## Serviços separados

| Serviço | Repositório | Estado comprovado | Não confundir com |
|---|---|---|---|
| Conta opcional de estudo | repositório privado separado | candidato local com 90 testes aprovados; integração e concorrência exercitadas | serviço implantado ou conta obrigatória |
| Área Técnica restrita | repositório privado separado | candidato local com 128 testes aprovados; OIDC, sessão, autorização e logout exercitados | ambiente institucional ou tratamento autorizado de processo real |

Os dois serviços privados não possuem implantação ou pipeline de produção
comprovados. A Academia pública continua utilizável sem conta remota. Nenhum
documento real pode entrar na Área Técnica antes dos portões formais de
governança, infraestrutura e autorização.

O workflow externo de auditoria que antecedeu o primeiro push desses serviços
não é evidência válida: cinco de cinco agentes falharam e o agregador registrou
uma liberação falsa. O incidente foi convertido em regressão automática; o novo
validador reprova erro oculto, resultado vazio, cobertura incompleta, lentes
duplicadas e totais agregados incompatíveis. Isso corrige o portão, mas não
transforma o relatório histórico em evidência válida.

O candidato atual recebeu uma nova revisão independente do diff. Foram
reexecutados 12 cenários adversariais nas contas e 11 na Área Técnica, além das
suítes completas, sem bloqueador de segurança alto ou médio para commit e push.
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
4. **Arquitetura.** Arquivos centrais e CSS permanecem grandes; a decomposição
   deve preservar contratos, modo offline e orçamentos.
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
