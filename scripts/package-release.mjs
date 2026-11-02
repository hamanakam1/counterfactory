import { spawnSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { root, readJson, writeJson, hashes, checkSavedExample } from './lib.mjs';
import { assertProvenance } from './trace.mjs';

function git(args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
const version = readJson('package.json').version;
assert.match(version, /^\d+\.\d+\.\d+$/);
assert.equal(git(['status', '--porcelain']), '', 'release requires a clean tracked source tree');
const commit = git(['rev-parse', 'HEAD']);
assert.equal(git(['cat-file', '-t', `v${version}`]), 'tag', 'release requires an annotated tag');
assert.equal(git(['rev-parse', `v${version}^{commit}`]), commit, 'tag must point to HEAD');
checkSavedExample();
const receipt = readJson('build/verification.json');
assertProvenance(receipt.sha256, hashes());
mkdirSync(`${root}dist`, { recursive: true });
const source = `counterfactory-${version}.tar.gz`;
const evidence = `counterfactory-${version}-verification.json`;
git(['archive', '--format=tar.gz', `--prefix=counterfactory-${version}/`, `--output=dist/${source}`, commit]);
writeJson(`dist/${evidence}`, { ...receipt, sourceCommit: commit, tag: `v${version}`,
  sourceArchive: source, releaseScope: 'Research preview; model verification only.' });
const sums = [source, evidence].map(name =>
  `${createHash('sha256').update(readFileSync(`${root}dist/${name}`)).digest('hex')}  ${name}`);
writeFileSync(`${root}dist/SHA256SUMS`, `${sums.join('\n')}\n`);
console.log(`Packaged v${version} at ${commit}\n${sums.join('\n')}`);
