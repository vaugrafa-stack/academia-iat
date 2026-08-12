import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { colherErros, errosDaAula } from "./errosRecorrentes.js";

function tabela({ id = "t1", numero = 8, colunaErro = "Erro recorrente a evitar", linhas = [] }) {
  return {
    id,
    labelType: "Quadro",
    labelNumber: numero,
    navigationOnly: false,
    rows: [
      {
        isHeader: true,
        cells: [
          { text: "Termo" },
          { text: "Definição operacional para o POP" },
          { text: colunaErro },
        ],
      },
      ...linhas.map((c) => ({ isHeader: false, cells: c.map((text) => ({ text })) })),
    ],
  };
}

describe("colheita dos erros", () => {
  it("só colhe de tabela que declara coluna de erro", () => {
    const semErro = tabela({ id: "x", colunaErro: "Observações gerais", linhas: [["A", "d", "e"]] });
    expect(colherErros({ tables: [semErro] })).toEqual([]);
  });

  it("ignora tabela de navegação", () => {
    const t = tabela({ linhas: [["ART", "d", "Aceitar ART genérica ou de objeto diverso."]] });
    t.navigationOnly = true;
    expect(colherErros({ tables: [t] })).toEqual([]);
  });

  it("descarta linha com erro curto demais para ensinar", () => {
    const t = tabela({ linhas: [["ART", "d", "Erro."], ["PCA", "d", "Confundir com memorial descritivo."]] });
    const r = colherErros({ tables: [t] });
    expect(r.map((e) => e.termo)).toEqual(["PCA"]);
  });

  it("guarda o rótulo da coluna, que decide erro contra limite", () => {
    const t = tabela({ linhas: [["ART", "d", "Aceitar ART genérica ou de objeto diverso."]] });
    expect(colherErros({ tables: [t] })[0].colunaDeErro).toBe("Erro recorrente a evitar");
  });
});

describe("vínculo com a aula", () => {
  const erros = [
    { termo: "PACUERA", erro: "Tratar como licença ou autorização de uso.", quadro: "Quadro 8", colunaDeErro: "Erro recorrente a evitar" },
    { termo: "LO", erro: "Confundir a fase com a renovação da operação.", quadro: "Quadro 8", colunaDeErro: "Erro recorrente a evitar" },
    { termo: "ART", erro: "Aceitar ART genérica ou emitida para objeto diverso.", quadro: "Quadro 8", colunaDeErro: "Erro recorrente a evitar" },
  ];

  it("liga por menção explícita, não por assunto", () => {
    const r = errosDaAula(erros, "Esta seção trata do PACUERA e do seu zoneamento.");
    expect(r.map((e) => e.termo)).toEqual(["PACUERA"]);
  });

  it("sigla curta exige limite de palavra", () => {
    // Sem isso, "LO" casa dentro de "LOCAL" e a aula recebe um erro que não
    // tem nada a ver com ela.
    expect(errosDaAula(erros, "O arranjo fica no LOCAL indicado pelo requerente.")).toEqual([]);
    expect(errosDaAula(erros, "A LO só é emitida depois da vistoria de conclusão.")).toHaveLength(1);
  });

  it("ignora acento e caixa", () => {
    expect(errosDaAula(erros, "o pacuera precisa de zoneamento")).toHaveLength(1);
  });

  it("privilegia o termo mais longo, que é o mais específico", () => {
    const r = errosDaAula(erros, "A LO do PACUERA depende da ART do responsável.", 2);
    expect(r.map((e) => e.termo)).toEqual(["PACUERA", "ART"]);
  });

  it("respeita o limite de itens", () => {
    expect(errosDaAula(erros, "PACUERA, LO e ART aparecem aqui.", 1)).toHaveLength(1);
  });

  it("devolve vazio para texto ausente", () => {
    expect(errosDaAula(erros, "")).toEqual([]);
    expect(errosDaAula(erros, null)).toEqual([]);
  });
});

