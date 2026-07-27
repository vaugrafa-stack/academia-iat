// Componentes de painel do aluno.
//
// Saiu de main.jsx o que nao toca o dado derivado do POP. Depois da
// etapa 1, esse dado vem de criarDerivados e nao mais do escopo do
// modulo, entao a proxima leva de telas ja podera receber o que precisa
// por propriedade em vez de herdar do arquivo.
import React, { useState } from 'react';
import { Activity, Check, Circle, CircleHelp, Download, Eye, Mail, MessageSquareText, Moon, Sun, UserCheck } from 'lucide-react';
import { tracks } from './courseData';
import { PageHeader } from './ui.jsx';

const JUIZOS=[['sim','Tratei e sustentei'],['parcial','Mencionei sem sustentar'],['nao','Não tratei']];

export function ThemeToggle(){const[t,setT]=useState(()=>(typeof document!=='undefined'&&document.documentElement.dataset.theme)||'dark');const toggle=()=>{const nx=t==='light'?'dark':'light';document.documentElement.dataset.theme=nx;try{localStorage.setItem('academia-iat-theme',nx)}catch{}setT(nx)};// O icone sozinho nao diz o que faz para quem nao esta acostumado com a
 // convencao de sol e lua. O rotulo acompanha, e some so no celular, onde a
 // barra do topo nao tem espaco: la o title e o aria-label seguem valendo.
 return <button className="theme-toggle" onClick={toggle} title={t==='light'?'Mudar para o modo escuro':'Mudar para o modo claro'} aria-label={t==='light'?'Mudar para o modo escuro':'Mudar para o modo claro'}>{t==='light'?<Moon size={18}/>:<Sun size={18}/>}<span>{t==='light'?'Modo Escuro':'Modo Claro'}</span></button>}

export function Suporte(){return <div className="page suporte-page"><PageHeader icon={CircleHelp} kicker="Fale com quem mantém a plataforma" title="Suporte" subtitle="Dúvidas, sugestões de conteúdo ou correções: escreva diretamente ao responsável."/>
 <section className="suporte-card"><div className="sup-avatar">RV</div><div className="sup-info"><h2>Rafael Valgrande Augusto</h2><p className="sup-cargo">Engenheiro Sanitarista e Ambiental</p><a className="sup-mail" href="mailto:bol.rafaelaugusto@iat.pr.gov.br?subject=Academia%20IAT%3A%20d%C3%BAvida%20ou%20sugest%C3%A3o"><MessageSquareText size={16}/> bol.rafaelaugusto@iat.pr.gov.br</a><p className="sup-note">Ao escrever, diga em qual módulo, aula ou tela está a dúvida ou a sugestão: isso acelera a resposta e a correção.</p></div></section>
 <section className="suporte-tipos">{[['Dúvida de conteúdo','Algo no material parece incompleto, confuso ou desatualizado.'],['Sugestão','Ideia de melhoria, novo exercício ou tema a aprofundar.'],['Problema técnico','Algo não abre, não salva ou não funciona como deveria.']].map(([t,d])=><article key={t}><strong>{t}</strong><p>{d}</p></article>)}</section></div>}

