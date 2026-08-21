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

import React, { useState } from 'react';
import { AlertTriangle, Check, Copy, Crosshair, X } from 'lucide-react';
import {
  dentroDoParana,
  formatarGms,
  formatarGrau,
  formatarMetro,
  geoParaUtm,
  lerCoordenada,
} from './coordenadas.js';
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

export default function PainelCoordenada({ marca, aoBuscar, aoLimpar }) {
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [copiado, setCopiado] = useState(false);

  const buscar = (evento) => {
    evento.preventDefault();
    const lido = lerCoordenada(texto);
    if (!lido) {
      setErro('Não reconheci. Use grau decimal, grau/minuto/segundo ou fuso, leste, norte.');
      return;
    }
    setErro('');
    aoBuscar(lido);
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
    <section className="co-painel">
      <header>
        <Crosshair size={16} aria-hidden="true" />
        <div>
          <strong>Coordenada</strong>
          <small>Clique no mapa para ler, ou digite uma para localizar.</small>
        </div>
      </header>

      <form className="mp-busca" onSubmit={buscar}>
        <Crosshair size={15} aria-hidden="true" />
        <input
          value={texto}
          onChange={(evento) => { setTexto(evento.target.value); setErro(''); }}
          placeholder="-25,4284 -49,2733 ou 22 673648 7186491"
          aria-label="Coordenada para localizar no mapa"
          aria-describedby="co-ajuda"
        />
        {texto && (
          <button type="button" onClick={() => { setTexto(''); setErro(''); }} aria-label="Limpar coordenada">
            <X size={14} />
          </button>
        )}
        <button type="submit" className="co-ir">Ir</button>
      </form>
      <p id="co-ajuda" className="co-nota">
        Aceita grau decimal, grau/minuto/segundo com hemisfério, e UTM na ordem fuso, leste, norte.
        A conversão assume SIRGAS 2000; coordenada em datum antigo, como SAD69, precisa ser
        transformada antes, e a diferença chega a dezenas de metros.
      </p>
      {erro && <p className="co-nota co-erro" role="alert">{erro}</p>}

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
