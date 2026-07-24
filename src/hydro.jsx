// Secao "Como funciona uma hidreletrica", guia tecnico visual e interativo.
// Modulo isolado (primeiro passo de quebra do main.jsx). Recebe apenas `go`.
import React, { useState, useMemo } from 'react';
import {
  Waves, Zap, Droplets, Factory, Mountain, Gauge, ArrowRight, Info,
  Layers3, Activity, CircleHelp, Sparkles, TowerControl, Wind, MapPin,
} from 'lucide-react';
import { TurbineGallery, PRCasesSection, ArrangementSchematics, LicensingPath } from './hydroCases';

const ASSET = (p) => ((import.meta.env.BASE_URL || '/').replace(/\/$/, '')) + p;

// --- Componentes do arranjo (hotspots do corte transversal) ---
const PARTES = [
  { id: 'reservatorio', nome: 'Reservatório', icon: Droplets, resumo: 'Massa de água represada que estoca energia potencial.',
    detalhe: 'Volume de água acumulado a montante da barragem. A diferença de nível entre a superfície do reservatório e a casa de força é a queda (H), que define quanta energia cada metro cúbico de água pode entregar. Reservatórios de acumulação regularizam a vazão ao longo do ano; usinas a fio d\'água têm reservatório reduzido.' },
  { id: 'barragem', nome: 'Barragem / barramento', icon: Mountain, resumo: 'Estrutura que barra o rio e cria a queda.',
    detalhe: 'Barra o curso d\'água, eleva o nível a montante e sustenta a pressão da água. Pode ser de concreto (gravidade, arco, contrafortes) ou de aterro (terra, enrocamento). É a estrutura de maior responsabilidade estrutural e alvo central da segurança de barragens.' },
  { id: 'vertedouro', nome: 'Vertedouro', icon: Waves, resumo: 'Extravasa com segurança as cheias.',
    detalhe: 'Órgão de descarga que verte o excedente de água nas cheias, protegendo a barragem do galgamento. Pode ter comportas ou ser de soleira livre. O dimensionamento parte da cheia de projeto; a energia da água vertida é dissipada em bacia de dissipação ou salto de esqui.' },
  { id: 'tomada', nome: 'Tomada d\'água', icon: Layers3, resumo: 'Capta a água e protege com grades.',
    detalhe: 'Estrutura de captação que conduz a água do reservatório ao circuito de geração. Possui grades (trash racks) para reter detritos e comportas para bloqueio e manutenção. Sua cota define o nível mínimo operativo.' },
  { id: 'conduto', nome: 'Conduto forçado / adução', icon: ArrowRight, resumo: 'Leva a água sob pressão até a turbina.',
    detalhe: 'Tubulação (penstock) ou túnel que conduz a água sob pressão da tomada d\'água até a turbina. Em circuitos longos, uma chaminé de equilíbrio (surge tank) absorve o golpe de aríete das manobras. Converte energia de posição em energia de pressão e velocidade.' },
  { id: 'casa', nome: 'Casa de força', icon: Factory, resumo: 'Abriga turbinas e geradores.',
    detalhe: 'Edificação que abriga as unidades geradoras (turbina + gerador), sistemas de controle, regulação e os equipamentos auxiliares. Pode ser ao pé da barragem, abrigada, ao ar livre ou subterrânea, conforme o arranjo e a topografia.' },
  { id: 'turbina', nome: 'Turbina + gerador', icon: Gauge, resumo: 'Converte o movimento da água em eletricidade.',
    detalhe: 'A turbina transforma a energia hidráulica em energia mecânica de rotação; acoplada ao gerador, produz energia elétrica. O tipo (Pelton, Francis, Kaplan, bulbo) é escolhido pela queda e pela vazão do aproveitamento.' },
  { id: 'fuga', nome: 'Tubo de sucção e canal de fuga', icon: Wind, resumo: 'Devolve a água ao rio a jusante.',
    detalhe: 'Após passar pela turbina, a água segue pelo tubo de sucção (que recupera parte da energia) e pelo canal de fuga de volta ao leito do rio, a jusante. A cota do canal de fuga fecha o cálculo da queda líquida.' },
  { id: 'subestacao', nome: 'Subestação e conexão', icon: TowerControl, resumo: 'Eleva a tensão e conecta ao sistema.',
    detalhe: 'A energia gerada é elevada de tensão nos transformadores da subestação e injetada no sistema de transmissão (linha de transmissão / LDAT). É a fronteira entre o empreendimento e o Sistema Interligado Nacional.' },
];

