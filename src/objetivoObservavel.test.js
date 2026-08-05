import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { emFrases, objetivoObservavel } from "./objetivoObservavel.js";

function paragrafo(texto) {
  return { type: "paragraph", paragraph: { text: texto } };
}

function quadro({ id = "t1", numero = 8, colunas, linhas = 10, nav = false }) {
  return {
    id,
    labelType: "Quadro",
    labelNumber: numero,
    caption: `Quadro ${numero} - teste`,
    navigationOnly: nav,
    rowCount: linhas,
    rows: [
      { isHeader: true, cells: colunas.map((text) => ({ text })) },
    ],
  };
}

function comQuadro(tabela) {
  return {
    blocos: [{ type: "table", tableId: tabela.id }],
    mapa: new Map([[tabela.id, tabela]]),
  };
}

const SECAO = { id: "s1", number: "5", title: "Teste" };

describe("emFrases", () => {
  it("não corta em abreviação seguida de espaço", () => {
    // "O art. 13 estabelece" tem ponto e espaço, igual a fim de frase. Cortar
    // ali produz a citação "13 estabelece", que perde o artigo de que fala.
    const frases = emFrases(
      "O art. 13 estabelece regra específica para empreendimentos causadores de impacto.",
    );
    expect(frases).toHaveLength(1);
    expect(frases[0]).toMatch(/^O art\. 13 estabelece/);
  });

  it("não corta em numeração normativa com ponto entre dígitos", () => {
    const frases = emFrases(
      "A análise observa o Decreto Estadual nº 9.541/2025 e a IN IAT nº 09/2025 vigentes.",
    );
    expect(frases).toHaveLength(1);
    expect(frases[0]).toContain("9.541/2025");
  });

  it("separa frases de verdade", () => {
    const frases = emFrases(
      "A primeira frase precisa passar do tamanho mínimo exigido pelo filtro. "
      + "A segunda frase também precisa passar do tamanho mínimo exigido.",
    );
    expect(frases).toHaveLength(2);
  });

  it("descarta fragmento curto demais para ser citado", () => {
    expect(emFrases("Curto. Também curto.")).toEqual([]);
  });
});

describe("origem quadro", () => {
  it("monta o objetivo a partir das colunas", () => {
    const { blocos, mapa } = comQuadro(
      quadro({
        numero: 8,
        linhas: 26,
        colunas: ["Termo", "Definição operacional para o POP", "Erro recorrente a evitar"],
      }),
    );
    const r = objetivoObservavel(SECAO, blocos, mapa);
    expect(r.origem).toBe("quadro");
    expect(r.referencia).toBe("Quadro 8");
    expect(r.objetivo).toBe("Percorrer as 25 linhas do Quadro 8 sem consultá-lo.");
    expect(r.comoSeVe).toBe(
      "Dada a coluna “Termo”, você reconstrói “Definição operacional para o POP” e “Erro recorrente a evitar”.",
    );
  });

  it("enumera corretamente com duas e com quatro colunas restantes", () => {
    const duas = comQuadro(quadro({ id: "a", colunas: ["Campo", "Informação"] }));
    expect(objetivoObservavel(SECAO, duas.blocos, duas.mapa).comoSeVe).toBe(
      "Dada a coluna “Campo”, você reconstrói “Informação”.",
    );

    const cinco = comQuadro(
      quadro({
        id: "b",
        colunas: ["Versão", "Data", "Descrição", "Responsável", "Aprovação"],
      }),
    );
    expect(objetivoObservavel(SECAO, cinco.blocos, cinco.mapa).comoSeVe).toBe(
      "Dada a coluna “Versão”, você reconstrói “Data”, “Descrição”, “Responsável” e “Aprovação”.",
    );
  });

  it("recusa índice navegável disfarçado de quadro", () => {
    // Índice tem "cabeçalho" que é conteúdo: o título inteiro de uma seção.
    // Aceitar isso produziria "Dada a coluna “1 Objetivo, escopo e limites do
    // POP”, você reconstrói ...", que não é objetivo de nada.
    const { blocos, mapa } = comQuadro(
      quadro({
        colunas: [
          "1 Objetivo, escopo e limites do POP com todo o texto do título aqui dentro",
          "18 Análise do Memorial Descritivo e dos estudos ambientais deste POP",
        ],
      }),
    );
    expect(objetivoObservavel(SECAO, blocos, mapa)).toBeNull();
  });

  it("ignora tabela marcada como navegação", () => {
    const { blocos, mapa } = comQuadro(
      quadro({ colunas: ["Campo", "Informação"], nav: true }),
    );
    expect(objetivoObservavel(SECAO, blocos, mapa)).toBeNull();
  });
});

