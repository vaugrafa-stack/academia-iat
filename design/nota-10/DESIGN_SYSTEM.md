# Academia IAT — sistema visual nota 10

Esta pasta contém os conceitos visuais aceitos para a evolução incremental da plataforma:

- `dashboard-desktop.png` — painel principal, 1586 × 992;
- `lesson-desktop.png` — aula, 1586 × 992;
- `laboratory-desktop.png` — prática documental, 1586 × 992;
- `lesson-mobile.png` — continuidade responsiva da aula, 853 × 1844.

As imagens são especificações de composição e linguagem visual. Textos, controles, estados e documentos devem ser implementados como UI nativa, nunca como screenshot.

## Direção

- paradigma: estação de aprendizagem e análise técnica;
- fundo: verde-rio quase preto, sem creme e sem cinza aquecido;
- personalidade: institucional, editorial, precisa e calma;
- densidade: média, com áreas abertas e poucos enquadramentos fortes;
- motivos: curso d'água como percurso, trilhos de domínio, documento como evidência;
- movimento: progresso da água e transições de estado curtas, sempre respeitando `prefers-reduced-motion`.

## Tokens

```css
:root {
  --n10-bg: #031d19;
  --n10-bg-deep: #021612;
  --n10-surface: #082722;
  --n10-surface-2: #0b302a;
  --n10-surface-hover: #103b34;
  --n10-line: #235149;
  --n10-line-soft: #173f38;
  --n10-text: #f5f8f7;
  --n10-text-2: #d5dfdc;
  --n10-muted: #9db2ac;
  --n10-green: #24d39a;
  --n10-green-strong: #13b47f;
  --n10-blue: #43bff2;
  --n10-blue-strong: #278ec8;
  --n10-warning: #f0b53d;
  --n10-danger: #ff665f;
  --n10-info: #55bde9;
  --n10-radius-sm: 6px;
  --n10-radius: 8px;
  --n10-radius-lg: 12px;
  --n10-shadow: 0 14px 36px rgb(0 0 0 / 18%);
  --n10-focus: #70d7ff;
  --n10-max: 1586px;
}
```

Light mode must preserve the same hue relationships with true white surfaces, not cream.

## Typography

- UI and reading family: local Manrope variable or another locally hosted humanist sans with complete Portuguese glyphs;
- H1 desktop: 42–48 px, 1.08–1.14 line-height, 700–800;
- H1 mobile: 32–38 px, 1.12 line-height;
- H2: 22–28 px, 1.2;
- H3: 17–20 px;
- body desktop: 15–17 px, 1.55–1.7;
- body mobile: minimum 16 px, 1.55;
- control text: 14–16 px, 650–750;
- metadata: 12–14 px, never the only carrier of critical information.

No control may depend on browser-default typography.

## Layout

### App shell

- desktop sidebar: 224–236 px;
- top bar: 64–72 px;
- content begins after the top bar in every route;
- desktop gutters: 28–36 px;
- mobile top bar: 64 px;
- mobile gutters: 16–20 px;
- touch target: minimum 44 × 44 px.

### Dashboard

- open two-column first viewport: purpose/action on the left and current learning media on the right;
- one factual metrics row: 17 modules, 160 lessons, 21 cases;
- river path in one wide band, showing partial viewport as “8 de 17 módulos”;
- lower split: next actions and source/status;
- source/status may show only facts supported by manifests.

### Lesson

- desktop: outline rail + reading column + mastery rail;
- mobile: a single column; outline moves to drawer;
- title is never covered by the fixed header;
- tabs: Aprender, Fonte integral, Praticar, Anotações;
- mastery states: Leitura, Prática, Verificação, each with icon, text and state;
- learning body: objective, explanation, worked example, practice, progress;
- source and nature of material remain visible.

### Laboratory

- scenario rail + evidence/document canvas + reasoning/rubric rail;
- evidence opens a real didactic document or map;
- every synthetic document is watermarked “EXEMPLO DIDÁTICO — SEM VALIDADE”;
- findings connect status, evidence citation, fact, consequence and referral;
- rubric: Evidência, Coerência, Proporcionalidade, Rastreabilidade;
- disclosure: “Avaliação didática · não substitui manifestação do IAT”.