export function ComparaDiagnostico({d}){
 const e=d.entrada,x=d.saida;
 const pct=r=>Math.round(r.acertos/r.total*100);
 const virou=(a,b)=>{const o={};for(const id of Object.keys(a.porQuestao||{})){const A=a.porQuestao[id],B=(b.porQuestao||{})[id];if(!B)continue;if(A.ok!==B.ok)o[A.track]=B.ok?'ganhou':'perdeu'}return o};
 const mudou=x?virou(e,x):{};
 const ganhos=Object.entries(mudou).filter(([,v])=>v==='ganhou').map(([t])=>t);
 const perdas=Object.entries(mudou).filter(([,v])=>v==='perdeu').map(([t])=>t);
 const nome=id=>tracks.find(t=>t.id===id)?.code||id;
 return <section className="diag-compara">
  <header><Activity size={16}/><h2>Ponto de partida e ponto de chegada</h2></header>
  <div className="dc-barras">
   <div><small>Entrada</small><strong>{e.acertos}/{e.total}</strong><i><em style={{width:`${pct(e)}%`}}/></i>
    <span>{new Date(e.data).toLocaleDateString('pt-BR')} · {e.leitura}% do conteúdo lido</span></div>
   {x?<div><small>Saída</small><strong>{x.acertos}/{x.total}</strong><i><em className="saida" style={{width:`${pct(x)}%`}}/></i>
    <span>{new Date(x.data).toLocaleDateString('pt-BR')} · {x.leitura}% do conteúdo lido</span></div>
   :<div className="dc-pendente"><small>Saída</small><p>Refaça o diagnóstico depois de estudar para medir o que mudou.</p></div>}
  </div>
  {x&&<p className="dc-saldo">{x.acertos>e.acertos?`Ganho de ${x.acertos-e.acertos} ${x.acertos-e.acertos===1?'questão':'questões'} entre os dois diagnósticos.`:x.acertos===e.acertos?'Mesmo número de acertos nos dois diagnósticos.':`Queda de ${e.acertos-x.acertos} ${e.acertos-x.acertos===1?'questão':'questões'}: vale rever o que mudou.`}</p>}
  {x&&(ganhos.length>0||perdas.length>0)&&<div className="dc-modulos">
   {ganhos.length>0&&<p><b className="ok">Passou a acertar</b> {ganhos.map(nome).join(', ')}</p>}
   {perdas.length>0&&<p><b className="nao">Deixou de acertar</b> {perdas.map(nome).join(', ')}</p>}
  </div>}
  <small className="dc-limite">Uma questão por módulo mede direção, não magnitude: por módulo o resultado é acertou ou não acertou. O total é o número comparável.</small>
 </section>
}

export function AutoAvaliacao({caso,texto,conf,state,setState}){
 const salvo=(state.autoaval&&state.autoaval[caso.id])||{};
 const marcar=(rot,v)=>setState(st=>({...st,autoaval:{...(st.autoaval||{}),[caso.id]:{...((st.autoaval||{})[caso.id]||{}),[rot]:v}}}));
 const marcados=caso.elementos.filter(e=>salvo[e.rot]).length;
 const sustentados=caso.elementos.filter(e=>salvo[e.rot]==='sim').length;
 const completo=marcados===caso.elementos.length;
 const divergem=caso.elementos.filter(e=>{const j=salvo[e.rot];const citou=conf.els.find(x=>x.rot===e.rot)?.ok;return j==='sim'&&!citou});
 const baixar=()=>{
  const linhas=['AUTOAVALIAÇÃO DA FUNDAMENTAÇÃO · EXERCÍCIO DIDÁTICO','',
   'Caso: '+caso.title,'Decisões: veja o debriefing na plataforma','',
   'TEXTO ESCRITO','',texto||'[vazio]','','JULGAMENTO DE QUEM ESCREVEU',''];
  for(const e of caso.elementos){const j=salvo[e.rot];
   linhas.push('- '+e.rot+': '+(JUIZOS.find(x=>x[0]===j)?.[1]||'não avaliado'))}
  linhas.push('','REDAÇÃO MODELO','',caso.modelo,'',
   'Documento de treinamento. Não é peça processual e não representa manifestação do IAT.');
  const b=new Blob([linhas.join('\n')],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);
  a.download='autoavaliacao-'+caso.id+'.txt';a.click();URL.revokeObjectURL(a.href)};
 return <div className="auto-aval">
  <strong><Eye size={15}/> Agora julgue você: comparando com o modelo, o que o seu texto fez em cada elemento?</strong>
  <ul>{caso.elementos.map(e=><li key={e.rot}>
   <span>{e.rot}</span>
   <div role="group" aria-label={'Julgamento para '+e.rot}>
    {JUIZOS.map(([v,rot])=><button key={v} className={salvo[e.rot]===v?'sel '+v:''} onClick={()=>marcar(e.rot,v)} aria-pressed={salvo[e.rot]===v}>{rot}</button>)}
   </div></li>)}</ul>
  {completo&&<p className="aa-saldo">Você sustentou {sustentados} de {caso.elementos.length} elementos.
   {divergem.length>0&&' Em '+divergem.length+(divergem.length===1?' elemento':' elementos')+' você marcou que sustentou, mas a conferência de termos não encontrou o vocabulário esperado: vale reler se o argumento está mesmo explícito no texto.'}</p>}
  {completo&&<button className="aa-exportar" onClick={baixar}><Download size={14}/> Baixar para avaliação de quem orienta</button>}
  {!completo&&<small className="aa-falta">Marque os {caso.elementos.length-marcados} restantes para fechar a autoavaliação.</small>}
 </div>
}