describe("origem acao", () => {
  it("extrai a ação nomeada depois de deve", () => {
    const r = objetivoObservavel(SECAO, [
      paragrafo(
        "O analista deve identificar a data do protocolo, a fase processual e a regra de transição aplicável.",
      ),
    ]);
    expect(r.origem).toBe("acao");
    expect(r.objetivo).toBe(
      "Identificar a data do protocolo, a fase processual e a regra de transição aplicável.",
    );
  });

  it("aceita item de procedimento que já começa no infinitivo", () => {
    const r = objetivoObservavel(SECAO, [
      paragrafo("Identificar o documento apresentado ou a ausência do documento."),
    ]);
    expect(r.origem).toBe("acao");
    expect(r.objetivo).toBe(
      "Identificar o documento apresentado ou a ausência do documento.",
    );
  });

  it("recusa voz passiva, que descreve o documento e não a pessoa", () => {
    // "A leitura deve ser feita de forma cronológica" viraria "você consegue
    // ser feita de forma cronológica". O sujeito é outro.
    const r = objetivoObservavel(SECAO, [
      paragrafo(
        "A leitura do processo deve ser feita de forma cronológica e temática pelo setor.",
      ),
    ]);
    expect(r.origem).toBe("exigencia");
  });

  it("remove abreviação pendurada no fim da captura", () => {
    const r = objetivoObservavel(SECAO, [
      paragrafo(
        "O analista deve registrar a data de entrada em vigor e o regime aplicado, com atenção ao art. 5º do Decreto.",
      ),
    ]);
    expect(r.objetivo).not.toMatch(/art\.?\.$/);
    expect(r.objetivo).toBe(
      "Registrar a data de entrada em vigor e o regime aplicado.",
    );
  });

  it("corta cauda incompleta voltando até a vírgula", () => {
    // O teto de captura cai no meio da enumeração. Enumeração menor e inteira
    // é melhor do que maior e quebrada.
    const r = objetivoObservavel(SECAO, [
      paragrafo(
        `O analista deve verificar se o empreendimento foi implantado conforme a licença, `
        + `se as condicionantes foram atendidas, se os programas foram executados e se a `
        + `documentação apresentada comprova o cumprimento integral de cada obrigação assumida.`,
      ),
    ]);
    expect(r.objetivo.replace(/\.$/, "")).not.toMatch(/\b(e se a|do|da|com)$/);
    expect(r.objetivo).toMatch(/\.$/);
  });
});

describe("origem exigencia", () => {
  it("cita a exigência mais curta que cabe", () => {
    const r = objetivoObservavel(SECAO, [
      paragrafo("Toda manifestação técnica deve ser construída de forma rastreável."),
      paragrafo(
        "A manifestação deve ser construída de forma rastreável, com registro de cada "
        + "documento examinado, de cada fundamento invocado e de cada consequência adotada, "
        + "sem exceção em nenhuma das fases previstas neste procedimento operacional padrão.",
      ),
    ]);
    expect(r.origem).toBe("exigencia");
    expect(r.objetivo).toBe(
      "Aplicar o que o POP fixa aqui: “Toda manifestação técnica deve ser construída de forma rastreável”.",
    );
  });

  it("devolve null quando nem a exigência mais curta cabe no cabeçalho", () => {
    // Objetivo de 290 caracteres no cabeçalho não orienta ninguém. Truncar a
    // citação também não serve: faria a norma dizer o que ela não diz.
    const longa = `A obrigação deve ser estabelecida na fase de licenciamento em que se `
      + `encontrarem os empreendimentos ou atividades causadores de impactos negativos não `
      + `mitigáveis que não tiveram a compensação ambiental definida na fase de LI ou de LAS, `
      + `observado o regime jurídico vigente na data do protocolo de cada processo.`;
    expect(objetivoObservavel(SECAO, [paragrafo(longa)])).toBeNull();
  });
});

