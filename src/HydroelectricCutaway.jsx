import React, { useEffect, useId, useRef, useState } from 'react';
import { Pause, Play, Waves, Zap } from 'lucide-react';
// Mantém este estilo pesado no chunk sob demanda de Hidrelétricas. Importá-lo
// como folha global faria todas as outras rotas pagarem pelo corte técnico.
import CUTAWAY_STYLES from './hydroelectricCutaway.css?raw';

const BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
const WATER_PATH = 'M322 315 C405 318 448 355 487 433 C548 556 629 703 797 750';
const TAILRACE_PATH = 'M850 787 C934 852 1085 829 1328 774';
const ENERGY_PATH = 'M925 357 C1017 347 1064 338 1130 336 C1260 330 1337 234 1410 125';

export const CUTAWAY_STAGES = Object.freeze([
  {
    id: 'captacao',
    label: 'Captação',
    component: 'Reservatório e tomada d’água',
    description: 'A água alcança a tomada protegida por grades. As comportas permitem isolar o circuito para inspeção e manutenção.',
    x: 20,
    y: 33,
    labelX: 10.5,
    labelY: 23,
    focusEquipmentId: 'tomada',
  },
  {
    id: 'aducao',
    label: 'Adução',
    component: 'Conduto forçado',
    description: 'O conduto leva a água sob pressão até a unidade geradora. O traçado e as perdas hidráulicas influenciam a energia disponível.',
    x: 36,
    y: 57,
    labelX: 23,
    labelY: 55,
    focusEquipmentId: 'conduto',
  },
  {
    id: 'turbina',
    label: 'Rotação',
    component: 'Turbina',
    description: 'O escoamento transfere energia ao rotor da turbina. A seleção da máquina depende, entre outros fatores, da queda e da faixa de vazões.',
    x: 53.5,
    y: 81,
    labelX: 42.5,
    labelY: 87,
    focusEquipmentId: 'turbina',
  },
  {
    id: 'eixo',
    label: 'Transmissão mecânica',
    component: 'Eixo',
    description: 'O eixo transmite a rotação da turbina ao rotor do gerador, mantendo os dois equipamentos mecanicamente acoplados.',
    x: 53.5,
    y: 62,
    labelX: 64,
    labelY: 61,
    focusEquipmentId: 'eixo',
  },
  {
    id: 'gerador',
    label: 'Geração',
    component: 'Gerador',
    description: 'A rotação do conjunto produz energia elétrica no gerador por indução eletromagnética.',
    x: 53.5,
    y: 39,
    labelX: 43,
    labelY: 31,
    focusEquipmentId: 'gerador',
  },
  {
    id: 'transformacao',
    label: 'Transformação',
    component: 'Transformador',
    description: 'O transformador adequa a tensão elétrica às condições definidas para a conexão do empreendimento.',
    x: 75,
    y: 38,
    labelX: 83,
    labelY: 48,
    focusEquipmentId: 'transformador',
  },
  {
    id: 'rede',
    label: 'Conexão',
    component: 'Subestação e linhas',
    description: 'Equipamentos de manobra e proteção conduzem a energia ao ponto de conexão, em rede de distribuição ou transmissão conforme o acesso definido para o empreendimento.',
    x: 88,
    y: 16,
    labelX: 78.5,
    labelY: 13,
    focusEquipmentId: 'subestacao',
  },
  {
    id: 'restituicao',
    label: 'Restituição',
    component: 'Canal de fuga',
    description: 'Depois de atravessar a turbina, a água segue pelo tubo de sucção e retorna ao rio a jusante pelo canal de fuga.',
    x: 74,
    y: 87,
    labelX: 82,
    labelY: 85,
    focusEquipmentId: 'canal-fuga',
  },
]);

