# Counterfactory Implementation Plan

> **For agentic workers:** Execute tasks inline with superpowers:executing-plans; request one whole-branch review before publication.

**Goal:** Launch Counterfactory v0.1 with an executable lost acknowledgement failure and checked correction.

**Architecture:** A shared finite Quint protocol is instantiated in unsafe and safe modules. Node scripts invoke the pinned CLI and validate generated traces; TLC exhaustively checks the finite abstraction and a recovery property under explicit fairness.

**Tech Stack:** Quint 0.33.1, Node >=22, Java >=17, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-02-counterfactory-design.md`

## Global Constraints
- Two workers, one stable logical action, at most one request per worker.
- No production adapters, private fixtures, paid resources, or hosted inference.
- Separate simulations, deterministic tests, exhaustive finite checks, and implementation claims.
- Stage exact owned paths only; retain release checksums and readback evidence.

## Review Focus
- A delayed first request arriving after takeover must still be deduplicated.
- A checker crash must never count as the expected unsafe counterexample.
- Recovery requires fair reconciliation and must not be advertised as unconditional liveness.
- Never executing must not satisfy the deterministic execution witnesses.
- The saved trace must come from the pinned CLI and match current model content hashes.

### Task 1: Models and behavioral witnesses
**Files:** `models/protocol.qnt`, `models/lost_ack_unsafe.qnt`, `models/lost_ack_safe.qnt`.
**Interfaces:** both modules expose `init`, `step`, `safety`, `stateValid`, `completionSound`, `recovery` and named runs ending in `Test`.
- [x] Write the unsafe schedule and assert duplicate effects; run it.
- [x] Apply the same schedule to the safe instance and observe the duplicate assertion fail.
- [x] Assert safety in the corrected schedule; add late-request, acknowledgement, takeover, and reconciliation witnesses.
- [x] Run typechecking and all deterministic tests.

### Task 2: Reproducible checking and trace tooling
**Files:** `scripts/*.mjs`, `tests/*.test.mjs`, `examples/lost-ack/*`.
**Interfaces:** `npm test` runs deterministic and seeded simulation checks; `npm run verify` requires TLC safety/recovery checks and a real unsafe violation; `npm run demo` reads the generated trace.
- [x] Test trace validation against malformed data, nonviolations, provenance mismatch, and valid counterexample.
- [x] Implement fail-closed CLI handling and trace extraction; generate the saved counterexample.
- [x] Verify safe invariants and temporal recovery with TLC; require an unsafe counterexample rather than an arbitrary nonzero exit.

### Task 3: Public launch
**Files:** `README.md`, `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `docs/*`, `.github/workflows/verify.yml`.
- [x] Document assumptions, quickstart, results, contribution requirements, and roadmap.
- [x] Complete whole-branch review and address material findings.
- [ ] Publish the public repository and read back exact branch/CI state.
- [ ] Tag and publish v0.1.0 with source/evidence archive and checksums; download and verify assets and tag revision.
