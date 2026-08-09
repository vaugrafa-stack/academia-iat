// Mapa do Parana: bacias hidrograficas e usinas hidreletricas.
//
// O SVG proprio continua completo sem rede. Quando a pessoa ativa a camada de
// satelite, imagens online Web Mercator entram por baixo das geometrias locais.
//
// As fontes sao publicas: a divisao hidrografica oficial do Parana e o SIGA da
// ANEEL. Nada aqui vem da base de processos do IAT.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Map as MapIcon, Search, X, Layers3, Zap, ZoomIn, ZoomOut, Maximize2, Target, ChevronRight } from 'lucide-react';
import mapaDadosUrl from './data/mapa-parana.json?url';
import {
  SATELLITE_INFO_URL,
  useSatelliteLayer,
} from './satelliteLayer.js';

const COR = { CGH: '#57d8bf', PCH: '#4cc4f5', UHE: '#9fb7ff' };
const ORDEM = ['CGH', 'PCH', 'UHE'];

let promessaMapa = null;
let cacheMapa = null;

export function validarDadosMapa(dados) {
  if (!dados || typeof dados !== 'object') {
    throw new Error('mapa-parana.json: objeto raiz ausente');
  }
  if (!Number.isFinite(dados.largura) || !Number.isFinite(dados.altura)) {
    throw new Error('mapa-parana.json: dimensoes invalidas');
  }
  if (!Array.isArray(dados.bacias) || !dados.bacias.length) {
    throw new Error('mapa-parana.json: bacias ausentes');
  }
  if (!Array.isArray(dados.usinas) || !dados.usinas.length) {
    throw new Error('mapa-parana.json: usinas ausentes');
  }
  if (!Array.isArray(dados.fontes) || !dados.tileProjection) {
    throw new Error('mapa-parana.json: fontes ou projecao ausentes');
  }
  return dados;
}

/** Dados vetoriais do mapa. A promessa compartilhada evita buscas duplicadas. */
export function carregarDadosMapa({ recarregar = false } = {}) {
  if (recarregar) {
    cacheMapa = null;
    promessaMapa = null;
  }
  if (cacheMapa) return Promise.resolve(cacheMapa);
  if (!promessaMapa) {
    promessaMapa = fetch(mapaDadosUrl)
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`mapa-parana.json: HTTP ${resposta.status}`);
        return resposta.json();
      })
      .then(validarDadosMapa)
      .then((dados) => {
        cacheMapa = dados;
        return dados;
      })
      .catch((erro) => {
        promessaMapa = null;
        throw erro;
      });
  }
  return promessaMapa;
}

