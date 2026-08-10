// Secao "Como funciona uma hidreletrica", guia tecnico visual e interativo.
// Modulo isolado (primeiro passo de quebra do main.jsx). Recebe apenas `go`.
import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Waves, Zap, Droplets, Factory, Mountain, Gauge, ArrowRight, Info,
  Layers3, Activity, CircleHelp, TowerControl, Wind, MapPin,
} from 'lucide-react';
import { TurbineGallery, PRCasesSection, ArrangementSchematics, LicensingPath } from './hydroCases';
import NormativeAuthorityAxes from './NormativeAuthorityAxes.jsx';
import './routeStyles.css';

const ASSET = (p) => ((import.meta.env.BASE_URL || '/').replace(/\/$/, '')) + p;

export const HYDRO_SECTIONS = Object.freeze([
  { id: 'hydro-principio', label: 'Princípio' },
  { id: 'hydro-anatomia', label: 'Anatomia' },
  { id: 'hydro-potencia', label: 'Potência' },
  { id: 'hydro-competencias', label: 'Competências' },
  { id: 'hydro-tipologias', label: 'Tipologias' },
  { id: 'hydro-operacao', label: 'Operação' },
  { id: 'hydro-barramentos', label: 'Barramentos' },
  { id: 'hydro-turbinas', label: 'Turbinas' },
  { id: 'hydro-casos', label: 'Casos do Paraná' },
  { id: 'hydro-arranjos', label: 'Arranjos' },
  { id: 'hydro-licenciamento', label: 'Licenciamento' },
]);

function clampPercent(value) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function calculateHydroReadingState({
  sections,
  scrollY = 0,
  viewportHeight = 0,
  activationOffset = 0,
}) {
  const available = sections.filter((section) => (
    Number.isFinite(section.top) && Number.isFinite(section.bottom)
  ));

  if (!available.length) {
    return { activeId: HYDRO_SECTIONS[0].id, progress: 0 };
  }

  const readingLine = scrollY + activationOffset;
  let activeId = available[0].id;
  for (const section of available) {
    if (section.top > readingLine) break;
    activeId = section.id;
  }

  const start = available[0].top;
  const end = Math.max(start + 1, available.at(-1).bottom - viewportHeight);
  const progress = clampPercent(((readingLine - start) / (end - start)) * 100);
  return { activeId, progress };
}

function topbarHeight() {
  const cssValue = getComputedStyle(document.documentElement)
    .getPropertyValue('--top')
    .trim();
  return Number.parseFloat(cssValue) || 74;
}

let pendingSectionFrame = 0;
let pendingSectionCleanup = null;

function focusSection(id) {
  const section = document.getElementById(id);
  if (!section) return;

  if (pendingSectionFrame) window.cancelAnimationFrame(pendingSectionFrame);
  pendingSectionCleanup?.();

  // Antes de medir um destino distante, materialize temporariamente as
  // seções cujo tamanho ainda é apenas intrínseco. Sem isso, o navegador pode
  // calcular Licenciamento com placeholders e deslocá-lo quando os blocos
  // intermediários forem revelados durante a rolagem.
  const longSections = [...document.querySelectorAll('.hydro-long-section')];
  const previousVisibility = longSections.map((element) => (
    [element, element.style.getPropertyValue('content-visibility')]
  ));
  const restoreVisibility = () => {
    previousVisibility.forEach(([element, previous]) => {
      if (previous) element.style.setProperty('content-visibility', previous);
      else element.style.removeProperty('content-visibility');
    });
    if (pendingSectionCleanup === restoreVisibility) pendingSectionCleanup = null;
  };
  pendingSectionCleanup = restoreVisibility;
  longSections.forEach((element) => element.style.setProperty('content-visibility', 'visible'));
  // A leitura força uma geometria completa antes de scrollIntoView.
  void document.documentElement.scrollHeight;

  section.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' });
  section.focus({ preventScroll: true });

  let framesLeft = 16;
  const settle = () => {
    pendingSectionFrame = 0;
    const localNav = document.querySelector('.hydro-guide-nav');
    const desiredTop = topbarHeight() + (localNav?.offsetHeight || 0) + 10;
    const delta = section.getBoundingClientRect().top - desiredTop;
    if (Math.abs(delta) > 1) {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      window.scrollTo({ top: Math.max(0, scrollY + delta), behavior: 'auto' });
    }
    framesLeft -= 1;
    if (framesLeft === 12) restoreVisibility();
    if (framesLeft > 0) pendingSectionFrame = window.requestAnimationFrame(settle);
    else restoreVisibility();
  };
  pendingSectionFrame = window.requestAnimationFrame(settle);
}

