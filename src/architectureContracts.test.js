import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

const mainUrl = new URL("./main.jsx", import.meta.url);
const flowchartsUrl = new URL("./Flowcharts.jsx", import.meta.url);

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
});
