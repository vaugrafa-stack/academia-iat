// Turbinas (esquema + foto real), casos reais do Parana e esquemas de arranjo.
// Fatos verificados na web em 2026-07-22; fotos: Wikimedia Commons (hotlink com credito).
import React, { useState } from 'react';
import { Mountain, Droplets, ExternalLink, MapPin, Zap, Factory, Waves, Info, Camera } from 'lucide-react';

// Fotos baixadas do Wikimedia Commons (licenca livre) e servidas localmente;
// o credito com link para a pagina do arquivo (e sua licenca) fica na legenda.
const BASE = ((import.meta.env.BASE_URL || '/').replace(/\/$/, ''));
const LOCAL_FOTO = {
  'Peltonturbine-1.jpg': BASE + '/hidro/turbina-pelton.jpg',
  'Francis_Turbine_complete.jpg': BASE + '/hidro/turbina-francis.jpg',
  'Kaplan_turbine_bonneville.jpg': BASE + '/hidro/turbina-kaplan.jpg',
};
const WM = (f) => LOCAL_FOTO[f];
const WMPAGE = (f) => `https://commons.wikimedia.org/wiki/File:${f}`;

/* ============ ESQUEMAS DE TURBINA (SVG detalhados) ============ */
function SvgPelton() {
  const conchas = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina Pelton">
      <circle cx="150" cy="110" r="66" fill="none" stroke="#3fe0a6" strokeWidth="3" />
      <circle cx="150" cy="110" r="12" fill="#3fe0a6" />
      <g className="spin-slow">
        {conchas.map((a) => (
          <g key={a} transform={`rotate(${a} 150 110)`}>
            <path d="M150 36 q-10 -12 -2 -20 q10 6 12 16 q-4 6 -10 4" fill="#37d39a" stroke="#2fa07a" strokeWidth="1.4" />
          </g>
        ))}
      </g>
      <rect x="10" y="98" width="66" height="14" rx="7" fill="#93a7af" />
      <path d="M76 105 L118 105" stroke="#34a9e1" strokeWidth="8" strokeLinecap="round" className="jet-anim" strokeDasharray="8 10" />
      <polygon points="70,96 92,105 70,114" fill="#93a7af" />
      <text x="14" y="88" fontSize="11" fill="#bcd0c7" fontWeight="700">bocal / injetor</text>
      <text x="196" y="40" fontSize="11" fill="#bcd0c7" fontWeight="700">conchas (dupla colher)</text>
      <text x="98" y="205" fontSize="11" fill="#93aaa1">jato em pressão atmosférica → turbina de AÇÃO</text>
    </svg>
  );
}
function SvgFrancis() {
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina Francis">
      <path d="M150 110 m66 0 a66 66 0 1 1 -18 -46" fill="none" stroke="#4cc4f5" strokeWidth="16" strokeLinecap="round" opacity=".85" />
      <text x="212" y="52" fontSize="11" fill="#bcd0c7" fontWeight="700">caixa espiral</text>
      {Array.from({ length: 10 }, (_, i) => i * 36).map((a) => (
        <g key={a} transform={`rotate(${a} 150 110)`}>
          <rect x="146" y="58" width="7" height="16" rx="3" fill="#37d39a" transform="rotate(24 150 66)" />
        </g>
      ))}
      <g className="spin-slow">
        {Array.from({ length: 9 }, (_, i) => i * 40).map((a) => (
          <g key={a} transform={`rotate(${a} 150 110)`}>
            <path d="M150 78 q16 14 6 30 l-8 -4 q6 -12 -4 -22 Z" fill="#3fe0a6" />
          </g>
        ))}
        <circle cx="150" cy="110" r="14" fill="#2fa07a" />
      </g>
      <text x="52" y="52" fontSize="11" fill="#bcd0c7" fontWeight="700">distribuidor (palhetas)</text>
      <rect x="142" y="150" width="16" height="46" fill="#8fd0ff" opacity=".8" />
      <path d="M142 196 q8 12 16 0" fill="#8fd0ff" opacity=".8" />
      <text x="166" y="182" fontSize="11" fill="#bcd0c7" fontWeight="700">tubo de sucção</text>
      <text x="66" y="212" fontSize="11" fill="#93aaa1">fluxo radial→axial sob pressão → turbina de REAÇÃO</text>
    </svg>
  );
}
function SvgKaplan() {
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina Kaplan">
      <path d="M40 40 L120 70 L120 150 L40 180 Z" fill="#bfe3ff" opacity=".7" />
      <text x="42" y="32" fontSize="11" fill="#bcd0c7" fontWeight="700">fluxo axial</text>
      <rect x="120" y="96" width="90" height="28" rx="6" fill="#93a7af" />
      <g className="spin-slow" style={{ transformOrigin: '150px 110px' }}>
        {[0, 90, 180, 270].map((a) => (
          <g key={a} transform={`rotate(${a} 150 110)`}>
            <path d="M150 110 q34 -10 52 -34 q10 18 -6 34 q-22 12 -46 0 Z" fill="#37d39a" stroke="#2fa07a" strokeWidth="1.2" opacity=".92" />
          </g>
        ))}
        <circle cx="150" cy="110" r="16" fill="#2fa07a" />
      </g>
      <path d="M212 96 l20 -12 M212 124 l20 12" stroke="#f3bd4f" strokeWidth="3" />
      <text x="196" y="76" fontSize="11" fill="#bcd0c7" fontWeight="700">pás AJUSTÁVEIS</text>
      <text x="60" y="208" fontSize="11" fill="#93aaa1">hélice de passo variável → rendimento alto com vazão variável</text>
    </svg>
  );
}
function SvgBulbo() {
  return (
    <svg viewBox="0 0 300 220" className="turb-svg" aria-label="Esquema de turbina bulbo">
      <path d="M10 70 L290 70 M10 160 L290 160" stroke="#9fb5aa" strokeWidth="2" />
      <path d="M10 78 L290 78" stroke="#8fd0ff" strokeWidth="10" opacity=".7" className="jet-anim" strokeDasharray="14 16" />
      <ellipse cx="130" cy="118" rx="66" ry="30" fill="#93a7af" />
      <text x="96" y="122" fontSize="12" fill="#8fe3cf" fontWeight="700">GERADOR</text>
      <g className="spin-slow" style={{ transformOrigin: '208px 118px' }}>
        {[0, 120, 240].map((a) => (
          <g key={a} transform={`rotate(${a} 208 118)`}>
            <path d="M208 118 q22 -8 34 -24 q8 14 -4 26 q-16 8 -30 -2 Z" fill="#37d39a" stroke="#2fa07a" strokeWidth="1.2" />
          </g>
        ))}
        <circle cx="208" cy="118" r="10" fill="#2fa07a" />
      </g>
      <text x="60" y="200" fontSize="11" fill="#93aaa1">conjunto horizontal submerso no fluxo, quedas muito baixas</text>
    </svg>
  );
}

