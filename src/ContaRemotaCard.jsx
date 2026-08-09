// Cartão da conta opcional, dentro do "Meu progresso".
//
// ## Por que ele às vezes não aparece
//
// A Academia publicada em página estática não tem backend. Este cartão pergunta
// primeiro se existe serviço de conta na mesma origem, e não desenha nada
// quando não existe. Oferecer "criar conta" onde não há onde criar seria pior
// do que não oferecer.
//
// ## Por que ele nunca bloqueia
//
// Conta é opcional, e a plataforma inteira funciona sem ela. Falha de rede aqui
// não vira erro vermelho: o progresso local está salvo, e o que não aconteceu
// foi a sincronização, que não é o que a pessoa estava fazendo.
//
// ## A decisão que este cartão não toma sozinho
//
// Quando os dois lados têm estudo e as revisões divergem, ele PERGUNTA, com as
// duas consequências escritas. Escolher por conta própria custaria a tarde de
// estudo de um dos lados.
import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Check, Cloud, CloudOff, LogOut, RefreshCw } from 'lucide-react';
import {
  DESCE_O_REMOTO,
  NADA_A_FAZER,
  PERGUNTAR,
  SOBE_O_LOCAL,
  contaHabilitada,
  criarConta,
  documentoParaEstado,
  entrar,
  gravarProgresso,
  pedirRecuperacao,
  planejarSincronia,
  quemSou,
  sair,
  servicoDisponivel,
} from './contaRemota.js';
import { esquecerRevisao, gravarRevisao, lerRevisao } from './sincroniaLocal.js';
import { avisarContaMudou, avisarProgressoAplicado } from './sincroniaAutomatica.js';

const ENTRAR = 'entrar';
const CRIAR = 'criar';
const RECUPERAR = 'recuperar';

function Aviso({ tom, children }) {
  if (!children) return null;
  return (
    <p className={`conta-aviso conta-aviso-${tom}`} role={tom === 'erro' ? 'alert' : 'status'}>
      {tom === 'erro' ? <AlertTriangle aria-hidden="true" /> : <Check aria-hidden="true" />}
      <span>{children}</span>
    </p>
  );
}

