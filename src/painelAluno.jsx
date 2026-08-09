// Componentes de painel do aluno.
//
// Saiu de main.jsx o que nao toca o dado derivado do POP. Depois da
// etapa 1, esse dado vem de criarDerivados e nao mais do escopo do
// modulo, entao a proxima leva de telas ja podera receber o que precisa
// por propriedade em vez de herdar do arquivo.
import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronDown,
  Circle,
  CircleHelp,
  Copy,
  Download,
  Eye,
  FileDown,
  Map,
  MessageSquareText,
  Moon,
  RefreshCw,
  Sun,
  UserCheck,
  Video,
  WifiOff,
} from 'lucide-react';
import { version as PLATFORM_VERSION } from '../package.json';
import { tracks } from './courseData';
import { PageHeader } from './ui.jsx';

const JUIZOS=[['sim','Tratei e sustentei'],['parcial','Mencionei sem sustentar'],['nao','Não tratei']];

export function ThemeToggle(){const[t,setT]=useState(()=>(typeof document!=='undefined'&&document.documentElement.dataset.theme)||'dark');const toggle=()=>{const nx=t==='light'?'dark':'light';document.documentElement.dataset.theme=nx;try{localStorage.setItem('academia-iat-theme',nx)}catch{}setT(nx)};// O icone sozinho nao diz o que faz para quem nao esta acostumado com a
 // convencao de sol e lua. O rotulo acompanha, e some so no celular, onde a
 // barra do topo nao tem espaco: la o title e o aria-label seguem valendo.
 return <button className="theme-toggle" onClick={toggle} title={t==='light'?'Mudar para o modo escuro':'Mudar para o modo claro'} aria-label={t==='light'?'Mudar para o modo escuro':'Mudar para o modo claro'}>{t==='light'?<Moon size={18}/>:<Sun size={18}/>}<span>{t==='light'?'Modo Escuro':'Modo Claro'}</span></button>}

export const SUPPORT_EMAIL = 'bol.rafaelaugusto@iat.pr.gov.br';

const BUILD_STAMP =
  typeof __BUILD_STAMP__ !== 'undefined' ? __BUILD_STAMP__ : 'local';

const SUPPORT_AREAS = [
  'Início',
  'Formação',
  'Hidrelétricas',
  'Laboratório',
  'Redigir uma IT',
  'Avaliações',
  'Fluxogramas',
  'Mapa do Paraná',
  'Biblioteca',
  'Meu progresso neste dispositivo',
  'Central de Suporte',
];

const SUPPORT_FAQS = [
  {
    id: 'acesso',
    icon: RefreshCw,
    title: 'Acesso e carregamento',
    summary: 'A página não abriu, ficou incompleta ou parece desatualizada.',
    steps: [
      'Confirme se o endereço termina em /academia-iat/#/ e recarregue a página uma vez.',
      'Se a tela continuar incompleta, feche somente esta aba e abra a plataforma novamente.',
      'Antes de limpar dados do navegador, exporte um backup do progresso. Limpar os dados do site pode apagar registros locais.',
    ],
  },
  {
    id: 'videos',
    icon: Video,
    title: 'Reprodução de vídeos',
    summary: 'O vídeo não iniciou, travou ou ficou sem legenda.',
    steps: [
      'Verifique a conexão e pressione reproduzir novamente; vídeos ainda não baixados dependem da internet.',
      'Abra os controles do vídeo para ativar a legenda e ajustar o volume.',
      'Se apenas uma aula falhar, informe o código do módulo e o título da aula no pedido de suporte.',
    ],
  },
  {
    id: 'progresso',
    icon: FileDown,
    title: 'Progresso neste dispositivo',
    summary: 'O progresso não apareceu ou precisa ser levado para outro navegador.',
    steps: [
      'O progresso fica guardado neste navegador e neste dispositivo; ele não é sincronizado por uma conta on-line.',
      'Abra “Meu progresso neste dispositivo” e exporte o backup antes de trocar de navegador, formatar o aparelho ou limpar dados.',
      'No outro dispositivo, use a opção de importar e confira o resumo antes de confirmar a restauração.',
    ],
    link: { href: '#/perfil', label: 'Abrir meu progresso' },
  },
  {
    id: 'offline',
    icon: WifiOff,
    title: 'Instalação e uso offline',
    summary: 'Como instalar e o que continua disponível sem conexão.',
    steps: [
      'Depois do primeiro acesso on-line, use a opção “Instalar aplicativo” do navegador, quando ela estiver disponível.',
      'O núcleo textual e as páginas já carregadas permanecem acessíveis offline. Mídias não baixadas e serviços de mapa on-line podem não abrir.',
      'Ao recuperar a conexão, reabra a plataforma para receber a versão publicada mais recente.',
    ],
  },
  {
    id: 'mapa',
    icon: Map,
    title: 'Mapa e camada de satélite',
    summary: 'A base de satélite não apareceu ou o mapa ficou sem detalhes.',
    steps: [
      'A camada de satélite é fornecida por um serviço externo e exige conexão ativa.',
      'Confirme que o navegador não está em modo offline e tente alternar a camada de base do mapa.',
      'Se os pontos das usinas aparecerem, mas a imagem de satélite não, registre o horário e o navegador usados no pedido de suporte.',
    ],
    link: { href: '#/mapa', label: 'Abrir o mapa' },
  },
  {
    id: 'backup',
    icon: Download,
    title: 'Exportação e importação de backup',
    summary: 'Como proteger ou recuperar os registros locais.',
    steps: [
      'Exporte o arquivo pela página de progresso e guarde-o em local controlado.',
      'Para restaurar, selecione o arquivo na mesma página e confira versão, data e quantidade de registros.',
      'Não envie o arquivo de backup por e-mail: ele pode conter respostas, notas e rascunhos salvos neste dispositivo.',
    ],
    link: { href: '#/perfil', label: 'Gerenciar backup' },
  },
  {
    id: 'versao',
    icon: CircleHelp,
    title: 'Versão e diagnóstico técnico',
    summary: 'Como identificar a versão publicada e reunir dados seguros para o suporte.',
    steps: [
      'A versão e o identificador do build aparecem no diagnóstico abaixo.',
      'O diagnóstico contém somente informações técnicas do navegador, da rota e da conectividade.',
      'Copie o diagnóstico e envie junto da descrição do que era esperado e do que ocorreu.',
    ],
  },
];

