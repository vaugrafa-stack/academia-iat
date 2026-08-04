import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BadgeCheck,
  BookMarked,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleHelp,
  ClipboardCheck,
  Clock,
  Compass,
  Database,
  Download,
  FileCheck,
  FileCheck2,
  FileText,
  Files,
  Filter,
  FlaskConical,
  GitBranch,
  GraduationCap,
  Home,
  Image as ImageIcon,
  Inbox,
  Info,
  Layers3,
  ListChecks,
  Library,
  Lightbulb,
  Map as MapIcon,
  Maximize2,
  Menu,
  MessageSquareText,
  Quote,
  Milestone,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Table2,
  Target,
  Trees,
  Trophy,
  X,
  Zap,
  CloudOff,
} from "lucide-react";
import TranscriptPanel from "./TranscriptPanel.jsx";
import VideoLearningStage from "./VideoLearningStage.jsx";
import { resolveAudiovisualPilot } from "./audiovisualPilotRuntime.js";
import {
  ThemeToggle,
  Suporte,
  ComparaDiagnostico,
} from "./painelAluno.jsx";
import { PageHeader, Empty, TableRenderer } from "./ui.jsx";
import { ordenaBusca, snippet } from "./busca.js";
import { elementoDaAula, precisaDeComplemento } from "./aulasAnexoB.js";
import { comoLerQuadro } from "./comoLerQuadro.js";
import mapaDados from "./data/mapa-parana.json";
import popDataUrl from "./data/pop-public-content.json?url";
import flowDataUrl from "./data/flowcharts-content.json?url";
import aulaMediaUrl from "./data/aula-media.json?url";
import {
  featuredMedia as featuredMediaSource,
  trackGroups,
  tracks,
} from "./courseData";
// O banco de questoes deixou de ser modulo e virou arquivo buscado no
// arranque, junto com o conteudo do POP, para sair do orcamento de JS. Fica em
// `questionBank`, desestruturado de loadAppData mais abaixo.
import questionBankUrl from "./data/question-bank.json?url";
// Indice LEVE dos casos: id, trilha, titulo, os tres primeiros fatos e o
// enunciado de cada pergunta. O corpo (evidencias, documentos, serie, rubrica,
// desfecho e alternativas) e buscado pelo Laboratorio e pelo Redator quando o
// caso abre, e por isso nao pesa no orcamento de JS nem no carregamento de
// quem so quer ler uma aula. Os nomes dos campos sao os mesmos do caso
// completo, entao esta tela nao precisa saber da separacao.
import { scenarios, GRUPOS_LAB, useCasosSobDemanda } from "./labData.js";
import {
  loadProfile,
  defaultProfile,
  saveProfile,
  hasAccount,
  registerCertificate,
  certificateSvg,
  downloadSvg,
  listUsers,
  switchUser,
  createUser,
  deleteUser,
  exportBackup,
  importBackup,
  exportProfileRegistryRecovery,
  resetInvalidProfileRegistry,
} from "./profile";
import { resumoDaNorma } from "./leiResumos";
import { criarDerivados, norm } from "./derivados.js";
import { registrarOffline } from "./offline.js";
import { loadAppData } from "./appData.js";
import { getLearningDesign } from "./learningDesign.js";
import { resolveOfficialSource } from "./officialSources.js";
import {
  newAssessmentSeed,
  prepareAssessment,
  selectDiagnosticAnchors,
} from "./assessmentDesign.js";
import { practiceRecordStatus } from "./learningRecords.js";
import {
  MIN_ACTIVE_RECALL_CHARS,
  lessonEvidenceStatus,
  lessonQuestionProvesObjective,
  selectLessonQuestion,
  selectLessonScenario,
} from "./lessonEvidence.js";
import { useMediaQuery } from "./useMediaQuery.js";
import { useStoredState } from "./storedState.js";
import "./styles.css";
import "./nota10.css";

const HydroGuide = lazy(() => import("./hydro.jsx"));
const MapaParana = lazy(() => import("./mapa.jsx"));
const RedatorIT = lazy(() => import("./redator.jsx"));
const LaboratorioPremium = lazy(() => import("./laboratorio.jsx"));
const OfflineManager = lazy(() => import("./OfflineManager.jsx"));
const Flowcharts = lazy(() => import("./Flowcharts.jsx"));
const KnowledgeLibrary = lazy(() => import("./biblioteca.jsx"));
const Profile = lazy(() => import("./perfil.jsx"));
try {
  const _t = localStorage.getItem("academia-iat-theme");
  document.documentElement.dataset.theme =
    _t === "light" || _t === "dark" ? _t : "dark";
} catch {
  document.documentElement.dataset.theme = "dark";
}

// Sob deploy em subcaminho (GitHub Pages), os caminhos absolutos dos dados precisam do prefixo da base
const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
const wb = (p) => (typeof p === "string" && p.startsWith("/") ? BASE + p : p);
const BUILD_STAMP =
  typeof __BUILD_STAMP__ !== "undefined" ? __BUILD_STAMP__ : "local";
const BUILD_LABEL = (() => {
  const value = String(BUILD_STAMP || "local");
  const local = value.endsWith("-local");
  const sha = local ? value.slice(0, -6) : value;
  return /^[a-f0-9]{40}$/i.test(sha)
    ? `${sha.slice(0, 12)}${local ? "-local" : ""}`
    : value;
})();
const {
  popData,
  flowData,
  aulaMedia,
  featuredMedia,
  questionBank,
  warnings: appDataWarnings,
} = await loadAppData({
  popDataUrl,
  flowDataUrl,
  aulaMediaUrl,
  questionBankUrl,
  base: BASE,
  featuredMedia: featuredMediaSource,
});

const TRACK_ICONS = {
  Compass,
  Scale,
  Inbox,
  GitBranch,
  FileCheck,
  Milestone,
  RefreshCw,
  ShieldCheck,
  Files,
  Map: MapIcon,
  Trees,
  Building2,
  ClipboardCheck,
  BadgeCheck,
  Library,
};

// Um so ponto de entrada para o dado derivado do POP. Os nomes seguem os
// mesmos, entao nenhuma tela precisou mudar nesta etapa.
const {
  blockMap,
  tableMap,
  figureByBlock,
  sectionMap,
  GLOSSARIO,
  siglasDaAula,
  sectionById,
  lessons,
  lessonMap,
  trackLessons,
  sectionText,
  INDICE,
  firstLesson,
} = criarDerivados(popData, tracks);

// Contrato de dados da Biblioteca, que virou modulo proprio. Um objeto so, em
// vez de sete propriedades soltas: a tela declara o que precisa do POP e pode
// ser montada em teste sem carregar a aplicacao inteira. Congelado fora do
// componente porque nao muda em tempo de execucao e nao deve disparar
// recalculo de memo a cada renderizacao.
// Contrato de dados do Perfil. Os dois helpers sao closures sobre o estado do
// modulo (trackLessons, questionBank, scenarios), entao viajam como funcao em
// vez de serem recalculados na tela.
const DADOS_PERFIL = Object.freeze({
  lessons,
  trackProgress,
  requisitosAutoestudo,
});

const DADOS_BIBLIOTECA = Object.freeze({
  popData,
  flowData,
  blockMap,
  tableMap,
  lessons,
  lessonMap,
  INDICE,
});
// Navegacao agrupada por NATUREZA DA ATIVIDADE, nao por ordem de criacao.
//
// Eram onze itens irmaos na mesma lista. Onze escolhas no mesmo nivel nao
// formam hierarquia: quem chega precisa ler todas para descobrir por onde
// comecar, e quem ja usa nao consegue prever onde uma area fica. Agrupar em
// quatro blocos de dois ou tres reduz a leitura a uma pergunta de cada vez:
// quero aprender, praticar, consultar ou mexer na minha conta?
//
// "Visao geral" fica fora de grupo de proposito: ela e o ponto de partida, e
// nao concorre com as outras.
const NAV_GRUPOS = [
  [null, [["dashboard", "Visão geral", Home]]],
  ["Aprender", [
    ["hidreletricas", "Hidrelétricas", Zap],
    ["formacao", "Formação", BookOpen],
  ]],
  ["Praticar", [
    ["laboratorio", "Laboratório", FlaskConical],
    ["redator", "Redigir uma IT", FileText],
    ["avaliacoes", "Avaliações", ClipboardCheck],
  ]],
  ["Consultar", [
    ["fluxos", "Fluxogramas", GitBranch],
    ["mapa", "Mapa do Paraná", MapIcon],
    ["biblioteca", "Biblioteca", Library],
  ]],
  ["Neste dispositivo", [
    ["perfil", "Meu progresso", BadgeCheck],
    ["suporte", "Suporte", CircleHelp],
  ]],
];

// Lista plana derivada dos grupos, para o titulo da pagina e qualquer consulta
// por id continuarem funcionando sem saber do agrupamento.
const NAV = NAV_GRUPOS.flatMap(([, itens]) => itens);

// O painel inicial e a aula precisam resolver a mídia pela mesma regra. Isso
// impede que "Continue de onde parou" associe o título de uma aula a um vídeo
// genérico sem relação com ela.
function mediaForLesson(lesson) {
  if (!lesson) return null;
  let fallback = null;
  if (aulaMedia[lesson.id]) {
    fallback = {
      src: wb(`/media/aula/${lesson.id}.mp4`),
      poster: wb(`/media/aula/${lesson.id}.jpg`),
      captions: wb(`/media/aula/${lesson.id}.vtt`),
      title: (lesson.number ? lesson.number + " " : "") + lesson.title,
      propria: true,
    };
  } else {
    fallback = featuredMedia[lesson.trackId] || null;
  }
  return resolveAudiovisualPilot(lesson, fallback, `${BASE || ""}/`);
}

// Cada aula vai para a trilha cuja secao declarada for o prefixo MAIS ESPECIFICO
// do numero. Assim 20.2.1 fica no modulo de unidades de conservacao (20.2) e nao
// no de intervenientes (20), sem precisar de regra especial por modulo.
function trackProgress(id, state) {
  const ls = trackLessons.get(id) || [];
  return ls.length
    ? Math.round(
        (ls.filter((l) => state.completed.includes(l.id)).length / ls.length) *
          100,
      )
    : 0;
}
// Requisitos automáticos do registro pessoal de autoestudo. O mérito da
// fundamentação continua separado e depende de conferência técnica.
function requisitosAutoestudo(trackId, state) {
  const leitura = trackProgress(trackId, state) === 100;
  const temQuiz = questionBank.some((q) => q.track === trackId);
  const q = state.quizScores && state.quizScores[trackId];
  const avaliacao = !temQuiz || (q && q.total && q.score / q.total >= 0.8);
  const cen = scenarios.filter((c) => c.track === trackId);
  const praticaRegistro = practiceRecordStatus(cen, state.labs);
  const pratica = praticaRegistro.objectiveMet;
  const feitos = [leitura, !!avaliacao, !!pratica].filter(Boolean).length;
  return {
    leitura,
    avaliacao: !!avaliacao,
    pratica: !!pratica,
    praticaEntregue: praticaRegistro.submitted,
    praticaObjetiva: praticaRegistro.objectiveMet,
    praticaRevisada: praticaRegistro.technicalReviewApproved,
    praticaPercentual: praticaRegistro.bestObjectivePercent,
    temQuiz,
    temPratica: praticaRegistro.applies,
    pronto: leitura && !!avaliacao && !!pratica,
    pct: Math.round((feitos / 3) * 100),
  };
}
// Indice unico de busca: aulas, quadros e siglas. Antes a busca do topo via so
// aulas e a da Biblioteca via aulas e quadros, com coberturas diferentes.

