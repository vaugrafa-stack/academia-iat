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
} from './geoprCamadas.js';
import { CAMADAS_GEOPR, GRUPOS, creditoDe } from './geoprCatalogo.js';
import './geopr.css';

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

export default function GeoprPainel({ ativas, alternar, limpar, atributos }) {
  const porGrupo = useMemo(
    () => GRUPOS.map((g) => ({
      ...g,
      itens: CAMADAS_GEOPR.filter((c) => c.grupo === g.id),
    })).filter((g) => g.itens.length),
    [],
  );
  const idsAtivos = useMemo(() => new Set(ativas.map((c) => c.id)), [ativas]);

  return (
    <section className="gp-painel">
      <header className="gp-cabecalho">
        <Layers3 size={16} aria-hidden="true" />
        <div>
          <strong>Camadas oficiais do GeoPR</strong>
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

      {!!atributos?.length && (
        <div className="gp-atributos">
          <h3>No ponto consultado</h3>
          {atributos.map((achado, indice) => (
            <article key={`${achado.camada}-${indice}`}>
              <h4>{achado.camada || 'Camada sem nome'}</h4>
              {achado.valores.length ? (
                <dl>
                  {achado.valores.map((par) => (
                    <React.Fragment key={par.chave}>
                      <dt>{par.chave}</dt>
                      <dd>{par.valor}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              ) : (
                <p className="gp-nota">O serviço respondeu sem atributos legíveis.</p>
              )}
              {achado.ocultos > 0 && (
                // Dizer que houve retencao, e quantos campos, evita a leitura
                // errada de que o servico respondeu apenas isto. Quem precisa
                // do campo retido consulta o portal do GeoPR, no fim do painel.
                <p className="gp-nota">
                  {achado.ocultos === 1
                    ? '1 campo não exibido aqui por ser dado identificável de processo.'
                    : `${achado.ocultos} campos não exibidos aqui por serem dado identificável de processo.`}
                </p>
              )}
            </article>
          ))}
          <p className="gp-nota">
            Atributo lido do serviço, sem conferência do ato legal. Use como pista.
          </p>
        </div>
      )}

      <a className="gp-portal" href={GEOPR_PORTAL} target="_blank" rel="noopener noreferrer">
        Abrir o portal completo do GeoPR <ExternalLink size={13} aria-hidden="true" />
      </a>
    </section>
  );
}
