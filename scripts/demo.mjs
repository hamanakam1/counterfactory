import { checkSavedExample } from './lib.mjs';

const states = checkSavedExample();
console.log('\nCOUNTERFACTORY / LOST ACKNOWLEDGEMENT\n');
console.log('One action. Two workers. A vanished response.\n');
console.log('step  event                external effects  recorded complete');
for (const [i, s] of states.entries()) {
  console.log(`${String(i).padEnd(6)}${s.event.padEnd(21)}${String(s.effects).padEnd(18)}${s.knownDone}`);
}
console.log('\nVIOLATION: one logical action produced two external effects.');
console.log('Source: a saved Quint execution, checked against current model hashes.');
console.log('Run npm test to reproduce it; npm run verify checks the full finite model.\n');
