# Revisão pontual do POP e incorporação à Academia IAT

Data da conferência: 14/10/2026. O documento permanece uma minuta técnica,
sem aprovação institucional. A revisão não substitui uma atualização normativa
integral posterior à data-base declarada no POP.

## Fonte e produto

- Fonte recebida: `POP HIdrelétricas (setembro de 2026).docx`, SHA-256
  `7187a9589be1d5e83655f4c66f5fa9544d319f8a3e4bcff554d8dce927e8f35c`.
- Produto entregue fora do repositório público:
  `POP_DLE_HID_001_v1.10.1_Conferido.docx`, SHA-256
  `90d3b3b02edb97e3dc64dfc54330feb6b5904cef1dce8e365ee1ef8760d046c0`.
- A alteração foi feita em cópia, mantendo a fonte original. A rotina de edição
  está em `tools/revise_pop_v1101.py`; a Figura 11 substituta está em
  `tools/assets/pop-figura-11-v1101.png`. O Word salvou o arquivo final e a
  paginação foi conferida sobre uma exportação de controle não publicada.

## Decisões após nova auditoria

1. A referência ao art. 9º, § 6º, da Lei Federal nº 15.190/2025 foi mantida:
   ela é pertinente à infraestrutura de energia nas condições descritas pelo
   dispositivo. O art. 64, III, do Decreto Estadual nº 9.541/2025 conserva
   uma exigência de CAR para LAC em área rural. O POP agora manda confrontar
   ambos no caso concreto e obter validação jurídica ou institucional, sem
   presumir revogação, dispensa ou solução automática.
2. Foram substituídas expressões de classificação e de linguagem operacional
   que o usuário informou não usar no dia a dia, inclusive dentro de quadro e
   da imagem raster do fluxo. A redação passou a pedir efeito, fundamento,
   verificação e encaminhamento. O enquadramento jurídico aplicável continua
   dependente dos atos normativos, não de uma escala inventada pelo POP.
3. O exemplo nominal de peticionamento no Anexo F foi generalizado. Essa
   edição evita que um caso específico pareça orientação universal do fluxo.
4. O histórico e a capa identificam a revisão 1.10.1 como pontual, em outubro
   de 2026. Não há afirmação de revalidação integral da base de setembro.

Fontes oficiais consultadas: [Lei Federal nº 15.190/2025](https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15190.htm),
[Decreto Estadual nº 9.541/2025](https://www.legislacao.pr.gov.br/legislacao/listarAtosAno.do?action=exibirImpressao&codAto=357341)
e [normas do IAT](https://www.iat.pr.gov.br/Pagina/Instrucoes-Normativas-Orientacoes-Tecnicas).
A interpretação da compatibilização CAR/LAC ainda depende da instância
competente; esta revisão não fornece parecer jurídico conclusivo.

## Conferências e propagação

- Word: 152 páginas, 105 em retrato e 47 em paisagem; nenhuma página vazia ou
  bloco de texto fora da página detectado no PDF de controle. As páginas
  alteradas e as folhas de contato foram inspecionadas visualmente.
- Extração: 177 seções, 169 tópicos didáticos, 70 quadros/tabelas, 14 figuras;
  preservação de todos os IDs de seção existentes na última extração.
- Plataforma: texto público, referências, questões, laboratório, 169 vídeos,
  legendas, visemas, seis pilotos e pacotes offline atualizados ou revalidados
  com a nova identidade da fonte. Os ativos de mídia foram registrados no
  ciclo de governança de outubro, com selo do ciclo histórico de agosto.
- `pnpm test`: 76 arquivos, 687 testes e todos os portões encadeados aprovados.
- `pnpm build`: aprovado dentro dos limites; os tamanhos totais de CSS/JS
  seguem próximos dos respectivos tetos e merecem acompanhamento.
- Playwright sobre o artefato: 101 cenários aprovados e 34 omissões previstas
  na matriz de tamanhos; cenário PWA local aprovado.

O DOCX não é versionado no repositório público. Os hashes do documento e dos
ativos extraídos são conferidos por `tools/check-provenance.mjs` e
`tools/check-media-governance.mjs`.
