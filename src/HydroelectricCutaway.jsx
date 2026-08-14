import React, { useEffect, useMemo, useState } from 'react';
import { Pause, Play, Waves, Zap } from 'lucide-react';
// Mantém este estilo pesado no chunk sob demanda de Hidrelétricas. Importá-lo
// como folha global faria todas as outras rotas pagarem pelo corte técnico.
import CUTAWAY_STYLES from './hydroelectricCutaway.css?raw';

const BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

export const CUTAWAY_STAGES = Object.freeze([
  {
    id: 'captacao',
    label: 'Captação',
    component: 'Reservatório e tomada d’água',
    description: 'A água alcança a tomada protegida por grades. As comportas permitem isolar o circuito para inspeção e manutenção.',
    x: 20,
    y: 33,
    labelPosition: 'right',
  },
  {
    id: 'aducao',
    label: 'Adução',
    component: 'Conduto forçado',
    description: 'O conduto leva a água sob pressão até a unidade geradora. O traçado e as perdas hidráulicas influenciam a energia disponível.',
    x: 36,
    y: 57,
    labelPosition: 'left',
  },
  {
    id: 'turbina',
    label: 'Rotação',
    component: 'Turbina',
    description: 'O escoamento transfere energia ao rotor da turbina. A seleção da máquina depende, entre outros fatores, da queda e da faixa de vazões.',
    x: 53.5,
    y: 81,
    labelPosition: 'left-up',
  },
  {
    id: 'eixo',
    label: 'Transmissão mecânica',
    component: 'Eixo',
    description: 'O eixo transmite a rotação da turbina ao rotor do gerador, mantendo os dois equipamentos mecanicamente acoplados.',
    x: 53.5,
    y: 62,
    labelPosition: 'right',
  },
  {
    id: 'gerador',
    label: 'Geração',
    component: 'Gerador',
    description: 'A rotação do conjunto produz energia elétrica no gerador por indução eletromagnética.',
    x: 53.5,
    y: 39,
    labelPosition: 'left',
  },
  {
    id: 'transformacao',
    label: 'Transformação',
    component: 'Transformador',
    description: 'O transformador adequa a tensão elétrica às condições definidas para a conexão do empreendimento.',
    x: 75,
    y: 38,
    labelPosition: 'right',
  },
  {
    id: 'rede',
    label: 'Conexão',
    component: 'Subestação e rede',
    description: 'Equipamentos de manobra e proteção conduzem a energia ao ponto de conexão, em rede de distribuição ou transmissão conforme o acesso definido para o empreendimento.',
    x: 88,
    y: 16,
    labelPosition: 'left-down',
  },
  {
    id: 'restituicao',
    label: 'Restituição',
    component: 'Tubo de sucção e canal de fuga',
    description: 'Depois de atravessar a turbina, a água segue pelo tubo de sucção e retorna ao rio a jusante.',
    x: 74,
    y: 87,
    labelPosition: 'left-up',
  },
]);

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener?.('change', update);
    return () => query.removeEventListener?.('change', update);
  }, []);

  return reduced;
}

function SystemOverlay({ activeId }) {
  const waterActive = ['captacao', 'aducao', 'turbina', 'restituicao'].includes(activeId);
  const machineActive = ['turbina', 'eixo', 'gerador'].includes(activeId);
  const electricityActive = ['gerador', 'transformacao', 'rede'].includes(activeId);

  return (
    <svg className="hec-overlay" viewBox="0 0 1600 900" aria-hidden="true">
      <defs>
        <filter id="hec-water-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="hec-energy-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="hec-rotor-glow">
          <stop offset="0" stopColor="#d9fff5" stopOpacity=".95" />
          <stop offset=".5" stopColor="#56e2b0" stopOpacity=".52" />
          <stop offset="1" stopColor="#56e2b0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className={`hec-water-system${waterActive ? ' is-active' : ''}`}>
        <path className="hec-water-aura" d="M322 315 C405 318 448 355 487 433 C548 556 629 703 797 750" />
        <path className="hec-water-flow" d="M322 315 C405 318 448 355 487 433 C548 556 629 703 797 750" />
        <path className="hec-tailrace-aura" d="M850 787 C934 852 1085 829 1328 774" />
        <path className="hec-tailrace-flow" d="M850 787 C934 852 1085 829 1328 774" />
      </g>

      <g className={`hec-machine-system${machineActive ? ' is-active' : ''}`}>
        <path className="hec-shaft-light" d="M855 362 L855 696" />
        <g className="hec-runner" style={{ transformOrigin: '855px 733px' }}>
          <circle cx="855" cy="733" r="48" fill="url(#hec-rotor-glow)" />
          <circle cx="855" cy="733" r="27" className="hec-runner-ring" />
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <path
              key={angle}
              d="M855 706 C872 711 879 720 882 733 C869 726 859 727 855 733 Z"
              className="hec-runner-blade"
              transform={`rotate(${angle} 855 733)`}
            />
          ))}
        </g>
        <g className="hec-generator-field">
          <ellipse cx="855" cy="365" rx="65" ry="25" />
          <ellipse cx="855" cy="365" rx="88" ry="35" />
        </g>
      </g>

      <g className={`hec-electric-system${electricityActive ? ' is-active' : ''}`}>
        <path className="hec-energy-aura" d="M925 357 C1017 347 1064 338 1130 336 C1260 330 1337 234 1410 125" />
        <path className="hec-energy-flow" d="M925 357 C1017 347 1064 338 1130 336 C1260 330 1337 234 1410 125" />
        <g className="hec-transformer-pulse">
          <path d="M1160 312 q20 -20 40 0 t40 0" />
          <path d="M1154 325 q24 -25 48 0 t48 0" />
        </g>
      </g>
    </svg>
  );
}