export const CUTAWAY_EQUIPMENT = Object.freeze([
  {
    id: 'reservatorio', name: 'Reservatório a montante', stageId: 'captacao', x: 8, y: 29, labelX: 7, labelY: 15,
    description: 'Armazena água a montante e mantém o desnível que fornece energia potencial ao aproveitamento.',
  },
  {
    id: 'barragem', name: 'Barragem', stageId: 'captacao', x: 30, y: 32, labelX: 30, labelY: 16,
    description: 'Barra o curso d’água, eleva o nível a montante e contribui para formar a queda aproveitada pela usina.',
  },
  {
    id: 'vertedouro', name: 'Vertedouro (via de cheia)', stageId: 'captacao', x: 34, y: 36, labelX: 38, labelY: 45,
    description: 'Conduz com segurança a água excedente das cheias sem passar pela turbina e ajuda a evitar o galgamento da barragem.',
  },
  {
    id: 'grade', name: 'Grade de proteção', stageId: 'captacao', x: 18.5, y: 26, labelX: 8.5, labelY: 30,
    description: 'Retém detritos antes da tomada e protege o circuito hidráulico e a turbina.',
  },
  {
    id: 'comporta', name: 'Comporta', stageId: 'captacao', x: 20, y: 30.5, labelX: 9.5, labelY: 38,
    description: 'Controla a passagem e permite isolar a tomada e o conduto para inspeção ou manutenção.',
  },
  {
    id: 'tomada', name: 'Tomada d’água', stageId: 'captacao', x: 20.5, y: 35, labelX: 11.5, labelY: 46,
    description: 'Capta a água do reservatório e a direciona para o circuito de adução.',
  },
  {
    id: 'conduto', name: 'Conduto forçado', stageId: 'aducao', x: 36, y: 58, labelX: 23, labelY: 58,
    description: 'Conduz a água sob pressão até a turbina; seu traçado e suas perdas influenciam a queda líquida disponível.',
  },
  {
    id: 'casa-forca', name: 'Casa de força', stageId: 'gerador', x: 47, y: 27, labelX: 42, labelY: 19,
    description: 'Abriga as unidades geradoras, os sistemas auxiliares e os espaços necessários à operação e à manutenção.',
  },
  {
    id: 'ponte-rolante', name: 'Ponte rolante', stageId: 'gerador', x: 55, y: 22, labelX: 63, labelY: 18,
    description: 'Movimenta componentes pesados da unidade geradora durante montagem, inspeção e manutenção.',
  },
  {
    id: 'gerador', name: 'Gerador', stageId: 'gerador', x: 53.5, y: 39, labelX: 43, labelY: 35,
    description: 'Converte a rotação transmitida pelo eixo em energia elétrica por indução eletromagnética.',
  },
  {
    id: 'eixo', name: 'Eixo', stageId: 'eixo', x: 53.5, y: 62, labelX: 64, labelY: 59,
    description: 'Acopla mecanicamente turbina e gerador e transmite o torque entre os dois equipamentos.',
  },
  {
    id: 'turbina', name: 'Turbina / rotor', stageId: 'turbina', x: 53.5, y: 78, labelX: 43, labelY: 82,
    description: 'Recebe a energia do escoamento e a transforma em rotação mecânica.',
  },
  {
    id: 'tubo-succao', name: 'Tubo de sucção', stageId: 'restituicao', x: 55, y: 87, labelX: 63, labelY: 91,
    description: 'Conduz a água que deixa a turbina, recupera parte da energia do escoamento e amplia a seção até a restituição.',
  },
  {
    id: 'canal-fuga', name: 'Canal de fuga', stageId: 'restituicao', x: 70, y: 87, labelX: 81, labelY: 85,
    description: 'Devolve ao rio, a jusante, a água que atravessou a unidade geradora.',
  },
  {
    id: 'transformador', name: 'Transformador', stageId: 'transformacao', x: 75, y: 40, labelX: 83, labelY: 48,
    description: 'Adequa a tensão produzida pelo gerador às condições definidas para a conexão elétrica.',
  },
  {
    id: 'subestacao', name: 'Subestação', stageId: 'rede', x: 77, y: 29, labelX: 86.5, labelY: 34,
    description: 'Reúne equipamentos de manobra, proteção e medição que encaminham a energia ao ponto de conexão.',
  },
  {
    id: 'linhas', name: 'Linhas de transmissão', stageId: 'rede', x: 88, y: 14, labelX: 82.5, labelY: 11,
    description: 'Transportam a energia da subestação até a rede de distribuição ou transmissão definida para o empreendimento.',
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

function useSceneVisibility(sceneRef) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof IntersectionObserver !== 'function' || !sceneRef.current) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '120px 0px', threshold: 0.05 },
    );
    observer.observe(sceneRef.current);
    return () => observer.disconnect();
  }, [sceneRef]);

  return visible;
}