describe("quando não há base", () => {
  it("recusa seção de navegação", () => {
    expect(
      objetivoObservavel({ ...SECAO, navigationOnly: true }, [paragrafo("x".repeat(80))]),
    ).toBeNull();
  });

  it("recusa seção sem parágrafo próprio", () => {
    expect(objetivoObservavel(SECAO, [])).toBeNull();
    expect(objetivoObservavel(null)).toBeNull();
  });

  it("ignora parágrafo que é título", () => {
    expect(
      objetivoObservavel(SECAO, [
        { type: "paragraph", paragraph: { text: "O analista deve verificar tudo isso aqui agora.", headingLevel: 2 } },
      ]),
    ).toBeNull();
  });
});

describe("contrato sobre o POP real", () => {
  const pop = JSON.parse(
    readFileSync(new URL("./data/pop-public-content.json", import.meta.url), "utf8"),
  );
  const porId = new Map(pop.blocks.map((b) => [b.id, b]));
  const tabelas = new Map(pop.tables.map((t) => [t.id, t]));

  const resultados = pop.sections.map((secao) => ({
    secao,
    r: objetivoObservavel(
      secao,
      (secao.blockIds || []).map((id) => porId.get(id)).filter(Boolean),
      tabelas,
    ),
  }));
  const comObjetivo = resultados.filter(({ r }) => r);

  it("cobre a grande maioria das seções", () => {
    expect(comObjetivo.length).toBeGreaterThanOrEqual(140);
  });

  it("não repete objetivo entre seções", () => {
    // Era este o defeito que motivou o arquivo: 167 seções compartilhavam 11
    // objetivos, e um deles aparecia em 41 aulas.
    const textos = comObjetivo.map(({ r }) => r.objetivo);
    expect(new Set(textos).size).toBe(textos.length);
  });

  it("não termina objetivo em palavra de ligação", () => {
    const LIGACAO = new Set([
      "art", "inc", "lei", "decreto", "de", "da", "do", "e", "ou", "a", "o",
      "no", "na", "com", "para", "que", "se", "ao", "em", "por", "sem", "sob",
    ]);
    const quebrados = comObjetivo.filter(({ r }) => {
      const ultima = r.objetivo.replace(/[.\s]+$/, "").split(/\s+/).pop().toLowerCase();
      return LIGACAO.has(ultima);
    });
    expect(quebrados.map(({ secao }) => secao.title)).toEqual([]);
  });

  it("cita apenas texto que existe literalmente no POP", () => {
    const corpus = [
      ...pop.blocks.map((b) => b.paragraph?.text || ""),
      ...pop.tables.flatMap((t) =>
        (t.rows || []).flatMap((linha) => (linha.cells || []).map((c) => c.text || "")),
      ),
    ]
      .join("\n")
      .replace(/\s+/g, " ");

    const inventadas = [];
    for (const { secao, r } of comObjetivo) {
      const trechos = `${r.objetivo} ${r.comoSeVe}`.match(/“([^”]+)”/g) || [];
      for (const bruto of trechos) {
        const trecho = bruto.slice(1, -1);
        if (!corpus.includes(trecho)) inventadas.push(`${secao.title}: ${trecho}`);
      }
    }
    expect(inventadas).toEqual([]);
  });

  it("não usa travessão", () => {
    const comTravessao = comObjetivo.filter(
      ({ r }) => /[—–]/.test(r.objetivo) || /[—–]/.test(r.comoSeVe),
    );
    expect(comTravessao).toEqual([]);
  });

  it("mantém o objetivo curto o bastante para caber no cabeçalho", () => {
    const longos = comObjetivo
      .filter(({ r }) => r.objetivo.length > 240)
      .map(({ secao, r }) => `${secao.title} (${r.objetivo.length})`);
    expect(longos).toEqual([]);
  });
});