export const TURBINES_RICH = [
  { nome: 'Pelton', Svg: SvgPelton, foto: 'Peltonturbine-1.jpg', tipo: 'Ação (impulso)', faixa: 'Quedas altas: acima de ~250 m', usoPR: 'UHE Gov. Parigot de Souza (Antonina): 4 Pelton de 62,5 MW com ~750 m de queda.' },
  { nome: 'Francis', Svg: SvgFrancis, foto: 'Francis_Turbine_complete.jpg', tipo: 'Reação', faixa: 'Quedas médias: ~30 a 400 m', usoPR: 'UHE Foz do Areia (Pinhão): 4 Francis de 419 MW. Também Itaipu (20 unidades).' },
  { nome: 'Kaplan', Svg: SvgKaplan, foto: 'Kaplan_turbine_bonneville.jpg', tipo: 'Reação (pás ajustáveis)', faixa: 'Quedas baixas: ~10 a 70 m', usoPR: 'UHE Baixo Iguaçu (Capanema): 3 Kaplan de ~117 MW, a fio d\'água.' },
  { nome: 'Bulbo', Svg: SvgBulbo, foto: null, tipo: 'Reação (horizontal)', faixa: 'Quedas muito baixas: abaixo de ~15 m', usoPR: 'Sem unidade em operação no PR; no Brasil é típica das UHEs do rio Madeira (RO).' },
];

