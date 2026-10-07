// Mantém imagens e tabelas no ponto em que aparecem na seção extraída.
// As legendas são parágrafos separados no DOCX; associá-las ao elemento evita
// repetir o mesmo texto na leitura guiada e na reprodução da fonte.
export function montarMateriaisDaSecao(blocks = [], tableMap = new Map(), figureByBlock = new Map()) {
  const itens = [];
  const legendasConsumidas = new Set();

  blocks.forEach((block, index) => {
    if (block.type === "table") {
      const table = tableMap.get(block.tableId);
      if (!table) return;
      const anterior = blocks[index - 1];
      const texto = anterior?.paragraph?.text?.trim() || "";
      const legenda = texto.match(/^(Quadro|Tabela)\s+(\d+)\b/i);
      if (legenda && legenda[1].toLocaleLowerCase("pt-BR") === table.labelType.toLocaleLowerCase("pt-BR")
        && Number(legenda[2]) === Number(table.labelNumber)) {
        legendasConsumidas.add(anterior.id);
      }
      itens.push({ tipo: "tabela", blockId: block.id, table });
    }

    const figure = figureByBlock.get(block.id);
    if (figure) {
      const proximo = blocks[index + 1];
      const texto = proximo?.paragraph?.text?.trim() || "";
      const legenda = texto.match(/^Figura\s+(\d+)\b/i);
      const corresponde = legenda && Number(legenda[1]) === Number(figure.number);
      if (corresponde) legendasConsumidas.add(proximo.id);
      itens.push({
        tipo: "figura",
        blockId: block.id,
        figure,
        legenda: corresponde ? texto : (figure.caption || figure.title),
      });
    }
  });

  return { itens, legendasConsumidas };
}