export function HydroLocalNav() {
  const linksRef = useRef(null);
  const [reading, setReading] = useState({
    activeId: HYDRO_SECTIONS[0].id,
    progress: 0,
  });

  useEffect(() => {
    let animationFrame = 0;

    const update = () => {
      animationFrame = 0;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const positions = HYDRO_SECTIONS.map(({ id }) => {
        const element = document.getElementById(id);
        if (!element) return { id, top: Number.NaN, bottom: Number.NaN };
        const rect = element.getBoundingClientRect();
        return {
          id,
          top: rect.top + scrollY,
          bottom: rect.bottom + scrollY,
        };
      });
      const next = calculateHydroReadingState({
        sections: positions,
        scrollY,
        viewportHeight: window.innerHeight,
        activationOffset: topbarHeight() + 96,
      });
      setReading((current) => (
        current.activeId === next.activeId && current.progress === next.progress
          ? current
          : next
      ));
    };

    const scheduleUpdate = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  useEffect(() => {
    const links = linksRef.current;
    const active = links?.querySelector(
      `[data-hydro-nav-target="${reading.activeId}"]`,
    );
    if (!links || !active || typeof links.scrollTo !== 'function') return;

    const linksBox = links.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    const outside = activeBox.left < linksBox.left || activeBox.right > linksBox.right;
    if (!outside) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    links.scrollTo({
      left: Math.max(0, active.offsetLeft - (links.clientWidth - active.offsetWidth) / 2),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [reading.activeId]);

  function handleKeyDown(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const controls = [...event.currentTarget.querySelectorAll('[data-hydro-nav-target]')];
    const currentIndex = controls.indexOf(document.activeElement);
    if (currentIndex < 0) return;

    event.preventDefault();
    let nextIndex = currentIndex;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = controls.length - 1;
    if (event.key === 'ArrowLeft') nextIndex = Math.max(0, currentIndex - 1);
    if (event.key === 'ArrowRight') nextIndex = Math.min(controls.length - 1, currentIndex + 1);
    controls[nextIndex]?.focus();
  }

  return (
    <nav className="hydro-guide-nav" aria-label="Seções deste guia" onKeyDown={handleKeyDown}>
      <div className="hydro-guide-nav__summary">
        <strong>Neste guia</strong>
        <span>{reading.progress}% lido</span>
      </div>
      <div className="hydro-guide-nav__links" ref={linksRef}>
        {HYDRO_SECTIONS.map((section) => (
          <button
            type="button"
            key={section.id}
            data-hydro-nav-target={section.id}
            aria-current={reading.activeId === section.id ? 'location' : undefined}
            onClick={() => {
              setReading((current) => ({ ...current, activeId: section.id }));
              focusSection(section.id);
            }}
          >
            {section.label}
          </button>
        ))}
      </div>
      <div
        className="hydro-guide-nav__progress"
        role="progressbar"
        aria-label="Progresso de leitura deste guia"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={reading.progress}
      >
        <span style={{ width: `${reading.progress}%` }} />
      </div>
    </nav>
  );
}

// --- Componentes do arranjo (hotspots do corte transversal) ---
const PARTES = [
  { id: 'reservatorio', nome: 'Reservatório', icon: Droplets, resumo: 'Massa de água represada que estoca energia potencial.',
    detalhe: 'Volume de água acumulado a montante da barragem. A diferença de nível entre a superfície do reservatório e o nível de água no canal de fuga, a jusante, é a queda bruta. A queda líquida disponível à turbina desconta as perdas hidráulicas. Reservatórios de acumulação podem regularizar vazões; arranjos a fio d\'água têm pouca ou nenhuma regularização sazonal. Área e volume, isoladamente, não definem a operação nem a magnitude dos impactos.' },
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
    detalhe: 'Após passar pela turbina, a água segue pelo tubo de sucção (que recupera parte da energia) e pelo canal de fuga de volta ao leito do rio, a jusante. A cota do canal de fuga fecha o cálculo da queda bruta; a queda líquida é a bruta menos as perdas de carga na tomada, na adução e no conduto forçado.' },
  { id: 'subestacao', nome: 'Subestação e conexão', icon: TowerControl, resumo: 'Eleva a tensão e conecta ao sistema.',
    detalhe: 'A energia gerada passa pelos transformadores e equipamentos de manobra e proteção da subestação. A conexão pode integrar rede de distribuição ou de transmissão, conforme tensão e ponto de acesso definidos para o empreendimento. Os requisitos variam conforme a rede e o agente responsável; não presuma uma LDAT ou conexão direta ao Sistema Interligado Nacional sem conferir os atos e projetos do caso.' },
];

const TIPOS_POTENCIA = [
  // Faixas e definicoes do Quadro 8 do POP. O erro recorrente de cada tipologia
  // e o que o proprio Quadro 8 registra na coluna de erros.
  { sigla: 'MCH', nome: 'Microcentral Hidrelétrica', faixa: 'até 75 kW', cor: '#7ec8a9',
    nota: 'Potência igual ou inferior a 75 kW. Confirmar potência, supressão, outorga, arranjo e intervenção em APP antes de definir entre DLAM, LAS ou outra modalidade. Erro recorrente: tratar como CGH sem verificar potência e características atuais.' },
  { sigla: 'MGH', nome: 'Minigeradora Hidrelétrica', faixa: 'acima de 75 kW até 500 kW', cor: '#37d39a',
    nota: 'Potência superior a 75 kW e até 500 kW. Confirmar IDA, supressão e alagamento para definir entre DLAM, LAC, LAS ou outra forma aplicável. Erro recorrente: aplicar licenciamento complexo sem avaliar o enquadramento.' },
  { sigla: 'CGH', nome: 'Central Geradora Hidrelétrica', faixa: 'acima de 500 kW até 5 MW', cor: '#2fb8c9',
    nota: 'Potência superior a 500 kW e até 5 MW. Confirmar se está abaixo ou acima de 1 MW, porque a Consulta Prévia é obrigatória a partir de 1 MW. Erro recorrente: exigir autorização ou concessão da ANEEL como se fosse PCH, sem verificar a regra setorial aplicável.' },
  { sigla: 'PCH', nome: 'Pequena Central Hidrelétrica', faixa: 'acima de 5 MW até 30 MW', cor: '#4cc4f5',
    nota: 'No eixo ambiental do IAT: potência superior a 5 MW e até 30 MW, com reservatório de até 3 km², ressalvada a exceção da IN. No eixo setorial, o art. 5º da REN ANEEL 875/2020, com redação da REN 1.070/2023, enquadra PCH pela faixa superior a 5 MW e até 30 MW, sem limite de área. A página geral Outorgas ainda cita 13 km², mas diverge do ato consolidado e da página operacional de 2026. Não misture os eixos e confirme o ato aplicável ao caso.' },
  { sigla: 'UHE', nome: 'Usina Hidrelétrica', faixa: 'acima de 30 MW', cor: '#9fb7ff',
    nota: 'No eixo ambiental do IAT: capacidade instalada superior a 30 MW, reservatório maior que 3 km² ou definição da ANEEL. O regime setorial distingue autorização e concessão por critérios próprios. Em regra exige EIA e RIMA. Erro recorrente: ignorar competência, delegação, processo federal ou exigência de EIA e RIMA.' },
];

const TIPOS_RESERVATORIO = [
  { nome: 'Fio d\'água', icon: Waves, desc: 'Opera com pouca ou nenhuma regularização sazonal e geração mais dependente da vazão afluente. Pode envolver menor alagamento que uma alternativa de acumulação, mas isso não significa impacto automaticamente menor: avalie barramento, trecho de vazão reduzida, conectividade, sedimentos, fauna, usos da água e localização.' },
  { nome: 'Acumulação / regularização', icon: Droplets, desc: 'Armazena água para regularizar vazões entre períodos e ampliar a flexibilidade de geração. Pode ampliar alagamento, deplecionamento e deslocamentos, mas a natureza e a magnitude dos impactos dependem também da localização, do arranjo, da regra operativa e das medidas de controle.' },
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

export function faixaDidaticaPorPotencia(potMW) {
  if (!Number.isFinite(potMW) || potMW < 0) return null;
  if (potMW <= 0.075) return { sigla: 'MCH', faixa: 'até 75 kW' };
  if (potMW <= 0.5) return { sigla: 'MGH', faixa: 'acima de 75 kW até 500 kW' };
  if (potMW <= 5) return { sigla: 'CGH', faixa: 'acima de 500 kW até 5 MW' };
  if (potMW <= 30) return { sigla: 'PCH', faixa: 'acima de 5 MW até 30 MW' };
  return { sigla: 'UHE', faixa: 'acima de 30 MW' };
}

export function turbinasCompativeisPorQueda(h) {
  if (!Number.isFinite(h)) return [];
  return TURBINAS
    .filter((t) => h >= t.hMin && h <= t.hMax)
    .map((t) => t.nome);
}

function DamMini({ kind }) {
  // pequenos diagramas esquematicos por tipo de barragem
  const common = { fill: 'none', stroke: '#3fe0a6', strokeWidth: 2 };
  const water = { fill: '#bfe3ff' };
  return (
    <svg viewBox="0 0 120 70" className="dam-mini" aria-hidden="true">
      <rect x="0" y="52" width="120" height="18" fill="#1e2c27" />
      {kind === 'gravidade' && <>
        <rect x="2" y="30" width="52" height="22" {...water} />
        <path d="M56 52 L56 20 L76 52 Z" fill="#7f918a" stroke="#3fe0a6" strokeWidth="1.5" />
      </>}
      {kind === 'arco' && <>
        <rect x="2" y="30" width="52" height="22" {...water} />
        <path d="M56 20 Q70 36 56 52" {...common} />
      </>}
      {kind === 'contraforte' && <>
        <rect x="2" y="30" width="52" height="22" {...water} />
        <path d="M56 18 L70 52" {...common} />
        <path d="M60 52 L66 40 M64 52 L70 44" stroke="#3fe0a6" strokeWidth="1.5" />
      </>}
      {kind === 'terra' && <>
        <rect x="2" y="34" width="48" height="18" {...water} />
        <path d="M50 52 L66 24 L86 52 Z" fill="#b8a888" stroke="#c9b98a" strokeWidth="1.5" />
        <path d="M64 24 L68 24 L68 52 L64 52 Z" fill="#a89868" />
      </>}
      {kind === 'enrocamento' && <>
        <rect x="2" y="34" width="48" height="18" {...water} />
        <path d="M50 52 L66 24 L86 52 Z" fill="#7f8a90" stroke="#8399a0" strokeWidth="1.5" />
        <path d="M63 26 L69 26 L67 52 L61 52 Z" fill="#67727c" />
      </>}
      {kind === 'ccr' && <>
        <rect x="2" y="30" width="52" height="22" {...water} />
        <path d="M56 52 L56 20 L74 52 Z" fill="#7f918a" stroke="#3fe0a6" strokeWidth="1.5" />
        <path d="M56 28 L70 28 M56 36 L73 36 M56 44 L74 44" stroke="#6f817a" strokeWidth="1" />
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
      {/* A descricao conta o PROCESSO, nao a aparencia: quem usa leitor de tela
          precisa da ordem e da direcao, que sao justamente o que o desenho
          ensina. "Corte esquematico de uma usina" nao informava nada. */}
      <svg viewBox="0 0 900 470" className="cross-svg" role="img"
           aria-label="Corte esquemático de uma usina hidrelétrica. A água represada no reservatório entra pela tomada d'água, desce pelo conduto forçado até a casa de força, gira a turbina acoplada ao gerador e é restituída ao rio pelo canal de fuga. A diferença entre o nível do reservatório e o nível do canal de fuga é a queda bruta. O vertedouro escoa o excedente sem passar pela turbina.">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#15201c" /><stop offset="1" stopColor="#1a2620" />
          </linearGradient>
          <linearGradient id="wtr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5db4f0" /><stop offset="1" stopColor="#4cc4f5" />
          </linearGradient>
        </defs>
        <rect width="900" height="470" fill="url(#sky)" />
        {/* terreno */}
        <path d="M0 300 L250 300 L250 250 L0 250 Z" fill="#243330" />
        <path d="M0 470 L900 470 L900 340 L640 340 L560 420 L250 420 L250 300 L0 300 Z" fill="#1e2c27" />
        {/* reservatorio */}
        <rect x="0" y="250" width="250" height="120" fill="url(#wtr)" />
        <line x1="0" y1="250" x2="250" y2="250" stroke="#bfe3ff" strokeWidth="3" />
        {/* barragem */}
        <path d="M250 250 L250 420 L320 420 L300 250 Z" fill="#8a9a93" stroke="#8399a0" strokeWidth="2" />
        {/* vertedouro (agua caindo) */}
        <path className="cs-spill" d="M300 260 C 318 300, 322 360, 320 418" stroke="#8fd0ff" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.8" />
        {/* tomada d'agua */}
        <rect x="235" y="330" width="26" height="26" fill="#2fa07a" stroke="#3fe0a6" strokeWidth="2" />
        <path d="M237 332 L259 354 M237 344 L253 360 M245 332 L259 346" stroke="#6fe3c6" strokeWidth="1.5" />
        {/* conduto forçado */}
        <path d="M258 343 L560 405" stroke="#93a7af" strokeWidth="14" strokeLinecap="round" />
        <path className="cs-flow" d="M258 343 L560 405" stroke="#57d8bf" strokeWidth="5" strokeLinecap="round" fill="none" />
        {/* casa de forca */}
        <rect x="540" y="360" width="120" height="70" fill="#fff" stroke="#3fe0a6" strokeWidth="2" />
        <path d="M540 360 L600 330 L660 360 Z" fill="#2fa07a" />
        {/* turbina (circulo) */}
        <circle cx="585" cy="398" r="17" fill="none" stroke="#3fe0a6" strokeWidth="3" />
        <circle className="cs-turbine" cx="585" cy="398" r="10" fill="#4cc4f5" />
        <path className="cs-turbine" d="M585 388 L585 408 M575 398 L595 398 M578 391 L592 405 M592 391 L578 405" stroke="#fff" strokeWidth="1.6" />
        {/* canal de fuga: a agua turbinada volta ao rio.
            Sem o traco em movimento o circuito nao fechava: a agua descia pelo
            conduto, girava a turbina e ficava parada aqui, como se a usina
            consumisse a agua. Ela nao consome, restitui. O periodo e o mesmo
            do conduto (.cs-flow), porque e a mesma vazao. */}
        <rect x="640" y="405" width="260" height="30" fill="url(#wtr)" opacity="0.85" />
        <path className="cs-flow" d="M664 420 L890 420" stroke="#bfe3ff" strokeWidth="4"
              strokeLinecap="round" fill="none" opacity="0.9" />
        {/* linha de transmissao */}
        <path d="M690 360 L690 300 M672 316 L708 316 M676 300 L704 300" stroke="#3a4750" strokeWidth="2.5" fill="none" />
        <path d="M690 300 C 760 290, 820 300, 880 285" stroke="#3a4750" strokeWidth="1.5" fill="none" />
        {/* rotulos de queda */}
        <line x1="130" y1="250" x2="130" y2="405" stroke="#3fe0a6" strokeWidth="1.2" strokeDasharray="4 4" />
        <text x="138" y="330" fontSize="15" fill="#3fe0a6" fontWeight="700">H (queda)</text>
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

export function PowerCalc() {
  const [q, setQ] = useState(120);
  const [h, setH] = useState(60);
  const [ef, setEf] = useState(90);
  const potKW = 9.81 * q * h * (ef / 100);
  const potMW = potKW / 1000;
  const casas = Math.round(potKW / 0.2); // ~0,2 kW medios por domicilio, cerca de 150 kWh/mes (ilustrativo)
  const faixaDidatica = faixaDidaticaPorPotencia(potMW);
  const turbinasPorQueda = turbinasCompativeisPorQueda(h);
  return (
    <div className="power-calc">
      <div className="pc-formula"><Zap /> <span>P = ρ · g · Q · H · η</span> <small>densidade × gravidade × vazão turbinada × queda líquida × rendimento global</small></div>
      <div className="pc-controls">
        <label>Vazão turbinada, Q <b>{q} m³/s</b><input type="range" min="1" max="1500" value={q} onChange={(e) => setQ(+e.target.value)} /></label>
        <label>Queda líquida, H <b>{h} m</b><input type="range" min="2" max="800" value={h} onChange={(e) => setH(+e.target.value)} /></label>
        <label>Rendimento, η <b>{ef}%</b><input type="range" min="70" max="95" value={ef} onChange={(e) => setEf(+e.target.value)} /></label>
      </div>
      <div className="pc-out">
        <div><span>Potência estimada</span><strong>{potMW >= 1 ? potMW.toFixed(1) + ' MW' : Math.round(potKW) + ' kW'}</strong></div>
        <div>
          <span>Faixas de turbina compatíveis somente pela queda</span>
          <strong>{turbinasPorQueda.length ? turbinasPorQueda.join(' ou ') : 'Fora das faixas ilustradas'}</strong>
        </div>
        <div>
          <span>Faixa didática por potência (POP)</span>
          <strong>{faixaDidatica?.sigla}</strong>
          <small> · {faixaDidatica?.faixa}</small>
        </div>
      </div>
      <p className="pc-note">
        Estimativa didática, não enquadramento automático. A faixa MCH, MGH, CGH, PCH ou UHE reproduz
        apenas o recorte de potência do Quadro 8 do POP; não determina nem altera cadastro, registro ou
        ato setorial da ANEEL, modalidade ambiental ou suficiência documental. Nesta expressão, H é a
        queda líquida, depois das perdas hidráulicas, e η representa o rendimento global do conjunto,
        inclusive turbina e gerador. A potência real depende do arranjo e das curvas de operação.
      </p>
      <p className="pc-note">
        A lista de turbinas cruza somente a queda H com as faixas ilustradas acima. A vazão Q participa
        do cálculo de potência, mas não é usada para escolher a máquina. A seleção de projeto exige,
        entre outros dados, faixa operativa de vazões, rotação, cavitação e curvas do fabricante.
      </p>
    </div>
  );
}

function TurbinePicker() {
  const [h, setH] = useState(60);
  const compativeis = turbinasCompativeisPorQueda(h);
  return (
    <div className="turb-picker">
      <label className="tp-slider">Arraste a queda de projeto, H <b>{h} m</b>
        <input type="range" min="2" max="800" value={h} onChange={(e) => setH(+e.target.value)} />
      </label>
      <div className="tp-scale">
        {[['Bulbo', 2, 15], ['Kaplan', 10, 70], ['Francis', 30, 400], ['Pelton', 250, 800]].map(([nome, a, b]) => (
          <div key={nome} className={'tp-band' + (compativeis.includes(nome) ? ' rec' : '')}>
            <span className="tp-name">{nome}</span>
            <span className="tp-range">{a} a {b} m</span>
          </div>
        ))}
      </div>
      <div className="tp-rec">
        <Info /> Para {h} m, as faixas compatíveis por queda são{' '}
        <strong>{compativeis.length ? compativeis.join(' e ') : 'nenhuma das faixas ilustradas'}</strong>.
        Esta triagem não usa vazão nem substitui o dimensionamento da máquina.
      </div>
    </div>
  );
}

// Ciclo de geracao, animado em SVG.
//
// Substitui um GIF de 290 kB cujo texto estava sem acento ("Reservatorio",
// "casa de forca") e serrilhava em tela grande. Em SVG o texto sai nitido em
// qualquer tamanho e a animacao cai sozinha com prefers-reduced-motion.
//
// Os rotulos ficam FORA do desenho, numa legenda HTML: escritos sobre a
// ilustracao eles se sobrepunham a barragem e ao reservatorio, e qualquer
// ajuste de posicao quebrava em outra largura de tela.
const CICLO_ETAPAS = [
  ['Reservatório', 'a água represada acumula energia potencial'],
  ['Conduto forçado', 'a queda vira velocidade'],
  ['Turbina', 'a água em movimento gira o rotor'],
  ['Gerador', 'a rotação vira energia elétrica'],
  ['Restituição', 'a água turbinada volta ao rio'],
];

function CicloGeracao() {
  const agua = '#4cc4f5';
  const verde = '#3fe0a6';
  const marcador = (x, y, n) => (
    <g key={n}>
      <circle cx={x} cy={y} r="13" fill="#0b1f1b" stroke={verde} strokeWidth="2" />
      <text x={x} y={y} className="cg-num" textAnchor="middle" dominantBaseline="central">{n}</text>
    </g>
  );
  return (
    <>
      <svg viewBox="0 0 640 280" className="ciclo-svg" role="img"
           aria-label="Ciclo de geração de uma usina hidrelétrica: a água do reservatório desce pelo conduto forçado, gira a turbina, o gerador produz eletricidade que segue pelo sistema de conexão, em rede de distribuição ou transmissão conforme o ponto de acesso, e a água turbinada é restituída ao rio.">
        <defs>
          <linearGradient id="cg-ceu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d2b30" /><stop offset="1" stopColor="#10352f" />
          </linearGradient>
        </defs>

        <rect width="640" height="280" fill="url(#cg-ceu)" rx="10" />
        <path d="M0 150 L110 104 L214 150 Z" fill="#16463c" opacity=".85" />
        <path d="M452 150 L536 108 L640 150 Z" fill="#16463c" opacity=".85" />

        {/* reservatorio */}
        <rect x="0" y="150" width="232" height="86" fill={agua} opacity=".7" />
        <path className="cg-onda" d="M0 157 q29 -7 58 0 t58 0 t58 0 t58 0 t58 0"
              fill="none" stroke="#bfe3ff" strokeWidth="2.5" opacity=".6" />
        {marcador(60, 194, 1)}

        {/* barragem e tomada d'agua */}
        <path d="M232 150 L232 236 L268 236 L250 150 Z" fill="#8399a0" stroke={verde} strokeWidth="2" />
        <rect x="208" y="192" width="24" height="22" fill="#0a4a38" stroke={verde} strokeWidth="2" rx="3" />

        {/* conduto forcado, com o fluxo descendo */}
        <line x1="232" y1="204" x2="392" y2="240" stroke="#2b3a3f" strokeWidth="14" strokeLinecap="round" />
        <line className="cg-fluxo" x1="232" y1="204" x2="392" y2="240" stroke={verde} strokeWidth="6"
              strokeLinecap="round" strokeDasharray="10 22" />
        {marcador(312, 190, 2)}

        {/* casa de forca: turbina girando e gerador pulsando */}
        <rect x="392" y="206" width="98" height="54" fill="#0e3630" stroke={verde} strokeWidth="2" rx="4" />
        <path d="M392 206 L441 184 L490 206 Z" fill="#0a4a38" stroke={verde} strokeWidth="2" />
        <g className="cg-turbina" style={{ transformOrigin: '424px 234px' }}>
          <circle cx="424" cy="234" r="14" fill="none" stroke={agua} strokeWidth="3" />
          <path d="M424 234 L424 221 M424 234 L435 241 M424 234 L413 241"
                stroke={agua} strokeWidth="3" strokeLinecap="round" />
        </g>
        {marcador(424, 172, 3)}
        <rect className="cg-gerador" x="452" y="222" width="26" height="24" rx="3"
              fill="#0a4a38" stroke="#f3bd4f" strokeWidth="2" />
        {marcador(465, 172, 4)}

        {/* subestacao e conexao eletrica */}
        <path d="M566 214 L556 152 M566 214 L576 152 M559 178 L573 178 M557 194 L575 194"
              stroke="#8399a0" strokeWidth="2.5" fill="none" />
        <path className="cg-linha" d="M490 220 Q528 192 556 156"
              stroke="#f3bd4f" strokeWidth="2" fill="none" strokeDasharray="6 6" />

        {/* canal de fuga */}
        <rect x="490" y="248" width="150" height="18" fill={agua} opacity=".7" />
        <path className="cg-onda2" d="M490 256 q22 -5 44 0 t44 0 t44 0"
              fill="none" stroke="#bfe3ff" strokeWidth="2" opacity=".55" />
        {marcador(560, 236, 5)}
      </svg>
      {/* O numero vem do contador CSS, nao de um <span>: com o span, qualquer
          falha de folha de estilo mostrava o numero duas vezes ("1. 1Reservatorio"),
          porque o marcador nativo do <ol> reaparece junto. */}
      <ol className="ciclo-legenda">
        {CICLO_ETAPAS.map(([nome, desc]) => (
          <li key={nome}><strong>{nome}</strong><small>{desc}</small></li>
        ))}
      </ol>
    </>
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

      <HydroLocalNav />

      <section
        className="hydro-hero hydro-section hydro-section--intro"
        id="hydro-principio"
        tabIndex="-1"
        data-hydro-section
      >
        <figure className="hydro-gif">
          <CicloGeracao />
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
          <p className="hydro-two">A potência hidráulica estimada segue <strong>P = ρ · g · Q · H · η</strong>: vazão turbinada (Q), queda líquida disponível após as perdas (H), densidade da água (ρ), gravidade (g) e rendimento global do conjunto (η). O valor de projeto depende das condições e curvas de operação.</p>
        </div>
      </section>

      <section className="hydro-block hydro-section hydro-long-section" id="hydro-anatomia" tabIndex="-1" data-hydro-section>
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

      <section className="hydro-block hydro-section hydro-long-section" id="hydro-potencia" tabIndex="-1" data-hydro-section>
        <div className="section-title"><div><h2>A conta da potência</h2><p>Ajuste vazão, queda e rendimento e compare a estimativa com as faixas didáticas do POP.</p></div><Gauge /></div>
        <PowerCalc />
      </section>

      <div className="hydro-section hydro-long-section" id="hydro-competencias" tabIndex="-1" data-hydro-section>
        <NormativeAuthorityAxes />
      </div>

      <section className="hydro-block hydro-section hydro-long-section" id="hydro-tipologias" tabIndex="-1" data-hydro-section>
        <div className="section-title"><div><h2>Faixas didáticas do eixo ambiental IAT</h2><p>Quadro 8 do POP e IN IAT nº 09/2025: ponto de partida ambiental, sem substituir os eixos ANEEL e de recursos hídricos acima.</p></div><Factory /></div>
        <div className="pot-grid">{TIPOS_POTENCIA.map((t) => (
          <article key={t.sigla} className="pot-card" style={{ '--pc': t.cor }}>
            <div className="pot-sigla">{t.sigla}</div>
            <strong>{t.nome}</strong>
            <span className="pot-faixa">{t.faixa}</span>
            <p>{t.nota}</p>
          </article>
        ))}</div>
      </section>

      <section className="hydro-block hydro-section hydro-long-section" id="hydro-operacao" tabIndex="-1" data-hydro-section>
        <div className="section-title"><div><h2>Tipos por reservatório e operação</h2></div><Droplets /></div>
        <div className="res-grid">{TIPOS_RESERVATORIO.map((t) => (
          <article key={t.nome} className="res-card"><t.icon /><strong>{t.nome}</strong><p>{t.desc}</p></article>
        ))}</div>
      </section>

      <section className="hydro-block hydro-section hydro-long-section" id="hydro-barramentos" tabIndex="-1" data-hydro-section>
        <div className="section-title"><div><h2>Tipos de barramento</h2><p>A escolha depende do vale, da fundação e do material disponível.</p></div><Mountain /></div>
        <div className="dam-grid">{BARRAGENS.map((b) => (
          <article key={b.nome} className="dam-card"><DamMini kind={b.svg} /><div><strong>{b.nome}</strong><small>{b.resiste}</small><em>{b.onde}</em></div></article>
        ))}</div>
      </section>

      <section className="hydro-block hydro-section hydro-long-section" id="hydro-turbinas" tabIndex="-1" data-hydro-section>
        <div className="section-title"><div><h2>Turbinas: faixas de aplicação</h2><p>O projeto cruza queda e vazão; o seletor abaixo destaca somente as faixas de queda e explicita essa limitação.</p></div><Wind /></div>
        <TurbinePicker />
        <TurbineGallery />
      </section>

      <section className="hydro-block hydro-section hydro-long-section" id="hydro-casos" tabIndex="-1" data-hydro-section>
        <div className="section-title"><div><h2>Casos reais no Paraná</h2><p>Um empreendimento verificado por tipo, com critérios e o site oficial de cada um.</p></div><MapPin /></div>
        <PRCasesSection />
      </section>

      <section className="hydro-block hydro-section hydro-long-section" id="hydro-arranjos" tabIndex="-1" data-hydro-section>
        <div className="section-title"><div><h2>Esquemas de arranjo</h2><p>Três diagramas detalhados: como o arranjo físico muda o circuito, a operação e o impacto.</p></div><Info /></div>
        <ArrangementSchematics />
      </section>

      <section className="hydro-block hydro-section hydro-long-section" id="hydro-licenciamento" tabIndex="-1" data-hydro-section>
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
