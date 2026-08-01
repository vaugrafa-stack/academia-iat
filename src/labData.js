// Acesso aos casos do Laboratorio: indice sempre, corpo sob demanda.
//
// Por que existe. O orcamento de JS estava em 99,6% do teto. Dividir chunk nao
// resolvia: chunk adiado continua contando no total. O que reduz o total e
// tirar dado de dentro do JavaScript. Os 68 kB de corpo dos casos viraram um
// arquivo buscado, entao saem do orcamento, ganham cache proprio do navegador
// e nao sao baixados por quem nunca abre o Laboratorio.
//
// O indice tem os campos com os MESMOS nomes do caso completo, incluindo
// `questions` no formato de tupla com o enunciado na posicao 0. As telas que
// so precisam de titulo, fatos e enunciado funcionam sem saber que existe
// corpo separado.
//
// Os dois artefatos saem de src/scenarios.js por tools/build-lab-data.mjs, que
// tem modo --check no `npm test` para eles nunca divergirem da fonte.
import { useEffect, useState } from 'react';
import indice from './data/lab-index.json';
import corposUrl from './data/lab-corpos.json?url';

export const GRUPOS_LAB = indice.grupos;
export const scenarios = indice.casos;

// Sob deploy em subcaminho (GitHub Pages), caminho absoluto sem o prefixo da
// base vira 404 e a tela fica vazia sem erro no console. O `?url` do Vite ja
// devolve o caminho com a base aplicada, entao nao remontar a mao.
let promessa = null;
let cache = null;

/** Corpo completo de todos os casos. Busca uma vez e reaproveita. */
export function carregarCorpos() {
  if (cache) return Promise.resolve(cache);
  if (!promessa) {
    promessa = fetch(corposUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`lab-corpos.json: HTTP ${r.status}`);
        return r.json();
      })
      .then((dados) => {
        cache = dados;
        return dados;
      })
      .catch((erro) => {
        // Zera a promessa para a proxima tentativa poder buscar de novo, em vez
        // de a tela ficar presa no erro da primeira falha de rede.
        promessa = null;
        throw erro;
      });
  }
  return promessa;
}

/** Lista completa, na ordem do indice. Use nas telas carregadas sob demanda. */
export function casosCompletos(corpos) {
  return scenarios.map((c) => corpos[c.id] || c);
}

/**
 * Casos completos, buscados so quando a area que precisa deles abre.
 *
 * Devolve `casos: null` enquanto nao chegaram, para a tela mostrar carregamento
 * em vez de renderizar caso pela metade: sem evidencia, sem rubrica e sem
 * desfecho, o Laboratorio pareceria quebrado em vez de carregando.
 *
 * Sob deploy em subcaminho, um arquivo 404 deixaria a area em branco sem erro
 * visivel. Por isso o erro volta explicito, e a tela mostra o que aconteceu.
 */
export function useCasosSobDemanda(ativo) {
  const [corpos, setCorpos] = useState(null);
  const [erro, setErro] = useState(null);
  useEffect(() => {
    if (!ativo || corpos) return undefined;
    let vivo = true;
    setErro(null);
    carregarCorpos().then(
      (dados) => vivo && setCorpos(dados),
      (falha) => vivo && setErro(falha),
    );
    return () => {
      vivo = false;
    };
  }, [ativo, corpos]);
  return {
    casos: corpos ? casosCompletos(corpos) : null,
    erro,
  };
}
