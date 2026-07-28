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
const BACKUP_KIND = 'academia-iat-backup';
const BACKUP_SCHEMA = 1;
const MAX_BACKUP_BYTES = 4 * 1024 * 1024;
const MAX_PROFILES = 50;
const BLOCKED_JSON_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
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

function persistenceException(result, cause) {
  const error = new Error(result.error);
  error.name = 'ProfilePersistenceError';
  error.code = result.code;
  error.recoverable = true;
  if (cause) error.cause = cause;
  return error;
}

function persistenceResult(error) {
  if (error?.name === 'ProfilePersistenceError' && error.code) {
    return {
      ok: false,
      code: error.code,
      error: error.message,
      recoverable: true,
    };
  }
  return storageError(error);
}

function readRegistry() {
  let raw;
  try {
    raw = localStorage.getItem(USERS_KEY);
  } catch (error) {
    throw persistenceException(storageError(error), error);
  }
  if (!raw) return null;
  try {
    return normalizeStoredRegistry(JSON.parse(raw));
  } catch (error) {
    throw persistenceException({
      ok: false,
      code: 'REGISTRY_INVALID',
      error: 'O registro local de perfis está inválido. Os dados originais foram preservados para recuperação.',
      recoverable: true,
    }, error);
  }
}

function writeRegistry(reg) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(reg));
    return { ok: true };
  } catch (error) {
    return storageError(error);
  }
}

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cleanText(value, field, maxLength) {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') throw new Error(`${field} precisa ser texto.`);
  if (value.length > maxLength) throw new Error(`${field} excede o tamanho permitido.`);
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
}

function safeJsonClone(value, depth = 0) {
  if (depth > 16) throw new Error('O progresso contém níveis demais de dados.');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('O progresso contém um número inválido.');
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length > 5000) throw new Error('O progresso contém uma lista grande demais.');
    return value.map((item) => safeJsonClone(item, depth + 1));
  }
  if (!isRecord(value)) throw new Error('O progresso contém um tipo de dado incompatível.');
  const entries = Object.entries(value);
  if (entries.length > 5000) throw new Error('O progresso contém campos demais.');
  const result = {};
  for (const [key, item] of entries) {
    if (BLOCKED_JSON_KEYS.has(key)) continue;
    result[key] = safeJsonClone(item, depth + 1);
  }
  return result;
}

