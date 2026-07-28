import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  certificateSvg,
  createUser,
  importBackup,
  loadProfile,
  resetInvalidProfileRegistry,
  saveProfile,
} from './profile.js';

const USERS_KEY = 'academia-iat-users-v1';
const PROGRESS_PREFIX = 'academia-iat-progress-v2::';

class MemoryStorage {
  constructor() {
    this.values = new Map();
    this.failNext = null;
  }

  get length() {
    return this.values.size;
  }

  key(index) {
    return [...this.values.keys()][index] ?? null;
  }

  getItem(key) {
    return this.values.has(String(key)) ? this.values.get(String(key)) : null;
  }

  setItem(key, value) {
    const normalizedKey = String(key);
    if (this.failNext?.(normalizedKey)) {
      this.failNext = null;
      const error = new Error('quota');
      error.name = 'QuotaExceededError';
      throw error;
    }
    this.values.set(normalizedKey, String(value));
  }

  removeItem(key) {
    this.values.delete(String(key));
  }

  clear() {
    this.values.clear();
  }
}

function seedRegistry(storage) {
  const registry = {
    activeId: 'u-original',
    users: [{
      schemaVersion: 2,
      id: 'u-original',
      createdAt: '2026-07-01T00:00:00.000Z',
      name: 'Perfil original',
      role: '',
      unit: '',
      persona: 'analista',
      theme: 'auto',
      certificates: [],
    }],
  };
  const raw = JSON.stringify(registry);
  storage.setItem(USERS_KEY, raw);
  return raw;
}

function profileRecord(index) {
  return {
    schemaVersion: 2,
    id: `u-${index}`,
    createdAt: '2026-07-01T00:00:00.000Z',
    name: `Perfil ${index}`,
    role: '',
    unit: '',
    persona: 'analista',
    theme: 'auto',
    certificates: [],
  };
}

function backup(overrides = {}) {
  return JSON.stringify({
    kind: 'academia-iat-backup',
    schema: 1,
    exportedAt: '2026-07-27T12:00:00.000Z',
    profile: {
      name: '  Ana Águas  ',
      role: 'Analista',
      unit: 'IAT',
      persona: 'analista',
      theme: 'dark',
      certificates: [],
    },
    progress: {
      completed: ['pop-section-001'],
      bookmarks: [],
      notes: { 'pop-section-001': 'Nota preservada' },
      quizScores: {},
      labs: {},
      flows: {},
      checks: {},
      doneAt: {},
      videoSeen: [],
      streak: 1,
      lastLesson: 'pop-section-001',
      lastVisit: null,
    },
    ...overrides,
  });
}

beforeEach(() => {
  globalThis.localStorage = new MemoryStorage();
  seedRegistry(globalThis.localStorage);
});

afterEach(() => {
  delete globalThis.localStorage;
});

describe('importBackup', () => {
  it('restaura perfil e progresso validados sem reaproveitar o id externo', () => {
    const result = importBackup(backup({
      profile: {
        id: 'id-controlado-pelo-arquivo',
        name: '  Ana Águas  ',
        role: 'Analista',
        unit: 'IAT',
        persona: 'analista',
        theme: 'dark',
        certificates: [],
      },
    }));

    expect(result).toMatchObject({ ok: true, code: 'IMPORTED', name: 'Ana Águas' });
    const registry = JSON.parse(localStorage.getItem(USERS_KEY));
    expect(registry.users).toHaveLength(2);
    expect(registry.activeId).not.toBe('id-controlado-pelo-arquivo');
    expect(registry.users[1]).toMatchObject({ id: registry.activeId, name: 'Ana Águas', schemaVersion: 2 });
    expect(JSON.parse(localStorage.getItem(PROGRESS_PREFIX + registry.activeId))).toMatchObject({
      completed: ['pop-section-001'],
      notes: { 'pop-section-001': 'Nota preservada' },
    });
  });

  it('mantém compatibilidade com backups antigos sem o campo schema', () => {
    const payload = JSON.parse(backup());
    delete payload.schema;
    expect(importBackup(JSON.stringify(payload))).toMatchObject({ ok: true, code: 'IMPORTED' });
  });

  it('rejeita estruturas que poderiam quebrar o estado da aplicação', () => {
    const original = localStorage.getItem(USERS_KEY);
    const result = importBackup(backup({
      progress: { completed: 'não é uma lista', notes: [] },
    }));

    expect(result).toMatchObject({ ok: false, code: 'INVALID_DATA' });
    expect(localStorage.getItem(USERS_KEY)).toBe(original);
    expect([...localStorage.values.keys()].filter((key) => key.startsWith(PROGRESS_PREFIX))).toHaveLength(0);
  });

  it('rejeita versões futuras sem alterar dados existentes', () => {
    const original = localStorage.getItem(USERS_KEY);
    expect(importBackup(backup({ schema: 99 }))).toMatchObject({
      ok: false,
      code: 'UNSUPPORTED_SCHEMA',
    });
    expect(localStorage.getItem(USERS_KEY)).toBe(original);
  });

  it('desfaz o progresso se faltar quota ao gravar o registro de usuários', () => {
    const original = localStorage.getItem(USERS_KEY);
    localStorage.failNext = (key) => key === USERS_KEY;
    const result = importBackup(backup());

    expect(result).toMatchObject({ ok: false, code: 'STORAGE_QUOTA' });
    expect(localStorage.getItem(USERS_KEY)).toBe(original);
    expect([...localStorage.values.keys()].filter((key) => key.startsWith(PROGRESS_PREFIX))).toHaveLength(0);
  });

  it('não cria usuário incompleto se faltar quota ao gravar o progresso', () => {
    const original = localStorage.getItem(USERS_KEY);
    localStorage.failNext = (key) => key.startsWith(PROGRESS_PREFIX);
    const result = importBackup(backup());

    expect(result).toMatchObject({ ok: false, code: 'STORAGE_QUOTA' });
    expect(localStorage.getItem(USERS_KEY)).toBe(original);
    expect([...localStorage.values.keys()].filter((key) => key.startsWith(PROGRESS_PREFIX))).toHaveLength(0);
  });

  it('recusa importação acima do limite de 50 perfis sem alterar o registro', () => {
    const registry = {
      activeId: 'u-0',
      users: Array.from({ length: 50 }, (_, index) => profileRecord(index)),
    };
    const original = JSON.stringify(registry);
    localStorage.setItem(USERS_KEY, original);

    expect(importBackup(backup())).toMatchObject({
      ok: false,
      code: 'PROFILE_LIMIT',
      recoverable: true,
    });
    expect(localStorage.getItem(USERS_KEY)).toBe(original);
    expect([...localStorage.values.keys()].filter((key) => key.startsWith(PROGRESS_PREFIX))).toHaveLength(0);
  });
});