function SystemOverlay({ activeId, focusPoint, idPrefix }) {
  const waterActive = ['captacao', 'aducao', 'turbina', 'restituicao'].includes(activeId);
  const machineActive = ['turbina', 'eixo', 'gerador'].includes(activeId);
  const electricityActive = ['gerador', 'transformacao', 'rede'].includes(activeId);
  const waterGlowId = `${idPrefix}-water-glow`;
  const energyGlowId = `${idPrefix}-energy-glow`;
  const rotorGlowId = `${idPrefix}-rotor-glow`;

  return (
    <svg className="hec-overlay" viewBox="0 0 1600 900" aria-hidden="true">
      <defs>
        <filter id={waterGlowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={energyGlowId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id={rotorGlowId}>
          <stop offset="0" stopColor="#d9fff5" stopOpacity=".95" />
          <stop offset=".5" stopColor="#56e2b0" stopOpacity=".52" />
          <stop offset="1" stopColor="#56e2b0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g
        className={`hec-water-system${waterActive ? ' is-active' : ''}`}
        data-motion-layer="agua"
      >
        <g className="hec-reservoir-motion">
          <path d="M36 281 Q100 264 164 281 T292 281" />
          <path d="M55 302 Q115 286 175 302 T295 302" />
          <path d="M82 323 Q132 310 182 323 T282 323" />
        </g>
        <path className="hec-water-aura" d={WATER_PATH} style={{ filter: `url(#${waterGlowId})` }} />
        <path className="hec-water-flow" d={WATER_PATH} style={{ filter: `url(#${waterGlowId})` }} />
        <path className="hec-water-packets" d={WATER_PATH} style={{ filter: `url(#${waterGlowId})` }} />
        <path className="hec-tailrace-aura" d={TAILRACE_PATH} style={{ filter: `url(#${waterGlowId})` }} />
        <path className="hec-tailrace-flow" d={TAILRACE_PATH} style={{ filter: `url(#${waterGlowId})` }} />
        <path className="hec-tailrace-packets" d={TAILRACE_PATH} style={{ filter: `url(#${waterGlowId})` }} />
      </g>

      <g className={`hec-machine-system${machineActive ? ' is-active' : ''}`}>
        <g data-motion-layer="eixo" className="hec-shaft-system">
          <path className="hec-shaft-light" d="M855 362 L855 696" style={{ filter: `url(#${waterGlowId})` }} />
          <path className="hec-shaft-helix" d="M840 414 Q855 398 870 414 T840 446 T870 478 T840 510 T870 542 T840 574 T870 606 T840 638 T870 670" />
          {[430, 500, 570, 640].map((cy) => (
            <ellipse key={cy} className="hec-shaft-coupling" cx="855" cy={cy} rx="20" ry="7" />
          ))}
        </g>
        <g data-motion-layer="turbina" className="hec-runner-wrap">
          <g className="hec-runner" style={{ transformOrigin: '855px 733px' }}>
            <circle cx="855" cy="733" r="52" fill={`url(#${rotorGlowId})`} />
            <circle cx="855" cy="733" r="29" className="hec-runner-ring" />
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <path
                key={angle}
                d="M855 703 C875 709 884 720 886 733 C871 726 860 727 855 733 Z"
                className="hec-runner-blade"
                transform={`rotate(${angle} 855 733)`}
              />
            ))}
          </g>
          <circle className="hec-runner-orbit" cx="855" cy="733" r="58" />
        </g>
        <g data-motion-layer="gerador" className="hec-generator-system">
          <g className="hec-generator-field" style={{ transformOrigin: '855px 365px' }}>
            <ellipse cx="855" cy="365" rx="63" ry="24" />
            <ellipse cx="855" cy="365" rx="86" ry="34" />
            <path d="M773 365 C796 327 914 327 937 365" />
            <path d="M773 365 C796 403 914 403 937 365" />
          </g>
          <circle className="hec-generator-core" cx="855" cy="365" r="24" />
        </g>
      </g>

      <g
        className={`hec-electric-system${electricityActive ? ' is-active' : ''}`}
        data-motion-layer="energia"
      >
        <path className="hec-energy-aura" d={ENERGY_PATH} style={{ filter: `url(#${energyGlowId})` }} />
        <path className="hec-energy-flow" d={ENERGY_PATH} style={{ filter: `url(#${energyGlowId})` }} />
        <path className="hec-energy-packets" d={ENERGY_PATH} style={{ filter: `url(#${energyGlowId})` }} />
        <g className="hec-transformer-pulse" style={{ filter: `url(#${energyGlowId})` }}>
          <path d="M1160 312 q20 -20 40 0 t40 0" />
          <path d="M1154 325 q24 -25 48 0 t48 0" />
        </g>
      </g>

      <g
        className="hec-stage-focus"
        data-focus-equipment={focusPoint.id}
        transform={`translate(${focusPoint.x * 16} ${focusPoint.y * 9})`}
      >
        <circle className="hec-stage-focus__pulse" r="43" />
        <circle className="hec-stage-focus__ring" r="22" />
        <path d="M-31 0 H-20 M20 0 H31 M0 -31 V-20 M0 20 V31" />
      </g>
    </svg>
  );
}

