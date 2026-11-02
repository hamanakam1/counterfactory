import { quint, modelFiles, writeJson, hashes, checkSavedExample } from './lib.mjs';
import { rmSync } from 'node:fs';
import { root } from './lib.mjs';

rmSync(`${root}build/verification.json`, { force: true });
checkSavedExample();
const backendArgs = ['--backend=tlc', '--apalache-version=0.62.4'];
const safe = quint(['verify', modelFiles[2], ...backendArgs,
  '--invariant=safety,stateValid,completionSound', '--temporal=recovery'], { name: 'tlc-safe' });
if (!safe.includes('Model checking completed. No error has been found.') ||
  !safe.includes('0 states left on queue')) throw new Error('Missing complete TLC exploration result');
console.log(safe.split('\n').filter(line => /distinct states found|depth of the complete|No error/.test(line)).join('\n'));
quint(['verify', modelFiles[1], ...backendArgs, '--invariant=safety'],
  { name: 'tlc-unsafe', violation: true });
console.log('PASS: TLC found the expected unsafe invariant counterexample.');
quint(['verify', modelFiles[2], ...backendArgs, '--temporal=unconditionalRecovery'],
  { name: 'tlc-unfair', temporalViolation: true });
console.log('PASS: TLC rejected unconditional recovery; the fairness assumption is necessary.');
writeJson('build/verification.json', {
  format: 'counterfactory.verification.v1',
  quint: '0.33.1', backend: 'TLC',
  translation: { tool: 'Apalache', requestedDistribution: '0.62.4', serverVersionVerified: false,
    note: 'Quint can reuse an existing local translation server without attesting its version.' },
  scope: 'Complete finite state graph: two workers, one stable action ID, one submission per worker.',
  safe: 'safety, stateValid, completionSound, fair recovery: pass',
  unsafe: 'safety violation: expected', unfair: 'unconditional recovery violation: expected',
  sha256: hashes(),
});
console.log('Logs and machine-readable receipt: build/');
