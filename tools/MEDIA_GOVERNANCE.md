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

## Duas listas, e nada fora delas

O portao vigia por extensao, e isso deixava uma terceira categoria silenciosa:
nem vigiada, nem declarada como irrelevante. Um `.webm` ao lado dos `.mp4`, um
`.jpeg` ao lado dos `.jpg`, um `.mp3` de narracao entravam na arvore sem
proveniencia, sem base de direitos, sem teto de tamanho e sem checagem de
duplicata. E entravam calados, que e o pior modo.

Agora ha duas listas explicitas, e nada fora delas:

- `managedExtensions`, `managedSuffixes` e `managedTextRules`: vigiado, exige
  proveniencia e entra no baseline;
- `ignoredPaths`: somente os oito manifestos, README e arquivo de licenca
  identificados pelo caminho completo.

Arquivo que nao esteja em nenhuma das duas listas reprova, com a instrucao
junto. Ignorar por caminho evita que um futuro `.json` audiovisual, `.txt` de
narracao ou outro arquivo grande escape apenas por compartilhar a extensao de
um manifesto conhecido.

## O ciclo, e por que ele existe

O teto de 80 arquivos e 20 MB vale **por ciclo**, e o ciclo corrente e declarado
em `currentCycle`, na politica.

Isso nao e detalhe de contabilidade. O baseline e imutavel e o ledger nao pode
encolher: retirar uma entrada faria o arquivo correspondente virar "novo ativo
sem registro" na execucao seguinte. Enquanto o teto somava todas as adicoes ja
aprovadas, ele era vitalicio disfarcado de "por ciclo", e travaria o CI de forma
permanente por volta do octogesimo ativo novo. A unica saida seria afrouxar o
limite para todo mundo, que e como um portao morre.

As entradas de ciclos anteriores continuam valendo como autorizacao do ativo,
mas o conjunto encerrado precisa de um `cycleSeal`. O selo registra ciclo,
quantidades, bytes e SHA-256 deterministico de todas as mudancas daquele ciclo.
Cada ciclo, inclusive os encerrados, continua sujeito aos mesmos tetos de
arquivos e bytes. Ciclos anteriores a `firstGovernedCycle`, posteriores a
`currentCycle`, sem selo, com selo divergente, duplicado ou orfao reprovam.

O selo torna qualquer ajuste posterior visivel no diff, mas nao e uma assinatura
externa: quem pode alterar o repositorio tambem pode recalcula-lo. Por isso a
proteção contra uma insercao historica deliberada depende da revisao do diff;
o portao mecanico garante o intervalo permitido, os tetos de cada ciclo e a
integridade interna do conjunto declarado.

**Encerrar um ciclo** exige duas mudancas revisaveis no mesmo diff:

```json
{
  "cycleSeals": [
    {
      "cycle": "2026-08",
      "changes": 12,
      "approvedAdds": 10,
      "growthBytes": 123456,
      "sha256": "..."
    }
  ]
}
```

Depois do selo, `currentCycle` pode avancar na politica. Selo ausente, duplicado,
orfao ou divergente reprova. Para volumes maiores dentro de um mesmo ciclo, a
politica precisa ser revista conscientemente antes da incorporacao.

O valor exato do selo e gerado sem escrever arquivos:

```powershell
node tools/check-media-governance.mjs --propose-cycle-seal 2026-08
```

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
