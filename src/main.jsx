import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BookMarked,
  BookOpen,
  Bookmark,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  CircleHelp,
  ClipboardCheck,
  Clock,
  Compass,
  Database,
  Download,
  ExternalLink,
  FileCheck,
  FileCheck2,
  FileText,
  Files,
  Filter,
  FlaskConical,
  GitBranch,
  Home,
  Image as ImageIcon,
  Inbox,
  Info,
  Layers3,
  ListChecks,
  Library,
  Map as MapIcon,
  Maximize2,
  Menu,
  Quote,
  Milestone,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  StickyNote,
  Table2,
  Target,
  Trees,
  X,
  Zap,
  CloudOff,
} from "lucide-react";
import TranscriptPanel from "./TranscriptPanel.jsx";
import VideoLearningStage from "./VideoLearningStage.jsx";
import {
  resolveAudiovisualPilot,
  useAudiovisualPilotMedia,
} from "./audiovisualPilotRuntime.js";
import {
  ThemeToggle,
  Suporte,
} from "./painelAluno.jsx";
import { PageHeader, Empty, TableRenderer } from "./ui.jsx";
import { ordenaBusca, snippet } from "./busca.js";
import { elementoDaAula, precisaDeComplemento } from "./aulasAnexoB.js";
import { comoLerQuadro } from "./comoLerQuadro.js";
import { colherErros, errosDaAula } from "./errosRecorrentes.js";
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
import {
  scenarios,
  useCasosSobDemanda,
  useIndiceLaboratorio,
} from "./labData.js";
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
import VideoDataLoading from "./VideoDataLoading.jsx";
import { objetivoDaAula } from "./lessonObjective.js";
import SourceAssurance from "./sourceAssurance.jsx";
import { resolveOfficialSource } from "./officialSources.js";
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
// A gravacao automatica do progresso na conta opcional. Fica aqui, e nao no
// cartao da conta, porque estudar acontece nas OUTRAS telas: no perfil ela
// nunca veria o momento em que a pessoa termina alguma coisa.
import { useSincroniaAutomatica } from "./sincroniaAutomatica.js";
import { hasStartedJourney } from "./learningJourney.js";
import { interpretarLinkConta } from "./contaLinks.js";
import "./styles.css";
import "./nota10.css";
import "./experience.css";

const MOBILE_NAVIGATION_QUERY = "(max-width: 980px)";
const mobileNavigationMedia = globalThis.matchMedia?.(MOBILE_NAVIGATION_QUERY);
let mobileNavigationCssPromise;

function loadMobileNavigationCss() {
  mobileNavigationCssPromise ??= import("./mobileNavigation.css");
  return mobileNavigationCssPromise;
}

if (!mobileNavigationMedia || mobileNavigationMedia.matches) {
  // Evita FOUC no primeiro paint móvel sem penalizar a entrada desktop.
  await loadMobileNavigationCss();
} else {
  const loadWhenMobile = (event) => {
    if (!event.matches) return;
    mobileNavigationMedia.removeEventListener?.("change", loadWhenMobile);
    mobileNavigationMedia.removeListener?.(loadWhenMobile);
    void loadMobileNavigationCss();
  };

  if (typeof mobileNavigationMedia.addEventListener === "function") {
    mobileNavigationMedia.addEventListener("change", loadWhenMobile);
  } else {
    mobileNavigationMedia.addListener?.(loadWhenMobile);
  }
}

