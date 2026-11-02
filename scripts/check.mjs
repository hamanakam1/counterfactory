import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { quint, modelFiles, root, exampleArgs, checkSavedExample, readJson } from './lib.mjs';
import { validateCounterexample } from './trace.mjs';

for (const model of modelFiles.slice(1)) {
  quint(['typecheck', model]);
  const output = quint(['test', model, '--backend=typescript', '--seed=15728'],
    { name: model.includes('unsafe') ? 'unsafe-tests' : 'safe-tests' });
  console.log(output.trim());
}
const saved = checkSavedExample();
quint([...exampleArgs, '--out-itf=build/reproduced.itf.json'], { name: 'reproduced', violation: true });
assert.deepEqual(validateCounterexample(readJson('build/reproduced.itf.json')), saved,
  'fresh model execution differs from the saved example');
const tests = spawnSync(process.execPath, ['--test', 'tests/trace.test.mjs'], { cwd: root, stdio: 'inherit' });
if (tests.status !== 0) throw new Error('Trace regression tests failed');
quint(['run', modelFiles[2], '--backend=typescript', '--seed=15728', '--max-samples=1000',
  '--max-steps=30', '--invariant=safety and stateValid and completionSound', '--verbosity=1'],
  { name: 'safe-simulation' });
console.log('PASS: saved trace reproduced; 1,000 seeded safe simulations completed (30 steps maximum each).');