export default function HydroelectricCutaway() {
  const reducedMotion = useReducedMotion();
  const [activeId, setActiveId] = useState(CUTAWAY_STAGES[0].id);
  const [playing, setPlaying] = useState(true);
  const [flow, setFlow] = useState(72);
  const activeIndex = CUTAWAY_STAGES.findIndex((stage) => stage.id === activeId);
  const activeStage = useMemo(
    () => CUTAWAY_STAGES[activeIndex] || CUTAWAY_STAGES[0],
    [activeIndex],
  );

  useEffect(() => {
    if (reducedMotion) setPlaying(false);
  }, [reducedMotion]);

  useEffect(() => {
    if (!playing || reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      setActiveId((currentId) => {
        const current = CUTAWAY_STAGES.findIndex((stage) => stage.id === currentId);
        return CUTAWAY_STAGES[(current + 1) % CUTAWAY_STAGES.length].id;
      });
    }, 3200);
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);

  const selectStage = (id) => {
    setActiveId(id);
    setPlaying(false);
  };

  const handleTabKeyDown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...event.currentTarget.querySelectorAll('[role="tab"]')];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    let next = current;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (event.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    if (event.key === 'ArrowRight') next = (current + 1) % tabs.length;
    tabs[next].focus();
    selectStage(tabs[next].dataset.stageId);
  };

  const flowDuration = Math.max(0.75, 2.45 - (flow * 0.016));
  const visualStyle = {
    '--hec-flow-duration': `${flowDuration}s`,
    '--hec-flow-strength': `${0.36 + (flow / 160)}`,
  };

  return (
    <figure
      className="hec-shell"
      style={visualStyle}
      data-playing={playing && !reducedMotion ? 'true' : 'false'}
      aria-labelledby="hec-title"
      aria-describedby="hec-description"
    >
      <style>{CUTAWAY_STYLES}</style>
      <header className="hec-toolbar">
        <div className="hec-heading">
          <span aria-hidden="true"><Waves /></span>
          <div>
            <h2 id="hec-title">Usina hidrelétrica em operação</h2>
            <p>Explore o caminho da água e da energia no corte técnico.</p>
          </div>
        </div>
        <div className="hec-controls">
          <label className="hec-flow-control">
            <span>Fluxo visual <strong>{flow}%</strong></span>
            <input
              type="range"
              min="35"
              max="100"
              value={flow}
              onChange={(event) => setFlow(Number(event.target.value))}
              aria-describedby="hec-flow-note"
            />
          </label>
          <button
            type="button"
            className="hec-play"
            onClick={() => setPlaying((current) => !current)}
            disabled={reducedMotion}
            aria-pressed={playing && !reducedMotion}
            aria-label={playing && !reducedMotion ? 'Pausar animação' : 'Reproduzir animação'}
          >
            {playing && !reducedMotion ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            <span>{playing && !reducedMotion ? 'Pausar' : 'Reproduzir'}</span>
          </button>
        </div>
      </header>

      <p id="hec-description" className="hec-visually-hidden">
        Corte de uma usina: a água sai do reservatório, atravessa a tomada e o conduto forçado,
        movimenta a turbina e o eixo, aciona o gerador, retorna ao rio e a energia segue pelo
        transformador até o ponto de conexão em rede de distribuição ou transmissão.
      </p>

      <div className="hec-scene" data-stage={activeId}>
        <img
          src={`${BASE_URL}/hidro/usina-corte-realista.webp`}
          alt=""
          width="1600"
          height="900"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <SystemOverlay activeId={activeId} />
        <div className="hec-hotspots" aria-label="Componentes da usina">
          {CUTAWAY_STAGES.map((stage, index) => (
            <button
              key={stage.id}
              type="button"
              className={`hec-hotspot hec-hotspot--${stage.labelPosition}`}
              style={{ '--hec-x': `${stage.x}%`, '--hec-y': `${stage.y}%` }}
              aria-label={`${index + 1}. ${stage.component}`}
              aria-pressed={stage.id === activeId}
              onClick={() => selectStage(stage.id)}
            >
              <span className="hec-hotspot__marker" aria-hidden="true">{index + 1}</span>
              <span className="hec-hotspot__label" aria-hidden="true">{stage.component}</span>
            </button>
          ))}
        </div>
        <div className="hec-conversion" aria-hidden="true">
          <span><Waves /> água</span><i /><span>rotação</span><i /><span><Zap /> energia</span>
        </div>
      </div>

      <div className="hec-tour">
        <div
          className="hec-tabs"
          role="tablist"
          aria-label="Etapas da geração"
          onKeyDown={handleTabKeyDown}
        >
          {CUTAWAY_STAGES.map((stage, index) => (
            <button
              key={stage.id}
              type="button"
              role="tab"
              id={`hec-tab-${stage.id}`}
              aria-selected={stage.id === activeId}
              aria-controls="hec-stage-panel"
              tabIndex={stage.id === activeId ? 0 : -1}
              data-stage-id={stage.id}
              onClick={() => selectStage(stage.id)}
            >
              <span>{index + 1}</span>{stage.label}
            </button>
          ))}
        </div>
        <div
          id="hec-stage-panel"
          className="hec-stage-panel"
          role="tabpanel"
          aria-labelledby={`hec-tab-${activeStage.id}`}
          tabIndex="0"
        >
          <span>{String(activeIndex + 1).padStart(2, '0')}</span>
          <div>
            <strong>{activeStage.component}</strong>
            <p>{activeStage.description}</p>
          </div>
        </div>
        <small id="hec-flow-note" className="hec-note">
          Representação didática, sem escala e sem vínculo com empreendimento específico. O controle altera
          somente a velocidade da animação; não representa vazão ou desempenho de projeto.
        </small>
      </div>
    </figure>
  );
}
