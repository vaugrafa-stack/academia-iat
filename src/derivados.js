// Dado derivado do POP, separado dos componentes.
//
// Por que este arquivo existe. Toda tela de main.jsx lia `lessons`, `blockMap`,
// `INDICE` e companhia direto do escopo do modulo. Era isso que tornava
// perigosa qualquer extracao de tela: mover um componente significava arrastar
// junto um punhado de nomes invisiveis. Aqui eles viram o retorno de uma
// funcao, com entrada explicita e saida nomeada.
//
// Nada de logica nova: os corpos abaixo sao os mesmos que estavam em main.jsx.
import { derivarAulas } from './lessons.js';

export function norm(v=''){return v.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}

// Monta tudo o que se deriva do POP carregado. Chamada uma vez, na carga.
export function criarDerivados(popData, tracks) {
  const blockMap=new Map(popData.blocks.map(b=>[b.id,b]));
  const tableMap=new Map(popData.tables.map(t=>[t.id,t]));
  const figureByBlock=new Map(popData.figures.map(f=>[f.blockId,f]));
  const sectionMap=new Map(popData.sections.map(s=>[s.id,s]));
  const GLOSSARIO=(()=>{const t=popData.tables.find(x=>/siglas e abrevia/i.test(x.title||''));const m=new Map();if(t)for(const r of t.rows.slice(1)){const c=r.cells||[];const sig=(c[0]&&c[0].text||'').trim();if(sig&&sig.length<=8&&/^[A-ZÇÃÕ0-9/.-]+$/.test(sig))m.set(sig,{nome:(c[1]&&c[1].text||'').trim(),desc:(c[2]&&c[2].text||'').trim()})}return m})();
  function siglasDaAula(texto){const achadas=[];for(const [sig,v] of GLOSSARIO){if(new RegExp('(^|[^A-Za-zÀ-ÿ])'+sig.replace(/[.*+?^${}()|[]\]/g,'\$&')+'([^A-Za-zÀ-ÿ]|$)').test(texto))achadas.push({sig,...v})}return achadas.slice(0,10)}
  const{sectionById,lessons,lessonMap,trackLessons}=derivarAulas(popData,tracks);
  function sectionText(section){return(section.blockIds||[]).map(id=>{const b=blockMap.get(id);return b?.paragraph?.text||b?.caption||''}).filter(Boolean).join(' ')}
  const INDICE=(()=>{const out=[];return{get(){if(out.length)return out;
 for(const l of lessons)out.push({type:'seção',id:l.id,title:((l.number||'')+' '+l.title).trim(),text:sectionText(l)});
 for(const t of popData.tables)if(!t.navigationOnly)out.push({type:'quadro',id:t.id,title:t.caption,text:t.rows.map(r=>r.cells.map(c=>c.text).join(' ')).join(' ')});
 for(const [sig,v] of GLOSSARIO)out.push({type:'sigla',id:'sigla:'+sig,title:sig+', '+v.nome,text:v.desc});
 return out}}})();
  function firstLesson(trackId){const ls=trackLessons.get(trackId)||[];return ls.find(l=>(l.number||'').trim())||ls[0]}

  return { blockMap, tableMap, figureByBlock, sectionMap, GLOSSARIO, siglasDaAula,
    sectionById, lessons, lessonMap, trackLessons, sectionText, INDICE, firstLesson };
}
