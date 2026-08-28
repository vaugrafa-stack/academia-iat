// Biblioteca operacional: busca, quadros, figuras, glossário, legislações,
// favoritos e anotações.
//
// Saiu de main.jsx como tela inteira, com seu próprio dado. A fronteira é o
// contrato `dados`: tudo que vem do POP derivado chega por uma propriedade só,
// em vez de ser lido do escopo do módulo. É o que permite montar esta tela em
// teste sem carregar a aplicação inteira.
//
// O que NÃO mudou nesta extração: comportamento, marcação e classes de estilo.
// Uma extração que aproveita para redesenhar impede saber, quando algo quebra,
// se foi a mudança de lugar ou a mudança de conteúdo.
import React, { useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  Database,
  ExternalLink,
  Filter,
  Image as ImageIcon,
  Library,
  Maximize2,
  Scale,
  Search,
  StickyNote,
  Table2,
} from "lucide-react";
import { PageHeader, Empty, TableRenderer } from "./ui.jsx";
import { norm } from "./derivados.js";
import { leiTokens, ordenaBusca, snippet } from "./busca.js";
import {
  buildNormativeLedger,
  resolveOfficialSource,
} from "./officialSources.js";
import { resumoDaNorma } from "./leiResumos";
import { tracks } from "./courseData";
import NormativeAuthorityAxes from "./NormativeAuthorityAxes.jsx";

const LIBRARY_AREAS = Object.freeze([
  ["buscar", "Buscar no POP", Search],
  ["tabelas", "Quadros e tabelas", Table2],
  ["figuras", "Figuras e fluxos", ImageIcon],
  ["glossario", "Glossário", BookMarked],
  ["legislacoes", "Legislações", Scale],
  ["favoritos", "Meus favoritos", Bookmark],
  ["anotacoes", "Minhas anotações", StickyNote],
]);

function useCompactLibraryNavigation() {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(max-width: 640px)").matches,
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }
    const query = window.matchMedia("(max-width: 640px)");
    const update = () => setIsCompact(query.matches);
    update();
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", update);
      return () => query.removeEventListener("change", update);
    }
    query.addListener?.(update);
    return () => query.removeListener?.(update);
  }, []);

  return isCompact;
}

