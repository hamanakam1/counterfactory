<div align="center">

# Counterfactory

**Find the interleaving that breaks the promise.**

Executable failure models for agent workflows · Written in [Quint](https://quint.sh)

[![Verification](https://github.com/hamanakam1/counterfactory/actions/workflows/verify.yml/badge.svg)](https://github.com/hamanakam1/counterfactory/actions/workflows/verify.yml)
[![Apache 2.0](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

[Run the demo](#three-minutes-to-a-counterexample) · [Read the model](models/protocol.qnt) · [Understand the assumptions](docs/model-guide.md) · [Contribute a failure](CONTRIBUTING.md)

</div>

An agent submits an operation. The service completes it. The response disappears.
The lease expires, another worker takes over, and the same logical action happens twice.

Every component can look healthy. The ordering is the bug.

Counterfactory makes these interactions small enough to inspect and executable enough to challenge. Each scenario pairs a deliberately unsafe design with a corrected design, a real counterexample, and explicit assumptions. Version 0.1 starts with **lost acknowledgements and duplicate execution**.

## Three minutes to a counterexample

Requires **Node.js 22 or later**. The saved demo needs no Java, credentials, model API, or external service.

```sh
git clone https://github.com/hamanakam1/counterfactory.git
cd counterfactory
npm ci --ignore-scripts
npm run demo
npm test
```

The demo reads an actual Quint trace and verifies its content hashes against the models in your checkout. `npm test` executes the models again and compares the fresh trace to that saved example.

```text
step  event                external effects  recorded complete
0     init                 0                 false
1     acquire A            0                 false
2     submit A             0                 false
3     commit A             1                 false
4     lose ack A           1                 false
5     expire lease         1                 false
6     acquire B            1                 false
7     submit B             1                 false
8     commit B             2                 false

VIOLATION: one logical action produced two external effects.
```

This is a **selected, reproducible schedule**. Full model checking explores the other schedules too.

## The correction has two responsibilities

**Prevent another effect.** Every request carries the same logical action identity. The service atomically deduplicates that identity together with committing the effect. This must still work when worker A's request arrives after worker B has completed.

**Recover knowledge.** A durable lookup by that identity lets a worker record the result after an acknowledgement disappears. Reconciliation alone cannot prevent a duplicate while another request is still in flight.

The [unsafe](models/lost_ack_unsafe.qnt) and [corrected](models/lost_ack_safe.qnt) modules instantiate the same protocol. One parameter changes the service's deduplication behavior. Leases, dropped replies, asynchronous requests, and takeover remain the same.

```quint
val safety = s.effects <= 1
val completionSound = s.knownDone implies s.effects > 0

temporal recovery = weakFair(reconcile, s) implies
  always((s.effects > 0) implies eventually(s.knownDone))
```

## Check the whole finite model

Install **Java 21** and ensure `java` is on `PATH`, then:

```sh
npm run verify
```

Quint uses Apalache to translate the model, then invokes TLC. If no local translator is running, it downloads the requested Apalache 0.62.4 distribution on first use. An existing local translation server can be reused without its version being attested. This is local verification; the first download requires network access.

| Check | Required result |
| --- | --- |
| Unsafe model, unrestricted schedules | TLC finds a safety violation |
| Corrected model, unrestricted schedules | Safety, state validity, and completion evidence hold |
| Corrected model, fair reconciliation | A committed effect is eventually recorded |
| Corrected model, no fairness guarantee | TLC finds a temporal counterexample |
| Named regression runs | Execution, lost reply, late request, takeover, and recovery are exercised |

The corrected v0.1 model has **189 reachable states** and a search depth of **12**. Checks cover two workers, one stable logical action, and at most one submission per worker. The [verification guide](docs/verification.md) separates deterministic runs, random simulation, finite model checking, and implementation conformance.

**A passing model does not establish that your service supplies atomic deduplication, that its keys never expire, or that your implementation matches the model.** Those are separate obligations. Counterfactory is a research preview; it is not a production authorization gate or a runtime safety guarantee.

## What ships

```text
models/protocol.qnt           Shared finite transition system
models/lost_ack_unsafe.qnt    Broken design and duplicate-effect witnesses
models/lost_ack_safe.qnt      Corrected design and recovery witnesses
examples/lost-ack/            Real ITF trace and SHA-256 provenance
scripts/                     Small Node wrappers around the pinned Quint CLI
docs/                        Assumptions, verification, and implementation mapping
```

`npm test` runs nine Quint regression tests, the trace-tool tests, fresh trace reproduction, and 1,000 seeded simulations of the corrected model. `npm run verify` runs the exhaustive finite checks and both negative controls. A checker crash, timeout, or parse error cannot satisfy an expected-failure check.

## Where this goes next

The next useful contributions are small models with recognizable failures: approval becoming stale after a revision changes, a worker continuing after lease loss, or two schedulers admitting the same work. Each needs a broken design, a correction, a counterexample, declared bounds, and documented assumptions.

Implementation adapters and model-based testing come after the models. See the [roadmap](docs/roadmap.md) and [contribution guide](CONTRIBUTING.md). You can use every scenario without adopting a particular agent framework or orchestration platform.

## Project

Created by [Michael Hamanaka](https://github.com/hamanakam1). Released under [Apache-2.0](LICENSE).

Quint, Apalache, and TLC are independent upstream projects. Counterfactory's models and evidence are synthetic and make no claims about a particular provider or production system.