export function TurbineGallery() {
  const [i, setI] = useState(0);
  const t = TURBINES_RICH[i];
  return (
    <div className="turb-gallery">
      <div className="tg-tabs">{TURBINES_RICH.map((x, k) => (
        <button key={x.nome} className={k === i ? 'active' : ''} onClick={() => setI(k)}>{x.nome}</button>
      ))}</div>
      <div className="tg-body">
        <figure className="tg-schema"><t.Svg /><figcaption>Esquema de funcionamento: {t.nome} ({t.tipo.toLowerCase()})</figcaption></figure>
        {t.foto ? (
          <figure className="tg-photo">
            <img src={WM(t.foto)} alt={`Foto real de turbina ${t.nome}`} />
            <figcaption><Camera size={13} /> Foto real · <a href={WMPAGE(t.foto)} target="_blank" rel="noreferrer">Wikimedia Commons</a> (licença livre)</figcaption>
          </figure>
        ) : (
          <div className="tg-nophoto"><Info /><p>Sem foto de licença livre confirmada para bulbo: o esquema ao lado mostra o conjunto gerador submerso no próprio fluxo.</p></div>
        )}
        <div className="tg-info">
          <h3>Turbina {t.nome}</h3>
          <p><strong>{t.tipo}</strong> · {t.faixa}</p>
          <p className="tg-pr"><MapPin size={14} /> <strong>No Paraná:</strong> {t.usoPR}</p>
        </div>
      </div>
    </div>
  );
}

/* ============ REVERSÍVEL: esquema animado (não há caso no PR) ============ */
function SvgReversivel() {
  return (
    <svg viewBox="0 0 460 250" className="arr-svg" aria-label="Esquema de usina reversível (bombeamento)">
      <rect width="460" height="250" fill="#1a2620" />
      <path d="M40 60 L200 60 L200 44 L40 44 Z" fill="#bfe3ff" stroke="#7db8e8" />
      <text x="46" y="36" fontSize="12" fontWeight="800" fill="#4cc4f5">reservatório SUPERIOR</text>
      <path d="M260 210 L440 210 L440 192 L260 192 Z" fill="#bfe3ff" stroke="#7db8e8" />
      <text x="300" y="238" fontSize="12" fontWeight="800" fill="#4cc4f5">reservatório INFERIOR</text>
      <path d="M198 58 C 240 90, 250 150, 268 198" stroke="#93a7af" strokeWidth="12" fill="none" strokeLinecap="round" />
      <path className="jet-anim" d="M198 58 C 240 90, 250 150, 268 198" stroke="#57d8bf" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="10 12" />
      <circle cx="252" cy="150" r="20" fill="#2fa07a" />
      <path d="M252 138 l6 8 h-4 v8 h-4 v-8 h-4 Z" fill="#f3bd4f" />
      <text x="280" y="146" fontSize="12" fontWeight="700" fill="#bcd0c7">bomba-turbina</text>
      <text x="280" y="161" fontSize="12" fontWeight="700" fill="#bcd0c7">reversível</text>
      <g>
        <path d="M120 96 l0 34" stroke="#37d39a" strokeWidth="4" markerEnd="url(#seta1)" />
        <text x="130" y="112" fontSize="11.5" fill="#37d39a" fontWeight="800">GERA na ponta (desce)</text>
        <path d="M96 176 l0 -34" stroke="#e5a000" strokeWidth="4" />
        <text x="106" y="168" fontSize="11.5" fill="#f4c05a" fontWeight="800">BOMBEIA fora de ponta (sobe)</text>
      </g>
      <text x="40" y="248" fontSize="11" fill="#93aaa1">funciona como bateria: consome energia barata para estocar água e gerar na hora cara</text>
    </svg>
  );
}