## Component families

- `AppNav`: desktop rail and mobile drawer, same labels and state model;
- `TopBar`: search, theme, progress, profile;
- `SourceStatus`: source, coverage and institutional nature;
- `LearningPath`: module stages with text + icon + state;
- `MediaSummary`: real media controls, transcript and download state;
- `LessonObjective`: measurable outcome;
- `MasteryRail`: reading/practice/verification gates;
- `WorkedExample`: problem versus expected pattern;
- `EvidencePacket`: document list, inspection state and download;
- `DocumentViewer`: redacted didactic source, pages and zoom;
- `DecisionMatrix`: status, evidence citation and finding action;
- `TechnicalReasoning`: fact, consequence and referral;
- `AnalyticRubric`: four criteria with explanatory feedback;
- `StatusMessage`: info, success, warning and error using icon + text;
- `ErrorRecovery`: what failed, retry and safe fallback.

## Icon inventory

Use the existing Lucide family with consistent 1.8–2 px strokes:

- navigation: Home, Droplets, BookOpen, GitBranch, FlaskConical, ClipboardCheck, Library, User, LifeBuoy;
- actions: Search, Sun/Moon, Play, Bookmark, ChevronRight, Download, FileText, Link, MessageSquare;
- states: CheckCircle, Circle, AlertTriangle, Info, XCircle;
- evidence: FileText, Map, Scale, ShieldCheck;
- mastery: BookOpen, Pencil, ClipboardCheck.

Every icon-only control requires an accessible name. Selected, hover, focus, disabled and pressed states must be explicit.

## Copy lock

### Dashboard

- “Aprenda o procedimento. Pratique a decisão.”
- “Continuar formação”
- “Seu percurso pelo POP”
- “8 de 17 módulos”
- “Próximas ações”
- “Fontes e status”
- “Fonte carregada — POP v1.7 · julho de 2026”
- “Cobertura — 161/161 seções substantivas”
- “Natureza do material — Minuta técnica · validação institucional pendente”

### Lesson 26.3

- “Títulos, numeração, sumário e navegação”
- “POP v1.7 · seção 26.3 · minuta técnica”
- “Ao final, você será capaz de revisar títulos, numeração e sumário antes da assinatura.”
- “Aprender”, “Fonte integral”, “Praticar”, “Anotações”
- “Problema”, “Padrão esperado”, “Iniciar prática”

### Laboratory

- “PCH com renovação de LO e condicionantes sem evidência”
- “Prática supervisionada · RLO”
- “LO anterior”, “Relatório de condicionantes”, “Outorga”, “Automonitoramento”
- “Documento didático anonimizado”
- “Validado”, “Insuficiente”, “Não localizado”
- “Fato localizado”, “Consequência técnica”, “Encaminhamento”
- “Comparar com a rubrica”
- “Avaliação didática · não substitui manifestação do IAT”

No visible approval, compatibility or certification claim may be added without an authoritative workflow and evidence.

## Responsive behavior

- at 1180 px, mastery rail may collapse into a drawer or an inline section;
- at 980 px, desktop nav becomes a drawer;
- at 760 px, all major content is single-column;
- tables become labeled row groups or gain deliberate horizontal scrolling with context;
- sticky actions must reserve space and never cover content;
- title and first control remain visible at 320, 360, 390 and 430 px;
- zoom 200% must preserve the reading and transaction paths.

## Accessibility

- WCAG AA contrast;
- one H1 per screen and logical heading order;
- skip link to `#conteudo`;
- visible focus using `--n10-focus`;
- `aria-current`, `aria-expanded`, `aria-pressed` and `aria-live` where applicable;
- error, correct, selected and progress states use text, icon and color;
- media has captions, transcript and playback state;
- reduced motion disables nonessential river and reveal animation.

## Intentional deviations from generated concepts

- generated images occasionally compress long labels; implementation uses exact source text and allows wrapping;
- generated example documents are visual placeholders only; production uses deliberately authored, anonymized training files;
- generated media durations are not authoritative; implementation uses measured duration;
- no generated concept proves legal, institutional or normative approval;
- copy and counts always come from validated data rather than raster text.
