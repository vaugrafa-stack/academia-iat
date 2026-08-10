# Governanca mecanica do acervo de midia

Este portao protege o acervo publicado sem reescrever o historico e sem mover
os arquivos existentes. `media-legacy-baseline.json` e o inventario imutavel
do legado em 09/08/2026. Cada entrada registra caminho, tamanho e SHA-256; o
resumo registra contagem, bytes, colecoes, extensoes e o hash do inventario.

`pnpm check:media` verifica, de forma deterministica:

- integridade do baseline e de todos os arquivos atuais;
- ausencia de conteudo duplicado por SHA-256;
- limites de tamanho por tipo de arquivo;
- cobertura de cada ativo por exatamente uma colecao de proveniencia;
- coerencia dos manifestos de extracao, aulas, pilotos e fontes locais;
- inexistencia de inclusao, substituicao ou remocao silenciosa.

Qualquer mudanca futura deve entrar em `media-approved-changes.json` com acao,
caminho, bytes, SHA-256, origem, base de direitos, revisao de privacidade,
revisao tecnica, responsavel, data, justificativa e **ciclo**. O ledger nao
substitui a revisao humana; ele torna a aprovacao explicita e testavel.

## O ciclo, e por que ele existe

O teto de 80 arquivos e 20 MB vale **por ciclo**, e o ciclo corrente e declarado
em `currentCycle`, na politica.

Isso nao e detalhe de contabilidade. O baseline e imutavel e o ledger nao pode
encolher: retirar uma entrada faria o arquivo correspondente virar "novo ativo
sem registro" na execucao seguinte. Enquanto o teto somava todas as adicoes ja
aprovadas, ele era vitalicio disfarcado de "por ciclo", e travaria o CI de forma
permanente por volta do octogesimo ativo novo. A unica saida seria afrouxar o
limite para todo mundo, que e como um portao morre.

As entradas de ciclos anteriores continuam valendo como autorizacao do ativo.
Elas apenas nao consomem mais o orcamento do ciclo em curso.

**Encerrar um ciclo** e uma edicao de uma linha:

```json
"currentCycle": "2026-09"
```

Ela aparece no diff, que e onde a decisao deve ser julgada: quem abre um ciclo
novo esta dizendo que o anterior foi revisado e incorporado. Para volumes
maiores dentro de um mesmo ciclo, a politica precisa ser revista
conscientemente antes da incorporacao.

O comando `node tools/check-media-governance.mjs --report <arquivo>` pode gerar
um relatorio completo do estado corrente para auditoria sem alterar o baseline.
A opcao `--initialize-baseline` existe apenas para a criacao inicial e recusa
sobrescrever um baseline existente.

## Estado medido no baseline

- 784 ativos governados e 263.259.793 bytes;
- 0 grupos de conteudo duplicado por SHA-256;
- maior arquivo: 5.506.904 bytes;
- 742 arquivos fisicos sob `public/media`, dos quais 737 sao midias ou
  alternativas acessiveis governadas e cinco sao manifestos/README validados
  pelos contratos;
- 35 ativos extraidos de documentos, 636 resumos de aula, 30 ativos dos
  pilotos, quatro camadas do palco, 67 midias legadas, oito ilustracoes
  hidreletricas, duas fontes e dois icones;
- 431,89 MiB ocupados pelos packs Git na medicao local anterior a esta trava.

O tamanho do historico nao foi reduzido: isso exigiria reescrita destrutiva e
invalidaria clones existentes. Uma migracao futura para Git LFS, Releases ou
armazenamento de artefatos deve ser forward-only, ter plano de disponibilidade
offline e ser validada em branch separada antes de mudar URLs publicas.

## GitHub Actions

O workflow `quality.yml` ja usa todas as Actions por SHA completo. Nenhuma
versao foi alterada neste ciclo porque nao houve evidencia independente, no
escopo desta mudanca, que associasse novos SHAs a releases verificadas e
compativeis. O portao de midia foi integrado como etapa explicita antes do
build; atualizar Actions sem essa prova reduziria, em vez de elevar, a
rastreabilidade da cadeia de suprimentos.