/* ============ CASOS REAIS NO PARANÁ (verificados) ============ */
export const PR_CASES = [
  { tipo: 'UHE de acumulação', criterio: 'Acima de 30 MW · concessão (leilão) · em regra EIA/RIMA · reservatório de regularização',
    nome: 'UHE Gov. Bento Munhoz da Rocha Netto (Foz do Areia)', local: 'Rio Iguaçu, Pinhão-PR', dados: '1.676 MW · 4 turbinas Francis de 419 MW · barragem de 160 m · reservatório de ~165 km² · opera desde 1980 · maior usina da Copel',
    site: 'https://www.copel.com/site/copel-geracao/usinas/usina-governador-bento-munhoz-da-rocha-netto/', siteLabel: 'copel.com (página oficial da usina)' },
  { tipo: 'UHE a fio d\'água', criterio: 'Acima de 30 MW · sem reservatório de regularização · gera conforme a vazão do rio',
    nome: 'UHE Baixo Iguaçu', local: 'Rio Iguaçu, Capanema / Capitão Leônidas Marques-PR', dados: '350 MW · 3 turbinas Kaplan (~117 MW cada) · concluída em 2019 · vizinha do Parque Nacional do Iguaçu',
    site: 'https://baixoiguacu.com.br/', siteLabel: 'baixoiguacu.com.br (site oficial, com dados técnicos)' },
  { tipo: 'UHE de queda alta (derivação)', criterio: 'Circuito longo de adução por túnel · queda elevada · turbinas Pelton',
    nome: 'UHE Gov. Pedro Viriato Parigot de Souza (Capivari-Cachoeira)', local: 'Antonina-PR (capta no rio Capivari e restitui no Cachoeira)', dados: '260 MW · 4 turbinas Pelton de 62,5 MW · ~750 m de queda, a maior do sul do país · mais de 50 anos de operação',
    site: 'https://www.copel.com/site/copel-geracao/usinas/usina-parigot-de-souza/', siteLabel: 'copel.com (página oficial da usina)' },
  { tipo: 'PCH, Pequena Central Hidrelétrica', criterio: 'Acima de 5 até 30 MW · reservatório em regra até 13 km² · autorização ANEEL',
    nome: 'PCH Bela Vista', local: 'Rio Chopim, Verê / São João-PR', dados: '29,81 MW · inaugurada em outubro de 2021 (unidades em jun/jul/ago) · investimento de R$ 224 milhões da Copel',
    site: 'https://pchbelavista.com.br/', siteLabel: 'pchbelavista.com.br (site oficial)' },
  { tipo: 'CGH, Central Geradora Hidrelétrica', criterio: 'Até 5 MW · registro/comunicação à ANEEL · rito proporcional ao porte',
    nome: 'CGH São Francisco de Sales', local: 'Rio São Francisco, Clevelândia-PR (comunidade Palmital)', dados: '0,9 MW · empreendimento privado com barragem de derivação e canal adutor de 317 m · site relata obras iniciadas em 2021; confirme a situação operacional atual no SIGA/ANEEL',
    site: 'https://cghsaofranciscodesales.com.br/', siteLabel: 'cghsaofranciscodesales.com.br (site do empreendimento)' },
  { tipo: 'UHE binacional', criterio: 'Empreendimento de tratado internacional · regime jurídico próprio',
    nome: 'Itaipu Binacional', local: 'Rio Paraná, Foz do Iguaçu-PR (Brasil/Paraguai)', dados: '14.000 MW · 20 unidades geradoras Francis · líder mundial em produção acumulada de energia',
    site: 'https://www.itaipu.gov.br/', siteLabel: 'itaipu.gov.br (site oficial)' },
  { tipo: 'Reversível (bombeamento)', criterio: 'Bombeia água a reservatório superior fora de ponta e turbina na ponta, a "bateria" hídrica', reversivel: true,
    nome: 'Bath County Pumped Storage Station: exemplo fora do Paraná', local: 'Bath County, Virgínia, Estados Unidos', dados: 'Não há usina reversível em operação comercial no Paraná; este é o exemplo internacional de referência: 3.003 MW em 6 unidades reversíveis, a maior do mundo, em operação desde 1985 (Dominion Energy 60% e Allegheny Power 40%).',
    site: 'https://www.dominionenergy.com/en/About/Making-Energy/Hydroelectric-Power-Facilities/Bath-County-Pumped-Storage-Station', siteLabel: 'dominionenergy.com (página da operadora)' },
];