const TIPOS_POTENCIA = [
  { sigla: 'CGH', nome: 'Central Geradora Hidrelétrica', faixa: 'até 5 MW', cor: '#0a7755',
    nota: 'Menor porte. Dispensada de concessão/autorização, sujeita a registro na ANEEL. Geração distribuída, impacto local reduzido.' },
  { sigla: 'PCH', nome: 'Pequena Central Hidrelétrica', faixa: 'acima de 5 até 30 MW', cor: '#1769c2',
    nota: 'Reservatório em regra até 13 km². Outorgada por autorização da ANEEL. Muitas vezes a fio d\'água, com licenciamento proporcional ao porte.' },
  { sigla: 'UHE', nome: 'Usina Hidrelétrica', faixa: 'acima de 30 MW', cor: '#07583b',
    nota: 'Grande porte, outorgada por concessão (leilão). Em regra exige EIA/RIMA. Maior complexidade estrutural, fundiária e socioambiental.' },
];

const TIPOS_RESERVATORIO = [
  { nome: 'Fio d\'água', icon: Waves, desc: 'Reservatório pequeno, sem regularização relevante. A usina gera conforme a vazão que chega ao rio. Menor área alagada e menor impacto de barramento, porém geração variável.' },
  { nome: 'Acumulação / regularização', icon: Droplets, desc: 'Reservatório grande que estoca água e regulariza a vazão entre as estações. Permite firmar energia e atender picos, ao custo de maior área alagada e reassentamento.' },
  { nome: 'Reversível (bombeamento)', icon: Activity, desc: 'Bombeia água para um reservatório superior nas horas de baixa demanda e turbina nas horas de pico. Funciona como uma "bateria" hídrica de grande porte para o sistema.' },
];

const BARRAGENS = [
  { nome: 'Concreto a gravidade', resiste: 'Resiste pelo peso próprio', onde: 'Vales abertos, fundação rochosa', svg: 'gravidade' },
  { nome: 'Concreto em arco', resiste: 'Transfere a carga às ombreiras', onde: 'Vales estreitos e rochosos', svg: 'arco' },
  { nome: 'Contrafortes', resiste: 'Laje apoiada em contrafortes', onde: 'Economia de concreto em vãos', svg: 'contraforte' },
  { nome: 'Terra (aterro)', resiste: 'Maciço de solo compactado com núcleo impermeável', onde: 'Vales largos, farto material local', svg: 'terra' },
  { nome: 'Enrocamento', resiste: 'Maciço de rocha com face de concreto (CFRD) ou núcleo argiloso', onde: 'Boa disponibilidade de rocha', svg: 'enrocamento' },
  { nome: 'CCR, concreto compactado a rolo', resiste: 'Concreto seco compactado em camadas, como um aterro', onde: 'Execução rápida de grandes volumes', svg: 'ccr' },
];

const TURBINAS = [
  { nome: 'Pelton', tipo: 'Ação (impulso)', queda: 'Queda alta: acima de ~250 m', vazao: 'Vazão baixa', nota: 'Jatos d\'água atingem conchas na periferia da roda. Típica de aproveitamentos de montanha.', hMin: 250, hMax: 1800 },
  { nome: 'Francis', tipo: 'Reação', queda: 'Queda média: ~30 a 400 m', vazao: 'Vazão média', nota: 'A mais usada no Brasil. Água entra em espiral (caracol) e sai axialmente. Ampla faixa de aplicação.', hMin: 30, hMax: 400 },
  { nome: 'Kaplan', tipo: 'Reação', queda: 'Queda baixa: ~10 a 70 m', vazao: 'Vazão alta', nota: 'Hélice com pás ajustáveis, mantém rendimento com vazão variável. Comum em grandes rios de planície.', hMin: 10, hMax: 70 },
  { nome: 'Bulbo', tipo: 'Reação', queda: 'Queda muito baixa: abaixo de ~15 m', vazao: 'Vazão muito alta', nota: 'Unidade horizontal submersa. Típica de usinas a fio d\'água em rios de grande vazão e pouca queda.', hMin: 2, hMax: 15 },
];

