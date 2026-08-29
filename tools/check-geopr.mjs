#!/usr/bin/env node
// Portao do catalogo de camadas do GeoPR.
//
// O catalogo aponta para servicos de um servidor que nao e nosso. Ele muda sem
// avisar: servico sai do ar, muda de pasta, deixa de publicar WMS, ou troca a
// atribuicao. Quando isso acontece, a tela mostra um botao que nao desenha
// nada, ou pior, credita a camada a quem nao e mais a fonte declarada.
//
// Duas camadas de verificacao, com propositos diferentes:
//
//   ESTRUTURA (sempre roda, nao precisa de rede). Pega erro nosso: id repetido,
//   grupo inexistente, campo faltando, lista de subcamadas malformada.
//
//   REDE (roda quando ha internet, e SO avisa quando nao ha). Pega a mudanca
//   do outro lado: servico sumido, WMS desligado, atribuicao divergente.
//
// Por que a parte de rede nao reprova por ausencia de rede: este portao entra
// na bateria local, que precisa rodar em avião e em maquina sem saida. Reprovar
// por falta de internet ensinaria todo mundo a ignorar o portao, que e o pior
// resultado possivel. Em CI, use --exigir-rede para transformar a falta de
// resposta em reprovacao.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const exigirRede = process.argv.includes('--exigir-rede');

const GRUPOS_VALIDOS = new Set(['agua', 'energia', 'ucs', 'vegetacao', 'patrimonio', 'base']);
const ORDENS_VALIDAS = new Set(['fundo', 'topo']);
const PRAZO_MS = 45000;

/**
 * Confere o catalogo sem tocar na rede.
 *
 * Devolve a lista de problemas. Lista vazia quer dizer catalogo consistente.
 */
export function conferirEstrutura(camadas, grupos) {
  const problemas = [];
  const idsValidos = new Set((grupos || []).map((g) => g.id));
  const vistos = new Set();

  if (!Array.isArray(camadas) || !camadas.length) {
    return ['catálogo vazio ou não é lista'];
  }

  for (const camada of camadas) {
    const onde = camada?.id || camada?.titulo || '(sem id)';
    if (!camada?.id) problemas.push(`${onde}: sem id`);
    else if (vistos.has(camada.id)) problemas.push(`${camada.id}: id repetido`);
    else vistos.add(camada.id);

    if (!camada?.titulo?.trim()) problemas.push(`${onde}: sem título`);
    if (!idsValidos.has(camada?.grupo)) {
      problemas.push(`${onde}: grupo "${camada?.grupo}" não existe`);
    }
    if (!GRUPOS_VALIDOS.has(camada?.grupo)) {
      problemas.push(`${onde}: grupo "${camada?.grupo}" fora da lista conhecida`);
    }
    if (!ORDENS_VALIDAS.has(camada?.ordem)) {
      problemas.push(`${onde}: ordem "${camada?.ordem}" deve ser fundo ou topo`);
    }
    if (!camada?.caminho || !/^[^/]+(\/[^/]+)?$/.test(camada.caminho)) {
      problemas.push(`${onde}: caminho "${camada?.caminho}" fora do formato pasta/serviço`);
    }
    // A lista de subcamadas vai crua na URL do WMS. Um valor solto ali devolve
    // erro do servidor em vez de imagem, e o sintoma na tela e camada em branco.
    if (typeof camada?.camadas !== 'string' || !/^\d+(,\d+)*$/.test(camada.camadas)) {
      problemas.push(`${onde}: camadas "${camada?.camadas}" deve ser número ou lista separada por vírgula`);
    }
    // `fonte` nula e legitima e significa "o serviço não declara". String vazia
    // NAO e: e o caso em que alguem preencheu com nada achando que preencheu.
    if (camada?.fonte !== null && !String(camada?.fonte || '').trim()) {
      problemas.push(`${onde}: fonte vazia; use null quando o serviço não declara origem`);
    }
    if (!camada?.paraQue?.trim()) problemas.push(`${onde}: sem explicação de para que serve`);
    if (!camada?.modulo?.trim()) problemas.push(`${onde}: sem módulo do curso`);
  }
  return problemas;
}

async function buscarJson(url) {
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), PRAZO_MS);
  try {
    const resposta = await fetch(url, { signal: controle.signal });
    if (!resposta.ok) return { erro: `HTTP ${resposta.status}` };
    return { dados: await resposta.json() };
  } catch (erro) {
    return { erro: erro?.name === 'AbortError' ? 'sem resposta no prazo' : String(erro?.message || erro) };
  } finally {
    clearTimeout(relogio);
  }
}

