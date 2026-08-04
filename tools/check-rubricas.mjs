// Regressao da rubrica de fundamentacao do laboratorio.
//
// Quatro propriedades precisam valer para a conferencia significar alguma coisa:
//   1. a redacao modelo de cada cenario cobre 100% dos elementos que ela mesma
//      cobra, senao a plataforma pede o que nem o proprio modelo entrega;
//   2. um texto generico, sem conteudo do caso, nao pontua nada, senao o termo
//      escolhido e largo demais e a conferencia vira ruido.
//   3. produtos escritos usam a rubrica especifica de `openTask`, com todos os
//      grupos conceituais de cada criterio, e nao a rubrica generica antiga;
//   4. a redacao-modelo de outro caso nao pode satisfazer integralmente uma
//      tarefa aberta, senao a rubrica nao diferencia transferencia de copia.
//
// Uso:  node tools/check-rubricas.mjs
import { scenarios, GRUPOS_LAB } from '../src/scenarios.js';

const norm = (v) => (v || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Mesma regra do app: termo curto (TR, UC, ZA, numero de artigo) exige limite
// de palavra, senao "tr" casaria dentro de "outro" e "quatro".
function bateTermo(texto, termo) {
  const n = norm(termo).trim();
  if (!n) return false;
  if (n.length <= 3) return new RegExp('(^|[^a-z0-9])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)').test(texto);
  return texto.includes(n);
}

const GENERICOS = [
  'Analisei o processo e considero que esta tudo certo, os documentos foram juntados e nao vejo impedimento para seguir com o pedido apresentado pelo interessado.',
  'O empreendimento ja opera ha varios anos sem qualquer problema relevante e por isso entendo que a solicitacao merece deferimento imediato.',
  'Conforme verificado, tudo foi conferido e esta em ordem, motivo pelo qual encaminho para as providencias cabiveis.',
];

function criteriosDoCaso(caso) {
  if (caso.openTask?.criteria?.length) {
    return caso.openTask.criteria.map((criterio) => ({
      rot: criterio.label,
      grupos: criterio.requiredConceptGroups,
    }));
  }
  return (caso.elementos || []).map((elemento) => ({
    rot: elemento.rot,
    grupos: [elemento.termos],
  }));
}

function atendeCriterio(texto, criterio) {
  return criterio.grupos.every((grupo) => grupo.some((termo) => bateTermo(texto, termo)));
}

let erros = 0;

// Todo caso pertence a exatamente um grupo do laboratorio. Caso orfao some da
// navegacao agrupada sem quebrar teste nenhum: ele existe, e ninguem acha.
{
  const nosGrupos = GRUPOS_LAB.flatMap((g) => g.ids);
  const vistos = new Set();
  for (const id of nosGrupos) {
    if (vistos.has(id)) { erros++; console.log('FALHA grupo: caso repetido em mais de um grupo -> ' + id); }
    vistos.add(id);
    if (!scenarios.some((c) => c.id === id)) { erros++; console.log('FALHA grupo: id inexistente -> ' + id); }
  }
  for (const c of scenarios) {
    if (!vistos.has(c.id)) { erros++; console.log('FALHA grupo: caso sem grupo, invisivel na navegacao -> ' + c.id); }
  }
}

for (const s of scenarios) {
  const criterios = criteriosDoCaso(s);
  if (!criterios.length) { erros++; console.log(`FALHA ${s.id}: sem elementos de rubrica`); continue; }
  if (!s.modelo) { erros++; console.log(`FALHA ${s.id}: sem redacao modelo`); continue; }
  const t = norm(s.modelo);
  const faltam = criterios.filter((criterio) => !atendeCriterio(t, criterio)).map((criterio) => criterio.rot);
  if (faltam.length) { erros++; console.log(`FALHA ${s.id}: o modelo nao cobre -> ${faltam.join(' | ')}`); }
}

for (const g of GENERICOS) {
  const t = norm(g);
  for (const s of scenarios) {
    const casou = criteriosDoCaso(s).filter((criterio) => atendeCriterio(t, criterio));
    if (casou.length) {
      erros++;
      console.log(`FALHA ${s.id}: texto generico pontuou em -> ${casou.map((criterio) => criterio.rot).join(' | ')}`);
    }
  }
}

// A tarefa aberta precisa pedir vocabulario e relacoes proprios. O teste nao
// proibe sobreposicao parcial entre casos tecnicos; proibe somente que o modelo
// completo de outro caso receba 100% na rubrica-alvo.
for (const alvo of scenarios.filter((caso) => caso.openTask?.criteria?.length)) {
  const criterios = criteriosDoCaso(alvo);
  for (const origem of scenarios) {
    if (origem.id === alvo.id) continue;
    const texto = norm(origem.modelo);
    if (criterios.every((criterio) => atendeCriterio(texto, criterio))) {
      erros++;
      console.log(`FALHA ${alvo.id}: o modelo de ${origem.id} cobre integralmente a rubrica aberta.`);
    }
  }
}

if (erros) {
  console.log(`\n${erros} problema(s) na rubrica.`);
  process.exit(1);
}
console.log(`OK: ${scenarios.length} cenarios, modelos cobrem 100% da propria rubrica, textos genericos nao pontuam e tarefas abertas diferenciam os casos.`);
