// Secao "Como funciona uma hidreletrica", guia tecnico visual e interativo.
// Modulo isolado (primeiro passo de quebra do main.jsx). Recebe apenas `go`.
import React, { useEffect, useState, useRef } from 'react';
import {
  Waves, Zap, Droplets, Factory, Mountain, Gauge, ArrowRight, Info,
  Activity, CircleHelp, Wind, MapPin, Play, Pause,
} from 'lucide-react';
import { TurbineGallery, PRCasesSection, ArrangementSchematics, LicensingPath } from './hydroCases';
import NormativeAuthorityAxes from './NormativeAuthorityAxes.jsx';
import HydroelectricCutaway from './HydroelectricCutaway.jsx';
import './routeStyles.css';
import './hydroMotion.css';

export const HYDRO_SECTIONS = Object.freeze([
  { id: 'hydro-principio', label: 'Funcionamento' },
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

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function useHydroMotion() {
  const stageRef = useRef(null);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [speed, setSpeed] = useState(1);
  const [inView, setInView] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  useEffect(() => {
    const node = stageRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: '120px 0px', threshold: 0.01 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const active = playing && inView && !reducedMotion;
  return {
    stageRef,
    playing,
    setPlaying,
    speed,
    setSpeed,
    inView,
    reducedMotion,
    active,
    style: { '--hydro-motion-scale': (1 / speed).toFixed(3) },
  };
}

function HydroMotionControls({ id, label, motion, activeDescription }) {
  let status = activeDescription;
  if (motion.reducedMotion) status = 'Movimento reduzido pelo dispositivo';
  else if (!motion.playing) status = 'Animação pausada';
  else if (!motion.inView) status = 'Pausada automaticamente fora da tela';

  return (
    <div className="hydro-motion-controls" aria-label={`Controles da animação: ${label}`}>
      <div className="hydro-motion-status" role="status" aria-live="polite">
        <span aria-hidden="true" />
        <div><small>Agora na cena</small><strong>{status}</strong></div>
      </div>
      <button
        type="button"
        className="hydro-motion-toggle"
        onClick={() => motion.setPlaying((value) => !value)}
        aria-pressed={motion.playing}
        disabled={motion.reducedMotion}
      >
        {motion.playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        {motion.playing ? 'Pausar' : 'Reproduzir'}
      </button>
      <label className="hydro-motion-speed" htmlFor={`${id}-speed`}>
        <span>Velocidade <strong>{motion.speed.toFixed(2).replace('.00', '')}×</strong></span>
        <input
          id={`${id}-speed`}
          type="range"
          min="0.5"
          max="2"
          step="0.25"
          value={motion.speed}
          aria-valuetext={`${motion.speed.toFixed(2).replace('.00', '')} vezes a velocidade normal`}
          onChange={(event) => motion.setSpeed(Number(event.target.value))}
          disabled={motion.reducedMotion}
        />
      </label>
    </div>
  );
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

function focusSection(id, onSettled) {
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

  // content-visibility pode recalcular a altura de vários blocos depois do
  // primeiro quadro, sobretudo no celular. Mantemos uma janela curta de
  // estabilização para corrigir esses deslocamentos tardios sem animação.
  let framesLeft = 120;
  let framesElapsed = 0;
  let stableFrames = 0;
  const settle = () => {
    pendingSectionFrame = 0;
    const localNav = document.querySelector('.hydro-guide-nav');
    const desiredTop = topbarHeight() + (localNav?.offsetHeight || 0) + 10;
    const delta = section.getBoundingClientRect().top - desiredTop;
    if (Math.abs(delta) > 1) {
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      window.scrollTo({ top: Math.max(0, scrollY + delta), behavior: 'auto' });
      stableFrames = 0;
    } else {
      stableFrames += 1;
    }
    framesLeft -= 1;
    framesElapsed += 1;
    if (framesElapsed === 4) restoreVisibility();
    if (framesLeft > 0 && (framesElapsed < 60 || stableFrames < 12)) {
      pendingSectionFrame = window.requestAnimationFrame(settle);
    } else {
      restoreVisibility();
      onSettled?.();
    }
  };
  pendingSectionFrame = window.requestAnimationFrame(settle);
}

export function HydroLocalNav() {
  const linksRef = useRef(null);
  const manualTargetRef = useRef(null);
  const scheduleUpdateRef = useRef(() => {});
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
        // Use a mesma linha visual adotada por focusSection. Em telas estreitas,
        // a navegação local fica mais alta; um deslocamento fixo podia deixar o
        // título focado abaixo da linha de leitura e devolver aria-current à
        // seção anterior logo após o clique.
        activationOffset: topbarHeight()
          + (document.querySelector('.hydro-guide-nav')?.offsetHeight || 86)
          + 10,
      });
      if (manualTargetRef.current) next.activeId = manualTargetRef.current;
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
    scheduleUpdateRef.current = scheduleUpdate;

    const releaseManualTarget = () => {
      if (!manualTargetRef.current) return;
      manualTargetRef.current = null;
      scheduleUpdate();
    };
    const releaseManualTargetByKey = (event) => {
      if (!['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) return;
      releaseManualTarget();
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('wheel', releaseManualTarget, { passive: true });
    window.addEventListener('touchstart', releaseManualTarget, { passive: true });
    window.addEventListener('pointerdown', releaseManualTarget, { passive: true });
    window.addEventListener('keydown', releaseManualTargetByKey);
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('wheel', releaseManualTarget);
      window.removeEventListener('touchstart', releaseManualTarget);
      window.removeEventListener('pointerdown', releaseManualTarget);
      window.removeEventListener('keydown', releaseManualTargetByKey);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      scheduleUpdateRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    const links = linksRef.current;
    const active = links?.querySelector(
      `[data-hydro-nav-target="${reading.activeId}"]`,
    );
    if (!links || !active || typeof active.scrollIntoView !== 'function') return;

    const linksBox = links.getBoundingClientRect();
    const activeBox = active.getBoundingClientRect();
    const outside = activeBox.left < linksBox.left || activeBox.right > linksBox.right;
    if (!outside) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    // Deixe o navegador resolver o ancestral rolável e o scroll-snap. Um
    // cálculo manual por offsetLeft varia conforme o offsetParent e scrollTo
    // pode ser reajustado pelo snap no Chromium do runner.
    active.scrollIntoView({
      block: 'nearest',
      inline: 'center',
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
              manualTargetRef.current = section.id;
              setReading((current) => ({ ...current, activeId: section.id }));
              focusSection(section.id, () => {
                if (manualTargetRef.current !== section.id) return;
                scheduleUpdateRef.current();
              });
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

// A anatomia detalhada agora vive no corte realista, que concentra os equipamentos,
// o movimento e a explicação técnica em uma única cena.
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
    nota: 'No eixo ambiental do IAT: capacidade instalada superior a 30 MW, reservatório maior que 3 km² ou definição da ANEEL. O regime setorial distingue autorização e concessão por critérios próprios. O art. 10 da IN IAT nº 09/2025 enquadra a UHE entre as situações passíveis de EIA e RIMA e de audiência pública; o estudo e o rito aplicáveis devem ser confirmados no caso concreto. Erro recorrente: ignorar competência, delegação, processo federal ou o enquadramento ambiental vigente.' },
];

const TIPOS_RESERVATORIO = [
  { nome: 'Fio d\'água', icon: Waves, desc: 'Opera com pouca ou nenhuma regularização sazonal e geração mais dependente da vazão afluente. Pode envolver menor alagamento que uma alternativa de acumulação, mas isso não significa impacto automaticamente menor: avalie barramento, trecho de vazão reduzida, conectividade, sedimentos, fauna, usos da água e localização.' },
  { nome: 'Acumulação / regularização', icon: Droplets, desc: 'Armazena água para regularizar vazões entre períodos e ampliar a flexibilidade de geração. Pode ampliar alagamento, deplecionamento e deslocamentos, mas a natureza e a magnitude dos impactos dependem também da localização, do arranjo, da regra operativa e das medidas de controle.' },
  { nome: 'Reversível (bombeamento)', icon: Activity, desc: 'Bombeia água para um reservatório superior nas horas de baixa demanda e turbina nas horas de pico. Funciona como uma "bateria" hídrica de grande porte para o sistema.' },
];

const BARRAGENS = [
  { nome: 'Concreto estabilizado pelo peso próprio', resiste: 'Leva a ação até a fundação pelo peso do maciço', onde: 'Vales abertos, fundação rochosa', destaque: 'Maciço de concreto', vista: 'Corte técnico', svg: 'peso-proprio' },
  { nome: 'Concreto em arco', resiste: 'Transfere a ação lateralmente às ombreiras', onde: 'Vales estreitos e rochosos', destaque: 'Ombreiras rochosas', vista: 'Vista em planta', svg: 'arco' },
  { nome: 'Contrafortes', resiste: 'A laje entrega a ação aos contrafortes e à fundação', onde: 'Economia de concreto em vãos', destaque: 'Laje e contrafortes', vista: 'Corte técnico', svg: 'contraforte' },
  { nome: 'Terra (aterro)', resiste: 'O maciço compactado distribui a ação pela base', onde: 'Vales largos, farto material local', destaque: 'Núcleo impermeável', vista: 'Corte técnico', svg: 'terra' },
  { nome: 'Enrocamento', resiste: 'O enrocamento distribui a ação e a face veda o reservatório', onde: 'Boa disponibilidade de rocha', destaque: 'Face de concreto e enrocamento', vista: 'Corte técnico', svg: 'enrocamento' },
  { nome: 'CCR, concreto compactado a rolo', resiste: 'O maciço compactado em camadas leva a ação à fundação', onde: 'Execução rápida de grandes volumes', destaque: 'Camadas compactadas de CCR', vista: 'Corte técnico', svg: 'ccr' },
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
  // Seis miniaturas de 120 por 70. O tamanho e pequeno, mas o que cada tipo
  // TEM de proprio cabe: camada de lancamento no CCR, nucleo impermeavel no
  // aterro, face de concreto no enrocamento, contraforte sob a laje. Antes as
  // seis eram a mesma silhueta trocando de cor, e o aluno precisava deduzir o
  // material pelo texto ao lado.
  const agua = { className: 'dm-agua', fill: `url(#dm-agua-${kind})` };
  const seta = `url(#dm-ponta-r-${kind})`;
  return (
    <svg viewBox="0 0 120 70" className="dam-mini" aria-hidden="true">
      {/* O id leva o tipo no nome porque as seis miniaturas coexistem na mesma
          pagina. Com id fixo, os seis cards declaravam "dm-ponta" e o documento
          ficava com seis elementos de mesmo id: invalido, e leitor de tela e
          `getElementById` passam a resolver sempre o primeiro. O portao de
          acessibilidade pegou exatamente isso. */}
      <defs>
        <linearGradient id={`dm-ceu-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6ea9d6" /><stop offset="1" stopColor="#c6dce3" />
        </linearGradient>
        <linearGradient id={`dm-agua-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ed0f2" /><stop offset="1" stopColor="#1c5f88" />
        </linearGradient>
        <linearGradient id={`dm-rocha-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6d5f4c" /><stop offset="1" stopColor="#2f2a22" />
        </linearGradient>
        <linearGradient id={`dm-conc-${kind}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#e0e3dc" /><stop offset="1" stopColor="#87908a" />
        </linearGradient>
        <linearGradient id={`dm-terra-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cbbb92" /><stop offset="1" stopColor="#8a7a55" />
        </linearGradient>
        <linearGradient id={`dm-enroc-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a2acb2" /><stop offset="1" stopColor="#556069" />
        </linearGradient>
        <marker id={`dm-ponta-${kind}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0 0 L5 2.5 L0 5 Z" fill="#eaf7ff" />
        </marker>
        <marker id={`dm-ponta-r-${kind}`} markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0 0 L5 2.5 L0 5 Z" fill="#ffd479" />
        </marker>
      </defs>

      {kind === 'arco' ? (
        <>
          {/* Planta: as duas paredes do vale, vistas de cima. O banho de agua
              cobria a largura inteira, entao o vale A JUSANTE lia como agua
              parada e a barragem parecia represar dos dois lados. Montante e
              agua; jusante e leito. */}
          <rect x="0" y="18" width="58" height="34" fill={`url(#dm-agua-${kind})`} opacity="0.4" />
          <rect x="58" y="18" width="62" height="34" fill="#7c6b52" opacity="0.55" />
          <path d="M62 26 Q86 34 118 30 M64 44 Q88 38 118 42" stroke="#9c8a6c" strokeWidth="1" fill="none" opacity="0.7" />
          <rect x="0" y="0" width="120" height="20" fill={`url(#dm-rocha-${kind})`} />
          <rect x="0" y="50" width="120" height="20" fill={`url(#dm-rocha-${kind})`} />
          <rect x="0" y="18" width="120" height="2.2" fill="#4c7a56" />
          <rect x="0" y="50" width="120" height="2.2" fill="#4c7a56" />
        </>
      ) : (
        <>
          <rect width="120" height="52" fill={`url(#dm-ceu-${kind})`} />
          <path d="M0 42 L26 34 L52 43 L78 32 L104 43 L120 36 L120 52 L0 52 Z" fill="#7d9d84" opacity="0.45" />
          <rect x="0" y="52" width="120" height="18" fill={`url(#dm-rocha-${kind})`} />
          <rect x="0" y="52" width="120" height="2.4" fill="#4c7a56" />
        </>
      )}

      {/* Empuxo da agua contra a estrutura: a mesma forca em todos os tipos, e o
          desenho ao lado mostra o que cada um faz com ela. */}
      <path className="dm-empuxo" d={kind === 'arco' ? 'M30 35 L52 35' : 'M30 41 L52 41'}
            stroke="#eaf7ff" strokeWidth="2"
            strokeLinecap="round" markerEnd={`url(#dm-ponta-${kind})`} />

      {/* A REACAO de cada tipo, em contrafase com o empuxo.
          O empuxo e o mesmo nos seis desenhos, de proposito: a forca da agua
          nao muda. O que muda e o caminho que cada estrutura da a ela, e era
          exatamente isso que faltava. A tabela ao lado diz "resiste pelo peso
          proprio", "transfere a carga as ombreiras" e "laje apoiada em
          contrafortes", e nos seis desenhos nada respondia ao empuxo. */}
      {kind === 'peso-proprio' && <>
        <rect x="2" y="30" width="54" height="22" {...agua} />
        <rect x="2" y="30" width="54" height="2" fill="#dff2ff" opacity="0.5" />
        <path d="M56 52 L56 20 L78 52 Z" fill={`url(#dm-conc-${kind})`} stroke="#5f6a63" strokeWidth="1" />
        <path d="M54 18 L60 18 L60 23 L54 23 Z" fill="#eef1eb" stroke="#5f6a63" strokeWidth="0.8" />
        <path d="M61 30 L61 52 M66 38 L66 52 M71 45 L71 52" stroke="#9aa39c" strokeWidth="0.7" opacity="0.8" />
        {/* Peso proprio: a reacao desce, para a fundacao. */}
        <path className="dm-reacao" d="M64 30 L64 48" stroke="#ffd479" strokeWidth="2"
              strokeLinecap="round" markerEnd={seta} />
      </>}
      {kind === 'arco' && <>
        <rect x="2" y="20" width="54" height="30" {...agua} />
        {/* Em planta: a casca curva empurra as duas paredes do vale. Antes era
            um traco curvo sem espessura e sem apoio nas pontas, e a palavra
            ombreira nao tinha a que se referir no desenho. */}
        <path d="M56 20 Q74 35 56 50 L62 50 Q80 35 62 20 Z" fill={`url(#dm-conc-${kind})`}
              stroke="#5f6a63" strokeWidth="1" />
        <path d="M54 16 L64 16 L64 22 L54 22 Z" fill="#8d7f66" />
        <path d="M54 54 L64 54 L64 48 L54 48 Z" fill="#8d7f66" />
        {/* Arco: a carga sai pelas ombreiras, para os lados. */}
        <path className="dm-reacao" d="M63 29 L70 20" stroke="#ffd479" strokeWidth="2"
              strokeLinecap="round" markerEnd={seta} />
        <path className="dm-reacao" d="M63 41 L70 50" stroke="#ffd479" strokeWidth="2"
              strokeLinecap="round" markerEnd={seta} />
      </>}
      {kind === 'contraforte' && <>
        <rect x="2" y="30" width="54" height="22" {...agua} />
        <rect x="2" y="30" width="54" height="2" fill="#dff2ff" opacity="0.5" />
        {/* Laje inclinada apoiada em contrafortes: sao os contrafortes que
            fazem o tipo, e antes eram dois riscos finos sob um traco. */}
        <path d="M54 17 L60 16 L78 52 L70 52 Z" fill={`url(#dm-conc-${kind})`} stroke="#5f6a63" strokeWidth="1" />
        <path d="M62 52 L69 34 L72 34 L68 52 Z" fill="#9aa39c" stroke="#5f6a63" strokeWidth="0.7" />
        <path d="M72 52 L75 42 L78 42 L77 52 Z" fill="#9aa39c" stroke="#5f6a63" strokeWidth="0.7" />
        {/* Contraforte: a laje entrega a carga aos contrafortes, na diagonal. */}
        <path className="dm-reacao" d="M62 32 L71 49" stroke="#ffd479" strokeWidth="2"
              strokeLinecap="round" markerEnd={seta} />
      </>}
      {kind === 'terra' && <>
        <rect x="2" y="34" width="48" height="18" {...agua} />
        <rect x="2" y="34" width="48" height="2" fill="#dff2ff" opacity="0.5" />
        <path d="M48 52 L62 24 L70 24 L88 52 Z" fill={`url(#dm-terra-${kind})`} stroke="#7a6a45" strokeWidth="1" />
        {/* Nucleo impermeavel: e ele que segura a agua, e o macico ao redor so
            da peso e estabilidade. */}
        <path d="M63 24 L69 24 L74 52 L60 52 Z" fill="#6b5c3a" opacity="0.92" />
        <g fill="#a89868" opacity="0.5">
          <circle cx="55" cy="44" r="1.4" /><circle cx="58" cy="36" r="1.1" />
          <circle cx="79" cy="45" r="1.4" /><circle cx="76" cy="38" r="1.1" />
        </g>
        {/* Macico: a reacao e o peso do proprio aterro, espalhado na base. */}
        <path className="dm-reacao" d="M66 32 L66 49" stroke="#ffd479" strokeWidth="2"
              strokeLinecap="round" markerEnd={seta} />
      </>}
      {kind === 'enrocamento' && <>
        <rect x="2" y="34" width="48" height="18" {...agua} />
        <rect x="2" y="34" width="48" height="2" fill="#dff2ff" opacity="0.5" />
        <path d="M48 52 L62 24 L70 24 L88 52 Z" fill={`url(#dm-enroc-${kind})`} stroke="#4e5860" strokeWidth="1" />
        {/* Face de concreto a montante, que e o CFRD do texto ao lado. */}
        <path d="M48 52 L62 24 L65 24 L52 52 Z" fill="#dfe3dd" stroke="#5f6a63" strokeWidth="0.7" />
        <g fill="#7b858c" opacity="0.75">
          <path d="M68 34 l4 -3 l3 4 l-4 2 Z M74 42 l5 -3 l3 4 l-5 3 Z M66 44 l4 -3 l3 4 l-4 2 Z M78 48 l4 -3 l3 4 l-4 2 Z" />
        </g>
        <path className="dm-reacao" d="M68 34 L68 49" stroke="#ffd479" strokeWidth="2"
              strokeLinecap="round" markerEnd={seta} />
      </>}
      {kind === 'ccr' && <>
        <rect x="2" y="30" width="54" height="22" {...agua} />
        <rect x="2" y="30" width="54" height="2" fill="#dff2ff" opacity="0.5" />
        <path d="M56 52 L56 20 L78 52 Z" fill={`url(#dm-conc-${kind})`} stroke="#5f6a63" strokeWidth="1" />
        {/* Camadas de lancamento: e a assinatura do CCR, concreto seco
            compactado como aterro. A estatica e a mesma do peso proprio; o que
            distingue os dois desenhos e a camada. */}
        <g stroke="#8f988f" strokeWidth="0.8" opacity="0.95">
          <path d="M56 26 L60 26 M56 31 L63 31 M56 36 L67 36 M56 41 L70 41 M56 46 L74 46" />
        </g>
        <path d="M54 18 L60 18 L60 23 L54 23 Z" fill="#eef1eb" stroke="#5f6a63" strokeWidth="0.8" />
        <path className="dm-reacao" d="M63 30 L63 48" stroke="#ffd479" strokeWidth="2"
              strokeLinecap="round" markerEnd={seta} />
      </>}
    </svg>
  );
}

function DamExplorer() {
  const [selectedKind, setSelectedKind] = useState(BARRAGENS[0].svg);
  const motion = useHydroMotion();
  const selectedDam = BARRAGENS.find((dam) => dam.svg === selectedKind) || BARRAGENS[0];

  const handleTabKey = (event, index) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % BARRAGENS.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + BARRAGENS.length) % BARRAGENS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = BARRAGENS.length - 1;
    else return;
    event.preventDefault();
    setSelectedKind(BARRAGENS[nextIndex].svg);
    event.currentTarget.parentElement?.querySelectorAll('[role="tab"]')[nextIndex]?.focus();
  };

  return (
    <div className="dam-explorer">
      <HydroMotionControls
        id="hydro-barramentos"
        label="Tipos de barramento"
        motion={motion}
        activeDescription={`${selectedDam.nome}: acompanhe o empuxo da água e o caminho resistente da estrutura`}
      />
      <div className="dam-selector" role="tablist" aria-label="Escolha o tipo de barramento">
        {BARRAGENS.map((dam, index) => (
          <button
            key={dam.svg}
            id={`dam-tab-${dam.svg}`}
            type="button"
            role="tab"
            aria-selected={dam.svg === selectedKind}
            aria-controls="dam-selected-panel"
            tabIndex={dam.svg === selectedKind ? 0 : -1}
            className={dam.svg === selectedKind ? 'active' : ''}
            onClick={() => setSelectedKind(dam.svg)}
            onKeyDown={(event) => handleTabKey(event, index)}
          >
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            {dam.nome}
          </button>
        ))}
      </div>
      <article
        id="dam-selected-panel"
        className="dam-selected-panel"
        role="tabpanel"
        aria-labelledby={`dam-tab-${selectedDam.svg}`}
      >
        <figure
          ref={motion.stageRef}
          className="dam-stage hydro-motion-stage"
          data-playing={motion.active ? 'true' : 'false'}
          style={motion.style}
        >
          <DamMini kind={selectedDam.svg} />
          <span className="dam-stage-feature" aria-hidden="true">{selectedDam.destaque}</span>
          <figcaption>
            <strong>{selectedDam.nome}</strong>
            <span>{selectedDam.vista} ampliada, representação esquemática sem escala.</span>
          </figcaption>
        </figure>
        <div className="dam-facts" aria-live="polite">
          <div><small>Elemento identificado no desenho</small><strong>{selectedDam.destaque}</strong></div>
          <div><small>Como recebe a ação da água</small><strong>Empuxo a montante</strong></div>
          <div><small>Caminho resistente simplificado</small><strong>{selectedDam.resiste}</strong></div>
          <div><small>Condição típica de implantação</small><strong>{selectedDam.onde}</strong></div>
        </div>
        <div className="dam-force-legend" aria-label="Legenda das forças">
          <span><i className="dam-force-legend__water" /> Água a montante</span>
          <span><i className="dam-force-legend__thrust" /> Empuxo da água</span>
          <span><i className="dam-force-legend__reaction" /> Caminho resistente / peso</span>
        </div>
      </article>
    </div>
  );
}

// O segundo corte vetorial foi removido: o corte realista acima concentra
// agora a anatomia, a operação e a seleção de equipamentos.
export function PowerCalc() {
  const [q, setQ] = useState(120);
  const [h, setH] = useState(60);
  const [ef, setEf] = useState(90);
  const potKW = 9.81 * q * h * (ef / 100);
  const potMW = potKW / 1000;
  const faixaDidatica = faixaDidaticaPorPotencia(potMW);
  const turbinasPorQueda = turbinasCompativeisPorQueda(h);
  return (
    <div className="power-calc">
      <div className="pc-formula"><Zap /> <span>P = ρ · g · Q · H · η</span> <small>densidade × constante física g × vazão turbinada × queda líquida × rendimento global</small></div>
      <div className="pc-controls">
        <label>Vazão turbinada, Q <b>{q} m³/s</b><input type="range" min="1" max="1500" value={q} aria-valuetext={`${q} metros cúbicos por segundo`} onChange={(e) => setQ(+e.target.value)} /></label>
        <label>Queda líquida, H <b>{h} m</b><input type="range" min="2" max="800" value={h} aria-valuetext={`${h} metros`} onChange={(e) => setH(+e.target.value)} /></label>
        <label>Rendimento, η <b>{ef}%</b><input type="range" min="70" max="95" value={ef} aria-valuetext={`${ef} por cento`} onChange={(e) => setEf(+e.target.value)} /></label>
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

const TURBINE_BANDS = Object.freeze([
  { nome: 'Bulbo', min: 2, max: 15, sample: 10 },
  { nome: 'Kaplan', min: 10, max: 70, sample: 40 },
  { nome: 'Francis', min: 30, max: 400, sample: 120 },
  { nome: 'Pelton', min: 250, max: 800, sample: 400 },
]);

function TurbinePicker({ selectedType, onSelectType }) {
  const [h, setH] = useState(60);
  const compativeis = turbinasCompativeisPorQueda(h);
  const selectedName = TURBINE_BANDS.find((band) => band.nome.toLowerCase() === selectedType)?.nome || 'Francis';

  const updateHeight = (value) => {
    const nextHeight = Number(value);
    const nextCompatible = turbinasCompativeisPorQueda(nextHeight);
    setH(nextHeight);
    if (!nextCompatible.includes(selectedName) && nextCompatible[0]) {
      onSelectType(nextCompatible[0].toLowerCase());
    }
  };

  return (
    <div className="turb-picker">
      <label className="tp-slider">Arraste a queda de projeto, H <b>{h} m</b>
        <input type="range" min="2" max="800" value={h} aria-valuetext={`${h} metros`} onChange={(e) => updateHeight(e.target.value)} />
      </label>
      <div className="tp-scale" aria-label="Faixas ilustradas e turbina mostrada">
        {TURBINE_BANDS.map((band) => (
          <button
            key={band.nome}
            type="button"
            className={'tp-band' + (compativeis.includes(band.nome) ? ' rec' : '') + (selectedName === band.nome ? ' selected' : '')}
            aria-pressed={selectedName === band.nome}
            onClick={() => {
              setH(band.sample);
              onSelectType(band.nome.toLowerCase());
            }}
          >
            <span className="tp-name">{band.nome}</span>
            <span className="tp-range">{band.min} a {band.max} m</span>
          </button>
        ))}
      </div>
      <div className="tp-rec">
        <Info /> Para {h} m, as faixas compatíveis por queda são{' '}
        <strong>{compativeis.length ? compativeis.join(' e ') : 'nenhuma das faixas ilustradas'}</strong>.
        Esta triagem não usa vazão nem substitui o dimensionamento da máquina.
      </div>
      <p className="tp-selection" role="status">Ilustração ampliada: <strong>{selectedName}</strong>.</p>
    </div>
  );
}

export default function HydroGuide({ go }) {
  const [turbineType, setTurbineType] = useState('francis');
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
        className="hydro-hero hydro-hero--cutaway hydro-section hydro-section--intro"
        id="hydro-principio"
        tabIndex="-1"
        data-hydro-section
      >
        <HydroelectricCutaway />
        <div className="hydro-hero-copy">
          <h2>O princípio: converter altura em energia</h2>
          <p>Uma hidrelétrica transforma a <strong>energia potencial</strong> da água represada em <strong>energia cinética</strong> ao descer pelo conduto, depois em <strong>energia mecânica</strong> ao girar a turbina e, por fim, em <strong>energia elétrica</strong> no gerador.</p>
          <div className="energy-chain">
            {['Potencial', 'Cinética', 'Mecânica', 'Elétrica'].map((e, i) => (
              <React.Fragment key={e}><span>{e}</span>{i < 3 && <ArrowRight />}</React.Fragment>
            ))}
          </div>
          <p className="hydro-two">A potência hidráulica estimada segue <strong>P = ρ · g · Q · H · η</strong>: vazão turbinada (Q), queda líquida disponível após as perdas (H), densidade da água (ρ), constante física g, correspondente à aceleração local, e rendimento global do conjunto (η). O valor de projeto depende das condições e curvas de operação.</p>
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
        <DamExplorer />
      </section>

      <section className="hydro-block hydro-section hydro-long-section" id="hydro-turbinas" tabIndex="-1" data-hydro-section>
        <div className="section-title"><div><h2>Turbinas: faixas de aplicação</h2><p>O projeto cruza queda e vazão; o seletor abaixo destaca somente as faixas de queda e explicita essa limitação.</p></div><Wind /></div>
        <TurbinePicker selectedType={turbineType} onSelectType={setTurbineType} />
        <TurbineGallery selectedType={turbineType} onSelectType={setTurbineType} />
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
