# Mídia da Academia IAT

Este diretório reúne recursos audiovisuais de orientação e revisão. Pela duração e pelo nível de aprofundamento, eles devem ser apresentados como **resumos audiovisuais curtos**, não como videoaulas completas.

## Recursos por seção

`media/aula` contém 159 resumos associados a seções substantivas do POP:

- duração entre 10,5 e 102,5 segundos;
- duração média de 48,3 segundos;
- vídeo MP4, pôster e legenda WebVTT;
- 746 cenas de conteúdo e 905 entradas de legenda, incluindo o título;
- limite editorial de 17 caracteres por segundo nas legendas; máximo observado de 16,73;
- 128,0 minutos de mídia no total.

Esses recursos ajudam a antecipar ou revisar um tópico. Não substituem a aula textual, a leitura da fonte, exemplos trabalhados, prática com feedback nem avaliação de transferência.

## Conjuntos legados

Os arquivos abaixo formam três resumos visuais produzidos na primeira versão da plataforma:

- `fluxo-geral.*` — seções 6, 6.1 e 7;
- `enquadramento.*` — seção 8;
- `pacuera.*` — seção 18.10 e Quadros 30 a 32.

Cada conjunto inclui:

- vídeo MP4 H.264 de 20 segundos, 1280×720 e 15 fps;
- legenda WebVTT em português;
- pôster PNG;
- animação SVG de 20 segundos como recurso complementar.

Os MP4s foram validados com 300 quadros e duração de 20 segundos. `media-manifest.json` preserva o manifesto histórico desses três conjuntos, inclusive referências antigas a “v1.2”; a fonte operacional atual é a minuta v1.7 identificada na capa, com SHA-256 `8ffa771546c244e194e6d7b41dd91d5ab3f56083e94c081e1e5c9a17f13f2c3c`.

`analista-licenciamento.png` é uma ilustração editorial gerada para a aula em destaque, sem logomarca ou texto incorporado.

## Palco das aulas

`media/learning-stage` contém dois ativos originais produzidos para esta
plataforma:

- `professor-sprite.webp` — personagem fictício em quatro estados de fala,
  sem correspondência com pessoa real;
- `thematic-atlas.webp` — quatro cenários contextuais (barragem, território,
  vistoria de campo e análise documental).

Os ativos foram otimizados em WebP e são usados como camadas progressivas do
player. O conteúdo essencial continua disponível no vídeo, na legenda e na
transcrição quando essas imagens não carregam. Ambos integram o núcleo offline
da aplicação, enquanto as mídias de cada módulo continuam opcionais.

## Geração e validação

`tools/build_lesson_videos.py` produz os 159 conjuntos a partir da apresentação
pública do POP. A geração usa frases completas, normalização de siglas e
unidades para a pronúncia em português, tempo derivado do áudio, segmentação
visual limitada e promoção atômica por diretório: uma falha não publica um
manifesto parcial.

Em 29/07/2026, os 159 MP4 foram decodificados integralmente, os 159 pôsteres
foram conferidos em 960 × 540 px e os manifestos, tempos, cenas e legendas
passaram pelos verificadores automatizados.

## Limites e acessibilidade

- Legendas não equivalem automaticamente a transcrição didática completa; devem ser conferidas quando a mídia for revisada.
- Nenhum vídeo comprova competência profissional ou conclusão institucional.
- Imagens, animações e áudios complementam o conteúdo, mas não devem carregar informação essencial sem alternativa textual.
