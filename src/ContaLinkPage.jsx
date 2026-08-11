import React, { useEffect, useRef, useState } from 'react';
import { BadgeCheck, KeyRound, ShieldCheck } from 'lucide-react';
import { PageHeader } from './ui.jsx';
import './routeStyles.css';
import {
  concluirRecuperacao,
  concluirVerificacao,
  contaHabilitada,
  servicoDisponivel,
} from './contaRemota.js';
import { removerTokenDoEndereco } from './contaLinks.js';

const MINIMO_SENHA = 12;

export default function ContaLinkPage({ acao, token, go }) {
  const [servico, setServico] = useState(null);
  const [campos, setCampos] = useState({ senha: '', repetir: '' });
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState('');
  const [concluido, setConcluido] = useState(false);
  const primeiro = useRef(null);

  useEffect(() => {
    let vivo = true;
    (async () => {
      if (!contaHabilitada()) {
        if (vivo) setServico(false);
        return;
      }
      const disponivel = await servicoDisponivel();
      if (vivo) setServico(disponivel);
    })();
    return () => { vivo = false; };
  }, []);

  useEffect(() => {
    if (servico === true) primeiro.current?.focus();
  }, [servico, concluido, acao]);

  const verificar = async () => {
    if (!token || ocupado) return;
    setOcupado(true);
    setErro('');
    const resposta = await concluirVerificacao(token);
    if (resposta.ok) {
      removerTokenDoEndereco();
      setConcluido(true);
    }
    else setErro(resposta.corpo?.mensagem || 'Não foi possível confirmar este endereço.');
    setOcupado(false);
  };

  const recuperar = async (evento) => {
    evento.preventDefault();
    setErro('');
    if (!token) {
      setErro('O link está incompleto. Solicite uma nova recuperação.');
      return;
    }
    if (campos.senha.length < MINIMO_SENHA) {
      setErro('Use uma senha com pelo menos doze caracteres.');
      return;
    }
    if (campos.senha !== campos.repetir) {
      setErro('As duas senhas não são iguais.');
      return;
    }
    setOcupado(true);
    const resposta = await concluirRecuperacao(token, campos.senha);
    if (resposta.ok) {
      removerTokenDoEndereco();
      setCampos({ senha: '', repetir: '' });
      setConcluido(true);
    } else {
      setErro(resposta.corpo?.mensagem || 'Não foi possível redefinir a senha.');
    }
    setOcupado(false);
  };

  const verificacao = acao === 'verificar';
  const titulo = verificacao ? 'Confirmar seu e-mail' : 'Definir uma nova senha';
  const Icone = verificacao ? BadgeCheck : KeyRound;

  return (
    <div className="page profile-page conta-link-page">
      <PageHeader
        icon={Icone}
        kicker="Conta opcional da Academia IAT"
        title={titulo}
        subtitle="Este passo protege a sincronização do seu progresso entre computadores."
      />
      <section className="profile-card conta-link-card" aria-labelledby="conta-link-title">
        <ShieldCheck aria-hidden="true" className="conta-link-icon" />
        <div>
          <h2 id="conta-link-title">{titulo}</h2>
          {servico === null && <p role="status">Verificando o serviço de conta…</p>}
          {servico === false && (
            <p role="alert">
              O serviço de conta não está disponível nesta origem. O conteúdo e o progresso local
              da Academia continuam funcionando normalmente.
            </p>
          )}
          {servico === true && !token && (
            <p role="alert">O link está incompleto. Solicite uma nova mensagem na tela Meu progresso.</p>
          )}
          {servico === true && token && concluido && (
            <div className="conta-link-success" role="status">
              <strong>{verificacao ? 'E-mail confirmado.' : 'Senha redefinida.'}</strong>
              <p>Agora você pode entrar e sincronizar seu progresso.</p>
              <button ref={primeiro} type="button" className="primary" onClick={() => go('perfil')}>
                Ir para Meu progresso
              </button>
            </div>
          )}
          {servico === true && token && !concluido && verificacao && (
            <div className="conta-link-action">
              <p>Confirme somente se você criou esta conta. O link funciona uma única vez.</p>
              <button
                ref={primeiro}
                type="button"
                className="primary"
                disabled={ocupado}
                onClick={verificar}
              >
                {ocupado ? 'Confirmando…' : 'Confirmar e-mail'}
              </button>
            </div>
          )}
          {servico === true && token && !concluido && !verificacao && (
            <form className="profile-form conta-link-form" onSubmit={recuperar}>
              <label>
                Nova senha
                <input
                  ref={primeiro}
                  type="password"
                  required
                  minLength={MINIMO_SENHA}
                  autoComplete="new-password"
                  value={campos.senha}
                  onChange={(evento) => setCampos((atual) => ({ ...atual, senha: evento.target.value }))}
                />
              </label>
              <label>
                Repetir nova senha
                <input
                  type="password"
                  required
                  minLength={MINIMO_SENHA}
                  autoComplete="new-password"
                  value={campos.repetir}
                  onChange={(evento) => setCampos((atual) => ({ ...atual, repetir: evento.target.value }))}
                />
              </label>
              <small>Use doze caracteres ou mais e não reutilize a senha de outro serviço.</small>
              <button type="submit" className="primary" disabled={ocupado}>
                {ocupado ? 'Salvando…' : 'Salvar nova senha'}
              </button>
            </form>
          )}
          {erro && <p className="conta-aviso conta-aviso-erro" role="alert">{erro}</p>}
        </div>
      </section>
    </div>
  );
}
