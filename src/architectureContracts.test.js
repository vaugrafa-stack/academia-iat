import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const mainUrl = new URL("./main.jsx", import.meta.url);
const flowchartsUrl = new URL("./Flowcharts.jsx", import.meta.url);
const perfilUrl = new URL("./perfil.jsx", import.meta.url);

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
});
