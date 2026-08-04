// Acesso aos casos do Laboratorio: indice e corpo sob demanda.
//
// Por que existe. O orcamento de JS estava em 99,6% do teto. Dividir chunk nao
// resolvia: chunk adiado continua contando no total. O que reduz o total e
// tirar dado de dentro do JavaScript. Indice e corpo dos casos viraram arquivos
// buscados, entao saem do orcamento, ganham cache proprio do navegador e so sao
// lidos quando uma tela realmente precisa deles.
//
// O indice tem os campos com os MESMOS nomes do caso completo, incluindo
// `questions` no formato de tupla com o enunciado na posicao 0. As telas que
// so precisam de titulo, fatos e enunciado funcionam sem saber que existe
// corpo separado.
//
// Os dois artefatos saem de src/scenarios.js por tools/build-lab-data.mjs, que
// tem modo --check no `npm test` para eles nunca divergirem da fonte.
import { useEffect, useState } from 'react';
import indiceUrl from './data/lab-index.json?url';
import corposUrl from './data/lab-corpos.json?url';

const INDICE_VAZIO = Object.freeze({
  grupos: Object.freeze([]),
  casos: Object.freeze([]),
});

// Bindings vivos: quem ja importava as duas listas continua funcionando. O
// hook abaixo provoca a nova renderizacao quando o indice chega, sem colocar os
// 21 kB de texto de volta no JavaScript de entrada.
export let GRUPOS_LAB = INDICE_VAZIO.grupos;
export let scenarios = INDICE_VAZIO.casos;

// Sob deploy em subcaminho (GitHub Pages), caminho absoluto sem o prefixo da
// base vira 404 e a tela fica vazia sem erro no console. O `?url` do Vite ja
// devolve o caminho com a base aplicada, entao nao remontar a mao.
let promessaIndice = null;
let cacheIndice = null;
let promessaCorpos = null;
let cacheCorpos = null;

export function validarIndiceLaboratorio(dados) {
  if (!dados || typeof dados !== 'object') {
    throw new Error('lab-index.json: objeto raiz ausente');
  }
  if (!Array.isArray(dados.grupos) || !Array.isArray(dados.casos)) {
    throw new Error('lab-index.json: grupos e casos devem ser listas');
  }
  if (!dados.grupos.length || !dados.casos.length) {
    throw new Error('lab-index.json: indice vazio');
  }
  const ids = dados.casos.map((caso) => caso?.id);
  if (ids.some((id) => typeof id !== 'string' || !id)) {
    throw new Error('lab-index.json: caso sem identificador');
  }
  if (new Set(ids).size !== ids.length) {
    throw new Error('lab-index.json: identificadores de caso duplicados');
  }
  const idsConhecidos = new Set(ids);
  for (const grupo of dados.grupos) {
    if (!grupo?.id || !Array.isArray(grupo.ids)) {
      throw new Error('lab-index.json: grupo invalido');
    }
    if (grupo.ids.some((id) => !idsConhecidos.has(id))) {
      throw new Error(`lab-index.json: grupo ${grupo.id} referencia caso ausente`);
    }
  }
  return dados;
}

export function validarCorposLaboratorio(dados, indice) {
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new Error('lab-corpos.json: mapa de casos ausente');
  }
  const casosDoIndice = indice?.casos || [];
  const idsEsperados = casosDoIndice.map((caso) => caso.id);
  const idsRecebidos = Object.keys(dados);
  if (idsRecebidos.length !== idsEsperados.length ||
      idsEsperados.some((id) => !Object.hasOwn(dados, id)) ||
      idsRecebidos.some((id) => !idsEsperados.includes(id))) {
    throw new Error('lab-corpos.json: conjunto de casos diverge do indice');
  }
  for (const id of idsEsperados) {
    const caso = dados[id];
    if (caso?.id !== id || typeof caso.track !== 'string' ||
        typeof caso.title !== 'string' || !caso.title.trim()) {
      throw new Error(`lab-corpos.json: identidade invalida em ${id}`);
    }
    for (const campo of ['facts', 'evidence', 'steps', 'questions', 'elementos']) {
      if (!Array.isArray(caso[campo]) || !caso[campo].length) {
        throw new Error(`lab-corpos.json: ${campo} ausente em ${id}`);
      }
    }
    if (typeof caso.outcome !== 'string' || !caso.outcome.trim() ||
        typeof caso.modelo !== 'string' || !caso.modelo.trim()) {
      throw new Error(`lab-corpos.json: resposta comentada ausente em ${id}`);
    }
    if (caso.questions.some((item) => !Array.isArray(item) ||
        typeof item[0] !== 'string' || !['sim', 'nao'].includes(item[1]))) {
      throw new Error(`lab-corpos.json: questao binaria invalida em ${id}`);
    }
  }
  return dados;
}

/** Indice leve dos casos. Busca uma vez, valida e reaproveita. */
export function carregarIndiceLaboratorio({ recarregar = false } = {}) {
  if (recarregar) {
    cacheIndice = null;
    promessaIndice = null;
  }
  if (cacheIndice) return Promise.resolve(cacheIndice);
  if (!promessaIndice) {
    promessaIndice = fetch(indiceUrl)
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`lab-index.json: HTTP ${resposta.status}`);
        return resposta.json();
      })
      .then(validarIndiceLaboratorio)
      .then((indice) => {
        cacheIndice = indice;
        GRUPOS_LAB = indice.grupos;
        scenarios = indice.casos;
        return indice;
      })
      .catch((erro) => {
        promessaIndice = null;
        throw erro;
      });
  }
  return promessaIndice;
}

/** Carrega o indice depois que uma tela realmente precisa dos casos. */
export function useIndiceLaboratorio(ativo) {
  const [estado, setEstado] = useState(() => ({
    indice: cacheIndice,
    erro: null,
  }));
  useEffect(() => {
    if (!ativo || estado.indice) return undefined;
    let vivo = true;
    carregarIndiceLaboratorio().then(
      (indice) => vivo && setEstado({ indice, erro: null }),
      (erro) => vivo && setEstado({ indice: null, erro }),
    );
    return () => {
      vivo = false;
    };
  }, [ativo, estado.indice]);
  return {
    indice: estado.indice,
    casos: estado.indice?.casos || scenarios,
    grupos: estado.indice?.grupos || GRUPOS_LAB,
    erro: estado.erro,
    carregando: Boolean(ativo && !estado.indice && !estado.erro),
  };
}

/** Corpo completo de todos os casos. Busca uma vez e reaproveita. */
export function carregarCorpos() {
  if (cacheCorpos) return Promise.resolve(cacheCorpos);
  if (!promessaCorpos) {
    const corpos = fetch(corposUrl)
      .then((resposta) => {
        if (!resposta.ok) throw new Error(`lab-corpos.json: HTTP ${resposta.status}`);
        return resposta.json();
      });
    promessaCorpos = Promise.all([carregarIndiceLaboratorio(), corpos])
      .then(([indice, dados]) => {
        validarCorposLaboratorio(dados, indice);
        cacheCorpos = dados;
        return dados;
      })
      .catch((erro) => {
        // Zera a promessa para a proxima tentativa poder buscar de novo, em vez
        // de a tela ficar presa no erro da primeira falha de rede.
        promessaCorpos = null;
        throw erro;
      });
  }
  return promessaCorpos;
}

/** Lista completa, na ordem do indice. Use nas telas carregadas sob demanda. */
export function casosCompletos(corpos) {
  return scenarios.map((caso) => corpos[caso.id]);
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