export function PRCasesSection() {
  return (
    <div className="pr-cases">
      <p className="prc-note"><Info size={15} /> Casos reais, com dados públicos verificados nas fontes oficiais indicadas. Os critérios de porte seguem a classificação da ANEEL; o rito de licenciamento aplicável é o do POP e da norma vigente.</p>
      <div className="prc-grid">{PR_CASES.map((c) => (
        <article key={c.nome} className={'prc-card' + (c.site ? '' : ' prc-empty') + (c.reversivel ? ' prc-wide' : '')}>
          <span className="prc-tipo">{c.tipo}</span>
          <h3>{c.nome}</h3>
          <p className="prc-crit"><Factory size={13} /> {c.criterio}</p>
          <p className="prc-local"><MapPin size={13} /> {c.local}</p>
          <p className="prc-dados">{c.dados}</p>
          {c.reversivel && <div className="prc-fotos">
            <figure><SvgReversivel /><figcaption>Esquema: o ciclo diário de geração e bombeamento.</figcaption></figure>
            <figure><img src={BASE + '/hidro/reversivel-bath-county.jpg'} alt="Bath County Pumped Storage Station: casa de força e subestação" /><figcaption><Camera size={13} /> Foto real da usina · <a href={WMPAGE('Bath_County_Pumped_Storage_Station.jpg')} target="_blank" rel="noreferrer">Wikimedia Commons</a> (licença livre)</figcaption></figure>
          </div>}
          {c.site && <a className="prc-site" href={c.site} target="_blank" rel="noreferrer"><ExternalLink size={14} /> {c.siteLabel}</a>}
        </article>
      ))}</div>
    </div>
  );
}

/* ============ COMO SOLICITAR A AUTORIZAÇÃO (trilhas ANEEL x IAT) ============ */
const TRILHA_ANEEL = [
  ['Estudos e definição do aproveitamento', 'Inventário do trecho, partição de quedas e projeto do aproveitamento: potência, queda, vazão e arranjo.'],
  ['Registro na ANEEL', 'Registro do projeto conforme a REN nº 875/2020 (adequabilidade do sumário executivo, DRS) e obtenção do CEG, o código único do empreendimento.'],
  ['Outorga setorial', 'Até 5 MW: registro/comunicação. Acima de 5 MW: autorização da ANEEL (limite ampliado pela legislação setorial vigente). Grandes aproveitamentos: concessão mediante leilão.'],
  ['Conexão à rede', 'Parecer de acesso, projeto da linha/subestação e contratos de conexão e uso do sistema.'],
];
const TRILHA_IAT = [
  ['Consulta Prévia (recomendada)', 'Antes de formalizar: mapa da ADA, arranjo em KML/KMZ e memorial descritivo (art. 36 da IN IAT nº 09/2025). A manifestação orienta modalidade e estudo, vale 24 meses e não aprova viabilidade.'],
  ['Enquadramento', 'Potência, área de alagamento, IDA, supressão e sensibilidade definem a modalidade (DLAM, LAC, LAS ou rito trifásico) e o estudo exigido (RAS/RDPA, PCA ou EIA/RIMA), sempre pelo critério mais restritivo.'],
  ['Protocolo e análise', 'Formalização pelo SGA/eProtocolo com a documentação da fase; o IAT confere suficiência antes do mérito e diligencia lacunas.'],
  ['LP → LI → LO', 'LP atesta viabilidade e concepção; LI autoriza instalar conforme projeto (com autorizações florestais, de fauna e outorga/DRDH); LO verifica o instalado e fixa condicionantes de operação, e o PACUERA quando exigível.'],
  ['Intervenientes', 'IPHAN (patrimônio), gestor de UC afetada e demais órgãos manifestam-se no processo; o IAT verifica compatibilidade sem substituir a decisão de cada um.'],
];
const PAPEIS = [
  ['Empreendedor', 'Decide investir, contrata estudos, protocola nos dois trilhos, mantém titularidade coerente entre ANEEL e IAT, responde exigências e cumpre condicionantes.'],
  ['Consultoria ambiental', 'Elabora memorial e estudos conforme os Termos de Referência, com ARTs; responde complementações técnicas e acompanha vistorias.'],
  ['IAT', 'Analisa, diligencia, licencia e fiscaliza o componente ambiental no Paraná; confere a existência e compatibilidade dos atos externos.'],
  ['ANEEL', 'Registra e outorga o aproveitamento energético, emite o CEG e regula a operação comercial.'],
  ['Órgãos intervenientes', 'IPHAN, gestores de UC e demais órgãos: manifestações específicas na sua competência, que integram o processo sem transferi-la.'],
];
export function LicensingPath({ go }) {
  return (
    <div className="lic-path">
      <p className="prc-note"><Info size={15} /> Roteiro didático baseado no POP e na IN IAT nº 09/2025 (trilha ambiental) e no regime setorial da ANEEL (trilha energética). Os dois trilhos correm em paralelo e precisam conversar: titularidade, arranjo e potência devem coincidir.</p>
      <div className="lic-cols">
        <section className="lic-col lic-aneel"><h3><Zap size={17} /> Trilha setorial · ANEEL</h3><ol>{TRILHA_ANEEL.map(([t, d], i) => <li key={t}><span>{i + 1}</span><div><strong>{t}</strong><p>{d}</p></div></li>)}</ol></section>
        <section className="lic-col lic-iat"><h3><Factory size={17} /> Trilha ambiental · IAT</h3><ol>{TRILHA_IAT.map(([t, d], i) => <li key={t}><span>{i + 1}</span><div><strong>{t}</strong><p>{d}</p></div></li>)}</ol></section>
      </div>
      <h3 className="lic-papeis-h">Quem faz o quê</h3>
      <div className="lic-papeis">{PAPEIS.map(([t, d]) => <article key={t}><strong>{t}</strong><p>{d}</p></article>)}</div>
      <div className="lic-cta"><p>O detalhe de cada fase (documentos, critérios de suficiência e produtos) está nos módulos M03 a M05 da Formação e nas normas da Biblioteca.</p><button className="primary" onClick={() => go('formacao')}>Estudar as fases <ExternalLink size={15} /></button></div>
    </div>
  );
}