const norm = (v) => (v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Faixas de potencia do Quadro 8 do POP. O limite superior e inclusivo, como no
// quadro: "ate 75 kW", "superior a 75 kW e ate 500 kW", e assim por diante.
const FAIXAS_DIDATICAS = [
  { sigla: 'MCH', ate: 0.075, rot: 'até 75 kW' },
  { sigla: 'MGH', ate: 0.5, rot: 'acima de 75 kW até 500 kW' },
  { sigla: 'CGH', ate: 5, rot: 'acima de 500 kW até 5 MW' },
  { sigla: 'PCH', ate: 30, rot: 'acima de 5 MW até 30 MW' },
  { sigla: 'UHE', ate: Infinity, rot: 'acima de 30 MW' },
];
export const faixaDidaticaDe = (mw) => {
  if (!Number.isFinite(mw) || mw < 0) return null;
  return FAIXAS_DIDATICAS.find((f) => mw <= f.ate) || FAIXAS_DIDATICAS[FAIXAS_DIDATICAS.length - 1];
};

// O catalogo pode conter centenas de usinas. So uma delas entra na sequencia
// de Tab; as demais continuam acessiveis pelas setas, Home, End, Page Up e
// Page Down. Isso evita que a pessoa precise pressionar Tab uma centena de
// vezes para chegar ao proximo controle da pagina.
export function indiceCatalogoPorTecla(tecla, atual, total) {
  if (!Number.isInteger(total) || total <= 0) return null;
  const indice = Number.isInteger(atual) && atual >= 0 ? atual : 0;
  if (tecla === 'ArrowDown') return Math.min(indice + 1, total - 1);
  if (tecla === 'ArrowUp') return Math.max(indice - 1, 0);
  if (tecla === 'PageDown') return Math.min(indice + 10, total - 1);
  if (tecla === 'PageUp') return Math.max(indice - 10, 0);
  if (tecla === 'Home') return 0;
  if (tecla === 'End') return total - 1;
  return null;
}

// Exercicio de comparacao entre duas lentes diferentes: o tipo publicado no
// registro consultado e a faixa de potencia usada didaticamente no Quadro 8.
//
// O resultado do exercicio nao corrige nem reclassifica o registro da ANEEL. A
// divergencia e uma pista para conferir fonte, data, ato e finalidade de cada
// classificacao, nunca uma conclusao regulatoria automatica.
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
  const faixaDidatica = faixaDidaticaDe(alvo.mw);
  const certa = faixaDidatica.sigla;

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
          <strong>Compare registro e faixa por potência</strong>
          <small>Responda pela faixa didática do Quadro 8 do POP, não pelo tipo cadastrado.</small>
        </div>
        {placar.total > 0 && <b>{placar.acertos}/{placar.total}</b>}
      </header>

      <div className="mp-ex-caso">
        <span className="mp-ex-mw">{alvo.mw.toLocaleString('pt-BR')} MW</span>
        <div>
          <strong>{alvo.nome}</strong>
          <small>
            Registro ANEEL: {alvo.tipo} · {alvo.mun}
            {alvo.baciaPR ? ` · bacia ${alvo.baciaPR}` : ''} · {alvo.fase}
          </small>
        </div>
      </div>

      <div className="mp-ex-opcoes" role="group" aria-label="Faixa didática de potência do POP">
        {FAIXAS_DIDATICAS.map((f) => {
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
            {resposta === certa ? 'Correto para a faixa didática. ' : `Não. Pela faixa didática, ${alvo.mw.toLocaleString('pt-BR')} MW corresponde a ${certa}. `}
            No Quadro 8 do POP, {certa} abrange {faixaDidatica.rot}.
          </p>
          <p className="mp-ex-limite">
            O tipo publicado no registro consultado é {alvo.tipo}. Se ele divergir de {certa}, isso não
            comprova erro nem autoriza reclassificação: registro/ato setorial e faixa didática têm
            finalidades que devem ser conferidas na fonte oficial e no caso concreto.
          </p>
          <p className="mp-ex-limite">
            Nem o tipo do registro nem a faixa por potência, isoladamente, definem a modalidade ambiental
            ou a suficiência documental. A análise ainda deve considerar os demais critérios e a norma
            aplicável à data do protocolo.
          </p>
          <button onClick={proxima}>Próxima usina <ChevronRight size={14} /></button>
        </div>
      )}
    </section>
  );
}

