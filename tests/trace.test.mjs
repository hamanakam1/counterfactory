import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { validateCounterexample, assertExpectedViolation, assertProvenance } from '../scripts/trace.mjs';

const fixture = () => JSON.parse(readFileSync(new URL('../examples/lost-ack/counterexample.itf.json', import.meta.url)));

test('accepts a real Quint trace demonstrating a lost acknowledgement and two effects', () => {
  const states = validateCounterexample(fixture());
  assert.equal(states.length, 9);
  assert.equal(states.at(-1).effects, 2);
  assert.equal(states[4].event, 'lose ack A');
});

test('rejects an absent trace, an empty trace, or a nonviolation', () => {
  for (const bad of [null, {}, { states: [] }]) assert.throws(() => validateCounterexample(bad));
  const trace = fixture();
  trace['#meta'].status = 'ok';
  assert.throws(() => validateCounterexample(trace), /violation/);
});

test('does not confuse runtime failure or timeout with an invariant counterexample', () => {
  assert.throws(() => assertExpectedViolation({ status: 1, stdout: '', stderr: 'parsing failed' }), /expected/);
  assert.throws(() => assertExpectedViolation({ status: null, signal: 'SIGTERM', stdout: 'Invariant violated' }), /expected/);
  assert.throws(() => assertExpectedViolation({ status: 0, stdout: 'Invariant violated' }), /expected/);
  assert.doesNotThrow(() => assertExpectedViolation({ status: 1, stdout: '[violation]', stderr: 'Invariant violated' }));
});

test('rejects forged effect counts and unsafe number conversions', () => {
  const trace = fixture();
  const key = trace.vars[0];
  trace.states.at(-1)[key].effects = { '#bigint': '9007199254740993' };
  assert.throws(() => validateCounterexample(trace));
});

test('recognizes TLC invariant and temporal diagnostics without mixing the two', () => {
  const invariant = { status: 1, stdout: '[violation]\nError: Invariant q_inv is violated.' };
  const temporal = { status: 1, stdout: '[violation]\nError: Temporal property q_temporalProps was violated.' };
  assert.doesNotThrow(() => assertExpectedViolation(invariant));
  assert.doesNotThrow(() => assertExpectedViolation(temporal, 'temporal'));
  assert.throws(() => assertExpectedViolation(temporal));
  assert.throws(() => assertExpectedViolation(invariant, 'temporal'));
});

test('requires the complete lost acknowledgement schedule, not just an arbitrary two', () => {
  const trace = fixture();
  trace.states[4][trace.vars[0]].event = 'acknowledge A';
  assert.throws(() => validateCounterexample(trace), /schedule/);
});

test('binds saved evidence to every model and the trace itself', () => {
  assert.doesNotThrow(() => assertProvenance({ 'model.qnt': 'abc', 'trace.json': 'def' }, { 'model.qnt': 'abc', 'trace.json': 'def' }));
  assert.throws(() => assertProvenance({ 'model.qnt': 'old' }, { 'model.qnt': 'new' }), /mismatch/);
  assert.throws(() => assertProvenance({}, { 'model.qnt': 'new' }), /mismatch/);
});

test('reads evidence inside a checkout whose path contains spaces and URL-significant characters', async () => {
  const checkout = mkdtempSync(join(tmpdir(), 'counterfactory # % '));
  const source = fileURLToPath(new URL('../', import.meta.url));
  try {
    for (const path of ['scripts', 'models', 'examples', 'package-lock.json']) {
      cpSync(join(source, path), join(checkout, path), { recursive: true });
    }
    const { checkSavedExample } = await import(pathToFileURL(join(checkout, 'scripts/lib.mjs')));
    assert.equal(checkSavedExample().at(-1).effects, 2);
  } finally {
    rmSync(checkout, { recursive: true, force: true });
  }
});