export default function KnowledgeLibrary({
  state,
  openLesson,
  target,
  dados,
}) {
  const { popData, flowData, blockMap, tableMap, lessons, lessonMap, INDICE } =
    dados;
  const [tab, setTab] = useState("buscar"),
    [query, setQuery] = useState(""),
    [selectedTable, setSelectedTable] = useState(
      popData.tables.find((t) => !t.navigationOnly)?.id,
    );
  const compactNavigation = useCompactLibraryNavigation();
  useEffect(() => {
    if (!target) return;
    if (target.tab) setTab(target.tab);
    if (target.tabela) setSelectedTable(target.tabela);
  }, [target]);
  const leis = useMemo(() => {
    const s = popData.sections.find((x) =>
      /refer[eê]ncias normativas/i.test(x.title || ""),
    );
    return (s?.blockIds || [])
      .map((id) => blockMap.get(id)?.paragraph?.text || "")
      .filter(Boolean);
  }, [popData, blockMap]);
  const leiLedger = useMemo(() => buildNormativeLedger(leis), [leis]);
  const [leiSel, setLeiSel] = useState(0);
  const leiCitacoes = useMemo(() => {
    const ref = leis[leiSel] || "";
    const toks = leiTokens(ref);
    if (!toks.length) return [];
    const out = [];
    for (const l of lessons) {
      for (const id of l.blockIds || []) {
        const t = blockMap.get(id)?.paragraph?.text || "";
        if (
          t &&
          toks.some((tk) => t.includes(tk)) &&
          !/^(BRASIL|CONAMA|PARANÁ|INSTITUTO|AGÊNCIA|ABNT)/.test(t)
        ) {
          out.push({ lesson: l, text: t });
          if (out.length >= 10) return out;
        }
      }
    }
    return out;
  }, [leiSel, leis, lessons, blockMap]);
  const index = useMemo(() => INDICE.get(), [INDICE]);
  const matches =
    query.length > 1
      ? ordenaBusca(
          index.filter((x) =>
            norm(x.title + " " + x.text).includes(norm(query)),
          ),
          query,
        )
      : [];
  const results = matches.slice(0, 50);
  const table = tableMap.get(selectedTable);
  const glossary = popData.tables.find((t) =>
    /siglas e abreviações/i.test(t.title),
  );
  const filteredGlossary = glossary
    ? query.length > 1
      ? {
          ...glossary,
          rows: [
            glossary.rows[0],
            ...glossary.rows
              .slice(1)
              .filter((row) =>
                norm(row.cells.map((cell) => cell.text).join(" ")).includes(
                  norm(query),
                ),
              ),
          ],
        }
      : glossary
    : null;
  const glossaryResultCount = filteredGlossary
    ? Math.max(filteredGlossary.rows.length - 1, 0)
    : 0;
  const resultSummary =
    query.length > 1
      ? matches.length > results.length
        ? `Exibindo ${results.length} de ${matches.length} resultados.`
        : `${matches.length} ${matches.length === 1 ? "resultado encontrado" : "resultados encontrados"}.`
      : "";
  return (
    <div className="page library-page">
      <PageHeader
        title="Biblioteca operacional"
        subtitle="Pesquise na edição de treinamento, consulte quadros e tabelas e abra imagens do material-fonte."
        icon={Library}
      />
      {compactNavigation ? (
        <div className="library-mobile-nav">
          <label htmlFor="library-area-select">
            Área da biblioteca
          </label>
          <select
            id="library-area-select"
            value={tab}
            onChange={(event) => setTab(event.target.value)}
            aria-controls={`library-panel-${tab}`}
          >
            {LIBRARY_AREAS.map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <nav className="library-tabs" aria-label="Áreas da biblioteca">
          {LIBRARY_AREAS.map(([id, label, Icon]) => (
            <button
              type="button"
              aria-pressed={tab === id}
              aria-controls={`library-panel-${id}`}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
              key={id}
            >
              <Icon aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>
      )}
      {tab === "buscar" && (
        <section className="library-search" id="library-panel-buscar">
          <div className="big-search">
            <Search aria-hidden="true" />
            <input
              aria-label="Buscar na edição de treinamento do POP"
              aria-describedby={
                query.length > 1
                  ? "library-search-results-summary"
                  : undefined
              }
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex.: transferência de titularidade, PACUERA, APP, condicionante..."
            />
          </div>
          {resultSummary ? (
            <p
              id="library-search-results-summary"
              role="status"
              aria-live="polite"
              className="library-search-status"
            >
              {resultSummary}
            </p>
          ) : null}
          {query.length < 2 ? (
            <div className="search-start">
              <Database />
              <h2>Pesquise por tema, documento ou etapa</h2>
              <p>
                A busca percorre as seções e os conteúdos disponibilizados,
                preservando o vínculo com a aula correspondente.
              </p>
              <div>
                {[
                  "PACUERA",
                  "regra de transição",
                  "Licença de Operação",
                  "cartografia",
                  "condicionantes",
                ].map((x) => (
                  <button onClick={() => setQuery(x)} key={x}>
                    {x}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="search-results">
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() =>
                    r.type === "seção"
                      ? openLesson(r.id)
                      : r.type === "sigla"
                        ? setTab("glossario")
                        : (setSelectedTable(r.id), setTab("tabelas"))
                  }
                >
                  <span>{r.type}</span>
                  <div>
                    <strong>{r.title}</strong>
                    <p>{snippet(r.text, query)}</p>
                  </div>
                  <ChevronRight />
                </button>
              ))}
            </div>
          )}
        </section>
      )}
      {tab === "tabelas" && (
        <div className="table-library" id="library-panel-tabelas">
          <aside>
            <div className="table-library-heading">
              <Filter aria-hidden="true" />
              <span>Escolha um quadro ou tabela</span>
            </div>
            {popData.tables
              .filter((t) => !t.navigationOnly)
              .map((t) => (
                <button
                  className={selectedTable === t.id ? "active" : ""}
                  onClick={() => setSelectedTable(t.id)}
                  key={t.id}
                >
                  <span>
                    {t.labelType} {t.labelNumber}
                  </span>
                  <strong>{t.title}</strong>
                </button>
              ))}
          </aside>
          <section>{table && <TableRenderer table={table} />}</section>
        </div>
      )}
      {tab === "figuras" && (
        <div className="figure-library" id="library-panel-figuras">
          <h2>Figuras do POP</h2>
          <div className="figure-grid">
            {popData.figures.map((f) => (
              <figure key={f.id}>
                <button
                  onClick={() =>
                    window.open(f.publicPath, "_blank", "noopener,noreferrer")
                  }
                >
                  <img src={f.publicPath} alt={f.altText || f.title} />
                  <span>
                    <Maximize2 />
                  </span>
                </button>
                <figcaption>{f.caption}</figcaption>
              </figure>
            ))}
          </div>
          <h2>Fluxogramas comparados</h2>
          <div className="flow-gallery">
            {flowData.flowcharts.map((f) => (
              <figure key={f.id}>
                <a href={f.publicPath} target="_blank" rel="noreferrer">
                  <img src={f.publicPath} alt={`${f.title} · ${f.variant}`} />
                </a>
                <figcaption>
                  <span>{f.variant}</span>
                  <strong>
                    {f.number}. {f.title}
                  </strong>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
      {tab === "glossario" && (
        <div className="glossary-view" id="library-panel-glossario">
          <div>
            <h2>Siglas e abreviações</h2>
            <p>
              Consulta rápida do Anexo E do POP. Filtre pela sigla ou pelo termo
              por extenso.
            </p>
          </div>
          <div className="big-search glossario-busca">
            <Search aria-hidden="true" />
            <input
              aria-label="Filtrar siglas e abreviações do POP"
              aria-describedby="library-glossary-results-summary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex.: PACUERA, ADA, TVR, RTAA..."
            />
          </div>
          <p
            className="library-search-status"
            id="library-glossary-results-summary"
            role="status"
            aria-live="polite"
          >
            {glossaryResultCount}{" "}
            {glossaryResultCount === 1
              ? "sigla encontrada"
              : "siglas encontradas"}
            .
          </p>
          {filteredGlossary && (
            <TableRenderer
              table={filteredGlossary}
              compact
            />
          )}
        </div>
      )}
      {tab === "legislacoes" && (
        <>
          <NormativeAuthorityAxes compact />
          <div className="leis-view" id="library-panel-legislacoes">
          <aside className="leis-list">
            <div className="leis-head">
              <Scale />
              <span>{leis.length} normas referenciadas no POP</span>
            </div>
            {leis.map((l, i) => (
              <button
                key={i}
                className={leiSel === i ? "active" : ""}
                onClick={() => {
                  setLeiSel(i);
                  if (window.innerWidth < 980)
                    setTimeout(
                      () =>
                        document.querySelector(".leis-detail")?.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        }),
                      60,
                    );
                }}
              >
                <small>{l.split(".")[0]}</small>
                <strong>{l.replace(/^[^.]+\.\s*/, "").split(". ")[0]}</strong>
              </button>
            ))}
          </aside>
          <section className="leis-detail">
            {leis[leiSel] && (
              <>
                <h2>{leis[leiSel].replace(/^[^.]+\.\s*/, "").split(". ")[0]}</h2>
                <p className="leis-ref">
                  <BookMarked size={15} /> Referência integral registrada no
                  POP: <em>{leis[leiSel]}</em>
                </p>
                <div className="leis-actions">
                  {(() => {
                    const fonte = resolveOfficialSource(leis[leiSel]);
                    const registro = leiLedger[leiSel];
                    if (!fonte)
                      return (
                        <p className="fonte-nao-mapeada" role="status">
                          Esta referência ainda não possui vínculo oficial
                          mapeado. Confirme a fonte com a revisão responsável
                          antes de aplicar.
                        </p>
                      );
                    return (
                      <>
                        <a
                          className={
                            fonte.kind === "direct" ? "primary" : "fonte-busca"
                          }
                          href={fonte.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink size={15} /> {fonte.label}
                        </a>
                        <div
                          className="fonte-governanca"
                          aria-label="Governança da fonte"
                        >
                          <span>
                            {fonte.kind === "direct"
                              ? "Fonte oficial vinculada"
                              : "Índice oficial: localizar o ato"}
                          </span>
                          <span>
                            Link conferido em{" "}
                            {new Date(
                              `${fonte.checkedAt}T12:00:00`,
                            ).toLocaleDateString("pt-BR")}
                          </span>
                          <span>Autoridade: {registro.authority}</span>
                          <span>Escopo: {registro.scope}</span>
                          <span>Situação temporal: {registro.temporalStatus}</span>
                          <span>Lastro: {registro.epistemicStatus}</span>
                          <span>Estado de revisão: {registro.humanReview}</span>
                        </div>
                        <small className="fonte-nota">{fonte.note}</small>
                      </>
                    );
                  })()}
                </div>
                {resumoDaNorma(leis[leiSel]) && (
                  <div className="leis-resumo">
                    <h3>Sobre esta norma</h3>
                    <p>{resumoDaNorma(leis[leiSel])}</p>
                  </div>
                )}
                <h3>Onde o POP aplica esta norma</h3>
                {leiCitacoes.length ? (
                  <ul className="leis-cites">
                    {leiCitacoes.map((c, k) => (
                      <li key={k}>
                        <button onClick={() => openLesson(c.lesson.id)}>
                          <small>
                            {c.lesson.number ? c.lesson.number + " · " : ""}
                            {c.lesson.title}
                          </small>
                          <p>
                            {c.text.length > 260
                              ? c.text.slice(0, 260) + "…"
                              : c.text}
                          </p>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="leis-none">
                    Esta norma consta da lista de referências do POP; o resumo
                    acima orienta o contexto de aplicação.
                  </p>
                )}
              </>
            )}
          </section>
          </div>
        </>
      )}
      {tab === "anotacoes" && (
        <div className="notas-view" id="library-panel-anotacoes">
          {(() => {
            const notas = Object.entries(state.notes || {})
              .map(([id, txt]) => ({
                l: lessonMap.get(id),
                txt: (txt || "").trim(),
              }))
              .filter((n) => n.l && n.txt);
            return notas.length ? (
              <>
                {notas.map(({ l, txt }) => (
                  <article key={l.id} className="nota-card">
                    <button
                      className="nota-head"
                      onClick={() => openLesson(l.id)}
                    >
                      <small>
                        {tracks.find((t) => t.id === l.trackId)?.code}
                      </small>
                      <strong>
                        {l.number ? l.number + " " : ""}
                        {l.title}
                      </strong>
                      <ChevronRight size={15} />
                    </button>
                    <p>{txt}</p>
                  </article>
                ))}
              </>
            ) : (
              <Empty text="Você ainda não escreveu anotações. Abra uma aula e use a aba Anotações para registrar dúvidas e exemplos do seu trabalho." />
            );
          })()}
        </div>
      )}
      {tab === "favoritos" && (
        <div className="favorites-view" id="library-panel-favoritos">
          {(() => {
            const favs = state.bookmarks
              .map((id) => lessonMap.get(id))
              .filter(Boolean);
            return favs.length ? (
              favs.map((l) => (
                <button key={l.id} onClick={() => openLesson(l.id)}>
                  <BookmarkCheck />
                  <span>
                    <small>{tracks.find((t) => t.id === l.trackId)?.code}</small>
                    <strong>
                      {l.number ? `${l.number} ` : ""}
                      {l.title}
                    </strong>
                  </span>
                  <ChevronRight />
                </button>
              ))
            ) : (
              <Empty text="Você ainda não salvou nenhuma aula. Use o ícone de favorito no cabeçalho de uma aula." />
            );
          })()}
        </div>
      )}
    </div>
  );
}
