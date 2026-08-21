// Secao "Como funciona uma hidreletrica", guia tecnico visual e interativo.
// Modulo isolado (primeiro passo de quebra do main.jsx). Recebe apenas `go`.
import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Waves, Zap, Droplets, Factory, Mountain, Gauge, ArrowRight, Info,
  Layers3, Activity, CircleHelp, TowerControl, Wind, MapPin,
} from 'lucide-react';
import { TurbineGallery, PRCasesSection, ArrangementSchematics, LicensingPath } from './hydroCases';
import NormativeAuthorityAxes from './NormativeAuthorityAxes.jsx';
import HydroelectricCutaway from './HydroelectricCutaway.jsx';
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
    detalhe: 'Barra o curso d\'água, eleva o nível a montante e sustenta a pressão da água. Pode ser de concreto estabilizado pelo peso próprio, em arco ou com contrafortes, ou de aterro em terra ou enrocamento. É a estrutura de maior responsabilidade estrutural e alvo central da segurança de barragens.' },
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
    nota: 'No eixo ambiental do IAT: capacidade instalada superior a 30 MW, reservatório maior que 3 km² ou definição da ANEEL. O regime setorial distingue autorização e concessão por critérios próprios. O art. 10 da IN IAT nº 09/2025 enquadra a UHE entre as situações passíveis de EIA e RIMA e de audiência pública; o estudo e o rito aplicáveis devem ser confirmados no caso concreto. Erro recorrente: ignorar competência, delegação, processo federal ou o enquadramento ambiental vigente.' },
];

const TIPOS_RESERVATORIO = [
  { nome: 'Fio d\'água', icon: Waves, desc: 'Opera com pouca ou nenhuma regularização sazonal e geração mais dependente da vazão afluente. Pode envolver menor alagamento que uma alternativa de acumulação, mas isso não significa impacto automaticamente menor: avalie barramento, trecho de vazão reduzida, conectividade, sedimentos, fauna, usos da água e localização.' },
  { nome: 'Acumulação / regularização', icon: Droplets, desc: 'Armazena água para regularizar vazões entre períodos e ampliar a flexibilidade de geração. Pode ampliar alagamento, deplecionamento e deslocamentos, mas a natureza e a magnitude dos impactos dependem também da localização, do arranjo, da regra operativa e das medidas de controle.' },
  { nome: 'Reversível (bombeamento)', icon: Activity, desc: 'Bombeia água para um reservatório superior nas horas de baixa demanda e turbina nas horas de pico. Funciona como uma "bateria" hídrica de grande porte para o sistema.' },
];

