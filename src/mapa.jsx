// Mapa do Parana: bacias hidrograficas e usinas hidreletricas.
//
// O SVG proprio continua completo sem rede. Quando a pessoa ativa a camada de
// satelite, imagens online Web Mercator entram por baixo das geometrias locais.
//
// As fontes sao publicas: a divisao hidrografica oficial do Parana e o SIGA da
// ANEEL. Nada aqui vem da base de processos do IAT.
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Map as MapIcon, X, Layers3, Zap, ZoomIn, ZoomOut, Maximize2, Target, ChevronRight } from 'lucide-react';
import mapaDadosUrl from './data/mapa-parana.json?url';
import {
  SATELLITE_INFO_URL,
  useSatelliteLayer,
} from './satelliteLayer.js';
import {
  consultarCamadasNoPonto,
  pontoParaMercator,
  mercatorParaMapa,
  useCamadasGeopr,
  useLegendas,
} from './geoprCamadas.js';
import GeoprPainel, { GeoprLegenda, GeoprResumoNoMapa } from './geoprPainel.jsx';
import PainelCoordenada from './painelCoordenada.jsx';
import { dentroDoParana, geoParaMercator, mercatorParaGeo } from './coordenadas.js';
import { localizarResultadoMapa, pesquisarMapa } from './mapaPesquisa.js';