async function conferirNaRede(camadas, base) {
  const divergencias = [];
  const semResposta = [];

  for (const camada of camadas) {
    const caminho = camada.caminho.split('/').map(encodeURIComponent).join('/');
    const { dados, erro } = await buscarJson(`${base}/rest/services/${caminho}/MapServer?f=json`);
    if (erro) { semResposta.push(`${camada.id}: ${erro}`); continue; }
    if (dados?.error) { divergencias.push(`${camada.id}: o serviço respondeu com erro; conferir o caminho`); continue; }

    if (!String(dados.supportedExtensions || '').includes('WMSServer')) {
      divergencias.push(`${camada.id}: o serviço deixou de publicar WMS, e a camada não desenha mais`);
    }

    const existentes = new Set((dados.layers || []).map((l) => String(l.id)));
    const pedidas = camada.camadas.split(',');
    const faltando = pedidas.filter((id) => !existentes.has(id));
    if (existentes.size && faltando.length) {
      divergencias.push(`${camada.id}: subcamada(s) ${faltando.join(',')} não existem mais no serviço`);
    }

    const declarada = String(dados.copyrightText || '').trim();
    const nossa = camada.fonte === null ? '' : String(camada.fonte).trim();
    if (declarada !== nossa) {
      divergencias.push(
        `${camada.id}: atribuição divergente. O serviço declara ${JSON.stringify(declarada)}`
        + ` e o catálogo diz ${JSON.stringify(nossa)}`,
      );
    }
  }
  return { divergencias, semResposta };
}

// --- autoteste ------------------------------------------------------------
// Um portao que nunca reprovou e indistinguivel de um portao quebrado. Estas
// armadilhas provam que a conferencia de estrutura reage ao defeito que ela
// promete pegar. Se alguem afrouxar a regra, o autoteste cai junto.
function autoteste() {
  const grupos = [{ id: 'agua' }, { id: 'energia' }, { id: 'protegidas' }, { id: 'base' }];
  const boa = {
    id: 'x', titulo: 'X', grupo: 'agua', ordem: 'topo',
    caminho: 'PASTA/servico', camadas: '0', fonte: null,
    paraQue: 'serve para algo', modulo: 'M10',
  };
  const armadilhas = [
    ['id repetido', [boa, { ...boa }]],
    ['grupo inexistente', [{ ...boa, grupo: 'inventado' }]],
    ['ordem invalida', [{ ...boa, ordem: 'meio' }]],
    ['camadas malformadas', [{ ...boa, camadas: '0;1' }]],
    ['camadas nao string', [{ ...boa, camadas: 0 }]],
    ['fonte vazia em vez de nula', [{ ...boa, fonte: '   ' }]],
    ['caminho com barra demais', [{ ...boa, caminho: 'a/b/c' }]],
    ['sem explicacao', [{ ...boa, paraQue: '' }]],
    ['catalogo vazio', []],
  ];
  const falhas = [];
  for (const [nome, entrada] of armadilhas) {
    if (!conferirEstrutura(entrada, grupos).length) {
      falhas.push(`a armadilha "${nome}" passou; a conferência de estrutura não pega mais esse defeito`);
    }
  }
  if (conferirEstrutura([boa], grupos).length) {
    falhas.push('o catálogo mínimo válido foi reprovado; a regra ficou estrita demais');
  }
  return falhas;
}

// --- execucao -------------------------------------------------------------
const falhasDoAutoteste = autoteste();
if (falhasDoAutoteste.length) {
  console.error('REPROVADO: o próprio portão está quebrado.');
  falhasDoAutoteste.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}

const fonte = await readFile(join(raiz, 'src', 'geoprCatalogo.js'), 'utf8');
const modulo = await import(
  `file://${join(raiz, 'src', 'geoprCatalogo.js').replace(/\\/g, '/')}`
);
const { CAMADAS_GEOPR, GRUPOS } = modulo;

const problemas = conferirEstrutura(CAMADAS_GEOPR, GRUPOS);
if (problemas.length) {
  console.error(`REPROVADO: ${problemas.length} problema(s) de estrutura no catálogo do GeoPR.`);
  problemas.forEach((p) => console.error(`  - ${p}`));
  process.exit(1);
}

// A base do servidor mora no modulo de camadas; ler de la evita duas verdades.
const base = (fonte.match(/GEOPR_BASE\s*=\s*'([^']+)'/) || [])[1]
  || (await import(`file://${join(raiz, 'src', 'geoprCamadas.js').replace(/\\/g, '/')}`)).GEOPR_BASE;

console.log(`Estrutura: ${CAMADAS_GEOPR.length} camadas, ${GRUPOS.length} grupos, sem problema.`);

const { divergencias, semResposta } = await conferirNaRede(CAMADAS_GEOPR, base);

if (divergencias.length) {
  console.error(`REPROVADO: ${divergencias.length} divergência(s) entre o catálogo e o servidor.`);
  divergencias.forEach((d) => console.error(`  - ${d}`));
  process.exit(1);
}

if (semResposta.length) {
  const linha = semResposta.length === CAMADAS_GEOPR.length
    ? 'nenhum serviço respondeu; provavelmente não há rede'
    : `${semResposta.length} de ${CAMADAS_GEOPR.length} serviços não responderam`;
  if (exigirRede) {
    console.error(`REPROVADO: ${linha}, e --exigir-rede foi pedido.`);
    semResposta.forEach((s) => console.error(`  - ${s}`));
    process.exit(1);
  }
  console.log(`AVISO: ${linha}. A conferência contra o servidor ficou incompleta.`);
  semResposta.forEach((s) => console.log(`  - ${s}`));
  process.exit(0);
}

console.log(`OK: as ${CAMADAS_GEOPR.length} camadas existem, publicam WMS e a atribuição confere.`);