function turbinaPorQueda(h) {
  if (h < 15) return 'Bulbo';
  if (h < 70) return 'Kaplan';
  if (h <= 400) return 'Francis';
  return 'Pelton';
}

function DamMini({ kind }) {
  // pequenos diagramas esquematicos por tipo de barragem
  const common = { fill: 'none', stroke: '#07583b', strokeWidth: 2 };
  const water = { fill: '#bfe3ff' };
  return (
    <svg viewBox="0 0 120 70" className="dam-mini" aria-hidden="true">
      <rect x="0" y="52" width="120" height="18" fill="#e7efe9" />
      {kind === 'gravidade' && <>
        <rect x="2" y="30" width="52" height="22" {...water} />
        <path d="M56 52 L56 20 L76 52 Z" fill="#c9d3ce" stroke="#07583b" strokeWidth="1.5" />
      </>}
      {kind === 'arco' && <>
        <rect x="2" y="30" width="52" height="22" {...water} />
        <path d="M56 20 Q70 36 56 52" {...common} />
      </>}
      {kind === 'contraforte' && <>
        <rect x="2" y="30" width="52" height="22" {...water} />
        <path d="M56 18 L70 52" {...common} />
        <path d="M60 52 L66 40 M64 52 L70 44" stroke="#07583b" strokeWidth="1.5" />
      </>}
      {kind === 'terra' && <>
        <rect x="2" y="34" width="48" height="18" {...water} />
        <path d="M50 52 L66 24 L86 52 Z" fill="#d8c8a8" stroke="#8a7a54" strokeWidth="1.5" />
        <path d="M64 24 L68 24 L68 52 L64 52 Z" fill="#9a8a64" />
      </>}
      {kind === 'enrocamento' && <>
        <rect x="2" y="34" width="48" height="18" {...water} />
        <path d="M50 52 L66 24 L86 52 Z" fill="#c7cdd1" stroke="#5b6672" strokeWidth="1.5" />
        <path d="M63 26 L69 26 L67 52 L61 52 Z" fill="#8b96a1" />
      </>}
      {kind === 'ccr' && <>
        <rect x="2" y="30" width="52" height="22" {...water} />
        <path d="M56 52 L56 20 L74 52 Z" fill="#c9d3ce" stroke="#07583b" strokeWidth="1.5" />
        <path d="M56 28 L70 28 M56 36 L73 36 M56 44 L74 44" stroke="#9aa8a0" strokeWidth="1" />
      </>}
    </svg>
  );
}