function validateStringArray(value, field) {
  if (value === undefined) return;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${field} precisa ser uma lista de identificadores.`);
  }
}

function validateRecord(value, field) {
  if (value !== undefined && !isRecord(value)) throw new Error(`${field} precisa ser um objeto.`);
}

export function validateProgress(value) {
  if (value === undefined || value === null) return null;
  if (!isRecord(value)) throw new Error('O progresso do backup está em formato inválido.');

  validateStringArray(value.completed, 'Aulas concluídas');
  validateStringArray(value.bookmarks, 'Favoritos');
  validateStringArray(value.videoSeen, 'Vídeos assistidos');
  validateRecord(value.notes, 'Anotações');
  validateRecord(value.quizScores, 'Resultados das avaliações');
  validateRecord(value.labs, 'Resultados do laboratório');
  validateRecord(value.flows, 'Resultados dos fluxogramas');
  validateRecord(value.checks, 'Itens conferidos');
  validateRecord(value.lessonEvidence, 'Registros de prática ativa');
  validateRecord(value.doneAt, 'Datas de conclusão');

  if (value.lastLesson !== undefined && value.lastLesson !== null && typeof value.lastLesson !== 'string') {
    throw new Error('A última aula do backup está em formato inválido.');
  }
  if (value.lastVisit !== undefined && value.lastVisit !== null && typeof value.lastVisit !== 'string') {
    throw new Error('A última visita do backup está em formato inválido.');
  }
  if (value.streak !== undefined && (!Number.isFinite(value.streak) || value.streak < 0)) {
    throw new Error('A sequência de estudos do backup está em formato inválido.');
  }
  if (value.notes && Object.values(value.notes).some((note) => typeof note !== 'string')) {
    throw new Error('As anotações do backup precisam ser textos.');
  }

  return safeJsonClone(value);
}

function validateProfile(value) {
  if (!isRecord(value)) throw new Error('O perfil do backup está em formato inválido.');
  const certificates = value.certificates === undefined ? [] : value.certificates;
  if (!Array.isArray(certificates) || certificates.length > 250) {
    throw new Error('A lista de certificados do backup está em formato inválido.');
  }
  const cleanCertificates = certificates.map((certificate) => {
    if (!isRecord(certificate)) throw new Error('Há um certificado inválido no backup.');
    const percent = Number(certificate.percent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      throw new Error('Há um percentual de certificado inválido no backup.');
    }
    return {
      id: cleanText(certificate.id, 'Identificador do certificado', 160),
      label: cleanText(certificate.label, 'Título do certificado', 240),
      at: cleanText(certificate.at, 'Data do certificado', 64),
      percent,
    };
  });
  const theme = cleanText(value.theme, 'Tema', 16) || 'auto';
  return {
    ...defaultProfile(),
    createdAt: cleanText(value.createdAt, 'Data de criação', 64),
    name: cleanText(value.name, 'Nome', 180),
    role: cleanText(value.role, 'Cargo ou lotação', 240),
    unit: cleanText(value.unit, 'Órgão ou setor', 240),
    persona: cleanText(value.persona, 'Perfil de aprendizagem', 48) || 'analista',
    theme: ['auto', 'dark', 'light'].includes(theme) ? theme : 'auto',
    certificates: cleanCertificates,
  };
}

function normalizeStoredRegistry(value) {
  if (!isRecord(value) || !Array.isArray(value.users) ||
      value.users.length < 1 || value.users.length > MAX_PROFILES) {
    throw new Error('O registro local de perfis está em formato inválido.');
  }
  const users = value.users.map((item) => {
    if (!isRecord(item)) throw new Error('Há um perfil local inválido.');
    const id = cleanText(item.id, 'Identificador do perfil', 160);
    if (!id) throw new Error('Há um perfil local sem identificador.');
    return {
      ...validateProfile(item),
      id,
      schemaVersion: PROFILE_SCHEMA,
    };
  });
  const requested = cleanText(value.activeId, 'Perfil ativo', 160);
  const activeId = users.some((user) => user.id === requested)
    ? requested
    : users[0].id;
  return { activeId, users };
}

function backupSize(text) {
  try { return new TextEncoder().encode(text).byteLength; } catch { return text.length * 2; }
}

function storageError(error) {
  const quota = error && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED' || error.code === 22 || error.code === 1014);
  if (quota) {
    return {
      ok: false,
      code: 'STORAGE_QUOTA',
      error: 'Não há espaço disponível no navegador. Nenhuma alteração foi salva.',
      recoverable: true,
    };
  }
  return {
    ok: false,
    code: 'STORAGE_UNAVAILABLE',
    error: 'O navegador não permitiu salvar os perfis. Nenhuma alteração foi salva.',
    recoverable: true,
  };
}

function profileLimitError() {
  return {
    ok: false,
    code: 'PROFILE_LIMIT',
    error: `Este navegador já possui o limite de ${MAX_PROFILES} perfis. Exclua um perfil antes de criar ou importar outro.`,
    recoverable: true,
  };
}

function restoreStorageValue(key, previousValue) {
  if (previousValue === null) localStorage.removeItem(key);
  else localStorage.setItem(key, previousValue);
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
  } catch (error) {
    throw persistenceException(storageError(error), error);
  }
  const writeResult = writeRegistry(reg);
  if (!writeResult.ok) {
    try { localStorage.removeItem(LEGACY_PROGRESS_KEY + '::' + first.id); } catch { /* o original legado permanece intacto */ }
    throw persistenceException(writeResult);
  }
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

export function exportProfileRegistryRecovery() {
  let raw;
  try {
    raw = localStorage.getItem(USERS_KEY);
  } catch (error) {
    return storageError(error);
  }
  if (!raw) {
    return {
      ok: false,
      code: 'REGISTRY_MISSING',
      error: 'Não há registro bruto de perfis para exportar.',
      recoverable: true,
    };
  }
  const blob = new Blob([raw], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'academia-iat-perfis-recuperacao.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return { ok: true, code: 'REGISTRY_EXPORTED' };
}

export function resetInvalidProfileRegistry() {
  let previous;
  try {
    previous = localStorage.getItem(USERS_KEY);
    localStorage.removeItem(USERS_KEY);
    const profile = loadProfile();
    return { ok: true, code: 'REGISTRY_RESET', profile };
  } catch (error) {
    if (previous !== undefined) {
      try { restoreStorageValue(USERS_KEY, previous); } catch { /* preserva o erro original */ }
    }
    return persistenceResult(error);
  }
}

export function saveProfile(profile) {
  let reg;
  try {
    reg = ensureRegistry();
  } catch (error) {
    return persistenceResult(error);
  }
  const i = reg.users.findIndex((x) => x.id === reg.activeId);
  const merged = { ...defaultProfile(), ...profile, id: reg.activeId, schemaVersion: PROFILE_SCHEMA };
  const users = [...reg.users];
  if (i >= 0) users[i] = merged; else users.push(merged);
  const writeResult = writeRegistry({ ...reg, users });
  if (!writeResult.ok) return writeResult;
  return merged;
}

export function listUsers() {
  const reg = ensureRegistry();
  return reg.users.map((u) => ({ id: u.id, name: u.name || 'Sem nome', role: u.role || '', active: u.id === reg.activeId }));
}

export function switchUser(id) {
  let reg;
  try {
    reg = ensureRegistry();
  } catch (error) {
    return persistenceResult(error);
  }
  if (!reg.users.some((u) => u.id === id)) return false;
  const writeResult = writeRegistry({ ...reg, activeId: id });
  if (!writeResult.ok) return writeResult;
  return true;
}

export function createUser() {
  let reg;
  try {
    reg = ensureRegistry();
  } catch (error) {
    return persistenceResult(error);
  }
  if (reg.users.length >= MAX_PROFILES) return profileLimitError();
  const u = { ...defaultProfile(), id: newId() };
  const writeResult = writeRegistry({
    ...reg,
    activeId: u.id,
    users: [...reg.users, u],
  });
  if (!writeResult.ok) return writeResult;
  return u;
}

export function deleteUser(id) {
  let reg;
  try {
    reg = ensureRegistry();
  } catch (error) {
    return persistenceResult(error);
  }
  if (reg.users.length <= 1) return false; // sempre resta um perfil
  const users = reg.users.filter((u) => u.id !== id);
  const activeId = reg.activeId === id ? users[0].id : reg.activeId;
  const writeResult = writeRegistry({ ...reg, activeId, users });
  if (!writeResult.ok) return writeResult;
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
  try {
    progress = validateProgress(
      JSON.parse(localStorage.getItem(LEGACY_PROGRESS_KEY + '::' + u.id) || 'null'),
    );
  } catch { /* backup segue sem progresso corrompido */ }
  const payload = { kind: BACKUP_KIND, schema: BACKUP_SCHEMA, exportedAt: new Date().toISOString(), profile: u, progress };
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
  if (typeof text !== 'string' || !text.trim()) {
    return { ok: false, code: 'INVALID_JSON', error: 'O arquivo não é um JSON válido.' };
  }
  if (backupSize(text) > MAX_BACKUP_BYTES) {
    return { ok: false, code: 'BACKUP_TOO_LARGE', error: 'O backup excede o limite de 4 MB.' };
  }
  let data;
  try { data = JSON.parse(text); } catch {
    return { ok: false, code: 'INVALID_JSON', error: 'O arquivo não é um JSON válido.' };
  }
  if (!isRecord(data) || data.kind !== BACKUP_KIND || !data.profile) {
    return { ok: false, code: 'INVALID_BACKUP', error: 'O arquivo não é um backup da Academia IAT.' };
  }
  if (data.schema !== undefined && data.schema !== BACKUP_SCHEMA) {
    return { ok: false, code: 'UNSUPPORTED_SCHEMA', error: 'Esta versão do backup não é compatível com a Academia IAT atual.' };
  }

  let cleanProfile;
  let cleanProgress;
  try {
    cleanProfile = validateProfile(data.profile);
    cleanProgress = validateProgress(data.progress);
  } catch (error) {
    return { ok: false, code: 'INVALID_DATA', error: error.message || 'O backup contém dados inválidos.' };
  }

  let reg;
  try {
    reg = ensureRegistry();
  } catch (error) {
    return persistenceResult(error);
  }
  if (reg.users.length >= MAX_PROFILES) return profileLimitError();
  const u = { ...cleanProfile, id: newId(), schemaVersion: PROFILE_SCHEMA };
  const nextRegistry = { ...reg, activeId: u.id, users: [...reg.users, u] };
  const importedProgressKey = LEGACY_PROGRESS_KEY + '::' + u.id;
  let previousRegistry;
  let previousProgress;
  let capturedRegistry = false;
  let capturedProgress = false;

  try {
    previousRegistry = localStorage.getItem(USERS_KEY);
    capturedRegistry = true;
    previousProgress = localStorage.getItem(importedProgressKey);
    capturedProgress = true;
    // O progresso entra primeiro. O perfil só fica visível quando as duas
    // gravações terminam, evitando usuário ativo sem o respectivo histórico.
    if (cleanProgress) localStorage.setItem(importedProgressKey, JSON.stringify(cleanProgress));
    localStorage.setItem(USERS_KEY, JSON.stringify(nextRegistry));
  } catch (error) {
    if (capturedProgress) {
      try { restoreStorageValue(importedProgressKey, previousProgress); } catch { /* melhor rollback possivel */ }
    }
    if (capturedRegistry) {
      try { restoreStorageValue(USERS_KEY, previousRegistry); } catch { /* melhor rollback possivel */ }
    }
    return storageError(error);
  }
  return { ok: true, name: u.name || 'Sem nome', code: 'IMPORTED' };
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
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 792" width="1120" height="792" font-family="Georgia, serif" role="img" aria-labelledby="cert-title cert-desc">
  <title id="cert-title">Registro pessoal de estudo da Academia IAT</title>
  <desc id="cert-desc">Registro não institucional emitido para ${esc(name)}.</desc>
  <rect width="1120" height="792" fill="#f7fbf9"/>
  <rect x="26" y="26" width="1068" height="740" rx="18" fill="#ffffff" stroke="#0e7357" stroke-width="3"/>
  <rect x="40" y="40" width="1040" height="712" rx="12" fill="none" stroke="#cfe8dd" stroke-width="1.5"/>
  <path d="M60 620 C 200 585, 340 655, 520 615 S 860 585, 1060 625" stroke="#57d8bf" stroke-width="3" fill="none" opacity="0.45" stroke-linecap="round"/>
  <path d="M60 645 C 240 615, 420 668, 620 636 S 920 612, 1060 648" stroke="#0e7357" stroke-width="2" fill="none" opacity="0.3" stroke-linecap="round"/>
  <circle cx="560" cy="230" r="26" fill="none" stroke="#0e7357" stroke-width="2.5"/>
  <path d="M548 230 l8 9 l16 -18" stroke="#0e7357" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="560" y="150" text-anchor="middle" font-size="20" letter-spacing="4" fill="#0e7490">ACADEMIA IAT</text>
  <text x="560" y="188" text-anchor="middle" font-size="16" letter-spacing="2" fill="#5b6f68">Licenciamento de Hidrelétricas</text>
  <text x="560" y="300" text-anchor="middle" font-size="30" fill="#334">Registro pessoal de estudo</text>
  <text x="560" y="372" text-anchor="middle" font-size="44" font-weight="bold" fill="#0b3b2d">${esc(name)}</text>
  <line x1="360" y1="398" x2="760" y2="398" stroke="#cfe8dd" stroke-width="1.5"/>
  <text x="560" y="452" text-anchor="middle" font-size="22" fill="#37544b">${esc(label)}</text>
  <text x="560" y="500" text-anchor="middle" font-size="20" fill="#37544b">Progresso registrado: ${esc(percent)}%</text>
  <text x="560" y="596" text-anchor="middle" font-size="16" fill="#5b6f68">${esc(dateLabel)}</text>
  <text x="560" y="682" text-anchor="middle" font-size="13" fill="#8aa39a">Este documento é um registro pessoal de autoestudo gerado pela Academia IAT.</text>
  <text x="560" y="702" text-anchor="middle" font-size="13" fill="#8aa39a">Não é certificado nem documento institucional do Instituto Água e Terra.</text>
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
