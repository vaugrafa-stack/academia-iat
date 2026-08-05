import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { trackGroups, tracks } from "./courseData.js";

const mainUrl = new URL("./main.jsx", import.meta.url);
const flowchartsUrl = new URL("./Flowcharts.jsx", import.meta.url);
const perfilUrl = new URL("./perfil.jsx", import.meta.url);
const laboratorioUrl = new URL("./laboratorio.jsx", import.meta.url);
const redatorUrl = new URL("./redator.jsx", import.meta.url);
const licaoUrl = new URL("./licao.jsx", import.meta.url);
const stylesUrl = new URL("./styles.css", import.meta.url);

describe("contratos incrementais de arquitetura", () => {
  it("mantém o domínio de fluxos fora do orquestrador e sob lazy loading", async () => {
    const [main, flowcharts] = await Promise.all([
      readFile(mainUrl, "utf8"),
      readFile(flowchartsUrl, "utf8"),
    ]);

    expect(main).toMatch(
      /const Flowcharts = lazy\(\(\) => import\("\.\/Flowcharts\.jsx"\)\)/,
    );
    expect(main).toContain(
      "<Flowcharts state={state} setState={setState} flowData={flowData} />",
    );
    expect(main).not.toMatch(/function (?:Flowcharts|FlowBuilder|FlowDecisionGate)\b/);
    expect(flowcharts).toMatch(
      /export default function Flowcharts\(\{ state, setState, flowData \}\)/,
    );
  });

  it("impede que main.jsx volte ao tamanho anterior à extração", async () => {
    const main = (await readFile(mainUrl, "utf8")).replace(/\r\n/g, "\n");
    const bytes = Buffer.byteLength(main, "utf8");

    expect(bytes).toBeLessThanOrEqual(155_000);
  });

  it("mantém a navegação orientada por tarefa e o perfil explicitamente local", async () => {
    const [main, perfil] = await Promise.all([
      readFile(mainUrl, "utf8"),
      readFile(perfilUrl, "utf8"),
    ]);

    const aprender = main.slice(main.indexOf('["Aprender"'), main.indexOf('["Praticar"'));
    const consultar = main.slice(main.indexOf('["Consultar"'), main.indexOf('["Neste dispositivo"'));

    expect(aprender).not.toContain('"Fluxogramas"');
    expect(consultar).toContain('"Fluxogramas"');
    expect(main).toContain('["Neste dispositivo"');
    expect(main).toContain('["perfil", "Meu progresso"');
    expect(main).not.toContain('"Criar sua conta"');
    expect(perfil).toContain('kicker="Meu progresso neste dispositivo"');
  });

  it("associa o painel de continuidade à mídia da própria aula", async () => {
    // `mediaForLesson` fica em main.jsx, que e quem tem a colecao de pilotos
    // carregada; a aula recebe a funcao pelo contrato `dados`. Por isso a
    // definicao e o uso do Inicio sao conferidos la, e o uso da aula aqui.
    const [main, licao] = await Promise.all([
      readFile(mainUrl, "utf8"),
      readFile(licaoUrl, "utf8"),
    ]);

    expect(main).toContain("function mediaForLesson(lesson, pilotCollection)");
    expect(main).toContain(
      "mediaForLesson(continueLesson, pilotMediaStatus.collection)",
    );
    expect(licao).toContain(
      "mediaForLesson(lesson, pilotMediaStatus.collection)",
    );
    expect(main).not.toContain('/media/tour-usina.mp4');
    expect(licao).not.toContain('/media/tour-usina.mp4');
    // O rotulo e do cartao de continuidade do Inicio, que ficou em main.jsx.
    expect(main).toContain("Resumo em vídeo desta aula");
  });

  it("mantém a tela de aula fora do orquestrador, com contrato de dados", async () => {
    // A aula saiu de main.jsx em 05/08/2026 com 1.441 linhas. O contrato que
    // impede a volta nao e o tamanho, e a FRONTEIRA: se `licao.jsx` voltar a
    // ler dado do escopo de main, a extracao terá sido só de texto.
    const [main, licao] = await Promise.all([
      readFile(mainUrl, "utf8"),
      readFile(licaoUrl, "utf8"),
    ]);

    // Sem fixar a lista de exportações nomeadas: o que o contrato defende é a
    // fronteira, não quantas peças a atravessam.
    expect(main).toMatch(/import Lesson, \{[^}]*\} from "\.\/licao\.jsx"/);
    expect(main).toContain("dados={DADOS_AULA}");
    expect(main).not.toMatch(/^function (?:Lesson|LessonOverview|LessonKnowledgeCheck|VideoLesson)\b/m);
    expect(licao).toMatch(/export default function Lesson\(\{[\s\S]*?dados,\n\}\)/);
    // O mesmo objetivo aparece no Inicio e na aula, vindo da mesma funcao.
    expect(main).toContain("objetivoDaAula(lesson, blocks, tableMap)");
    expect(licao).toContain("objetivoDaAula(lesson, blocks, tableMap)");
  });

  it("mantém o início enxuto e a sequência única M00–M16", async () => {
    const main = await readFile(mainUrl, "utf8");

    expect(main).toContain("Objetivo atual");
    expect(main).toContain("Próxima prática");
    expect(main).toContain("Erros para revisar");
    expect(main).toContain("Quatro fases do percurso");
    expect(main).toContain("Sobre a fonte");
    expect(main).toContain("A sequência permanece única, de M00 a M16.");
    expect(main).not.toContain("<TodayPlan");
    expect(main).not.toContain('className="river-journey"');
    expect(
      trackGroups
        .flatMap((group) => group.ids)
        .map((id) => tracks.find((track) => track.id === id)?.code),
    ).toEqual(
      Array.from({ length: 17 }, (_, index) => `M${String(index).padStart(2, "0")}`),
    );
  });

  it("expõe a navegação móvel por tarefa e antecipa o vídeo da aula", async () => {
    const [main, licao, styles] = await Promise.all([
      readFile(mainUrl, "utf8"),
      readFile(licaoUrl, "utf8"),
      readFile(stylesUrl, "utf8"),
    ]);
    const inicio = licao.indexOf("export default function Lesson(");
    const fim = licao.indexOf("function LessonKnowledgeCheck");
    // Fatia com as duas pontas conferidas. `indexOf` que nao acha devolve -1, e
    // `slice(-1, ...)` ainda produz string: a ordem passaria a ser verificada
    // em texto errado, e o contrato viraria decoracao.
    expect(inicio).toBeGreaterThan(-1);
    expect(fim).toBeGreaterThan(inicio);
    const lessonSection = licao.slice(inicio, fim);

    expect(main).toContain("function MobileBottomNav");
    for (const label of ["Início", "Aprender", "Praticar", "Consultar"]) {
      expect(main).toContain(`label: "${label}"`);
    }
    expect(styles).toContain(".mobile-bottom-nav");
    expect(styles).toMatch(/@media\(max-width:980px\)[\s\S]*\.mobile-bottom-nav/);
    expect(lessonSection.indexOf("<VideoLesson")).toBeGreaterThan(-1);
    expect(lessonSection.indexOf("<VideoLesson")).toBeLessThan(
      lessonSection.indexOf("<SourceAssurance compact"),
    );
  });

  it("promete uma coisa só por aula", async () => {
    // A aula chegou a mostrar dois objetivos DIFERENTES ao mesmo tempo: o
    // derivado do POP no cabeçalho e o do perfil no corpo. `design.objective`
    // só pode aparecer dentro de `objetivoDaAula`, que é a reserva de quem não
    // tem objetivo próprio. Em qualquer outro lugar de licao.jsx, ele produz
    // uma segunda promessa.
    const licao = await readFile(licaoUrl, "utf8");
    const usos = [...licao.matchAll(/design\.objective/g)].length;
    expect(usos).toBe(0);
    expect(licao).toContain("getLearningDesign(lesson, blocks).objective");
    // E o cabeçalho continua sendo o único lugar que mostra o objetivo.
    expect([...licao.matchAll(/\{alvo\.objetivo\}/g)].length).toBe(1);
  });

  it("mantém a regra do Laboratório fora do arquivo da tela", async () => {
    // As regras saíram de laboratorio.jsx em 05/08/2026. O contrato que impede
    // a volta não é o tamanho: é a AUSÊNCIA de React no módulo de regra. Se
    // `laboratorioLogica.js` voltar a importar React ou a conter JSX, os trinta
    // testes que exercitam regra voltam a carregar a tela inteira para isso.
    const [logica, tela] = await Promise.all([
      readFile(new URL("./laboratorioLogica.js", import.meta.url), "utf8"),
      readFile(laboratorioUrl, "utf8"),
    ]);

    expect(logica).not.toMatch(/from ['"]react['"]/);
    expect(logica).not.toMatch(/<[A-Z][A-Za-z]*[\s/>]/);
    expect(logica).not.toMatch(/\buse(?:State|Effect|Memo|Ref|LayoutEffect)\s*\(/);
    expect(tela).toContain("from './laboratorioLogica.js'");
    // A tela não redeclara o que importa.
    for (const nome of ["criarCatalogoLaboratorio", "calcularIndicadoresLaboratorio", "conferirElementos"]) {
      expect(tela).not.toMatch(new RegExp(`^(?:export )?function ${nome}\\(`, "m"));
      expect(logica).toMatch(new RegExp(`^export function ${nome}\\(`, "m"));
    }
  });

  it("mantém catálogo móvel do Laboratório e seletor compacto do Redator", async () => {
    const [laboratorio, redator] = await Promise.all([
      readFile(laboratorioUrl, "utf8"),
      readFile(redatorUrl, "utf8"),
    ]);

    expect(laboratorio).toContain('className="lab-catalog-open"');
    expect(laboratorio).toContain('id="lab-case-catalog-drawer"');
    expect(laboratorio).toContain("role={mobileCatalog ? 'dialog' : undefined}");
    expect(redator).toContain("Etapa {passo + 1} de {ESTRUTURA_IT.length}");
    expect(redator).toContain('id="rd-step-select"');
  });
});