function MapaConteudo({ dados, state, setState }) {
  const [tipos, setTipos] = useState(() => new Set(ORDEM));
  const [busca, setBusca] = useState('');
  const [sel, setSel] = useState(null);          // usina selecionada
  const [itemTabulavel, setItemTabulavel] = useState(null);
  const [bacia, setBacia] = useState(null);      // bacia sob o cursor
  const [baciaSel, setBaciaSel] = useState(null); // bacia escolhida, filtra a lista
  const listaRef = useRef(null);
  const svgRef = useRef(null);
  // Zoom por viewBox: a navegacao e as camadas locais continuam funcionando
  // offline. `vista` e a janela visivel em coordenadas do mapa.
  const [vista, setVista] = useState(null);
  const [camadas, setCamadas] = useState({
    bacias: true,
    usinas: true,
    municipios: false,
    satelite: false,
  });
  const arrasto = useRef(null);


  const usinas = useMemo(() => {
    const q = norm(busca);
    return (dados.usinas || []).filter(
      (u) => tipos.has(u.tipo)
        && (!baciaSel || u.baciaPR === baciaSel)
        && (!q || norm(`${u.nome} ${u.mun} ${u.bacia}`).includes(q)),
    );
  }, [dados.usinas, tipos, busca, baciaSel]);

  // A identidade vem da posicao na base original, nao do filtro corrente. Ela
  // permanece estavel quando busca, tipo ou bacia mudam e tambem diferencia
  // registros que eventualmente tenham o mesmo nome.
  const indicePorUsina = useMemo(
    () => new Map((dados.usinas || []).map((u, indice) => [u, indice])),
    [dados.usinas],
  );
  const itemTabulavelEfetivo = useMemo(() => {
    if (!usinas.length) return null;
    if (usinas.some((u) => indicePorUsina.get(u) === itemTabulavel)) return itemTabulavel;
    if (sel && usinas.includes(sel)) return indicePorUsina.get(sel);
    return indicePorUsina.get(usinas[0]);
  }, [indicePorUsina, itemTabulavel, sel, usinas]);

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

  const escolher = (u, { focar = false } = {}) => {
    const indice = indicePorUsina.get(u);
    if (Number.isInteger(indice)) setItemTabulavel(indice);
    setSel(u);
    // Traz o item da lista para a vista quando a escolha veio do mapa.
    const agendar = typeof requestAnimationFrame === 'function'
      ? requestAnimationFrame
      : (callback) => setTimeout(callback, 0);
    agendar(() => {
      const item = Number.isInteger(indice)
        ? listaRef.current?.querySelector(`[data-usina-indice="${indice}"]`)
        : null;
      item?.scrollIntoView?.({ block: 'nearest' });
      if (focar) item?.focus({ preventScroll: true });
    });
  };

  const navegarCatalogo = (evento, indiceVisivel) => {
    if (evento.altKey || evento.ctrlKey || evento.metaKey) return;
    const proximo = indiceCatalogoPorTecla(evento.key, indiceVisivel, usinas.length);
    if (proximo == null) return;
    evento.preventDefault();
    escolher(usinas[proximo], { focar: true });
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
  const satelite = useSatelliteLayer({
    active: camadas.satelite,
    projection: dados.tileProjection,
    largura: larg,
    altura: alt,
    vista: v,
    escala,
  });

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
              {[['bacias', 'Bacias'], ['usinas', 'Usinas'], ['municipios', 'Municípios'], ['satelite', 'Satélite']].map(([id, rot]) => (
                <button key={id} className={camadas[id] ? 'on' : ''} aria-pressed={camadas[id]}
                        title={id === 'satelite' ? 'Imagem de satélite carregada pela internet' : undefined}
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
          <p className="mp-limite-camada">
            Bacias, usinas, busca e filtros funcionam sem internet. A camada Satélite é opcional e
            carrega imagens online somente quando ativada.
          </p>
          <p className="mp-limite-camada">
            Os rótulos CGH, PCH e UHE dos pontos reproduzem o tipo do registro consultado. A faixa MCH,
            MGH, CGH, PCH ou UHE calculada no exercício é apenas a leitura didática da potência pelo POP;
            uma divergência exige conferência oficial e não altera o cadastro automaticamente.
          </p>
          <p id="mp-ajuda-teclado" className="mp-ajuda-teclado">Com o mapa em foco: setas deslocam, mais e menos aproximam e afastam, zero volta ao mapa inteiro. Para selecionar uma bacia sem mouse, use a lista “Bacia hidrográfica” no painel.</p>
          <div className="mp-map-stage">
            <svg ref={svgRef} viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} role="img" tabIndex={0}
                 aria-describedby="mp-ajuda-teclado"
                 className={[
                   escala > 1.02 ? 'mp-arrastavel' : '',
                   camadas.satelite && satelite.online ? 'mp-satelite-on' : '',
                 ].filter(Boolean).join(' ')}
                 onWheel={roda} onPointerDown={pegar} onPointerMove={mover}
                 onPointerUp={soltar} onPointerCancel={soltar} onKeyDown={tecla}
                 aria-label={`Mapa do Paraná com ${(dados.bacias || []).length} bacias hidrográficas e ${usinas.length} usinas em exibição`}>
              {camadas.satelite && satelite.online && (
                <g className="mp-satelite" aria-hidden="true">
                  {satelite.grid.tiles.map((tile, tileIndex) => (
                    <image
                      key={`${tile.id}:${satelite.retryKey}`}
                      href={`${tile.href}${satelite.retryKey ? `?retry=${satelite.retryKey}` : ''}`}
                      x={tile.x}
                      y={tile.y}
                      width={tile.width}
                      height={tile.height}
                      preserveAspectRatio="none"
                      onLoad={() => satelite.registrar('loaded', satelite.currentTileKeys[tileIndex])}
                      onError={() => satelite.registrar('failed', satelite.currentTileKeys[tileIndex])}
                    />
                  ))}
                </g>
              )}
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

            {camadas.satelite && satelite.status === 'loading' && (
              <div className="mp-satelite-estado" role="status">Carregando imagens de satélite…</div>
            )}
            {camadas.satelite && satelite.status === 'offline' && (
              <div className="mp-satelite-estado aviso" role="status">
                A imagem de satélite precisa de internet. O mapa vetorial continua disponível.
              </div>
            )}
            {camadas.satelite && satelite.status === 'error' && (
              <div className="mp-satelite-estado aviso" role="alert">
                <span>Não foi possível carregar a imagem de satélite agora.</span>
                <button type="button" onClick={satelite.retry}>Tentar novamente</button>
              </div>
            )}
            {camadas.satelite && satelite.status === 'partial' && (
              <div className="mp-satelite-estado aviso" role="status">
                <span>Algumas imagens de satélite não carregaram.</span>
                <button type="button" onClick={satelite.retry}>Recarregar</button>
              </div>
            )}
            {camadas.satelite && ['ready', 'partial'].includes(satelite.status) && (
              <a
                className="mp-satelite-credito"
                href={SATELLITE_INFO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Imagens: {satelite.attribution}
              </a>
            )}
          </div>
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
              <>Passe sobre uma bacia para identificá-la, clique para filtrar a lista ou use a lista “Bacia hidrográfica” no painel. Clique num ponto para ver a usina.</>
            )}
          </figcaption>
        </figure>

        <aside className="mp-painel">
          {state && setState && <ExercicioEnquadrar usinas={dados.usinas} state={state} setState={setState} />}
          <div className="mp-busca">
            <Layers3 size={16} aria-hidden="true" />
            <label htmlFor="mp-bacia-select" className="sr-only">Filtrar usinas por bacia hidrográfica</label>
            <select
              id="mp-bacia-select"
              value={baciaSel || ''}
              onChange={(e) => setBaciaSel(e.target.value || null)}
              aria-describedby="mp-ajuda-teclado"
              style={{ flex: 1, minWidth: 0, border: 0, background: 'transparent', color: 'inherit', font: 'inherit' }}
            >
              <option value="">Todas as bacias hidrográficas</option>
              {(dados.bacias || []).map((item) => (
                <option key={item.nome} value={item.nome}>{item.nome}</option>
              ))}
            </select>
            {baciaSel && <button onClick={() => setBaciaSel(null)} aria-label="Limpar filtro de bacia"><X size={14} /></button>}
          </div>

          <div className="mp-filtros" role="group" aria-label="Filtrar pelo tipo do registro ANEEL">
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
                <span
                  className="mp-tag"
                  style={{ color: COR[sel.tipo], borderColor: COR[sel.tipo] }}
                  aria-label={`Tipo no registro ANEEL: ${sel.tipo}`}
                >{sel.tipo}</span>
                <strong>{sel.nome}</strong>
                <button onClick={() => setSel(null)} aria-label="Fechar detalhe"><X size={15} /></button>
              </header>
              <dl>
                {sel.mw != null && <><dt>Potência</dt><dd>{sel.mw.toLocaleString('pt-BR')} MW</dd></>}
                {sel.mw != null && faixaDidaticaDe(sel.mw) && (
                  <>
                    <dt>Faixa didática do POP</dt>
                    <dd>{faixaDidaticaDe(sel.mw).sigla} · {faixaDidaticaDe(sel.mw).rot}</dd>
                  </>
                )}
                {sel.fase && <><dt>Situação</dt><dd>{sel.fase}</dd></>}
                {sel.mun && <><dt>Município</dt><dd>{sel.mun}</dd></>}
                {sel.bacia && <><dt>Sub-bacia</dt><dd>{sel.bacia}</dd></>}
              </dl>
            </article>
          )}

          <div
            className="mp-lista"
            ref={listaRef}
            role="group"
            aria-labelledby="mp-lista-status"
            aria-describedby="mp-lista-instrucoes"
          >
            <div
              id="mp-lista-status"
              className="mp-lista-cab"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {usinas.length} de {(dados.usinas || []).length} em exibição{baciaSel ? ` · bacia ${baciaSel}` : ''}
            </div>
            <p id="mp-lista-instrucoes" className="sr-only">
              Na lista de usinas, use as setas para cima e para baixo para navegar, Home e End para ir ao
              início ou ao fim, Page Up e Page Down para avançar em blocos. Enter ou Espaço seleciona a usina.
            </p>
            {usinas.map((u, i) => (
              <button
                key={indicePorUsina.get(u) ?? `${u.nome}-${i}`}
                type="button"
                data-usina-indice={indicePorUsina.get(u)}
                tabIndex={indicePorUsina.get(u) === itemTabulavelEfetivo ? 0 : -1}
                className={'mp-item' + (sel === u ? ' ativo' : '')}
                aria-current={sel === u ? 'true' : undefined}
                onFocus={() => setItemTabulavel(indicePorUsina.get(u))}
                onKeyDown={(evento) => navegarCatalogo(evento, i)}
                onClick={() => escolher(u)}
              >
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
          <p>
            Registro de empreendimentos de geração, não situação de licenciamento. O tipo do registro e a
            faixa didática calculada por potência são campos distintos e podem divergir; nenhum deles,
            isoladamente, define modalidade ambiental ou suficiência. Confirme a informação vigente na
            fonte oficial antes de usar em análise.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function MapaParana({ dados: dadosFornecidos, state, setState }) {
  const [estado, setEstado] = useState(() => ({
    dados: dadosFornecidos || cacheMapa,
    erro: null,
    carregando: !dadosFornecidos && !cacheMapa,
  }));

  const buscar = (recarregar = false) => {
    setEstado((atual) => ({ ...atual, erro: null, carregando: true }));
    return carregarDadosMapa({ recarregar }).then(
      (dados) => setEstado({ dados, erro: null, carregando: false }),
      (erro) => setEstado({ dados: null, erro, carregando: false }),
    );
  };

  useEffect(() => {
    if (dadosFornecidos) {
      setEstado({ dados: dadosFornecidos, erro: null, carregando: false });
      return undefined;
    }
    if (estado.dados) return undefined;
    let vivo = true;
    carregarDadosMapa().then(
      (dados) => vivo && setEstado({ dados, erro: null, carregando: false }),
      (erro) => vivo && setEstado({ dados: null, erro, carregando: false }),
    );
    return () => {
      vivo = false;
    };
  }, [dadosFornecidos, estado.dados]);

  if (estado.dados) {
    return <MapaConteudo dados={estado.dados} state={state} setState={setState} />;
  }

  return (
    <div className="page mapa-page">
      <header className="page-header">
        <span><MapIcon /></span>
        <div>
          <small className="ph-kicker">TERRITÓRIO</small>
          <h1>Mapa das hidrelétricas do Paraná</h1>
          <p>Carregamento independente para abrir o restante da plataforma sem esperar pela base cartográfica.</p>
        </div>
      </header>
      {estado.carregando ? (
        <div className="route-loading" role="status" aria-live="polite">
          <span aria-hidden="true" />
          <div><strong>Carregando mapa</strong><small>Preparando bacias e usinas…</small></div>
        </div>
      ) : (
        <section className="empty-state" role="alert">
          <AlertTriangle aria-hidden="true" />
          <h2>Não foi possível abrir a base do mapa</h2>
          <p>{estado.erro?.message || 'O arquivo do mapa não respondeu.'}</p>
          <button type="button" className="primary" onClick={() => buscar(true)}>
            Tentar novamente
          </button>
        </section>
      )}
    </div>
  );
}