function safeSingleLine(value, fallback, limit = 300) {
  const normalized = String(value ?? '').replace(/\s+/gu, ' ').trim();
  return (normalized || fallback).slice(0, limit);
}

function currentRoute() {
  if (typeof window === 'undefined') return '#/suporte';
  return safeSingleLine(window.location.hash, '#/suporte', 180);
}

function currentUserAgent() {
  if (typeof navigator === 'undefined') return 'não informado';
  return safeSingleLine(navigator.userAgent, 'não informado');
}

function currentOnlineState() {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function buildSupportDiagnostic({
  version = PLATFORM_VERSION,
  build = BUILD_STAMP,
  route = currentRoute(),
  userAgent = currentUserAgent(),
  online = currentOnlineState(),
} = {}) {
  return [
    'Diagnóstico técnico — Academia IAT',
    `Versão da plataforma: ${safeSingleLine(version, 'não informada', 40)}`,
    `Build: ${safeSingleLine(build, 'não informado', 80)}`,
    `Página: ${safeSingleLine(route, '#/suporte', 180)}`,
    `Conectividade: ${online ? 'online' : 'offline'}`,
    `Navegador: ${safeSingleLine(userAgent, 'não informado')}`,
  ].join('\n');
}

export function buildSupportMailto({
  area = 'Central de Suporte',
  page = '#/suporte',
  expected = '',
  found = '',
  version = PLATFORM_VERSION,
  build = BUILD_STAMP,
  route = currentRoute(),
  userAgent = currentUserAgent(),
  online = currentOnlineState(),
} = {}) {
  const safeArea = safeSingleLine(area, 'Central de Suporte', 80);
  const safePage = safeSingleLine(page, route, 180);
  const safeVersion = safeSingleLine(version, 'não informada', 40);
  const safeBuild = safeSingleLine(build, 'não informado', 80);
  const diagnostic = buildSupportDiagnostic({
    version: safeVersion,
    build: safeBuild,
    route,
    userAgent,
    online,
  });
  const subject = `Academia IAT | Suporte | v${safeVersion} | build ${safeBuild} | ${safeArea}`;
  const body = [
    `Área da plataforma: ${safeArea}`,
    `Página ou aula: ${safePage}`,
    '',
    `Comportamento esperado: ${safeSingleLine(expected, '[descreva sem incluir dados pessoais]', 1200)}`,
    `Comportamento encontrado: ${safeSingleLine(found, '[descreva sem incluir dados pessoais]', 1200)}`,
    '',
    diagnostic,
    '',
    'Não inclua processos reais, documentos restritos, dados pessoais, respostas, notas ou rascunhos.',
  ].join('\n');
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function Suporte({ online: onlineFromApp } = {}) {
  const [area, setArea] = useState('Central de Suporte');
  const [page, setPage] = useState(currentRoute);
  const [expected, setExpected] = useState('');
  const [found, setFound] = useState('');
  const [browserOnline, setBrowserOnline] = useState(currentOnlineState);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    const updateConnection = () => setBrowserOnline(navigator.onLine);
    window.addEventListener('online', updateConnection);
    window.addEventListener('offline', updateConnection);
    return () => {
      window.removeEventListener('online', updateConnection);
      window.removeEventListener('offline', updateConnection);
    };
  }, []);

  const online = typeof onlineFromApp === 'boolean'
    ? onlineFromApp
    : browserOnline;

  const route = currentRoute();
  const userAgent = currentUserAgent();
  const diagnostic = buildSupportDiagnostic({ route, userAgent, online });
  const mailto = buildSupportMailto({
    area,
    page,
    expected,
    found,
    route,
    userAgent,
    online,
  });

  const copyDiagnostic = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(diagnostic);
      setCopyStatus('Diagnóstico copiado.');
    } catch {
      setCopyStatus('Não foi possível copiar automaticamente. Selecione o texto abaixo e copie.');
    }
  };

  return <div className="page suporte-page">
    <PageHeader
      icon={CircleHelp}
      kicker="Ajuda dentro da plataforma"
      title="Central de Suporte"
      subtitle="Encontre orientações para os problemas mais comuns e prepare um pedido de suporte com diagnóstico seguro."
    />

    <section className="suporte-card" aria-labelledby="support-intro-title">
      <div className="sup-avatar" aria-hidden="true"><CircleHelp size={36}/></div>
      <div className="sup-info">
        <h2 id="support-intro-title">Ajuda para usar a Academia IAT</h2>
        <p className="sup-cargo">A central funciona mesmo sem conexão; somente o envio do e-mail depende do aplicativo de correio.</p>
        <p className="sup-note">Comece pelas orientações abaixo. Se o problema continuar, descreva a página, o comportamento esperado e o que ocorreu.</p>
      </div>
    </section>

    <section className="support-warning" aria-labelledby="support-privacy-title">
      <AlertTriangle aria-hidden="true" size={22}/>
      <div>
        <h2 id="support-privacy-title">Proteja as informações de trabalho</h2>
        <p>Não envie processos reais, documentos restritos, dados pessoais, respostas, notas, rascunhos ou arquivos de backup. Use somente exemplos genéricos para explicar o problema.</p>
      </div>
    </section>

    <section className="support-faq" aria-labelledby="support-faq-title">
      <div className="support-section-heading">
        <small>RESOLUÇÃO RÁPIDA</small>
        <h2 id="support-faq-title">Dúvidas frequentes</h2>
        <p>Abra somente o assunto que corresponde ao que você precisa resolver.</p>
      </div>
      <div className="support-faq-list">
        {SUPPORT_FAQS.map(({ id, icon: Icon, title, summary, steps, link }) =>
          <details className="support-faq-item" key={id}>
            <summary>
              <span className="support-faq-icon" aria-hidden="true"><Icon size={20}/></span>
              <span className="support-faq-label"><strong>{title}</strong><small>{summary}</small></span>
              <ChevronDown className="support-faq-chevron" aria-hidden="true" size={20}/>
            </summary>
            <div className="support-faq-answer">
              <ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol>
              {link ? <a href={link.href}>{link.label}</a> : null}
            </div>
          </details>
        )}
      </div>
    </section>

    <section className="support-diagnostic" aria-labelledby="support-diagnostic-title">
      <div className="support-section-heading">
        <small>VERSÃO PUBLICADA</small>
        <h2 id="support-diagnostic-title">Diagnóstico técnico seguro</h2>
        <p>Este texto não consulta seu nome, progresso, notas, respostas, rascunhos, documentos ou dados de processo.</p>
      </div>
      <textarea
        className="support-diagnostic-text"
        aria-label="Diagnóstico técnico"
        readOnly
        rows={7}
        value={diagnostic}
      />
      <div className="support-copy-row">
        <button type="button" className="support-copy" onClick={copyDiagnostic}>
          <Copy size={16}/> Copiar diagnóstico
        </button>
        <span role="status" aria-live="polite">{copyStatus}</span>
      </div>
    </section>

    <section className="support-contact" aria-labelledby="support-contact-title">
      <div className="support-section-heading">
        <small>CONTATO OFICIAL</small>
        <h2 id="support-contact-title">Ainda precisa de ajuda?</h2>
        <p>Preencha apenas informações genéricas. O botão abrirá o aplicativo de e-mail já com a versão e o diagnóstico técnico.</p>
      </div>
      <div className="support-form-grid">
        <label>
          <span>Área da plataforma</span>
          <select value={area} onChange={(event) => setArea(event.target.value)}>
            {SUPPORT_AREAS.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label>
          <span>Página ou aula</span>
          <input
            value={page}
            onChange={(event) => setPage(event.target.value)}
            placeholder="Ex.: M08 › conteúdo mínimo"
            maxLength={180}
          />
        </label>
        <label className="support-form-wide">
          <span>O que deveria acontecer?</span>
          <textarea
            value={expected}
            onChange={(event) => setExpected(event.target.value)}
            placeholder="Descreva o comportamento esperado, sem dados pessoais ou de processos."
            rows={3}
            maxLength={1200}
          />
        </label>
        <label className="support-form-wide">
          <span>O que aconteceu?</span>
          <textarea
            value={found}
            onChange={(event) => setFound(event.target.value)}
            placeholder="Descreva o problema e, se souber, como reproduzi-lo."
            rows={3}
            maxLength={1200}
          />
        </label>
      </div>
      <div className="support-contact-actions">
        <a className="sup-mail" href={mailto}>
          <MessageSquareText size={17}/> Enviar e-mail para o suporte
        </a>
        <p><strong>{SUPPORT_EMAIL}</strong><br/>O envio abre fora da plataforma. Se estiver offline, copie o diagnóstico e envie quando a conexão voltar.</p>
      </div>
    </section>
  </div>;
}

