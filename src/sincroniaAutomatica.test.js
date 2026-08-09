import { describe, expect, it } from "vitest";
import { decidirEnvio } from "./sincroniaAutomatica.js";

const MARCO_A = "1.0.0.0.0.0.0.1.0";
const MARCO_B = "2.0.0.0.0.0.0.1.0";

describe("quando o navegador manda o progresso para o serviço", () => {
  it("sem conta, nunca manda", () => {
    // Conta é opcional, e quem não criou nenhuma não pode ter o estudo saindo
    // do navegador por causa de um efeito solto.
    const d = decidirEnvio({ marcoAnterior: MARCO_A, marcoAtual: MARCO_B, temConta: false });
    expect(d.enviar).toBe(false);
  });

  it("a primeira observação só vira referência", () => {
    // `null` quer dizer "absorva o que vier como base". É o estado logo depois
    // de entrar: o cartão ainda vai sincronizar, e mandar aqui atropelaria a
    // decisão dele.
    const d = decidirEnvio({ marcoAnterior: null, marcoAtual: MARCO_A, temConta: true });
    expect(d.enviar).toBe(false);
    expect(d.marco).toBe(MARCO_A);
  });

  it("estudo parado não gera tráfego", () => {
    const d = decidirEnvio({ marcoAnterior: MARCO_A, marcoAtual: MARCO_A, temConta: true });
    expect(d.enviar).toBe(false);
  });

  it("bloco de estudo fechado manda", () => {
    const d = decidirEnvio({ marcoAnterior: MARCO_A, marcoAtual: MARCO_B, temConta: true });
    expect(d.enviar).toBe(true);
    expect(d.marco).toBe(MARCO_B);
  });

  it("o que veio do servidor NÃO volta para ele", () => {
    // Este é o defeito que o arquivo existe para não ter. Ao entrar num
    // computador novo, o cartão baixa o progresso e o estado muda. Sem o aviso
    // que zera a referência, o gancho leria isso como estudo novo e devolveria
    // ao servidor o que acabou de vir dele: gravação inútil e uma revisão a
    // mais a cada login.
    //
    // A sequência real: aplicou o remoto -> referência volta a `null` -> a
    // próxima observação é absorvida como base, sem enviar.
    const aplicou = decidirEnvio({ marcoAnterior: null, marcoAtual: MARCO_B, temConta: true });
    expect(aplicou.enviar).toBe(false);
    expect(aplicou.marco).toBe(MARCO_B);

    // E o estudo seguinte, esse sim, sobe.
    const depois = decidirEnvio({
      marcoAnterior: aplicou.marco,
      marcoAtual: "3.0.0.0.0.0.0.1.0",
      temConta: true,
    });
    expect(depois.enviar).toBe(true);
  });

  it("a referência acompanha o estado mesmo quando não manda", () => {
    // Se ela ficasse para trás, a comparação seguinte usaria um marco velho e
    // mandaria de novo o que já foi.
    for (const temConta of [true, false]) {
      const d = decidirEnvio({ marcoAnterior: MARCO_A, marcoAtual: MARCO_B, temConta });
      expect(d.marco, String(temConta)).toBe(MARCO_B);
    }
  });
});
