// Painel das camadas do GeoPR, ao lado do mapa.
//
// Tres coisas, nesta ordem de importancia:
//
// 1. O limite. A secao 137 do POP diz que estas camadas apoiam a conferencia e
//    NAO substituem a leitura do ato legal. O aviso fica fixo, e nao escondido
//    atras de um icone de ajuda, porque o erro que ele evita e caro: concluir
//    sobreposicao de unidade de conservacao olhando poligonal na tela.
// 2. A procedencia. Cada camada mostra a fonte que o servico declara, ou diz
//    que ele nao declara nenhuma. O POP manda registrar camada, fonte e data.
// 3. O acervo. As camadas curadas cobrem o que a analise consulta com mais
//    frequencia; a busca ao vivo alcanca o resto do GeoPR sem sair daqui.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ChevronDown, ExternalLink, Layers3, Search, X } from 'lucide-react';
import {
  GEOPR_PORTAL,
  camadaDoAcervo,
  carregarAcervo,
  filtrarAcervo,
  resumoDoAchado,
  rotuloDeAtributo,
  tituloDoAchado,
} from './geoprCamadas.js';
import { CAMADAS_GEOPR, GRUPOS, creditoDe } from './geoprCatalogo.js';
import './geopr.css';

// O CSS da rota ja opera no limite bruto do artefato. Estes estilos pequenos e
// exclusivos do estado dinamico ficam junto do componente para nao ampliar a
// folha entregue a quem abre o mapa sem consultar atributos.
const ESTILO_TOOLTIP = {
  position: 'absolute',
  zIndex: 4,
  pointerEvents: 'none',
  width: 'min(290px, calc(100% - 16px))',
  maxWidth: 'calc(100% - 16px)',
  minWidth: 0,
  maxHeight: 'calc(60% - 8px)',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 5,
  padding: '9px 11px',
  border: '1px solid color-mix(in srgb, var(--ink) 22%, var(--line))',
  borderRadius: 10,
  background: 'color-mix(in srgb, var(--surface) 96%, transparent)',
  boxShadow: '0 8px 24px color-mix(in srgb, var(--ink) 16%, transparent)',
  backdropFilter: 'blur(5px)',
  color: 'var(--ink)',
  lineHeight: 1.35,
};

const ESTILO_ESTADO = {
  margin: 0,
  padding: '10px 11px',
  border: '1px solid var(--line)',
  borderRadius: 9,
  background: 'var(--surface)',
  fontSize: 12,
  lineHeight: 1.5,
  color: 'var(--muted)',
};
const ESTILO_NOTA_TOOLTIP = { fontSize: 11, color: 'var(--muted)' };

/**
 * Legenda sobre o mapa.
 *
 * Sem ela, ligar uma camada pintava o mapa de verde e pronto: nao havia como
 * saber o que o verde queria dizer, nem qual das camadas ligadas o produziu. O
 * simbolo e o rotulo vem do proprio servico, entao a legenda e a mesma que o
 * GeoPR usa, e nao uma interpretacao nossa das cores.
 */