function CrossSection({ selected, onSelect }) {
  // corte transversal esquematico com hotspots e agua animada
  const hot = (id, cx, cy) => (
    <button
      key={id}
      className={'cs-hot' + (selected === id ? ' active' : '')}
      style={{ left: `${cx}%`, top: `${cy}%` }}
      onClick={() => onSelect(id)}
      aria-label={PARTES.find((p) => p.id === id)?.nome}
    ><span /></button>
  );
  return (
    <div className="cross-wrap">
      <svg viewBox="0 0 900 470" className="cross-svg" role="img" aria-label="Corte esquemático de uma usina hidrelétrica">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eaf6ff" /><stop offset="1" stopColor="#f6fbf9" />
          </linearGradient>
          <linearGradient id="wtr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5db4f0" /><stop offset="1" stopColor="#1769c2" />
          </linearGradient>
        </defs>
        <rect width="900" height="470" fill="url(#sky)" />
        {/* terreno */}
        <path d="M0 300 L250 300 L250 250 L0 250 Z" fill="#dfe9e2" />
        <path d="M0 470 L900 470 L900 340 L640 340 L560 420 L250 420 L250 300 L0 300 Z" fill="#e7efe9" />
        {/* reservatorio */}
        <rect x="0" y="250" width="250" height="120" fill="url(#wtr)" />
        <line x1="0" y1="250" x2="250" y2="250" stroke="#bfe3ff" strokeWidth="3" />
        {/* barragem */}
        <path d="M250 250 L250 420 L320 420 L300 250 Z" fill="#b9c3bd" stroke="#5b6672" strokeWidth="2" />
        {/* vertedouro (agua caindo) */}
        <path className="cs-spill" d="M300 260 C 318 300, 322 360, 320 418" stroke="#8fd0ff" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.8" />
        {/* tomada d'agua */}
        <rect x="235" y="330" width="26" height="26" fill="#0a4a38" stroke="#07583b" strokeWidth="2" />
        <path d="M237 332 L259 354 M237 344 L253 360 M245 332 L259 346" stroke="#6fe3c6" strokeWidth="1.5" />
        {/* conduto forçado */}
        <path d="M258 343 L560 405" stroke="#2c3e46" strokeWidth="14" strokeLinecap="round" />
        <path className="cs-flow" d="M258 343 L560 405" stroke="#57d8bf" strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* casa de forca */}
        <rect x="540" y="360" width="120" height="70" fill="#fff" stroke="#07583b" strokeWidth="2" />
        <path d="M540 360 L600 330 L660 360 Z" fill="#0a4a38" />
        {/* turbina (circulo) */}
        <circle cx="585" cy="398" r="17" fill="none" stroke="#07583b" strokeWidth="3" />
        <circle className="cs-turbine" cx="585" cy="398" r="10" fill="#1769c2" />
        <path className="cs-turbine" d="M585 388 L585 408 M575 398 L595 398 M578 391 L592 405 M592 391 L578 405" stroke="#fff" strokeWidth="1.6" />
        {/* canal de fuga */}
        <rect x="640" y="405" width="260" height="30" fill="url(#wtr)" opacity="0.85" />
        {/* linha de transmissao */}
        <path d="M690 360 L690 300 M672 316 L708 316 M676 300 L704 300" stroke="#3a4750" strokeWidth="2.5" fill="none" />
        <path d="M690 300 C 760 290, 820 300, 880 285" stroke="#3a4750" strokeWidth="1.5" fill="none" />
        {/* rotulos de queda */}
        <line x1="130" y1="250" x2="130" y2="405" stroke="#07583b" strokeWidth="1.2" strokeDasharray="4 4" />
        <text x="138" y="330" fontSize="15" fill="#07583b" fontWeight="700">H (queda)</text>
      </svg>
      {/* hotspots posicionados em % sobre o svg */}
      <div className="cs-hots">
        {hot('reservatorio', 13, 62)}
        {hot('barragem', 31, 70)}
        {hot('vertedouro', 34, 74)}
        {hot('tomada', 27.5, 74)}
        {hot('conduto', 45, 82)}
        {hot('casa', 66, 84)}
        {hot('turbina', 65, 85)}
        {hot('fuga', 84, 90)}
        {hot('subestacao', 77, 65)}
      </div>
    </div>
  );
}