describe('registro local de perfis', () => {
  it('preserva um registro inválido e expõe erro recuperável', () => {
    const invalidRegistry = JSON.stringify({
      activeId: 'forjado',
      users: Array.from({ length: 51 }, (_, index) => ({
        id: `u-${index}`,
        name: 'Perfil',
        certificates: [],
      })),
    });
    localStorage.setItem(USERS_KEY, invalidRegistry);

    let error;
    try {
      loadProfile();
    } catch (caught) {
      error = caught;
    }

    expect(error).toMatchObject({
      name: 'ProfilePersistenceError',
      code: 'REGISTRY_INVALID',
      recoverable: true,
    });
    expect(localStorage.getItem(USERS_KEY)).toBe(invalidRegistry);
  });

  it('só substitui o registro inválido após recuperação explícita', () => {
    const invalidRegistry = '{"activeId":"forjado","users":[]}';
    localStorage.setItem(USERS_KEY, invalidRegistry);

    const result = resetInvalidProfileRegistry();

    expect(result).toMatchObject({ ok: true, code: 'REGISTRY_RESET' });
    expect(localStorage.getItem(USERS_KEY)).not.toBe(invalidRegistry);
    expect(loadProfile()).toMatchObject({ schemaVersion: 2 });
  });

  it('recusa a criação do 51º perfil sem alterar o registro', () => {
    const registry = {
      activeId: 'u-0',
      users: Array.from({ length: 50 }, (_, index) => profileRecord(index)),
    };
    const original = JSON.stringify(registry);
    localStorage.setItem(USERS_KEY, original);

    expect(createUser()).toMatchObject({
      ok: false,
      code: 'PROFILE_LIMIT',
      recoverable: true,
    });
    expect(localStorage.getItem(USERS_KEY)).toBe(original);
  });

  it('retorna falha de escrita ao salvar sem anunciar sucesso silencioso', () => {
    const original = localStorage.getItem(USERS_KEY);
    localStorage.failNext = (key) => key === USERS_KEY;

    expect(saveProfile({ name: 'Não persistido' })).toMatchObject({
      ok: false,
      code: 'STORAGE_QUOTA',
      recoverable: true,
    });
    expect(localStorage.getItem(USERS_KEY)).toBe(original);
  });

  it('remove chaves de poluição de protótipo ao importar o progresso', () => {
    const payload = JSON.parse(backup());
    payload.progress = JSON.parse(
      '{"completed":[],"notes":{},"__proto__":{"polluted":true}}',
    );

    expect(importBackup(JSON.stringify(payload))).toMatchObject({ ok: true });
    expect({}.polluted).toBeUndefined();
  });
});

describe('certificateSvg', () => {
  it('preserva acentos, descreve o caráter não institucional e escapa texto XML', () => {
    const svg = certificateSvg({
      name: 'Ana & João <PR>',
      label: 'Módulo Água',
      dateLabel: 'Emitido em 27/07/2026',
      percent: 100,
      buildId: 'teste',
    });

    expect(svg).toContain('Licenciamento de Hidrelétricas');
    expect(svg).toContain('Não é certificado nem documento institucional do Instituto Água e Terra.');
    expect(svg).toContain('Ana &amp; João &lt;PR&gt;');
    expect(svg).toContain('aria-labelledby="cert-title cert-desc"');
  });
});
