import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildInventory,
  createBaseline,
  createCycleSeal,
  sha256,
  validateMediaGovernance,
} from './media-governance-lib.mjs';

const basePolicy = {
  scanRoot: 'public',
  managedExtensions: ['.png'],
  managedSuffixes: [],
  managedTextRules: [],
  ignoredPaths: [
    'public/source-assets/asset-manifest.json',
    'public/media/aula/manifest.json',
    'public/media/piloto/manifest.json',
    'public/media/piloto/provenance.json',
    'public/fonts/README.md',
    'public/fonts/OFL.txt',
  ],
  maxBytesByExtension: { '.png': 16 },
  firstGovernedCycle: '2026-08',
  currentCycle: '2026-08',
  maxApprovedGrowthBytes: 32,
  maxApprovedGrowthFiles: 2,
  collections: [{
    id: 'fixture',
    prefix: 'public/',
    provenanceStatus: 'verified-manifest',
    sourceType: 'project-generated',
    sourceLocator: 'fixture',
    rightsBasis: 'fixture rights',
    privacyStatus: 'synthetic-no-personal-data',
    contract: 'baseline-only',
  }],
};

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'academia-media-'));
  await mkdir(join(root, 'public', 'source-assets'), { recursive: true });
  await mkdir(join(root, 'public', 'media', 'aula'), { recursive: true });
  await mkdir(join(root, 'public', 'media', 'piloto'), { recursive: true });
  await mkdir(join(root, 'public', 'fonts'), { recursive: true });
  await writeFile(join(root, 'public', 'base.png'), 'base');
  await writeFile(join(root, 'public', 'source-assets', 'asset-manifest.json'), '{"assets":[]}');
  await writeFile(join(root, 'public', 'media', 'aula', 'manifest.json'), '{}');
  await writeFile(join(root, 'public', 'media', 'piloto', 'manifest.json'), '{"items":[]}');
  await writeFile(join(root, 'public', 'media', 'piloto', 'provenance.json'), '{}');
  await writeFile(join(root, 'public', 'fonts', 'README.md'), 'fixture');
  await writeFile(join(root, 'public', 'fonts', 'OFL.txt'), 'fixture');
  const entries = await buildInventory(root, basePolicy);
  return { root, entries, baseline: createBaseline(entries, basePolicy, '2026-08-09') };
}

