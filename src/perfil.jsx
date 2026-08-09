// Tela do perfil: conta local, progresso por modulo, registro de conclusao,
// backup e troca de usuario.
//
// Saiu de main.jsx em 04/08/2026, 558 linhas. Era a segunda maior tela ainda
// dentro do arquivo, e carregava junto a geracao de certificado em SVG, que so
// serve aqui.
//
// A fronteira e a propriedade `dados`: tudo que vem do POP derivado ou de
// helper de main.jsx entra por um objeto so, no mesmo padrao de
// DADOS_BIBLIOTECA. Sao tres coisas, e nenhuma delas e trivial de recalcular
// aqui: a lista de aulas, o progresso por modulo e os requisitos de
// autoestudo, que dependem de questionBank, scenarios e trackLessons.
//
// O que NAO mudou: comportamento, marcacao e classes de estilo. Extracao que
// aproveita para redesenhar impede saber, quando algo quebra, se foi a mudanca
// de lugar ou a mudanca de conteudo.
import React, { lazy, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BadgeCheck,
  Bookmark,
  Check,
  CheckCircle2,
  Download,
  StickyNote,
  Target,
  X,
} from 'lucide-react';
import { PageHeader } from './ui.jsx';
import { lessonEvidenceStatus } from './lessonEvidence.js';

// O gerenciador offline so aparece dentro do perfil, entao segue adiado aqui.
const OfflineManager = lazy(() => import('./OfflineManager.jsx'));
// A conta remota tambem: ela nao existe na versao publicada em pagina estatica,
// e o cartao se apaga sozinho quando nao ha servico na mesma origem. Carregar
// isso adiantado seria pagar por codigo que a maioria dos acessos nunca usa.
const ContaRemotaCard = lazy(() => import('./ContaRemotaCard.jsx'));
import { tracks } from './courseData.js';
import {
  hasAccount,
  registerCertificate,
  certificateSvg,
  downloadSvg,
  listUsers,
  switchUser,
  createUser,
  deleteUser,
  exportBackup,
  importBackup,
  exportProfileRegistryRecovery,
  resetInvalidProfileRegistry,
} from './profile';