const VIEW_IDS = [
  "dashboard",
  "hidreletricas",
  "mapa",
  "formacao",
  "fluxos",
  "laboratorio",
  "redator",
  "avaliacoes",
  "biblioteca",
  "perfil",
  "suporte",
];
function parseHash() {
  const h = ((typeof location !== "undefined" && location.hash) || "").replace(
    /^#\/?/,
    "",
  );
  if (!h) return { view: "dashboard", lesson: null, scenario: null };
  const i = h.indexOf("/");
  const seg = i < 0 ? h : h.slice(0, i);
  const rest = i < 0 ? "" : h.slice(i + 1);
  if (seg === "aula" && rest)
    return { view: "lesson", lesson: decodeURIComponent(rest), scenario: null };
  if (seg === "laboratorio")
    return {
      view: "laboratorio",
      lesson: null,
      scenario: rest ? decodeURIComponent(rest) : null,
    };
  if (VIEW_IDS.includes(seg))
    return { view: seg, lesson: null, scenario: null };
  return { view: "dashboard", lesson: null, scenario: null };
}
function reloadFade() {
  document.body.classList.add("page-leave");
  setTimeout(() => location.reload(), 240);
}
function pushHash(t) {
  if (typeof location === "undefined") return;
  if (location.hash === t) return;
  try {
    history.pushState(null, "", t);
  } catch {
    location.hash = t;
  }
}
function App() {
  const profileBoot = useRef(null);
  if (!profileBoot.current) {
    try {
      profileBoot.current = { profile: loadProfile(), issue: null };
    } catch (error) {
      profileBoot.current = {
        profile: defaultProfile(),
        issue: {
          ok: false,
          code: error?.code || "REGISTRY_INVALID",
          error:
            error?.message ||
            "O registro local de perfis não pôde ser lido. Os dados foram preservados.",
          recoverable: true,
        },
      };
    }
  }
  const [profile, setProfileRaw] = useState(profileBoot.current.profile);
  const [profileStatus, setProfileStatus] = useState(profileBoot.current.issue);
  const setProfile = (p) => {
    const v = typeof p === "function" ? p(profile) : p;
    const result = saveProfile(v);
    if (result?.ok === false) {
      setProfileStatus(result);
      return false;
    }
    setProfileRaw(result || v);
    setProfileStatus(null);
    return true;
  };
  const [state, setState, storageStatus, resolveCorruptStorage] = useStoredState();
  const _init = parseHash();
  const [view, setView] = useState(_init.view);
  const [selectedLesson, setSelectedLesson] = useState(() =>
    _init.lesson && lessonMap.has(_init.lesson)
      ? _init.lesson
      : lessonMap.has(state.lastLesson)
        ? state.lastLesson
        : firstLesson("m00")?.id,
  );
  const [selectedScenario, setSelectedScenario] = useState(() =>
    _init.scenario && scenarios.some((x) => x.id === _init.scenario)
      ? _init.scenario
      : null,
  );
  const [libraryTarget, setLibraryTarget] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false),
    [searchOpen, setSearchOpen] = useState(false),
    [toast, setToast] = useState("");
  const mobileNav = useMediaQuery("(max-width: 980px)");
  const searchReturn = useRef(null);
  const mobileMenuButton = useRef(null);
  const restoreMenuFocusOnClose = useRef(false);
  // Conexao e versao nova. A atualizacao nao entra sozinha: ela esperaria a
  // pessoa terminar de escrever a fundamentacao no laboratorio, e recarregar
  // no meio disso jogaria fora o que ela digitou.
  const [online, setOnline] = useState(true),
    [aplicarUpdate, setAplicarUpdate] = useState(null);
  useEffect(() => {
    return registrarOffline({
      onConexao: setOnline,
      onAtualizacao: (fn) => setAplicarUpdate(() => fn),
    });
  }, []);
  const progress = Math.round((state.completed.length / lessons.length) * 100);
  function openSearch() {
    searchReturn.current = document.activeElement;
    setSearchOpen(true);
  }
  function closeSearch() {
    setSearchOpen(false);
    setTimeout(() => searchReturn.current?.focus?.(), 0);
  }
  const closeMobileMenu = useCallback(() => {
    restoreMenuFocusOnClose.current = true;
    setMenuOpen(false);
  }, []);
  useEffect(() => {
    if (menuOpen || !restoreMenuFocusOnClose.current) return undefined;
    restoreMenuFocusOnClose.current = false;
    const restoreFocus = () =>
      mobileMenuButton.current?.focus({ preventScroll: true });
    const drawer = document.getElementById("navegacao-lateral");
    restoreFocus();
    // A cortina é removida no clique e o drawer ainda conclui sua transição.
    // Reforce o foco ao final dela; o temporizador cobre movimento reduzido.
    drawer?.addEventListener("transitionend", restoreFocus, { once: true });
    const restoreFocusId = setTimeout(restoreFocus, 400);
    return () => {
      drawer?.removeEventListener("transitionend", restoreFocus);
      clearTimeout(restoreFocusId);
    };
  }, [menuOpen]);
  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openSearch();
      }
      if (e.key === "Escape" && searchOpen) closeSearch();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [searchOpen]);
  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(""), 2600);
      return () => clearTimeout(id);
    }
  }, [toast]);
  useEffect(() => {
    if (!mobileNav || !menuOpen || searchOpen) return undefined;
    const drawer = document.getElementById("navegacao-lateral");
    if (!drawer) return undefined;
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = () =>
      [...drawer.querySelectorAll(selector)].filter(
        (element) =>
          !element.hasAttribute("inert") &&
          element.getAttribute("aria-hidden") !== "true" &&
          element.getClientRects().length > 0,
      );
    const focusId = setTimeout(() => focusable()[0]?.focus(), 0);
    const containFocus = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileMenu();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", containFocus);
    return () => {
      clearTimeout(focusId);
      document.removeEventListener("keydown", containFocus);
    };
  }, [mobileNav, menuOpen, searchOpen, closeMobileMenu]);
  useEffect(() => {
    const onNav = () => {
      const p = parseHash();
      if (p.view === "lesson") {
        if (p.lesson && lessonMap.has(p.lesson)) {
          setSelectedLesson(p.lesson);
          setState((s) =>
            s.lastLesson === p.lesson ? s : { ...s, lastLesson: p.lesson },
          );
        }
        setView("lesson");
      } else {
        if (
          p.view === "laboratorio" &&
          p.scenario &&
          scenarios.some((x) => x.id === p.scenario)
        )
          setSelectedScenario(p.scenario);
        setView(p.view);
      }
      setMenuOpen(false);
      setSearchOpen(false);
      scrollRouteToTop();
      announceRoute();
    };
    window.addEventListener("popstate", onNav);
    window.addEventListener("hashchange", onNav);
    return () => {
      window.removeEventListener("popstate", onNav);
      window.removeEventListener("hashchange", onNav);
    };
  }, []);
  function announceRoute() {
    setTimeout(() => document.getElementById("conteudo")?.focus(), 0);
  }
  function scrollRouteToTop() {
    const reduced =
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }
  function go(next, param) {
    setView(next);
    setMenuOpen(false);
    if (
      next === "laboratorio" &&
      param &&
      scenarios.some((x) => x.id === param)
    ) {
      setSelectedScenario(param);
      pushHash("#/laboratorio/" + encodeURIComponent(param));
    } else pushHash(next === "dashboard" ? "#/" : "#/" + next);
    scrollRouteToTop();
    announceRoute();
  }
  function openLesson(id) {
    if (!id) return;
    setSelectedLesson(id);
    setState((s) => ({ ...s, lastLesson: id }));
    setView("lesson");
    setSearchOpen(false);
    setMenuOpen(false);
    pushHash("#/aula/" + encodeURIComponent(id));
    scrollRouteToTop();
    announceRoute();
  }
  function complete(id) {
    const agora = new Date().toISOString();
    setState((s) => ({
      ...s,
      completed: s.completed.includes(id)
        ? s.completed.filter((x) => x !== id)
        : [...s.completed, id],
      doneAt: {
        ...(s.doneAt || {}),
        [id]: s.completed.includes(id) ? undefined : agora,
      },
      lastVisit: agora,
    }));
    setToast(
      state.completed.includes(id)
        ? "Aula marcada como não concluída"
        : "Aula concluída e progresso salvo",
    );
  }
  function bookmark(id) {
    setState((s) => ({
      ...s,
      bookmarks: s.bookmarks.includes(id)
        ? s.bookmarks.filter((x) => x !== id)
        : [...s.bookmarks, id],
    }));
    setToast(
      state.bookmarks.includes(id)
        ? "Favorito removido"
        : "Aula salva nos favoritos",
    );
  }
  useEffect(() => {
    const lesson = lessonMap.get(selectedLesson);
    const label =
      view === "lesson" && lesson
        ? `${lesson.number ? lesson.number + " " : ""}${lesson.title}`
        : NAV.find(([id]) => id === view)?.[1] || "Visão geral";
    document.title = `${label} · Academia IAT`;
  }, [view, selectedLesson]);
  // O Laboratorio e o Redator sao as unicas telas que usam o caso inteiro
  // (evidencias, documentos, serie, rubrica, desfecho e alternativas). O corpo
  // e buscado so quando uma das duas abre, e ate chegar elas mostram
  // carregamento em vez de caso pela metade.
  const precisaCasoInteiro = view === "laboratorio" || view === "redator";
  const { casos: casosInteiros, erro: erroCasos } =
    useCasosSobDemanda(precisaCasoInteiro);

  let content = {
    dashboard: (
      <Dashboard
        state={state}
        progress={progress}
        go={go}
        openLesson={openLesson}
      />
    ),
    hidreletricas: <HydroGuide go={go} />,
    mapa: <MapaParana dados={mapaDados} state={state} setState={setState} />,
    formacao: (
      <Formation
        state={state}
        openLesson={openLesson}
      />
    ),
    fluxos: (
      <Flowcharts state={state} setState={setState} flowData={flowData} />
    ),
    laboratorio: erroCasos ? (
      <CasosIndisponiveis erro={erroCasos} />
    ) : !casosInteiros ? (
      <RouteLoading />
    ) : (
      <LaboratorioPremium
        state={state}
        setState={setState}
        scenarios={casosInteiros}
        grupos={GRUPOS_LAB}
        lessonMap={lessonMap}
        initialScenarioId={selectedScenario}
        onSelectScenario={(id) => {
          setSelectedScenario(id);
          pushHash("#/laboratorio/" + encodeURIComponent(id));
        }}
      />
    ),
    redator: erroCasos ? (
      <CasosIndisponiveis erro={erroCasos} />
    ) : !casosInteiros ? (
      <RouteLoading />
    ) : (
      <RedatorIT
        scenarios={casosInteiros}
        grupos={GRUPOS_LAB}
        state={state}
        setState={setState}
        go={go}
      />
    ),
    avaliacoes: (
      <Assessments state={state} setState={setState} openLesson={openLesson} />
    ),
    biblioteca: (
      <KnowledgeLibrary
        state={state}
        openLesson={openLesson}
        target={libraryTarget}
        dados={DADOS_BIBLIOTECA}
      />
    ),
    perfil: (
      <Profile
        state={state}
        progress={progress}
        profile={profile}
        setProfile={setProfile}
        profileStatus={profileStatus}
        setProfileStatus={setProfileStatus}
        go={go}
        openLesson={openLesson}
        dados={DADOS_PERFIL}
      />
    ),
    suporte: <Suporte />,
    lesson: (
      <Lesson
        lesson={lessonMap.get(selectedLesson) || lessons[0]}
        state={state}
        setState={setState}
        openLesson={openLesson}
        complete={complete}
        bookmark={bookmark}
        go={go}
      />
    ),
  }[view];
  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">
        Ir para o conteúdo
      </a>
      <Topbar
        onMenu={menuOpen ? closeMobileMenu : () => setMenuOpen(true)}
        menuOpen={menuOpen}
        menuButtonRef={mobileMenuButton}
        onSearch={openSearch}
        progress={progress}
        profile={profile}
        onProfile={() => go("perfil")}
        inert={searchOpen || (mobileNav && menuOpen)}
      />
      <Sidebar
        view={view}
        go={go}
        open={menuOpen}
        openLesson={openLesson}
        mobile={mobileNav}
        modalOpen={searchOpen}
        onClose={closeMobileMenu}
      />
      {menuOpen && (
        <button
          type="button"
          className="nav-scrim"
          aria-label="Fechar menu"
          onPointerDown={(event) => event.preventDefault()}
          onClick={closeMobileMenu}
        />
      )}
      <main
        id="conteudo"
        tabIndex={-1}
        inert={searchOpen || (mobileNav && menuOpen)}
        className={"main " + (view === "lesson" ? "lesson-main" : "")}
      >
        <div
          className="view-anim"
          key={view === "lesson" ? "l:" + selectedLesson : view}
        >
          <Suspense fallback={<RouteLoading />}>{content}</Suspense>
        </div>
      </main>
      <MobileBottomNav
        view={view}
        go={go}
        inert={searchOpen || (mobileNav && menuOpen)}
      />
      {searchOpen && (
        <GlobalSearch
          close={closeSearch}
          abrir={(r) => {
            setSearchOpen(false);
            if (r.type === "seção") return openLesson(r.id);
            setLibraryTarget(
              r.type === "sigla"
                ? { tab: "glossario", requestId: Date.now() }
                : { tab: "tabelas", tabela: r.id, requestId: Date.now() },
            );
            go("biblioteca");
          }}
        />
      )}
      {appDataWarnings.length > 0 && (
        <div className="data-warning-bar" role="alert">
          <AlertTriangle size={15} />
          <span>
            Parte da mídia não pôde ser carregada. As aulas e fontes textuais
            continuam disponíveis; alguns resumos usarão o material geral do módulo.
          </span>
        </div>
      )}
      {!online && (
        <div className="offline-bar" role="status">
          <CloudOff size={15} /> Sem conexão. O procedimento, os quadros, os
          fluxos e a prática continuam disponíveis; vídeos ainda não abertos
          ficam indisponíveis.
        </div>
      )}
      {storageStatus && (
        <div className="storage-error-bar" role="alert">
          <AlertTriangle size={15} />
          <span>
            {storageStatus.message}
            {storageStatus.code === "STORAGE_CORRUPT"
              ? ` ${storageStatus.detail || ""}`
              : storageStatus.code === "STORAGE_CONFLICT"
                ? ` ${storageStatus.detail || "Escolha qual versão deseja manter."}`
              : storageStatus.code === "STORAGE_QUOTA"
                ? " Libere espaço e altere qualquer item para tentar novamente."
                : " As mudanças desta sessão podem não ser preservadas."}
          </span>
          {storageStatus.recoveryAvailable && (
            <div className="storage-recovery-actions">
              <button type="button" onClick={() => resolveCorruptStorage("download")}>
                Baixar cópia
              </button>
              <button type="button" onClick={() => resolveCorruptStorage("reset")}>
                Começar novo
              </button>
            </div>
          )}
          {storageStatus.conflictAvailable && (
            <div className="storage-recovery-actions">
              <button type="button" onClick={() => resolveCorruptStorage("use-remote")}>
                Usar versão mais recente
              </button>
              <button type="button" onClick={() => resolveCorruptStorage("keep-local")}>
                Manter minhas mudanças
              </button>
            </div>
          )}
        </div>
      )}
      {aplicarUpdate && (
        <div className="update-bar" role="status">
          <RefreshCw size={15} />
          <span>Há uma versão nova da Academia.</span>
          <button onClick={() => aplicarUpdate()}>Atualizar agora</button>
          <button className="ub-depois" onClick={() => setAplicarUpdate(null)}>
            Depois
          </button>
        </div>
      )}
      {toast && (
        <div className="toast" role="status" aria-live="polite" aria-atomic="true">
          <CheckCircle2 />
          {toast}
        </div>
      )}
    </div>
  );
}

