// Mapa do Parana: bacias hidrograficas e usinas hidreletricas.
//
// SVG proprio, sem tiles externos. A aplicacao roda sob CSP restrita e precisa
// funcionar sem rede: tile de servidor externo seria bloqueado pela politica e
// sumiria offline, justamente em campo, que e onde o mapa serve.
//
// As fontes sao publicas: a divisao hidrografica oficial do Parana e o SIGA da
// ANEEL. Nada aqui vem da base de processos do IAT.
import React, { useMemo, useRef, useState } from 'react';
import { Map as MapIcon, Search, X, Layers3, Zap } from 'lucide-react';

const COR = { CGH: '#57d8bf', PCH: '#4cc4f5', UHE: '#9fb7ff' };
const ORDEM = ['CGH', 'PCH', 'UHE'];

const norm = (v) => (v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export default function MapaParana({ dados }) {
  const [tipos, setTipos] = useState(() => new Set(ORDEM));
  const [busca, setBusca] = useState('');
  const [sel, setSel] = useState(null);          // usina selecionada
  const [bacia, setBacia] = useState(null);      // bacia sob o cursor
  const [baciaSel, setBaciaSel] = useState(null); // bacia escolhida, filtra a lista
  const listaRef = useRef(null);

  const usinas = useMemo(() => {
    const q = norm(busca);
    return (dados.usinas || []).filter(
      (u) => tipos.has(u.tipo)
        && (!baciaSel || u.baciaPR === baciaSel)
        && (!q || norm(`${u.nome} ${u.mun} ${u.bacia}`).includes(q)),
    );
  }, [dados.usinas, tipos, busca, baciaSel]);

  const infoBacia = (dados.bacias || []).find((b) => b.nome === (bacia || baciaSel));

  const porTipo = useMemo(() => {
    const c = {};
    for (const u of dados.usinas || []) c[u.tipo] = (c[u.tipo] || 0) + 1;
    return c;
  }, [dados.usinas]);

  const alternar = (t) => setTipos((s) => {
    const n = new Set(s);
    if (n.has(t)) n.delete(t); else n.add(t);
    return n.size ? n : new Set(ORDEM);   // nunca some com tudo
  });

  const escolher = (u) => {
    setSel(u);
    // Traz o item da lista para a vista quando a escolha veio do mapa.
    requestAnimationFrame(() => {
      listaRef.current?.querySelector('.mp-item.ativo')?.scrollIntoView({ block: 'nearest' });
    });
  };

  const raio = (u) => (u.mw ? Math.max(3.2, Math.min(11, 3 + Math.sqrt(u.mw) * 0.75)) : 3.2);

  return (
    <div className="page mapa-page">
      <header className="page-header">
        <span><MapIcon /></span>
        <div>
          <small className="ph-kicker">TERRITÓRIO</small>
          <h1>Mapa das hidrelétricas do Paraná</h1>
          <p>As {(dados.usinas || []).length} usinas do registro da ANEEL sobre as {(dados.bacias || []).length} bacias hidrográficas do Estado. O tamanho do ponto acompanha a potência.</p>
        </div>
      </header>

      <div className="mapa-layout">
        <figure className="mp-quadro">
          <svg viewBox={`0 0 ${dados.largura} ${dados.altura}`} role="img"
               aria-label={`Mapa do Paraná com ${(dados.bacias || []).length} bacias hidrográficas e ${usinas.length} usinas em exibição`}>
            <g className="mp-bacias">
              {(dados.bacias || []).map((b, i) => (
                // Alterna o tom para a divisao ficar legivel: 16 bacias no mesmo
                // preenchimento viram uma mancha unica e o mapa perde a funcao.
                // Sem <title>: o tooltip nativo do navegador e feio, chega
                // atrasado e nao cabe informacao. A bacia passa a falar no
                // painel abaixo do mapa, e o clique filtra a lista.
                <path key={b.nome} d={b.d}
                      className={(baciaSel === b.nome ? 'escolhida' : bacia === b.nome ? 'ativa' : '') + (i % 2 ? ' par' : '')}
                      onMouseEnter={() => setBacia(b.nome)}
                      onMouseLeave={() => setBacia(null)}
                      onClick={() => setBaciaSel((v) => (v === b.nome ? null : b.nome))} />
              ))}
            </g>
            <g className="mp-usinas">
              {usinas.map((u, i) => (
                <circle key={`${u.nome}-${i}`} cx={u.x} cy={u.y} r={raio(u)}
                        fill={COR[u.tipo]}
                        className={sel && sel.nome === u.nome && sel.x === u.x ? 'ativa' : ''}
                        onClick={() => escolher(u)}>
                  <title>{u.nome} · {u.tipo}{u.mw ? ` · ${u.mw} MW` : ''}</title>
                </circle>
              ))}
            </g>
          </svg>
          <figcaption>
            {infoBacia ? (
              <>
                <Layers3 size={14} />
                <span className="mp-bacia-nome">Bacia {infoBacia.nome}</span>
                {infoBacia.area != null && <span>{infoBacia.area.toLocaleString('pt-BR')} km²</span>}
                <span>{infoBacia.usinas} {infoBacia.usinas === 1 ? 'usina' : 'usinas'}</span>
                {baciaSel === infoBacia.nome
                  ? <button className="mp-limpar" onClick={() => setBaciaSel(null)}>ver todas <X size={12} /></button>
                  : <em>clique para filtrar</em>}
              </>
            ) : (
              <>Passe sobre uma bacia para identificá-la, clique para filtrar a lista. Clique num ponto para ver a usina.</>
            )}
          </figcaption>
        </figure>

        <aside className="mp-painel">
          <div className="mp-filtros" role="group" aria-label="Filtrar por tipologia">
            {ORDEM.map((t) => (
              <button key={t} className={tipos.has(t) ? 'ativo' : ''} onClick={() => alternar(t)}
                      aria-pressed={tipos.has(t)}>
                <i style={{ background: COR[t] }} aria-hidden="true" />
                {t} <small>{porTipo[t] || 0}</small>
              </button>
            ))}
          </div>

          <div className="mp-busca">
            <Search size={16} />
            <input value={busca} onChange={(e) => setBusca(e.target.value)}
                   placeholder="Buscar usina, município ou bacia..." aria-label="Buscar usina, município ou bacia" />
            {busca && <button onClick={() => setBusca('')} aria-label="Limpar busca"><X size={14} /></button>}
          </div>

          {sel && (
            <article className="mp-detalhe">
              <header>
                <span className="mp-tag" style={{ color: COR[sel.tipo], borderColor: COR[sel.tipo] }}>{sel.tipo}</span>
                <strong>{sel.nome}</strong>
                <button onClick={() => setSel(null)} aria-label="Fechar detalhe"><X size={15} /></button>
              </header>
              <dl>
                {sel.mw != null && <><dt>Potência</dt><dd>{sel.mw.toLocaleString('pt-BR')} MW</dd></>}
                {sel.fase && <><dt>Situação</dt><dd>{sel.fase}</dd></>}
                {sel.mun && <><dt>Município</dt><dd>{sel.mun}</dd></>}
                {sel.bacia && <><dt>Sub-bacia</dt><dd>{sel.bacia}</dd></>}
              </dl>
            </article>
          )}

          <div className="mp-lista" ref={listaRef}>
            <div className="mp-lista-cab">{usinas.length} de {(dados.usinas || []).length} em exibição{baciaSel ? ` · bacia ${baciaSel}` : ''}</div>
            {usinas.map((u, i) => (
              <button key={`${u.nome}-${i}`}
                      className={'mp-item' + (sel && sel.nome === u.nome && sel.x === u.x ? ' ativo' : '')}
                      onClick={() => setSel(u)}>
                <i style={{ background: COR[u.tipo] }} aria-hidden="true" />
                <span>
                  <strong>{u.nome}</strong>
                  <small>{u.tipo}{u.mw != null ? ` · ${u.mw.toLocaleString('pt-BR')} MW` : ''}{u.mun ? ` · ${u.mun}` : ''}</small>
                </span>
              </button>
            ))}
            {!usinas.length && <p className="mp-vazio">Nenhuma usina corresponde ao filtro.</p>}
          </div>
        </aside>
      </div>

      <footer className="mp-fontes">
        <Zap size={14} />
        <div>
          <strong>Fontes</strong>
          <ul>{(dados.fontes || []).map((f) => <li key={f}>{f}</li>)}</ul>
          <p>Registro de empreendimentos de geração, não situação de licenciamento. Confirme a informação vigente na fonte oficial antes de usar em análise.</p>
        </div>
      </footer>
    </div>
  );
}