export default function ContaRemotaCard({ state, setState, algoMaisNovo = false }) {
  const [servico, setServico] = useState(null); // null = ainda perguntando
  const [conta, setConta] = useState(null);
  const [modo, setModo] = useState(ENTRAR);
  const [campos, setCampos] = useState({ email: '', senha: '', nome: '' });
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [recado, setRecado] = useState('');
  const [conflito, setConflito] = useState(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      // Sem o sinalizador de build, nem a sondagem acontece: na versao estatica
      // ela seria um 404 por carga, e erro de console em toda visita.
      if (!contaHabilitada()) return;
      const existe = await servicoDisponivel();
      if (!vivo) return;
      setServico(existe);
      if (existe) setConta(await quemSou());
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const aplicarRemoto = useCallback(
    (documento, revisao, id) => {
      const vindo = documentoParaEstado(documento);
      if (!vindo) return false;
      // Mescla por cima do estado atual em vez de substituir: campo que a
      // versão de lá não conhecia continua existindo aqui, em vez de sumir.
      setState((atual) => ({ ...atual, ...vindo }));
      gravarRevisao(id, revisao);
      // O que veio do servidor não volta para ele. Sem este aviso, a gravação
      // automática vê o estudo mudar e devolve o que acabou de baixar.
      avisarProgressoAplicado();
      return true;
    },
    [setState],
  );

  const sincronizar = useCallback(
    async (identificador) => {
      const id = identificador || conta?.id;
      if (!id) return;
      setOcupado(true);
      setErro('');
      setConflito(null);
      const plano = await planejarSincronia(state, lerRevisao(id));

      if (plano.acao === PERGUNTAR) {
        setConflito(plano);
        setRecado('');
      } else if (plano.acao === SOBE_O_LOCAL) {
        const r = await gravarProgresso(plano.revisao, state);
        if (r.ok) {
          gravarRevisao(id, r.corpo?.revisao ?? plano.revisao);
          setRecado('Progresso deste computador enviado.');
        } else {
          setRecado('Não deu para sincronizar agora. Seu estudo continua salvo aqui.');
        }
      } else if (plano.acao === DESCE_O_REMOTO) {
        const trouxe = aplicarRemoto(plano.remoto?.documento, plano.revisao, id);
        setRecado(
          trouxe
            ? 'Progresso do outro computador trazido para cá.'
            : 'O que estava guardado não pôde ser lido. Seu estudo daqui continua intacto.',
        );
      } else if (plano.offline) {
        setRecado('Sem resposta do serviço agora. Seu estudo continua salvo neste computador.');
      } else if (plano.acao === NADA_A_FAZER) {
        setRecado('Nada a sincronizar: os dois lados estão iguais.');
      }
      setOcupado(false);
    },
    [aplicarRemoto, conta, state],
  );

  // A leitura do progresso remoto no conflito vem do próprio plano, e não de
  // uma segunda chamada: entre uma e outra o servidor pode mudar, e a pessoa
  // teria decidido sobre uma coisa e recebido outra.
  const resolverConflito = useCallback(
    async (escolha) => {
      const id = conta?.id;
      if (!conflito || !id) return;
      setOcupado(true);
      if (escolha === SOBE_O_LOCAL) {
        const revisao = (conflito.remoto?.revisao ?? 0) + 1;
        const r = await gravarProgresso(revisao, state);
        if (r.ok) gravarRevisao(id, r.corpo?.revisao ?? revisao);
        setRecado(
          r.ok
            ? 'Mantido o estudo deste computador, e o guardado foi substituído.'
            : 'Não deu para enviar agora. Nada foi alterado.',
        );
      } else {
        const trouxe = aplicarRemoto(conflito.remoto?.documento, conflito.remoto?.revisao ?? 0, id);
        setRecado(
          trouxe
            ? 'Trazido o estudo do outro computador.'
            : 'O que estava guardado não pôde ser lido. Nada foi alterado aqui.',
        );
      }
      setConflito(null);
      setOcupado(false);
    },
    [aplicarRemoto, conflito, conta, state],
  );

  const enviar = useCallback(
    async (evento) => {
      evento.preventDefault();
      setOcupado(true);
      setErro('');
      setRecado('');

      if (modo === RECUPERAR) {
        await pedirRecuperacao(campos.email);
        // A mesma frase exista a conta ou não. Distinguir aqui transformaria a
        // recuperação em consulta de cadastro.
        setRecado('Se existir conta com esse endereço, o link de recuperação foi enviado.');
        setOcupado(false);
        return;
      }

      const r =
        modo === CRIAR
          ? await criarConta(campos.email, campos.senha, campos.nome)
          : await entrar(campos.email, campos.senha);

      if (!r.ok) {
        setErro(
          r.corpo?.mensagem ||
            (r.erro
              ? 'O serviço de conta não respondeu. Seu estudo continua salvo neste computador.'
              : 'Não foi possível concluir.'),
        );
        setOcupado(false);
        return;
      }

      if (modo === CRIAR) {
        // Criar não abre sessão: entrar em seguida é uma chamada a mais e evita
        // dois caminhos diferentes para o mesmo estado de "logado".
        const login = await entrar(campos.email, campos.senha);
        if (!login.ok) {
          setRecado('Conta criada. Entre com ela para sincronizar.');
          setModo(ENTRAR);
          setOcupado(false);
          return;
        }
      }

      const eu = await quemSou();
      setConta(eu);
      avisarContaMudou(eu);
      setCampos({ email: '', senha: '', nome: '' });
      setOcupado(false);
      if (eu) await sincronizar(eu.id);
    },
    [campos, modo, sincronizar],
  );

  const sairDaConta = useCallback(async () => {
    const id = conta?.id;
    await sair();
    esquecerRevisao(id);
    setConta(null);
    avisarContaMudou(null);
    setConflito(null);
    setRecado('Você saiu da conta. O estudo deste computador continua aqui.');
  }, [conta]);

  // Serviço ausente (o caso da página publicada) ou ainda sendo perguntado: o
  // cartão não existe. Nada de "carregando" para algo que talvez nem apareça.
  if (servico !== true) return null;

  if (conta) {
    return (
      <article className="profile-card conta-remota">
        <h3>
          <Cloud aria-hidden="true" /> Sincronização
        </h3>
        <p className="profile-note">
          Entrou como <strong>{conta.email}</strong>. Seu progresso pode ser continuado em outro
          computador.
        </p>

        {conflito ? (
          <div className="conta-conflito" role="group" aria-label="Escolha qual estudo manter">
            <p>
              Há estudo registrado nos dois lados, e eles seguiram caminhos diferentes. Escolher é
              com você, porque um dos dois vai ser substituído.
            </p>
            <div className="profile-actions-row">
              <button type="button" disabled={ocupado} onClick={() => resolverConflito(SOBE_O_LOCAL)}>
                Manter o deste computador
              </button>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => resolverConflito(DESCE_O_REMOTO)}
              >
                Trazer o do outro computador
              </button>
            </div>
          </div>
        ) : (
          <div className="profile-actions-row">
            <button type="button" className="primary" disabled={ocupado} onClick={() => sincronizar()}>
              <RefreshCw aria-hidden="true" /> {ocupado ? 'Sincronizando...' : 'Sincronizar agora'}
            </button>
            <button type="button" className="text-action" onClick={sairDaConta}>
              <LogOut aria-hidden="true" /> Sair da conta
            </button>
          </div>
        )}

        {algoMaisNovo && !conflito && (
          <Aviso tom="ok">
            Há estudo mais novo em outro computador. Sincronize para escolher o que fica.
          </Aviso>
        )}
        <Aviso tom="ok">{recado}</Aviso>
        <Aviso tom="erro">{erro}</Aviso>
      </article>
    );
  }

  return (
    <article className="profile-card conta-remota">
      <h3>
        <CloudOff aria-hidden="true" /> Continuar em outro computador
      </h3>
      <p className="profile-note">
        Opcional. Sem conta, seu estudo fica salvo neste navegador, como está hoje. Com conta, ele
        acompanha você em outra máquina.
      </p>

      <form className="profile-form" onSubmit={enviar}>
        <label>
          E-mail
          <input
            type="email"
            required
            autoComplete="email"
            value={campos.email}
            onChange={(e) => setCampos((c) => ({ ...c, email: e.target.value }))}
          />
        </label>

        {modo === CRIAR && (
          <label>
            Como quer ser chamado
            <input
              type="text"
              value={campos.nome}
              autoComplete="nickname"
              onChange={(e) => setCampos((c) => ({ ...c, nome: e.target.value }))}
            />
          </label>
        )}

        {modo !== RECUPERAR && (
          <label>
            Senha
            <input
              type="password"
              required
              minLength={12}
              autoComplete={modo === CRIAR ? 'new-password' : 'current-password'}
              value={campos.senha}
              onChange={(e) => setCampos((c) => ({ ...c, senha: e.target.value }))}
            />
            {modo === CRIAR && (
              <small>
                Doze caracteres ou mais. Uma frase de que você lembre vale mais do que símbolos
                embaralhados.
              </small>
            )}
          </label>
        )}

        <div className="profile-actions-row">
          <button type="submit" className="primary" disabled={ocupado}>
            {modo === CRIAR ? 'Criar conta' : modo === RECUPERAR ? 'Enviar link' : 'Entrar'}
          </button>
          <button
            type="button"
            className="text-action"
            onClick={() => {
              setModo(modo === CRIAR ? ENTRAR : CRIAR);
              setErro('');
              setRecado('');
            }}
          >
            {modo === CRIAR ? 'Já tenho conta' : 'Criar uma conta'}
          </button>
          {modo !== RECUPERAR && (
            <button
              type="button"
              className="text-action"
              onClick={() => {
                setModo(RECUPERAR);
                setErro('');
                setRecado('');
              }}
            >
              Esqueci a senha
            </button>
          )}
        </div>
      </form>

      <Aviso tom="ok">{recado}</Aviso>
      <Aviso tom="erro">{erro}</Aviso>
    </article>
  );
}
