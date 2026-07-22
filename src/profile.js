// Perfil do usuario da Academia IAT.
//
// Toda a persistencia do perfil vive aqui, separada do resto do app. Hoje e
// localStorage com varios usuarios por navegador; no futuro, quando houver
// backend, basta trocar as funcoes deste modulo por chamadas de API.
//
// Limite honesto, deixado explicito na interface: enquanto for local, isto e um
// registro pessoal de estudo, por navegador, sem login seguro e sem valor de
// credencial institucional. O backup exportado e o meio de levar o progresso
// para outro computador.

const LEGACY_PROFILE_KEY = 'academia-iat-profile-v1';
const LEGACY_PROGRESS_KEY = 'academia-iat-progress-v2';
const USERS_KEY = 'academia-iat-users-v1';
export const PROFILE_SCHEMA = 2;

export function defaultProfile() {
  return {
    schemaVersion: PROFILE_SCHEMA,
    id: '',
    createdAt: '',
    name: '',
    role: '',        // cargo ou lotacao
    unit: '',        // orgao ou setor
    persona: 'analista',
    theme: 'auto',
    certificates: [], // marcos emitidos: {id, label, at, percent}
  };
}

function newId() {
  return 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function readRegistry() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (raw) {
      const reg = JSON.parse(raw);
      if (reg && Array.isArray(reg.users)) return reg;
    }
  } catch { /* cai na migracao */ }
  return null;
}

function writeRegistry(reg) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(reg)); } catch { /* sessao efemera */ }
}

// Migracao do modelo de usuario unico: o perfil antigo vira o primeiro usuario
// e o progresso legado passa a pertencer a ele. Os dados antigos nao sao
// apagados, para haver caminho de volta.
function ensureRegistry() {
  let reg = readRegistry();
  if (reg) return reg;
  let legacy = null;
  try { legacy = JSON.parse(localStorage.getItem(LEGACY_PROFILE_KEY) || 'null'); } catch { /* ignora */ }
  const first = { ...defaultProfile(), ...(legacy || {}), schemaVersion: PROFILE_SCHEMA, id: newId() };
  reg = { activeId: first.id, users: [first] };
  try {
    const legacyProgress = localStorage.getItem(LEGACY_PROGRESS_KEY);
    if (legacyProgress) localStorage.setItem(LEGACY_PROGRESS_KEY + '::' + first.id, legacyProgress);
  } catch { /* progresso legado permanece onde esta */ }
  writeRegistry(reg);
  return reg;
}

export function progressKey() {
  const reg = ensureRegistry();
  return LEGACY_PROGRESS_KEY + '::' + reg.activeId;
}

export function loadProfile() {
  const reg = ensureRegistry();
  const u = reg.users.find((x) => x.id === reg.activeId) || reg.users[0];
  return { ...defaultProfile(), ...(u || {}), schemaVersion: PROFILE_SCHEMA };
}

export function saveProfile(profile) {
  const reg = ensureRegistry();
  const i = reg.users.findIndex((x) => x.id === reg.activeId);
  const merged = { ...defaultProfile(), ...profile, id: reg.activeId, schemaVersion: PROFILE_SCHEMA };
  if (i >= 0) reg.users[i] = merged; else reg.users.push(merged);
  writeRegistry(reg);
  return merged;
}

export function listUsers() {
  const reg = ensureRegistry();
  return reg.users.map((u) => ({ id: u.id, name: u.name || 'Sem nome', role: u.role || '', active: u.id === reg.activeId }));
}

export function switchUser(id) {
  const reg = ensureRegistry();
  if (!reg.users.some((u) => u.id === id)) return false;
  reg.activeId = id;
  writeRegistry(reg);
  return true;
}

export function createUser() {
  const reg = ensureRegistry();
  const u = { ...defaultProfile(), id: newId() };
  reg.users.push(u);
  reg.activeId = u.id;
  writeRegistry(reg);
  return u;
}

export function deleteUser(id) {
  const reg = ensureRegistry();
  if (reg.users.length <= 1) return false; // sempre resta um perfil
  reg.users = reg.users.filter((u) => u.id !== id);
  if (reg.activeId === id) reg.activeId = reg.users[0].id;
  writeRegistry(reg);
  try { localStorage.removeItem(LEGACY_PROGRESS_KEY + '::' + id); } catch { /* melhor esforco */ }
  return true;
}

export function hasAccount(profile) {
  return Boolean(profile && profile.name && profile.name.trim());
}

// Backup completo (perfil + progresso) como arquivo JSON: e o caminho honesto
// de levar o estudo para outro computador enquanto nao existe servidor.
export function exportBackup() {
  const reg = ensureRegistry();
  const u = reg.users.find((x) => x.id === reg.activeId) || reg.users[0];
  let progress = null;
  try { progress = JSON.parse(localStorage.getItem(LEGACY_PROGRESS_KEY + '::' + u.id) || 'null'); } catch { /* backup segue sem progresso */ }
  const payload = { kind: 'academia-iat-backup', schema: 1, exportedAt: new Date().toISOString(), profile: u, progress };
  const blob = new Blob([JSON.stringify(payload, null, 1)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const nome = (u.name || 'perfil').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 30);
  a.download = 'academia-iat-backup-' + nome + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function importBackup(text) {
  let data;
  try { data = JSON.parse(text); } catch { return { ok: false, error: 'O arquivo não é um JSON válido.' }; }
  if (!data || data.kind !== 'academia-iat-backup' || !data.profile) {
    return { ok: false, error: 'O arquivo não é um backup da Academia IAT.' };
  }
  const reg = ensureRegistry();
  const u = { ...defaultProfile(), ...data.profile, id: newId(), schemaVersion: PROFILE_SCHEMA };
  reg.users.push(u);
  reg.activeId = u.id;
  writeRegistry(reg);
  try {
    if (data.progress) localStorage.setItem(LEGACY_PROGRESS_KEY + '::' + u.id, JSON.stringify(data.progress));
  } catch { /* progresso nao coube: perfil ainda assim foi criado */ }
  return { ok: true, name: u.name || 'Sem nome' };
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
