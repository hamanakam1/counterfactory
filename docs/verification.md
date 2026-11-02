# Verification and evidence

## Commands

| Command | What it establishes |
| --- | --- |
| `npm run demo` | Saved nine-state trace has a violation and matches recorded model/trace hashes |
| `npm test` | Typechecking, nine deterministic Quint runs, trace-tool tests, freshly reproduced example, and 1,000 seeded safe simulations of up to 30 steps |
| `npm run verify` | TLC explores the complete finite corrected model and finds both required negative controls |
| `npm run example` | Explicitly regenerates the saved example and its hash manifest after an intentional model change |

Use Node >=22 and install the lockfile with `npm ci --ignore-scripts`. Only full verification needs Java; Java 21 is used for the launch and CI. The Java-free checks explicitly select Quint's TypeScript evaluator, avoiding an implicit native runtime download.

The TLC invocation requests Apalache 0.62.4 for translation. Quint may reuse an existing server on port 8822 without verifying its version, or download and start the requested distribution if none is available. The receipt records the requested distribution separately from the unverified server version. Run this tooling in a trusted local development environment. Apalache's bundled protobuf code can emit an upstream generated-code security warning; Counterfactory does not suppress it or expose that server as a public service. Npm audit covers the npm dependency graph, not all bundled JVM dependencies.

## Layers of evidence

The saved example uses `lostAckStep`, a deterministic selection of existing protocol actions. It is a concrete counterexample, not an exhaustive exploration. The manifest binds all three model files, the dependency lockfile, and the raw ITF trace. Hashes establish content consistency; they are not authenticated attestations.

`npm test` re-executes that schedule and compares its states to the saved trace, ignoring only ITF generation metadata. The other deterministic runs exercise a late first request, normal completion, recovery, and forbidden transitions. The random simulation is seeded and bounded; it is supplementary evidence.

`npm run verify` uses the unrestricted `step`, with TLC rather than simulation. It requires completion of the finite state graph for the corrected model, expected unsafe invariant failure, and expected temporal failure without fairness. Expected failures need exit code 1 and the specific diagnostic. Tool crashes, signals, and unrelated failures remain failures.

Logs and `verification.json` are written under ignored `build/`. Each verification attempt removes any previous success receipt before starting. The receipt records model and trace hashes; it is a local tool receipt, not an independent signature or a proof of implementation conformance. CI uploads its own evidence for the exact tested revision.

## Mapping a model to real code

Before claiming that an implementation conforms, identify:

1. The actual stable logical action ID and how it survives worker takeover.
2. The service boundary that atomically commits the effect and deduplication record.
3. The record retention policy and behavior after expiration.
4. The difference between a negative lookup and an unavailable or eventually consistent lookup.
5. How a request already in flight behaves after lease expiry or cancellation.
6. Which implementation events correspond to model transitions.

Replay generated schedules against a disposable implementation, inject lost responses, and compare observed state. Version 0.1 contains no such production adapter. See [Quint's model-based testing guide](https://quint.sh/docs/model-based-testing) for the upstream approach.