const BARRAGENS = [
  { nome: 'Concreto estabilizado pelo peso próprio', resiste: 'Resiste pelo peso próprio', onde: 'Vales abertos, fundação rochosa', svg: 'peso-proprio' },
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

// Rotulos permanentes do corte, com linha-guia ate a peca.
//
// O desenho tinha nove pontos clicaveis e UM unico texto no SVG inteiro, o
// "H (queda)". Quem abria a pagina via um esquema bonito e nao sabia o que
// estava olhando ate clicar ponto por ponto. Descobrir o nome da peca nao pode
// ser a recompensa por acertar onde clicar.
//
// Coordenadas no espaco do viewBox, 900 por 470. `ancora` decide de que lado o
// texto cresce, para o rotulo nunca invadir a peca que ele nomeia. A pastilha
// escura atras do texto existe porque o corte tem fundo escuro no ceu e claro
// na agua: sem ela, um mesmo tom de texto falha em metade do desenho.
const ROTULOS_CORTE = [
  { id: 'reservatorio', texto: 'Reservatório', x: 16, y: 232, ancora: 'start', guia: [96, 240, 120, 286] },
  { id: 'barragem', texto: 'Barragem', x: 262, y: 214, ancora: 'end', guia: [232, 222, 268, 292] },
  { id: 'vertedouro', texto: 'Vertedouro', x: 360, y: 250, ancora: 'start', guia: [356, 244, 318, 300] },
  { id: 'tomada', texto: "Tomada d'água", x: 150, y: 392, ancora: 'end', guia: [156, 386, 234, 348] },
  { id: 'conduto', texto: 'Conduto forçado', x: 348, y: 350, ancora: 'start', guia: [344, 356, 396, 380] },
  { id: 'casa', texto: 'Casa de força', x: 600, y: 306, ancora: 'middle', guia: [600, 312, 600, 332] },
  { id: 'turbina', texto: 'Turbina e gerador', x: 585, y: 458, ancora: 'middle', guia: [585, 446, 585, 414] },
  { id: 'fuga', texto: 'Canal de fuga', x: 800, y: 386, ancora: 'middle', guia: [800, 392, 800, 406] },
  { id: 'subestacao', texto: 'Subestação', x: 716, y: 276, ancora: 'start', guia: [712, 282, 692, 302] },
];

function RotuloDoCorte({ item, ativo, onSelect }) {
  const largura = item.texto.length * 7.4 + 16;
  const x = item.ancora === 'end' ? item.x - largura : item.ancora === 'middle' ? item.x - largura / 2 : item.x;
  return (
    <g
      className={'cs-rotulo' + (ativo ? ' ativo' : '')}
      onClick={() => onSelect(item.id)}
    >
      <line x1={item.guia[0]} y1={item.guia[1]} x2={item.guia[2]} y2={item.guia[3]} />
      <rect x={x} y={item.y - 13} width={largura} height={19} rx={9} />
      <text x={item.x} y={item.y} textAnchor={item.ancora}>{item.texto}</text>
    </g>
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
      <svg viewBox="0 120 900 350" className="cross-svg" role="img"
           aria-label="Corte esquemático de uma usina hidrelétrica. A água represada no reservatório entra pela tomada d'água, desce pelo conduto forçado até a casa de força, gira a turbina acoplada ao gerador e é restituída ao rio pelo canal de fuga. A diferença entre o nível do reservatório e o nível do canal de fuga é a queda bruta. O vertedouro escoa o excedente sem passar pela turbina.">
        <defs>
          {/* O corte era noturno por herdar o fundo escuro da pagina, e isso
              custava caro: agua so parece agua quando ha ceu para ela
              refletir, e concreto so parece concreto quando ha luz vinda de
              algum lado. A cena passa a ser diurna, como a foto do topo, e
              fica emoldurada pelo cartao escuro do mesmo jeito. */}
          <linearGradient id="cs-ceu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6ea9d6" />
            <stop offset="0.5" stopColor="#a6cbe1" />
            <stop offset="1" stopColor="#cadfd9" />
          </linearGradient>
          {/* Profundidade. Um tom chapado le como piscina; o reservatorio
              precisa clarear na lamina e escurecer no fundo. */}
          <linearGradient id="cs-agua" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#86ccf0" />
            <stop offset="0.3" stopColor="#3f9fd4" />
            <stop offset="1" stopColor="#164f74" />
          </linearGradient>
          <linearGradient id="cs-agua-fuga" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8ed2f4" /><stop offset="1" stopColor="#276e9c" />
          </linearGradient>
          {/* Concreto com face iluminada a esquerda e sombreada a direita: e o
              que faz o macico ter volume em vez de ser uma silhueta. */}
          <linearGradient id="cs-concreto" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#dcdfd8" />
            <stop offset="0.42" stopColor="#b9bdb5" />
            <stop offset="1" stopColor="#7f8780" />
          </linearGradient>
          <linearGradient id="cs-concreto-topo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#eceee8" /><stop offset="1" stopColor="#c2c7bf" />
          </linearGradient>
          {/* Rocha em corte: escurece com a profundidade, como talude exposto. */}
          <linearGradient id="cs-rocha" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6d5f4c" />
            <stop offset="0.4" stopColor="#544a3c" />
            <stop offset="1" stopColor="#332e26" />
          </linearGradient>
          {/* Aco do conduto: o brilho especular estreito e o que transforma um
              traco grosso em cilindro. */}
          <linearGradient id="cs-aco" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5c676d" />
            <stop offset="0.32" stopColor="#c2ccd1" />
            <stop offset="0.5" stopColor="#93a0a7" />
            <stop offset="1" stopColor="#3f484d" />
          </linearGradient>
          <linearGradient id="cs-morro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8fae9b" /><stop offset="1" stopColor="#6b8d79" />
          </linearGradient>
          <linearGradient id="cs-encosta" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6e9179" /><stop offset="0.55" stopColor="#587a62" /><stop offset="1" stopColor="#41604b" />
          </linearGradient>
          <linearGradient id="cs-mata" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3f6b4a" /><stop offset="1" stopColor="#2c4f36" />
          </linearGradient>
          <clipPath id="cs-recorte-rocha">
            <path d="M0 470 L900 470 L900 340 L640 340 L560 420 L250 420 L250 300 L0 300 Z" />
          </clipPath>
          <clipPath id="cs-recorte-agua">
            <rect x="0" y="250" width="250" height="120" />
          </clipPath>
          {/* Sombra de contato. Estrutura sem sombra flutua, e era isso que
              fazia a casa de forca parecer colada por cima do desenho. */}
          <filter id="cs-sombra" x="-20%" y="-20%" width="150%" height="160%">
            <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#16211c" floodOpacity="0.42" />
          </filter>
        </defs>

        <rect width="900" height="470" fill="url(#cs-ceu)" />
        {/* Serra ao fundo, com neblina: duas camadas de opacidade diferente
            dao distancia sem custar detalhe. */}
        <path d="M0 214 L92 176 L150 200 L228 158 L300 196 L372 168 L448 202 L520 172 L604 204 L688 176 L768 206 L840 184 L900 208 L900 250 L0 250 Z"
              fill="url(#cs-morro)" opacity="0.5" />
        <path d="M0 236 L74 208 L156 232 L236 198 L322 230 L404 206 L486 234 L566 208 L652 236 L740 212 L820 238 L900 220 L900 252 L0 252 Z"
              fill="url(#cs-morro)" opacity="0.82" />
        <path d="M318 258 L360 236 L404 252 L462 230 L522 250 L588 232 L654 252 L722 234 L790 252 L858 238 L900 248 L900 272 L318 272 Z"
              fill="url(#cs-mata)" opacity="0.68" />
        {/* Fundo de vale a jusante. Sem ele, entre a serra e o terreno sobrava
            um vazio pastel de 80 px que o olho lia como agua ou neblina, e a
            usina parecia construida na beira de nada. */}
        <path d="M320 288 Q 470 276, 620 292 T 900 284 L900 344 L320 344 Z" fill="#7d9d84" opacity="0.55" />
        <path d="M320 312 Q 500 302, 680 316 T 900 308 L900 344 L320 344 Z" fill="#5f8468" opacity="0.7" />

        {/* Encosta a jusante, atras das obras. Sem ela sobrava ceu entre a
            linha da mata e o terreno, e ceu abaixo do horizonte le como agua
            parada: a barragem parecia represar dos dois lados. */}
        <path d="M300 266 Q 480 258, 660 268 T 900 262 L900 420 L300 420 Z" fill="url(#cs-encosta)" />
        <path d="M300 336 Q 470 328, 640 342 T 900 334 L900 420 L300 420 Z" fill="#4a6f55" opacity="0.45" />
        {/* Macico rochoso em corte, com estratos. A rocha era um bloco de uma
            cor so; camada e o que faz ler como terreno cortado e nao como
            fundo de tela. */}
        <path d="M0 470 L900 470 L900 340 L640 340 L560 420 L250 420 L250 300 L0 300 Z" fill="url(#cs-rocha)" />
        <g clipPath="url(#cs-recorte-rocha)" opacity="0.55">
          <path d="M-20 332 Q 220 320, 460 344 T 920 336 L920 360 Q 460 368, 0 356 Z" fill="#7a6a54" opacity="0.5" />
          <path d="M-20 386 Q 240 374, 500 398 T 920 388 L920 410 Q 500 420, 0 408 Z" fill="#453d31" opacity="0.6" />
          <path d="M-20 432 Q 260 424, 520 442 T 920 434 L920 470 L-20 470 Z" fill="#2a251e" opacity="0.55" />
          <path d="M60 452 L96 428 L134 452 Z M300 462 L336 440 L372 462 Z M700 456 L742 432 L784 456 Z"
                fill="#8a7a62" opacity="0.28" />
        </g>
        {/* Solo vegetado sobre a rocha, com a linha de mata. */}
        <path d="M640 340 L900 340 L900 330 L640 330 Z" fill="#4c7a56" />
        <path d="M250 300 L250 288 L0 288 L0 300 Z" fill="#4c7a56" />
        <g fill="#3d6b48" opacity="0.92">
          <path d="M644 331 q6 -15 13 -3 q5 -18 12 -1 q7 -11 12 4 Z" />
          <path d="M688 331 q8 -20 15 -4 q6 -12 11 4 Z" />
          <path d="M726 331 q5 -12 11 -2 q7 -17 14 2 q6 -9 10 0 Z" />
          <path d="M778 331 q7 -16 14 -3 q6 -11 11 3 Z" />
          <path d="M818 331 q6 -13 12 -2 q8 -19 15 2 q5 -8 9 0 Z" />
          <path d="M868 331 q7 -17 14 -2 q5 -10 10 2 Z" />
        </g>
        <g fill="#3d6b48" opacity="0.85">
          <path d="M8 289 q7 -16 14 -3 q6 -12 12 3 Z" />
          <path d="M56 289 q6 -13 12 -2 q8 -18 15 2 Z" />
          <path d="M116 289 q8 -19 15 -3 q5 -9 10 3 Z" />
          <path d="M182 289 q6 -14 13 -2 q7 -15 13 2 Z" />
        </g>

        {/* Reservatorio. */}
        <rect x="0" y="250" width="250" height="120" fill="url(#cs-agua)" />
        <g clipPath="url(#cs-recorte-agua)">
          {/* Caustica: bandas horizontais claras muito sutis. Sem elas a agua
              e um retangulo com degrade; com elas tem superficie. */}
          <path d="M0 274 Q 62 268, 124 274 T 250 274" stroke="#bfe6ff" strokeWidth="1.6" fill="none" opacity="0.24" />
          <path d="M0 296 Q 62 302, 124 296 T 250 296" stroke="#bfe6ff" strokeWidth="1.2" fill="none" opacity="0.16" />
          <path d="M0 324 Q 62 318, 124 324 T 250 324" stroke="#bfe6ff" strokeWidth="1" fill="none" opacity="0.1" />
          <rect x="0" y="250" width="250" height="9" fill="#dff2ff" opacity="0.34" />
        </g>
        <path className="cs-lamina"
              d="M0 250 Q 31 246, 62 250 T 125 250 T 188 250 T 250 250 T 312 250"
              stroke="#eaf7ff" strokeWidth="3" fill="none" />

        {/* Barragem de concreto. Ganha coroamento, marcas de forma e sombra de
            contato com a rocha. */}
        <g filter="url(#cs-sombra)">
          <path d="M250 250 L250 420 L320 420 L300 250 Z" fill="url(#cs-concreto)" />
          <path d="M248 250 L302 250 L303 258 L248 258 Z" fill="url(#cs-concreto-topo)" />
        </g>
        <g stroke="#959c94" strokeWidth="0.9" opacity="0.5">
          <path d="M262 252 L266 420 M275 252 L281 420 M288 252 L296 420" />
        </g>
        <path d="M250 250 L250 420" stroke="#f0f2ec" strokeWidth="1.6" opacity="0.5" />
        {/* Perfil do vertedouro: a agua nao cai de uma parede reta, ela desce
            por uma calha curva. */}
        <path d="M300 250 C 314 292, 320 356, 320 420" fill="none" stroke="#6f7772" strokeWidth="3" opacity="0.75" />
        <path className="cs-spill" d="M300 260 C 318 300, 322 360, 320 418" stroke="#cfeaff" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.85" />
        <ellipse cx="326" cy="418" rx="20" ry="6" fill="#dff2ff" opacity="0.4" />

        {/* Tomada d'agua com grade. */}
        <rect x="233" y="328" width="30" height="30" rx="2" fill="#4a5b55" stroke="#e6ece7" strokeWidth="1.6" />
        <path d="M238 330 L238 356 M245 330 L245 356 M252 330 L252 356 M259 330 L259 356"
              stroke="#c9d6cf" strokeWidth="1.4" opacity="0.9" />
        <path d="M234 338 L262 338 M234 348 L262 348" stroke="#c9d6cf" strokeWidth="1" opacity="0.55" />

        {/* Conduto forcado como cilindro: contorno escuro, corpo com degrade
            transversal e blocos de ancoragem apoiando no terreno. */}
        <g filter="url(#cs-sombra)">
          <path d="M348 358 L372 363 L366 386 L342 381 Z" fill="#8f978f" />
          <path d="M452 380 L476 385 L470 408 L446 403 Z" fill="#8f978f" />
          <path d="M258 343 L560 405" stroke="#2f373b" strokeWidth="18" strokeLinecap="round" />
          <path d="M258 343 L560 405" stroke="url(#cs-aco)" strokeWidth="15" strokeLinecap="round" />
        </g>
        <path d="M262 340 L556 402" stroke="#e8f1f5" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
        <path className="cs-flow" d="M258 343 L560 405" stroke="#57d8bf" strokeWidth="5" strokeLinecap="round" fill="none" />

        {/* Casa de forca em corte, e nao uma caixa branca com telhado
            triangular. Ganha subestrutura enterrada, laje de piso, ponte
            rolante e o tubo de suducao levando ao canal de fuga. */}
        <g filter="url(#cs-sombra)">
          <path d="M536 352 L600 330 L664 352 L664 360 L600 339 L536 360 Z" fill="#93a29a" />
          <rect x="540" y="358" width="120" height="72" fill="#e9ece6" />
          <rect x="540" y="358" width="120" height="72" fill="none" stroke="#7d867f" strokeWidth="1.6" />
        </g>
        <rect x="540" y="358" width="120" height="72" fill="url(#cs-concreto)" opacity="0.28" />
        <rect x="540" y="404" width="120" height="4" fill="#aab3ab" />
        <rect x="540" y="358" width="120" height="10" fill="#cdd4cc" opacity="0.7" />
        <path d="M548 372 L652 372" stroke="#aab3ab" strokeWidth="2" />
        <rect x="576" y="366" width="20" height="8" rx="1.5" fill="#8d968e" />
        <g fill="#c3cbc3">
          <rect x="546" y="378" width="9" height="22" rx="1" />
          <rect x="645" y="378" width="9" height="22" rx="1" />
        </g>

        {/* Caixa espiral, rotor e eixo ate o gerador. */}
        <path d="M560 396 Q 585 372, 610 396 Q 610 418, 585 420 Q 560 418, 560 396 Z"
              fill="#9aa6ad" stroke="#69747a" strokeWidth="1.4" />
        <circle cx="585" cy="398" r="17" fill="#40525c" stroke="#dfe7e2" strokeWidth="2" />
        <circle className="cs-turbine" cx="585" cy="398" r="10" fill="#5cc9f2" />
        <path className="cs-turbine" d="M585 388 L585 408 M575 398 L595 398 M578 391 L592 405 M592 391 L578 405" stroke="#fff" strokeWidth="1.6" />
        <rect x="581" y="368" width="8" height="16" fill="#b6c0b8" />
        {/* O brilho do gerador estava em 690,372, que e o pe da torre, fora da
            casa de forca. O gerador fica no eixo da turbina. */}
        <rect x="568" y="356" width="34" height="14" rx="3" fill="#8d968e" stroke="#dfe7e2" strokeWidth="1.2" />
        <circle className="cs-gerador" cx="585" cy="363" r="6.5" fill="#ffd479" opacity="0.9" />
        {/* Tubo de suducao: e por ele que a agua turbinada sai para o canal. */}
        <path d="M585 420 Q 585 442, 616 440 L648 428" fill="none" stroke="#7f8a84" strokeWidth="11" strokeLinecap="round" />

        {/* Canal de fuga. */}
        <rect x="640" y="405" width="260" height="30" fill="url(#cs-agua-fuga)" />
        <rect x="640" y="405" width="260" height="5" fill="#dff2ff" opacity="0.35" />
        <path className="cs-flow" d="M664 420 L890 420" stroke="#eaf7ff" strokeWidth="4"
              strokeLinecap="round" fill="none" opacity="0.9" />

        {/* Transformador ao pe da torre e torre em trelica de verdade. */}
        <rect x="676" y="352" width="28" height="20" rx="2" fill="#8d968e" stroke="#5d665f" strokeWidth="1.2" />
        <path d="M681 352 L681 344 M690 352 L690 342 M699 352 L699 344" stroke="#5d665f" strokeWidth="2" />
        <g stroke="#4b565c" strokeWidth="2.2" fill="none" strokeLinecap="round">
          <path d="M682 344 L690 296 L698 344" />
          <path d="M674 316 L706 316 M678 300 L702 300" />
        </g>
        <g stroke="#4b565c" strokeWidth="1.1" fill="none" opacity="0.9">
          <path d="M684 332 L696 332 M685 324 L695 324 M683 340 L697 340" />
          <path d="M684 332 L690 324 L696 332 L690 340 Z" />
        </g>
        <path d="M690 300 C 760 290, 820 300, 880 285" stroke="#39444a" strokeWidth="1.5" fill="none" />
        <path className="cs-energia" d="M690 300 C 760 290, 820 300, 880 285"
              stroke="#ffcf5f" strokeWidth="2.6" fill="none" strokeLinecap="round" />

        {/* Cota da queda. O texto ficava verde sobre a agua azul, sem
            contraste; passa a ter chapa propria, como cota de desenho
            tecnico. */}
        <g>
          <line x1="130" y1="250" x2="130" y2="405" stroke="#0f2a22" strokeWidth="1.4" strokeDasharray="5 4" opacity="0.85" />
          <path d="M124 254 L130 246 L136 254 M124 401 L130 409 L136 401" stroke="#0f2a22" strokeWidth="1.6" fill="none" opacity="0.85" />
          <rect x="138" y="270" width="86" height="22" rx="7" fill="#0f2a22" opacity="0.86" />
          <text x="146" y="285" fontSize="14" fill="#7ff0c4" fontWeight="700">H (queda)</text>
        </g>
        {ROTULOS_CORTE.map((item) => (
          <RotuloDoCorte
            key={item.id}
            item={item}
            ativo={selected === item.id}
            onSelect={onSelect}
          />
        ))}
      </svg>
      {/* hotspots posicionados em % sobre o svg */}
      <div className="cs-hots">
        {hot('reservatorio', 13, 49.0)}
        {hot('barragem', 31, 59.7)}
        {hot('vertedouro', 34, 65.1)}
        {hot('tomada', 27.5, 65.1)}
        {hot('conduto', 45, 75.8)}
        {hot('casa', 61.5, 71.8)}
        {hot('turbina', 65, 79.9)}
        {hot('fuga', 84, 86.6)}
        {hot('subestacao', 77, 53.0)}
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
      <div className="pc-formula"><Zap /> <span>P = ρ · g · Q · H · η</span> <small>densidade × constante física g × vazão turbinada × queda líquida × rendimento global</small></div>
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
