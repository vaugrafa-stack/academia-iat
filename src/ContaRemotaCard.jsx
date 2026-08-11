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
import {
  AlertTriangle,
  Check,
  Cloud,
  CloudOff,
  KeyRound,
  LogOut,
  RefreshCw,
  ShieldX,
  Trash2,
} from 'lucide-react';
import {
  alterarSenha,
  DESCE_O_REMOTO,
  NADA_A_FAZER,
  PERGUNTAR,
  SOBE_O_LOCAL,
  contaHabilitada,
  criarConta,
  documentoParaEstado,
  entrar,
  excluirConta,
  gravarProgresso,
  interpretarGravacao,
  pedirRecuperacao,
  planejarSincronia,
  quemSou,
  reenviarVerificacao,
  sair,
  sairDeTodas,
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
  const [emailPendente, setEmailPendente] = useState('');
  const [painelConta, setPainelConta] = useState('');
  const [seguranca, setSeguranca] = useState({
    atual: '',
    nova: '',
    repetir: '',
    confirmacao: '',
  });

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
        const r = await gravarProgresso(plano.revisao, state, undefined, id);
        const veredito = interpretarGravacao(plano.revisao, r);
        if (veredito.carimbar !== null) gravarRevisao(id, veredito.carimbar);
        setRecado(
          veredito.aceita
            ? 'Progresso deste computador enviado.'
            : veredito.algoMaisNovo
              ? 'Alguém gravou de outro computador enquanto isto acontecia. Sincronize de novo para escolher o que fica.'
              : 'Não deu para sincronizar agora. Seu estudo continua salvo aqui.',
        );
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
        const r = await gravarProgresso(revisao, state, undefined, id);
        const veredito = interpretarGravacao(revisao, r);
        if (veredito.carimbar !== null) gravarRevisao(id, veredito.carimbar);
        setRecado(
          veredito.aceita
            ? 'Mantido o estudo deste computador, e o guardado foi substituído.'
            : veredito.algoMaisNovo
              ? 'Enquanto você decidia, outro computador gravou. Nada foi alterado: sincronize de novo.'
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
        if (modo === CRIAR && r.corpo?.codigo === 'conta_criada_correspondencia_pendente') {
          setEmailPendente(campos.email.trim());
          setRecado(r.corpo.mensagem);
          setModo(ENTRAR);
          setCampos((atual) => ({ ...atual, senha: '', nome: '' }));
          setOcupado(false);
          return;
        }
        if (r.corpo?.codigo === 'email_nao_verificado') {
          setEmailPendente(campos.email.trim());
        }
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
        // A conta não abre sessão antes de provar que o endereço responde.
        setEmailPendente(campos.email.trim());
        setRecado('Conta criada. Abra o link enviado ao seu e-mail antes de entrar.');
        setModo(ENTRAR);
        setCampos((atual) => ({ ...atual, senha: '', nome: '' }));
        setOcupado(false);
        return;
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

  const reenviarConfirmacao = useCallback(async () => {
    const email = emailPendente || campos.email.trim();
    if (!email) return;
    setOcupado(true);
    setErro('');
    setRecado('');
    const resposta = await reenviarVerificacao(email);
    if (resposta.erro || !resposta.ok) {
      setErro(
        resposta.corpo?.mensagem ||
          'Não foi possível alcançar o serviço de conta. Tente novamente em instantes.',
      );
    } else {
      setRecado(
        resposta.corpo?.mensagem ||
          'Se existir conta ainda não verificada, um novo link foi enviado.',
      );
    }
    setOcupado(false);
  }, [campos.email, emailPendente]);

  const limparSeguranca = useCallback(() => {
    setSeguranca({ atual: '', nova: '', repetir: '', confirmacao: '' });
    setPainelConta('');
  }, []);

  const trocarSenhaDaConta = useCallback(async (evento) => {
    evento.preventDefault();
    setErro('');
    if (seguranca.nova !== seguranca.repetir) {
      setErro('As duas senhas novas não são iguais.');
      return;
    }
    setOcupado(true);
    const resposta = await alterarSenha(seguranca.atual, seguranca.nova);
    if (resposta.ok) {
      limparSeguranca();
      setRecado('Senha alterada. As outras sessões foram encerradas.');
    } else {
      setErro(resposta.corpo?.mensagem || 'Não foi possível alterar a senha.');
    }
    setOcupado(false);
  }, [limparSeguranca, seguranca]);

  const encerrarTodas = useCallback(async () => {
    const id = conta?.id;
    setOcupado(true);
    setErro('');
    const resposta = await sairDeTodas();
    if (resposta.ok) {
      esquecerRevisao(id);
      setConta(null);
      avisarContaMudou(null);
      limparSeguranca();
      setRecado('Todas as sessões foram encerradas. O estudo deste computador continua aqui.');
    } else {
      setErro(resposta.corpo?.mensagem || 'Não foi possível encerrar todas as sessões.');
    }
    setOcupado(false);
  }, [conta, limparSeguranca]);

  const apagarConta = useCallback(async (evento) => {
    evento.preventDefault();
    const id = conta?.id;
    setErro('');
    if (seguranca.confirmacao !== 'EXCLUIR') {
      setErro('Digite exatamente EXCLUIR para confirmar.');
      return;
    }
    setOcupado(true);
    const resposta = await excluirConta(seguranca.atual, seguranca.confirmacao);
    if (resposta.ok) {
      esquecerRevisao(id);
      setConta(null);
      avisarContaMudou(null);
      limparSeguranca();
      setRecado('Conta excluída. O estudo salvo somente neste computador foi preservado.');
    } else {
      setErro(resposta.corpo?.mensagem || 'Não foi possível excluir a conta.');
    }
    setOcupado(false);
  }, [conta, limparSeguranca, seguranca]);

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
        <details className="conta-seguranca">
          <summary>Segurança e privacidade da conta</summary>
          <div className="conta-seguranca-actions">
            <button type="button" className="text-action" onClick={() => setPainelConta('senha')}>
              <KeyRound aria-hidden="true" /> Alterar senha
            </button>
            <button type="button" className="text-action" disabled={ocupado} onClick={encerrarTodas}>
              <ShieldX aria-hidden="true" /> Sair de todos os dispositivos
            </button>
            <button type="button" className="text-action danger" onClick={() => setPainelConta('excluir')}>
              <Trash2 aria-hidden="true" /> Excluir conta
            </button>
          </div>
          {painelConta === 'senha' && (
            <form className="profile-form conta-security-form" onSubmit={trocarSenhaDaConta}>
              <label>
                Senha atual
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={seguranca.atual}
                  onChange={(e) => setSeguranca((s) => ({ ...s, atual: e.target.value }))}
                />
              </label>
              <label>
                Nova senha
                <input
                  type="password"
                  required
                  minLength={12}
                  autoComplete="new-password"
                  value={seguranca.nova}
                  onChange={(e) => setSeguranca((s) => ({ ...s, nova: e.target.value }))}
                />
              </label>
              <label>
                Repetir nova senha
                <input
                  type="password"
                  required
                  minLength={12}
                  autoComplete="new-password"
                  value={seguranca.repetir}
                  onChange={(e) => setSeguranca((s) => ({ ...s, repetir: e.target.value }))}
                />
              </label>
              <div className="profile-actions-row">
                <button type="submit" className="primary" disabled={ocupado}>Salvar nova senha</button>
                <button type="button" className="text-action" onClick={limparSeguranca}>Cancelar</button>
              </div>
            </form>
          )}
          {painelConta === 'excluir' && (
            <form className="profile-form conta-security-form conta-danger-zone" onSubmit={apagarConta}>
              <p>
                <strong>Esta ação apaga a conta e o progresso sincronizado.</strong>{' '}
                O perfil local deste navegador permanece.
              </p>
              <label>
                Senha atual
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={seguranca.atual}
                  onChange={(e) => setSeguranca((s) => ({ ...s, atual: e.target.value }))}
                />
              </label>
              <label>
                Digite EXCLUIR
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={seguranca.confirmacao}
                  onChange={(e) => setSeguranca((s) => ({ ...s, confirmacao: e.target.value }))}
                />
              </label>
              <div className="profile-actions-row">
                <button type="submit" className="danger" disabled={ocupado}>Excluir minha conta</button>
                <button type="button" className="text-action" onClick={limparSeguranca}>Cancelar</button>
              </div>
            </form>
          )}
        </details>
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
      {emailPendente && (
        <button
          type="button"
          className="text-action conta-reenviar"
          disabled={ocupado}
          onClick={reenviarConfirmacao}
        >
          Reenviar link de confirmação
        </button>
      )}
    </article>
  );
}
