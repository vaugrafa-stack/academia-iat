import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  Binoculars,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Droplets,
  Factory,
  Gauge,
  GraduationCap,
  MapPinned,
  Network,
  Waves,
  Zap,
} from "lucide-react";
import "./routeStyles.css";

export const FOUNDATION_FLOW = Object.freeze([
  {
    id: "agua",
    title: "Água disponível",
    copy: "O rio e, quando existente, o reservatório fornecem a água que percorre o arranjo.",
    icon: Droplets,
  },
  {
    id: "vazao-queda",
    title: "Vazão e queda",
    copy: "Vazão é a quantidade de água por tempo; queda líquida é a diferença de carga útil após as perdas.",
    icon: Gauge,
  },
  {
    id: "turbina",
    title: "Turbina",
    copy: "A energia hidráulica movimenta o rotor e se transforma em rotação mecânica.",
    icon: Waves,
  },
  {
    id: "gerador",
    title: "Gerador",
    copy: "O eixo transmite a rotação ao gerador, que a converte em energia elétrica.",
    icon: Zap,
  },
  {
    id: "rede",
    title: "Transformação e rede",
    copy: "Transformador e subestação adequam a tensão para a conexão à distribuição ou à transmissão.",
    icon: Network,
  },
]);

export const FOUNDATION_COMPONENTS = Object.freeze([
  ["Barragem", "Quando presente, eleva ou mantém o nível d'água. Não define, isoladamente, a tipologia nem o impacto."],
  ["Vertedouro", "Conduz vazões excedentes e integra a segurança hidráulica do arranjo."],
  ["Tomada d'água", "Direciona a água para a adução; pode reunir comportas e grades de proteção."],
  ["Adução e conduto forçado", "Canal, túnel ou tubulação conduz a água até a turbina; o conduto pressurizado vence a queda final."],
  ["Casa de força", "Abriga turbina, gerador e sistemas de controle, proteção e apoio."],
  ["Canal de fuga", "Devolve a água ao curso d'água depois da passagem pela turbina."],
]);

export const FOUNDATION_TYPOLOGIES = Object.freeze([
  ["Fio d'água", "Pouca ou nenhuma regularização sazonal; a geração acompanha mais de perto a vazão afluente."],
  ["Acumulação", "O reservatório permite regularizar vazões por algum período; operação e efeitos dependem do arranjo e do local."],
  ["Derivação", "Parte da água segue por canal, túnel ou conduto e retorna adiante, formando um trecho de vazão reduzida, o TVR."],
  ["Reversível", "Pode bombear água para um reservatório superior e gerar quando a água retorna; é uma configuração específica de armazenamento."],
]);

export const FOUNDATION_ACRONYMS = Object.freeze([
  ["Q", "vazão"],
  ["H", "queda líquida"],
  ["η", "rendimento do conjunto"],
  ["UG", "unidade geradora"],
  ["CF", "casa de força"],
  ["TVR", "trecho de vazão reduzida"],
  ["CGH, MGH, PCH e UHE", "classes ou denominações usadas no setor; seus critérios e efeitos devem ser conferidos nas fontes oficiais vigentes aplicáveis ao caso"],
]);

export const LEARNING_PATHS = Object.freeze([
  {
    id: "primeira-semana",
    title: "Primeira semana",
    summary: "Construa primeiro a base sobre o funcionamento de uma hidrelétrica e depois conheça o POP.",
    outcome: "Produto: vocabulário mínimo, cartão inicial do caso e rota de análise.",
    trackIds: ["m00", "m01", "m02", "m03"],
    foundationFirst: true,
    icon: GraduationCap,
  },
  {
    id: "analise-processo",
    title: "Analisar um processo",
    summary: "Passe da triagem à modalidade, aos estudos, às pendências e à conclusão.",
    outcome: "Produto: matriz de suficiência e encaminhamento motivado.",
    trackIds: ["m02", "m03", "m04", "m05", "m06", "m08", "m12", "m13"],
    icon: ClipboardCheck,
  },
  {
    id: "campo-territorio",
    title: "Território e fiscalização",
    summary: "Conecte barragens, cartografia, recursos naturais, intervenientes e vistoria.",
    outcome: "Produto: roteiro de campo e confronto de evidências.",
    trackIds: ["m07", "m10", "m11", "m15", "m12"],
    icon: MapPinned,
  },
  {
    id: "estudos-consultoria",
    title: "Elaborar e revisar estudos",
    summary: "Aprofunde memorial, estudos, PACUERA, qualidade documental e integração final.",
    outcome: "Produto: estudo rastreável e pronto para revisão técnica fundamentada.",
    trackIds: ["m01", "m08", "m09", "m10", "m11", "m13", "m14"],
    icon: Binoculars,
  },
]);