export function ComparaDiagnostico({d}){
 const e=d.entrada,x=d.saida;
 const amostra=e.amostraPorModulo||3;
 const pct=r=>Math.round(r.acertos/r.total*100);
 // Agrega por modulo apenas para descrever os dois resultados observados. As
 // perguntas sao as mesmas nas duas aplicacoes, mas isto nao transforma a
 // variacao em evidencia causal de aprendizagem.
 const porModulo=(r)=>{const m={};for(const id of Object.keys(r.porQuestao||{})){
   const q=r.porQuestao[id];const a=m[q.track]||(m[q.track]={ok:0,n:0});a.n++;if(q.ok)a.ok++}
  return m};
 const antes=porModulo(e),depois=x?porModulo(x):null;
 const deltas=depois?Object.keys(antes).filter(t=>depois[t]).map(t=>({
   t,de:antes[t].ok,para:depois[t].ok,n:antes[t].n,d:depois[t].ok-antes[t].ok
  })).sort((a,b)=>b.d-a.d):[];
 const ganhos=deltas.filter(z=>z.d>0);
 const perdas=deltas.filter(z=>z.d<0);
 const estaveis=deltas.filter(z=>z.d===0);
 const nome=id=>tracks.find(t=>t.id===id)?.code||id;
 return <section className="diag-compara">
  <header><Activity size={16}/><h2>Duas aplicações dos mesmos itens-âncora</h2></header>
  <div className="dc-barras">
   <div><small>Primeira aplicação</small><strong>{e.acertos}/{e.total}</strong><i><em style={{width:`${pct(e)}%`}}/></i>
    <span>{new Date(e.data).toLocaleDateString('pt-BR')} · {e.leitura}% do conteúdo lido</span></div>
   {x?<div><small>Reaplicação</small><strong>{x.acertos}/{x.total}</strong><i><em className="saida" style={{width:`${pct(x)}%`}}/></i>
    <span>{new Date(x.data).toLocaleDateString('pt-BR')} · {x.leitura}% do conteúdo lido</span></div>
   :<div className="dc-pendente"><small>Reaplicação</small><p>Responda novamente depois de estudar para obter outra amostra do seu desempenho.</p></div>}
  </div>
  {x&&<p className="dc-saldo">{x.acertos>e.acertos?`Variação observada: ${x.acertos-e.acertos} ${x.acertos-e.acertos===1?'acerto a mais':'acertos a mais'} na reaplicação.`:x.acertos===e.acertos?'Variação observada: mesma quantidade de acertos nas duas aplicações.':`Variação observada: ${e.acertos-x.acertos} ${e.acertos-x.acertos===1?'acerto a menos':'acertos a menos'} na reaplicação.`}</p>}
  {x&&deltas.length>0&&<div className="dc-modulos">
   {ganhos.length>0&&<p><b className="ok">Mais acertos</b> {ganhos.map(z=>nome(z.t)+' '+z.de+'\u2192'+z.para+' de '+z.n).join(' \u00b7 ')}</p>}
   {perdas.length>0&&<p><b className="nao">Menos acertos</b> {perdas.map(z=>nome(z.t)+' '+z.de+'\u2192'+z.para+' de '+z.n).join(' \u00b7 ')}</p>}
   {estaveis.length>0&&<p><b>Mesmo resultado</b> {estaveis.map(z=>nome(z.t)+' '+z.de+'\u2192'+z.para+' de '+z.n).join(' \u00b7 ')}</p>}
  </div>}
  <small className="dc-limite">A amostra usa {amostra} {amostra===1?'item-âncora':'itens-âncora'} por módulo: as perguntas se repetem, enquanto ordem e alternativas são embaralhadas. A variação é apenas descritiva e pode refletir familiaridade com os itens; não é medida validada, prova de aprendizagem causal nem demonstração de competência.</small>
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

