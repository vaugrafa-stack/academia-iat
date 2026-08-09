import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  buildInventory,
  createBaseline,
  sha256,
  validateMediaGovernance,
} from './media-governance-lib.mjs';

const basePolicy = {
  scanRoot: 'public',
  managedExtensions: ['.png'],
  managedSuffixes: [],
  managedTextRules: [],
  maxBytesByExtension: { '.png': 16 },
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
      }],
    };
    const result = await validateMediaGovernance({ root, policy: basePolicy, baseline, ledger, entries });
    expect(result.ok).toBe(false);
    expect(result.failures).toContain('public/large.png: 17 bytes excedem o limite de 16');
  });
});
