// Mapa do Parana: bacias hidrograficas e usinas hidreletricas.
//
// SVG proprio, sem tiles externos. A aplicacao roda sob CSP restrita e precisa
// funcionar sem rede: tile de servidor externo seria bloqueado pela politica e
// sumiria offline, justamente em campo, que e onde o mapa serve.
//
// As fontes sao publicas: a divisao hidrografica oficial do Parana e o SIGA da
// ANEEL. Nada aqui vem da base de processos do IAT.
import React, { useMemo, useRef, useState } from 'react';
import { Map as MapIcon, Search, X, Layers3, Zap, ZoomIn, ZoomOut, Maximize2, Target, ChevronRight } from 'lucide-react';

const COR = { CGH: '#57d8bf', PCH: '#4cc4f5', UHE: '#9fb7ff' };
const ORDEM = ['CGH', 'PCH', 'UHE'];

const norm = (v) => (v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Faixas de potencia do Quadro 8 do POP. O limite superior e inclusivo, como no
// quadro: "ate 75 kW", "superior a 75 kW e ate 500 kW", e assim por diante.
const FAIXAS = [
  { sigla: 'MCH', ate: 0.075, rot: 'até 75 kW' },
  { sigla: 'MGH', ate: 0.5, rot: 'acima de 75 kW até 500 kW' },
  { sigla: 'CGH', ate: 5, rot: 'acima de 500 kW até 5 MW' },
  { sigla: 'PCH', ate: 30, rot: 'acima de 5 MW até 30 MW' },
  { sigla: 'UHE', ate: Infinity, rot: 'acima de 30 MW' },
];
const faixaDe = (mw) => FAIXAS.find((f) => mw <= f.ate) || FAIXAS[FAIXAS.length - 1];

// Exercicio de enquadramento sobre o registro publico.
//
// Por que vale a pena: o erro que o Quadro 8 nomeia e "tratar como CGH sem
// verificar potencia". O sorteio favorece os casos limitrofes, onde 5 MW e CGH
// e 5,2 MW ja e PCH, porque e ali que o enquadramento erra. E o feedback
// insiste no que o POP diz logo em seguida: tipologia e a entrada, nao a
// modalidade, que ainda depende de alagamento, IDA, supressao e territorio.
function ExercicioEnquadrar({ usinas, state, setState }) {
  const elegiveis = useMemo(() => (usinas || []).filter((u) => u.mw > 0), [usinas]);
  const sortear = React.useCallback(() => {
    // Peso maior perto das fronteiras de faixa: e la que o enquadramento erra.
    const peso = (u) => ([0.075, 0.5, 5, 30].some((l) => Math.abs(u.mw - l) / l < 0.25) ? 4 : 1);
    const total = elegiveis.reduce((a, u) => a + peso(u), 0);
    let n = Math.random() * total;
    for (const u of elegiveis) { n -= peso(u); if (n <= 0) return u; }
    return elegiveis[0];
  }, [elegiveis]);

  const [alvo, setAlvo] = useState(() => sortear());
  const [resposta, setResposta] = useState(null);
  const placar = state.enquadra || { acertos: 0, total: 0 };
  const certa = faixaDe(alvo.mw).sigla;

  const responder = (sigla) => {
    if (resposta) return;
    setResposta(sigla);
    setState((s) => {
      const p = s.enquadra || { acertos: 0, total: 0 };
      return { ...s, enquadra: { acertos: p.acertos + (sigla === certa ? 1 : 0), total: p.total + 1 } };
    });
  };
  const proxima = () => { setAlvo(sortear()); setResposta(null); };

  return (
    <section className="mp-exercicio">
      <header>
        <Target size={16} />
        <div>
          <strong>Enquadre pela potência</strong>
          <small>Usina do registro público da ANEEL. Diga a tipologia antes de conferir.</small>
        </div>
        {placar.total > 0 && <b>{placar.acertos}/{placar.total}</b>}
      </header>

      <div className="mp-ex-caso">
        <span className="mp-ex-mw">{alvo.mw.toLocaleString('pt-BR')} MW</span>
        <div>
          <strong>{alvo.nome}</strong>
          <small>{alvo.mun}{alvo.baciaPR ? ` · bacia ${alvo.baciaPR}` : ''} · {alvo.fase}</small>
        </div>
      </div>

      <div className="mp-ex-opcoes" role="group" aria-label="Tipologia">
        {FAIXAS.map((f) => {
          const est = !resposta ? '' : f.sigla === certa ? 'certa' : f.sigla === resposta ? 'errada' : '';
          return (
            <button key={f.sigla} className={est} onClick={() => responder(f.sigla)} disabled={!!resposta}>
              <b>{f.sigla}</b><small>{f.rot}</small>
            </button>
          );
        })}
      </div>

      {resposta && (
        <div className={'mp-ex-feedback' + (resposta === certa ? ' ok' : '')}>
          <p>
            {resposta === certa ? 'Correto. ' : `Não. ${alvo.mw.toLocaleString('pt-BR')} MW é ${certa}. `}
            Pelo Quadro 8, {certa} é {faixaDe(alvo.mw).rot}.
          </p>
          <p className="mp-ex-limite">
            A tipologia é a entrada do enquadramento, não a modalidade. Ela ainda depende de área de
            alagamento, IDA, supressão de vegetação e da compatibilidade territorial com unidades de
            conservação, e entre critérios prevalece o mais restritivo.
          </p>
          <button onClick={proxima}>Próxima usina <ChevronRight size={14} /></button>
        </div>
      )}
    </section>
  );
}

export default function MapaParana({ dados, state, setState }) {
  const [tipos, setTipos] = useState(() => new Set(ORDEM));
  const [busca, setBusca] = useState('');
  const [sel, setSel] = useState(null);          // usina selecionada
  const [bacia, setBacia] = useState(null);      // bacia sob o cursor
  const [baciaSel, setBaciaSel] = useState(null); // bacia escolhida, filtra a lista
  const listaRef = useRef(null);
  const svgRef = useRef(null);
  // Zoom por viewBox: sem biblioteca e sem tile externo, continua funcionando
  // offline e dentro da CSP. `vista` e a janela visivel em coordenadas do mapa.
  const [vista, setVista] = useState(null);
  const [camadas, setCamadas] = useState({ bacias: true, usinas: true, municipios: false });
  const arrasto = useRef(null);


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

  // Rotulos de municipio. Nao existe base municipal embarcada, e trazer uma
  // pesaria mais do que ajuda aqui: o que interessa neste mapa e onde ha usina.
  // Entao o rotulo marca os municipios QUE TEM usina, no centroide dos pontos
  // daquele municipio, e a legenda diz exatamente isso.
  const municipios = useMemo(() => {
    const acc = new Map();
    for (const u of dados.usinas || []) {
      for (const bruto of String(u.mun || '').split(',')) {
        const nome = bruto.replace(/\s*-\s*PR\s*$/i, '').trim();
        if (!nome) continue;
        const a = acc.get(nome) || { nome, x: 0, y: 0, n: 0 };
        a.x += u.x; a.y += u.y; a.n += 1;
        acc.set(nome, a);
      }
    }
    return [...acc.values()].map((m) => ({ nome: m.nome, x: m.x / m.n, y: m.y / m.n, n: m.n }))
      .sort((a, b) => b.n - a.n);
  }, [dados.usinas]);

  const larg = dados.largura, alt = dados.altura;
  const v = vista || { x: 0, y: 0, w: larg, h: alt };
  const escala = larg / v.w;                     // 1 = mapa inteiro
  const podeAproximar = escala < 8;
  const podeAfastar = escala > 1.02;

  const aplicar = (nx, ny, nw, nh) => {
    // Nunca deixa a janela sair do mapa nem passar do mapa inteiro.
    const w = Math.min(larg, Math.max(larg / 8, nw));
    const h = w * (alt / larg);
    setVista({
      x: Math.min(larg - w, Math.max(0, nx)),
      y: Math.min(alt - h, Math.max(0, ny)),
      w, h,
    });
  };
  const ampliar = (fator, cx = v.x + v.w / 2, cy = v.y + v.h / 2) => {
    const nw = v.w / fator;
    aplicar(cx - (cx - v.x) / fator, cy - (cy - v.y) / fator, nw, nw * (alt / larg));
  };
  const inteiro = () => setVista(null);

  // Converte ponto do ecra para coordenada do mapa, para o zoom seguir o cursor.
  const noMapa = (ev) => {
    const r = svgRef.current.getBoundingClientRect();
    return {
      cx: v.x + ((ev.clientX - r.left) / r.width) * v.w,
      cy: v.y + ((ev.clientY - r.top) / r.height) * v.h,
    };
  };
  const roda = (ev) => {
    ev.preventDefault();
    const { cx, cy } = noMapa(ev);
    ampliar(ev.deltaY < 0 ? 1.25 : 1 / 1.25, cx, cy);
  };
  const pegar = (ev) => {
    if (escala <= 1.02) return;                  // sem zoom nao ha o que arrastar
    arrasto.current = { ...noMapa(ev), x0: v.x, y0: v.y };
    svgRef.current.setPointerCapture?.(ev.pointerId);
  };
  const mover = (ev) => {
    if (!arrasto.current) return;
    const r = svgRef.current.getBoundingClientRect();
    const dx = ((ev.clientX - r.left) / r.width) * v.w;
    const dy = ((ev.clientY - r.top) / r.height) * v.h;
    aplicar(arrasto.current.x0 + (arrasto.current.cx - arrasto.current.x0 - dx),
            arrasto.current.y0 + (arrasto.current.cy - arrasto.current.y0 - dy), v.w, v.h);
  };
  const soltar = (ev) => {
    arrasto.current = null;
    svgRef.current.releasePointerCapture?.(ev.pointerId);
  };
  // Teclado: a mesma navegacao sem depender de mouse.
  const tecla = (ev) => {
    const passo = v.w * 0.15;
    const acoes = {
      '+': () => ampliar(1.3), '=': () => ampliar(1.3), '-': () => ampliar(1 / 1.3),
      '0': inteiro,
      ArrowLeft: () => aplicar(v.x - passo, v.y, v.w, v.h),
      ArrowRight: () => aplicar(v.x + passo, v.y, v.w, v.h),
      ArrowUp: () => aplicar(v.x, v.y - passo, v.w, v.h),
      ArrowDown: () => aplicar(v.x, v.y + passo, v.w, v.h),
    };
    if (acoes[ev.key]) { ev.preventDefault(); acoes[ev.key](); }
  };
  const camada = (id) => setCamadas((c) => ({ ...c, [id]: !c[id] }));

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
          <div className="mp-controles">
            <div className="mp-camadas" role="group" aria-label="Camadas do mapa">
              {[['bacias', 'Bacias'], ['usinas', 'Usinas'], ['municipios', 'Municípios']].map(([id, rot]) => (
                <button key={id} className={camadas[id] ? 'on' : ''} aria-pressed={camadas[id]}
                        onClick={() => camada(id)}>{rot}</button>
              ))}
            </div>
            <div className="mp-zoom" role="group" aria-label="Aproximar e afastar">
              <button onClick={() => ampliar(1.3)} disabled={!podeAproximar} aria-label="Aproximar"><ZoomIn size={15} /></button>
              <button onClick={() => ampliar(1 / 1.3)} disabled={!podeAfastar} aria-label="Afastar"><ZoomOut size={15} /></button>
              <button onClick={inteiro} disabled={!podeAfastar} aria-label="Ver o mapa inteiro"><Maximize2 size={15} /></button>
              <span aria-live="polite" aria-atomic="true">{escala.toFixed(1)}x</span>
            </div>
          </div>
          {/* Dito na tela, nao so no codigo: nao ha camada de imagem de
              satelite porque ela exigiria tiles de servidor externo, que a
              politica de seguranca bloqueia e que sumiriam sem rede,
              justamente em campo. O que se ve aqui e dado publico embarcado. */}
          <p className="mp-limite-camada">Sem camada de satélite: imagem de terceiro exigiria servidor externo, que a política de segurança bloqueia e que não funcionaria sem rede. Tudo aqui é dado público embarcado.</p>
          <p id="mp-ajuda-teclado" className="mp-ajuda-teclado">Com o mapa em foco: setas deslocam, mais e menos aproximam e afastam, zero volta ao mapa inteiro.</p>
          <svg ref={svgRef} viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} role="img" tabIndex={0}
               aria-describedby="mp-ajuda-teclado"
               className={escala > 1.02 ? 'mp-arrastavel' : ''}
               onWheel={roda} onPointerDown={pegar} onPointerMove={mover}
               onPointerUp={soltar} onPointerCancel={soltar} onKeyDown={tecla}
               aria-label={`Mapa do Paraná com ${(dados.bacias || []).length} bacias hidrográficas e ${usinas.length} usinas em exibição`}>
            {camadas.bacias && <g className="mp-bacias">
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
                      onClick={() => setBaciaSel((n) => (n === b.nome ? null : b.nome))} />
              ))}
            </g>}
            {camadas.municipios && (
              <g className="mp-municipios" aria-hidden="true">
                {municipios
                  // Com o mapa inteiro so cabem os municipios com mais usinas;
                  // conforme aproxima, entram os demais sem virar amontoado.
                  .filter((m, i) => i < Math.round(8 * escala * escala))
                  .map((m) => (
                    <text key={m.nome} x={m.x} y={m.y - 9} fontSize={7.5 / Math.sqrt(escala) * 1.35}>{m.nome}</text>
                  ))}
              </g>
            )}
            {camadas.usinas && <g className="mp-usinas">
              {usinas.map((u, i) => (
                <circle key={`${u.nome}-${i}`} cx={u.x} cy={u.y} r={raio(u)}
                        fill={COR[u.tipo]}
                        className={sel && sel.nome === u.nome && sel.x === u.x ? 'ativa' : ''}
                        onClick={() => escolher(u)}>
                  <title>{u.nome} · {u.tipo}{u.mw ? ` · ${u.mw} MW` : ''}</title>
                </circle>
              ))}
            </g>}
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
          {state && setState && <ExercicioEnquadrar usinas={dados.usinas} state={state} setState={setState} />}
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