function RouteLoading() {
  return (
    <section className="route-loading" role="status" aria-live="polite">
      <span aria-hidden="true" />
      <div>
        <strong>Preparando esta área…</strong>
        <small>O conteúdo e o progresso permanecem no dispositivo.</small>
      </div>
    </section>
  );
}

// O corpo dos casos e um arquivo buscado, e arquivo buscado falha. Sem esta
// tela, a area ficaria em branco sem dizer por que, que e como um 404 de
// deploy em subcaminho se manifesta.
function CasosIndisponiveis({ erro }) {
  return (
    <section className="route-loading" role="alert">
      <span aria-hidden="true" />
      <div>
        <strong>Não foi possível carregar os casos</strong>
        <small>
          O catálogo de casos é baixado à parte para a plataforma abrir mais
          rápido. Recarregue a página; se persistir, verifique a conexão.
          {erro?.message ? ` Detalhe técnico: ${erro.message}.` : ""}
        </small>
      </div>
    </section>
  );
}

function Topbar({
  onMenu,
  menuOpen,
  menuButtonRef,
  onSearch,
  progress,
  profile,
  onProfile,
  inert,
}) {
  const _n = ((profile && profile.name) || "").trim();
  const _acc = hasAccount(profile);
  const _ini = _acc
    ? _n
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "IAT"
    : "+";
  return (
    <header className="topbar" inert={inert}>
      <button
        ref={menuButtonRef}
        className="mobile-menu"
        onClick={onMenu}
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={menuOpen}
        aria-controls="navegacao-lateral"
      >
        <Menu />
      </button>
      <div className="compact-brand">
        <span className="brand-wave">IAT</span>
        <div>
          <strong>Academia de Licenciamento</strong>
          <small>Hidrelétrico</small>
        </div>
      </div>
      <button
        className="global-search"
        onClick={onSearch}
        aria-label="Buscar no POP, aulas e checklists. Atalho Control K"
      >
        <Search />
        <span>Buscar no POP, aulas e checklists</span>
        <kbd aria-hidden="true">Ctrl K</kbd>
      </button>
      <div
        className="top-progress"
        title={`${progress}% concluído`}
        role="progressbar"
        aria-label="Progresso geral"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
      >
        <span>{progress}%</span>
        <i>
          <em style={{ width: `${progress}%` }} />
        </i>
      </div>
      <ThemeToggle />
      <button
        className="profile"
        onClick={onProfile}
        aria-label={
          _acc
            ? `Abrir progresso de ${_n} neste dispositivo`
            : "Criar perfil local neste dispositivo"
        }
        title={_acc ? "Ver meu progresso" : "Criar perfil local"}
      >
        <span aria-hidden="true">{_ini}</span>
        <div>
          <strong>{_acc ? _n.split(/\s+/)[0] : "Meu progresso"}</strong>
          <small>
            {_acc ? profile.role || "Neste dispositivo" : "Criar perfil local"}
          </small>
        </div>
      </button>
    </header>
  );
}
function Sidebar({
  view,
  go,
  open,
  openLesson,
  mobile,
  modalOpen,
  onClose,
}) {
  const hidden = mobile && !open;
  return (
    <aside
      id="navegacao-lateral"
      aria-hidden={hidden}
      aria-label={mobile && open ? "Menu principal" : undefined}
      aria-modal={mobile && open ? "true" : undefined}
      role={mobile && open ? "dialog" : undefined}
      inert={hidden || modalOpen}
      className={"sidebar-v2 " + (open ? "open" : "")}
    >
      {mobile && open && (
        <button
          type="button"
          className="sidebar-mobile-close"
          aria-label="Fechar menu"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </button>
      )}
      <div className="brand-panel">
        <strong>Academia IAT</strong>
        <span>
          Licenciamento
          <br />
          Hidrelétrico
        </span>
        <svg viewBox="0 0 200 128" aria-hidden="true" className="brand-hydro">
          <rect
            x="8"
            y="52"
            width="62"
            height="26"
            rx="3"
            fill="#57d8bf"
            opacity=".85"
          />
          <path
            d="M10 56 q8 -4 16 0 t16 0 t16 0 t14 0"
            stroke="#eafff7"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M70 46 L70 92 L92 92 L84 46 Z"
            fill="#e6efe9"
            stroke="#a8d5c2"
            strokeWidth="1.5"
          />
          <path
            d="M74 52 L74 88 M79 56 L80 88 M84 62 L86 88"
            stroke="#9db8ab"
            strokeWidth="1.4"
          />
          <path
            d="M86 58 L112 84"
            stroke="#0b3b2d"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M86 58 L112 84"
            stroke="#57d8bf"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 6"
          />
          <rect
            x="110"
            y="76"
            width="30"
            height="18"
            rx="2"
            fill="#fff"
            stroke="#57d8bf"
            strokeWidth="1.6"
          />
          <path d="M110 76 L125 66 L140 76 Z" fill="#57d8bf" />
          <path d="M124 80 l-4 7 h4 l-3 7 8 -9 h-4 l4 -5 Z" fill="#f3bd4f" />
          <path
            d="M150 44 L150 94 M141 58 L159 58 M143 48 L157 48"
            stroke="#eafff7"
            strokeWidth="2.6"
          />
          <path d="M140 94 L160 94" stroke="#eafff7" strokeWidth="2.6" />
          <path
            d="M150 44 C162 38 174 42 186 34"
            stroke="#f3bd4f"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="188" cy="33" r="3.4" fill="#f3bd4f" />
          <g transform="translate(18 88)">
            <path
              d="M0 12 C10 4 24 4 34 9 C44 4 58 4 68 12 L68 32 C58 25 44 25 34 29 C24 25 10 25 0 32 Z"
              fill="#fff"
              stroke="#57d8bf"
              strokeWidth="2.4"
            />
            <path d="M34 9 L34 29" stroke="#57d8bf" strokeWidth="2.2" />
            <path
              d="M7 14 L28 12 M7 19 L28 17 M7 24 L28 22 M40 12 L61 14 M40 17 L61 19 M40 22 L61 24"
              stroke="#0b3b2d"
              strokeWidth="1.5"
              opacity=".55"
            />
            <path
              d="M26 -2 L42 -2 L34 3 Z M34 -2 L34 -8 M30 -8 L38 -8"
              stroke="#f3bd4f"
              strokeWidth="2"
              fill="#f3bd4f"
            />
          </g>
        </svg>
      </div>
      <nav aria-label="Navegação principal">
        {NAV_GRUPOS.map(([grupo, itens]) => {
          const rotuloId = grupo ? `nav-grupo-${norm(grupo).replace(/\s+/g, "-")}` : undefined;
          const botoes = itens.map(([id, label, Icon]) => {
            const at = view === id || (view === "lesson" && id === "formacao");
            return (
              <button
                key={id}
                aria-current={at ? "page" : undefined}
                className={at ? "active" : ""}
                onClick={() => go(id)}
              >
                <Icon />
                {label}
              </button>
            );
          });
          if (!grupo) return botoes;
          return (
            // O rotulo do grupo e visivel e tambem nomeia o conjunto para quem
            // usa leitor de tela, por aria-labelledby. Repetir o nome num
            // aria-label faria o texto ser anunciado duas vezes.
            <div className="side-group" role="group" aria-labelledby={rotuloId} key={grupo}>
              <p className="side-group-label" id={rotuloId}>{grupo}</p>
              {botoes}
            </div>
          );
        })}
      </nav>
      <button
        className="sidebar-help"
        onClick={() => openLesson && openLesson(firstLesson("m00")?.id)}
      >
        <CircleHelp />
        <div>
          <strong>Por onde começar?</strong>
          <small>Abra o módulo de Orientação</small>
        </div>
        <ChevronRight />
      </button>
      <div className="source-lock">
        <ShieldCheck />
        <span>
          Fonte vinculada
          <br />
          <b>
            POP v{popData.metadata?.operational?.version || "—"} ·{" "}
            {popData.metadata?.operational?.dateLabel || "data não informada"}
          </b>
          <small>{lessons.length} tópicos didáticos · minuta técnica</small>
          <small
            className="platform-build"
            data-build-sha={BUILD_STAMP}
            title={`Build completo: ${BUILD_STAMP}`}
          >
            Build da plataforma · {BUILD_LABEL}
          </small>
        </span>
      </div>
    </aside>
  );
}

