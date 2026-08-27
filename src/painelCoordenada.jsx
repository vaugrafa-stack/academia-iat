// Leitura e busca de coordenada no mapa.
//
// POR QUE ISTO ESTAVA FALTANDO
//
// O mapa mostrava onde as usinas estao, mas nao respondia a pergunta que quem
// analisa faz todo dia: "esta coordenada do memorial cai onde?". Sem isso, a
// conferencia saia da Academia e ia para outra ferramenta, que e exatamente o
// atrito que a integracao do GeoPR veio remover.
//
// O modulo M10 trata cartografia, SIRGAS 2000 e fuso UTM. Aqui a pessoa ve os
// tres ao mesmo tempo, no mesmo ponto: grau decimal, grau/minuto/segundo e UTM
// com o fuso explicito. O Parana fica entre o fuso 21 e o 22, e o mesmo par de
// numeros cai em lugares diferentes conforme o fuso, sem nenhum aviso de erro.
// Ver o fuso ao lado do valor e a maneira mais barata de aprender isso.

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Copy, Crosshair, Search, X } from 'lucide-react';
import {
  dentroDoParana,
  formatarGms,
  formatarGrau,
  formatarMetro,
  geoParaUtm,
} from './coordenadas.js';
import { classificarEntradaMapa } from './mapaPesquisa.js';
import './coordenadas.css';

/** Texto da leitura, no formato que serve para colar num registro. */
export function textoDaLeitura(lat, lon, dataISO) {
  const utm = geoParaUtm(lat, lon);
  const partes = [
    `SIRGAS 2000: ${formatarGrau(lat)}, ${formatarGrau(lon)}`,
    `${formatarGms(lat, 'lat')} ${formatarGms(lon, 'lon')}`,
    `UTM fuso ${utm.fuso}${utm.hemisferio}: E ${formatarMetro(utm.leste)} N ${formatarMetro(utm.norte)}`,
  ];
  // A data entra porque a secao 137 do POP manda registrar camada, fonte e data
  // da consulta. Uma leitura colada sem data nao serve de rastro.
  if (dataISO) partes.push(`consulta em ${dataISO}`);
  return partes.join(' | ');
}

const ESTILO_COMBO = { position: 'relative', zIndex: 8 };
const ESTILO_RESULTADOS = {
  position: 'absolute',
  zIndex: 80,
  top: 'calc(100% + 6px)',
  left: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
  maxHeight: 'min(46vh, 310px)',
  margin: 0,
  padding: 5,
  overflowY: 'auto',
  border: '1px solid var(--line)',
  borderRadius: 10,
  background: 'var(--surface)',
  boxShadow: '0 16px 34px rgba(18, 43, 35, .18)',
};

function medirListaDeResultados(combo) {
  if (!combo || typeof window === 'undefined') {
    return { acima: false, altura: 310 };
  }

  const caixa = combo.getBoundingClientRect();
  const viewport = window.visualViewport;
  const topoVisivel = viewport?.offsetTop || 0;
  const baseVisivel = topoVisivel + (viewport?.height || window.innerHeight);
  const navegacaoMovel = document.querySelector('.mobile-bottom-nav');
  const caixaNavegacao = navegacaoMovel?.getBoundingClientRect();
  const topoNavegacao = caixaNavegacao?.height > 0
    ? caixaNavegacao.top
    : Number.POSITIVE_INFINITY;
  const limiteInferior = Math.min(baseVisivel - 8, topoNavegacao - 8);
  const espacoAbaixo = limiteInferior - caixa.bottom - 6;
  const espacoAcima = caixa.top - topoVisivel - 6;
  const acima = espacoAbaixo < 156 && espacoAcima > espacoAbaixo;
  const disponivel = acima ? espacoAcima : espacoAbaixo;

  return {
    acima,
    // Uma opcao inteira continua utilizavel mesmo com teclado virtual aberto.
    // Em viewports normais, o teto original de 310 px permanece inalterado.
    altura: Math.max(96, Math.min(310, Math.floor(Math.max(0, disponivel)))),
  };
}
const ESTILO_OPCAO = {
  display: 'grid',
  flex: '0 0 auto',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: 2,
  width: '100%',
  minHeight: 52,
  padding: '8px 10px',
  border: '1px solid transparent',
  borderRadius: 8,
  background: 'transparent',
  color: 'var(--ink)',
  textAlign: 'left',
  cursor: 'pointer',
  font: 'inherit',
};