const HydroGuide = lazy(() => import("./hydro.jsx"));
const Lesson = lazy(() => import("./licao.jsx"));
const MapaParana = lazy(() => import("./mapa.jsx"));
const RedatorIT = lazy(() => import("./redator.jsx"));
const LaboratorioPremium = lazy(() => import("./laboratorio.jsx"));
const Flowcharts = lazy(() => import("./Flowcharts.jsx"));
const KnowledgeLibrary = lazy(() => import("./biblioteca.jsx"));
const Profile = lazy(() => import("./perfil.jsx"));
const Assessments = lazy(() => import("./avaliacoes.jsx"));
const Formation = lazy(() => import("./formacao.jsx"));
const ContaLinkPage = lazy(() => import("./ContaLinkPage.jsx"));
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
// Erros recorrentes que o POP escreve nas colunas "Erro recorrente a evitar"
// (Quadro 8) e "Limite e erro a evitar" (Quadro 22). Colhidos uma vez: sao 35
// e nao mudam em tempo de execucao.
const ERROS_DO_POP = colherErros(popData);

const DADOS_PERFIL = Object.freeze({
  lessons,
  trackProgress,
  requisitosAutoestudo,
});

// Contrato de dados da tela de aula, que saiu para `licao.jsx` em 05/08/2026.
// Mesmo formato dos outros dois: a tela declara o que precisa do POP numa
// propriedade so, em vez de ler do escopo do modulo.
const DADOS_AULA = Object.freeze({
  popData,
  blockMap,
  tableMap,
  figureByBlock,
  lessons,
  questionBank,
  siglasDaAula,
  trackLessons,
  mediaForLesson,
  trackProgress,
  errosDoPop: ERROS_DO_POP,
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

const DADOS_AVALIACOES = Object.freeze({
  firstLesson,
  lessonMap,
  lessons,
  questionBank,
  tracks,
});
const DADOS_FORMACAO = Object.freeze({
  lessons,
  trackGroups,
  trackIcons: TRACK_ICONS,
  trackLessons,
  trackProgress,
  tracks,
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
    ["hidreletricas", "Como funciona uma hidrelétrica", Zap],
    ["formacao", "Curso guiado pelo POP", BookOpen],
  ]],
  ["Praticar", [
    ["laboratorio", "Laboratório", FlaskConical],
    ["redator", "Redigir Informação Técnica", FileText],
    ["avaliacoes", "Avaliações", ClipboardCheck],
  ]],
  ["Consultar", [
    ["fluxos", "Fluxogramas", GitBranch],
    ["mapa", "Mapa do Paraná", MapIcon],
    [
      "geopr",
      "GeoPR · mapas oficiais",
      Layers3,
      "https://geopr.iat.pr.gov.br/portal/home/gallery.html?sortField=title&sortOrder=asc",
    ],
    ["biblioteca", "Biblioteca", Library],
  ]],
  ["Neste dispositivo", [
    ["perfil", "Meu progresso", BadgeCheck],
    ["suporte", "Suporte", CircleHelp],
  ]],
];

// Lista plana derivada dos grupos, para o titulo da pagina e qualquer consulta
// por id continuarem funcionando sem saber do agrupamento.
const NAV = NAV_GRUPOS.flatMap(([, itens]) => itens).filter(
  ([, , , externalUrl]) => !externalUrl,
);

// O painel inicial e a aula precisam resolver a mídia pela mesma regra. Isso
// impede que "Continue de onde parou" associe o título de uma aula a um vídeo
// genérico sem relação com ela.
function mediaForLesson(lesson, pilotCollection) {
  if (!lesson) return null;
  let fallback = null;
  if (aulaMedia[lesson.id]) {
    fallback = {
      src: wb(`/media/aula/${lesson.id}.mp4`),
      poster: wb(`/media/aula/${lesson.id}.jpg`),
      captions: wb(`/media/aula/${lesson.id}.vtt`),
      // Sincronia labial derivada dos fonemas da propria legenda, gerada por
      // tools/visemas_das_aulas.py. Sem isto o professor caia no nivel
      // estimado pela legenda, que acerta o QUANDO mas nao a forma da boca.
      visemes: wb(`/media/aula/${lesson.id}.visemes.json`),
      title: (lesson.number ? lesson.number + " " : "") + lesson.title,
      propria: true,
    };
  } else {
    fallback = featuredMedia[lesson.trackId] || null;
  }
  return resolveAudiovisualPilot(
    lesson,
    fallback,
    `${BASE || ""}/`,
    pilotCollection,
  );
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
function requisitosAutoestudo(trackId, state, catalogState = null) {
  const leitura = trackProgress(trackId, state) === 100;
  const temQuiz = questionBank.some((q) => q.track === trackId);
  const q = state.quizScores && state.quizScores[trackId];
  const avaliacao = !temQuiz || (q && q.total && q.score / q.total >= 0.8);
  const catalogoPronto = catalogState
    ? !catalogState.carregando && !catalogState.erro && catalogState.casos.length > 0
    : scenarios.length > 0;
  const cen = catalogoPronto
    ? (catalogState?.casos || scenarios).filter((c) => c.track === trackId)
    : [];
  const praticaRegistro = catalogoPronto
    ? practiceRecordStatus(cen, state.labs)
    : {
        applies: true,
        submitted: false,
        objectiveMet: false,
        technicalReviewApproved: false,
        bestObjectivePercent: null,
      };
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
    catalogoPronto,
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
  const linkConta = interpretarLinkConta(
    (typeof location !== "undefined" && location.hash) || "",
  );
  if (linkConta) {
    return {
      view: "conta",
      lesson: null,
      scenario: null,
      accountLink: linkConta,
    };
  }
  const h = ((typeof location !== "undefined" && location.hash) || "").replace(
    /^#\/?/,
    "",
  );
  if (!h) return { view: "dashboard", lesson: null, scenario: null, accountLink: null };
  const i = h.indexOf("/");
  const seg = i < 0 ? h : h.slice(0, i);
  const rest = i < 0 ? "" : h.slice(i + 1);
  if (seg === "aula" && rest)
    return { view: "lesson", lesson: decodeURIComponent(rest), scenario: null, accountLink: null };
  if (seg === "laboratorio")
    return {
      view: "laboratorio",
      lesson: null,
      scenario: rest ? decodeURIComponent(rest) : null,
      accountLink: null,
    };
  if (VIEW_IDS.includes(seg))
    return { view: seg, lesson: null, scenario: null, accountLink: null };
  return { view: "dashboard", lesson: null, scenario: null, accountLink: null };
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
  const { algoMaisNovo } = useSincroniaAutomatica(state);
  const _init = parseHash();
  const [view, setView] = useState(_init.view);
  const [selectedLesson, setSelectedLesson] = useState(() =>
    _init.lesson && lessonMap.has(_init.lesson)
      ? _init.lesson
      : lessonMap.has(state.lastLesson)
        ? state.lastLesson
        : firstLesson("m00")?.id,
  );
  const [selectedScenario, setSelectedScenario] = useState(
    () => _init.scenario || null,
  );
  const [accountLink, setAccountLink] = useState(() => _init.accountLink || null);
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
  const precisaIndiceLaboratorio = [
    "dashboard",
    "lesson",
    "laboratorio",
    "redator",
    "perfil",
  ].includes(view);
  const labIndexStatus = useIndiceLaboratorio(precisaIndiceLaboratorio);
  const pilotMediaStatus = useAudiovisualPilotMedia(
    view === "dashboard" || view === "lesson",
  );
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
      setAccountLink(p.accountLink || null);
      if (p.view === "lesson") {
        if (p.lesson && lessonMap.has(p.lesson)) {
          setSelectedLesson(p.lesson);
          setState((s) =>
            s.lastLesson === p.lesson ? s : { ...s, lastLesson: p.lesson },
          );
        }
        setView("lesson");
      } else {
        if (p.view === "laboratorio" && p.scenario) {
          setSelectedScenario(p.scenario);
        }
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
    setAccountLink(null);
    setMenuOpen(false);
    if (next === "laboratorio" && param) {
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
        : view === "conta"
          ? accountLink?.acao === "verificar"
            ? "Confirmar e-mail"
            : "Recuperar senha"
        : NAV.find(([id]) => id === view)?.[1] || "Visão geral";
    document.title = `${label} · Academia IAT`;
  }, [view, selectedLesson, accountLink?.acao]);
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
        labIndexStatus={labIndexStatus}
        pilotMediaStatus={pilotMediaStatus}
      />
    ),
    hidreletricas: <HydroGuide go={go} />,
    mapa: <MapaParana state={state} setState={setState} />,
    formacao: (
      <Formation
        state={state}
        openLesson={openLesson}
        dados={DADOS_FORMACAO}
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
        grupos={labIndexStatus.grupos}
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
        grupos={labIndexStatus.grupos}
        state={state}
        setState={setState}
        go={go}
      />
    ),
    avaliacoes: (
      <Assessments
        state={state}
        setState={setState}
        openLesson={openLesson}
        dados={DADOS_AVALIACOES}
      />
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
        setState={setState}
        algoMaisNovo={algoMaisNovo}
        progress={progress}
        profile={profile}
        setProfile={setProfile}
        profileStatus={profileStatus}
        setProfileStatus={setProfileStatus}
        go={go}
        openLesson={openLesson}
        dados={{
          ...DADOS_PERFIL,
          requisitosAutoestudo: (trackId, currentState) =>
            requisitosAutoestudo(trackId, currentState, labIndexStatus),
        }}
      />
    ),
    conta: <ContaLinkPage acao={accountLink?.acao} token={accountLink?.token} go={go} />,
    suporte: <Suporte online={online} />,
    lesson: (
      <Lesson
        lesson={lessonMap.get(selectedLesson) || lessons[0]}
        availableScenarios={labIndexStatus.casos}
        pilotMediaStatus={pilotMediaStatus}
        state={state}
        setState={setState}
        openLesson={openLesson}
        complete={complete}
        bookmark={bookmark}
        go={go}
        dados={DADOS_AULA}
      />
    ),
  }[view];
  return (
    // A identidade do build fica na CASCA, e nao numa tela. Ela saiu de
    // main.jsx para o painel do Suporte em 04/08/2026, e com isso deixou de
    // existir em todas as rotas que nao passam pelo Suporte: o teste de
    // artefato procura `[data-build-sha]` em cada pagina e nao achava em
    // nenhuma. Saber qual build esta no ar e requisito de rastreabilidade, e
    // requisito que so vale em uma tela nao e requisito.
    <div className="app-shell" data-build-sha={BUILD_STAMP}>
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
            key={
              view === "lesson"
                ? "l:" + selectedLesson
                : view === "conta"
                  ? `conta:${accountLink?.acao || ""}`
                  : view
            }
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
      {(appDataWarnings.length > 0 ||
        labIndexStatus.erro ||
        pilotMediaStatus.error) && (
        <div className="data-warning-bar" role="alert">
          <AlertTriangle size={15} />
          <span>
            Parte dos dados complementares ou da mídia não pôde ser carregada.
            O conteúdo textual continua disponível; tente novamente com conexão.
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
          <strong>Academia IAT</strong>
          <small>Licenciamento hidrelétrico</small>
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
          const botoes = itens.map(([id, label, Icon, externalUrl]) => {
            if (externalUrl) {
              return (
                <a
                  key={id}
                  className="side-destination side-external"
                  href={externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Abrir ${label} em nova aba (site externo)`}
                  title="Abrir o portal geográfico do IAT em nova aba"
                >
                  <Icon aria-hidden="true" />
                  <span>{label}</span>
                  <ExternalLink
                    className="external-indicator"
                    aria-hidden="true"
                  />
                </a>
              );
            }
            const at = view === id || (view === "lesson" && id === "formacao");
            return (
              <button
                type="button"
                key={id}
                aria-current={at ? "page" : undefined}
                className={`side-destination${at ? " active" : ""}`}
                onClick={() => go(id)}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
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
      {/* O selo de proveniencia saiu da barra lateral em 04/08/2026.
          Ele ocupava o canto inferior esquerdo em TODAS as telas com uma
          informacao que nao muda nunca, e o mesmo dado ja aparece em dois
          lugares onde ele e util: o painel inicial mostra versao, extracao,
          hash e situacao no bloco de fonte, e cada aula traz o mesmo bloco
          recolhido. O identificador do build, que era exclusivo daqui,
          continua no diagnostico da Central de Suporte, que e onde alguem
          procura ao relatar um problema. Nada de rastreabilidade se perdeu:
          o que se perdeu foi a repeticao permanente. */}
    </aside>
  );
}

function MobileBottomNav({ view, go, inert }) {
  const [openCategory, setOpenCategory] = useState(null);
  const panelRef = useRef(null);
  const navRef = useRef(null);
  const triggerRefs = useRef({});
  const home = { id: "dashboard", label: "Início" };
  const categories = [
    {
      id: "aprender",
      label: "Aprender",
      Icon: BookOpen,
      items: NAV_GRUPOS.find(([grupo]) => grupo === "Aprender")?.[1] || [],
    },
    {
      id: "praticar",
      label: "Praticar",
      Icon: FlaskConical,
      items: NAV_GRUPOS.find(([grupo]) => grupo === "Praticar")?.[1] || [],
    },
    {
      id: "consultar",
      label: "Consultar",
      Icon: Library,
      items: NAV_GRUPOS.find(([grupo]) => grupo === "Consultar")?.[1] || [],
    },
  ];
  const activeDestination = (id) =>
    view === id || (view === "lesson" && id === "formacao");
  const activeCategory = categories.find(({ items }) =>
    items.some(([id]) => activeDestination(id)),
  )?.id;
  const openConfig = categories.find(({ id }) => id === openCategory) || null;

  useEffect(() => {
    if (!openCategory) return undefined;
    const focusFirstDestination = () => {
      const current = panelRef.current?.querySelector('[aria-current="page"]');
      const first = panelRef.current?.querySelector(
        '.mobile-nav-panel__item:not([disabled])',
      );
      (current || first)?.focus({ preventScroll: true });
    };
    const frame = typeof requestAnimationFrame === "function"
      ? requestAnimationFrame(focusFirstDestination)
      : setTimeout(focusFirstDestination, 0);
    return () => {
      if (typeof cancelAnimationFrame === "function") cancelAnimationFrame(frame);
      else clearTimeout(frame);
    };
  }, [openCategory]);

  useEffect(() => {
    if (!openCategory) return undefined;
    const closeOutside = (event) => {
      if (
        panelRef.current?.contains(event.target) ||
        navRef.current?.contains(event.target)
      ) return;
      setOpenCategory(null);
    };
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [openCategory]);

  useEffect(() => {
    setOpenCategory(null);
  }, [view]);

  useEffect(() => {
    if (inert) setOpenCategory(null);
  }, [inert]);

  const closeAndRestoreFocus = () => {
    const trigger = triggerRefs.current[openCategory];
    setOpenCategory(null);
    const restore = () => trigger?.focus({ preventScroll: true });
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(restore);
    else setTimeout(restore, 0);
  };
  const handleEscape = (event) => {
    if (event.key !== "Escape" || !openCategory) return;
    event.preventDefault();
    event.stopPropagation();
    closeAndRestoreFocus();
  };
  const navigate = (id) => {
    setOpenCategory(null);
    go(id);
  };

  return (
    <>
      {openConfig && (
        <section
          className="mobile-nav-panel"
          id="mobile-nav-subdestinations"
          ref={panelRef}
          role="region"
          aria-labelledby="mobile-nav-panel-title"
          inert={inert}
          onKeyDown={handleEscape}
        >
          <header className="mobile-nav-panel__header">
            <div>
              <small>Escolha uma página</small>
              <h2 id="mobile-nav-panel-title">{openConfig.label}</h2>
            </div>
            <button
              type="button"
              className="mobile-nav-panel__close"
              onClick={closeAndRestoreFocus}
              aria-label={`Fechar opções de ${openConfig.label}`}
            >
              <X aria-hidden="true" />
            </button>
          </header>
          <div className="mobile-nav-panel__items">
            {openConfig.items.map(([id, label, Icon, externalUrl]) => {
              const current = activeDestination(id);
              const contents = (
                <>
                  <Icon aria-hidden="true" />
                  <span>
                    <strong>{label}</strong>
                    <small>
                      {externalUrl
                        ? "Site oficial em nova aba"
                        : current
                          ? "Página atual"
                          : "Abrir página"}
                    </small>
                  </span>
                  {externalUrl
                    ? <ExternalLink aria-hidden="true" />
                    : current
                      ? <Check aria-hidden="true" />
                      : <ChevronRight aria-hidden="true" />}
                </>
              );
              if (externalUrl) {
                return (
                  <a
                    key={id}
                    className="mobile-nav-panel__item external"
                    href={externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Abrir ${label} em nova aba (site externo)`}
                    onClick={() => setOpenCategory(null)}
                  >
                    {contents}
                  </a>
                );
              }
              return (
                <button
                  type="button"
                  key={id}
                  className={`mobile-nav-panel__item${current ? " current" : ""}`}
                  aria-current={current ? "page" : undefined}
                  onClick={() => navigate(id)}
                >
                  {contents}
                </button>
              );
            })}
          </div>
        </section>
      )}
      <nav
        className="mobile-bottom-nav"
        aria-label="Navegação principal no celular"
        inert={inert}
        ref={navRef}
        onKeyDown={handleEscape}
      >
        <button
          type="button"
          className={view === "dashboard" ? "active" : ""}
          aria-current={view === "dashboard" ? "page" : undefined}
          onClick={() => navigate(home.id)}
        >
          <Home aria-hidden="true" />
          <span>{home.label}</span>
        </button>
        {categories.map(({ id, label, Icon }) => {
          const active = activeCategory === id;
          const open = openCategory === id;
          return (
          <button
            type="button"
            key={id}
            ref={(node) => { triggerRefs.current[id] = node; }}
            className={`${active ? "active" : ""}${open ? " open" : ""}`.trim()}
            data-has-current-page={active ? "true" : undefined}
            aria-expanded={open}
            aria-controls={open ? "mobile-nav-subdestinations" : undefined}
            onClick={() => setOpenCategory((current) => current === id ? null : id)}
          >
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </button>
          );
        })}
      </nav>
    </>
  );
}