export function learningPathMetrics(path, trackLessons, completed = []) {
  const lessons = path.trackIds.flatMap((id) => trackLessons.get(id) || []);
  const done = lessons.filter((lesson) => completed.includes(lesson.id)).length;
  const minutes = lessons.reduce((total, lesson) => total + (lesson.minutes || 0), 0);
  const next = lessons.find((lesson) => !completed.includes(lesson.id)) || lessons[0] || null;
  return {
    lessons,
    done,
    minutes,
    next,
    percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0,
  };
}

function FoundationPrimer({ courseLesson, openLesson, primerTitleRef }) {
  return (
    <section
      className="foundation-primer"
      id="foundation-primer"
      aria-labelledby="foundation-primer-title"
    >
      <header>
        <span><BookOpenCheck aria-hidden="true" /> Base conceitual</span>
        <h3 id="foundation-primer-title" ref={primerTitleRef} tabIndex="-1">
          Como a água se transforma em eletricidade
        </h3>
        <p>
          Leia a sequência física antes de entrar no procedimento. A relação simplificada
          é potência proporcional a vazão × queda líquida × rendimento; ela ajuda a
          compreender o sistema, mas não substitui cálculo de engenharia.
        </p>
      </header>

      <ol className="foundation-flow" aria-label="Caminho da água até a rede elétrica">
        {FOUNDATION_FLOW.map((step, index) => {
          const Icon = step.icon;
          return (
            <li key={step.id}>
              <span className="foundation-flow-icon"><Icon aria-hidden="true" /></span>
              <div>
                <small>Etapa {index + 1}</small>
                <strong>{step.title}</strong>
                <p>{step.copy}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="foundation-knowledge-grid">
        <article>
          <span className="foundation-kicker"><Factory aria-hidden="true" /> Componentes essenciais</span>
          <h4>Leia o arranjo de montante para jusante</h4>
          <dl>
            {FOUNDATION_COMPONENTS.map(([term, definition]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{definition}</dd>
              </div>
            ))}
          </dl>
        </article>
        <article>
          <span className="foundation-kicker"><Droplets aria-hidden="true" /> Tipologias de arranjo</span>
          <h4>Compare configurações, não apenas nomes</h4>
          <ul>
            {FOUNDATION_TYPOLOGIES.map(([term, definition]) => (
              <li key={term}>
                <CheckCircle2 aria-hidden="true" />
                <span><strong>{term}</strong>{definition}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="foundation-acronyms">
        <span className="foundation-kicker"><Gauge aria-hidden="true" /> Siglas para reconhecer</span>
        <h4>Um glossário mínimo antes do procedimento</h4>
        <dl>
          {FOUNDATION_ACRONYMS.map(([term, definition]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{definition}</dd>
            </div>
          ))}
        </dl>
      </article>

      <footer>
        <div>
          <strong>Próximo passo: aprender a usar o POP</strong>
          <p>
            Esta introdução é material conceitual de treinamento. Não define
            enquadramento, exigência, competência ou validação normativa.
          </p>
        </div>
        <button
          type="button"
          className="primary"
          disabled={!courseLesson}
          onClick={() => courseLesson && openLesson(courseLesson.id)}
        >
          Continuar para o curso POP <ArrowRight aria-hidden="true" />
        </button>
      </footer>
    </section>
  );
}

export default function LearningPaths({ tracks, trackLessons, state, openLesson }) {
  const [showFoundation, setShowFoundation] = useState(false);
  const primerTitleRef = useRef(null);
  const trackById = new Map(tracks.map((track) => [track.id, track]));
  const beginnerMetrics = learningPathMetrics(
    LEARNING_PATHS[0],
    trackLessons,
    state.completed,
  );

  useEffect(() => {
    if (!showFoundation) return;
    const title = primerTitleRef.current;
    title?.closest(".foundation-primer")?.scrollIntoView?.({ block: "start" });
    title?.focus({ preventScroll: true });
  }, [showFoundation]);

  const revealFoundation = () => {
    if (showFoundation) {
      primerTitleRef.current?.focus();
      primerTitleRef.current?.closest(".foundation-primer")?.scrollIntoView?.({ block: "start" });
      return;
    }
    setShowFoundation(true);
  };

  const openPopCourse = () => {
    if (beginnerMetrics.next) openLesson(beginnerMetrics.next.id);
  };

  return (
    <section className="learning-paths" aria-labelledby="learning-paths-title">
      <header>
        <div>
          <h2 id="learning-paths-title">Escolha uma rota de entrada</h2>
          <p>
            Quem nunca trabalhou com hidrelétricas começa pelos fundamentos. As
            rotas seguintes orientam tarefas, mas não dispensam os módulos indispensáveis
            nem substituem a sequência completa de M00 a M16.
          </p>
        </div>
        <span>Fundamentos + 4 percursos</span>
      </header>

      <aside className="foundation-gateway" aria-labelledby="foundation-gateway-title">
        <span className="learning-path-icon"><Droplets aria-hidden="true" /></span>
        <div>
          <small>Primeiro contato</small>
          <h3 id="foundation-gateway-title">Nunca estudou uma hidrelétrica?</h3>
          <p>
            Comece pela água, vazão, queda, equipamentos, arranjos e siglas. Em
            seguida, entre no curso guiado pelo POP sabendo o que cada termo representa.
          </p>
        </div>
        <div className="foundation-gateway-actions">
          <button
            type="button"
            className="primary"
            aria-expanded={showFoundation}
            aria-controls="foundation-primer"
            onClick={revealFoundation}
          >
            Começar pelos fundamentos <ArrowDown aria-hidden="true" />
          </button>
          <button type="button" disabled={!beginnerMetrics.next} onClick={openPopCourse}>
            Já domino estes fundamentos <ArrowRight aria-hidden="true" />
          </button>
        </div>
      </aside>

      {showFoundation && (
        <FoundationPrimer
          courseLesson={beginnerMetrics.next}
          openLesson={openLesson}
          primerTitleRef={primerTitleRef}
        />
      )}

      <div className="learning-path-grid">
        {LEARNING_PATHS.map((path) => {
          const metrics = learningPathMetrics(path, trackLessons, state.completed);
          const Icon = path.icon;
          const codes = path.trackIds
            .map((id) => trackById.get(id)?.code)
            .filter(Boolean)
            .join(" · ");
          return (
            <article key={path.id}>
              <span className="learning-path-icon"><Icon aria-hidden="true" /></span>
              <div className="learning-path-copy">
                <small>{codes}</small>
                <h3>{path.title}</h3>
                <p>{path.summary}</p>
                <strong>{path.outcome}</strong>
              </div>
              <div className="learning-path-progress">
                <span>
                  {metrics.done}/{metrics.lessons.length} tópicos · {metrics.minutes} min
                </span>
                <i aria-hidden="true"><em style={{ width: `${metrics.percent}%` }} /></i>
              </div>
              <button
                type="button"
                disabled={!metrics.next}
                aria-expanded={path.foundationFirst ? showFoundation : undefined}
                aria-controls={path.foundationFirst ? "foundation-primer" : undefined}
                onClick={() => {
                  if (path.foundationFirst) revealFoundation();
                  else if (metrics.next) openLesson(metrics.next.id);
                }}
              >
                {path.foundationFirst
                  ? "Começar pelos fundamentos"
                  : metrics.done ? "Retomar rota" : "Começar rota"} {path.foundationFirst
                  ? <ArrowDown aria-hidden="true" />
                  : <ArrowRight aria-hidden="true" />}
              </button>
            </article>
          );
        })}
      </div>
      <p className="learning-path-note">
        “Concluído” registra atividade de autoestudo neste dispositivo; não é
        certificação de competência profissional nem validação institucional.
      </p>
    </section>
  );
}