function PowerCalc() {
  const [q, setQ] = useState(120);
  const [h, setH] = useState(60);
  const [ef, setEf] = useState(90);
  const potKW = 9.81 * q * h * (ef / 100);
  const potMW = potKW / 1000;
  const casas = Math.max(0, Math.round(potMW * 1000 / 150)); // ~150 kWmed p/ familia (ilustrativo)
  const classe = potMW <= 5 ? 'CGH' : potMW <= 30 ? 'PCH' : 'UHE';
  return (
    <div className="power-calc">
      <div className="pc-formula"><Zap /> <span>P = ρ · g · Q · H · η</span> <small>densidade × gravidade × vazão × queda × rendimento</small></div>
      <div className="pc-controls">
        <label>Vazão turbinada, Q <b>{q} m³/s</b><input type="range" min="1" max="1500" value={q} onChange={(e) => setQ(+e.target.value)} /></label>
        <label>Queda líquida, H <b>{h} m</b><input type="range" min="2" max="250" value={h} onChange={(e) => setH(+e.target.value)} /></label>
        <label>Rendimento, η <b>{ef}%</b><input type="range" min="70" max="95" value={ef} onChange={(e) => setEf(+e.target.value)} /></label>
      </div>
      <div className="pc-out">
        <div><span>Potência estimada</span><strong>{potMW >= 1 ? potMW.toFixed(1) + ' MW' : Math.round(potKW) + ' kW'}</strong></div>
        <div><span>Turbina indicada pela queda</span><strong>{turbinaPorQueda(h)}</strong></div>
        <div><span>Classe pela potência</span><strong>{classe}</strong></div>
      </div>
      <p className="pc-note">Estimativa didática. A potência real depende do arranjo, das perdas hidráulicas e da curva de rendimento da máquina; a classificação (CGH/PCH/UHE) segue a regulação da ANEEL.</p>
    </div>
  );
}

function TurbinePicker() {
  const [h, setH] = useState(60);
  const rec = turbinaPorQueda(h);
  return (
    <div className="turb-picker">
      <label className="tp-slider">Arraste a queda de projeto, H <b>{h} m</b>
        <input type="range" min="2" max="800" value={h} onChange={(e) => setH(+e.target.value)} />
      </label>
      <div className="tp-scale">
        {[['Bulbo', 2, 15], ['Kaplan', 10, 70], ['Francis', 30, 400], ['Pelton', 250, 800]].map(([nome, a, b]) => (
          <div key={nome} className={'tp-band' + (rec === nome ? ' rec' : '')}>
            <span className="tp-name">{nome}</span>
            <span className="tp-range">{a} a {b} m</span>
          </div>
        ))}
      </div>
      <div className="tp-rec"><Sparkles /> Para {h} m de queda, a escolha típica é <strong>{rec}</strong>.</div>
    </div>
  );
}