describe("termo presente nos dois quadros", () => {
  const dois = [
    {
      termo: "Memorial Descritivo",
      erro: "Aceitar memorial como estudo ambiental ou como substituto de PCA.",
      quadro: "Quadro 8",
      colunaDeErro: "Erro recorrente a evitar",
    },
    {
      termo: "Memorial Descritivo",
      erro: "Não substitui estudo ambiental, diagnóstico de impactos ou programa.",
      quadro: "Quadro 22",
      colunaDeErro: "Limite e erro a evitar",
    },
  ];

  it("ocupa uma vaga só e não perde nenhum dos dois textos", () => {
    // Antes, os dois ocupavam duas das três vagas em 21 das 82 aulas que
    // recebem erro, dizendo a mesma coisa por dois ângulos.
    const r = errosDaAula(dois, "Esta seção analisa o Memorial Descritivo.");
    expect(r).toHaveLength(1);
    expect(r[0].erro).toContain("Aceitar memorial");
    expect(r[0].limite).toContain("Não substitui");
  });

  it("escolhe pelo rótulo da coluna, não pela ordem das tabelas", () => {
    // Invertida a ordem de entrada, o resultado tem de ser o mesmo: a coluna
    // "erro recorrente" nomeia a ação de quem analisa e vira o erro; a coluna
    // "limite" descreve o documento e vira complemento.
    const invertido = errosDaAula([dois[1], dois[0]], "Analisa o Memorial Descritivo.");
    expect(invertido).toHaveLength(1);
    expect(invertido[0].erro).toContain("Aceitar memorial");
    expect(invertido[0].limite).toContain("Não substitui");
  });
});

describe("contrato sobre o POP real", () => {
  const pop = JSON.parse(
    readFileSync(new URL("./data/pop-public-content.json", import.meta.url), "utf8"),
  );
  const erros = colherErros(pop);
  const porId = new Map(pop.blocks.map((b) => [b.id, b]));

  const daAula = pop.sections.map((secao) => {
    const texto = [
      secao.title || "",
      ...(secao.blockIds || [])
        .map((id) => porId.get(id))
        .map((b) => b?.paragraph?.text || ""),
    ].join(" ");
    return { secao, achados: errosDaAula(erros, texto) };
  });
  const comErro = daAula.filter((x) => x.achados.length);

  it("colhe os 36 erros que o POP escreveu", () => {
    // Eram 35 na minuta v1.7. O 36o entrou com a v1.9: "Diagnostico Climatico",
    // que o POP passou a listar entre os termos de erro recorrente.
    expect(erros.length).toBe(36);
  });

  it("cobre boa parte das seções", () => {
    expect(comErro.length).toBeGreaterThanOrEqual(70);
  });

  it("nunca repete o mesmo termo dentro de uma aula", () => {
    const repetidos = comErro
      .filter(({ achados }) => new Set(achados.map((e) => e.termo)).size !== achados.length)
      .map(({ secao }) => secao.title);
    expect(repetidos).toEqual([]);
  });

  it("todo texto exibido veio literalmente do POP", () => {
    const corpus = pop.tables
      .flatMap((t) => (t.rows || []).flatMap((r) => (r.cells || []).map((c) => c.text || "")))
      .join("\n")
      .replace(/\s+/g, " ");
    const inventados = [];
    for (const { secao, achados } of comErro) {
      for (const e of achados) {
        if (!corpus.includes(e.erro)) inventados.push(`${secao.title}: ${e.erro}`);
        if (e.limite && !corpus.includes(e.limite)) {
          inventados.push(`${secao.title} (limite): ${e.limite}`);
        }
      }
    }
    expect(inventados).toEqual([]);
  });

  it("todo erro exibido tem o termo citado na própria seção", () => {
    const semMencao = [];
    for (const { secao, achados } of comErro) {
      const texto = [
        secao.title || "",
        ...(secao.blockIds || []).map((id) => porId.get(id)?.paragraph?.text || ""),
      ]
        .join(" ")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
      for (const e of achados) {
        const t = e.termo.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
        if (!texto.includes(t)) semMencao.push(`${secao.title}: ${e.termo}`);
      }
    }
    expect(semMencao).toEqual([]);
  });
});