/* ============ ESQUEMAS DE ARRANJO (substituem as figuras confusas) ============ */
function ArrPeBarragem() {
  return (
    <svg viewBox="0 0 460 240" className="arr-svg" aria-label="Arranjo pé de barragem">
      <rect width="460" height="240" fill="#1a2620" />
      <path d="M0 150 L180 150 L180 120 L0 120 Z" fill="#bfe3ff" />
      <path d="M180 120 L180 205 L225 205 L212 120 Z" fill="#8a9a93" stroke="#8399a0" strokeWidth="2" />
      <path d="M186 128 L212 200" stroke="#93a7af" strokeWidth="8" strokeLinecap="round" />
      <rect x="214" y="178" width="52" height="30" fill="#fff" stroke="#3fe0a6" strokeWidth="2" />
      <path d="M214 178 L240 164 L266 178 Z" fill="#2fa07a" />
      <rect x="266" y="196" width="194" height="16" fill="#bfe3ff" />
      <text x="10" y="112" fontSize="12" fontWeight="700" fill="#3fe0a6">reservatório</text>
      <text x="164" y="228" fontSize="12" fontWeight="700" fill="#3fe0a6">barragem</text>
      <text x="276" y="170" fontSize="12" fontWeight="700" fill="#3fe0a6">casa de força no pé</text>
      <text x="330" y="228" fontSize="12" fill="#93aaa1">restituição imediata</text>
      <text x="10" y="24" fontSize="13" fontWeight="800" fill="#e9f3ee">Pé de barragem: queda criada só pelo barramento; circuito curto</text>
    </svg>
  );
}
function ArrDerivacao() {
  return (
    <svg viewBox="0 0 460 240" className="arr-svg" aria-label="Arranjo de derivação">
      <rect width="460" height="240" fill="#1a2620" />
      <path d="M0 90 Q120 70 200 96 T460 120" fill="none" stroke="#bfe3ff" strokeWidth="16" />
      <path d="M60 84 L74 108" stroke="#8399a0" strokeWidth="8" />
      <path d="M74 96 C160 96 260 96 330 150" fill="none" stroke="#93a7af" strokeWidth="9" strokeDasharray="2 0" />
      <circle cx="250" cy="96" r="10" fill="none" stroke="#f3bd4f" strokeWidth="3" />
      <text x="222" y="80" fontSize="11" fontWeight="700" fill="#f4c05a">chaminé de equilíbrio</text>
      <rect x="318" y="146" width="52" height="30" fill="#fff" stroke="#3fe0a6" strokeWidth="2" />
      <path d="M318 146 L344 132 L370 146 Z" fill="#2fa07a" />
      <path d="M370 164 Q420 176 460 168" fill="none" stroke="#bfe3ff" strokeWidth="12" />
      <text x="18" y="70" fontSize="12" fontWeight="700" fill="#3fe0a6">açude de derivação</text>
      <text x="120" y="128" fontSize="12" fontWeight="700" fill="#3fe0a6">túnel/canal + conduto forçado</text>
      <text x="300" y="200" fontSize="12" fontWeight="700" fill="#3fe0a6">casa de força afastada</text>
      <path d="M74 96 L318 161" fill="none" stroke="#3fe0a6" strokeWidth="1" strokeDasharray="4 4" />
      <text x="150" y="188" fontSize="11" fill="#93aaa1">trecho de vazão reduzida (TVR) no leito natural</text>
      <text x="10" y="24" fontSize="13" fontWeight="800" fill="#e9f3ee">Derivação: circuito longo aproveita a queda do relevo (ex.: Parigot de Souza)</text>
    </svg>
  );
}
function ArrFioAgua() {
  return (
    <svg viewBox="0 0 460 240" className="arr-svg" aria-label="Fio d'água vs acumulação">
      <rect width="460" height="240" fill="#1a2620" />
      <rect x="10" y="46" width="210" height="176" fill="#fff" stroke="#dce5e0" />
      <path d="M20 150 L110 150 L110 132 L20 132 Z" fill="#bfe3ff" />
      <path d="M110 132 L110 190 L138 190 L130 132 Z" fill="#8a9a93" stroke="#8399a0" strokeWidth="1.6" />
      <rect x="138" y="172" width="34" height="20" fill="#fff" stroke="#3fe0a6" strokeWidth="1.6" />
      <path d="M172 184 L212 184" stroke="#bfe3ff" strokeWidth="10" />
      <text x="22" y="66" fontSize="12" fontWeight="800" fill="#4cc4f5">FIO D'ÁGUA</text>
      <text x="22" y="82" fontSize="10.5" fill="#bcd0c7">reservatório mínimo</text>
      <text x="22" y="96" fontSize="10.5" fill="#bcd0c7">gera conforme o rio</text>
      <text x="22" y="212" fontSize="10.5" fill="#93aaa1">menor alagamento · geração variável</text>
      <rect x="240" y="46" width="210" height="176" fill="#fff" stroke="#dce5e0" />
      <path d="M250 166 L360 166 L360 108 L250 128 Z" fill="#bfe3ff" />
      <path d="M360 108 L360 200 L392 200 L380 108 Z" fill="#8a9a93" stroke="#8399a0" strokeWidth="1.6" />
      <rect x="392" y="182" width="34" height="20" fill="#fff" stroke="#3fe0a6" strokeWidth="1.6" />
      <path d="M426 192 L450 192" stroke="#bfe3ff" strokeWidth="10" />
      <path d="M250 128 L360 108" stroke="#4cc4f5" strokeWidth="1.4" strokeDasharray="4 3" />
      <text x="252" y="66" fontSize="12" fontWeight="800" fill="#3fe0a6">ACUMULAÇÃO</text>
      <text x="252" y="82" fontSize="10.5" fill="#bcd0c7">estoca água entre estações</text>
      <text x="252" y="96" fontSize="10.5" fill="#bcd0c7">regulariza vazão e firma energia</text>
      <text x="252" y="212" fontSize="10.5" fill="#93aaa1">maior área alagada · deplecionamento</text>
      <text x="10" y="24" fontSize="13" fontWeight="800" fill="#e9f3ee">Regularização: fio d'água × acumulação (ex.: Baixo Iguaçu × Foz do Areia)</text>
    </svg>
  );
}
export function ArrangementSchematics() {
  return (
    <div className="arr-grid">
      <figure><ArrPeBarragem /><figcaption>Arranjo compacto: barragem, casa de força ao pé e restituição imediata.</figcaption></figure>
      <figure><ArrDerivacao /><figcaption>Arranjo de derivação: açude, adução longa, chaminé de equilíbrio e TVR.</figcaption></figure>
      <figure><ArrFioAgua /><figcaption>Fio d'água × acumulação: o reservatório define a operação e o impacto.</figcaption></figure>
    </div>
  );
}