const COR = { CGH: '#57d8bf', PCH: '#4cc4f5', UHE: '#9fb7ff' };
const ORDEM = ['CGH', 'PCH', 'UHE'];
const ESPERA_HOVER_GEOPR_MS = 220;
const VALIDADE_CACHE_HOVER_GEOPR_MS = 45000;
const LIMITE_CACHE_HOVER_GEOPR = 40;
const consultaOciosa = () => ({ estado: 'ociosa', tipo: null, achados: [], falhas: 0 });

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
  // Camadas do GeoPR ligadas. Guarda o objeto inteiro, e nao so o id, porque a
  // busca no acervo produz camadas que nao estao no catalogo curado.
  const [geopr, setGeopr] = useState([]);
  const [consultaHover, setConsultaHover] = useState(consultaOciosa);
  const [consultaFixada, setConsultaFixada] = useState(consultaOciosa);
  // Ponto marcado no mapa: vem do clique ou de uma coordenada digitada.
  const [marca, setMarca] = useState(null);
  const consultaHoverAberta = useRef(null);
  const consultaFixadaAberta = useRef(null);
  const esperaHover = useRef(null);
  const chaveHover = useRef(null);
  const cacheHoverGeopr = useRef(new Map());
  const ignorarProximoClique = useRef(false);
  const versaoEscolhaBusca = useRef(0);


  const usinas = useMemo(() => {
    const q = norm(busca);
    return (dados.usinas || []).filter(
      (u) => tipos.has(u.tipo)
        && (!baciaSel || u.baciaPR === baciaSel)
        && (!q || norm(`${u.nome} ${u.mun} ${u.bacia}`).includes(q)),
    );
  }, [dados.usinas, tipos, busca, baciaSel]);

  const pesquisarNoMapa = React.useCallback(
    (termo, { incluirOficiais = false } = {}) => pesquisarMapa({
      dados,
      termo,
      incluirOficiais,
    }),
    [dados],
  );

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

  // Tamanho do SVG na tela, para pedir a imagem do GeoPR na resolucao certa.
  // Pedir sempre 1000 de largura desperdicaria banda em telefone e sairia
  // borrado em tela densa; medir custa um observador e acerta os dois casos.
  const [quadro, setQuadro] = useState(null);
  useEffect(() => {
    const alvo = svgRef.current;
    if (!alvo || typeof ResizeObserver === 'undefined') return undefined;
    const medir = () => {
      const caixa = alvo.getBoundingClientRect();
      if (!caixa.width || !caixa.height) return;
      // Teto de 1600: acima disso o servidor do IAT desenha mais do que a tela
      // aproveita, e quem paga a conta e um servidor publico.
      const densidade = Math.min(2, window.devicePixelRatio || 1);
      setQuadro({
        larguraPx: Math.min(1600, Math.round(caixa.width * densidade)),
        alturaPx: Math.min(1600, Math.round(caixa.height * densidade)),
      });
    };
    medir();
    const observador = new ResizeObserver(medir);
    observador.observe(alvo);
    return () => observador.disconnect();
  }, []);

  const camadasGeopr = useCamadasGeopr({
    camadas: geopr,
    projecao: dados.tileProjection,
    largura: larg,
    altura: alt,
    vista: v,
    quadro,
  });

  const legendasGeopr = useLegendas(geopr);

  const encerrarHoverGeopr = React.useCallback(() => {
    clearTimeout(esperaHover.current);
    esperaHover.current = null;
    chaveHover.current = null;
    consultaHoverAberta.current?.abort();
    consultaHoverAberta.current = null;
    setConsultaHover((atual) => (atual.estado === 'ociosa' ? atual : consultaOciosa()));
  }, []);

  const encerrarConsultaFixada = React.useCallback(() => {
    consultaFixadaAberta.current?.abort();
    consultaFixadaAberta.current = null;
    setConsultaFixada((atual) => (atual.estado === 'ociosa' ? atual : consultaOciosa()));
  }, []);

  const fecharConsultaPeloPainel = React.useCallback(() => {
    encerrarConsultaFixada();
    // O botao desaparece junto com o painel. Devolver o foco ao mapa evita que
    // teclado/leitor de tela caiam no corpo da pagina sem referencia.
    svgRef.current?.focus({ preventScroll: true });
  }, [encerrarConsultaFixada]);

  const alternarGeopr = React.useCallback((camada) => {
    setGeopr((atuais) => (atuais.some((c) => c.id === camada.id)
      ? atuais.filter((c) => c.id !== camada.id)
      : [...atuais, camada]));
    encerrarHoverGeopr();
    encerrarConsultaFixada();
  }, [encerrarHoverGeopr, encerrarConsultaFixada]);

  // Resultado de busca liga a camada de modo idempotente. Reutilizar o gesto
  // de alternancia aqui desligaria justamente uma camada que ja estivesse
  // visivel quando a pessoa escolhesse uma feicao dela.
  const ativarGeopr = React.useCallback((camada) => {
    if (!camada?.id) return;
    setGeopr((atuais) => (atuais.some((item) => item.id === camada.id)
      ? atuais
      : [...atuais, camada]));
    encerrarHoverGeopr();
    encerrarConsultaFixada();
  }, [encerrarHoverGeopr, encerrarConsultaFixada]);

  const limparGeopr = React.useCallback(() => {
    setGeopr([]);
    encerrarHoverGeopr();
    encerrarConsultaFixada();
  }, [encerrarHoverGeopr, encerrarConsultaFixada]);

  const aplicar = (nx, ny, nw, nh) => {
    encerrarHoverGeopr();
    encerrarConsultaFixada();
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
  const inteiro = () => {
    encerrarHoverGeopr();
    encerrarConsultaFixada();
    setVista(null);
  };

  // Converte ponto do ecra para coordenada do mapa, para o zoom seguir o cursor.
  const noMapa = (ev) => {
    const r = svgRef.current.getBoundingClientRect();
    return {
      cx: v.x + ((ev.clientX - r.left) / r.width) * v.w,
      cy: v.y + ((ev.clientY - r.top) / r.height) * v.h,
    };
  };
  const contextoDoPonteiro = (ev) => {
    const r = svgRef.current?.getBoundingClientRect();
    if (!r?.width || !r?.height) return null;
    const pixelX = Math.min(r.width, Math.max(0, ev.clientX - r.left));
    const pixelY = Math.min(r.height, Math.max(0, ev.clientY - r.top));
    const cx = v.x + (pixelX / r.width) * v.w;
    const cy = v.y + (pixelY / r.height) * v.h;
    const ponto = pontoParaMercator(dados.tileProjection, larg, alt, cx, cy);
    if (!ponto) return null;
    return {
      cx,
      cy,
      ponto,
      pixelX,
      pixelY,
      posicao: {
        xPct: (pixelX / r.width) * 100,
        yPct: (pixelY / r.height) * 100,
      },
    };
  };
  const roda = (ev) => {
    ev.preventDefault();
    const { cx, cy } = noMapa(ev);
    ampliar(ev.deltaY < 0 ? 1.25 : 1 / 1.25, cx, cy);
  };
  const pegar = (ev) => {
    encerrarHoverGeopr();
    if (escala > 1.02) encerrarConsultaFixada();
    ignorarProximoClique.current = false;
    if (escala <= 1.02) return;                  // sem zoom nao ha o que arrastar
    arrasto.current = {
      ...noMapa(ev),
      x0: v.x,
      y0: v.y,
      clientX0: ev.clientX,
      clientY0: ev.clientY,
      moveu: false,
    };
    svgRef.current.setPointerCapture?.(ev.pointerId);
  };
  const mover = (ev) => {
    if (!arrasto.current) return;
    if (!arrasto.current.moveu) {
      const distancia = Math.hypot(
        ev.clientX - arrasto.current.clientX0,
        ev.clientY - arrasto.current.clientY0,
      );
      if (distancia < 4) return;
    }
    const r = svgRef.current.getBoundingClientRect();
    const dx = ((ev.clientX - r.left) / r.width) * v.w;
    const dy = ((ev.clientY - r.top) / r.height) * v.h;
    arrasto.current.moveu = true;
    aplicar(arrasto.current.x0 + (arrasto.current.cx - arrasto.current.x0 - dx),
            arrasto.current.y0 + (arrasto.current.cy - arrasto.current.y0 - dy), v.w, v.h);
  };
  const soltar = (ev) => {
    if (arrasto.current?.moveu) ignorarProximoClique.current = true;
    arrasto.current = null;
    svgRef.current.releasePointerCapture?.(ev.pointerId);
  };

  // Marca no mapa a coordenada em que a pessoa clicou, e le o valor dela. Vale
  // com ou sem camada do GeoPR ligada: saber onde um ponto cai e util por si.
  const marcarOndeClicou = (ev) => {
    const { cx, cy } = noMapa(ev);
    const ponto = pontoParaMercator(dados.tileProjection, larg, alt, cx, cy);
    const geo = ponto && mercatorParaGeo(ponto.x, ponto.y);
    if (geo) setMarca({ ...geo, x: cx, y: cy, forma: 'clique' });
  };

  /** Leva o mapa ate uma coordenada digitada e a marca. */
  const irParaCoordenada = React.useCallback((lido) => {
    const merc = geoParaMercator(lido.lat, lido.lon);
    const noDesenho = merc && mercatorParaMapa(dados.tileProjection, larg, alt, merc.x, merc.y);
    if (!noDesenho) return;
    setMarca({ ...lido, x: noDesenho.x, y: noDesenho.y });
    // Aproxima o suficiente para o ponto ter contexto, sem perder a referencia
    // do Estado inteiro. Fora do Parana a janela nao mexe: arrastar a vista
    // para um lugar que o desenho nao cobre deixaria a tela vazia, e a marca
    // continua visivel na borda com o aviso do painel.
    if (dentroDoParana(lido.lat, lido.lon)) {
      const largura = larg / 5;
      aplicar(noDesenho.x - largura / 2, noDesenho.y - (largura * (alt / larg)) / 2,
              largura, largura * (alt / larg));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados.tileProjection, larg, alt, v.w, v.h]);

  const marcarPontoDoDesenho = (x, y, forma = 'busca') => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const ponto = pontoParaMercator(dados.tileProjection, larg, alt, x, y);
    const geo = ponto && mercatorParaGeo(ponto.x, ponto.y);
    if (!geo) return false;
    setMarca({ ...geo, x, y, forma });
    return true;
  };

  const focarPontoDoDesenho = (x, y, fator = 6, formaDaMarca = 'busca') => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    const largura = larg / fator;
    aplicar(
      x - largura / 2,
      y - (largura * (alt / larg)) / 2,
      largura,
      largura * (alt / larg),
    );
    if (formaDaMarca) marcarPontoDoDesenho(x, y, formaDaMarca);
    return true;
  };

  const focarLocalizacaoOficial = (localizacao) => {
    const ponto = localizacao?.pontoMercator;
    if (!ponto) return false;
    const desenho = mercatorParaMapa(dados.tileProjection, larg, alt, ponto.x, ponto.y);
    if (!desenho) return false;
    const caixa = localizacao.caixaMercator;
    if (caixa) {
      const superiorEsquerdo = mercatorParaMapa(
        dados.tileProjection, larg, alt, caixa.minX, caixa.maxY,
      );
      const inferiorDireito = mercatorParaMapa(
        dados.tileProjection, larg, alt, caixa.maxX, caixa.minY,
      );
      if (superiorEsquerdo && inferiorDireito) {
        const larguraDaFeicao = Math.abs(inferiorDireito.x - superiorEsquerdo.x);
        const alturaDaFeicao = Math.abs(inferiorDireito.y - superiorEsquerdo.y);
        const largura = Math.min(larg, Math.max(
          larg / 8,
          larguraDaFeicao * 1.3,
          alturaDaFeicao * (larg / alt) * 1.3,
        ));
        aplicar(
          desenho.x - largura / 2,
          desenho.y - (largura * (alt / larg)) / 2,
          largura,
          largura * (alt / larg),
        );
        return true;
      }
    }
    return focarPontoDoDesenho(desenho.x, desenho.y, 6, 'busca-oficial');
  };

  const mostrarDetalheDaBusca = (resultado) => {
    const achado = resultado?.achado || (resultado?.tipo === 'municipio' && resultado?.camada
      ? {
        camada: resultado.camada.titulo,
        valores: [
          { chave: 'nome', valor: resultado.titulo },
          ...(resultado.resumo ? [{ chave: 'descricao', valor: resultado.resumo }] : []),
        ],
        ocultos: 0,
        omitidos: 0,
        origem: {
          id: resultado.camada.id,
          titulo: resultado.camada.titulo,
          fonte: resultado.camada.fonte,
          paraQue: resultado.camada.paraQue,
          caminho: resultado.camada.caminho,
        },
      }
      : null);
    if (!achado) return;
    consultaFixadaAberta.current?.abort();
    consultaFixadaAberta.current = null;
    setConsultaHover(consultaOciosa());
    setConsultaFixada({
      tipo: 'fixada',
      origemBusca: 'pesquisa',
      estado: 'pronto',
      posicao: { xPct: 50, yPct: 50 },
      achados: [achado],
      falhas: 0,
      consultadas: 1,
      consultadoEm: new Date().toISOString(),
    });
  };

  const escolherResultadoDaBusca = async (resultado) => {
    const escolhaAtual = ++versaoEscolhaBusca.current;
    if (resultado?.tipo === 'empreendimento' && resultado.registro) {
      setTipos(new Set(ORDEM));
      setBaciaSel(null);
      setBusca(resultado.titulo);
      setCamadas((atuais) => ({ ...atuais, usinas: true }));
      escolher(resultado.registro);
      focarPontoDoDesenho(resultado.registro.x, resultado.registro.y);
      return { mensagem: 'Empreendimento localizado, marcado e aberto nos detalhes.' };
    }

    if (resultado?.tipo === 'bacia') {
      setTipos(new Set(ORDEM));
      setBusca('');
      setSel(null);
      setBaciaSel(resultado.titulo);
      setMarca(null);
      if (resultado.centro) focarPontoDoDesenho(resultado.centro.x, resultado.centro.y, 2.8, null);
      return { mensagem: 'Bacia localizada; a lista agora mostra os empreendimentos correspondentes.' };
    }

    if (resultado?.tipo === 'municipio') {
      setTipos(new Set(ORDEM));
      setBaciaSel(null);
      setBusca(resultado.titulo);
      setSel(null);
      setMarca(null);
      if (resultado.centro) focarPontoDoDesenho(resultado.centro.x, resultado.centro.y, 4, null);
    } else {
      setTipos(new Set(ORDEM));
      setBaciaSel(null);
      setBusca('');
      setSel(null);
      setMarca(null);
    }

    const localizacao = await localizarResultadoMapa(resultado);
    if (versaoEscolhaBusca.current !== escolhaAtual) return { mensagem: '' };
    if (resultado?.camada) ativarGeopr(resultado.camada);
    const localizada = localizacao ? focarLocalizacaoOficial(localizacao) : false;
    mostrarDetalheDaBusca(resultado);

    if (resultado?.tipo === 'municipio') {
      return {
        mensagem: localizada
          ? 'Município filtrado e enquadrado pelo limite oficial do GeoPR.'
          : (resultado.centro
            ? 'Município filtrado e centralizado pela referência aproximada dos empreendimentos disponíveis; o limite oficial não respondeu agora.'
            : 'Município filtrado; o limite oficial não respondeu e não há uma referência aproximada disponível para centralizar o mapa.'),
      };
    }
    if (resultado?.tipo === 'empreendimento-geopr') {
      return { mensagem: 'Empreendimento do GeoPR localizado, marcado e aberto nos detalhes.' };
    }
    if (resultado?.tipo === 'area-protegida') {
      return {
        mensagem: localizada
          ? 'Área oficial enquadrada pela extensão da camada e aberta nos detalhes; o mapa não inventa um ponto central.'
          : 'A camada foi ativada, mas o serviço não devolveu uma extensão utilizável agora.',
      };
    }
    if (resultado?.tipo === 'zoneamento') {
      return {
        mensagem: localizada
          ? 'Camada de plano ou zoneamento ativada e enquadrada. Clique numa zona para consultar os atributos e o ato legal.'
          : 'Camada de plano ou zoneamento ativada. Aproxime e clique numa zona para consultar os atributos.',
      };
    }
    if (resultado?.tipo === 'camada') {
      return {
        mensagem: 'Camada ativada. Como o tema não possui um único ponto, aproxime e clique numa feição para ver os detalhes.',
      };
    }
    return { mensagem: localizada ? 'Resultado localizado e marcado no mapa.' : 'Resultado selecionado.' };
  };

  const iniciarConsultaGeopr = ({ tipo, ponto, posicao, chaveCache = null }) => {
    const fixada = tipo === 'fixada';
    const referencia = fixada ? consultaFixadaAberta : consultaHoverAberta;
    const atualizar = fixada ? setConsultaFixada : setConsultaHover;
    referencia.current?.abort();
    const controle = new AbortController();
    referencia.current = controle;
    const base = {
      tipo,
      estado: 'carregando',
      posicao,
      achados: [],
      falhas: 0,
      consultadas: 0,
      consultadoEm: new Date().toISOString(),
    };
    atualizar(base);

    const densidade = Math.min(2, window.devicePixelRatio || 1);
    consultarCamadasNoPonto({
      camadas: geopr,
      caixa: camadasGeopr.caixa,
      larguraPx: camadasGeopr.larguraPx,
      alturaPx: camadasGeopr.alturaPx,
      ponto,
      // A imagem WMS e pedida na densidade fisica da tela. A tolerancia precisa
      // acompanhar essa mesma densidade para nao encolher em monitores HiDPI.
      tolerancia: Math.round((fixada ? 13 : 9) * densidade),
      sinal: controle.signal,
      pararNoPrimeiro: !fixada,
      concorrencia: 3,
    }).then((resultado) => {
      if (controle.signal.aborted) return;
      const estado = resultado.achados.length
        ? 'pronto'
        : (resultado.consultadas === 0 && resultado.falhas > 0 ? 'erro' : 'vazio');
      const concluida = { ...base, ...resultado, estado, consultadoEm: new Date().toISOString() };
      atualizar(concluida);
      if (!fixada && chaveCache && ['pronto', 'vazio'].includes(estado)) {
        const cache = cacheHoverGeopr.current;
        cache.delete(chaveCache);
        cache.set(chaveCache, { consulta: concluida, guardadoEm: Date.now() });
        while (cache.size > LIMITE_CACHE_HOVER_GEOPR) {
          cache.delete(cache.keys().next().value);
        }
      }
    }).catch(() => {
      if (!controle.signal.aborted) atualizar({ ...base, estado: 'erro', falhas: geopr.length });
    });
  };

  // Hover nao e um fluxo separado de dados: apenas faz a mesma identificacao
  // do clique, com atraso e parando na primeira camada visivel que responder.
  const moverComConsulta = (ev) => {
    mover(ev);
    if (arrasto.current || ev.pointerType === 'touch' || !geopr.length || !camadasGeopr.caixa) {
      if (arrasto.current || ev.pointerType === 'touch') encerrarHoverGeopr();
      return;
    }
    const contexto = contextoDoPonteiro(ev);
    if (!contexto) return;
    const caixa = camadasGeopr.caixa;
    // Celula de oito pixels: tremor natural do mouse sobre o mesmo simbolo nao
    // cancela e repete a mesma consulta. Vista e camadas fazem parte da chave.
    const chave = [
      geopr.map((camada) => camada.id).join(','),
      caixa.minX.toFixed(0), caixa.minY.toFixed(0), caixa.maxX.toFixed(0), caixa.maxY.toFixed(0),
      camadasGeopr.larguraPx, camadasGeopr.alturaPx,
      v.x.toFixed(3), v.y.toFixed(3), v.w.toFixed(3), v.h.toFixed(3),
      Math.floor(contexto.pixelX / 8), Math.floor(contexto.pixelY / 8),
    ].join(':');
    if (chaveHover.current === chave) return;
    chaveHover.current = chave;
    clearTimeout(esperaHover.current);
    consultaHoverAberta.current?.abort();
    const emCache = cacheHoverGeopr.current.get(chave);
    if (emCache && Date.now() - emCache.guardadoEm <= VALIDADE_CACHE_HOVER_GEOPR_MS) {
      // A -> B -> A volta instantaneamente e evita repetir a mesma bateria de
      // requests no servidor publico. A posicao acompanha o cursor atual.
      cacheHoverGeopr.current.delete(chave);
      cacheHoverGeopr.current.set(chave, emCache);
      setConsultaHover({ ...emCache.consulta, tipo: 'hover', posicao: contexto.posicao });
      return;
    }
    if (emCache) cacheHoverGeopr.current.delete(chave);
    setConsultaHover({
      estado: 'aguardando',
      tipo: 'hover',
      posicao: contexto.posicao,
      achados: [],
      falhas: 0,
    });
    esperaHover.current = setTimeout(() => {
      iniciarConsultaGeopr({
        tipo: 'hover',
        ponto: contexto.ponto,
        posicao: contexto.posicao,
        chaveCache: chave,
      });
    }, ESPERA_HOVER_GEOPR_MS);
  };

  // Clique e toque fixam o resultado e consultam TODAS as camadas ativas. O
  // marcador de coordenada continua sendo atualizado pelo mesmo gesto.
  const consultarGeopr = (ev) => {
    if (ignorarProximoClique.current) {
      ignorarProximoClique.current = false;
      return;
    }
    marcarOndeClicou(ev);
    encerrarHoverGeopr();
    if (!geopr.length || !camadasGeopr.caixa) return;
    const contexto = contextoDoPonteiro(ev);
    if (!contexto) return;
    iniciarConsultaGeopr({
      tipo: 'fixada',
      ponto: contexto.ponto,
      posicao: contexto.posicao,
    });
  };

  useEffect(() => () => {
    clearTimeout(esperaHover.current);
    consultaHoverAberta.current?.abort();
    consultaFixadaAberta.current?.abort();
  }, []);

  const consultarCentroGeopr = () => {
    if (!geopr.length || !camadasGeopr.caixa) return;
    encerrarHoverGeopr();
    const cx = v.x + v.w / 2;
    const cy = v.y + v.h / 2;
    const ponto = pontoParaMercator(dados.tileProjection, larg, alt, cx, cy);
    const geo = ponto && mercatorParaGeo(ponto.x, ponto.y);
    if (!ponto) return;
    if (geo) setMarca({ ...geo, x: cx, y: cy, forma: 'teclado' });
    iniciarConsultaGeopr({
      tipo: 'fixada',
      ponto,
      posicao: { xPct: 50, yPct: 50 },
    });
  };

  // Teclado: a mesma navegacao sem depender de mouse.
  const tecla = (ev) => {
    if (ev.key === 'Escape' && consultaFixada.estado !== 'ociosa') {
      ev.preventDefault();
      encerrarConsultaFixada();
      return;
    }
    if ((ev.key === 'Enter' || ev.key === ' ') && geopr.length) {
      ev.preventDefault();
      consultarCentroGeopr();
      return;
    }
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
  const consultaNoMapa = ['carregando', 'pronto', 'vazio', 'erro'].includes(consultaHover.estado)
    ? consultaHover
    : consultaFixada;

  return (
    <div className="page mapa-page">
      <header className="page-header">
        <span><MapIcon /></span>
        <div>
          <small className="ph-kicker">TERRITÓRIO</small>
          <h1>Mapa das hidrelétricas do Paraná</h1>
          <p>As {(dados.usinas || []).length} usinas do registro da ANEEL sobre as {(dados.bacias || []).length} bacias hidrográficas do Estado. O tamanho do ponto acompanha a potência. As camadas oficiais do GeoPR desenham sobre este mesmo mapa, no painel ao lado.</p>
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
            Bacias, usinas, busca e filtros funcionam sem internet. As camadas Satélite e GeoPR são
            opcionais e carregam imagens online somente quando ativadas.
          </p>
          <p className="mp-limite-camada">
            Os rótulos CGH, PCH e UHE dos pontos reproduzem o tipo do registro consultado. A faixa MCH,
            MGH, CGH, PCH ou UHE calculada no exercício é apenas a leitura didática da potência pelo POP;
            uma divergência exige conferência oficial e não altera o cadastro automaticamente.
          </p>
          <p id="mp-ajuda-teclado" className="mp-ajuda-teclado">Com o mapa em foco: setas deslocam, mais e menos aproximam e afastam, zero volta ao mapa inteiro. Com uma camada GeoPR ligada, Enter consulta o centro visível. Para selecionar uma bacia sem mouse, use a lista “Bacia hidrográfica” no painel.</p>
          {!!geopr.length && (
            <p className="mp-limite-camada gp-ajuda-consulta">
              Passe o mouse sobre um símbolo do GeoPR para ver o resumo. Clique ou toque para fixar os detalhes; identificadores e dados desnecessários não são exibidos.
            </p>
          )}
          <div className="mp-map-stage">
            <svg ref={svgRef} viewBox={`${v.x} ${v.y} ${v.w} ${v.h}`} role="img" tabIndex={0}
                 aria-describedby="mp-ajuda-teclado"
                 className={[
                   escala > 1.02 ? 'mp-arrastavel' : '',
                   camadas.satelite && satelite.online ? 'mp-satelite-on' : '',
                   // Camada de fundo do GeoPR desenha ABAIXO das bacias locais,
                   // que tem preenchimento opaco e a esconderiam por inteiro.
                   // A marca abaixo deixa a bacia translucida, com o contorno
                   // preservado, do mesmo jeito que o modo satelite ja fazia.
                   camadasGeopr.pedidos.some((p) => p.camada.ordem !== 'topo') ? 'gp-fundo-on' : '',
                 ].filter(Boolean).join(' ')}
                 onWheel={roda} onPointerDown={pegar} onPointerMove={moverComConsulta}
                 onPointerUp={soltar} onPointerCancel={soltar} onPointerLeave={encerrarHoverGeopr}
                 onKeyDown={tecla}
                 onClick={consultarGeopr}
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
              {!!camadasGeopr.pedidos.length && (
                <g className="gp-camadas gp-fundo" aria-hidden="true">
                  {camadasGeopr.pedidos
                    .filter((pedido) => pedido.camada.ordem !== 'topo')
                    .map((pedido) => (
                      <image
                        key={pedido.chave}
                        href={pedido.href}
                        // O retangulo e o da vista em que a imagem FOI PEDIDA.
                        // Enquanto a nova nao chega, a anterior continua no
                        // lugar certo do mundo em vez de esticar sobre a area
                        // errada durante o arrasto.
                        x={pedido.retangulo.x}
                        y={pedido.retangulo.y}
                        width={pedido.retangulo.w}
                        height={pedido.retangulo.h}
                        preserveAspectRatio="none"
                        onLoad={() => camadasGeopr.registrar('carregou', pedido.chave)}
                        onError={() => camadasGeopr.registrar('falhou', pedido.chave)}
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
              {!!camadasGeopr.pedidos.length && (
                <g className="gp-camadas gp-topo" aria-hidden="true">
                  {camadasGeopr.pedidos
                    .filter((pedido) => pedido.camada.ordem === 'topo')
                    .map((pedido) => (
                      <image
                        key={pedido.chave}
                        href={pedido.href}
                        x={pedido.retangulo.x}
                        y={pedido.retangulo.y}
                        width={pedido.retangulo.w}
                        height={pedido.retangulo.h}
                        preserveAspectRatio="none"
                        onLoad={() => camadasGeopr.registrar('carregou', pedido.chave)}
                        onError={() => camadasGeopr.registrar('falhou', pedido.chave)}
                      />
                    ))}
                </g>
              )}
              {marca && Number.isFinite(marca.x) && (
                // Alvo, e nao um pino: pino aponta para um lugar aproximado, e
                // aqui o que importa e o ponto exato onde a coordenada cai.
                <g className="co-marca" aria-hidden="true">
                  <circle cx={marca.x} cy={marca.y} r={12 / escala} />
                  <line x1={marca.x - 19 / escala} y1={marca.y} x2={marca.x - 5 / escala} y2={marca.y} />
                  <line x1={marca.x + 5 / escala} y1={marca.y} x2={marca.x + 19 / escala} y2={marca.y} />
                  <line x1={marca.x} y1={marca.y - 19 / escala} x2={marca.x} y2={marca.y - 5 / escala} />
                  <line x1={marca.x} y1={marca.y + 5 / escala} x2={marca.x} y2={marca.y + 19 / escala} />
                </g>
              )}
              {camadas.usinas && <g className="mp-usinas" aria-hidden="true">
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

            <GeoprResumoNoMapa consulta={consultaNoMapa} />

            <GeoprLegenda
              camadas={geopr}
              legendas={legendasGeopr}
              esperando={camadasGeopr.esperando}
              aoDesligar={alternarGeopr}
            />
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
          <PainelCoordenada
            marca={marca}
            aoBuscar={irParaCoordenada}
            aoPesquisar={pesquisarNoMapa}
            aoEscolher={escolherResultadoDaBusca}
            aoAlterarBusca={(valor) => {
              ++versaoEscolhaBusca.current;
              if (!String(valor || '').trim()) {
                setBusca('');
                setBaciaSel(null);
              }
            }}
            aoLimparBusca={() => {
              ++versaoEscolhaBusca.current;
              setBusca('');
              setBaciaSel(null);
            }}
            aoLimpar={() => setMarca(null)}
          />
          <GeoprPainel
            ativas={geopr}
            alternar={alternarGeopr}
            limpar={limparGeopr}
            consulta={consultaFixada}
            aoFecharConsulta={fecharConsultaPeloPainel}
          />
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
              {usinas.length} de {(dados.usinas || []).length} em exibição
              {baciaSel ? ` · bacia ${baciaSel}` : ''}
              {busca ? ` · busca ${busca}` : ''}
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