export default function HydroGuide({ go }) {
  const [parte, setParte] = useState('turbina');
  const [turb, setTurb] = useState(0);
  const sel = useMemo(() => PARTES.find((p) => p.id === parte) || PARTES[0], [parte]);
  return (
    <div className="page hydro-page">
      <header className="page-header hydro-hero-head">
        <span><Zap /></span>
        <div>
          <small className="ph-kicker">Fundamentos de engenharia</small>
          <h1>Como funciona uma hidrelétrica</h1>
          <p>Da água represada à energia na rede: princípios, tipos de usina, barramentos, turbinas e cada componente do arranjo.</p>
        </div>
      </header>

      <section className="hydro-hero">
        <figure className="hydro-gif">
          <img src={ASSET('/hidro/funcionamento.gif')} alt="Animação do funcionamento de uma usina hidrelétrica" />
          <figcaption>Ciclo de geração: captação, adução, turbinamento e restituição ao rio.</figcaption>
        </figure>
        <div className="hydro-hero-copy">
          <h2>O princípio: converter altura em energia</h2>
          <p>Uma hidrelétrica transforma a <strong>energia potencial</strong> da água represada em <strong>energia cinética</strong> ao descer pelo conduto, depois em <strong>energia mecânica</strong> ao girar a turbina e, por fim, em <strong>energia elétrica</strong> no gerador.</p>
          <div className="energy-chain">
            {['Potencial', 'Cinética', 'Mecânica', 'Elétrica'].map((e, i) => (
              <React.Fragment key={e}><span>{e}</span>{i < 3 && <ArrowRight />}</React.Fragment>
            ))}
          </div>
          <p className="hydro-two">Dois números mandam no projeto: a <strong>queda (H)</strong>, diferença de nível entre reservatório e restituição, e a <strong>vazão (Q)</strong>, volume de água por segundo. O produto dos dois define a potência.</p>
        </div>
      </section>

      <section className="hydro-block">
        <div className="section-title"><div><h2>Anatomia do arranjo</h2><p>Clique em cada ponto do corte para entender a função.</p></div><Layers3 /></div>
        <div className="cross-layout">
          <CrossSection selected={parte} onSelect={setParte} />
          <aside className="cross-detail" key={parte}>
            <div className="cd-head"><sel.icon /><h3>{sel.nome}</h3></div>
            <p className="cd-resumo">{sel.resumo}</p>
            <p>{sel.detalhe}</p>
            <div className="cd-nav">{PARTES.map((p) => (
              <button key={p.id} className={p.id === parte ? 'active' : ''} onClick={() => setParte(p.id)}>{p.nome}</button>
            ))}</div>
          </aside>
        </div>
      </section>

      <section className="hydro-block">
        <div className="section-title"><div><h2>A conta da potência</h2><p>Ajuste vazão, queda e rendimento e veja a usina mudar de classe.</p></div><Gauge /></div>
        <PowerCalc />
      </section>

      <section className="hydro-block">
        <div className="section-title"><div><h2>Tipos por potência</h2><p>Classificação da ANEEL: muda porte, outorga e exigência de estudo.</p></div><Factory /></div>
        <div className="pot-grid">{TIPOS_POTENCIA.map((t) => (
          <article key={t.sigla} className="pot-card" style={{ '--pc': t.cor }}>
            <div className="pot-sigla">{t.sigla}</div>
            <strong>{t.nome}</strong>
            <span className="pot-faixa">{t.faixa}</span>
            <p>{t.nota}</p>
          </article>
        ))}</div>
      </section>

      <section className="hydro-block">
        <div className="section-title"><div><h2>Tipos por reservatório e operação</h2></div><Droplets /></div>
        <div className="res-grid">{TIPOS_RESERVATORIO.map((t) => (
          <article key={t.nome} className="res-card"><t.icon /><strong>{t.nome}</strong><p>{t.desc}</p></article>
        ))}</div>
      </section>

      <section className="hydro-block">
        <div className="section-title"><div><h2>Tipos de barramento</h2><p>A escolha depende do vale, da fundação e do material disponível.</p></div><Mountain /></div>
        <div className="dam-grid">{BARRAGENS.map((b) => (
          <article key={b.nome} className="dam-card"><DamMini kind={b.svg} /><div><strong>{b.nome}</strong><small>{b.resiste}</small><em>{b.onde}</em></div></article>
        ))}</div>
      </section>

      <section className="hydro-block">
        <div className="section-title"><div><h2>Turbinas: escolha por queda e vazão</h2><p>Cada máquina rende melhor em uma faixa.</p></div><Wind /></div>
        <TurbinePicker />
        <TurbineGallery />
      </section>

      <section className="hydro-block">
        <div className="section-title"><div><h2>Casos reais no Paraná</h2><p>Um empreendimento verificado por tipo, com critérios e o site oficial de cada um.</p></div><MapPin /></div>
        <PRCasesSection />
      </section>

      <section className="hydro-block">
        <div className="section-title"><div><h2>Esquemas de arranjo</h2><p>Três diagramas detalhados: como o arranjo físico muda o circuito, a operação e o impacto.</p></div><Info /></div>
        <ArrangementSchematics />
      </section>

      <section className="hydro-block">
        <div className="section-title"><div><h2>Como solicitar a autorização para construir</h2><p>Da ideia à operação: o caminho na ANEEL e no IAT, e o papel de cada ator.</p></div><Gauge /></div>
        <LicensingPath go={go} />
      </section>

      <section className="hydro-cta">
        <div><CircleHelp /><div><strong>Do princípio à decisão</strong><p>Entendido o empreendimento físico, veja como o POP conduz a análise de licenciamento etapa por etapa.</p></div></div>
        <button className="primary" onClick={() => go('formacao')}>Ir para a formação <ArrowRight /></button>
      </section>
    </div>
  );
}
