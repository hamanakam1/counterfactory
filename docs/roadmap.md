# Roadmap

## v0.1: lost acknowledgement

Two workers, one logical action, asynchronous service requests, lost replies, lease expiry, atomic service deduplication, and fair reconciliation. Broken and corrected instances, counterexample, deterministic regressions, finite checks, and CI.

## Next candidates

- Stale approval after a code or policy revision changes.
- Lease loss with an unfenced worker still able to commit effects.
- Two schedulers admitting the same work from stale observations.

These are candidate contributions, not implemented capabilities or scheduled promises. Start with one compact model and one useful counterexample.

## Later

Implementation trace validation, disposable service adapters, model-based conformance tests, and additional workers or action identities. A public trace explorer is useful only when it presents generated evidence faithfully. Do not make a dashboard a prerequisite for running a model.
