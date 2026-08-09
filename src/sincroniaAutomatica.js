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
  interpretarGravacao,
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
 * Serializa gravacoes para que cada uma leia a revisao deixada pela anterior.
 * Dois fechamentos rapidos nao devem disputar a mesma revisao-base.
 */
export function criarFilaDeSincronia({
  ler = lerRevisao,
  gravar = (revisao, estado, id) => gravarProgresso(revisao, estado, undefined, id),
  carimbar = gravarRevisao,
  interpretar = interpretarGravacao,
  contaAtiva,
  identificar = quemSou,
} = {}) {
  if (typeof contaAtiva !== "function") {
    throw new TypeError("A fila de sincronia precisa conhecer a conta ativa.");
  }
  let cauda = Promise.resolve();

  const idDaConta = (conta) => {
    const valor = conta && typeof conta === "object" ? conta.id : conta;
    return valor === null || valor === undefined || valor === "" ? null : String(valor);
  };
  const cancelada = () => ({
    aceita: false,
    carimbar: null,
    algoMaisNovo: false,
    cancelada: true,
  });

  return function enfileirar(id, estado) {
    // O identificador pertence a ESTA operacao. O cookie, por outro lado, sera
    // lido pelo navegador somente quando o fetch realmente comecar. Por isso a
    // fila precisa conferir os dois imediatamente antes do envio.
    const idEsperado = idDaConta(id);
    const executar = async () => {
      if (!idEsperado || idDaConta(contaAtiva()) !== idEsperado) return cancelada();

      let identidade;
      try {
        identidade = await identificar();
      } catch {
        // Sem conseguir provar de quem e o cookie, nao se envia documento.
        return cancelada();
      }
      if (
        idDaConta(contaAtiva()) !== idEsperado ||
        idDaConta(identidade) !== idEsperado
      ) {
        return cancelada();
      }

      const pedida = ler(id) + 1;
      const resposta = await gravar(pedida, estado, idEsperado);

      // A requisicao pode ter terminado depois de uma troca de conta. O
      // servidor ja recebeu o pedido sob a identidade validada, mas o retorno
      // antigo nao pode carimbar revisao nem acender aviso na sessao nova.
      if (idDaConta(contaAtiva()) !== idEsperado) return cancelada();

      const veredito = interpretar(pedida, resposta);
      if (veredito.contaAlterada) return cancelada();
      if (veredito.carimbar !== null) carimbar(id, veredito.carimbar);
      return { ...veredito, cancelada: false };
    };
    const atual = cauda.then(executar, executar);
    cauda = atual.catch(() => undefined);
    return atual;
  };
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
  const montado = useRef(true);
  const contaAtiva = useRef(null);
  const fila = useRef(null);
  if (fila.current === null) {
    fila.current = criarFilaDeSincronia({ contaAtiva: () => contaAtiva.current });
  }

  // Quem está logado. Pergunta uma vez, e depois só quando o cartão avisar.
  useEffect(() => {
    let vivo = true;
    montado.current = true;
    (async () => {
      // Sem o sinalizador de build nao ha o que sondar. Ver `contaHabilitada`.
      if (!contaHabilitada()) return;
      if (!(await servicoDisponivel())) return;
      const eu = await quemSou();
      if (vivo) {
        contaAtiva.current = eu?.id || null;
        setConta(eu);
      }
    })();

    const aoMudar = (evento) => {
      const proxima = evento.detail || null;
      // Atualizar o ref antes do render cancela imediatamente tudo o que ainda
      // estiver esperando na fila da conta anterior.
      contaAtiva.current = proxima?.id || null;
      setConta(proxima);
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
      montado.current = false;
      contaAtiva.current = null;
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

    fila.current(id, state)
      .then((veredito) => {
        if (montado.current && veredito.algoMaisNovo) setAlgoMaisNovo(true);
      })
      .catch(() => {
        // Falha inesperada não derruba a tela. A fila se recupera e o progresso
        // local continua sendo a fonte que a pessoa está usando.
      });
    return undefined;
  }, [conta, state]);

  return { conta, algoMaisNovo };
}
