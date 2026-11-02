# Releasing

Only a maintainer with publication authority should push tags or publish releases.

1. Update version, changelog, model scope, and result counts when needed.
2. Run `npm ci --ignore-scripts`, `npm test`, `npm run verify`, and `npm audit`.
3. Review the full source, commit exact owned paths, and push the branch.
4. Require a successful verification run for the exact source commit. A queued, failed, or unexplained workflow run is not CI verification.
5. Create an annotated `v<version>` tag pointing to that commit. Run `npm run release:package` with a clean source tree; it validates the tag and model hashes and writes source, verification receipt, and `SHA256SUMS` under `dist/`.
6. Publish a GitHub prerelease for research-preview versions and upload those three assets.
7. Read back the remote branch, peeled tag, release target, workflow result, and asset list. Download the published assets into a new directory and verify SHA-256 hashes. Extract the source archive, install its lockfile, and run its tests and full verification.

The release receipt binds the model evidence to a source commit. It does not provide an authenticated third-party attestation or an implementation correctness guarantee. Generated release files remain outside git under `dist/`.
