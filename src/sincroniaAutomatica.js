// Gravação automática do progresso, ao fechar um bloco de estudo.
//
// ## Por que isto não mora dentro do cartão da conta
//
// O cartão só existe na tela "Meu progresso". Estudar acontece nas outras: a
// aula, o quiz, o laboratório. Se a gravação morasse lá, ela nunca veria o
// momento em que a pessoa termina alguma coisa, e a conta prometeria continuar
// noutro computador sem nunca ter enviado nada.
//
// Por isso o gancho é chamado no alto da aplicação, onde o estado do progresso
// vive, e o cartão avisa por evento quando alguém entra ou sai.
//
// ## O que ele nunca faz
//
// Não decide conflito, não apaga nada e não mostra erro. Se o serviço recusar a
// gravação porque existe algo mais novo em outro computador, ele apenas anota
// isso e deixa a escolha para a pessoa, na tela do perfil.

import { useEffect, useRef, useState } from "react";
import {
  contaHabilitada,
  gravarProgresso,
  marcoDeEstudo,
  quemSou,
  servicoDisponivel,
} from "./contaRemota.js";
import { gravarRevisao, lerRevisao } from "./sincroniaLocal.js";

export const EVENTO_CONTA = "iat:conta-mudou";
export const EVENTO_PROGRESSO_APLICADO = "iat:progresso-aplicado";

/** O cartão avisa aqui quando alguém entra ou sai. */
export function avisarContaMudou(conta) {
  try {
    globalThis.dispatchEvent?.(new CustomEvent(EVENTO_CONTA, { detail: conta || null }));
  } catch {
    // Ambiente sem janela (teste de nó). Não ter aviso não quebra nada: o
    // gancho volta a perguntar quem está logado na próxima montagem.
  }
}

/**
 * O cartão avisa aqui quando ACABOU DE APLICAR progresso vindo do servidor.
 *
 * Sem este aviso, o gancho vê o estudo "mudar" e devolve ao servidor o que
 * acabou de vir dele: uma gravação inútil e uma revisão a mais a cada login em
 * computador novo. Não é perda de dado, e é ruído que confunde a próxima
 * comparação de revisões.
 */
export function avisarProgressoAplicado() {
  try {
    globalThis.dispatchEvent?.(new CustomEvent(EVENTO_PROGRESSO_APLICADO));
  } catch {
    // Ambiente sem janela. Ver `avisarContaMudou`.
  }
}

/**
 * Enviar agora, ou não?
 *
 * Fora do React de propósito. Esta é a parte que precisa de teste, e amarrá-la a
 * um efeito obrigaria a montar a árvore inteira para exercitar a comparação de
 * dois textos.
 *
 * `marcoAnterior === null` significa "absorva o que vier como base, sem
 * enviar". É o estado logo depois de entrar e logo depois de baixar do
 * servidor, e é o que impede o eco.
 */
export function decidirEnvio({ marcoAnterior, marcoAtual, temConta }) {
  if (!temConta) return { enviar: false, marco: marcoAtual };
  if (marcoAnterior === null) return { enviar: false, marco: marcoAtual };
  if (marcoAnterior === marcoAtual) return { enviar: false, marco: marcoAtual };
  return { enviar: true, marco: marcoAtual };
}

/**
 * Envia o progresso quando um bloco de estudo fecha.
 *
 * Devolve `{ conta, algoMaisNovo }`. `algoMaisNovo` fica verdadeiro quando o
 * serviço recusou a gravação por ter revisão maior, que é o sinal de que outro
 * computador andou.
 */
export function useSincroniaAutomatica(state) {
  const [conta, setConta] = useState(null);
  const [algoMaisNovo, setAlgoMaisNovo] = useState(false);
  const marcoAnterior = useRef(null);

  // Quem está logado. Pergunta uma vez, e depois só quando o cartão avisar.
  useEffect(() => {
    let vivo = true;
    (async () => {
      // Sem o sinalizador de build nao ha o que sondar. Ver `contaHabilitada`.
      if (!contaHabilitada()) return;
      if (!(await servicoDisponivel())) return;
      const eu = await quemSou();
      if (vivo) setConta(eu);
    })();

    const aoMudar = (evento) => {
      setConta(evento.detail || null);
      // O marco volta a zero: logo depois de entrar, o cartão sincroniza, e
      // gravar aqui devolveria ao servidor o que acabou de vir dele.
      marcoAnterior.current = null;
      setAlgoMaisNovo(false);
    };
    // O que veio do servidor NÃO volta para ele. Ver `avisarProgressoAplicado`.
    const aoAplicar = () => {
      marcoAnterior.current = null;
    };
    globalThis.addEventListener?.(EVENTO_CONTA, aoMudar);
    globalThis.addEventListener?.(EVENTO_PROGRESSO_APLICADO, aoAplicar);
    return () => {
      vivo = false;
      globalThis.removeEventListener?.(EVENTO_CONTA, aoMudar);
      globalThis.removeEventListener?.(EVENTO_PROGRESSO_APLICADO, aoAplicar);
    };
  }, []);

  useEffect(() => {
    const id = conta?.id;
    const decisao = decidirEnvio({
      marcoAnterior: marcoAnterior.current,
      marcoAtual: marcoDeEstudo(state),
      temConta: Boolean(id),
    });
    marcoAnterior.current = decisao.marco;
    if (!decisao.enviar) return undefined;

    let vivo = true;
    (async () => {
      const pedida = lerRevisao(id) + 1;
      const r = await gravarProgresso(pedida, state);
      // Falha de rede não vira aviso: o progresso local está salvo, e o que não
      // aconteceu foi a sincronização, que não é o que a pessoa estava fazendo.
      if (!vivo || !r.ok) return;
      const guardada = r.corpo?.revisao ?? pedida;
      gravarRevisao(id, guardada);
      if (guardada !== pedida) setAlgoMaisNovo(true);
    })();
    return () => {
      vivo = false;
    };
  }, [conta, state]);

  return { conta, algoMaisNovo };
}
