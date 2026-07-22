// Perfil do usuario da Academia IAT.
//
// Toda a persistencia do perfil vive aqui, separada do progresso do curso, que
// continua sob 'academia-iat-progress-v2'. O objetivo e isolar a camada de
// armazenamento: hoje e localStorage, e no futuro, quando houver backend, basta
// trocar loadProfile e saveProfile por chamadas de API. O resto do aplicativo
// nao sabe de onde vem o dado.
//
// Limite honesto, deixado explicito na interface: enquanto for local, isto e um
// registro pessoal de estudo, por navegador, sem login seguro e sem valor de
// credencial institucional.

const PROFILE_KEY = 'academia-iat-profile-v1';
export const PROFILE_SCHEMA = 1;

export function defaultProfile() {
  return {
    schemaVersion: PROFILE_SCHEMA,
    createdAt: '',
    name: '',
    role: '',        // cargo ou lotacao
    unit: '',        // orgao ou setor
    persona: 'analista',
    theme: 'auto',
    certificates: [], // marcos emitidos: {id, label, at, percent}
  };
}

export function loadProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return defaultProfile();
    // Migracao tolerante: preenche campos ausentes com o padrao.
    return { ...defaultProfile(), ...parsed, schemaVersion: PROFILE_SCHEMA };
  } catch {
    return defaultProfile();
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    /* armazenamento indisponivel: o perfil vale so para esta sessao */
  }
  return profile;
}

export function hasAccount(profile) {
  return Boolean(profile && profile.name && profile.name.trim());
}

// Marco de conclusao: registra um certificado uma unica vez por rotulo.
export function registerCertificate(profile, label, percent, nowIso) {
  const jaTem = (profile.certificates || []).some((c) => c.label === label);
  if (jaTem) return profile;
  const cert = {
    id: `${label}-${nowIso}`.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 60),
    label,
    at: nowIso,
    percent,
  };
  return { ...profile, certificates: [...(profile.certificates || []), cert] };
}

// Certificado como SVG, sem dependencia externa. Marcado como registro de
// estudo, nunca como documento oficial. Quem gera decide se imprime ou guarda.
export function certificateSvg({ name, label, dateLabel, percent, buildId }) {
  const esc = (s) =>
    String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 792" width="1120" height="792" font-family="Georgia, serif">
  <rect width="1120" height="792" fill="#f7fbf9"/>
  <rect x="26" y="26" width="1068" height="740" rx="18" fill="#ffffff" stroke="#0e7357" stroke-width="3"/>
  <rect x="40" y="40" width="1040" height="712" rx="12" fill="none" stroke="#cfe8dd" stroke-width="1.5"/>
  <text x="560" y="150" text-anchor="middle" font-size="20" letter-spacing="4" fill="#0e7490">ACADEMIA IAT</text>
  <text x="560" y="188" text-anchor="middle" font-size="16" letter-spacing="2" fill="#5b6f68">Licenciamento de Hidreletricas</text>
  <text x="560" y="300" text-anchor="middle" font-size="30" fill="#334">Registro pessoal de estudo</text>
  <text x="560" y="372" text-anchor="middle" font-size="44" font-weight="bold" fill="#0b3b2d">${esc(name)}</text>
  <line x1="360" y1="398" x2="760" y2="398" stroke="#cfe8dd" stroke-width="1.5"/>
  <text x="560" y="452" text-anchor="middle" font-size="22" fill="#37544b">${esc(label)}</text>
  <text x="560" y="500" text-anchor="middle" font-size="20" fill="#37544b">Progresso registrado: ${esc(percent)}%</text>
  <text x="560" y="596" text-anchor="middle" font-size="16" fill="#5b6f68">${esc(dateLabel)}</text>
  <text x="560" y="682" text-anchor="middle" font-size="13" fill="#8aa39a">Este documento e um registro pessoal de autoestudo gerado pela Academia IAT.</text>
  <text x="560" y="702" text-anchor="middle" font-size="13" fill="#8aa39a">Nao e certificado nem documento institucional do Instituto Agua e Terra.</text>
  <text x="560" y="736" text-anchor="middle" font-size="11" fill="#b3c6bd">build ${esc(buildId)}</text>
</svg>`;
}

export function downloadSvg(filename, svg) {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