function Dashboard({
  state,
  progress,
  go,
  openLesson,
  labIndexStatus,
  pilotMediaStatus,
}) {
  const continueLesson =
    lessonMap.get(state.lastLesson) || firstLesson("m00") || lessons[0];
  const continueTrack =
    tracks.find((t) => t.id === continueLesson.trackId) || tracks[0];
  const feat = pilotMediaStatus.loading
    ? null
    : mediaForLesson(continueLesson, pilotMediaStatus.collection);
  const startedJourney = hasStartedJourney(state);
  return (
    <div className="page dashboard-page">
      {/* O topo desta tela era slogan: "Aprenda o procedimento. Pratique a
          decisao.", em 39px, mais um paragrafo de apresentacao. Media 151px, e
          empurrava o cartao de continuidade para 335px do topo. Numa tela de
          escritorio de 1366x768, com a barra do navegador, a primeira dobra
          acaba por volta de 600px: a pessoa abria a plataforma e via uma frase
          e o topo de um cartao.

          Quem usa isto e servidor de carreira que ja sabe por que esta aqui.
          Manchete de marketing e espaco emprestado de outro tipo de site. O
          titulo agora diz o que a tela FAZ, e o resto e o estado do trabalho,
          que e o que a pessoa veio buscar. */}
      <section className="dashboard-intro">
        <h1>
          {startedJourney
            ? "Onde você parou, e o que decidir a seguir."
            : "Comece por aqui."}
        </h1>
      </section>
      <section className="dashboard-feature">
        <div className="feature-media">
          {pilotMediaStatus.loading ? (
            <VideoDataLoading />
          ) : (
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
          )}
          <span>Resumo em vídeo desta aula</span>
          <span className="fm-chip">
            <Clock /> Conteúdo vinculado ao tópico
          </span>
        </div>
        <div className="feature-copy">
          <small>
            {continueTrack.code} · {startedJourney ? "CONTINUE DE ONDE PAROU" : "PRIMEIRO PASSO"}
          </small>
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
            {startedJourney ? "Continuar aula" : "Iniciar orientação"} <Play />
          </button>
          <button
            className="text-action"
            onClick={() => go(startedJourney ? "formacao" : "hidreletricas")}
          >
            {startedJourney
              ? "Ver todas as aulas"
              : "Novo em hidrelétricas? Veja os fundamentos"}{" "}
            <ArrowRight />
          </button>
        </div>
        <CurrentObjectiveCard lesson={continueLesson} />
      </section>
      <section className="dashboard-bottom">
        <NextPracticeCard
          state={state}
          currentTrackId={continueTrack.id}
          go={go}
          scenarios={labIndexStatus.casos}
          loading={labIndexStatus.carregando}
          error={labIndexStatus.erro}
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
  // Mesmo objetivo que a aula mostra, vindo do mesmo lugar. Duas telas que
  // prometem coisas diferentes sobre a mesma aula seria pior do que a
  // dependencia de main.jsx para licao.jsx.
  const alvo = objetivoDaAula(lesson, blocks, tableMap);

  return (
    <aside className="current-objective-card">
      <span>
        <Target aria-hidden="true" /> Objetivo atual
      </span>
      <h2>O que você deve conseguir fazer</h2>
      <p>{alvo.objetivo}</p>
      {alvo.comoSeVe && (
        <p className="objetivo-como-se-ve">
          <strong>Como você sabe que consegue.</strong> {alvo.comoSeVe}
        </p>
      )}
      <small>
        Ao concluir, registre a recuperação ativa e confira os critérios da
        própria aula.
      </small>
    </aside>
  );
}

function NextPracticeCard({
  state,
  currentTrackId,
  go,
  scenarios: availableScenarios,
  loading,
  error,
}) {
  const labs = state.labs || {};
  const inProgress = availableScenarios.find(
    (scenario) => labs[scenario.id]?.status === "em_andamento",
  );
  const nextPractice =
    inProgress ||
    availableScenarios.find(
      (scenario) => scenario.track === currentTrackId && !labs[scenario.id],
    ) ||
    availableScenarios.find((scenario) => !labs[scenario.id]) ||
    availableScenarios[0];

  if (!nextPractice) {
    return (
      <article className="dashboard-action-card practice" aria-busy={loading || undefined}>
        <header>
          <FlaskConical aria-hidden="true" />
          <span>Próxima prática</span>
        </header>
        <h2>{error ? "Práticas temporariamente indisponíveis" : "Preparando os casos"}</h2>
        <p>
          {error
            ? "Não foi possível carregar o catálogo de casos. Confira a conexão e abra o Laboratório para tentar novamente."
            : "O catálogo de casos está sendo carregado para indicar a prática mais adequada."}
        </p>
        {error && (
          <button type="button" onClick={() => go("laboratorio")}>
            Abrir Laboratório <ArrowRight />
          </button>
        )}
      </article>
    );
  }
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
        <SourceAssurance popData={popData} lessonCount={lessons.length} />
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