export function GeoprLegenda({ camadas, legendas, esperando, aoDesligar }) {
  // Comeca FECHADA de proposito. Aberta, ela ocupa cerca de 40% da largura e
  // 58% da altura do quadro, e fica justamente sobre o sudoeste, onde estao as
  // usinas do Iguacu. Quem liga uma camada quer ver a camada; tapar a camada
  // recem-ligada com a legenda dela anula o gesto. O rotulo do botao ja diz
  // quantas camadas estao ligadas, entao nada some: fica a um clique.
  const [aberta, setAberta] = useState(false);
  if (!camadas.length) return null;

  return (
    <div className={'gp-legenda' + (aberta ? '' : ' fechada')}>
      <button
        type="button"
        className="gp-legenda-topo"
        aria-expanded={aberta}
        onClick={() => setAberta((v) => !v)}
      >
        <Layers3 size={13} aria-hidden="true" />
        <span>
          {camadas.length} {camadas.length === 1 ? 'camada do GeoPR' : 'camadas do GeoPR'}
        </span>
        {esperando && <em className="gp-legenda-espera">carregando...</em>}
        <ChevronDown size={13} aria-hidden="true" className="gp-legenda-seta" />
      </button>

      {aberta && (
        <ul>
          {camadas.map((camada) => {
            const legenda = legendas.get(camada.id);
            const sobrando = legenda ? legenda.total - legenda.simbolos.length : 0;
            return (
              <li key={camada.id}>
                <div className="gp-legenda-nome">
                  <strong>{camada.titulo}</strong>
                  <button
                    type="button"
                    onClick={() => aoDesligar(camada)}
                    aria-label={`Desligar a camada ${camada.titulo}`}
                    title={`Desligar ${camada.titulo}`}
                  >
                    <X size={12} />
                  </button>
                </div>
                <small>{creditoDe(camada)}</small>
                {legenda?.simbolos?.length ? (
                  <ul className="gp-simbolos">
                    {legenda.simbolos.map((simbolo, indice) => (
                      <li key={`${simbolo.rotulo}-${indice}`}>
                        <img src={simbolo.imagem} alt="" width={14} height={14} />
                        <span>{simbolo.rotulo}</span>
                      </li>
                    ))}
                    {sobrando > 0 && (
                      // Dizer quantas ficaram de fora e melhor do que cortar em
                      // silencio: quem le sabe que a lista nao acabou ali.
                      <li className="gp-simbolos-resto">e mais {sobrando} no serviço</li>
                    )}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Credito({ camada }) {
  return (
    <small className={'gp-credito' + (camada.fonte ? '' : ' gp-sem-fonte')}>
      {creditoDe(camada)}
    </small>
  );
}

function dataDaConsulta(valor) {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) return null;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data);
}

/** Resumo ancorado no simbolo; no toque, permanece ate a proxima consulta. */
export function GeoprResumoNoMapa({ consulta }) {
  if (!consulta?.posicao || ['ociosa', 'aguardando'].includes(consulta.estado)) return null;
  const xPct = Math.min(100, Math.max(0, Number(consulta.posicao.xPct) || 0));
  const yPct = Math.min(100, Math.max(0, Number(consulta.posicao.yPct) || 0));
  const classes = [
    'gp-tooltip',
    consulta.tipo === 'fixada' ? 'fixada' : '',
  ].filter(Boolean).join(' ');
  const achado = consulta.achados?.[0];
  const resumo = achado ? resumoDoAchado(achado, 3) : [];
  const pelaDireita = xPct > 50;
  const porBaixo = yPct <= 50;
  // O inset maximo reserva os 290 px do balao e oito de margem. Em mapas mais
  // estreitos, `max(8px, ...)` reduz tudo a oito e a largura fluida ocupa o que
  // couber. Assim nenhum ponto intermediario corta o balao no overflow do mapa.
  const insetMaximo = 'max(8px, calc(100% - 298px))';
  const insetHorizontal = pelaDireita
    ? `clamp(8px, calc(${100 - xPct}% + 12px), ${insetMaximo})`
    : `clamp(8px, calc(${xPct}% + 12px), ${insetMaximo})`;
  // No eixo vertical, o balao usa no maximo 60% do quadro e nasce nos 40% mais
  // proximos ao ponto; os oito pixels restantes garantem que tambem nao corte.
  const insetVertical = porBaixo
    ? `clamp(8px, calc(${yPct}% + 12px), 40%)`
    : `clamp(8px, calc(${100 - yPct}% + 12px), 40%)`;

  return (
    <div
      className={classes}
      style={{
        ...ESTILO_TOOLTIP,
        left: pelaDireita ? undefined : insetHorizontal,
        right: pelaDireita ? insetHorizontal : undefined,
        top: porBaixo ? insetVertical : undefined,
        bottom: porBaixo ? undefined : insetVertical,
        borderColor: consulta.tipo === 'fixada' ? 'var(--green2)' : undefined,
      }}
      role="tooltip"
    >
      {consulta.estado === 'carregando' && <strong>Consultando o GeoPR…</strong>}
      {consulta.estado === 'vazio' && (
        <>
          <strong>Nenhum objeto identificado</strong>
          <span style={ESTILO_NOTA_TOOLTIP}>
            {consulta.falhas > 0
              ? 'Nenhum objeto nas camadas que responderam; houve resposta parcial.'
              : 'Tente o centro do símbolo ou aproxime o mapa.'}
          </span>
        </>
      )}
      {consulta.estado === 'erro' && (
        <>
          <strong>Consulta indisponível</strong>
          <span style={ESTILO_NOTA_TOOLTIP}>O mapa continua visível; tente novamente em instantes.</span>
        </>
      )}
      {consulta.estado === 'pronto' && achado && (
        <>
          <small style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '.035em', textTransform: 'uppercase', color: 'var(--muted)', overflowWrap: 'anywhere' }}>
            {achado.origem?.titulo || achado.camada || 'Camada do GeoPR'}
          </small>
          <strong style={{ fontSize: 13.5, overflowWrap: 'anywhere' }}>{tituloDoAchado(achado, 120)}</strong>
          {!!resumo.length && (
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '2px 8px', margin: 0 }}>
              {resumo.map((par) => (
                <React.Fragment key={par.chave}>
                  <dt style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--muted)' }}>{par.rotulo}</dt>
                  <dd style={{ margin: 0, fontSize: 11.5, overflowWrap: 'anywhere' }}>{par.valor}</dd>
                </React.Fragment>
              ))}
            </dl>
          )}
          {consulta.achados.length > 1 && (
            <span style={ESTILO_NOTA_TOOLTIP}>
              + {consulta.achados.length - 1} {consulta.achados.length === 2 ? 'registro próximo' : 'registros próximos'} ao ponto consultado
            </span>
          )}
          <em style={{ paddingTop: 4, borderTop: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', fontStyle: 'normal' }}>
            {consulta.tipo === 'fixada' ? 'Detalhes fixados no painel' : 'Clique para fixar os detalhes'}
          </em>
        </>
      )}
    </div>
  );
}

function DetalhesDaConsulta({ consulta, aoFechar }) {
  if (!consulta || consulta.estado === 'ociosa') return null;
  const momento = dataDaConsulta(consulta.consultadoEm);
  const limiteVisual = 12;
  const achadosVisiveis = (consulta.achados || []).slice(0, limiteVisual);
  const resultadosOmitidos = Math.max(0, (consulta.achados || []).length - achadosVisiveis.length);
  return (
    <div className="gp-atributos">
      <div className="gp-atributos-topo" style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44 }}>
        <h3>{consulta.origemBusca === 'pesquisa' ? 'Detalhes da busca' : 'Detalhes do ponto'}</h3>
        <button
          type="button"
          className="mp-limpar"
          style={{ width: 44, height: 44, padding: 0, justifyContent: 'center', marginLeft: 'auto' }}
          onClick={aoFechar}
          aria-label={consulta.origemBusca === 'pesquisa' ? 'Fechar detalhes da busca' : 'Fechar detalhes do ponto'}
        >
          <X size={13} aria-hidden="true" />
        </button>
      </div>

      {consulta.estado === 'carregando' && (
        <p className="gp-consulta-estado" style={ESTILO_ESTADO} role="status">Consultando as camadas ativas do GeoPR…</p>
      )}
      {consulta.estado === 'vazio' && (
        <p className="gp-consulta-estado" style={ESTILO_ESTADO} role="status">
          Nenhum objeto foi identificado nas camadas que responderam nesse ponto.
          {consulta.falhas > 0
            ? ` ${consulta.falhas === 1 ? 'Uma camada ativa não respondeu.' : `${consulta.falhas} camadas ativas não responderam.`}`
            : ' Aproxime o mapa ou clique mais perto do centro do símbolo.'}
        </p>
      )}
      {consulta.estado === 'erro' && (
        <p className="gp-consulta-estado gp-aviso" style={ESTILO_ESTADO} role="alert">
          O serviço de atributos não respondeu agora. A imagem da camada continua sendo apenas uma referência visual.
        </p>
      )}

      {consulta.estado === 'pronto' && (
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {consulta.achados.length === 1
            ? 'Um resultado do GeoPR identificado; detalhes disponíveis no painel.'
            : `${consulta.achados.length} resultados do GeoPR identificados; detalhes disponíveis no painel.`}
        </p>
      )}

      {consulta.estado === 'pronto' && achadosVisiveis.map((achado, indice) => (
        <article key={`${achado.origem?.id}-${achado.camada}-${indice}`}>
          <small className="gp-camada-consultada" style={{ display: 'block', marginBottom: 3, fontSize: 10.5, fontWeight: 800, letterSpacing: '.035em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            {achado.origem?.titulo || 'Camada do GeoPR'}
          </small>
          <h4>{tituloDoAchado(achado, 180)}</h4>
          {achado.origem?.paraQue && (
            <p className="gp-resumo-camada" style={{ margin: '0 0 8px', fontSize: 11.5, lineHeight: 1.45, color: 'var(--muted)' }}>
              {achado.origem.paraQue}
            </p>
          )}
          {achado.camada && achado.camada !== achado.origem?.titulo && (
            <p className="gp-nota">Subcamada do serviço: {achado.camada}</p>
          )}
          {achado.origem?.caminho && (
            <p className="gp-nota" style={{ overflowWrap: 'anywhere' }}>
              Serviço oficial: <code>{achado.origem.caminho}</code>
            </p>
          )}
          {achado.valores.length ? (
            <dl>
              {achado.valores.map((par) => (
                <React.Fragment key={par.chave}>
                  <dt>{rotuloDeAtributo(par.chave)}</dt>
                  <dd>{par.valor}</dd>
                </React.Fragment>
              ))}
            </dl>
          ) : (
            <p className="gp-nota">O objeto existe, mas o serviço não devolveu atributos exibíveis.</p>
          )}
          {achado.origem && <Credito camada={achado.origem} />}
          {achado.ocultos > 0 && (
            <p className="gp-nota">
              {achado.ocultos === 1
                ? '1 campo não exibido por proteção de dados ou por não ser necessário para identificar a feição.'
                : `${achado.ocultos} campos não exibidos por proteção de dados ou por não serem necessários para identificar a feição.`}
            </p>
          )}
          {achado.omitidos > 0 && (
            <p className="gp-nota">
              {achado.omitidos === 1
                ? '1 atributo técnico adicional omitido para manter o painel legível.'
                : `${achado.omitidos} atributos técnicos adicionais omitidos para manter o painel legível.`}
            </p>
          )}
        </article>
      ))}

      {consulta.estado === 'pronto' && resultadosOmitidos > 0 && (
        <p className="gp-nota gp-aviso">
          {resultadosOmitidos} resultados adicionais não foram expandidos. Desligue camadas ou aproxime o mapa para refinar o ponto.
        </p>
      )}

      {consulta.estado === 'pronto' && consulta.falhas > 0 && (
        <p className="gp-nota gp-aviso">
          {consulta.falhas === 1
            ? 'Uma camada ativa não respondeu; os demais resultados foram preservados.'
            : `${consulta.falhas} camadas ativas não responderam; os demais resultados foram preservados.`}
        </p>
      )}
      {momento && <p className="gp-nota">Consulta ao serviço oficial em {momento}.</p>}
      <p className="gp-nota">
        {consulta.origemBusca === 'pesquisa'
          ? 'Resultado da busca em bases públicas; confira a feição, a fonte e o ato aplicável antes de concluir.'
          : 'Atributos lidos do serviço, sem conferência do ato legal. Use como pista.'}
      </p>
    </div>
  );
}

function BuscaNoAcervo({ ativas, alternar }) {
  const [termo, setTermo] = useState('');
  const [acervo, setAcervo] = useState(null);
  const [estado, setEstado] = useState('ocioso');
  const abortar = useRef(null);

  useEffect(() => () => abortar.current?.abort(), []);

  const carregar = useCallback(() => {
    if (acervo || estado === 'carregando') return;
    setEstado('carregando');
    abortar.current = new AbortController();
    carregarAcervo({
      sinal: abortar.current.signal,
      // Cada pasta que chega ja alimenta a lista, em vez de esperar a ultima.
      aoChegar: (parcial) => setAcervo(parcial),
    })
      .then((lista) => setEstado(lista.length ? 'pronto' : 'erro'))
      .catch(() => setEstado('erro'));
  }, [acervo, estado]);

  // Carregar so no foco era fragil: quem cola texto, chega por teclado ou usa
  // preenchimento automatico podia digitar num campo que nunca buscou nada, e
  // a tela nao dizia o porque. Digitar tambem carrega.
  useEffect(() => {
    if (termo) carregar();
  }, [termo, carregar]);

  const achados = useMemo(() => filtrarAcervo(acervo, termo), [acervo, termo]);
  const idsAtivos = useMemo(() => new Set(ativas.map((c) => c.id)), [ativas]);

  return (
    <div className="gp-acervo">
      <div className="mp-busca">
        <Search size={16} aria-hidden="true" />
        <input
          value={termo}
          onFocus={carregar}
          onChange={(evento) => setTermo(evento.target.value)}
          placeholder="Buscar no acervo do GeoPR..."
          aria-label="Buscar qualquer camada do acervo do GeoPR"
          aria-describedby="gp-acervo-ajuda"
        />
        {termo && (
          <button onClick={() => setTermo('')} aria-label="Limpar busca no acervo">
            <X size={14} />
          </button>
        )}
      </div>
      <p id="gp-acervo-ajuda" className="gp-nota">
        As camadas acima são as que a análise consulta com mais frequência. A busca alcança
        o acervo inteiro do GeoPR, com mais de mil serviços, sem sair da Academia.
      </p>

      {estado === 'carregando' && <p className="gp-nota" role="status">Carregando o acervo...</p>}
      {estado === 'erro' && (
        <p className="gp-nota gp-aviso" role="status">
          Não foi possível ler o acervo agora. As camadas acima continuam disponíveis.
        </p>
      )}
      {estado === 'pronto' && termo && !achados.length && (
        <p className="gp-nota" role="status">Nada encontrado para “{termo}”.</p>
      )}

      {!!achados.length && (
        <ul className="gp-achados">
          {achados.map((item) => {
            const camada = camadaDoAcervo(item);
            const ligada = idsAtivos.has(camada.id);
            return (
              <li key={camada.id}>
                <button
                  type="button"
                  className={ligada ? 'on' : ''}
                  aria-pressed={ligada}
                  onClick={() => alternar(camada)}
                >
                  <span>{camada.titulo}</span>
                  <small>{item.pasta || 'raiz'}</small>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function GeoprPainel({ ativas, alternar, limpar, consulta, aoFecharConsulta }) {
  // Filtro por modulo do curso.
  //
  // A busca logo abaixo varre o acervo inteiro do GeoPR, com mais de mil
  // servicos. A lista curada, com 23, nao tinha filtro nenhum: quem estudava
  // unidades de conservacao percorria as 23 para achar as quatro do M12.
  //
  // O eixo e o modulo porque e ele que liga o mapa ao curso. Cada camada ja
  // carrega a etiqueta, e ela e o vocabulario que a pessoa ve nas aulas; o
  // rotulo da linha existe para que "M12" nao chegue sem contexto.
  const [modulo, setModulo] = useState(null);

  const modulos = useMemo(() => {
    const conta = new Map();
    for (const camada of CAMADAS_GEOPR) {
      if (!camada.modulo) continue;
      conta.set(camada.modulo, (conta.get(camada.modulo) || 0) + 1);
    }
    return [...conta.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, []);

  const porGrupo = useMemo(
    () => GRUPOS.map((g) => ({
      ...g,
      itens: CAMADAS_GEOPR.filter(
        (c) => c.grupo === g.id && (!modulo || c.modulo === modulo),
      ),
    })).filter((g) => g.itens.length),
    [modulo],
  );
  const idsAtivos = useMemo(() => new Set(ativas.map((c) => c.id)), [ativas]);

  // Filtrar esconde camada ligada, e uma camada que desenha no mapa sem aparecer
  // na lista nao tem como ser desligada dali. Em vez de abrir excecao na regra
  // do filtro, que confundiria mais, a tela diz quantas ficaram fora e devolve
  // a lista inteira num clique.
  const ligadasForaDoFiltro = modulo
    ? ativas.filter((camada) => camada.modulo !== modulo).length
    : 0;

  return (
    <section className="gp-painel">
      <header className="gp-cabecalho">
        <Layers3 size={16} aria-hidden="true" />
        <div>
          <h2>Camadas oficiais do GeoPR</h2>
          <small>Serviços publicados pelo IAT, desenhados sobre este mapa.</small>
        </div>
        {!!ativas.length && (
          <button type="button" className="mp-limpar" onClick={limpar}>
            desligar todas <X size={12} />
          </button>
        )}
      </header>

      <p className="gp-limite">
        <AlertTriangle size={14} aria-hidden="true" />
        <span>
          Estas camadas são instrumento de apoio e não substituem a leitura do ato legal.
          Ver uma poligonal aqui levanta a dúvida; não a resolve. Ao usar no processo,
          registre a camada, a fonte e a data da consulta.
        </span>
      </p>

      <div className="gp-modulos" role="group" aria-label="Filtrar camadas por módulo do curso">
        <span className="gp-modulos-rotulo">Filtrar por módulo</span>
        <div className="gp-modulos-fichas">
          <button
            type="button"
            className={modulo ? '' : 'on'}
            aria-pressed={!modulo}
            onClick={() => setModulo(null)}
          >
            Todas <b>{CAMADAS_GEOPR.length}</b>
          </button>
          {modulos.map(([codigo, quantas]) => (
            <button
              key={codigo}
              type="button"
              className={modulo === codigo ? 'on' : ''}
              aria-pressed={modulo === codigo}
              aria-label={`Mostrar apenas as ${quantas} camadas do módulo ${codigo}`}
              onClick={() => setModulo((atual) => (atual === codigo ? null : codigo))}
            >
              {codigo} <b>{quantas}</b>
            </button>
          ))}
        </div>
        {ligadasForaDoFiltro > 0 && (
          <p className="gp-nota">
            {ligadasForaDoFiltro === 1
              ? '1 camada ligada está fora deste filtro e continua desenhando no mapa.'
              : `${ligadasForaDoFiltro} camadas ligadas estão fora deste filtro e continuam desenhando no mapa.`}
            {' '}
            <button type="button" className="gp-nota-acao" onClick={() => setModulo(null)}>
              ver todas
            </button>
          </p>
        )}
      </div>

      <DetalhesDaConsulta consulta={consulta} aoFechar={aoFecharConsulta} />

      {porGrupo.map((grupo) => (
        <div key={grupo.id} className="gp-grupo">
          <h3>{grupo.rotulo}</h3>
          <ul>
            {grupo.itens.map((camada) => {
              const ligada = idsAtivos.has(camada.id);
              return (
                <li key={camada.id}>
                  <button
                    type="button"
                    className={ligada ? 'on' : ''}
                    aria-pressed={ligada}
                    // A dica repete para quem passa o mouse o que so aparecia
                    // depois de ligar a camada. Descobrir para que serve nao
                    // deveria exigir ligar uma a uma.
                    title={`${camada.titulo}. ${camada.paraQue} ${creditoDe(camada)}`}
                    onClick={() => alternar(camada)}
                  >
                    <span className="gp-titulo">{camada.titulo}</span>
                    {camada.modulo && (
                      <span className="gp-modulo" title={`Tratada no módulo ${camada.modulo} do curso`}>
                        {camada.modulo}
                      </span>
                    )}
                  </button>
                  {ligada && (
                    <div className="gp-detalhe">
                      {camada.paraQue && <p>{camada.paraQue}</p>}
                      <Credito camada={camada} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      <BuscaNoAcervo ativas={ativas} alternar={alternar} />

      <a className="gp-portal" href={GEOPR_PORTAL} target="_blank" rel="noopener noreferrer">
        Abrir o portal completo do GeoPR <ExternalLink size={13} aria-hidden="true" />
      </a>
    </section>
  );
}