function LeaderOverlay({ activeId, selectedEquipmentId }) {
  return (
    <svg className="hec-leaders" viewBox="0 0 1600 900" aria-hidden="true">
      {CUTAWAY_EQUIPMENT.map((equipment) => (
        <g
          key={equipment.id}
          data-active={equipment.stageId === activeId ? 'true' : 'false'}
          data-selected={equipment.id === selectedEquipmentId ? 'true' : 'false'}
        >
          <line
            className="hec-leader"
            x1={equipment.x * 16}
            y1={equipment.y * 9}
            x2={equipment.labelX * 16}
            y2={equipment.labelY * 9}
            vectorEffect="non-scaling-stroke"
          />
          <circle className="hec-leader__anchor" cx={equipment.x * 16} cy={equipment.y * 9} r="7" />
          <circle className="hec-leader__core" cx={equipment.x * 16} cy={equipment.y * 9} r="3" />
        </g>
      ))}
    </svg>
  );
}

export default function HydroelectricCutaway() {
  const reducedMotion = useReducedMotion();
  const sceneRef = useRef(null);
  const isSceneVisible = useSceneVisibility(sceneRef);
  const idPrefix = `hec-${useId().replace(/:/g, '')}`;
  const titleId = `${idPrefix}-title`;
  const descriptionId = `${idPrefix}-description`;
  const layerDescriptionId = `${idPrefix}-layer-description`;
  const flowControlId = `${idPrefix}-flow-control`;
  const flowNoteId = `${idPrefix}-flow-note`;
  const stagePanelId = `${idPrefix}-stage-panel`;
  const equipmentDescriptionId = `${idPrefix}-equipment-description`;
  const stageDescriptionId = `${idPrefix}-stage-description`;
  const tabId = (stageId) => `${idPrefix}-tab-${stageId}`;
  const [selection, setSelection] = useState({
    stageId: CUTAWAY_STAGES[0].id,
    equipmentId: CUTAWAY_STAGES[0].focusEquipmentId,
  });
  const [playing, setPlaying] = useState(true);
  const [autoTour, setAutoTour] = useState(true);
  const [flow, setFlow] = useState(72);
  const activeId = selection.stageId;
  const selectedEquipmentId = selection.equipmentId;
  const activeIndex = CUTAWAY_STAGES.findIndex((stage) => stage.id === activeId);
  const activeStage = CUTAWAY_STAGES[activeIndex] || CUTAWAY_STAGES[0];
  const selectedEquipment = CUTAWAY_EQUIPMENT.find(({ id }) => id === selectedEquipmentId)
    || CUTAWAY_EQUIPMENT[0];
  const motionActive = playing && !reducedMotion && isSceneVisible;
  const tourActive = motionActive && autoTour;

  useEffect(() => {
    if (reducedMotion) setPlaying(false);
  }, [reducedMotion]);

  useEffect(() => {
    if (!tourActive) return undefined;
    const timer = window.setInterval(() => {
      setSelection((currentSelection) => {
        const current = CUTAWAY_STAGES.findIndex((stage) => stage.id === currentSelection.stageId);
        const nextStage = CUTAWAY_STAGES[(current + 1) % CUTAWAY_STAGES.length];
        return {
          stageId: nextStage.id,
          equipmentId: nextStage.focusEquipmentId,
        };
      });
    }, 3600);
    return () => window.clearInterval(timer);
  }, [tourActive]);

  const selectStage = (id) => {
    const stage = CUTAWAY_STAGES.find((candidate) => candidate.id === id) || CUTAWAY_STAGES[0];
    setSelection({
      stageId: stage.id,
      equipmentId: stage.focusEquipmentId,
    });
    setPlaying(false);
  };

  const selectEquipment = (equipment) => {
    setSelection({ stageId: equipment.stageId, equipmentId: equipment.id });
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

  const flowDuration = Math.max(0.72, 2.55 - (flow * 0.017));
  const visualStyle = {
    '--hec-flow-duration': `${flowDuration}s`,
    '--hec-machine-duration': `${Math.max(0.78, flowDuration * 0.92)}s`,
    '--hec-energy-duration': `${Math.max(0.6, flowDuration * 0.72)}s`,
    '--hec-flow-strength': `${0.42 + (flow / 150)}`,
  };
  const playbackLabel = reducedMotion
    ? 'Movimento reduzido ativo'
    : motionActive ? 'Animação em movimento' : 'Animação pausada';

  return (
    <figure
      className="hec-shell"
      style={visualStyle}
      data-playing={motionActive ? 'true' : 'false'}
      data-tour-active={tourActive ? 'true' : 'false'}
      data-motion-preference={reducedMotion ? 'reduced' : 'full'}
      aria-labelledby={titleId}
      aria-describedby={`${descriptionId} ${layerDescriptionId}`}
      onPointerDown={() => setAutoTour(false)}
      onFocusCapture={() => setAutoTour(false)}
    >
      <style>{CUTAWAY_STYLES}</style>
      <header className="hec-toolbar">
        <div className="hec-heading">
          <span aria-hidden="true"><Waves /></span>
          <div>
            <h2 id={titleId}>Funcionamento e anatomia de uma usina hidrelétrica</h2>
            <p>Acompanhe o percurso da água à rede e selecione cada equipamento para entender sua função no conjunto.</p>
          </div>
        </div>
        <div className="hec-controls">
          <label className="hec-flow-control" htmlFor={flowControlId}>
            <span>Velocidade do fluxo <strong>{flow}%</strong></span>
            <input
              id={flowControlId}
              type="range"
              min="35"
              max="100"
              value={flow}
              onChange={(event) => setFlow(Number(event.target.value))}
              aria-valuetext={`${flow}% da velocidade visual`}
              aria-describedby={flowNoteId}
            />
          </label>
          <button
            type="button"
            className="hec-play"
            onClick={() => {
              setAutoTour(true);
              setPlaying((current) => !current);
            }}
            disabled={reducedMotion}
            aria-pressed={motionActive}
            aria-label={motionActive ? 'Pausar animação didática' : 'Reproduzir animação didática'}
          >
            {motionActive ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            <span>{motionActive ? 'Pausar' : 'Reproduzir'}</span>
          </button>
        </div>
      </header>

      <p id={descriptionId} className="hec-visually-hidden">
        Corte interativo que reúne funcionamento e anatomia de uma usina: a água sai do reservatório,
        atravessa a tomada e o conduto forçado,
        movimenta a turbina e o eixo, aciona o gerador, retorna ao rio e a energia segue pelo
        transformador e pela subestação até o ponto de conexão em rede de distribuição ou transmissão.
      </p>

      <div className="hec-layer-status" id={layerDescriptionId}>
        <span><i className="hec-layer-status__static" aria-hidden="true" />Base ilustrada estática</span>
        <span><i className="hec-layer-status__motion" aria-hidden="true" />Água, turbina, eixo, gerador e energia animados</span>
      </div>

      <div className="hec-scene" data-stage={activeId} ref={sceneRef}>
        <img
          className="hec-static-base"
          data-visual-layer="base-estatica"
          src={`${BASE_URL}/hidro/usina-corte-realista.webp`}
          alt=""
          aria-hidden="true"
          width="1600"
          height="900"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <SystemOverlay activeId={activeId} focusPoint={selectedEquipment} idPrefix={idPrefix} />
        <LeaderOverlay activeId={activeId} selectedEquipmentId={selectedEquipmentId} />

        <div className="hec-playback-status" role="status" aria-live="polite">
          <i aria-hidden="true" />{playbackLabel}
        </div>

        <div className="hec-callouts" aria-label="Equipamentos identificados no corte técnico">
          {CUTAWAY_EQUIPMENT.map((equipment, index) => (
            <button
              key={equipment.id}
              type="button"
              className="hec-callout"
              style={{ '--hec-label-x': `${equipment.labelX}%`, '--hec-label-y': `${equipment.labelY}%` }}
              aria-label={`Localizar ${equipment.name}`}
              aria-pressed={equipment.id === selectedEquipmentId}
              aria-controls={stagePanelId}
              data-stage-active={equipment.stageId === activeId ? 'true' : 'false'}
              onClick={() => selectEquipment(equipment)}
            >
              <span className="hec-callout__number" aria-hidden="true">{index + 1}</span>
              <span className="hec-callout__label">{equipment.name}</span>
            </button>
          ))}
        </div>
        <div className="hec-conversion" aria-hidden="true">
          <span><Waves /> água</span><i /><span>rotação</span><i /><span><Zap /> energia</span>
        </div>
      </div>

      <nav className="hec-equipment-key" aria-label="Legenda dos equipamentos">
        <p>Equipamentos: toque para localizar</p>
        <ol>
          {CUTAWAY_EQUIPMENT.map((equipment, index) => (
            <li key={equipment.id}>
              <button
                type="button"
                aria-pressed={equipment.id === selectedEquipmentId}
                aria-controls={stagePanelId}
                data-stage-active={equipment.stageId === activeId ? 'true' : 'false'}
                onClick={() => selectEquipment(equipment)}
              >
                <span aria-hidden="true">{index + 1}</span>
                {equipment.name}
              </button>
            </li>
          ))}
        </ol>
      </nav>

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
              id={tabId(stage.id)}
              aria-selected={stage.id === activeId}
              aria-controls={stagePanelId}
              tabIndex={stage.id === activeId ? 0 : -1}
              data-stage-id={stage.id}
              onClick={() => selectStage(stage.id)}
            >
              <span>{index + 1}</span>{stage.label}
            </button>
          ))}
        </div>
        <div
          id={stagePanelId}
          className="hec-stage-panel"
          role="tabpanel"
          aria-labelledby={tabId(activeStage.id)}
          aria-describedby={`${equipmentDescriptionId} ${stageDescriptionId}`}
          aria-live={tourActive ? 'off' : 'polite'}
          aria-atomic="true"
          tabIndex="0"
        >
          <span>{String(activeIndex + 1).padStart(2, '0')}</span>
          <div>
            <strong>{selectedEquipment.name}</strong>
            <p id={equipmentDescriptionId}>{selectedEquipment.description}</p>
            <p id={stageDescriptionId}>
              <strong>Etapa {activeStage.label}: {activeStage.component}</strong>
              {activeStage.description}
            </p>
          </div>
          <i className="hec-stage-progress" aria-hidden="true"><b /></i>
        </div>
        <small id={flowNoteId} className="hec-note">
          Representação didática, sem escala e sem vínculo com empreendimento específico. O controle altera
          somente a velocidade visual das camadas; não representa vazão ou desempenho de projeto.
        </small>
      </div>
    </figure>
  );
}