export default function Profile({
  state,
  setState,
  algoMaisNovo,
  progress,
  profile,
  setProfile,
  profileStatus,
  setProfileStatus,
  go,
  openLesson,
  dados,
}) {
  // Contrato com main.jsx: o que vem do POP derivado e dos helpers dele entra
  // por aqui, em vez de ser lido do escopo do modulo.
  const { lessons, trackProgress, requisitosAutoestudo } = dados;
  const conta = hasAccount(profile);
  const [editando, setEditando] = useState(!conta);
  const [form, setForm] = useState({
    name: profile.name || "",
    role: profile.role || "",
    unit: profile.unit || "",
  });
  const salvar = (e) => {
    e && e.preventDefault && e.preventDefault();
    const nome = (form.name || "").trim();
    if (!nome) return;
    const saved = setProfile((pr) => ({
      ...pr,
      name: nome,
      role: (form.role || "").trim(),
      unit: (form.unit || "").trim(),
      createdAt: pr.createdAt || new Date().toISOString(),
    }));
    if (saved !== false) setEditando(false);
  };
  const operationFailed = (result, fallback) => {
    if (result && result.ok !== false) {
      setProfileStatus(null);
      return false;
    }
    setProfileStatus(
      result && result.ok === false
        ? result
        : {
            ok: false,
            code: "PROFILE_OPERATION",
            error: fallback,
            recoverable: true,
          },
    );
    return true;
  };
  const profileError = profileStatus && (
    <div className="profile-storage-error" role="alert">
      <AlertTriangle aria-hidden="true" />
      <div>
        <strong>O perfil não foi alterado</strong>
        <p>{profileStatus.error}</p>
        {profileStatus.code === "REGISTRY_INVALID" && (
          <div className="profile-storage-actions">
            <button
              type="button"
              onClick={() => {
                const result = exportProfileRegistryRecovery();
                if (result.ok) {
                  setProfileStatus((current) => ({ ...current, exported: true }));
                } else {
                  setProfileStatus(result);
                }
              }}
            >
              <Download aria-hidden="true" /> Baixar dados preservados
            </button>
            <button
              type="button"
              onClick={() => {
                if (
                  !window.confirm(
                    "Substituir o registro incompatível por um perfil local novo?",
                  )
                )
                  return;
                const result = resetInvalidProfileRegistry();
                if (result.ok) reloadFade();
                else setProfileStatus(result);
              }}
            >
              Começar com registro novo
            </button>
          </div>
        )}
        {profileStatus.exported && (
          <small>Cópia bruta baixada para recuperação.</small>
        )}
      </div>
    </div>
  );
  const mods = tracks.map((t) => ({ t, p: trackProgress(t.id, state) }));
  const concluidos = mods.filter((m) => m.p === 100).length;
  const catalogoPronto = requisitosAutoestudo(tracks[0].id, state).catalogoPronto;
  const hoje = () =>
    new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  const build =
    typeof __BUILD_STAMP__ !== "undefined" ? __BUILD_STAMP__ : "local";
  const baixarCert = (label, percent) => {
    const nowIso = new Date().toISOString();
    setProfile((pr) => registerCertificate(pr, label, percent, nowIso));
    const svg = certificateSvg({
      name: profile.name,
      label,
      dateLabel: "Emitido em " + hoje(),
      percent,
      buildId: build,
    });
    downloadSvg(
      "registro-de-estudo-" +
        label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 40) +
        ".svg",
      svg,
    );
  };
  if (!conta || editando) {
    return (
      <div className="page profile-page">
        <PageHeader
          icon={BadgeCheck}
          kicker="Meu progresso neste dispositivo"
          title={conta ? "Editar perfil local" : "Criar perfil local"}
          subtitle="Seu progresso e seus registros de estudo ficam guardados somente neste navegador."
        />
        {profileError}
        <form className="profile-form" onSubmit={salvar}>
          <div className="form-avatar" aria-hidden="true">
            {(form.name || "")
              .trim()
              .split(/\s+/)
              .filter(Boolean)
              .map((w) => w[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "?"}
          </div>
          <label>
            Nome
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Como você quer ser identificado"
              required
              autoFocus
            />
          </label>
          <label>
            Cargo ou função
            <input
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="Opcional"
            />
          </label>
          <label>
            Órgão ou setor
            <input
              value={form.unit}
              onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
              placeholder="Opcional"
            />
          </label>
          <div className="profile-actions">
            <button type="submit" className="primary">
              {conta ? "Salvar" : "Criar perfil"} <Check />
            </button>
            {conta && (
              <button
                type="button"
                className="text-action"
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>
            )}
          </div>
          <p className="profile-note">
            Registro pessoal de estudo, guardado apenas neste navegador. Não é
            login seguro nem credencial institucional do IAT.
          </p>
        </form>
        <div className="profile-restore-alt">
          <span>Já estudava em outro computador?</span>
          <label className="text-action file-action">
            Restaurar backup
            <input
              type="file"
              accept="application/json"
              onChange={(e) => {
                const f = e.target.files[0];
                if (!f) return;
                f.text().then((t) => {
                  const r = importBackup(t);
                  if (r.ok) reloadFade();
                  else operationFailed(r, "Não foi possível restaurar o backup.");
                });
              }}
            />
          </label>
        </div>
        <OfflineManager />
      </div>
    );
  }
  return (
    <div className="page profile-page">
      <PageHeader
        icon={BadgeCheck}
        kicker="Meu progresso neste dispositivo"
        title={profile.name}
        subtitle={
          [profile.role, profile.unit].filter(Boolean).join(" · ") ||
          "Registro pessoal de estudo"
        }
      />
      {profileError}
      <section className="profile-grid">
        <article className="profile-card profile-progress">
          <h3>Progresso do curso</h3>
          <div className="pring" style={{ "--v": progress }}>
            <strong>{progress}%</strong>
          </div>
          <small>
            {state.completed.length} de {lessons.length} tópicos concluídos
          </small>
          <small>
            {concluidos} de {tracks.length} módulos completos
          </small>
        </article>
        <article className="profile-card profile-personal">
          <h3>Meus dados</h3>
          <dl>
            <dt>Nome</dt>
            <dd>{profile.name}</dd>
            <dt>Cargo</dt>
            <dd>{profile.role || "-"}</dd>
            <dt>Órgão</dt>
            <dd>{profile.unit || "-"}</dd>
            <dt>Desde</dt>
            <dd>
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("pt-BR")
                : "-"}
            </dd>
          </dl>
          <button
            className="text-action"
            onClick={() => {
              setForm({
                name: profile.name,
                role: profile.role,
                unit: profile.unit,
              });
              setEditando(true);
            }}
          >
            Editar dados
          </button>
        </article>
        <ContaRemotaCard state={state} setState={setState} algoMaisNovo={algoMaisNovo} />
        <article className="profile-card profile-activity">
          <h3>Atividade</h3>
          <ul className="profile-activity-list">
            <li>
              <Bookmark size={15} /> {state.bookmarks.length} favoritos
            </li>
            <li>
              <StickyNote size={15} />{" "}
              {
                Object.values(state.notes || {}).filter((v) => v && v.trim())
                  .length
              }{" "}
              anotações
            </li>
            <li>
              <CheckCircle2 size={15} /> {state.completed.length} tópicos feitos
            </li>
            <li>
              <Target size={15} />{" "}
              {
                Object.values(state.lessonEvidence || {}).filter((record) =>
                  lessonEvidenceStatus(record, {
                    hasObjectiveCheck: false,
                  }).ready,
                ).length
              }{" "}
              práticas ativas registradas
            </li>
          </ul>
          {state.lastLesson && (
            <button
              className="text-action"
              onClick={() => openLesson(state.lastLesson)}
            >
              Continuar de onde parou <ArrowRight size={15} />
            </button>
          )}
        </article>
      </section>
      <section className="profile-users">
        <div className="section-title">
          <div>
            <h2>Perfis neste navegador</h2>
            <p>
              Troque de usuário, crie um novo perfil ou leve seu estudo para
              outro computador por backup.
            </p>
          </div>
        </div>
        <ul className="user-list">
          {listUsers().map((u) => (
            <li key={u.id} className={u.active ? "active" : ""}>
              <span className="u-ini">
                {(u.name || "?")
                  .trim()
                  .split(/\s+/)
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "?"}
              </span>
              <span className="u-name">
                {u.name}
                {u.role ? <small> · {u.role}</small> : null}
              </span>
              {u.active ? (
                <em>ativo</em>
              ) : (
                <>
                  <button
                    className="text-action"
                    onClick={() => {
                      const result = switchUser(u.id);
                      if (!operationFailed(result, "Não foi possível trocar de perfil.")) {
                        reloadFade();
                      }
                    }}
                  >
                    Entrar
                  </button>
                  <button
                    className="u-del"
                    title={`Excluir perfil ${u.name}`}
                    aria-label={`Excluir perfil ${u.name}`}
                    onClick={() => {
                      if (
                        confirm(
                          `Excluir o perfil "${u.name}" e o progresso dele neste navegador?`,
                        )
                      ) {
                        const result = deleteUser(u.id);
                        if (!operationFailed(result, "Não foi possível excluir o perfil.")) {
                          reloadFade();
                        }
                      }
                    }}
                  >
                    <X size={14} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="profile-actions-row">
          <button
            className="text-action"
            onClick={() => {
              const result = createUser();
              if (!operationFailed(result, "Não foi possível criar outro perfil.")) {
                reloadFade();
              }
            }}
          >
            + Novo perfil
          </button>
          <button className="text-action" onClick={() => exportBackup()}>
            <Download size={14} /> Baixar backup
          </button>
          <label className="text-action file-action">
            Restaurar backup
            <input
              type="file"
              accept="application/json"
              onChange={(e) => {
                const f = e.target.files[0];
                if (!f) return;
                f.text().then((t) => {
                  const r = importBackup(t);
                  if (r.ok) reloadFade();
                  else operationFailed(r, "Não foi possível restaurar o backup.");
                });
              }}
            />
          </label>
        </div>
        <p className="profile-note">
          Cada perfil guarda progresso próprio, apenas neste navegador. Para
          continuar em outro computador, baixe o backup aqui e restaure lá.
        </p>
      </section>
      <OfflineManager />
      <section className="profile-cert-block">
        <div className="section-title">
          <div>
            <h2>Registros pessoais de conclusão</h2>
            <p>
              Marcos locais de autoestudo. Eles não são certificado, credencial
              profissional nem documento do IAT.
            </p>
          </div>
          <Award />
        </div>
        <div className="cert-course">
          {progress === 100 &&
          tracks.every((t) => requisitosAutoestudo(t.id, state).pronto) ? (
            <button
              className="primary"
              onClick={() => baixarCert("Percurso de autoestudo do POP", 100)}
            >
              <Download size={16} /> Baixar registro do percurso
            </button>
          ) : (
            <div className="cert-locked-wrap">
              <p className="cert-locked">
                {progress < 100 ? (
                  <>
                    Conclua os {lessons.length} tópicos para liberar o registro
                    pessoal do percurso. Faltam{" "}
                    {lessons.length - state.completed.length}.
                  </>
                ) : !catalogoPronto ? (
                  <>
                    Preparando o catálogo de práticas. O registro permanece
                    bloqueado até que os casos e seus objetivos sejam conferidos.
                    Se esta mensagem persistir, recarregue a plataforma com conexão.
                  </>
                ) : (
                  <>
                    Leitura completa. Faltam requisitos automáticos de
                    autoestudo em{" "}
                    {
                      tracks.filter((t) => !requisitosAutoestudo(t.id, state).pronto)
                        .length
                    }{" "}
                    módulos: ao menos 80% na autoavaliação e, quando houver
                    laboratório, entrega válida e 80% em cada componente objetivo
                    aplicável do caso. A fundamentação não recebe aprovação automática.
                  </>
                )}
              </p>
              <i className="cert-bar">
                <em style={{ width: progress + "%" }} />
              </i>
              <small>{progress}% do percurso concluído</small>
            </div>
          )}
        </div>
        {(profile.certificates || []).length > 0 && (
          <div className="cert-history">
            <h4>Marcos emitidos</h4>
            <ul>
              {(profile.certificates || []).map((c) => (
                <li key={c.id}>
                  <Award size={14} />
                  <span>{c.label}</span>
                  <small>
                    {c.at ? new Date(c.at).toLocaleDateString("pt-BR") : ""} ·{" "}
                    {c.percent}%
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}
        <h4>Por módulo</h4>
        <ul className="cert-modules">
          {mods.map(({ t, p }) => {
            const pr = requisitosAutoestudo(t.id, state);
            return (
              <li key={t.id}>
                <span className="cert-mod-code">{t.code}</span>
                <span className="cert-mod-title">{t.title}</span>
                <span
                  className="cert-sinais"
                  role="img"
                  aria-label={[
                    [pr.leitura, "leitura", true],
                    [pr.avaliacao, "avaliação", pr.temQuiz],
                    [
                      pr.pratica,
                      "componentes objetivos aplicáveis da prática",
                      pr.temPratica,
                    ],
                  ]
                    .map(([ok, rot, aplica]) =>
                      aplica
                        ? rot + (ok ? " concluída" : " pendente")
                        : "sem " + rot + " própria",
                    )
                    .join(", ")}
                >
                  {[
                    [pr.leitura, "Leitura", true],
                    [
                      pr.avaliacao,
                      pr.temQuiz ? "Avaliação" : "Sem avaliação própria",
                      pr.temQuiz,
                    ],
                    [
                      pr.pratica,
                      pr.temPratica
                        ? "Componentes objetivos da prática"
                        : "Sem caso próprio",
                      pr.temPratica,
                    ],
                  ].map(([ok, rot, aplica], i) => (
                    <i
                      key={i}
                      className={"sin" + (aplica ? (ok ? " ok" : "") : " na")}
                      title={rot}
                    />
                  ))}
                </span>
                <span className="cert-mod-pct">{p}%</span>
                {pr.pronto ? (
                  <button
                    className="cert-mod-dl"
                    onClick={() =>
                      baixarCert("Autoestudo do módulo " + t.code + " · " + t.title, 100)
                    }
                  >
                    <Download size={14} />
                  </button>
                ) : (
                  <span className="cert-mod-pending">
                    {!pr.catalogoPronto
                      ? "carregando práticas"
                      : !pr.leitura
                      ? "ler tudo"
                      : !pr.avaliacao
                        ? "fazer avaliação"
                        : !pr.praticaEntregue
                          ? "entregar prática"
                          : "revisar componentes da prática"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      <p className="profile-note">
        Estes registros documentam apenas ações e resultados automáticos dos
        exercícios salvos neste navegador. A fundamentação prática permanece
        sem aprovação técnica.
        Eles não comprovam identidade, competência profissional, aprovação
        institucional ou capacitação oficial do Instituto Água e Terra.
      </p>
    </div>
  );
}
