#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  buildInventory,
  createBaseline,
  createCycleSeal,
  stableJson,
  validateMediaGovernance,
} from './media-governance-lib.mjs';

const root = resolve(import.meta.dirname, '..');
const policyPath = resolve(root, 'tools/media-governance-policy.json');
const policy = JSON.parse(await readFile(policyPath, 'utf8'));
const baselinePath = resolve(root, policy.baselinePath);
const ledgerPath = resolve(root, policy.changeLedgerPath);
const initialize = process.argv.includes('--initialize-baseline');
const reportFlag = process.argv.indexOf('--report');
const sealFlag = process.argv.indexOf('--propose-cycle-seal');
const inventory = await buildInventory(root, policy);

if (initialize) {
  try {
    await readFile(baselinePath);
    console.error('FALHA o baseline ja existe e e imutavel; inicializacao recusada');
    process.exit(1);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const baseline = createBaseline(inventory, policy, '2026-08-09');
  await writeFile(baselinePath, stableJson(baseline), { flag: 'wx' });
  console.log(`Baseline criado: ${baseline.summary.files} arquivos, ${baseline.summary.bytes} bytes, SHA-256 ${baseline.summary.sha256}.`);
  process.exit(0);
}

const [baseline, ledger] = await Promise.all([
  readFile(baselinePath, 'utf8').then(JSON.parse),
  readFile(ledgerPath, 'utf8').then(JSON.parse),
]);

if (sealFlag >= 0) {
  const cycle = process.argv[sealFlag + 1];
  if (!cycle) throw new Error('--propose-cycle-seal exige um ciclo AAAA-MM');
  console.log(stableJson(createCycleSeal(ledger.changes || [], cycle)).trimEnd());
  process.exit(0);
}

const result = await validateMediaGovernance({ root, policy, baseline, ledger, entries: inventory });

if (reportFlag >= 0) {
  const output = process.argv[reportFlag + 1];
  if (!output) throw new Error('--report exige um caminho de saida');
  await writeFile(resolve(root, output), stableJson({ schemaVersion: 1, ...result, entries: inventory }));
}

if (!result.ok) {
  for (const failure of result.failures) console.error(`FALHA ${failure}`);
  console.error(`\n${result.failures.length} problema(s) na governanca do acervo.`);
  process.exit(1);
}

console.log(
  `OK: ${result.summary.files} ativos, ${result.summary.bytes} bytes, `
  + `SHA-256 ${result.summary.sha256}; sem duplicatas; ${result.changes} mudanca(s) aprovada(s).`,
);