describe('governanca mecanica de midia', () => {
  it('produz inventario estavel e aceita o baseline intacto', async () => {
    const { root, entries, baseline } = await fixture();
    expect(entries).toEqual([{ path: 'public/base.png', bytes: 4, sha256: sha256('base') }]);
    const result = await validateMediaGovernance({
      root,
      policy: basePolicy,
      baseline,
      ledger: { schemaVersion: 1, changes: [] },
      entries,
    });
    expect(result.ok).toBe(true);
    expect(result.duplicates).toBe(0);
  });

  it('reprova novo binario sem proveniencia e detecta conteudo duplicado', async () => {
    const { root, baseline } = await fixture();
    await writeFile(join(root, 'public', 'copy.png'), 'base');
    const entries = await buildInventory(root, basePolicy);
    const result = await validateMediaGovernance({
      root,
      policy: basePolicy,
      baseline,
      ledger: { schemaVersion: 1, changes: [] },
      entries,
    });
    expect(result.ok).toBe(false);
    expect(result.failures).toEqual(expect.arrayContaining([
      expect.stringContaining('novo ativo sem registro'),
      expect.stringContaining('conteudo duplicado'),
    ]));
  });

  it('aceita adicao pequena somente com hash, direitos e revisoes explicitos', async () => {
    const { root, baseline } = await fixture();
    const payload = 'novo';
    await writeFile(join(root, 'public', 'new.png'), payload);
    const entries = await buildInventory(root, basePolicy);
    const ledger = {
      schemaVersion: 1,
      changes: [{
        action: 'add',
        path: 'public/new.png',
        bytes: Buffer.byteLength(payload),
        sha256: sha256(payload),
        sourceType: 'project-generated',
        sourceLocator: 'tools/generator.mjs',
        rightsBasis: 'produzido pelo projeto',
        privacyReview: 'synthetic-no-personal-data',
        technicalReview: 'approved',
        reviewedBy: 'revisor fixture',
        reviewedAt: '2026-08-09',
        reason: 'novo ativo testado',
        cycle: '2026-08',
      }],
    };
    const result = await validateMediaGovernance({ root, policy: basePolicy, baseline, ledger, entries });
    expect(result.ok).toBe(true);
  });

  it('reprova adicao acima do limite mesmo quando consta no ledger', async () => {
    const { root, baseline } = await fixture();
    const payload = 'x'.repeat(17);
    await writeFile(join(root, 'public', 'large.png'), payload);
    const entries = await buildInventory(root, basePolicy);
    const ledger = {
      schemaVersion: 1,
      changes: [{
        action: 'add', path: 'public/large.png', bytes: 17, sha256: sha256(payload),
        sourceType: 'synthetic', sourceLocator: 'fixture generator', rightsBasis: 'fixture rights',
        privacyReview: 'approved-no-personal-data', technicalReview: 'approved',
        reviewedBy: 'revisor fixture', reviewedAt: '2026-08-09', reason: 'testar limite rigido',
        cycle: '2026-08',
      }],
    };
    const result = await validateMediaGovernance({ root, policy: basePolicy, baseline, ledger, entries });
    expect(result.ok).toBe(false);
    expect(result.failures).toContain('public/large.png: 17 bytes excedem o limite de 16');
  });

  it('extensao desconhecida reprova em vez de entrar calada', async () => {
    // O portao vigia por lista fechada. Isso deixava uma TERCEIRA categoria:
    // nem vigiada, nem declarada como irrelevante. Um `.webm` ao lado dos
    // `.mp4`, um `.jpeg` ao lado dos `.jpg`, um `.mp3` de narracao entravam sem
    // proveniencia, sem base de direitos, sem teto de tamanho e sem checagem de
    // duplicata. E entravam CALADOS.
    const { root, baseline, entries } = await fixture();
    await writeFile(join(root, 'public', 'narracao.webm'), 'video moderno');
    await writeFile(join(root, 'public', 'foto.jpeg'), 'outro nome do jpg');

    const resultado = await validateMediaGovernance({
      root, policy: basePolicy, baseline, entries,
      ledger: { schemaVersion: 1, changes: [] },
    });
    expect(resultado.ok).toBe(false);
    expect(resultado.failures).toEqual(expect.arrayContaining([
      expect.stringContaining('public/foto.jpeg: extensao nao classificada'),
      expect.stringContaining('public/narracao.webm: extensao nao classificada'),
    ]));
    // A mensagem precisa dizer o que fazer, e nao so que ha algo errado.
    const aviso = resultado.failures.find((f) => f.includes('narracao.webm'));
    expect(aviso).toContain('managedExtensions');
    expect(aviso).toContain('ignoredPaths');
  });

  it('extensao declarada como nao-midia passa sem virar ativo', async () => {
    // A saida existe e e explicita. O que nao pode existir e a saida silenciosa.
    const { root, baseline, entries } = await fixture();
    await writeFile(join(root, 'public', 'leia.md'), 'documento, e nao midia');
    const resultado = await validateMediaGovernance({
      root, policy: { ...basePolicy, ignoredPaths: [...basePolicy.ignoredPaths, 'public/leia.md'] },
      baseline, entries,
      ledger: { schemaVersion: 1, changes: [] },
    });
    expect(resultado.ok).toBe(true);
  });

  it('ignore e por caminho exato e nao libera toda uma extensao', async () => {
    const { root, baseline, entries } = await fixture();
    await writeFile(join(root, 'public', 'animacao.json'), '{"layers":[]}');
    const resultado = await validateMediaGovernance({
      root, policy: basePolicy, baseline, entries,
      ledger: { schemaVersion: 1, changes: [] },
    });
    expect(resultado.failures).toContain(
      'public/animacao.json: extensao nao classificada; declare em managedExtensions '
      + '(com proveniencia) ou em ignoredPaths (declarando que nao e midia)',
    );
  });

  it('o teto de crescimento conta o ciclo corrente, e nao a vida inteira', async () => {
    // O baseline e IMUTAVEL e o ledger nao pode encolher: tirar uma entrada
    // faria o arquivo virar "novo ativo sem registro" na execucao seguinte.
    // Enquanto o teto somava todas as adicoes ja aprovadas, ele era vitalicio
    // disfarcado de "por ciclo", e travaria o CI de forma permanente por volta
    // do octogesimo ativo novo. A unica saida seria afrouxar o limite para
    // todo mundo, que e como um portao morre.
    const { root, baseline } = await fixture();
    await writeFile(join(root, 'public', 'nova.png'), 'nova');
    const policy = { ...basePolicy, firstGovernedCycle: '2026-06' };
    const entries = await buildInventory(root, policy);
    const comum = {
      action: 'add', sourceType: 'project-generated', sourceLocator: 'tools/generator.mjs',
      rightsBasis: 'produzido pelo projeto', privacyReview: 'synthetic-no-personal-data',
      technicalReview: 'approved', reviewedBy: 'revisor fixture', reviewedAt: '2026-08-09',
      reason: 'ativo de teste do ciclo',
    };
    // Duas entradas de ciclos ANTERIORES ja consumiriam o teto de 2 arquivos.
    const historico = [
      { ...comum, path: 'public/antiga-1.png', bytes: 4, sha256: sha256('antiga-1'), cycle: '2026-06' },
      { ...comum, path: 'public/antiga-2.png', bytes: 4, sha256: sha256('antiga-2'), cycle: '2026-07' },
    ];
    const doCiclo = { ...comum, path: 'public/nova.png', bytes: 4, sha256: sha256('nova'), cycle: '2026-08' };

    const todas = [...historico, doCiclo];
    const resultado = await validateMediaGovernance({
      root, policy, baseline, entries,
      ledger: {
        schemaVersion: 1,
        cycleSeals: historico.map((change) => createCycleSeal(todas, change.cycle)),
        changes: todas,
      },
    });
    // O historico nao consome o orcamento do ciclo em curso.
    expect(resultado.failures).not.toEqual(
      expect.arrayContaining([expect.stringContaining('limite de novos arquivos')]),
    );

    // Mas o teto continua valendo DENTRO do ciclo: tres no mesmo ciclo reprova.
    const noMesmoCiclo = [...historico.map((c) => ({ ...c, cycle: '2026-08' })), doCiclo];
    const estourado = await validateMediaGovernance({
      root, policy, baseline, entries,
      ledger: {
        schemaVersion: 1,
        changes: noMesmoCiclo,
      },
    });
    expect(estourado.ok).toBe(false);
    expect(estourado.failures).toEqual(expect.arrayContaining([
      expect.stringContaining('limite de novos arquivos no ciclo 2026-08: 3 de 2'),
    ]));
  });

  it('fecha ciclos fora do intervalo e preserva o teto em ciclos selados', async () => {
    const { root, baseline } = await fixture();
    const nomes = ['retro-1.png', 'retro-2.png', 'retro-3.png'];
    for (const nome of nomes) await writeFile(join(root, 'public', nome), nome);
    const policy = {
      ...basePolicy,
      firstGovernedCycle: '2026-08',
      currentCycle: '2026-09',
    };
    const entries = await buildInventory(root, policy);
    const actualByPath = new Map(entries.map((entry) => [entry.path, entry]));
    const changes = nomes.map((nome) => {
      const path = `public/${nome}`;
      const actual = actualByPath.get(path);
      return {
        action: 'add', path, bytes: actual.bytes, sha256: actual.sha256,
        sourceType: 'project-generated', sourceLocator: 'tools/generator.mjs',
        rightsBasis: 'produzido pelo projeto', privacyReview: 'synthetic-no-personal-data',
        technicalReview: 'approved', reviewedBy: 'revisor fixture',
        reviewedAt: '2026-08-31', reason: 'mudanca historica de teste', cycle: '2026-08',
      };
    });

    const resultado = await validateMediaGovernance({
      root, policy, baseline, entries,
      ledger: { schemaVersion: 1, changes },
    });

    expect(resultado.ok).toBe(false);
    expect(resultado.failures).toEqual(expect.arrayContaining([
      expect.stringContaining('ciclo historico 2026-08 sem selo'),
    ]));

    const dentroDoTeto = changes.slice(0, 2);
    const entriesDentroDoTeto = entries.filter((entry) => entry.path !== 'public/retro-3.png');
    const seal = createCycleSeal(dentroDoTeto, '2026-08');
    const encerrado = await validateMediaGovernance({
      root, policy, baseline, entries: entriesDentroDoTeto,
      ledger: { schemaVersion: 1, cycleSeals: [seal], changes: dentroDoTeto },
    });
    expect(encerrado.ok).toBe(true);

    const sealEstourado = createCycleSeal(changes, '2026-08');
    const estourado = await validateMediaGovernance({
      root, policy, baseline, entries,
      ledger: { schemaVersion: 1, cycleSeals: [sealEstourado], changes },
    });
    expect(estourado.failures).toContain(
      'ledger excede o limite de novos arquivos no ciclo 2026-08: 3 de 2',
    );

    const adulterado = await validateMediaGovernance({
      root, policy, baseline, entries: entriesDentroDoTeto,
      ledger: {
        schemaVersion: 1,
        cycleSeals: [{ ...seal, sha256: '0'.repeat(64) }],
        changes: dentroDoTeto,
      },
    });
    expect(adulterado.failures).toContain(
      'selo do ciclo historico 2026-08 diverge das mudancas aprovadas',
    );

    const future = [{ ...changes[0], cycle: '2099-01' }];
    const futuro = await validateMediaGovernance({
      root, policy, baseline, entries,
      ledger: {
        schemaVersion: 1,
        cycleSeals: [createCycleSeal(future, '2099-01')],
        changes: future,
      },
    });
    expect(futuro.failures).toEqual(expect.arrayContaining([
      expect.stringContaining('selo do ciclo 2099-01 fora do intervalo governado'),
      expect.stringContaining('ciclo 2099-01 fora do intervalo governado'),
    ]));
  });

  it('entrada sem ciclo declarado reprova, e politica sem ciclo tambem', async () => {
    // Se o campo fosse opcional, bastaria omiti-lo para a entrada nunca contar
    // em ciclo nenhum, e o teto voltaria a ser decorativo pelo outro lado.
    const { root, baseline } = await fixture();
    await writeFile(join(root, 'public', 'sem-ciclo.png'), 'ciclo');
    const entries = await buildInventory(root, basePolicy);
    const entrada = {
      action: 'add', path: 'public/sem-ciclo.png', bytes: 5, sha256: sha256('ciclo'),
      sourceType: 'project-generated', sourceLocator: 'tools/generator.mjs',
      rightsBasis: 'produzido pelo projeto', privacyReview: 'synthetic-no-personal-data',
      technicalReview: 'approved', reviewedBy: 'revisor fixture', reviewedAt: '2026-08-09',
      reason: 'ativo sem ciclo declarado',
    };
    const semCiclo = await validateMediaGovernance({
      root, policy: basePolicy, baseline, entries,
      ledger: { schemaVersion: 1, changes: [entrada] },
    });
    expect(semCiclo.failures).toContain('public/sem-ciclo.png: cycle ausente');

    for (const vazio of ['', '   ']) {
      const r = await validateMediaGovernance({
        root, policy: basePolicy, baseline, entries,
        ledger: { schemaVersion: 1, changes: [{ ...entrada, cycle: vazio }] },
      });
      expect(r.failures, JSON.stringify(vazio)).toContain('public/sem-ciclo.png: cycle ausente');
    }

    for (const invalido of ['2026-7', '2026-13', ' 2026-08 ']) {
      const r = await validateMediaGovernance({
        root, policy: basePolicy, baseline, entries,
        ledger: { schemaVersion: 1, changes: [{ ...entrada, cycle: invalido }] },
      });
      expect(r.failures, invalido).toContain(
        'public/sem-ciclo.png: cycle deve usar exatamente AAAA-MM',
      );
    }

    const { currentCycle, ...semCicloNaPolitica } = basePolicy;
    const politicaMuda = await validateMediaGovernance({
      root, policy: semCicloNaPolitica, baseline, entries,
      ledger: { schemaVersion: 1, changes: [{ ...entrada, cycle: '2026-08' }] },
    });
    expect(politicaMuda.failures).toContain(
      'politica sem currentCycle valido no formato AAAA-MM',
    );

    const { firstGovernedCycle, ...semPrimeiroCiclo } = basePolicy;
    const semInicio = await validateMediaGovernance({
      root, policy: semPrimeiroCiclo, baseline, entries,
      ledger: { schemaVersion: 1, changes: [{ ...entrada, cycle: '2026-08' }] },
    });
    expect(semInicio.failures).toContain(
      'politica sem firstGovernedCycle valido e anterior ou igual ao currentCycle',
    );
  });

  it('reprova entrada SEM justificativa, e nao so a justificativa curta', async () => {
    // A regra era `change.reason?.trim().length < 8`. Sem o campo, isso vira
    // `undefined < 8`, que em JavaScript e FALSE: a exigencia so alcancava quem
    // escreveu uma justificativa curta, e liberava quem nao escreveu nenhuma.
    // Ou seja, a unica forma de burlar era nao se dar ao trabalho.
    const { root, baseline } = await fixture();
    const payload = 'sem';
    await writeFile(join(root, 'public', 'sem-motivo.png'), payload);
    const entries = await buildInventory(root, basePolicy);
    const semJustificativa = {
      action: 'add', path: 'public/sem-motivo.png', bytes: Buffer.byteLength(payload),
      sha256: sha256(payload), sourceType: 'project-generated',
      sourceLocator: 'tools/generator.mjs', rightsBasis: 'produzido pelo projeto',
      privacyReview: 'synthetic-no-personal-data', technicalReview: 'approved',
      reviewedBy: 'revisor fixture', reviewedAt: '2026-08-09', cycle: '2026-08',
    };
    const semNada = await validateMediaGovernance({
      root, policy: basePolicy, baseline, entries,
      ledger: { schemaVersion: 1, changes: [semJustificativa] },
    });
    expect(semNada.ok).toBe(false);
    expect(semNada.failures).toContain('public/sem-motivo.png: justificativa insuficiente');

    // E o campo presente porem vazio, ou so espaco, tambem nao vale.
    for (const reason of ['', '   ', 'curta']) {
      const r = await validateMediaGovernance({
        root, policy: basePolicy, baseline, entries,
        ledger: { schemaVersion: 1, changes: [{ ...semJustificativa, reason }] },
      });
      expect(r.failures, JSON.stringify(reason)).toContain(
        'public/sem-motivo.png: justificativa insuficiente',
      );
    }
  });
});
