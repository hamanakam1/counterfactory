import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { assertExpectedViolation, assertProvenance, validateCounterexample } from './trace.mjs';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const modelFiles = ['models/protocol.qnt', 'models/lost_ack_unsafe.qnt', 'models/lost_ack_safe.qnt'];
export const tracePath = 'examples/lost-ack/counterexample.itf.json';
export const exampleArgs = ['run', modelFiles[1], '--backend=typescript', '--step=lostAckStep',
  '--seed=15728', '--max-steps=8', '--invariant=safety', '--verbosity=1'];

export function readJson(path) { return JSON.parse(readFileSync(join(root, path))); }
export function writeJson(path, data) { writeFileSync(`${root}${path}`, `${JSON.stringify(data, null, 2)}\n`); }
export function hashes() {
  return Object.fromEntries([...modelFiles, 'package-lock.json', tracePath].map(path =>
    [path, createHash('sha256').update(readFileSync(`${root}${path}`)).digest('hex')]));
}
export function checkSavedExample() {
  const provenance = readJson('examples/lost-ack/provenance.json');
  assertProvenance(provenance.sha256, hashes());
  return validateCounterexample(readJson(tracePath));
}

export function quint(args, { name, violation = false, temporalViolation = false } = {}) {
  mkdirSync(`${root}build`, { recursive: true });
  const result = spawnSync(process.execPath,
    [`${root}node_modules/@informalsystems/quint/dist/src/cli.js`, ...args],
    { cwd: root, encoding: 'utf8', timeout: 120_000, maxBuffer: 8 * 1024 * 1024 });
  const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  if (name) writeFileSync(`${root}build/${name}.log`, output);
  if (violation) assertExpectedViolation(result);
  else if (temporalViolation) assertExpectedViolation(result, 'temporal');
  else if (result.status !== 0 || result.error || result.signal) {
    throw new Error(`Quint failed (${result.status ?? result.signal ?? result.error}).\n${output}`);
  }
  return output;
}
