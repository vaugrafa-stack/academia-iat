# Piloto audiovisual da Academia IAT

## Escopo entregue

O piloto cobre somente seis aulas aprovadas. Os 159 tópicos não foram
regenerados nesta etapa. Os vídeos anteriores permanecem classificados na
interface como resumos em vídeo.

| Aula | Fonte principal | Duração | Ritmo | MP4 |
|---|---|---:|---:|---:|
| `pop-section-018` · Procedimento passo a passo | POP, item 7.1, parágrafos 0163–0173 | 174,130 s | 130,94 ppm | 4,42 MB |
| `pop-section-059` · Distinção entre documentos | POP, item 18.2, Quadro 22 (`pop-table-032`) | 160,206 s | 137,45 ppm | 4,13 MB |
| `pop-section-069` · Visão geral dos blocos de análise do PACUERA | POP, item 18.10.2, `pop-table-040`; TR PACUERA 2026 | 187,642 s | 135,90 ppm | 5,51 MB |
| `pop-section-094` · Formulação de condicionantes | POP, itens 24 e 24.1, Quadro 40 e parágrafos declarados | 148,852 s | 137,45 ppm | 3,82 MB |
| `pop-section-108` · Controle final de qualidade | POP, item 27; Tabela 14 (`pop-table-057`) | 173,369 s | 130,47 ppm | 4,44 MB |
| `pop-section-134` · Bases geoespaciais oficiais | POP, item 19.1.1; páginas oficiais do IAT | 144,412 s | 141,26 ppm | 4,20 MB |

Cada roteiro segue: problema, objetivo, vocabulário, explicação, exemplo, erro
recorrente, pausa para decisão, resposta comentada, síntese e próximo passo.
Toda cena cita uma referência declarada. O gate também confirma que cada
parágrafo ou tabela pertence à seção indicada na referência.

## Pacote de cada aula

Cada aula possui:

- MP4 H.264/AAC de 960×540, 12 fps, `fast start` e quadro-chave a cada 2 s;
- pôster contextual derivado do atlas temático do repositório;
- legenda WebVTT com até 42 caracteres por linha, duas linhas e 6 s por cue;
- transcrição com objetivo, pré-requisito, texto e localizador legível;
- linha do tempo de 12 visemas;
- janelas editoriais que mantêm o professor em 35% da duração.

Os IDs internos continuam no roteiro e no manifesto. No material exibido ao
aluno, a fonte aparece como, por exemplo, `POP, item 18.2`, e não como
`pop-18.2`.

## Voz e sincronização

A voz atual é `pt_BR-faber-medium`, masculina, em português brasileiro,
executada localmente pelo Piper. Não houve clonagem de voz. O cartão do
modelo registra conjunto de dados CC0 e o repositório Piper Voices usa licença
MIT:

- <https://huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_BR/faber/medium>
- <https://huggingface.co/rhasspy/piper-voices/blob/main/pt/pt_BR/faber/medium/MODEL_CARD>

O modelo usado tem SHA-256
`858555e3a064209c57088fe6bd70c4c3dc54d03eaa00c45d5ecaf43a33f95aa7`.
O dicionário editorial expande siglas e termos que exigem pronúncia
controlada. O ritmo final de cada aula fica entre 130 e 150 palavras por
minuto.

O Piper fornece a sequência de fonemas, mas não os tempos individuais. Por
isso, o piloto distribui os fonemas dentro da duração real de cada cena e
declara explicitamente `alignmentStatus: estimated-pilot`. Na reprodução, a
amplitude real da narração abre ou fecha a boca em amostras de 66 ms e a linha
fonêmica escolhe o formato aproximado. Isso melhora a correspondência
perceptiva, mas ainda não equivale a alinhamento acústico fonema a fonema
comprovado em 100 ms. Uma exigência objetiva desse tipo requer alinhador
fonético forçado e medição própria.

O provedor de voz está isolado por contrato. Uma comparação futura com outra
voz pode reutilizar os roteiros e o contrato `MediaAsset`, mas nenhuma troca
de voz foi feita silenciosamente neste lote.

## Apresentador e fundos

O apresentador é um personagem editorial fictício, com grade 3×4 na ordem:

`rest`, `MBP`, `IE`, `A`, `O`, `U`, `FV`, `L`, `CHJ`, `E_OPEN`, `SCHWA`, `rest_alt`.

O PNG original tem SHA-256
`ef077fddc5e5141e721fdea7c23db2d8ae695773595acc6f5871cf2b826daa47`.
A versão WebP usada na interface tem 157.938 bytes e SHA-256
`5a256fdd0449fb896bb477fd40cac0b41dee7f90ceb20bfa7ec99669c24c77d0`.
Se esse ativo não carregar, a interface conserva o professor anterior como
fallback. Com preferência por movimento reduzido, a boca permanece em repouso.

Os quadros usam somente o atlas temático já incorporado ao repositório, com
recortes de escritório, barragem, campo ou mapa conforme o tema. A transição
entre quadros dura 240 ms e sempre mistura duas imagens completas; não há
quadro preto intermediário.

## Fontes oficiais complementares

- [Termo de Referência PACUERA 2026](https://www.iat.pr.gov.br/sites/agua-terra/arquivos_restritos/files/documento/2026-02/termodereferenciapacuera2026.pdf)
- [Geodados e Aplicações](https://www.iat.pr.gov.br/Pagina/Geodados-Aplicacoes)
- [Dados sobre Unidades de Conservação](https://www.iat.pr.gov.br/Pagina/Dados-sobre-Unidades-de-Conservacao)
- [Planos de Manejo](https://www.iat.pr.gov.br/Pagina/Planos-de-Manejo)

As fontes foram verificadas em 4 de agosto de 2026 e estão identificadas no
arquivo de roteiros. O termo PACUERA registra validade até 1º de fevereiro de
2027, e o gate exige nova conferência depois dessa data. O POP público usado pelo gate tem SHA-256
`f7056462b84de383c8e2dbb1e22d3bb732d90fbd876a933e0596642caf5b4871`.

## Reprodução e controle

O gerador não baixa mídia nem voz durante a execução. Ele usa o modelo local,
o atlas e o sprite existentes e requer um executável FFmpeg informado por
argumento ou pela variável `ACADEMIA_IAT_FFMPEG`.

```powershell
$env:SOURCE_DATE_EPOCH = '1785812400'
python tools/build_audiovisual_pilots.py --ffmpeg <caminho-do-ffmpeg>
pnpm check:audiovisual-pilots
```

O `SOURCE_DATE_EPOCH` estabiliza a data registrada. Cada geração recalcula
bytes e hashes; o gate exige igualdade integral entre os manifestos de origem
e publicação. Ele também valida fontes, ativos, hashes, duração real do MP4,
`fast start`, codecs, legendas, cobertura do professor e linha do tempo de
visemas.

O lote não deve ser ampliado antes de aprovação editorial, técnica e
perceptiva destes seis exemplos.
