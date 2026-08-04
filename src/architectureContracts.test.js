import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { trackGroups, tracks } from "./courseData.js";

const mainUrl = new URL("./main.jsx", import.meta.url);
const flowchartsUrl = new URL("./Flowcharts.jsx", import.meta.url);
const perfilUrl = new URL("./perfil.jsx", import.meta.url);
const laboratorioUrl = new URL("./laboratorio.jsx", import.meta.url);
const redatorUrl = new URL("./redator.jsx", import.meta.url);
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
    const main = await readFile(mainUrl, "utf8");

    expect(main).toContain("function mediaForLesson(lesson)");
    expect(main).toContain("const feat = mediaForLesson(continueLesson)");
    expect(main).toContain("const media = mediaForLesson(lesson)");
    expect(main).not.toContain('/media/tour-usina.mp4');
    expect(main).toContain("Resumo em vídeo desta aula");
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
    const [main, styles] = await Promise.all([
      readFile(mainUrl, "utf8"),
      readFile(stylesUrl, "utf8"),
    ]);
    const lessonSection = main.slice(
      main.indexOf("function Lesson("),
      main.indexOf("function LessonKnowledgeCheck"),
    );

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