function MobileBottomNav({ view, go, inert }) {
  const destinations = [
    {
      id: "dashboard",
      label: "Início",
      Icon: Home,
      views: ["dashboard"],
    },
    {
      id: "formacao",
      label: "Aprender",
      Icon: BookOpen,
      views: ["hidreletricas", "formacao", "lesson"],
    },
    {
      id: "laboratorio",
      label: "Praticar",
      Icon: FlaskConical,
      views: ["laboratorio", "redator", "avaliacoes"],
    },
    {
      id: "biblioteca",
      label: "Consultar",
      Icon: Library,
      views: ["fluxos", "mapa", "biblioteca"],
    },
  ];

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Navegação principal no celular"
      inert={inert}
    >
      {destinations.map(({ id, label, Icon, views }) => {
        const active = views.includes(view);
        return (
          <button
            type="button"
            key={id}
            className={active ? "active" : ""}
            aria-current={active ? "page" : undefined}
            onClick={() => go(id)}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function SourceAssurance({ compact = false }) {
  const op = popData.metadata?.operational || {};
  const sha = popData.source?.sha256 || popData.source?.hash || "";
  const sourceFileName =
    popData.source?.fileName || "Documento-fonte não identificado";
  const generated = popData.generatedAt ? new Date(popData.generatedAt) : null;
  const validDate = generated && !Number.isNaN(generated.getTime());
  return (
    <section
      className={"source-assurance " + (compact ? "compact" : "")}
      aria-label="Estado da fonte e da validação"
    >
      <ShieldCheck />
      <div>
        <small>FONTE DO PERCURSO</small>
        <strong>
          POP {op.version ? `v${op.version}` : "sem versão identificada"} ·{" "}
          {lessons.length} tópicos vinculados
        </strong>
        <span
          title={sourceFileName}
          aria-label={`Documento-fonte: ${sourceFileName}`}
        >
          {sourceFileName}
        </span>
      </div>
      <dl>
        <div>
          <dt>Extração</dt>
          <dd>
            {validDate
              ? generated.toLocaleDateString("pt-BR")
              : "data não registrada"}
          </dd>
        </div>
        <div>
          <dt>Integridade</dt>
          <dd>{sha ? `SHA-256 ${sha.slice(0, 10)}…` : "hash pendente"}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>Minuta técnica · validação institucional pendente</dd>
        </div>
      </dl>
    </section>
  );
}

function Dashboard({ state, progress, go, openLesson }) {
  const continueLesson =
    lessonMap.get(state.lastLesson) || firstLesson("m00") || lessons[0];
  const continueTrack =
    tracks.find((t) => t.id === continueLesson.trackId) || tracks[0];
  const feat = mediaForLesson(continueLesson);
  return (
    <div className="page dashboard-page">
      <section className="dashboard-intro">
        <div>
          <h1>
            Aprenda o procedimento.
            <br />
            Pratique a decisão.
          </h1>
          <p>
            Do primeiro contato ao controle de qualidade: estude a fonte,
            confronte evidências e treine decisões justificadas.
          </p>
        </div>
      </section>
      <section className="dashboard-feature">
        <div className="feature-media">
          <VideoLearningStage
            key={feat?.src}
            media={{
              ...feat,
              poster:
                feat?.poster || wb("/media/analista-licenciamento.png"),
            }}
            track={continueTrack}
            lesson={continueLesson}
            compact
          />
          <span>Resumo em vídeo desta aula</span>
          <span className="fm-chip">
            <Clock /> Conteúdo vinculado ao tópico
          </span>
        </div>
        <div className="feature-copy">
          <small>{continueTrack.code} · CONTINUE DE ONDE PAROU</small>
          <h2>{continueLesson.fullTitle || continueLesson.title}</h2>
          <p>{continueTrack.summary}</p>
          <div className="feature-meta">
            <span>
              <Clock /> {continueLesson.minutes} min
            </span>
            <span>
              <Layers3 /> {trackLessons.get(continueTrack.id).length} tópicos
            </span>
          </div>
          <div
            className="feature-progress"
            role="progressbar"
            aria-label="Progresso geral"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={progress}
          >
            <span>
              Seu progresso <b>{progress}%</b>
            </span>
            <i>
              <em style={{ width: `${progress}%` }} />
            </i>
            <small>
              {state.completed.length} de {lessons.length} tópicos concluídos
            </small>
          </div>
          <button
            className="primary"
            onClick={() => openLesson(continueLesson.id)}
          >
            Continuar aula <Play />
          </button>
          <button className="text-action" onClick={() => go("formacao")}>
            Ver todas as aulas <ArrowRight />
          </button>
        </div>
        <CurrentObjectiveCard lesson={continueLesson} />
      </section>
      <section className="dashboard-bottom">
        <NextPracticeCard
          state={state}
          currentTrackId={continueTrack.id}
          go={go}
        />
        <ReviewErrorsCard state={state} go={go} openLesson={openLesson} />
      </section>
      <DashboardPhases
        state={state}
        currentTrackId={continueTrack.id}
        openLesson={openLesson}
        go={go}
      />
      <DashboardSourceDetails go={go} />
    </div>
  );
}
function CurrentObjectiveCard({ lesson }) {
  const blocks = (lesson.blockIds || [])
    .map((id) => blockMap.get(id))
    .filter((block) => block && !block.navigationOnly);
  const design = getLearningDesign(lesson, blocks);

  return (
    <aside className="current-objective-card">
      <span>
        <Target aria-hidden="true" /> Objetivo atual
      </span>
      <h2>O que você deve conseguir fazer</h2>
      <p>{design.objective}</p>
      <small>
        Ao concluir, registre a recuperação ativa e confira os critérios da
        própria aula.
      </small>
    </aside>
  );
}

function NextPracticeCard({ state, currentTrackId, go }) {
  const labs = state.labs || {};
  const inProgress = scenarios.find(
    (scenario) => labs[scenario.id]?.status === "em_andamento",
  );
  const nextPractice =
    inProgress ||
    scenarios.find(
      (scenario) => scenario.track === currentTrackId && !labs[scenario.id],
    ) ||
    scenarios.find((scenario) => !labs[scenario.id]) ||
    scenarios[0];
  const continuing = labs[nextPractice.id]?.status === "em_andamento";

  return (
    <article className="dashboard-action-card practice">
      <header>
        <FlaskConical aria-hidden="true" />
        <span>Próxima prática</span>
      </header>
      <small>{nextPractice.label}</small>
      <h2>{nextPractice.title}</h2>
      <p>
        {continuing
          ? "Retome as evidências e decisões que ficaram salvas neste dispositivo."
          : "Aplique o que estudou a um caso sintético e fundamente a decisão."}
      </p>
      <button type="button" onClick={() => go("laboratorio", nextPractice.id)}>
        {continuing ? "Continuar caso" : "Praticar este caso"} <ArrowRight />
      </button>
    </article>
  );
}

function ReviewErrorsCard({ state, go, openLesson }) {
  const diagnostic = state.diagnostico?.saida || state.diagnostico?.entrada;
  const errors = Object.values(diagnostic?.porQuestao || {}).filter(
    (record) => record?.ok === false,
  );
  const firstErrorTrack = errors.find((record) => record.track)?.track;
  const reviewTrack = tracks.find((track) => track.id === firstErrorTrack);
  const reviewLesson = reviewTrack
    ? lessonMap.get(reviewTrack.remediationLessonId) || firstLesson(reviewTrack.id)
    : null;

  return (
    <article className="dashboard-action-card review">
      <header>
        <AlertTriangle aria-hidden="true" />
        <span>Erros para revisar</span>
      </header>
      {!diagnostic ? (
        <>
          <h2>Nenhum erro registrado ainda</h2>
          <p>Faça a autoavaliação para receber pontos de revisão direcionados.</p>
          <button type="button" onClick={() => go("avaliacoes")}>
            Fazer autoavaliação <ArrowRight />
          </button>
        </>
      ) : errors.length === 0 ? (
        <>
          <h2>Nenhum erro na última aplicação</h2>
          <p>Continue o percurso e reaplique os itens no momento de revisão.</p>
          <button type="button" onClick={() => go("avaliacoes")}>
            Abrir avaliações <ArrowRight />
          </button>
        </>
      ) : (
        <>
          <strong className="dashboard-error-count">{errors.length}</strong>
          <h2>{errors.length === 1 ? "ponto pede revisão" : "pontos pedem revisão"}</h2>
          <p>
            {reviewTrack
              ? `Comece por ${reviewTrack.code} · ${reviewTrack.title}.`
              : "Abra a avaliação para revisar o feedback comentado."}
          </p>
          <button
            type="button"
            onClick={() =>
              reviewLesson ? openLesson(reviewLesson.id) : go("avaliacoes")
            }
          >
            Revisar agora <ArrowRight />
          </button>
        </>
      )}
    </article>
  );
}

function DashboardPhases({ state, currentTrackId, openLesson, go }) {
  return (
    <section className="dashboard-phases-section" aria-labelledby="dashboard-phases-title">
      <div className="dashboard-section-heading">
        <div>
          <h2 id="dashboard-phases-title">Quatro fases do percurso</h2>
          <p>A sequência permanece única, de M00 a M16.</p>
        </div>
        <button type="button" onClick={() => go("formacao")}>
          Ver formação completa <ArrowRight />
        </button>
      </div>
      <ol className="dashboard-phases">
        {trackGroups.map((group, index) => {
          const phaseTracks = group.ids
            .map((id) => tracks.find((track) => track.id === id))
            .filter(Boolean);
          const phaseLessons = group.ids.flatMap(
            (id) => trackLessons.get(id) || [],
          );
          const completed = phaseLessons.filter((lesson) =>
            state.completed.includes(lesson.id),
          ).length;
          const percent = phaseLessons.length
            ? Math.round((completed / phaseLessons.length) * 100)
            : 0;
          const destination =
            phaseLessons.find((lesson) => !state.completed.includes(lesson.id)) ||
            phaseLessons[0];
          const current = group.ids.includes(currentTrackId);
          return (
            <li key={group.title} className={current ? "current" : ""}>
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => destination && openLesson(destination.id)}
              >
                <span className="dashboard-phase-number">
                  {percent === 100 ? <Check aria-hidden="true" /> : index + 1}
                </span>
                <span className="dashboard-phase-copy">
                  <small>
                    Fase {index + 1} · {phaseTracks[0]?.code}–
                    {phaseTracks.at(-1)?.code}
                  </small>
                  <strong>{group.title}</strong>
                </span>
                <span className="dashboard-phase-progress">
                  <b>{percent}%</b>
                  <i>
                    <em style={{ width: `${percent}%` }} />
                  </i>
                </span>
                <ChevronRight aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DashboardSourceDetails({ go }) {
  return (
    <details className="dashboard-source-details">
      <summary>
        <Database aria-hidden="true" />
        <span>
          <strong>Sobre a fonte</strong>
          <small>Versão, integridade e cobertura documental</small>
        </span>
        <ChevronRight aria-hidden="true" />
      </summary>
      <div>
        <SourceAssurance />
        <dl className="dashboard-source-metrics">
          <div>
            <dt>Tópicos didáticos</dt>
            <dd>{lessons.length}</dd>
          </div>
          <div>
            <dt>Quadros e tabelas</dt>
            <dd>{popData.tables.filter((table) => !table.navigationOnly).length}</dd>
          </div>
          <div>
            <dt>Figuras e fluxos</dt>
            <dd>
              {popData.figures.length +
                new Set(flowData.flowcharts.map((flow) => flow.number)).size}
            </dd>
          </div>
          <div>
            <dt>Trechos pesquisáveis</dt>
            <dd>
              {(popData.stats?.allDocumentParagraphNodes || 0).toLocaleString(
                "pt-BR",
              )}
            </dd>
          </div>
        </dl>
        <button type="button" onClick={() => go("biblioteca")}>
          Abrir biblioteca <ArrowRight />
        </button>
      </div>
    </details>
  );
}

function Formation({ state, openLesson }) {
  const [openTrack, setOpenTrack] = useState("m00"),
    [filter, setFilter] = useState("");
  return (
    <div className="page">
      <PageHeader
        title="Formação guiada pelo POP"
        subtitle={`${tracks.length} módulos conectam cada seção do POP a objetivos, conteúdo-fonte, prática e avaliação.`}
        icon={GraduationCap}
      />
      <div className="formation-toolbar">
        <div role="search">
          <Search aria-hidden="true" />
          <input
            aria-label="Filtrar módulos ou aulas"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filtrar módulos ou aulas"
          />
        </div>
        <span>
          {lessons.length} tópicos ·{" "}
          {tracks.reduce(
            (a, t) =>
              a +
              (trackLessons.get(t.id)?.reduce((x, l) => x + l.minutes, 0) || 0),
            0,
          )}{" "}
          min estimados
        </span>
      </div>
      <div className="curriculum">
        {trackGroups.map((group) => (
          <section key={group.title}>
            <div className="group-title">
              <span>{group.title}</span>
              <i />
            </div>
            {group.ids.map((id) => {
              const t = tracks.find((x) => x.id === id),
                full = trackLessons.get(id) || [],
                ls = full.filter((l) =>
                  norm(l.title + " " + (l.number || "")).includes(norm(filter)),
                ),
                p = trackProgress(id, state),
                Icon = TRACK_ICONS[t.icon] || BookOpen;
              if (
                filter &&
                !norm(t.title + " " + t.code).includes(norm(filter)) &&
                !ls.length
              )
                return null;
              const show = filter && !ls.length ? full : ls;
              const expanded =
                openTrack === id || (!!filter && show.length > 0);
              return (
                <article
                  className={"track-row " + (expanded ? "expanded" : "")}
                  key={id}
                >
                  <button
                    className="track-summary"
                    aria-expanded={expanded}
                    onClick={() => setOpenTrack(openTrack === id ? "" : id)}
                  >
                    <span className="track-icon" style={{ "--track": t.color }}>
                      <Icon />
                    </span>
                    <span className="track-copy">
                      <small>{t.code}</small>
                      <strong>{t.title}</strong>
                      <em>{t.summary}</em>
                    </span>
                    <span className="track-metrics">
                      <b>{p}%</b>
                      <i>
                        <em style={{ width: `${p}%` }} />
                      </i>
                      <small>
                        {
                          state.completed.filter((x) =>
                            full.some((l) => l.id === x),
                          ).length
                        }
                        /{full.length} tópicos
                      </small>
                    </span>
                    <ChevronRight />
                  </button>
                  {expanded && (
                    <div className="lesson-list">
                      {show.map((l) => (
                        <button key={l.id} onClick={() => openLesson(l.id)}>
                          <span
                            className={
                              state.completed.includes(l.id) ? "complete" : ""
                            }
                          >
                            {state.completed.includes(l.id) ? (
                              <Check />
                            ) : (
                              full.indexOf(l) + 1
                            )}
                          </span>
                          <span>
                            <strong>
                              {l.number ? `${l.number} ` : ""}
                              {l.title}
                            </strong>
                            <small>
                              {l.minutes} min estimados · Fonte vinculada ao POP
                            </small>
                          </span>
                          {state.bookmarks.includes(l.id) && (
                            <BookmarkCheck className="saved" />
                          )}
                          <ChevronRight />
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}

function Lesson({
  lesson,
  state,
  setState,
  openLesson,
  complete,
  bookmark,
  go,
}) {
  const [tab, setTab] = useState("aula"),
    [outlineOpen, setOutlineOpen] = useState(true);
  const [completionNotice, setCompletionNotice] = useState(false);
  const track = tracks.find((t) => t.id === lesson.trackId) || tracks[0];
  // Antes toda subaula de um modulo mostrava o mesmo video. Agora cada secao tem
  // o seu, montado a partir do texto dela; o video do modulo fica de reserva
  // para as poucas secoes sem conteudo proprio.
  const media = mediaForLesson(lesson);
  const ls = trackLessons.get(track.id) || [];
  const index = ls.findIndex((l) => l.id === lesson.id);
  const ORDEM = trackGroups.flatMap((g) => g.ids);
  const proxTrack = ORDEM[ORDEM.indexOf(track.id) + 1];
  const next =
    ls[index + 1] ||
    (proxTrack ? (trackLessons.get(proxTrack) || [])[0] : null) ||
    lessons[lesson.order + 1];
  const blocks = (lesson.blockIds || [])
    .map((id) => blockMap.get(id))
    .filter((b) => b && !b.navigationOnly);
  const tables = blocks
    .filter((b) => b.type === "table")
    .map((b) => tableMap.get(b.tableId))
    .filter(Boolean);
  const figures = popData.figures.filter(
    (f) => f.blockId && lesson.blockIds?.includes(f.blockId),
  );
  const note = state.notes[lesson.id] || "";
  const design = getLearningDesign(lesson, blocks);
  const evidence = state.lessonEvidence?.[lesson.id] || {};
  const questionSelection = selectLessonQuestion(questionBank, lesson, index);
  const question = questionSelection?.question || null;
  const hasObjectiveCheck = lessonQuestionProvesObjective(questionSelection);
  const scenarioSelection = selectLessonScenario(
    scenarios,
    track.id,
    index,
    lesson.id,
  );
  const objectiveCorrect =
    hasObjectiveCheck &&
    evidence.objectiveQuestionId === question.id &&
    evidence.objectiveCorrect === true;
  const evidenceStatus = lessonEvidenceStatus(
    { ...evidence, objectiveCorrect },
    {
      criterionCount: design.mastery.length,
      hasObjectiveCheck,
    },
  );
  useEffect(() => {
    scrollTo({ top: 0 });
    setCompletionNotice(false);
  }, [lesson.id]);
  useEffect(() => {
    const list = document.querySelector(".lesson-tabs");
    if (!list) return;
    const buttons = [...list.querySelectorAll('[role="tab"]')];
    const keyboard = (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key))
        return;
      event.preventDefault();
      const current = buttons.indexOf(document.activeElement);
      const next =
        event.key === "Home"
          ? 0
          : event.key === "End"
            ? buttons.length - 1
            : (current +
                (event.key === "ArrowRight" ? 1 : -1) +
                buttons.length) %
              buttons.length;
      buttons[next].click();
      buttons[next].focus();
    };
    list.addEventListener("keydown", keyboard);
    return () => list.removeEventListener("keydown", keyboard);
  }, [tab, lesson.id]);
  function setNote(v) {
    setState((s) => ({ ...s, notes: { ...s.notes, [lesson.id]: v } }));
  }
  function updateLessonEvidence(change) {
    setState((s) => {
      const current = s.lessonEvidence?.[lesson.id] || {};
      const next = typeof change === "function" ? change(current) : change;
      return {
        ...s,
        lessonEvidence: {
          ...(s.lessonEvidence || {}),
          [lesson.id]: next,
        },
      };
    });
  }
  function answerLessonQuestion(optionIndex) {
    if (!question) return;
    updateLessonEvidence((current) => ({
      ...current,
      objectiveQuestionId: question.id,
      objectiveSelected: optionIndex,
      objectiveCorrect: optionIndex === question.answer,
      objectiveAttempts: (Number(current.objectiveAttempts) || 0) + 1,
    }));
  }
  function retryLessonQuestion() {
    updateLessonEvidence((current) => ({
      ...current,
      objectiveQuestionId: question?.id || "",
      objectiveSelected: null,
      objectiveCorrect: false,
    }));
  }
  function toggleEvidenceCriterion(criterionIndex) {
    updateLessonEvidence((current) => {
      const criteria = Array.isArray(current.criteria)
        ? current.criteria.filter(Number.isInteger)
        : [];
      return {
        ...current,
        criteria: criteria.includes(criterionIndex)
          ? criteria.filter((item) => item !== criterionIndex)
          : [...criteria, criterionIndex],
      };
    });
  }
  function requestCompletion() {
    if (
      !state.completed.includes(lesson.id) &&
      !evidenceStatus.ready
    ) {
      setCompletionNotice(true);
      setTab("aula");
      setTimeout(() => {
        const target = document.getElementById(`pratica-ativa-${lesson.id}`);
        target?.scrollIntoView({
          behavior:
            typeof matchMedia !== "undefined" &&
            matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "auto"
              : "smooth",
          block: "center",
        });
        target?.focus?.({ preventScroll: true });
      }, 0);
      return;
    }
    setCompletionNotice(false);
    complete(lesson.id);
  }
  return (
    <div
      className={"lesson-layout " + (!outlineOpen ? "outline-collapsed" : "")}
    >
      <aside className="lesson-outline">
        <button
          className="outline-toggle"
          aria-label={
            outlineOpen ? "Recolher sumário da aula" : "Abrir sumário da aula"
          }
          title={outlineOpen ? "Recolher sumário" : "Abrir sumário"}
          onClick={() => setOutlineOpen((v) => !v)}
        >
          {outlineOpen ? <PanelLeftClose /> : <PanelLeftOpen />}
        </button>
        {outlineOpen && (
          <>
            <button className="back-course" onClick={() => go("formacao")}>
              <ChevronLeft /> Voltar à formação
            </button>
            <div className="outline-track">
              <span style={{ background: track.color, "--tc": track.color }}>
                {track.code}
              </span>
              <div>
                <strong>{track.title}</strong>
                <small>{trackProgress(track.id, state)}% concluído</small>
              </div>
            </div>
            <div className="outline-lessons">
              {ls.map((l, i) => (
                <button
                  className={l.id === lesson.id ? "active" : ""}
                  aria-current={l.id === lesson.id ? "page" : undefined}
                  key={l.id}
                  onClick={() => openLesson(l.id)}
                >
                  <span
                    className={state.completed.includes(l.id) ? "done" : ""}
                  >
                    {state.completed.includes(l.id) ? <Check /> : i + 1}
                  </span>
                  <span>
                    {l.number && <small>{l.number}</small>}
                    <strong>{l.title}</strong>
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </aside>
      <div className="lesson-content">
        <div className="breadcrumbs">
          <button onClick={() => go("formacao")}>Formação</button>
          <ChevronRight />
          <span>{track.code}</span>
          <ChevronRight />
          <span>{lesson.number || "Introdução"}</span>
        </div>
        <header className="lesson-header">
          <div>
            <h1>
              {lesson.number && <span>{lesson.number}</span>} {lesson.title}
            </h1>
            <p>
              <Target /> {design.objective}
            </p>
          </div>
          <button
            className="bookmark-btn"
            aria-label={
              state.bookmarks.includes(lesson.id)
                ? "Remover aula dos favoritos"
                : "Salvar aula nos favoritos"
            }
            aria-pressed={state.bookmarks.includes(lesson.id)}
            onClick={() => bookmark(lesson.id)}
          >
            {state.bookmarks.includes(lesson.id) ? (
              <BookmarkCheck />
            ) : (
              <Bookmark />
            )}
          </button>
        </header>
        <VideoLesson
          key={media?.src || lesson.id}
          media={media}
          track={track}
          lesson={lesson}
        />
        <SourceAssurance compact />
        <LearningContract design={design} />
        <div
          className="lesson-tabs"
          role="tablist"
          aria-label="Recursos da aula"
        >
          {[
            ["aula", "Aula guiada", BookOpen],
            ["fonte", "Fonte do POP", FileText],
            ["materiais", "Quadros e figuras", Layers3],
            ["notas", "Anotações", StickyNote],
          ].map(([id, label, Icon]) => (
            <button
              role="tab"
              id={`aba-aula-${lesson.id}-${id}`}
              aria-controls={`painel-aula-${lesson.id}`}
              aria-selected={tab === id}
              tabIndex={tab === id ? 0 : -1}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
              key={id}
            >
              <Icon />
              {label}
              {id === "materiais" && (
                <span>{tables.length + figures.length}</span>
              )}
            </button>
          ))}
        </div>
        <div
          className="tab-panel"
          id={`painel-aula-${lesson.id}`}
          role="tabpanel"
          aria-labelledby={`aba-aula-${lesson.id}-${tab}`}
          key={tab}
        >
          {tab === "aula" && (
            <LessonOverview
              lesson={lesson}
              design={design}
              blocks={blocks}
              setTab={setTab}
              openLesson={openLesson}
              caso={scenarioSelection?.scenario || null}
              casoPergunta={scenarioSelection?.questionIndex || 0}
              casoEscopo={scenarioSelection?.scope || "module"}
              go={go}
              evidence={evidence}
              evidenceStatus={evidenceStatus}
              updateEvidence={updateLessonEvidence}
              toggleEvidenceCriterion={toggleEvidenceCriterion}
              questionSelection={questionSelection}
              answerLessonQuestion={answerLessonQuestion}
              retryLessonQuestion={retryLessonQuestion}
              checked={state.checks?.[lesson.id] || []}
              toggleCheck={(i) =>
                setState((s) => {
                  const cur = s.checks?.[lesson.id] || [];
                  const nx = cur.includes(i)
                    ? cur.filter((x) => x !== i)
                    : [...cur, i];
                  return {
                    ...s,
                    checks: { ...(s.checks || {}), [lesson.id]: nx },
                  };
                })
              }
            />
          )}{" "}
          {tab === "fonte" && <SourceContent blocks={blocks} />}{" "}
          {tab === "materiais" && (
            <LessonMaterials tables={tables} figures={figures} />
          )}{" "}
          {tab === "notas" && <Notes value={note} setValue={setNote} />}
        </div>
        {index === ls.length - 1 && (
          <section className="modulo-fim">
            <div className="mf-head">
              <Trophy size={18} />
              <div>
                <small>FIM DO MÓDULO {track.code}</small>
                <h3>{track.title}</h3>
              </div>
              <b>{trackProgress(track.id, state)}%</b>
            </div>
            <p className="mf-resumo">{track.summary}</p>
            <div className="mf-acoes">
              {questionBank.some((q) => q.track === track.id) && (
                <button className="primary" onClick={() => go("avaliacoes")}>
                  <ClipboardCheck size={16} /> Testar o que aprendi em{" "}
                  {track.code}
                </button>
              )}
              {scenarios.some((c) => c.track === track.id) && (
                <button
                  className="text-action"
                  onClick={() => go("laboratorio")}
                >
                  <FlaskConical size={15} /> Praticar num caso
                </button>
              )}
              {trackProgress(track.id, state) < 100 && (
                <span className="mf-falta">
                  Faltam{" "}
                  {ls.filter((l) => !state.completed.includes(l.id)).length}{" "}
                  aulas para fechar o módulo.
                </span>
              )}
            </div>
          </section>
        )}
        <footer className="lesson-footer">
          {completionNotice && !evidenceStatus.ready && (
            <p
              className="lesson-completion-notice"
              id={`conclusao-aviso-${lesson.id}`}
              role="alert"
            >
              {hasObjectiveCheck
                ? "Registre a recuperação ativa, confira ao menos dois critérios e acerte a checagem da própria seção antes de concluir este tópico."
                : "Registre a recuperação ativa e confira ao menos dois critérios antes de concluir este tópico. A revisão contextual do módulo é opcional e não interfere nesta conclusão."}
            </p>
          )}
          {state.completed.includes(lesson.id) && !evidenceStatus.ready && (
            <p className="lesson-legacy-completion">
              Conclusão registrada anteriormente. A prática ativa abaixo é
              recomendada para criar evidência de aprendizagem.
            </p>
          )}
          <button
            className={
              state.completed.includes(lesson.id)
                ? "completed"
                : evidenceStatus.ready
                  ? "ready"
                  : "needs-evidence"
            }
            aria-describedby={
              completionNotice ? `conclusao-aviso-${lesson.id}` : undefined
            }
            onClick={requestCompletion}
          >
            {state.completed.includes(lesson.id) ? (
              <CheckCircle2 />
            ) : (
              <Circle />
            )}
            {state.completed.includes(lesson.id)
              ? "Aula concluída"
              : evidenceStatus.ready
                ? "Concluir aula"
                : "Fazer prática para concluir"}
          </button>
          {next && (
            <button className="next-lesson" onClick={() => openLesson(next.id)}>
              <span>
                <small>PRÓXIMO TÓPICO</small>
                <strong>
                  {next.number ? `${next.number} ` : ""}
                  {next.title}
                </strong>
              </span>
              <ArrowRight />
            </button>
          )}
        </footer>
      </div>
      <aside className="lesson-context">
        <div className="context-sticky">
          <h3>Nesta aula</h3>
          <div className="context-progress">
            <span>Progresso do módulo</span>
            <b>{trackProgress(track.id, state)}%</b>
            <i>
              <em style={{ width: `${trackProgress(track.id, state)}%` }} />
            </i>
          </div>
          <nav>
            <button
              className={tab === "aula" ? "active" : ""}
              onClick={() => setTab("aula")}
            >
              <Target />
              Aula guiada{tab === "aula" ? <CheckCircle2 /> : <Circle />}
            </button>
            <button
              className={tab === "fonte" ? "active" : ""}
              onClick={() => setTab("fonte")}
            >
              <FileText />
              Fonte da seção{tab === "fonte" ? <CheckCircle2 /> : <Circle />}
            </button>
            <button
              className={tab === "materiais" ? "active" : ""}
              onClick={() => setTab("materiais")}
            >
              <Layers3 />
              {tables.length} tabelas · {figures.length} figuras
              {tab === "materiais" ? <CheckCircle2 /> : <Circle />}
            </button>
            <button
              className={tab === "notas" ? "active" : ""}
              onClick={() => setTab("notas")}
            >
              <StickyNote />
              Caderno pessoal{tab === "notas" ? <CheckCircle2 /> : <Circle />}
            </button>
          </nav>
          <div className="quick-tip">
            <Lightbulb />
            <div>
              <strong>Regra de ouro</strong>
              <p>
                Identifique documento, fundamento, suficiência, consequência e
                encaminhamento. Não comece pela conclusão.
              </p>
            </div>
          </div>
          {(() => {
            const sg = siglasDaAula(
              blocks
                .map((b) => (b && b.paragraph && b.paragraph.text) || "")
                .join(" "),
            );
            return sg.length ? (
              <div className="siglas-aula">
                <strong>
                  <BookMarked size={15} /> Siglas desta aula
                </strong>
                <dl>
                  {sg.map((x) => (
                    <React.Fragment key={x.sig}>
                      <dt>{x.sig}</dt>
                      <dd>
                        {x.nome}
                        {x.desc ? <em>{x.desc}</em> : null}
                      </dd>
                    </React.Fragment>
                  ))}
                </dl>
              </div>
            ) : null;
          })()}
        </div>
      </aside>
    </div>
  );
}
function LearningContract({ design }) {
  return (
    <section
      className="learning-contract"
      aria-labelledby="learning-contract-title"
    >
      <header>
        <div>
          <small>PERCURSO DE RACIOCÍNIO</small>
          <h2 id="learning-contract-title">Da compreensão à auditoria</h2>
        </div>
        <span>{design.levels.length} etapas de raciocínio</span>
      </header>
      <div className="learning-levels">
        {design.levels.map((level, index) => (
            <article key={level.id}>
              <span>{index + 1}</span>
              <div>
                <small>{level.label}</small>
                <p>{level.description}</p>
              </div>
            </article>
          ))}
      </div>
      <div className="learning-challenge">
        <Lightbulb />
        <div>
          <strong>Desafio de transferência</strong>
          <p>{design.challenge}</p>
        </div>
        <span>Registre sua resposta na prática ativa desta aula.</span>
      </div>
      <details>
        <summary>Critérios para autoauditar o registro</summary>
        <ul>
          {design.mastery.map((item) => (
            <li key={item}>
              <CheckCircle2 />
              {item}
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
function VideoLesson({ media, track, lesson }) {
  const ref = useRef(null);
  const [rate, setRate] = useState(1);
  const setSpeed = (r) => {
    setRate(r);
    if (ref.current) ref.current.playbackRate = r;
  };
  return (
    <figure className="video-lesson vl2">
      <VideoLearningStage
        media={media}
        track={track}
        lesson={lesson}
        videoRef={ref}
      />
      <figcaption>
        <span>
          <Play />
          {media.title}
        </span>
        <span className="vl-tools">
          <small>
            {media.propria
              ? "Resumo em vídeo desta seção"
              : "Resumo em vídeo do módulo"}{" "}
            ·{" "}
            {track.code}
          </small>
          {[1, 1.25, 1.5].map((r) => (
            <button
              key={r}
              className={rate === r ? "active" : ""}
              onClick={() => setSpeed(r)}
              title={"Velocidade " + r + "x"}
            >
              {r}x
            </button>
          ))}
        </span>
      </figcaption>
      <TranscriptPanel
        captions={media.captions}
        transcript={media.transcript}
        videoRef={ref}
        title={media.title}
      />
    </figure>
  );
}
// Como o criterio da aula aparece num processo.
//
// A aula apresenta o criterio do POP. Ela nao mostrava ninguem aplicando o
// criterio a um caso, e quem nunca analisou um processo le a regra e nao sabe
// o que fazer com ela. Este bloco abre o modulo com a situacao concreta que
// ele resolve.
//
// De proposito NAO mostra o desfecho: se mostrasse, o laboratorio viraria
// leitura. A aula enquadra o problema; a pratica resolve.
// A maioria dos quadros do POP nao e lista de referencia: e instrumento de
// decisao. A medicao dos 64 achou o mesmo esqueleto repetido, 17 com Status,
// 16 com Gravidade, 14 com "O que verificar" e 13 com "Encaminhamento padrao".
// O metodo do POP inteiro esta dentro das tabelas, e a tabela era renderizada
// crua: uma grade de celulas sem dizer para que serve.
//
// A leitura sai das colunas que o quadro REALMENTE tem, em tempo de execucao,
// entao nunca diverge do POP. Quadro sem esse esqueleto nao recebe nada.
function ComoLerEsteQuadro({ table }) {
  const guia = useMemo(() => comoLerQuadro(table), [table]);
  if (!guia) return null;
  return (
    <aside className="ler-quadro" aria-label="Como ler este quadro">
      <strong>
        <ListChecks size={15} aria-hidden="true" /> Como ler este quadro
      </strong>
      <p>
        Não é uma lista de referência: é um instrumento de decisão, com{" "}
        {guia.linhas} {guia.linhas === 1 ? "linha" : "linhas"}. Percorra as
        colunas na ordem.
      </p>
      <ol>
        {guia.colunas.map((c) => (
          <li key={c.nome} className={c.papel ? "" : "sem-papel"}>
            <b>{c.nome}</b>
            {c.papel ? <span>{c.papel}</span> : null}
          </li>
        ))}
      </ol>
      {guia.separaStatusDeGravidade && (
        <small>
          Status e gravidade são colunas diferentes de propósito. Um documento
          pode estar apresentado e ainda assim ser insuficiente, e a gravidade
          mede o efeito da lacuna sobre a decisão, não a falta formal do
          arquivo.
        </small>
      )}
    </aside>
  );
}

// As dez aulas do Anexo B sao rotulos de um modelo: no POP, "Conclusao" tem 74
// caracteres. Quem abria essas aulas via um titulo e quase nada, em dez das
// dezessete aulas do modulo de suficiencia, pendencias e conclusao, que e o
// mais importante do curso.
//
// O conteudo didatico delas ja existia dentro do Redator de IT: o que o POP
// exige em cada secao e o erro que mais aparece. Aqui as duas coisas se ligam.
// Nada inventado, e a pessoa sai da leitura para a pratica de escrever aquela
// secao no caso real.
function ComoEscreverEstaSecao({ lesson, blocks = [], go }) {
  const texto = blocks
    .map((b) => b?.paragraph?.text || "")
    .join(" ");
  if (!precisaDeComplemento(texto, lesson)) return null;
  const elemento = elementoDaAula(lesson);
  if (!elemento) return null;
  return (
    <section className="anexo-b-guia">
      <header>
        <FileText size={16} aria-hidden="true" />
        <div>
          <small>ESTA SEÇÃO NA INFORMAÇÃO TÉCNICA</small>
          <h3>
            Elemento {elemento.n} do item 23.1: {elemento.titulo}
          </h3>
        </div>
      </header>
      <div className="abg-exige">
        <strong>O que o POP exige aqui</strong>
        <p>{elemento.exige}</p>
      </div>
      <div className="abg-armadilha">
        <AlertTriangle size={15} aria-hidden="true" />
        <div>
          <strong>Erro recorrente</strong>
          <p>{elemento.armadilha}</p>
        </div>
      </div>
      <button type="button" onClick={() => go && go("redator")}>
        <FileText size={15} aria-hidden="true" /> Escrever esta seção no Redator
        <ArrowRight size={14} aria-hidden="true" />
      </button>
      <small>
        O texto do POP nesta seção é curto porque ela é um rótulo do modelo do
        Anexo B. A orientação acima vem do item 23.1, que descreve o conteúdo
        exigido em cada elemento.
      </small>
    </section>
  );
}

function ExemploNoProcesso({
  caso,
  questionIndex = 0,
  scope = "module",
  go,
}) {
  if (!caso) return null;
  const question = (caso.questions || [])[questionIndex]?.[0];
  return (
    <section className="exemplo-processo">
      <header>
        <Milestone size={16} />
        <div>
          <small>
            {scope === "section"
              ? "CASO COM FUNDAMENTO DIRETO NESTA AULA"
              : "EXEMPLO RELACIONADO DO MÓDULO"}
          </small>
          <h3>{caso.title}</h3>
        </div>
      </header>
      <ul className="ep-fatos">
        {(caso.facts || []).slice(0, 3).map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>
      <p className="ep-pergunta">
        <CircleHelp size={15} /> {question}
      </p>
      <button onClick={() => go && go("laboratorio", caso.id)}>
        <FlaskConical size={15} /> Decidir este caso no laboratório{" "}
        <ArrowRight size={14} />
      </button>
      <small className="ep-nota">
        O desfecho fica no laboratório, de propósito: ler a resposta não treina
        a decisão.
      </small>
    </section>
  );
}

function LessonKnowledgeCheck({ selection, evidence, answer, retry }) {
  if (!selection?.question) return null;
  const question = selection.question;
  const sameQuestion = evidence.objectiveQuestionId === question.id;
  const selected = sameQuestion ? evidence.objectiveSelected : null;
  const answered = Number.isInteger(selected);
  const correct = answered && selected === question.answer;
  const provesObjective = lessonQuestionProvesObjective(selection);
  return (
    <section
      className="lesson-knowledge-check"
      aria-labelledby={`checagem-${question.id}`}
    >
      <header>
        <div>
          <small>
            {selection.scope === "section"
              ? "CHECAGEM DA PRÓPRIA SEÇÃO"
              : "REVISÃO CONTEXTUAL DO MÓDULO"}
          </small>
          <h3 id={`checagem-${question.id}`}>Checagem de compreensão</h3>
        </div>
        <span className={provesObjective && correct ? "done" : ""}>
          {provesObjective && correct ? <CheckCircle2 /> : <Circle />}
          {provesObjective
            ? correct
              ? "Objetivo demonstrado"
              : "Pendente"
            : "Opcional"}
        </span>
      </header>
      {selection.scope === "module" && (
        <p className="lesson-check-scope">
          Revisão opcional: esta seção ainda não possui questão exclusiva. A
          pergunta retoma um conceito relacionado do mesmo módulo, mas não
          comprova o objetivo e não interfere na conclusão desta aula.
        </p>
      )}
      <fieldset>
        <legend>{question.question}</legend>
        <div className="lesson-check-options">
          {question.options.map((option, index) => (
            <button
              type="button"
              key={option}
              disabled={answered}
              aria-pressed={selected === index}
              aria-label={
                answered
                  ? `${String.fromCharCode(65 + index)}. ${option}. ${
                      index === question.answer
                        ? "Resposta correta."
                        : index === selected
                          ? "Sua resposta, incorreta."
                          : "Alternativa não selecionada."
                    }`
                  : undefined
              }
              className={
                answered
                  ? index === question.answer
                    ? "correct"
                    : index === selected
                      ? "wrong"
                      : ""
                  : selected === index
                    ? "selected"
                    : ""
              }
              onClick={() => answer(index)}
            >
              <span>{String.fromCharCode(65 + index)}</span>
              {option}
              {answered && index === question.answer && (
                <Check aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </fieldset>
      {answered && (
        <div
          className={`lesson-check-feedback ${correct ? "correct" : "wrong"}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {correct ? <CheckCircle2 /> : <AlertTriangle />}
          <div>
            <strong>{correct ? "Resposta alinhada" : "Resposta a revisar"}</strong>
            <p>{question.explanation}</p>
            {question.source?.quote && (
              <blockquote>
                “{question.source.quote}”
                <cite>POP · trecho vinculado à pergunta</cite>
              </blockquote>
            )}
            {!correct && (
              <button type="button" onClick={retry}>
                <RotateCcw /> Tentar novamente
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function LessonActivePractice({
  lesson,
  design,
  evidence,
  status,
  updateEvidence,
  toggleCriterion,
  hasObjectiveCheck,
}) {
  return (
    <section
      className={`lesson-active-practice ${status.ready ? "complete" : ""}`}
      id={`pratica-ativa-${lesson.id}`}
      tabIndex="-1"
      aria-labelledby={`pratica-ativa-titulo-${lesson.id}`}
    >
      <header>
        <div>
          <small>RECUPERAÇÃO ATIVA · REGISTRO LOCAL</small>
          <h3 id={`pratica-ativa-titulo-${lesson.id}`}>
            Demonstre o percurso, não apenas a leitura
          </h3>
        </div>
        <span className={status.ready ? "done" : ""}>
          {status.ready ? <CheckCircle2 /> : <Circle />}
          {status.ready ? "Registro mínimo completo" : "Em construção"}
        </span>
      </header>
      <div className="lesson-active-prompt">
        <Lightbulb aria-hidden="true" />
        <div>
          <strong>Desafio desta seção</strong>
          <p>{design.challenge}</p>
        </div>
      </div>
      <label className="lesson-active-response">
        <span>Sua análise em fato → evidência → fundamento → encaminhamento</span>
        <textarea
          value={evidence.response || ""}
          maxLength={2400}
          rows={6}
          onChange={(event) =>
            updateEvidence((current) => ({
              ...current,
              response: event.target.value,
            }))
          }
          placeholder="Escreva com suas palavras. Evite apenas copiar o POP: identifique o fato, a evidência necessária, o critério aplicável, a incerteza e o próximo passo."
        />
      </label>
      <div className="lesson-active-counter">
        <span className={status.responseRecorded ? "done" : ""}>
          {status.responseRecorded ? <Check /> : <Circle />}
          {status.responseLength}/{MIN_ACTIVE_RECALL_CHARS} caracteres
          significativos
        </span>
        <small>
          O limite mede somente existência de registro; não avalia qualidade.
        </small>
      </div>
      <fieldset className="lesson-active-rubric">
        <legend>Autoauditoria antes de concluir</legend>
        {design.mastery.map((criterion, index) => {
          const checked = status.criteria.includes(index);
          return (
            <label key={criterion} className={checked ? "checked" : ""}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleCriterion(index)}
              />
              <span className="lesson-active-criterion">{criterion}</span>
            </label>
          );
        })}
      </fieldset>
      <footer>
        <span className={status.selfAuditRecorded ? "done" : ""}>
          {status.selfAuditRecorded ? <CheckCircle2 /> : <Circle />}
          Ao menos 2 critérios conferidos
        </span>
        {hasObjectiveCheck && (
          <span className={status.objectiveMet ? "done" : ""}>
            {status.objectiveMet ? <CheckCircle2 /> : <Circle />}
            Checagem objetiva correta
          </span>
        )}
      </footer>
      <p className="lesson-active-limit">
        Este é um registro pessoal de autoestudo salvo neste navegador. A
        fundamentação escrita não foi corrigida nem aprovada por pessoa
        responsável; solicite conferência técnica quando houver efeito institucional.
      </p>
    </section>
  );
}

function LessonOverview({
  lesson,
  design,
  blocks,
  checked = [],
  toggleCheck,
  setTab,
  openLesson,
  caso,
  casoPergunta = 0,
  casoEscopo = "module",
  go,
  evidence,
  evidenceStatus,
  updateEvidence,
  toggleEvidenceCriterion,
  questionSelection,
  answerLessonQuestion,
  retryLessonQuestion,
}) {
  const allParas = blocks.filter(
    (b) =>
      b.type === "paragraph" && b.paragraph?.text && b.paragraph.text.trim(),
  );
  const steps = allParas.filter((b) => /^\d+\./.test(b.paragraph.text));
  const shown = steps.slice(0, 10);
  const doneN = shown.filter((_, i) => checked.includes(i)).length;
  const idxPasso = allParas.findIndex((b) => /^\d+\./.test(b.paragraph.text));
  const naoPasso = (b) =>
    !/^\d+\./.test(b.paragraph.text) && !b.paragraph.headingLevel;
  const prosa = (idxPasso < 0 ? allParas : allParas.slice(0, idxPasso)).filter(
    naoPasso,
  );
  const notas = idxPasso < 0 ? [] : allParas.slice(idxPasso).filter(naoPasso);
  const nTab = blocks.filter((b) => b.type === "table").length;
  const kids = lesson.number
    ? lessons.filter(
        (l) =>
          l.number &&
          l.number !== lesson.number &&
          l.number.startsWith(lesson.number + ".") &&
          l.number
            .slice(lesson.number.length + 1)
            .replace(/\.$/, "")
            .split(".").length === 1,
      )
    : [];
  const parent =
    lesson.number && lesson.number.includes(".")
      ? lesson.number.slice(0, lesson.number.lastIndexOf("."))
      : "";
  const irmaos = parent
    ? lessons.filter(
        (l) =>
          l.id !== lesson.id &&
          l.number &&
          l.number.startsWith(parent + ".") &&
          l.number
            .slice(parent.length + 1)
            .replace(/\.$/, "")
            .split(".").length === 1,
      )
    : [];
  const vazia = allParas.length === 0 && nTab === 0;
  return (
    <article className="lesson-article">
      <h2>
        {lesson.number ? lesson.number + " · " : ""}
        {lesson.title}
      </h2>
      <p className="lead">
        {vazia
          ? "Esta seção organiza o percurso; use os tópicos relacionados para demonstrar o objetivo."
          : kids.length
            ? "Esta seção reúne os tópicos abaixo. Estude cada um e volte ao desafio de transferência."
            : design.objective}
      </p>
      <blockquote className="learning-source-basis">
        <small>EVIDÊNCIA-BASE DA SEÇÃO</small>
        <p>{design.sourceBasis}</p>
        <button type="button" onClick={() => setTab && setTab("fonte")}>
          Conferir na fonte <ArrowRight />
        </button>
      </blockquote>
      {kids.length > 0 && (
        <nav className="lesson-children">
          <strong>
            <Layers3 size={15} /> Tópicos desta seção
          </strong>
          {kids.map((c) => (
            <button key={c.id} onClick={() => openLesson && openLesson(c.id)}>
              <span>{c.number}</span>
              <em>{c.title}</em>
              <ChevronRight size={15} />
            </button>
          ))}
        </nav>
      )}
      {nTab > 0 &&
        prosa.every((b) =>
          /^(Quadro|Tabela|Figura)\s*\d/i.test(b.paragraph.text),
        ) && (
          <div className="kp-quadro">
            <p className="kp-quadro-nota">
              <Table2 size={15} /> O conteúdo desta seção é um quadro do POP.
              Ele está abaixo, e também na aba Quadros e figuras.
            </p>
            {blocks
              .filter((b) => b.type === "table")
              .map((b) => {
                const t = tableMap.get(b.tableId);
                if (!t) return null;
                return (
                  <React.Fragment key={b.id}>
                    <ComoLerEsteQuadro table={t} />
                    <TableRenderer table={t} />
                  </React.Fragment>
                );
              })}
          </div>
        )}
      {prosa.length > 0 && (
        <div className="lesson-keypoints kp-fonte">
          {/* Estes paragrafos sao o texto do POP na redacao original, e nao
              parafrase da plataforma. Sem o rotulo, quem le nao tinha como
              distinguir a palavra da norma do comentario didatico, que neste
              dominio e a confusao mais grave possivel: transforma
              interpretacao em exigencia aos olhos de quem esta aprendendo. */}
          <strong className="kp-notas-tit">
            <Quote size={14} aria-hidden="true" /> Trechos do POP, na redação
            original
          </strong>
          {prosa.slice(0, 4).map((b) => (
            <p key={b.id}>{b.paragraph.text}</p>
          ))}
          {prosa.length > 4 && (
            <details className="lesson-more-prose">
              <summary>
                Continuar leitura guiada · {prosa.length - 4} trechos
              </summary>
              <div>
                {prosa.slice(4).map((block) => (
                  <p key={block.id}>{block.paragraph.text}</p>
                ))}
              </div>
            </details>
          )}
          <button
            className="kp-mais"
            onClick={() => setTab && setTab("fonte")}
          >
            <FileText size={15} /> Conferir a posição e a versão disponibilizada na
            fonte
          </button>
        </div>
      )}
      {steps.length >= 3 ? (
        <div className="lesson-checklist">
          <div className="lc-head">
            <strong>
              <ClipboardCheck size={16} /> Checklist da aula
            </strong>
            <span>
              {doneN}/{shown.length} verificados
            </span>
            <i>
              <em
                style={{
                  width: `${shown.length ? (doneN / shown.length) * 100 : 0}%`,
                }}
              />
            </i>
          </div>
          {shown.map((b, i) => {
            const on = checked.includes(i);
            return (
              <button
                type="button"
                key={b.id}
                className={on ? "lc-item done" : "lc-item"}
                aria-pressed={on}
                onClick={() => toggleCheck && toggleCheck(i)}
              >
                {on ? <CheckCircle2 /> : <Circle />}
                <span>{b.paragraph.text.replace(/^\d+\.\s*/, "")}</span>
              </button>
            );
          })}
          {doneN === shown.length && (
            <div className="lc-complete">
              <Check /> Checklist percorrido. Agora confronte os itens com a
              evidência do caso; marcar não prova suficiência.
            </div>
          )}
        </div>
      ) : null}
      {notas.length > 0 && (
        <div className="lesson-keypoints kp-notas">
          <strong className="kp-notas-tit">
            <Info size={15} /> Observações do procedimento
          </strong>
          {notas.slice(0, 3).map((b) => (
            <p key={b.id}>{b.paragraph.text}</p>
          ))}
          {notas.length > 3 && (
            <details className="lesson-more-prose">
              <summary>
                Ver as outras {notas.length - 3} observações
              </summary>
              <div>
                {notas.slice(3).map((block) => (
                  <p key={block.id}>{block.paragraph.text}</p>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
      <ComoEscreverEstaSecao lesson={lesson} blocks={blocks} go={go} />
      <ExemploNoProcesso
        caso={caso}
        questionIndex={casoPergunta}
        scope={casoEscopo}
        go={go}
      />
      {vazia && irmaos.length > 0 && (
        <nav className="lesson-children lc-related">
          <strong>
            <GitBranch size={15} /> Tópicos relacionados nesta parte
          </strong>
          {irmaos.slice(0, 12).map((c) => (
            <button key={c.id} onClick={() => openLesson && openLesson(c.id)}>
              <span>{c.number}</span>
              <em>{c.title}</em>
              <ChevronRight size={15} />
            </button>
          ))}
        </nav>
      )}
      {!vazia && (
        <>
          <div className="analysis-alert">
            <AlertTriangle />
            <div>
              <strong>Limite de aplicação</strong>
              <p>
                Este conteúdo ensina a aplicar o POP. Antes de decidir em
                processo real, confirme norma vigente, regra de transição,
                competência e orientação institucional aplicável.
              </p>
            </div>
          </div>
          <div className="example-compare">
            <div className="bad">
              <X />
              <div>
                <strong>Atalho arriscado</strong>
                <p>
                  Assumir a conclusão e procurar documentos apenas para
                  confirmá-la.
                </p>
              </div>
            </div>
            <div className="good">
              <Check />
              <div>
                <strong>Análise rastreável</strong>
                <p>
                  Confrontar evidências, registrar limitações e deixar a
                  conclusão resultar do percurso.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      <LessonKnowledgeCheck
        selection={questionSelection}
        evidence={evidence}
        answer={answerLessonQuestion}
        retry={retryLessonQuestion}
      />
      <LessonActivePractice
        lesson={lesson}
        design={design}
        evidence={evidence}
        status={evidenceStatus}
        updateEvidence={updateEvidence}
        toggleCriterion={toggleEvidenceCriterion}
        hasObjectiveCheck={lessonQuestionProvesObjective(questionSelection)}
      />
      {(prosa.length > 0 || steps.length > 0 || nTab > 0) && (
        <button
          className="source-jump"
          onClick={() => setTab && setTab("fonte")}
        >
          <BookMarked /> Conferir o trecho na fonte da seção
        </button>
      )}
    </article>
  );
}
function SourceContent({ blocks }) {
  if (!blocks.length)
    return (
      <Empty text="Esta seção funciona como título de organização. O conteúdo substantivo está nos subtópicos vinculados; a ausência de texto aqui não deve ser interpretada como cobertura integral." />
    );
  return (
    <article className="source-content">
      <div className="source-notice">
        <ShieldCheck />
        <p>
          <strong>Trechos vinculados ao documento-fonte.</strong> Esta aba
          reproduz os blocos associados à seção e suas tabelas. Sumário e
          elementos de navegação podem estar fora desta visualização; confira o
          arquivo original antes de usar o conteúdo em decisão real.
        </p>
      </div>
      {blocks.map((b) => (
        <BlockRenderer block={b} key={b.id} />
      ))}
    </article>
  );
}
function BlockRenderer({ block }) {
  if (block.type === "table") {
    const table = tableMap.get(block.tableId);
    return table ? <TableRenderer table={table} /> : null;
  }
  const p = block.paragraph;
  if (!p?.text) return null;
  const figure = figureByBlock.get(block.id);
  let text = p.text;
  let cls = p.semanticType === "list-item" || p.list ? "source-list" : "";
  return (
    <React.Fragment>
      {p.headingLevel ? <h3>{text}</h3> : <p className={cls}>{text}</p>}
      {figure && (
        <figure className="source-figure">
          <img src={figure.publicPath} alt={figure.altText || figure.title} />
          <figcaption>{figure.caption}</figcaption>
        </figure>
      )}
    </React.Fragment>
  );
}
function LessonMaterials({ tables, figures }) {
  if (!tables.length && !figures.length)
    return (
      <Empty text="Este tópico não possui quadro ou figura próprio. Consulte o conteúdo disponibilizado na fonte." />
    );
  return (
    <div className="materials-view">
      {figures.map((f) => (
        <figure className="material-figure" key={f.id}>
          <img src={f.publicPath} alt={f.altText || f.title} />
          <figcaption>{f.caption}</figcaption>
          <a href={f.publicPath} download>
            <Download /> Baixar imagem
          </a>
        </figure>
      ))}
      {tables.map((t) => (
        <TableRenderer table={t} key={t.id} />
      ))}
    </div>
  );
}
function Notes({ value, setValue }) {
  return (
    <section className="notes-panel">
      <div>
        <StickyNote />
        <span>
          <label htmlFor="lesson-notes">
            <strong>Seu caderno</strong>
          </label>
          <small>Salvo automaticamente neste dispositivo</small>
        </span>
      </div>
      <textarea
        id="lesson-notes"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Registre dúvidas, exemplos do seu trabalho e pontos para revisar..."
      />
      <div className="note-prompts">
        <button
          onClick={() =>
            setValue(value + "\n• Evidência que preciso verificar: ")
          }
        >
          Evidência a verificar
        </button>
        <button onClick={() => setValue(value + "\n• Dúvida para validação: ")}>
          Dúvida para validação
        </button>
        <button
          onClick={() => setValue(value + "\n• Aplicação no meu processo: ")}
        >
          Aplicação prática
        </button>
      </div>
    </section>
  );
}

// Duas aplicações dos mesmos itens-âncora. A comparação é descritiva: mesmo
// com itens iguais, efeito de memória e familiaridade impedem atribuir a
// variação causalmente ao estudo.
// Quantas questões de cada módulo entram na amostra diagnóstica geral.
const DIAG_POR_MODULO = 3;
function Assessments({ state, setState, openLesson }) {
  const [track, setTrack] = useState("geral"),
    [started, setStarted] = useState(false),
    [index, setIndex] = useState(0),
    [answers, setAnswers] = useState({}),
    [revealed, setRevealed] = useState(false),
    [done, setDone] = useState(false),
    [attemptSeed, setAttemptSeed] = useState(() => newAssessmentSeed()),
    [diagnosticForm, setDiagnosticForm] = useState(() =>
      state.diagnostico?.entrada ? "B" : "A",
    ); // Diagnostico geral: TRES questoes ancora por modulo. Entrada e saida
  // usam os mesmos itens, mas ordem e posicao das alternativas mudam para
  // reduzir memorizacao mecanica sem perder comparabilidade por item.
  const questions = useMemo(() => {
    let base;
    if (track !== "geral") base = questionBank.filter((q) => q.track === track);
    else {
      base = selectDiagnosticAnchors(questionBank, tracks, DIAG_POR_MODULO);
    }
    return prepareAssessment(base, attemptSeed);
  }, [track, attemptSeed, diagnosticForm]);
  const q = questions[index];
  const score = questions.filter((x, i) => answers[i] === x.answer).length;
  useLayoutEffect(() => {
    if (track === "geral" && revealed) {
      setRevealed(false);
      next();
    }
  }, [track, revealed]);
  function reset(id = track) {
    setTrack(id);
    setAttemptSeed(newAssessmentSeed());
    setDiagnosticForm(state.diagnostico?.entrada ? "B" : "A");
    setStarted(false);
    setIndex(0);
    setAnswers({});
    setRevealed(false);
    setDone(false);
  }
  function next() {
    if (index === questions.length - 1) {
      setDone(true);
      setState((s) => {
        const base = {
          ...s,
          quizScores: {
            ...s.quizScores,
            [track]: {
              score,
              total: questions.length,
              date: new Date().toISOString(),
            },
          },
        };
        if (track !== "geral") return base;
        // A primeira aplicação é preservada e as seguintes atualizam a
        // reaplicação. São duas amostras descritivas dos mesmos itens, não uma
        // medida validada de ganho ou prova causal de aprendizagem.
        const porQuestao = {};
        questions.forEach((x, i) => {
          porQuestao[x.id] = { track: x.track, ok: answers[i] === x.answer };
        });
        const registro = {
          data: new Date().toISOString(),
          acertos: score,
          total: questions.length,
          forma: diagnosticForm,
          leitura: Math.round((s.completed.length / lessons.length) * 100),
          porQuestao,
        };
        const d = s.diagnostico || {};
        return {
          ...base,
          diagnostico: d.entrada
            ? { ...d, saida: registro }
            : { ...d, entrada: registro },
        };
      });
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
    }
  }
  return (
    <div className="page">
      <PageHeader
        title="Autoavaliações e revisão"
        subtitle="Questões comentadas transformam erro em revisão direcionada, sem confundir resultado de quiz com competência profissional."
        icon={ClipboardCheck}
      />
      {!started ? (
        <div className="assessment-select">
          {(() => {
            const d = state.diagnostico || {};
            if (!d.entrada) return null;
            return <ComparaDiagnostico d={d} />;
          })()}
          <section className="diagnostic">
            <div>
              <Award />
              <span>
                <small>AVALIAÇÃO INTEGRADORA</small>
                <h2>Amostra diagnóstica do POP</h2>
                <p>
                  Três questões por módulo, dos fundamentos à conclusão técnica.
                  A reaplicação usa os mesmos itens-âncora em outra ordem e
                  descreve os dois resultados sem atribuir a variação ao curso.
                </p>
              </span>
            </div>
            <div className="assessment-meta">
              <span>
                <Clock /> {tracks.length * DIAG_POR_MODULO} questões · cerca de{" "}
                {Math.round(tracks.length * DIAG_POR_MODULO * 0.5)} min
              </span>
              <span>
                <MessageSquareText /> Feedback imediato
              </span>
              <span>
                <Trophy /> Autoacompanhamento não validado
              </span>
            </div>
            <button
              onClick={() => {
                reset("geral");
                setStarted(true);
              }}
            >
              {(state.diagnostico || {}).entrada
                ? "Reaplicar os itens-âncora"
                : "Fazer a primeira aplicação"}{" "}
              <ArrowRight />
            </button>
            {state.quizScores.geral && (
              <small>
                Último resultado: {state.quizScores.geral.score}/
                {state.quizScores.geral.total}
              </small>
            )}
          </section>
          <h2>Avaliações por módulo</h2>
          <div className="module-tests">
            {tracks
              .filter((t) => questionBank.some((q) => q.track === t.id))
              .map((t) => {
                let qs = questionBank.filter((q) => q.track === t.id),
                  last = state.quizScores[t.id];
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      reset(t.id);
                      setStarted(true);
                    }}
                  >
                    <span style={{ background: t.color, "--tc": t.color }}>
                      {t.code}
                    </span>
                    <div>
                      <strong>{t.title}</strong>
                      <small>{qs.length} questões · feedback comentado</small>
                    </div>
                    {last ? (
                      <b>
                        {last.score}/{last.total}
                      </b>
                    ) : (
                      <ChevronRight />
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      ) : (
        <section className="quiz-stage">
          {done ? (
            <div className="quiz-result">
              <div
                className="score-ring"
                style={{ "--score": `${(score / questions.length) * 100}%` }}
              >
                <span>
                  <strong>{score}</strong>/{questions.length}
                </span>
              </div>
              <h2>
                {score / questions.length >= 0.8
                  ? "Bom desempenho nesta tentativa"
                  : "Há pontos para revisar"}
              </h2>
              <p>
                Você acertou {Math.round((score / questions.length) * 100)}%.
                Use o feedback abaixo para voltar aos módulos relacionados. Este
                resultado não comprova domínio nem competência profissional.
              </p>
              {(() => {
                const erradas = questions
                  .map((q, i) => ({ q, i }))
                  .filter(({ q, i }) => answers[i] !== q.answer);
                return erradas.length ? (
                  <div className="revisao-erros">
                    <h3>
                      <AlertTriangle size={16} /> Volte ao conteúdo destas{" "}
                      {erradas.length === 1
                        ? "questão"
                        : erradas.length + " questões"}
                    </h3>
                    <ul>
                      {erradas.map(({ q, i }) => {
                        const t = tracks.find((x) => x.id === q.track);
                        const exata =
                          q.source && q.source.sec
                            ? lessonMap.get(q.source.sec)
                            : null;
                        const aula = exata || firstLesson(q.track);
                        const rot = exata
                          ? (
                              (exata.number ? exata.number + " " : "") +
                              exata.title
                            ).slice(0, 42)
                          : t
                            ? t.code
                            : "módulo";
                        return (
                          <li key={i}>
                            <span className="re-mod">{t ? t.code : ""}</span>
                            <span className="re-q">{q.question}</span>
                            {aula && (
                              <button
                                className="re-ir"
                                onClick={() =>
                                  openLesson && openLesson(aula.id)
                                }
                              >
                                Rever {rot} <ArrowRight size={14} />
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <div className="revisao-ok">
                    <CheckCircle2 /> Você acertou todas. Pode seguir para o
                    próximo módulo.
                  </div>
                );
              })()}
              <div className="result-actions">
                <button
                  onClick={() => {
                    reset();
                    setStarted(true);
                  }}
                >
                  <RotateCcw /> Refazer
                </button>
                <button className="primary" onClick={() => setStarted(false)}>
                  Escolher outra avaliação
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="quiz-top">
                <button onClick={() => setStarted(false)}>
                  <ChevronLeft /> Sair
                </button>
                <span>
                  Questão {index + 1} de {questions.length}
                </span>
                <i>
                  <em
                    style={{
                      width: `${((index + 1) / questions.length) * 100}%`,
                    }}
                  />
                </i>
              </div>
              <div className="quiz-question">
                <small>
                  {tracks.find((t) => t.id === q.track)?.code} · AUTOAVALIAÇÃO
                  COMENTADA
                </small>
                <h2>{q.question}</h2>
                <div className="quiz-options">
                  {q.options.map((o, i) => (
                    <button
                      disabled={revealed}
                      className={
                        (answers[index] === i ? "selected " : "") +
                        (revealed && i === q.answer ? "correct " : "") +
                        (revealed && answers[index] === i && i !== q.answer
                          ? "wrong"
                          : "")
                      }
                      onClick={() => setAnswers((a) => ({ ...a, [index]: i }))}
                      key={o}
                    >
                      <span>{String.fromCharCode(65 + i)}</span>
                      {o}
                      {revealed && i === q.answer && <Check />}
                    </button>
                  ))}
                </div>
                {revealed && (
                  <div
                    className={
                      answers[index] === q.answer
                        ? "answer-feedback correct"
                        : "answer-feedback"
                    }
                  >
                    <Lightbulb />
                    <div>
                      <strong>
                        {answers[index] === q.answer
                          ? "Resposta correta"
                          : "Ponto de revisão"}
                      </strong>
                      <p>{q.explanation}</p>
                      {q.source &&
                        (() => {
                          const sec = lessonMap.get(q.source.sec);
                          return (
                            <figure className="quiz-fonte">
                              <blockquote>{q.source.quote}</blockquote>
                              <figcaption>
                                POP
                                {sec
                                  ? `, ${sec.number ? sec.number + " " : ""}${sec.title}`
                                  : ""}
                                {sec && openLesson && (
                                  <button onClick={() => openLesson(sec.id)}>
                                    abrir a aula <ArrowRight size={13} />
                                  </button>
                                )}
                              </figcaption>
                            </figure>
                          );
                        })()}
                    </div>
                  </div>
                )}
                <div className="quiz-actions">
                  {!revealed ? (
                    <button
                      className="primary"
                      disabled={answers[index] === undefined}
                      onClick={() => setRevealed(true)}
                    >
                      Confirmar resposta
                    </button>
                  ) : (
                    <button className="primary" onClick={next}>
                      {index === questions.length - 1
                        ? "Ver resultado"
                        : "Próxima questão"}
                      <ArrowRight />
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}

const LEI_DOMINIOS = [
  ["BRASIL", "planalto.gov.br"],
  ["CONAMA", "conama.mma.gov.br"],
  ["PARANÁ", "legislacao.pr.gov.br"],
  ["INSTITUTO ÁGUA E TERRA", "iat.pr.gov.br"],
  ["AGÊNCIA NACIONAL", "aneel.gov.br"],
  ["INSTITUTO DO PATRIMÔNIO", "gov.br/iphan"],
  ["ABNT", "abnt.org.br"],
];
function leiDominio(ref) {
  const hit = LEI_DOMINIOS.find(([org]) => ref.toUpperCase().startsWith(org));
  return hit ? hit[1] : null;
}

function GlobalSearch({ close, abrir }) {
  const [q, setQ] = useState("");
  const input = useRef();
  const dialog = useRef();
  useEffect(() => input.current?.focus(), []);
  function trapFocus(event) {
    if (event.key !== "Tab") return;
    const focusable = [
      ...dialog.current.querySelectorAll(
        'button:not(:disabled),input:not(:disabled),a[href],[tabindex]:not([tabindex="-1"])',
      ),
    ];
    if (!focusable.length) return;
    const first = focusable[0],
      last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  const results =
    q.length > 1
      ? ordenaBusca(
          INDICE.get().filter((x) =>
            norm(x.title + " " + x.text).includes(norm(q)),
          ),
          q,
        ).slice(0, 14)
      : [];
  return (
    <div className="search-modal">
      <div className="modal-scrim" onClick={close} aria-hidden="true" />
      <section
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="busca-global-titulo"
        onKeyDown={trapFocus}
      >
        <h2 id="busca-global-titulo" className="sr-only">
          Buscar na Academia IAT
        </h2>
        <div className="modal-input">
          <Search aria-hidden="true" />
          <input
            aria-label="Buscar aulas, quadros e siglas do POP"
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results.length) abrir(results[0]);
            }}
            placeholder="Buscar aulas, quadros e siglas do POP..."
          />
          <kbd aria-hidden="true">ESC</kbd>
          <button
            type="button"
            className="modal-close"
            onClick={close}
            aria-label="Fechar busca"
          >
            <X aria-hidden="true" />
          </button>
        </div>
        {q.length < 2 ? (
          <div className="modal-empty">
            <Sparkles />
            <p>
              Pesquise uma fase, documento, norma, sigla ou critério. A busca
              cobre as aulas, os quadros e o glossário.
            </p>
          </div>
        ) : (
          <div className="modal-results">
            {results.map((r) => (
              <button onClick={() => abrir(r)} key={r.id}>
                <span className={"gs-tipo t-" + r.type}>{r.type}</span>
                <div>
                  <strong>{r.title}</strong>
                  <small>{snippet(r.text, q)}</small>
                </div>
                <ChevronRight />
              </button>
            ))}
            {!results.length && (
              <Empty text="Nenhum tópico encontrado. Tente outro termo." />
            )}
          </div>
        )}
        <footer>
          <span>
            <kbd>↵</kbd> abrir
          </span>
          <span>
            <kbd>ESC</kbd> fechar
          </span>
          <small>Busca local: nenhum dado é enviado</small>
        </footer>
      </section>
    </div>
  );
}
export default App;