export default function PainelCoordenada({
  marca,
  aoBuscar,
  aoPesquisar,
  aoEscolher,
  aoLimpar,
  aoLimparBusca,
  aoAlterarBusca,
}) {
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [resultados, setResultados] = useState([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(-1);
  const [estadoBusca, setEstadoBusca] = useState('ocioso');
  const [oficialParcial, setOficialParcial] = useState(false);
  const [notaAcao, setNotaAcao] = useState('');
  const versao = useRef(0);
  const relogioOficial = useRef(null);
  const idAtivo = useRef(null);
  const opcoesRef = useRef([]);
  const comboRef = useRef(null);
  const [geometriaLista, setGeometriaLista] = useState({ acima: false, altura: 310 });
  const idBase = useId().replace(/:/g, '');
  const idAjuda = `${idBase}-ajuda`;
  const idEstado = `${idBase}-estado`;
  const idLista = `${idBase}-resultados`;

  const limparAtivo = React.useCallback(() => {
    idAtivo.current = null;
    setAtivo(-1);
  }, []);

  const atualizarResultados = React.useCallback((itens, total = itens.length) => {
    setResultados(itens);
    setTotalResultados(total);
    setAtivo(() => {
      const indice = idAtivo.current
        ? itens.findIndex((resultado) => resultado.id === idAtivo.current)
        : -1;
      if (indice < 0) idAtivo.current = null;
      return indice;
    });
  }, []);

  useEffect(() => {
    if (!aberto || ativo < 0) return;
    opcoesRef.current[ativo]?.scrollIntoView?.({ block: 'nearest' });
  }, [aberto, ativo]);

  useLayoutEffect(() => {
    if (!aberto || !resultados.length) return undefined;
    const recalcular = () => setGeometriaLista(medirListaDeResultados(comboRef.current));
    recalcular();
    window.addEventListener('resize', recalcular);
    // A lista usa coordenadas da viewport. Scroll de qualquer ancestral muda
    // essas coordenadas sem disparar resize, inclusive no painel lateral.
    window.addEventListener('scroll', recalcular, true);
    window.visualViewport?.addEventListener('resize', recalcular);
    window.visualViewport?.addEventListener('scroll', recalcular);
    return () => {
      window.removeEventListener('resize', recalcular);
      window.removeEventListener('scroll', recalcular, true);
      window.visualViewport?.removeEventListener('resize', recalcular);
      window.visualViewport?.removeEventListener('scroll', recalcular);
    };
  }, [aberto, resultados.length]);

  useEffect(() => {
    const atual = ++versao.current;
    clearTimeout(relogioOficial.current);
    setErro('');
    setNotaAcao('');
    limparAtivo();
    setOficialParcial(false);
    const classificada = classificarEntradaMapa(texto);
    if (classificada.tipo === 'vazia') {
      atualizarResultados([], 0);
      setAberto(false);
      setEstadoBusca('ocioso');
      return undefined;
    }
    if (classificada.tipo === 'coordenada') {
      atualizarResultados([], 0);
      setAberto(false);
      setEstadoBusca('coordenada');
      return undefined;
    }
    if (classificada.tipo === 'protegida') {
      atualizarResultados([], 0);
      setAberto(false);
      setEstadoBusca('protegida');
      return undefined;
    }
    if (classificada.tipo === 'curta') {
      atualizarResultados([], 0);
      setAberto(false);
      setEstadoBusca('curta');
      return undefined;
    }

    let viva = true;
    Promise.resolve(aoPesquisar?.(texto, { incluirOficiais: false }))
      .then((resposta) => {
        if (!viva || versao.current !== atual) return;
        const locais = resposta?.resultados || [];
        atualizarResultados(locais, resposta?.total ?? locais.length);
        setAberto(!!locais.length);
        setEstadoBusca(locais.length ? (resposta?.limitado ? 'limitado' : 'local') : 'consultando');
      })
      .catch(() => {
        if (viva && versao.current === atual) setEstadoBusca('consultando');
      });

    // O termo nao vai na rede. Depois de uma pausa, os indices publicos fixos
    // entram para completar municipios, UCs, PACUERAs, zonas e o acervo.
    relogioOficial.current = setTimeout(() => {
      Promise.resolve(aoPesquisar?.(texto, { incluirOficiais: true }))
        .then((resposta) => {
          if (!viva || versao.current !== atual) return;
          const encontrados = resposta?.resultados || [];
          atualizarResultados(encontrados, resposta?.total ?? encontrados.length);
          setOficialParcial(resposta?.oficial === 'parcial');
          setAberto(!!encontrados.length);
          setEstadoBusca(encontrados.length
            ? (resposta?.limitado ? 'limitado' : (resposta.oficial === 'parcial' ? 'parcial' : 'pronto'))
            : 'vazio');
        })
        .catch(() => {
          if (viva && versao.current === atual) setEstadoBusca('vazio');
        });
    }, 480);

    return () => {
      viva = false;
      clearTimeout(relogioOficial.current);
    };
  }, [aoPesquisar, atualizarResultados, limparAtivo, texto]);

  const escolher = async (resultado) => {
    if (!resultado) return;
    const atual = ++versao.current;
    clearTimeout(relogioOficial.current);
    setAberto(false);
    limparAtivo();
    setErro('');
    setEstadoBusca('acionando');
    try {
      const resposta = await aoEscolher?.(resultado);
      if (versao.current !== atual) return;
      setNotaAcao(resposta?.mensagem || 'Resultado localizado no mapa.');
      setEstadoBusca('selecionado');
    } catch {
      if (versao.current !== atual) return;
      setErro('Não foi possível concluir essa localização agora. Tente novamente.');
      setEstadoBusca('erro');
    }
  };

  const buscar = async (evento) => {
    evento.preventDefault();
    const classificada = classificarEntradaMapa(texto);
    if (classificada.tipo === 'coordenada') {
      setErro('');
      setAberto(false);
      setNotaAcao('Coordenada localizada e marcada no mapa.');
      aoBuscar(classificada.coordenada);
      return;
    }
    if (classificada.tipo === 'protegida') {
      setErro('Por proteção de dados, pesquise por local ou tema; não use CPF, CNPJ, contato ou protocolo.');
      return;
    }
    if (classificada.tipo !== 'texto') {
      setErro('Digite ao menos duas letras ou uma coordenada válida.');
      return;
    }
    if (aberto && ativo >= 0 && resultados[ativo]) {
      await escolher(resultados[ativo]);
      return;
    }
    if (resultados.length === 1) {
      await escolher(resultados[0]);
      return;
    }
    if (resultados.length > 1) {
      setAberto(true);
      setEstadoBusca('ambiguo');
      return;
    }

    const atual = ++versao.current;
    clearTimeout(relogioOficial.current);
    setEstadoBusca('consultando');
    try {
      const resposta = await aoPesquisar?.(texto, { incluirOficiais: true });
      if (versao.current !== atual) return;
      const encontrados = resposta?.resultados || [];
      atualizarResultados(encontrados, resposta?.total ?? encontrados.length);
      setOficialParcial(resposta?.oficial === 'parcial');
      setAberto(!!encontrados.length);
      setEstadoBusca(encontrados.length ? (resposta?.limitado ? 'limitado' : 'pronto') : 'vazio');
    } catch {
      if (versao.current === atual) setEstadoBusca('vazio');
    }
  };

  const teclaDaBusca = (evento) => {
    if (evento.key === 'Escape' && aberto) {
      evento.preventDefault();
      ++versao.current;
      clearTimeout(relogioOficial.current);
      setAberto(false);
      limparAtivo();
      return;
    }
    if (!resultados.length || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(evento.key)) return;
    evento.preventDefault();
    setAberto(true);
    setAtivo((indice) => {
      let proximo;
      if (evento.key === 'Home') proximo = 0;
      else if (evento.key === 'End') proximo = resultados.length - 1;
      else if (evento.key === 'ArrowDown') proximo = Math.min(resultados.length - 1, indice + 1);
      else proximo = indice <= 0 ? resultados.length - 1 : indice - 1;
      idAtivo.current = resultados[proximo]?.id || null;
      return proximo;
    });
  };

  const copiar = () => {
    if (!marca) return;
    const hoje = new Date().toLocaleDateString('pt-BR');
    navigator.clipboard?.writeText(textoDaLeitura(marca.lat, marca.lon, hoje))
      .then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2200);
      })
      .catch(() => setCopiado(false));
  };

  const utm = marca ? geoParaUtm(marca.lat, marca.lon) : null;
  const fora = marca && !dentroDoParana(marca.lat, marca.lon);

  return (
    <section className="co-painel" role="search" aria-label="Busca no mapa">
      <header>
        <Search size={16} aria-hidden="true" />
        <div>
          <strong>Buscar no mapa</strong>
          <small>Um campo para coordenada, empreendimento, município, bacia, APP, UC ou zona.</small>
        </div>
      </header>

      <div ref={comboRef} style={ESTILO_COMBO}>
        <form className="mp-busca" onSubmit={buscar}>
          <Crosshair size={15} aria-hidden="true" />
          <input
            value={texto}
            role="combobox"
            onChange={(evento) => {
              const valor = evento.target.value;
              setTexto(valor);
              aoAlterarBusca?.(valor);
            }}
            onFocus={() => resultados.length && setAberto(true)}
            onKeyDown={teclaDaBusca}
            placeholder="Ex.: Cantú 2, Ponta Grossa, APP ou -25,4284 -49,2733"
            aria-label="Buscar no mapa"
            aria-autocomplete="list"
            aria-expanded={aberto}
            aria-controls={idLista}
            aria-activedescendant={ativo >= 0 ? `${idLista}-${ativo}` : undefined}
            aria-describedby={`${idAjuda} ${idEstado}`}
          />
          {texto && (
            <button
              type="button"
              onClick={() => {
                ++versao.current;
                clearTimeout(relogioOficial.current);
                setTexto('');
                setErro('');
                setNotaAcao('');
                atualizarResultados([], 0);
                limparAtivo();
                setAberto(false);
                aoLimparBusca?.();
              }}
              aria-label="Limpar busca no mapa"
            >
              <X size={14} />
            </button>
          )}
          <button type="submit" className="co-ir">Buscar</button>
        </form>

        {aberto && !!resultados.length && (
          <div
            id={idLista}
            role="listbox"
            aria-label="Resultados da busca no mapa"
            style={{
              ...ESTILO_RESULTADOS,
              maxHeight: `${geometriaLista.altura}px`,
              ...(geometriaLista.acima
                ? { top: 'auto', bottom: 'calc(100% + 6px)' }
                : null),
            }}
          >
            {resultados.map((resultado, indice) => (
              <button
                id={`${idLista}-${indice}`}
                key={resultado.id}
                type="button"
                role="option"
                tabIndex={-1}
                ref={(elemento) => { opcoesRef.current[indice] = elemento; }}
                aria-selected={ativo === indice}
                style={{
                  ...ESTILO_OPCAO,
                  borderColor: ativo === indice ? 'var(--green2)' : 'transparent',
                  background: ativo === indice ? 'var(--surface2)' : 'transparent',
                }}
                onMouseEnter={() => {
                  idAtivo.current = resultado.id;
                  setAtivo(indice);
                }}
                onClick={() => escolher(resultado)}
              >
                <small style={{ color: 'var(--muted)', fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.035em' }}>
                  {resultado.categoria}
                </small>
                <strong style={{ fontSize: 13, overflowWrap: 'anywhere' }}>{resultado.titulo}</strong>
                {resultado.resumo && (
                  <span style={{ color: 'var(--muted)', fontSize: 11.5, lineHeight: 1.35, overflowWrap: 'anywhere' }}>
                    {resultado.resumo.length > 180 ? `${resultado.resumo.slice(0, 177)}...` : resultado.resumo}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <p id={idAjuda} className="co-nota">
        A busca reconhece o tipo automaticamente. Coordenadas e texto são filtrados neste navegador;
        os índices públicos do GeoPR são consultados sem enviar o que foi digitado. Datum antigo,
        como SAD69, precisa ser transformado antes.
      </p>
      <p id={idEstado} className="co-nota" role="status" aria-live="polite" aria-atomic="true">
        {estadoBusca === 'coordenada' && 'Coordenada reconhecida. Pressione Enter ou Buscar para localizar.'}
        {estadoBusca === 'protegida' && 'Nenhum resultado local. Para proteger dados, não pesquise CPF, CNPJ, contato ou protocolo.'}
        {estadoBusca === 'curta' && 'Digite ao menos duas letras para pesquisar.'}
        {estadoBusca === 'consultando' && 'Nenhum resultado local ainda. Consultando os índices oficiais sem enviar o texto digitado…'}
        {estadoBusca === 'local' && `${resultados.length} ${resultados.length === 1 ? 'resultado local' : 'resultados locais'}.`}
        {estadoBusca === 'limitado' && `${resultados.length} de ${totalResultados} resultados exibidos. Refine a busca para reduzir a lista${oficialParcial ? '; parte dos índices oficiais está indisponível.' : '.'}`}
        {estadoBusca === 'pronto' && `${resultados.length} ${resultados.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}.`}
        {estadoBusca === 'parcial' && `${resultados.length} ${resultados.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}; parte dos índices oficiais está indisponível.`}
        {estadoBusca === 'ambiguo' && 'Há mais de uma correspondência. Escolha o resultado correto.'}
        {estadoBusca === 'acionando' && 'Localizando e preparando os detalhes…'}
        {estadoBusca === 'vazio' && 'Nenhum resultado local ou oficial. Tente coordenada, município, empreendimento, bacia, APP, UC ou zona.'}
      </p>
      {erro && <p className="co-nota co-erro" role="alert">{erro}</p>}
      {notaAcao && <p className="co-aviso" role="status"><Check size={13} aria-hidden="true" /><span>{notaAcao}</span></p>}

      {marca && (
        <div className="co-leitura">
          {marca.forma === 'grau-invertido' && (
            <p className="co-aviso" role="status">
              <AlertTriangle size={13} aria-hidden="true" />
              <span>Li na ordem invertida: o par só cai no Paraná com latitude e longitude trocadas.</span>
            </p>
          )}
          {fora && (
            <p className="co-aviso" role="status">
              <AlertTriangle size={13} aria-hidden="true" />
              <span>Este ponto cai fora do Paraná. Confira o datum, o fuso e a ordem dos valores.</span>
            </p>
          )}
          <dl>
            <dt>SIRGAS 2000</dt>
            <dd>{formatarGrau(marca.lat)}, {formatarGrau(marca.lon)}</dd>
            <dt>Grau, minuto, segundo</dt>
            <dd>{formatarGms(marca.lat, 'lat')} {formatarGms(marca.lon, 'lon')}</dd>
            <dt>UTM fuso {utm.fuso}{utm.hemisferio}</dt>
            <dd>E {formatarMetro(utm.leste)} · N {formatarMetro(utm.norte)}</dd>
          </dl>
          <div className="co-acoes">
            <button type="button" onClick={copiar}>
              {copiado ? <Check size={13} /> : <Copy size={13} />}
              {copiado ? 'copiado' : 'copiar com a data'}
            </button>
            <button type="button" onClick={aoLimpar}>tirar a marca <X size={12} /></button>
          </div>
        </div>
      )}
    </section>
  );
}
