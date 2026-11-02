import { quint, exampleArgs, readJson, writeJson, hashes, tracePath } from './lib.mjs';
import { validateCounterexample } from './trace.mjs';

quint([...exampleArgs, `--out-itf=${tracePath}`], { name: 'generate-example', violation: true });
validateCounterexample(readJson(tracePath));
writeJson('examples/lost-ack/provenance.json', {
  format: 'counterfactory.example.v1',
  quint: '0.33.1',
  command: ['quint', ...exampleArgs, `--out-itf=${tracePath}`],
  scope: 'Selected schedule of real model actions; not an exhaustive search.',
  sha256: hashes(),
});
console.log(`Generated ${tracePath} and its content-hash provenance.`);
